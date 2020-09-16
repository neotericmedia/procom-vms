(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $urlRouterProvider
                //.when('/workorder/create', '/workorder/create/core')
                .when('/workorder/{assignmentId:[0-9]{1,8}}', '/workorder/:assignmentId/core');

            //// Create Work Order
            $stateProvider
                .state("workorder", {
                    //controller: ['$scope', 'AssignmentApiService', function ($scope, AssignmentApiService) {
                    //    AssignmentApiService.lazyLoadStaticDataToAssignmentDataService();
                    //    $scope.stopSpinning = function () {
                    //        $scope.viewLoading = false;
                    //    };
                    //    $scope.viewLoading = true;
                    //}],
                    controller: ['$scope', 'resolveLazyLoad', function ($scope, resolveLazyLoad) {
                        $scope.stopSpinning = function () {
                            $scope.viewLoading = false;
                        };
                        $scope.viewLoading = true;
                    }],
                    resolve: {
                        resolveLazyLoad: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                            var deferred = $q.defer();
                            deferred.resolve(AssignmentApiService.lazyLoadStaticDataToAssignmentDataService());
                            return deferred.promise;
                        }],
                    },
                    url: '/workorder',
                    template: '<div data-ui-view="" autoscroll="false"><div  data-loading-spinner="viewLoading"></div></div>'
                })
                .state("workorder.search", {
                    url: '/search',
                    controller: 'AssignmentSearchController',
                    templateUrl: '/Phoenix/modules/workorder/views/Search.html',
                })
                .state("workorder.pendingApproval", {
                    url: '/pending-approval',
                    controller: 'AssignmentSearchController',
                    templateUrl: '/Phoenix/modules/workorder/views/Search.html',
                })
                .state("workorder.edit", {
                    url: '/{assignmentId:[0-9]{1,8}}/{workOrderId:[0-9]{1,8}}/{workOrderVersionId:[0-9]{1,8}}',
                    controller: 'AssignmentEntryController',
                    templateUrl: '/Phoenix/modules/workorder/views/Root.html',
                    resolve: app.resolve.AssignmentEntryController,
                    data: {
                        workOrderTabs: ApplicationConstants.ProductionHideFunctionality ?
                            [
                                { state: 'workorder.edit.core', stateName: 'Core' },
                                { state: 'workorder.edit.parties', stateName: 'Parties and Rates' },
                                { state: 'workorder.edit.timematerialinvoice', stateName: 'Time & Material and Invoice' },
                                { state: 'workorder.edit.expensemanagement', stateName: 'Expense and Invoice' },
                                { state: 'workorder.edit.purchaseorder', stateName: 'Purchase Order' },
                                { state: 'workorder.edit.taxes', stateName: 'Taxes' },
                                { state: 'workorder.edit.compliancedocuments', stateName: 'Documents' },
                                { state: 'workorder.edit.clientspecificfields', stateName: 'Client Specific Fields' },
                            ]
                            :
                            [
                                { state: 'workorder.edit.core', stateName: 'Core' },
                                { state: 'workorder.edit.parties', stateName: 'Parties and Rates' },
                                { state: 'workorder.edit.timematerialinvoice', stateName: 'Time & Material and Invoice' },
                                { state: 'workorder.edit.expensemanagement', stateName: 'Expense and Invoice' },
                                { state: 'workorder.edit.purchaseorder', stateName: 'Purchase Order' },
                                { state: 'workorder.edit.earningsanddeductions', stateName: 'Earnings and Deductions' },
                                { state: 'workorder.edit.taxes', stateName: 'Taxes' },
                                { state: 'workorder.edit.compliancedocuments', stateName: 'Documents' },
                                { state: 'workorder.edit.clientspecificfields', stateName: 'Client Specific Fields' },
                            ]
                    }
                })
                .state("workorder.edit.core", {
                    url: '/core',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabCoreRoot.html"
                        }
                    }
                })
                .state("workorder.edit.parties", {
                    url: '/parties',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabPartiesRoot.html"
                        }
                    }
                })
                //.state("workorder.edit.parties", {
                //    url: '/parties',
                //    views: {
                //        "workOrderActiveTabs": {
                //            templateUrl: "/Phoenix/modules/workorder/views/TabParties.html"
                //        },
                //        'billingParty@workorder.edit.parties': {
                //            templateUrl: 'Phoenix/modules/workorder/views/BillingParties2.html',
                //            controller: 'BillingPartiesController',
                //            controllerAs: 'billingParties'
                //        },
                //        'paymentParty@workorder.edit.parties': {
                //            templateUrl: 'Phoenix/modules/workorder/views/PaymentParties2.html',
                //            controller: 'PaymentPartiesController',
                //            controllerAs: 'paymentParties'
                //        }
                //    }
                //})
                .state("workorder.edit.timematerialinvoice", {
                    url: '/timematerialinvoice',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabTimeMaterialInvoiceRoot.html"
                        }
                    }
                })
                .state("workorder.edit.timematerialinvoice.paymentreleasescheduleview", {
                    url: '/paymentreleasescheduleview/{paymentReleaseScheduleId:[0-9]{1,8}}',
                    views:
                        {
                            'paymentReleaseScheduleView@workorder.edit.timematerialinvoice':
                                {
                                    controller: 'PaymentReleaseScheduleController',
                                    templateUrl: '/Phoenix/modules/workorder/views/PaymentReleaseSchedule.html'
                                }
                        }
                })
                .state("workorder.edit.expensemanagement", {
                    url: '/expensemanagement',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabExpenseManagementRoot.html"
                        }
                    }
                })
                .state("workorder.edit.expensemanagement.paymentreleasescheduleview", {
                    url: '/paymentreleasescheduleview/{paymentReleaseScheduleId:[0-9]{1,8}}',
                    views:
                        {
                            'paymentReleaseScheduleView@workorder.edit.expensemanagement':
                                {
                                    controller: 'PaymentReleaseScheduleController',
                                    templateUrl: '/Phoenix/modules/workorder/views/PaymentReleaseSchedule.html'
                                }
                        }
                })
                .state("workorder.edit.purchaseorder", {
                    url: '/purchaseorder',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabPurchaseOrderRoot.html",
                            controller: 'WorkOrderPurchaseOrderLineController'
                        }
                    }
                })
                .state("workorder.edit.earningsanddeductions", {
                    url: '/earningsanddeductions',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabEarningsAndDeductionsRoot.html"
                        }
                    }
                })
                .state('workorder.edit.purchaseorder.line',
                    {
                        url: '/:purchaseOrderId/line/{purchaseOrderLineId:-?[0-9]{1,8}}?workOderPurchaseOrderLineId&workOrderNumber',
                        views:
                            {
                                'purchaseOrderLine@workorder.edit':
                                    {
                                        controller: 'PurchaseOrderLineController',
                                        templateUrl: "/Phoenix/modules/purchaseOrder/views/DialogPurchaseOrderLineEdit.html",
                                    }
                            },
                        resolve:
                            {
                                purchaseOrder: ['$stateParams', 'PurchaseOrderApiService', 'PurchaseOrderModel', 'PurchaseOrderLineModel', 'AssignmentApiService', '$q', function ($stateParams, PurchaseOrderApiService, PurchaseOrderModel, PurchaseOrderLineModel, AssignmentApiService, $q) {
                                    var poLineDefaults = AssignmentApiService.getDefaultWorkOrderPurchaseOrderLine().then(function (poLineDefaults) {
                                        return poLineDefaults;
                                    });
                                    var po = PurchaseOrderApiService.getByPurchaseOrderId($stateParams.purchaseOrderId);

                                    return $q.all([po, poLineDefaults]).then(function (results) {
                                        var purchaseOrder = results[0];
                                        PurchaseOrderModel.mixInto(purchaseOrder);
                                        angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                                            PurchaseOrderLineModel.mixInto(line);
                                        });
                                        purchaseOrder.purchaseOrderLineDefaults = results[1];
                                        return purchaseOrder;
                                    });
                                }],
                                purchaseOrderLine: ['purchaseOrder', '$q', '$stateParams', function (purchaseOrder, $q, $stateParams) {
                                    var result = $q.defer();
                                    angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                                        if (line.Id == $stateParams.purchaseOrderLineId) {
                                            if ($stateParams.workOderPurchaseOrderLineId == "-1") {
                                                line.WorkOrderPurchaseOrderLines.push(
                                                    {
                                                        Id: 0,
                                                        AssignmentId: $stateParams.assignmentId,
                                                        WorkOrderId: $stateParams.workOrderId,
                                                        WorkOrderNumber: $stateParams.workOrderNumber,
                                                        AmountReserved: 0,
                                                        AmountSpent: 0,
                                                        AmountCommited: 0
                                                    });
                                            }
                                            result.resolve(line);
                                        }
                                    });
                                    return result.promise;
                                }]
                            }

                    })
                .state("workorder.edit.taxes", {
                    url: '/taxes',
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabTaxesRoot.html"
                        }
                    }
                })
                .state("workorder.edit.compliancedocuments", {
                    url: '/compliancedocuments',
                    views: {
                        "workOrderActiveTabs": {
                            // validation must be activated when WO will be moved under Angular2. Currently when user choose not compliancedocuments Tab, the ang2 compotent is destroed
                            template: '<app-compliance-document [trigger-to-refresh]="triggerToRefreshComplianceDocument" [entity-type-id]="ApplicationConstants.EntityType.WorkOrder" [entity-id]="$state.params.workOrderId" [entity-name]="model.entity.UserProfileIdWorker|lookupnocache:lists.listUserProfileWorker:\'Id\':\'Contact.FullName\'" reference-entity-link="#/workorder/{{$state.params.assignmentId}}/{{$state.params.workOrderId}}/{{$state.params.workOrderVersionId}}/core"></app-compliance-document>'
                        }
                    }
                })
                .state("workorder.edit.clientspecificfields", {
                    url: '/clientspecificfields',
                    views: {
                        "workOrderActiveTabs": {
                            template: '<app-client-specific-fields [form-data]="CurrentWorkOrderVersion.ClientBasedEntityCustomFieldValue" [entity-type-id]="ApplicationConstants.EntityType.WorkOrderVersion" [entity-id]="$state.params.workOrderVersionId" [client-id]="CurrentWorkOrderVersion.BillingInfoes[0].OrganizationIdClient" [editable]="CurrentWorkOrderVersion.IsDraftStatus" (form-validation-changed)="updateClientSpecificFieldsValidation($event)"></app-client-specific-fields>'
                        }
                    }
                })
                .state("workorder.edit.activity", {
                    url: '/activity',
                    'abstract': false,
                    views: {
                        "workOrderActiveTabs": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabActivityRoot.html"
                        }
                    }
                })
                .state("workorder.edit.activity.notes", {
                    url: '/notes',
                    views: {
                        "workOrderActivitiesNotes": {
                            template: '<div data-pt-comment-utility-service="" ' +
                                'data-entity-type-id="ApplicationConstants.EntityType.WorkOrder" ' +
                                'data-entity-id="$state.params.workOrderId" ' +
                                'data-func-get-notes-length="getNotesLength"' +
                                'data-header-text="Add your notes here" ' +
                                '></div>'
                        }
                    }
                })
                .state("workorder.edit.activity.history", {
                    url: '/history',
                    views: {
                        "workOrderActivitiesHistory": {
                            template: '<utility-data-change-tracker ' +
                                'data-culture-id="model.cultureId" ' +
                                'data-entity-type-id="ApplicationConstants.EntityType.WorkOrder" ' +
                                'data-entity-id="$state.params.workOrderId" ' +
                                'data-template-url="/Phoenix/modules/utility/views/DataChangeTrackAssignment.html" ' +
                                'data-black-list="model.changeHistoryBlackList" ' +
                                '></utility-data-change-tracker>'
                        }
                    }
                })
                //.state("workorder.edit.activity.audit", {
                //    url: '/audit',
                //    views: {
                //        "workOrderActivitiesAudit": {
                //            template: '<utility-data-change-tracker ' +
                //                'data-culture-id="model.cultureId" ' +
                //                'data-entity-type-id="ApplicationConstants.EntityType.WorkOrder" ' +
                //                'data-entity-id="$state.params.workOrderId" ' +
                //                'data-get-by-capture-type="2" '+
                //                'data-template-url="/Phoenix/modules/utility/views/DataChangeTrackAssignment.html" ' +
                //                'data-black-list="model.changeHistoryBlackList" ' +
                //                '></utility-data-change-tracker>'
                //        }
                //    }
                //})
                .state("workorder.edit.activity.transaction", {
                    url: '/transaction',
                    views: {
                        "workOrderActivitiesTransaction": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabActivityTransaction.html",
                            controller: 'AssignmentViewTransactionsController'
                        }

                    }
                })
                .state("workorder.edit.activity.documents", {
                    url: '/documents',
                    resolve: app.resolve.AssignmentDocumentsController,
                    views: {
                        "workOrderActivitiesDocuments": {
                            templateUrl: "/Phoenix/modules/workorder/views/TabActivityDocuments.html",
                            controller: 'AssignmentDocumentsController',
                        }
                    }
                })
                .state("workorder.edit.activity.workflow", {
                    url: '/workflow',
                    views: {
                        "workOrderActivitiesWorkflow": {
                            template: '<app-phx-workflow-event-history [entity-type-id]="ApplicationConstants.EntityType.WorkOrder" [entity-id]="$state.params.workOrderId"></app-phx-workflow-event-history>',
                        }
                    }
                })
                .state("workorder.createsetup", {
                    url: '/createsetup',
                    controllerAs: 'selfScope',
                    controller: 'AssignmentCreateSetupController',
                    resolve: app.resolve.AssignmentCreateSetupController,
                    templateUrl: '/Phoenix/modules/workorder/views/AssignmentCreateSetup.html',
                })
                .state("workorder.createresetup", {
                    url: '/createresetup/lineofbusiness/{lineOfBusinessId:[0-9]{1,8}}/atssource/{atsSourceId:[0-9]{1,8}}/atsplacement/{atsPlacementId:[0-9]{1,8}}',
                    controllerAs: 'selfScope',
                    controller: 'AssignmentCreateSetupController',
                    resolve: app.resolve.AssignmentCreateSetupController,
                    templateUrl: '/Phoenix/modules/workorder/views/AssignmentCreateSetup.html',
                })
                .state("workorder.create", {
                    url: '/create/lineofbusiness/{lineOfBusinessId:[0-9]{1,8}}/atssource/{atsSourceId:[0-9]{1,8}}/atsplacement/{atsPlacementId:[0-9]{1,8}}',
                    controllerAs: 'selfScope',
                    controller: 'AssignmentCreateController',
                    resolve: app.resolve.AssignmentCreateController,
                    templateUrl: '/Phoenix/modules/workorder/views/AssignmentCreate.html',
                })
                .state("workorder.generateT4Slip", {
                    url: '/report/generateT4Slip/{workOrderVersionId:[0-9]{1,8}}'
                })
                ;
        }
    ]);
})();