(function () {
    'use strict';

    var app = angular.module('Phoenix');
    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider.state('compliancedocument', {
                    url: '/document',
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                // ruleareatype
                .state('compliancedocument.ruleareatype', {
                    url: '/ruleareatype',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state('compliancedocument.ruleareatype.search', {
                    url: '/search',
                    controller: 'ComplianceDocumentRuleAreaTypeSearchController',
                    controllerAs: 'scopeUiRoot',
                    templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleAreaTypeSearch.html',
                })
                //  documentrule
                .state('compliancedocument.documentrule', {
                    url: '/rule',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state('compliancedocument.documentrule.edit', {
                    url: '/edit/{complianceDocumentRuleId:[0-9]{1,8}}',
                    controller: 'ComplianceDocumentRuleEditController',
                    controllerAs: 'scopeUiRoot',
                    resolve: app.resolve.ComplianceDocumentRuleEditController,
                    templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleEdit.html',
                })
                .state('compliancedocument.documentrule.edit.details', {
                    url: '/details',
                    views: {
                        'complianceDocumentRuleActiveTab': {
                            templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleEditTabDetails.html'
                        },
                    },
                })
                .state('compliancedocument.documentrule.edit.rules', {
                    url: '/documentypes',
                    views: {
                        'complianceDocumentRuleActiveTab': {
                            templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleEditTabRules.html',
                        },
                    },
                })
                .state('compliancedocument.documentrule.edit.history', {
                    url: '/history',
                    views: {
                        'complianceDocumentRuleActiveTab': {
                            templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleEditTabHistory.html',
                        },
                    },
                })
                .state('compliancedocument.documentrule.edit.templates', {
                    url: '/templates',
                    views: {
                        'complianceDocumentRuleActiveTab': {
                            templateUrl: '/Phoenix/modules/compliance/views/ComplianceDocumentRuleEditTemplates.html'
                        }
                    }

                });
        }
    ]);
})();