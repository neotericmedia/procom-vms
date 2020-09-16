(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider
                .state("transaction", {
                    url: '/transaction',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("transaction.search", {
                    url: '/search',
                    controller: 'TransactionSearchController',
                    templateUrl: '/Phoenix/modules/transaction/views/Search.html'
                })
                .state("transaction.view", {
                    url: '/{transactionHeaderId:[0-9]{1,8}}',
                    controller: 'TransactionViewController',
                    templateUrl: '/Phoenix/modules/transaction/views/View/Root.html',
                    resolve: {
                        transactionHeader: ['$state', '$stateParams', 'TransactionApiService', '$q', 'common', 'WorkflowApiService',
                            function ($state, $stateParams, TransactionApiService, $q, common, WorkflowApiService) {
                                var result = $q.defer();

                                //  https://github.com/j3ko/oreq
                                var oDataParams = oreq.request()

                                    .withExpand([
                                        'BillingTransactions',
                                        'BillingTransactions/BillingTransactionLines',
                                        'BillingTransactions/PurchaseOrderLine',
                                        'BillingTransactions/BillingTransactionARPayment',
                                        //'BillingTransactions/PurchaseOrderLine/BillingTransactionLineSalesTaxes',
                                        'PaymentTransactions',
                                        'PaymentTransactions/PaymentTransactionLines',
                                        //, 'PaymentTransactions/PurchaseOrderTransactions'
                                        //, 'PaymentTransactions/WorkOrderPurchaseOrderLines'
                                        //, 'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineSalesTaxes',
                                        'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails',
                                        'VmsProcessedRecord',
                                        'VmsExpenseProcessedRecord',
                                        'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations',
                                        'VmsCommissionProcessedRecord',
                                        'VmsFixedPriceProcessedRecord',
                                        'ExcludedBillSalesTaxes',
                                        'ExcludedPaySalesTaxes',
                                        'ExcludedEarningAndSourceDeductions'
                                    ])
                                   .withSelect([
                                       'Id',
                                       'TransactionTypeId',
                                       'TransactionCategoryId',
                                       'TransactionHeaderStatusId',
                                       'TimeSheetId',
                                       'OrganizationIdInternal',
                                       'OrganizationInternalCode',
                                       'TransactionReference',
                                       'TransactionNumber',
                                       'AssignmentId',
                                       'WorkOrderNumber',
                                       'WorkerUserProfileId',
                                       'WorkOrderId',
                                       //'WorkOrderVersionId',
                                       'TransactionDate',
                                       'StartDate',
                                       'EndDate',
                                       'WorkerName',
                                       'PayeeName',
                                       'ClientCompany',
                                       'FromDate',
                                       'ToDate',
                                       'Subtotal',
                                       'Tax',
                                       'PONumber',
                                       'IsTest',
                                       //'IsDraft',

                                       'BillingTransactions/Id',
                                       'BillingTransactions/WorkOrderId',

                                       'BillingTransactions/OrganizationIdClient',
                                       'BillingTransactions/OrganizationClientDisplayName',
                                       'BillingTransactions/OrganizationIdInternal',
                                       'BillingTransactions/OrganizationInternalLegalName',
                                       'BillingTransactions/TransactionHeaderId',
                                       'BillingTransactions/DetailNumber',
                                       'BillingTransactions/BillingDate',
                                       'BillingTransactions/StartDate',
                                       'BillingTransactions/EndDate',
                                       'BillingTransactions/ReversedBillingTransactionId',
                                       'BillingTransactions/BillingTransactionNumber',
                                       'BillingTransactions/PartyName',
                                       'BillingTransactions/PurchaseOrderLineId',
                                       'BillingTransactions/InvoiceNote1',
                                       'BillingTransactions/InvoiceNote2',
                                       'BillingTransactions/InvoiceNote3',
                                       'BillingTransactions/InvoiceNote4',
                                       'BillingTransactions/IsInternalTransaction',
                                       'BillingTransactions/BillingTransactionPaymentStatus',
                                       'BillingTransactions/BillingTransactionARPayment',
                                       'BillingTransactions/BillingTransactionARPaymentAmount',
                                       'BillingTransactions/TotalAmount',
                                       'BillingTransactions/PurchaseOrderLine',
                                       'BillingTransactions/CurrencyId',
                                       'BillingTransactions/VmsDiscountProcessedRecordId',

                                       'BillingTransactions/BillingTransactionARPayment/PaymentAmount',
                                       'BillingTransactions/BillingTransactionARPayment/ClientLastPaymentDate',

                                       'BillingTransactions/BillingTransactionLines/Id',
                                       'BillingTransactions/BillingTransactionLines/BillingInfoId',
                                       'BillingTransactions/BillingTransactionLines/BillingTransactionId',
                                       'BillingTransactions/BillingTransactionLines/LineNumber',
                                       'BillingTransactions/BillingTransactionLines/Description',
                                       'BillingTransactions/BillingTransactionLines/Units',
                                       'BillingTransactions/BillingTransactionLines/RateTypeId',
                                       'BillingTransactions/BillingTransactionLines/Rate',
                                       'BillingTransactions/BillingTransactionLines/Amount',
                                       'BillingTransactions/BillingTransactionLines/ReversedBillingTransactionLineId',
                                       'BillingTransactions/BillingTransactionLines/BillingTransactionLineNumber',
                                       'BillingTransactions/BillingTransactionLines/SubdivisionId',
                                       'BillingTransactions/BillingTransactionLines/VersionRates',
                                       'BillingTransactions/BillingTransactionLines/Hours',
                                       'BillingTransactions/BillingTransactionLines/RateUnitId',

                                       'BillingTransactions/PurchaseOrderLine/Id',
                                       'BillingTransactions/PurchaseOrderLine/PurchaseOrderNumber',
                                       'BillingTransactions/PurchaseOrderLine/PurchaseOrderLineNumber',

                                       'PaymentTransactions/Id',
                                       'PaymentTransactions/WorkOrderId',

                                       'PaymentTransactions/PayeeName',
                                       'PaymentTransactions/PayeeOrganizationIdSupplier',
                                       'PaymentTransactions/PayeeUserProfileWorkerId',

                                       'PaymentTransactions/TransactionHeaderId',
                                       'PaymentTransactions/DetailNumber',
                                       'PaymentTransactions/PlannedReleaseDate',

                                       'PaymentTransactions/PaymentDate',
                                       'PaymentTransactions/StartDate',
                                       'PaymentTransactions/EndDate',
                                       'PaymentTransactions/ReversedPaymentTransactionId',
                                       'PaymentTransactions/PaymentTransactionNumber',
                                       'PaymentTransactions/PayeeName',
                                       'PaymentTransactions/PurchaseOrderLineId',
                                       'PaymentTransactions/PurchaseOrderLine',
                                       'PaymentTransactions/CurrencyId',
                                       'PaymentTransactions/AdvanceTotal',
                                       'PaymentTransactions/GarnisheeTotal',
                                       'PaymentTransactions/SourceDeductionTotal',
                                       'PaymentTransactions/OtherEarningTotal',
                                       'PaymentTransactions/CreatedDatetime',
                                       'PaymentTransactions/IsPaymentStopped',

                                       'PaymentTransactions/PaymentTransactionLines/Id',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentInfoId',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionId',
                                       'PaymentTransactions/PaymentTransactionLines/LineNumber',
                                       'PaymentTransactions/PaymentTransactionLines/Description',
                                       'PaymentTransactions/PaymentTransactionLines/Units',
                                       'PaymentTransactions/PaymentTransactionLines/RateTypeId',
                                       'PaymentTransactions/PaymentTransactionLines/Rate',
                                       'PaymentTransactions/PaymentTransactionLines/Amount',
                                       'PaymentTransactions/PaymentTransactionLines/ReversedPaymentTransactionLineId',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineNumber',
                                       'PaymentTransactions/PaymentTransactionLines/SubdivisionId',
                                       'PaymentTransactions/PaymentTransactionLines/VersionRates',
                                       'PaymentTransactions/PaymentTransactionLines/Hours',
                                       'PaymentTransactions/PaymentTransactionLines/RateUnitId',
                                       'PaymentTransactions/PaymentTransactionLines/Date',
                                       'PaymentTransactions/PaymentTransactionLines/UnitsOverwrite',
                                       'PaymentTransactions/PaymentTransactionLines/PaidHolidayId',

                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/HolidayName',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/HolidayDate',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/IsManualOverride',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/IsSubdivisionHolidayPreviouslyPaid',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/IsFlatStatPayApplied',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/RangeStartDate',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/RangeEndDate',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/TransactionMinDate',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/TransactionMaxDate',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/TransactionCount',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/WorkDayCountActual',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/WorkDayCountAdjusted',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/SumUnits',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/AverageUnits',
                                       'PaymentTransactions/PaymentTransactionLines/PaymentTransactionLineStatHolidayDetails/CalculatedUnits',

                                       'VmsProcessedRecord/Id',
                                       'VmsProcessedRecord/EndDate',
                                       'VmsProcessedRecord/FirstName',
                                       'VmsProcessedRecord/ImportDate',
                                       'VmsProcessedRecord/InvoiceReference',
                                       'VmsProcessedRecord/LastName',
                                       'VmsProcessedRecord/StartDate',
                                       'VmsProcessedRecord/V1BillRate',
                                       'VmsProcessedRecord/V1BillUnits',
                                       'VmsProcessedRecord/V1RateTypeId',
                                       'VmsProcessedRecord/V2BillRate',
                                       'VmsProcessedRecord/V2BillUnits',
                                       'VmsProcessedRecord/V2RateTypeId',
                                       'VmsProcessedRecord/WorkOrderReference',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/WorkOrderVersionNumber',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/WOVFirstName',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/WOVLastName',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/TransactionStartDate',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/TransactionEndDate',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V1BillRate',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V1BillUnits',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V1RateTypeId',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V2BillRate',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V2BillUnits',
                                       'VmsProcessedRecord/VmsProcessedRecordWorkOrderVersionAllocations/V2RateTypeId',

                                       'VmsExpenseProcessedRecord/Id',
                                       'VmsCommissionProcessedRecord/Id',
                                       'VmsFixedPriceProcessedRecord/Id',
                                       'ExcludedBillSalesTaxes/Id',
                                       'ExcludedBillSalesTaxes/TransactionHeaderId',
                                       'ExcludedBillSalesTaxes/IsExcluded',
                                       'ExcludedBillSalesTaxes/OrganizationIdClient',
                                       'ExcludedBillSalesTaxes/SalesTaxId',

                                       'ExcludedPaySalesTaxes/Id',
                                       'ExcludedPaySalesTaxes/TransactionHeaderId',
                                       'ExcludedPaySalesTaxes/IsExcluded',
                                       'ExcludedPaySalesTaxes/PayeeOrganizationIdSupplier',
                                       'ExcludedPaySalesTaxes/PayeeUserProfileWorkerId',
                                       'ExcludedPaySalesTaxes/SalesTaxId',

                                       'ExcludedEarningAndSourceDeductions/Id',
                                       'ExcludedEarningAndSourceDeductions/TransactionHeaderId',
                                       'ExcludedEarningAndSourceDeductions/IsExcluded',
                                       'ExcludedEarningAndSourceDeductions/EarningsAndDeductionsTypeId',

                                   ])
                                    //.withorderby([
                                    //     'billingtransactions/id'
                                    //     , 'paymenttransactions/id'
                                    //])
                                    .url();

                                TransactionApiService.getByTransactionHeaderId($stateParams.transactionHeaderId, oDataParams).then(
                                    function (responseSucces) {
                                        _.each(responseSucces.PaymentTransactions, function (pt) {
                                            _.each(pt.PaymentTransactionLines, function (ptl) {
                                                if (ptl.RateTypeId === ApplicationConstants.RateType.Stat && (ptl.UnitsOverwrite || ptl.UnitsOverwrite === 0)) {
                                                    ptl.Units = ptl.UnitsOverwrite;
                                                }
                                            });
                                        });
                                        WorkflowApiService.getWorkflowAvailableActions(responseSucces, responseSucces, ApplicationConstants.EntityType.TransactionHeader).then(
                                            function (responseSuccess) {
                                                result.resolve(responseSucces);
                                            },
                                            function (responseError) {
                                                result.reject(responseError);
                                            });
                                    },
                                    function (responseError) {
                                        common.responseErrorMessages(responseError);
                                        result.reject(responseError);
                                    });
                                return result.promise;
                            }
                        ]
                    }
                })
                .state("transaction.view.summary", {
                    url: '/summary',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: '/Phoenix/modules/transaction/views/View/TabSummary.html',
                        }
                    }
                })
                .state("transaction.view.detail", {
                    url: '/detail',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: '/Phoenix/modules/transaction/views/View/TabDetail.html',
                        },
                        'transactionAmountSummary@transaction.view.detail': {
                            templateUrl: '/Phoenix/modules/transaction/views/TabDetailAmountSummary.html',
                        }
                    }
                })
                .state("transaction.view.workflow", {
                    url: '/workflow',
                    'abstract': false,
                    resolve: app.resolve.TransactionBillingWorkflowController,
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: "/Phoenix/modules/transaction/views/View/TabWorkflow.html",
                            controller: "TransactionBillingWorkflowController",
                            controllerAs: "trn"
                        }
                    }
                })
                .state("transaction.view.notes", {
                    url: '/notes',
                    views: {
                        "transactionActiveTabs": {
                            template: '<div data-pt-comment-utility-service="" ' +
                                'data-entity-type-id="ApplicationConstants.EntityType.TransactionHeader" ' +
                                'data-entity-id="$state.params.transactionHeaderId" ' +
                                 'data-func-get-notes-length="getNotesLength"' +
                                'data-header-text="Add your notes here" ></div>'
                        }
                    }
                })
                .state("transaction.view.billingdocuments", {
                    url: '/billingdocuments',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: "/Phoenix/modules/transaction/views/View/TabDocuments.html",
                            controller: "TransactionBillingDocumentController"
                        }
                    }
                })
                .state("transaction.view.invoices", {
                    url: '/invoices',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: '/Phoenix/modules/transaction/views/View/TabInvoices.html'
                        }
                    }
                })
                .state("transaction.view.invoices.report", {
                    url: '/report/{invoiceId:[0-9]{1,8}}',
                    views:
                    {
                        'reportView@transaction.view.invoices':
                        {
                            controller: 'InvoiceReportViewController',
                            templateUrl: '/Phoenix/modules/invoice/views/ReportView.html'
                        }
                    },
                    resolve: app.resolve.InvoiceReportViewController
                })
                .state("transaction.view.payments", {
                    url: '/payments',
                    views: {
                        "transactionActiveTabs": {
                            controller: 'TransactionPaymentController',
                            templateUrl: '/Phoenix/modules/transaction/views/View/TabPayments.html',
                            controllerAs: 'payment'
                        }
                    }
                })
                .state("transaction.view.payments.report", {
                    url: '/report/{paymentDocumentId:[0-9]{1,8}}',
                    views:
                    {
                        'reportView@transaction.view.payments':
                        {
                            controller: 'PaymentReportViewController',
                            templateUrl: '/Phoenix/modules/payment/views/PaymentReportView.html'
                        }
                    },
                    resolve: app.resolve.PaymentReportViewController
                })
                .state("transaction.view.vmsrecord", {
                    url: '/vmsrecord',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: '/Phoenix/modules/transaction/views/View/TabVMSRecord.html',
                        }
                    }
                })
                .state("transaction.manual", {
                    url: '/manual/{transactionHeaderId:[0-9]{1,8}}',
                    controller: 'TransactionHeaderManualEditController',
                    templateUrl: '/Phoenix/modules/transaction/views/EditManual/Root.html',
                    resolve: app.resolve.TransactionHeaderManualEditController,
                })
                .state("transaction.manual.detail", {
                    url: '/detail',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: '/Phoenix/modules/transaction/views/EditManual/TabDetail.html',
                        },
                        'transactionAmountSummary@transaction.manual.detail': {
                            templateUrl: '/Phoenix/modules/transaction/views/TabDetailAmountSummary.html',
                        }
                    }
                })
                .state("transaction.manual.notes", {
                    url: '/notes',
                    views: {
                        "transactionActiveTabs": {
                            template: '<div data-pt-comment-utility-service="" ' +
                                'data-entity-type-id="ApplicationConstants.EntityType.TransactionHeader" ' +
                                'data-entity-id="$state.params.transactionHeaderId" ' +
                                 'data-func-get-notes-length="getNotesLength"' +
                                'data-header-text="Add your notes here" ' +
                                '></div>'
                        }
                    }
                })
                .state("transaction.manual.billingdocuments", {
                    url: '/billingdocuments',
                    views: {
                        "transactionActiveTabs": {
                            templateUrl: "/Phoenix/modules/transaction/views/View/TabDocuments.html",
                            controller: "TransactionBillingDocumentController"
                        }
                    }
                })
                .state("transaction.adjustment", {
                    url: '/adjustment/{userProfileId:[0-9]{1,8}}/:workOrderVersionId',
                    controller: 'TransactionHeaderAdjustmentEditController',
                    templateUrl: '/Phoenix/modules/transaction/views/TransactionHeaderAdjustmentEdit.html',
                    controllerAs: 'selfScope',
                    resolve: app.resolve.TransactionHeaderAdjustmentEditController,
                })


            ;
        }
    ]);
})();