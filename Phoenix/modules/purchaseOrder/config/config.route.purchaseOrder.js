(function () {
    'use strict';

    var app = angular.module('Phoenix');
    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $urlRouterProvider
                .when('/purchaseorder/create', ['$state', function ($state) {
                    $state.go('purchaseorder.create.details');
                }]);
            //.when('/purchaseorder/create', '/purchaseorder/create/details');

            // Create purchase order
            $stateProvider.state("purchaseorder", {
                url: '/purchaseorder',
                template: '<div data-ui-view="" autoscroll="false"></div>',
                abstract: true,
                resolve:
                {
                    purchaseOrderLists:['CodeValueService', function (CodeValueService) {
                        var list = {};
                        list.purchaseOrderStatuses = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderStatus, true);
                        list.purchaseOrderInvoiceRestrictionsList = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderInvoiceRestriction);
                        list.purchaseOrderDepletedActionList = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderDepletedActions, true);
                        list.purchaseOrderDepletedOptionList = CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderDepletedOptions, true);
                        list.purchaseOrderDepletedGroupList =  CodeValueService.getCodeValues(CodeValueGroups.PurchaseOrderDepletedGroups, true);
                        list.currencyList = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
                        return list;
                    }]
                }
            })
                .state("purchaseorder.search", {
                    url: '/search',
                    controller: 'PurchaseOrderSearchController',
                    templateUrl: '/Phoenix/modules/purchaseOrder/views/Search.html',
                })
                .state("purchaseorder.edit", {
                    url: '/{purchaseOrderId:[0-9]{1,8}}',
                    controller: 'PurchaseOrderEntryController',
                    templateUrl: '/Phoenix/modules/purchaseOrder/views/Root.html',
                    resolve: app.resolve.PurchaseOrderEntryController,
                    abstract: true
                })
                .state("purchaseorder.edit.details", {
                    url: '/details',
                    views: {
                        "purchaseOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/purchaseOrder/views/TabDetailsRoot.html"                            
                        }
                    }
                }).state('purchaseorder.edit.details.line',
                {
                    url: '/line/{purchaseOrderLineId:-?[0-9]{1,8}}',
                    views:
                    {
                        'purchaseOrderLine@purchaseorder.edit':
                        {
                            controller: 'PurchaseOrderLineController',
                            templateUrl: "/Phoenix/modules/purchaseOrder/views/DialogPurchaseOrderLineEdit.html",
                        }
                    },
                    resolve:
                    {
                            purchaseOrderLine: ['purchaseOrder', '$q', '$stateParams', function (purchaseOrder, $q, $stateParams) {
                            var result = $q.defer();
                            angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                                if (line.Id == $stateParams.purchaseOrderLineId) {
                                    result.resolve(line);
                                }
                            });
                            return result.promise;
                        }]
                    }

                })               
                .state("purchaseorder.edit.workorders", {
                    url: '/workorders',
                    views: {
                        "purchaseOrderActiveTabs": {
                            template: '<app-purchase-order-work-orders [purchase-order-id]="model.entity.Id"></app-purchase-order-work-orders>'
                        }
                    }
                })
                .state("purchaseorder.edit.changehistory", {
                    url: '/changehistory',
                    views: {
                        "purchaseOrderActiveTabs": {
                            template: '<utility-data-change-tracker ' +
                                'data-culture-id="model.cultureId" ' +
                                'data-entity-type-id="ApplicationConstants.EntityType.PurchaseOrder" ' +
                                'data-entity-id="model.entity.Id" ' +
                                'data-template-url="/Phoenix/modules/utility/views/DataChangeTrackPurchaseOrder.html" ' +
                                'data-black-list="model.changeHistoryBlackList" ' +
                                '></utility-data-change-tracker>'
                        }
                    }
                })
                .state("purchaseorder.edit.documents", {
                    url: '/documents',
                    views: {
                        "purchaseOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/purchaseOrder/views/TabDocumentsRoot.html"
                        }
                    }
                })
                .state("purchaseorder.create", {
                    url: '/create',
                    controller: 'PurchaseOrderEntryController',
                    templateUrl: '/Phoenix/modules/purchaseOrder/views/Root.html',
                    resolve: app.resolve.PurchaseOrderCreateController
                })
                .state("purchaseorder.create.details", {
                    url: '/details',
                    views: {
                        "purchaseOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/purchaseOrder/views/TabDetailsRoot.html"
                        }
                    }
                }).state("purchaseorder.create.details.line",
               {
                   url: '/line/{purchaseOrderLineId:-?[0-9]{1,8}}',
                   views:
                   {
                       'purchaseOrderLine@purchaseorder.create':
                       {
                           controller: 'PurchaseOrderLineController',
                           templateUrl: "/Phoenix/modules/purchaseOrder/views/DialogPurchaseOrderLineEdit.html",
                       }
                   },
                   resolve:
                   {
                       purchaseOrderLine: ['purchaseOrder', '$q', '$stateParams',function (purchaseOrder, $q, $stateParams) {
                           var result = $q.defer();
                           angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                               if (line.Id == $stateParams.purchaseOrderLineId) {
                                   result.resolve(line);
                               }
                           });
                           return result.promise;
                       }]
                   }

               })
                .state("purchaseorder.create.workorders", {
                    url: '/workorders',
                    views: {
                        "purchaseOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/purchaseOrder/views/TabAssignmentsRoot.html",
                            controller: "PurchaseOrderAssociatedWorkOrderController"
                        }
                    }
                })
                .state("PurchaseOrderNotFound", {
                    url: '/NotFound',
                    template: 'Requested state not found'
                });
        }
    ]);
})();