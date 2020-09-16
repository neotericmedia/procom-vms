(function (angular, phoenixApp) {

    angular.module('phoenix.template', ['phoenix.template.models', 'phoenix.template.services', 'phoenix.template.controllers', 'phoenix.template.directives']);
    angular.module('phoenix.template.controllers', []);
    angular.module('phoenix.template.directives', []);
    angular.module('phoenix.template.services', []);
    angular.module('phoenix.template.models', []);

    angular.module('phoenix.template').config([
        '$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $stateProvider.state("template", {
                url: '/template',
                template: '<div data-ui-view="" autoscroll="false"></div>'
            });
            $stateProvider.state('template.search',
            {
                url: '/search',
                templateUrl: '/Phoenix/modules/template/views/TemplateSearchScreen.html',
                controller: 'TemplateSearchController'
            });
            $stateProvider.state("template.workorder", {
                url: '/workorder',
                template: '<div data-ui-view="" autoscroll="false"></div>',
                data: {
                    workOrderTabs: [
                                    { state: 'template.workorder.edit.core', stateName: 'Core' },
                                    { state: 'template.workorder.edit.parties', stateName: 'Parties and Rates' },
                                    { state: 'template.workorder.edit.timematerialinvoice', stateName: 'Time & Material and Invoice' },
                                    { state: 'template.workorder.edit.expensemanagement', stateName: 'Expense and Invoice' },
                                    { state: 'template.workorder.edit.purchaseorder', stateName: 'Purchase Order' },
                                    { state: 'template.workorder.edit.earningsanddeductions', stateName: 'Earnings And Deductions' },
                                    { state: 'template.workorder.edit.taxes', stateName: 'Taxes' }
                    ]

                }
            })
            .state("template.workorder.edit", {
                url: '/:templateId',
                controller: 'AssignmentEntryController',
                templateUrl: '/Phoenix/modules/workorder/views/Root.html',
                resolve: {
                    resolveAssignment: phoenixApp.resolve.AssignmentEntryController.resolveAssignment,
                    resolveDefaultAssignment: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getDefaultAssignment().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveDefaultWorkOrderPurchaseOrderLine: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getDefaultWorkOrderPurchaseOrderLine().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListOrganizationInternal: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getListOrganizationInternal().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListOrganizationClient: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getListOrganizationClient().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListOrganizationSupplier: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getListOrganizationSupplier().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListUserProfileWorker: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getListUserProfileWorker().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveCodeValueLists: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        AssignmentApiService.getWorkOrderCodeValueLists().then(
                            function (response) {
                                result.resolve(response);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListUserProfileCommissions: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        var filter = oreq.filter("UserProfileCommissions").any(oreq.filter("x/CommissionRoleId").gt(0));
                        var commissionDataParams = oreq.request()
                            .withExpand(['UserProfileCommissions', 'Contact'])
                            .withSelect(['Id',
                                'Contact/FullName',
                                'UserProfileCommissions/CommissionRoleId',
                                'UserProfileCommissions/CommissionRateHeaderStatusId',
                            ])
                            .withFilter(filter).url();
                        AssignmentApiService.getListUserProfileInternal(commissionDataParams).then(
                            function (response) {
                                result.resolve(response.Items);
                            }, function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListSalesPatterns: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                        var result = $q.defer();
                        var salesPatternDataParams = oreq.request()
                            .withSelect(['Id',
                                'Description',
                            ]).url();
                        AssignmentApiService.getSalesPatterns(salesPatternDataParams).then(
                            function (response) {
                                result.resolve(response.Items);
                            }, function (responseError) {
                                result.reject(responseError);
                            });
                        return result.promise;
                    }],
                    resolveListUserProfileAssignedTo: ['$q', 'ProfileApiService', function ($q, ProfileApiService) {
                        var deferred = $q.defer();
                        ProfileApiService.getListUserProfileInternal().then(
                            function (responseSuccess) {
                                deferred.resolve(responseSuccess.Items);
                            },
                            function (responseError) {
                                deferred.reject(responseError);
                            });
                        return deferred.promise;
                    }],
                },
            })
            .state("template.workorder.edit.core", {
                url: '/core',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabCoreRoot.html"
                    }
                }
            })
            .state("template.workorder.edit.parties", {
                url: '/parties',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabPartiesRoot.html"
                    }
                }
            })
            .state("template.workorder.edit.timematerialinvoice", {
                url: '/timematerialinvoice',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabTimeMaterialInvoiceRoot.html"
                    }
                }
            }).state("template.workorder.edit.expensemanagement", {
                url: '/expensemanagement',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabExpenseManagementRoot.html"
                    }
                }
            })
            .state("template.workorder.edit.purchaseorder", {
                url: '/purchaseorder',
                views: {
                    "workOrderActiveTabs": {
                        //templateUrl: "/Template/WorkOrder/PurchaseOrder/Root"
                        template: 'Purchase Order not available in template mode'
                    }
                }
            })
            .state("template.workorder.edit.earningsanddeductions", {
                url: '/earningsanddeductions',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabEarningsAndDeductionsRoot.html"
                    }
                }
            })
            .state("template.workorder.edit.taxes", {
                url: '/taxes',
                views: {
                    "workOrderActiveTabs": {
                        templateUrl: "/Phoenix/modules/workorder/views/TabTaxesRoot.html"
                    }
                }
            });
        }
    ]);
})(angular, Phoenix.App);