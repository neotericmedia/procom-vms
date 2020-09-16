(function () {
    'use strict';

    var app = angular.module('Phoenix');

    app.config(['$stateProvider',
        function ($stateProvider) {
          $stateProvider
            .state("access", {
                'abstract': true,
                template: '<div data-ui-view="" autoscroll="false"></div>'
            })
            .state("access.subscription", {
                url: '/subscription',
                'abstract': true,
                template: '<div data-ui-view="" autoscroll="false"></div>'
            })
            .state("access.subscription.search", {
                url: '/search',
                templateUrl: '/Phoenix/modules/access/views/AccessSubscriptionSearch.html',
                controller: 'AccessSubscriptionSearchController',
                controllerAs: 'search',
            })
           .state("access.pendingSubscriptions", {
               url: '/access/pending-review',
               controller: 'AccessSubscriptionSearchController',
               templateUrl: '/Phoenix/modules/access/views/AccessSubscriptionSearch.html',
               controllerAs: 'search',
                    
             })
            .state('access.subscription.edit', {
                url: '/edit/:accessSubscriptionId',
                templateUrl: '/Phoenix/modules/access/views/AccessSubscriptionEdit.html',
                controller: 'AccessSubscriptionEditController',
                controllerAs: 'edit',
                resolve: app.resolve.AccessSubscriptionEditController,
            })
            .state("access.subscription.edit.history", {
                url: '/history',
                views:
                {
                    'History@access.subscription.edit':
                    {
                        templateUrl: '/Phoenix/modules/access/views/AccessSubscriptionHistory.html',
                        controller: 'AccessSubscriptionHistoryController',
                        controllerAs: 'history'
                    }
                }
            });
        }
    ]);
})();