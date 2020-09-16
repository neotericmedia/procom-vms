/// <reference path="../../libs/angular/angular.js" />

/*
 * $http interceptor.
 * Handle: Responses with 
        Code: 400 - Validation errors
        Code: 500 - Server side exception
 */


(function (app, $) {
    'use strict';
    var controllerId = 'interceptor';
    app.config(['$httpProvider', function ($httpProvider) {
        var interceptor = ['$rootScope', '$q', 'common', function (scope, $q, common) {

            common.setControllerName(controllerId);

            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status,
                    config = response.config,
                    interceptorOptions = config ? config.interceptorOptions : null,
                    skipErrorIntercept = interceptorOptions ? interceptorOptions.skipErrorIntercept : false;

                if (skipErrorIntercept) {
                    //return response;
                    return $q.reject(response);
                }
                else if (status == 400) {
                    // Handle validation errors collection
                    console.log("intercepting 400");
                    console.log(response);
                    console.log(response.data.ErrorList);

                    scope.$broadcast("event:brokenRules", response.data.BrokenRules);

                    //return response;
                    return $q.reject(response);

                }
                else if (status == 500) {
                    // Handle server errors collection
                    if (response.data && response.data.ExceptionMessage !== undefined) {
                        common.logError(response.data.ExceptionMessage, true);
                    }
                    else if (response.data.Message !== undefined) {
                        //logError(response.data.Message, true);
                        // TODO: put localized message
                        var message = response.data.Message.indexOf('Security Exception') === 0
                            ? response.data.Message
                            : 'Server Error';
                        common.logError(message, true);
                    }
                    else if (response.data.ErrorList !== undefined) {
                        angular.forEach(response.data.ErrorList, function (err) {
                            common.logError(err, true);
                        });
                    }
                    return $q.reject(response);
                }
                else if (status == 403) // forbidden
                {

                    scope.$broadcast("event:forbidden", { Message: response.data.Message, ErrorList: response.Data.ErrorList });
                    common.logError(response.data.Message, true);
                    return $q.reject(response);
                }
                // otherwise
                return $q.reject(response);
            }

            return {
                response: success,
                responseError: error
            };
        }];
        $httpProvider.interceptors.push(interceptor);
    }]);
})(Phoenix.App, jQuery);
