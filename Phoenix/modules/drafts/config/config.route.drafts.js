(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

        // Drafts
        $stateProvider
            .state('drafts', {
                url: '/drafts',
                templateUrl: '/Phoenix/modules/drafts/views/Root.html',
                controller: 'DraftsController'
            })            
            .state('drafts.workorders', {
                url: '/workorders',
                views: {
                    'draftListTab': {
                        templateUrl: '/Phoenix/modules/drafts/views/Assignments.html',
                        controller: 'DraftsAssignmentsController'
                    }
                },
            })
            .state('drafts.organizations', {
                url: '/organizations',
                views: {
                    'draftListTab': {
                        templateUrl: '/Phoenix/modules/drafts/views/Organizations.html',
                        controller: 'DraftsOrganizationsController',
                    }
                }
            })
            .state('drafts.contacts', {
                url: '/contacts',
                views: {
                    'draftListTab': {
                        templateUrl: '/Phoenix/modules/drafts/views/Contacts.html',
                        controller: 'DraftsContactsController'
                    }
                }
            });
        }
    ]);
})();