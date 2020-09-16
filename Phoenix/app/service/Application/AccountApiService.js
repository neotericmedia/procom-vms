/*global Phoenix: false, console: false*/
(function (services) {
    'use strict';

    var serviceId = 'AccountApiService';
    services.factory(serviceId, ['$http', '$rootScope', '$q', 'authService', 'common', 'config', 'Restangular', AccountApiService]);

    function AccountApiService($http, $rootScope, $q, authService, common, config, Restangular) {
        var service = {
            changePassword: changePassword,
            switchProfile: switchProfile
        };

        return service;

        function changePassword(model) {
            return $http.post('/account/manage', model);
            //var profileId = $cookies.get('phoenixCookie') || -1;

            //return $http({
            //    method: 'POST',
            //    url: '/home/proxy/api/account/changepassword',
            //    data: model,
            //    headers: {
            //        'PhoenixValues': profileId,
            //        'Cache-Control': 'no-cache, no-store, must-revalidate',
            //        'Pragma': 'no-cache',
            //        'Expires': '0'
            //    }
            //});

            //return $http.post('/api/api/account/changepassword', model);
            //return Restangular.one('Account').post('Manage', model);
        }

        function switchProfile(model) {
            return Restangular.one('Account').post('SwitchProfile', model);
        }



        //AccountApiService.prototype.changePassword = function (request) {
        //    $http.post("/Account/Manage", request).success(function (data) {

        //    });
        //};

        AccountApiService.prototype.login = function (user) {
            var result = $q.defer();

            $http.post("/one('timesheet')/JsonLogin", user).success(function (data) {
                if (angular.isDefined(data)) {
                    result.resolve(data);

                    if (data.IsLoggedIn) {
                        authService.loginConfirmed(data);
                    }
                }
                return data;
            }).error(function (data) {
                if (angular.isDefined(data.ErrorList)) {
                    return result.resolve(data);
                } else {
                    result.reject(data);
                }
            });
            return result.promise;
        };

        AccountApiService.prototype.logoff = function (user) {
            var result = $q.defer();
            $http.post("/Account/JsonLogOff", user).success(function (data) {
                return result.resolve(data);
            });
            return result.promise;
        };

        AccountApiService.prototype.IsLoggedIn = function () {
            var result = $q.defer();
            $http.get("/api/AccountAPI/IsLoggedIn").success(function (data) {
                result.resolve(data);

                if (data.IsLoggedIn === false) {
                } else {
                    authService.loginConfirmed(data);
                }
                return data;
            });
            return result.promise;
        };

        return new AccountApiService();
    }

    /// Auth service & interceptors
    /// https://github.com/witoldsz/angular-http-auth/tree/master/src
    /// http://www.espeo.pl/2012/02/26/authentication-in-angularjs-application

    /**
   * @license HTTP Auth Interceptor Module for AngularJS
   * (c) 2012 Witold Szczerba
   * License: MIT
   */
    services.provider('authService', function () {
        /**
         * Holds all the requests which failed due to 401 response,
         * so they can be re-requested in future, once login is completed.
         */
        var buffer = [];

        /**
         * Required by HTTP interceptor.
         * Function is attached to provider to be invisible for regular users of this service.
         */
        this.pushToBuffer = function (config, deferred) {
            buffer.push({
                config: config,
                deferred: deferred
            });
        };

        this.$get = ['$rootScope', '$injector', function ($rootScope, $injector) {
            var $http; //initialized later because of circular dependency problem

            function retry(config, deferred) {
                $http = $http || $injector.get('$http');
                $http(config).then(function (response) {
                    deferred.resolve(response);
                });
            }

            function retryAll() {
                for (var i = 0; i < buffer.length; ++i) {
                    retry(buffer[i].config, buffer[i].deferred);
                }
                buffer = [];
            }

            return {
                loginConfirmed: function (data) {
                    $rootScope.$broadcast('event:auth-loginConfirmed', data);
                    retryAll();
                }
            };
        }];
    })

        /**
       * $http interceptor.
       * On 401 response - it stores the request and broadcasts 'event:angular-auth-loginRequired'.
       */
        // .config(['$httpProvider', 'authServiceProvider', function ($httpProvider, authServiceProvider) {
        //     var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
        //         function success(response) {
        //             return response;
        //         }

        //         function error(response) {
        //             if (response.status === 401) {
        //                 var deferred = $q.defer();
        //                 authServiceProvider.pushToBuffer(response.config, deferred);
        //                 $rootScope.$broadcast('event:auth-loginRequired');
        //                 return deferred.promise;
        //             }
        //             // otherwise
        //             return $q.reject(response);
        //         }

        //         return {
        //             response: success,
        //             responseError: error
        //         };
        //     }];
        //     $httpProvider.interceptors.push(interceptor);
        // }])
        ;
}(Phoenix.Services));