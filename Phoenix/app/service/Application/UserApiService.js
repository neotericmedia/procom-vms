/*global Phoenix: false, console: false*/
(function (services) {
    'use strict';

    services.factory('UserApiService', ['$rootScope', '$q', '$resource', 'NavigationService', '$timeout', 'debounce', 'phoenixauth', function ($rootScope, $q, $resource, NavigationService, $timeout, debounce, phoenixauth) {


        if (!$rootScope.UserContext) $rootScope.UserContext = {};

        // var getContext = debounce(function() {
        //     phoenixauth.loadContext().then(function(response) {
        //         //$rootScope.UserContext = response;
        //
        //         init();
        //
        //     });
        // }, 1000, true);

        var webApi = $resource("/api/AppUser/:action/:id", { id: '@id', action: '@action' },
            {
                // standard methods
                get: { method: 'GET', params: { id: '@id' }, isArray: false },
                getDefaults: { method: 'GET', params: { action: 'Create' }, isArray: false },
                save: { method: 'POST', params: { action: 'Save' }, isArray: false, data: '@data' },
                deleteEntity: { method: 'DELETE', params: { action: 'Delete' }, isArray: false, data: '@data' },

                // custom methods
                getContext: { method: 'GET', params: { action: 'GetUserContext' } }
            });


        function UserApiService() {
            // getContext();
        }

        function init() {
            NavigationService.init();
        }


        function doesUserHaveAccessToOperation(service, method) {
            var deferred = $q.defer();

            phoenixauth
                .getCurrentProfile()
                .then(function (profile) {
                    var result = _.find(profile.SecurityItems, function (item) {
                        return (item.ServiceName == service && item.MethodName == method);
                    });
                    if (result != []._) {
                        deferred.resolve(true);
                    } else {
                        deferred.resolve(false);
                    }
                });

            return deferred.promise;
        }

        UserApiService.prototype =
        {
            webApi: webApi,
            //getContext: getContext,
            doesUserHaveAccessToOperation: doesUserHaveAccessToOperation

        };

        return new UserApiService();
    }]);
}(Phoenix.Services));