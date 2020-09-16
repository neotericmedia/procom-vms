(function () {
    'use strict';

    var app = angular.module('Phoenix');

    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state("dashboard", {
                    url: '/dashboard',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("dashboard.homepage", {
                   url: '/homepage',
                   templateUrl: '/Phoenix/modules/dashboard/views/Dashboard.html',
                   controller: 'DashboardController',
                   controllerAs: 'vm',
                   resolve: app.resolve.DashboardController,
                })
            ;
        }
    ]);
})();