(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider

                .state("vms", {
                    url: '/vms',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms.management", {
                    url: '/management',
                    controller: 'VmsManagementController',
                    templateUrl: '/Phoenix/modules/vms/views/VmsManagement.html',
                    controllerAs: 'vms',
                    resolve: {
                        resolveListOrganizationClient: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                            var result = $q.defer();
                            AssignmentApiService.getListOrganizationClient().then(
                                function (response) {

                                    response.unshift({ DisplayName: 'None', Id: -1 });

                                    result.resolve(response);
                                },
                                function (responseError) {
                                    result.reject(responseError);
                                });
                            return result.promise;
                        }]
                    }
                })

                .state("vms.preprocessed", {
                    url: '/preprocessed/{organizationIdInternal:[0-9]{1,}}/{organizationIdClient:int}?documentPublicId',
                    resolve: app.resolve.VmsPreprocessedController,
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/vms/views/VmsPreprocessed.html',
                            controller: 'VmsPreprocessedController'
                        },
                        'timesheet@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetPreprocessed.html',
                            controller: 'VmsTimesheetPreprocessedController'
                        },
                        'discount@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountPreprocessed.html',
                            controller: 'VmsDiscountPreprocessedController'
                        },
                        'ussourcededuction@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionPreprocessed.html',
                            controller: 'VmsUnitedStatesSourceDeductionPreprocessedController'
                        },
                        'expense@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpensePreprocessed.html',
                            controller: 'VmsExpensePreprocessedController'
                        },
                        'commission@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsCommission/views/VmsCommissionPreprocessed.html',
                            controller: 'VmsCommissionPreprocessedController'
                        },
                        'fixedprice@vms.preprocessed': {
                            templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsFixedPricePreprocessed.html',
                            controller: 'VmsFixedPricePreprocessedController'
                        }
                    }
                })

                .state("vms.batch", {
                    url: "/batch",
                    abstract: true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms.batch.management", {
                    url: '/management',
                    controller: 'VmsBatchManagementController',
                    templateUrl: '/Phoenix/modules/vms/views/VmsBatchManagement.html',
                    controllerAs: 'vms',
                    resolve: {
                        resolveListOrganizationInternal: ['$q', 'VmsApiService', function ($q, VmsApiService) {
                            var result = $q.defer();
                            VmsApiService.getVmsBatchSummary().then(
                                function (response) {
                                    result.resolve(response.Items);
                                },
                                function (responseError) {
                                    result.reject(responseError);
                                });
                            return result.promise;
                        }]
                    }
                })
                .state("vms.batch.timesheet", {
                    url: '/timesheet/processed/{vmsTimesheetProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchTimesheetController',
                    controllerAs: 'vmsBatchTimesheet',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsBatchTimesheet.html',
                    resolve: app.resolve.VmsBatchTimesheetController
                })
                .state("vms.batch.timesheet.details", {
                    url: '/details',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchTimesheetDetailController',
                            controllerAs: 'vmsBatchTimesheetDetails',
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsBatchTimesheetDetail.html'
                        }
                    }
                })
                .state("vms.batch.timesheet.workflow", {
                    url: '/workflow',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchTimesheetWorkflowController',
                            controllerAs: 'vm',
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsBatchTimesheetWorkflow.html'
                        }
                    }
                })
                .state("vms.batch.expense", {
                    url: '/expense/processed/{vmsExpenseProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchExpenseController',
                    controllerAs: 'vmsBatchExpense',
                    templateUrl: '/Phoenix/modules/vmsExpense/views/VmsBatchExpense.html',
                    resolve: app.resolve.VmsBatchExpenseController
                })
                .state("vms.batch.expense.details", {
                    url: '/details',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchExpenseDetailController',
                            controllerAs: 'vmsBatchExpenseDetails',
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsBatchExpenseDetail.html'
                        }
                    }
                })
                .state("vms.batch.expense.workflow", {
                    url: '/workflow',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchExpenseWorkflowController',
                            controllerAs: 'vm',
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsBatchExpenseWorkflow.html'
                        }
                    }
                })
                .state("vms.batch.discount", {
                    url: '/discount/processed/{vmsDiscountProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchDiscountController',
                    controllerAs: 'vmsBatchDiscount',
                    templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsBatchDiscount.html',
                    resolve: app.resolve.VmsBatchDiscountController
                })
                .state("vms.batch.discount.details", {
                    url: '/details',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchDiscountDetailController',
                            controllerAs: 'vmsBatchDiscountDetails',
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsBatchDiscountDetail.html'
                        }
                    }
                })
                .state("vms.batch.discount.workflow", {
                    url: '/workflow',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchDiscountWorkflowController',
                            controllerAs: 'vm',
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsBatchDiscountWorkflow.html'
                        }
                    }
                })



                .state("vms.batch.ussourcededuction", {
                    url: '/ussourcededuction/processed/{vmsUnitedStatesSourceDeductionProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchUnitedStatesSourceDeductionController',
                    controllerAs: 'vmsBatchUnitedStatesSourceDeduction',
                    templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsBatchUnitedStatesSourceDeduction.html',
                    resolve: app.resolve.VmsBatchUnitedStatesSourceDeductionController
                })
                .state("vms.batch.ussourcededuction.details", {
                    url: '/details',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchUnitedStatesSourceDeductionDetailController',
                            controllerAs: 'vmsBatchUnitedStatesSourceDeductionDetails',
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsBatchUnitedStatesSourceDeductionDetail.html'
                        }
                    }
                })
                .state("vms.batch.ussourcededuction.workflow", {
                    url: '/workflow',
                    views: {
                        'tabPanel': {
                            controller: 'VmsBatchUnitedStatesSourceDeductionWorkflowController',
                            controllerAs: 'vm',
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsBatchUnitedStatesSourceDeductionWorkflow.html'
                        }
                    }
                })


                .state("vms.batch.commission", {
                    url: '/commission/processed/{vmsCommissionProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchCommissionController',
                    controllerAs: 'vmsBatchCommission',
                    templateUrl: '/Phoenix/modules/vmsCommission/views/VmsBatchCommission.html',
                    resolve: app.resolve.VmsBatchCommissionController
                })
                    .state("vms.batch.commission.details", {
                        url: '/details',
                        views: {
                            'tabPanel': {
                                controller: 'VmsBatchCommissionDetailController',
                                controllerAs: 'vmsBatchCommissionDetails',
                                templateUrl: '/Phoenix/modules/vmsCommission/views/VmsBatchCommissionDetail.html'
                            }
                        }
                    })
                    .state("vms.batch.commission.workflow", {
                        url: '/workflow',
                        views: {
                            'tabPanel': {
                                controller: 'VmsBatchCommissionWorkflowController',
                                controllerAs: 'vm',
                                templateUrl: '/Phoenix/modules/vmsCommission/views/VmsBatchCommissionWorkflow.html'
                            }
                        }
                    })

                .state("vms.batch.fixedprice", {
                    url: '/fixedprice/processed/{vmsFixedPriceProcessedRecordId:[0-9]{1,}}',
                    controller: 'VmsBatchFixedPriceController',
                    controllerAs: 'vmsBatchFixedPrice',
                    templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsBatchFixedPrice.html',
                    resolve: app.resolve.VmsBatchFixedPriceController
                })
                    .state("vms.batch.fixedprice.details", {
                        url: '/details',
                        views: {
                            'tabPanel': {
                                controller: 'VmsBatchFixedPriceDetailController',
                                controllerAs: 'vmsBatchFixedPriceDetails',
                                templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsBatchFixedPriceDetail.html'
                            }
                        }
                    })
                    .state("vms.batch.fixedprice.workflow", {
                        url: '/workflow',
                        views: {
                            'tabPanel': {
                                controller: 'VmsBatchFixedPriceWorkflowController',
                                controllerAs: 'vm',
                                templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsBatchFixedPriceWorkflow.html'
                            }
                        }
                    })
            ;
        }
    ]);
})();