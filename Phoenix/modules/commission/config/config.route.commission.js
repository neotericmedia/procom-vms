(function () {
    'use strict';

    var commissionRateTabDetailsRouteObj = {
        templateUrl: '/Phoenix/modules/commission/views/UiView/CommissionRateUiViewTabDetails.html'
    };

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $stateProvider
                .state("commission", {
                    url: '/commission',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("commission.search", {
                    url: '/search',
                    controller: 'CommissionUsersController',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionUsers.html',
                    controllerAs: 'searchScope',
                })
                .state("commission.rates", {
                    url: '/rates/{commissionUserProfileId:[0-9]{1,8}}',
                    controller: 'CommissionRatesController',
                    controllerAs: 'ratesScope',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionRates.html',
                    resolve: app.resolve.CommissionRatesController,
                })
                .state("commission.ratesetup", {
                    url: '/ratesetup/{commissionUserProfileId:[0-9]{1,8}}',
                    controller: 'CommissionRateSetupController',
                    controllerAs: 'rateSetupScope',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionRateSetup.html',
                    resolve: app.resolve.CommissionRateSetupController,
                })
                .state("commission.ratecreate", {
                    abstract: true,
                    url: '/ratecreate/{commissionUserProfileId:[0-9]{1,8}}/{commissionRoleId:[0-9]{1,8}}/{commissionRateTypeId:[0-9]{1,8}}/{commissionTemplateId:[0-9]{1,8}}',
                    controller: 'CommissionRateController',
                    controllerAs: 'selfScope',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionRate.html',
                    resolve: app.resolve.CommissionRateController,
                })
                .state("commission.ratecreate.details", {
                    url: '',
                    views: {
                        'commissionRateActiveTab': commissionRateTabDetailsRouteObj
                    }
                })
                .state("commission.rate", {
                    url: '/rate/{commissionRateHeaderId:[0-9]{1,8}}/{commissionRateVersionId:[0-9]{1,8}}',
                    controller: 'CommissionRateController',
                    controllerAs: 'selfScope',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionRate.html',
                    resolve: app.resolve.CommissionRateController,
                    redirectTo: function(transition) {
                        return { state: 'commission.rate.details', params: transition.params() }
                    }
                })
                .state("commission.rate.details", {
                    url: '/details',
                    views: {
                        'commissionRateActiveTab': commissionRateTabDetailsRouteObj
                    }
                })
                .state("commission.rate.workorders", {
                    url: '/workorders',
                    views: {
                        'commissionRateActiveTab': {
                            template: '<app-commission-rate-workorders></app-commission-rate-workorders>',
                            controller: ['$scope', function ($scope) {
                            }]
                        }
                    }
                })
                .state("commission.templateedit", {
                    url: '/templateedit/{templateId:[0-9]{1,8}}',
                    abstract: true,
                    controller: 'CommissionRateController',
                    controllerAs: 'selfScope',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionRate.html',
                    resolve: app.resolve.CommissionRateController,
                })
                .state("commission.templateedit.details", {
                    url: '',
                    views: {
                        'commissionRateActiveTab': commissionRateTabDetailsRouteObj
                    }
                })
                .state('commission.templatesearch',
                {
                    url: '/templatesearch',
                    templateUrl: '/Phoenix/modules/template/views/TemplateSearchScreen.html',
                    controller: 'TemplateSearchController'
                })
                .state("commission.patternsales", {
                    url: '/patterns/sales',
                    controller: 'SalesPatternController',
                    controllerAs: 'sales',
                    templateUrl: '/Phoenix/modules/commission/views/SalesPattern.html'
                })
                .state("commission.salespatternedit", {
                    url: '/pattern/sales/{salesPatternId:[0-9]{1,8}}',
                    controller: 'SalesPatternEditController',
                    controllerAs: 'edit',
                    templateUrl: '/Phoenix/modules/commission/views/SalesPatternEdit.html',
                    resolve: app.resolve.SalesPatternEditController,
                })
                .state("commission.adjustment", {
                    url: '/adjustment',
                    controller: 'CommissionAdjustmentController',
                    controllerAs: 'adj',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionAdjustment.html'
                })
                .state("commission.adjustmentedit", {
                    url: '/adjustment/edit/{commissionId:[0-9]{1,8}}',
                    controller: 'CommissionAdjustmentEditController',
                    controllerAs: 'edit',
                    templateUrl: '/Phoenix/modules/commission/views/CommissionAdjustmentEdit.html',
                    resolve: app.resolve.CommissionAdjustmentEditController,
                })
                .state("commission.report", {
                    url: '/report?reportUserProfileId&reportYear&reportMonth&reportOrganizationIdInternal',
                    controller: 'ReportController',
                    controllerAs: 'report',
                    templateUrl: '/Phoenix/modules/commission/views/Report.html',
                    resolve: app.resolve.ReportController,
                })
                .state("commission.pendinginterest", {
                    url: '/pendinginterest?reportUserProfileId',
                    controller: 'PendingInterestController',
                    templateUrl: '/Phoenix/modules/commission/views/PendingInterest.html',
                    controllerAs: 'vm',
                    resolve: app.resolve.PendingInterestController,
                })
            ;
        }
    ]);
})();