(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $stateProvider
            .state("journal", {
                url: '/journal',
                'abstract': true,
                template: '<div data-ui-view="" autoscroll="false"></div>'
            })
            .state("journal.pending", {
                url: '/pending',
                controller: 'JournalGroupController',
                templateUrl: '/Phoenix/modules/journal/views/JournalGroup.html'
            })
            .state("journal.export", {
                url: '/export/organization/{organizationId:[0-9]{1,8}}/count/{count:[0-9]{1,8}}',
                controller: 'JournalExportController',
                templateUrl: '/Phoenix/modules/journal/views/JournalExport.html'
            })
            .state("journal.search", {
                url: '/search',
                controller: 'JournalSearchController',
                templateUrl: '/Phoenix/modules/journal/views/JournalSearch.html'
            })
            .state("journal.batches", {
                url: '/batches/organization/{organizationId:[0-9]{1,8}}',
                controller: 'JournalBatchController',
                templateUrl: '/Phoenix/modules/journal/views/JournalBatch.html'
            });
        }
    ]);
})();