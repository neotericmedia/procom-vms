(function (services) {
    'use strict';

    services.factory('BreadCrumbService',
        ['$rootScope', '$location', function ($rootScope, $location) {

            var breadcrumbs = [];
            var breadcrumbsService = {};

            //we want to update breadcrumbs only when a route is actually changed
            //as $location.path() will get updated imediatelly (even if route change fails!)
            var routeChangeSuccessHandler = $rootScope.$on('$routeChangeSuccess', function (event, current) {
                
                var pathElements = $location.path().split('/'), result = [], i;
                var breadcrumbPath = function (index) {
                    return '/' + (pathElements.slice(0, index + 1)).join('/');
                };

                pathElements.shift();
                
                for (i = 0; i < pathElements.length; i++) {
                    result.push({ name:  pathElements[i], path: breadcrumbPath(i) });
                }

                breadcrumbs = result;
            });
            
            $scope.$on("$destroy", function () {
                routeChangeSuccessHandler();
            });

            breadcrumbsService.getAll = function () {
                return breadcrumbs;
            };

            breadcrumbsService.getFirst = function () {
                return breadcrumbs[0] || {};
            };

            return breadcrumbsService;
            
        }]);


}(Phoenix.Services));