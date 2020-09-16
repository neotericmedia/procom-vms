(function () {
    'use strict';

    var controllerId = 'PaymentMethodController';
    angular.module('phoenix.payment.controllers').controller(controllerId, ['$rootScope', '$scope', '$stateParams', 'dialogs', '$state', '$timeout', '$q', 'common', 'NavigationService', 'CodeValueService', 'PaymentApiService', 'WorkflowApiService', 'OrgApiService', 'AssignmentApiService', 'phoenixsocket', PaymentMethodController]);
    function PaymentMethodController($rootScope, $scope, $stateParams, dialogs, $state, $timeout, $q, common, NavigationService, CodeValueService, PaymentApiService, WorkflowApiService, OrgApiService, AssignmentApiService, phoenixsocket) {

        common.setControllerName(controllerId);

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.isDisabled = true;

        $scope.model = {};
        $scope.tableState = {};
        $scope.loadItemsPromise = null;

        $scope.items = [];
        $scope.batchArray = [];
        $scope.bankAccounts = [];
        $scope.emptyMessageToShow = false;
        $scope.dateChangeMessage = "";
        $scope.list = {
            profileTypes: CodeValueService.getCodeValues(CodeValueGroups.ProfileType, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true)
        };

        $scope.list.profileTypes.push({
            id: null,
            text: 'N/A',
        });

        var organizationId = parseInt($stateParams.organizationId, 10);
        var currencyId = parseInt($stateParams.currencyId, 10);
        var methodId = parseInt($stateParams.methodId, 10);
        var statusId = parseInt($stateParams.statusId, 10);
        var dueId = parseInt($stateParams.dueId, 10);
        var changePaymentMethodId = methodId;
        $scope.isDue = dueId == 1;

        var currencyCode = CodeValueService.getCodeValue(currencyId, CodeValueGroups.Currency);
        var paymentMethod = CodeValueService.getCodeValue(methodId, CodeValueGroups.PaymentMethodType);
        $scope.model.currencyCode = currencyCode ? currencyCode.code : "";
        $scope.model.paymentMethod = paymentMethod ? paymentMethod.text : "";
        $scope.model.paymentMethodId = methodId;
        $scope.model.status = (statusId == ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing) ? "Pending Payment Processing" : "Pending Review";
        $scope.model.paymentTotal = 0;
        $scope.model.ValidationMessages = [];

        AssignmentApiService.getListOrganizationInternal().then(
            function (response) {
                var internalOrg = _.find(response, function (org) {
                    return org.Id === organizationId;
                });
                var header2 = (statusId == ApplicationConstants.PaymentTransactionStatus.OnHold) ? "On Hold" :
                    (statusId == ApplicationConstants.PaymentTransactionStatus.PendingReview) ? "Ready for review" : (dueId == 1) ? "Ready for release" : "Planned for release";
                
                NavigationService.setTitle('payments-pending',[internalOrg.DisplayName,$scope.model.currencyCode,$scope.model.paymentMethod,header2]);
            },
            function (error) {
                common.logError("Error retrieving internal organizations.");
            }
        );

        // Reloading data entry point
        $scope.callServer = function (tableState) {
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                $scope.currentPage = 1;
                isPaging = false;
            }
                // pagination
            else {
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;
            tableState.pagination.isDisabled = $scope.isDisabled;
            $scope.tableState = tableState;

            var paymentParams = oreq.request()
                .withExpand(['Units'])
                .withSelect([
                    'Id',
                    'PaymentTransactionNumber',
                    'PaymentTransactionPayeeName',
                    'PaymentSubtotal',
                    'PaymentSalesTax',
                    'PaymentTotal',
                    'PaymentDate',

                    'PayeeName',
                    'PayeeOrganizationIdSupplier',
                    'PayeeUserProfileWorkerId',

                    'PlannedReleaseDate',
                    'StartDate',
                    'EndDate',

                    'ClientCompany',
                    'WorkerName',
                    'WorkerProfileTypeId',
                    'Units',
                    'Units/Units',
                    'Units/RateUnitId',
                    'CurrencyId',
                    'WorkflowPendingTaskId',

                    //'WorkflowAvailableActions/WorkflowPendingTaskId',
                    //'WorkflowAvailableActions/Id',
                    //'WorkflowAvailableActions/Name',
                    //'WorkflowAvailableActions/Description',
                    //'WorkflowAvailableActions/PendingCommandName',
                    //'WorkflowAvailableActions/CommandName',
                    //'WorkflowAvailableActions/IsActionButton',
                    //'WorkflowAvailableActions/TaskRoutingDialogTypeId'
                ]).url();

            var promise = PaymentApiService.getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId(organizationId, currencyId, methodId, statusId, dueId, tableState, paymentParams)
               .then(function (response) {
                   angular.forEach(response.Items, function (item) {

                       if (item.Units) {
                           angular.forEach(item.Units, function (unit) {
                               if (unit.RateUnitId) {
                                   switch (unit.RateUnitId) {
                                       case 1:
                                           unit.RateUnit = ' Hours';
                                           break;
                                       case 2:
                                           unit.RateUnit = ' Days';
                                           break;
                                       case 3:
                                           unit.RateUnit = ' Fixed';
                                           break;
                                       default:
                                           unit.RateUnit = '';
                                           break;
                                   }
                               } else {
                                   unit.RateUnit = '';
                               }
                           });
                       }

                       item.unitsFormatted = $scope.formatUnits(item.Units);

                   });

                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = response.Items;
                   }

                   //$scope.isAnyActionAvailable = _.some($scope.items, function (item) {
                   //    return angular.isArray(item.WorkflowAvailableActions) && item.WorkflowAvailableActions.length !== 0;
                   //});
               });
            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        var onLoad = function () {

            OrgApiService.getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId).then(function (response) {
                if (response.BankAccounts !== null) {
                    var items = response.BankAccounts;
                    $scope.bankAccounts = _.chain(items).filter(function (ba) {
                        return ba.CurrencyId == currencyId;
                    }).map(function (value, key) {
                        return {
                            "id": value.Id,
                            "text": value.BankName,
                            "directDepositBatchNo": value.NextDirectDepositBatchNumber,
                            "wireTransferBatchNo": value.NextWireTransferBatchNumber,
                            "chequeNo": value.NextChequeNumber,
                            isPrimary: value.IsPrimary
                        };
                    }).value();
                    $scope.model.bankAccounts = angular.copy($scope.bankAccounts);
                }
            });

            $timeout(function () {
                if (typeof $scope.clearOldSelection !== 'undefined') {
                    $scope.clearOldSelection();
                }
            });

        };
        onLoad();

        $scope.formatUnits = function (units) {
            var value = [];
            angular.forEach(units, function (unit) {
                if (unit.Units) {
                    value.push(unit.Units + unit.RateUnit);
                }
            });
            var text = value.join(', ');
            var maxLength = 35;

            // Max 35 characters total
            if (text.length > maxLength) {
                text = text.slice(0, maxLength - 3) + "...";
            }
            return text;
        };

        $scope.bankClicked = function () {
            if ($scope.bankAccounts.length > 0)
                return;
            else {
                $scope.emptyBankListMessage = "*There are no Bank Accounts for " + currencyCode.code + " currency";
                $scope.emptyMessageToShow = true;
            }
        };

        $scope.selectAllEntities = function () {
            $scope.batchArray = $scope.items;
            updateTotal();
        };

        $scope.deselectAllEntities = function () {
            $scope.batchArray = [];
            updateTotal();
        };

        $scope.selectPayment = function (payment) {
            if (angular.element('#' + payment.Id).hasClass('st-selected')) {
                $scope.batchArray.push(payment);
            }
            else {
                $scope.batchArray = _.filter($scope.batchArray, function (p) {
                    return p.Id !== payment.Id;
                });
            }
            updateTotal();
        };

        var updateTotal = function () {
            $scope.model.paymentTotal = _.reduce($scope.batchArray, function (memo, number) {
                return memo + (number.PaymentTotal);
            }, 0);
        };

        var getTaskIdsToBatch = function () {
            var taskIdsToBatch = [];
            _.chain($scope.batchArray)
                //.map("WorkflowAvailableActions")
                .each(function (item) {
                    //taskIdsToBatch.push(item[0].WorkflowPendingTaskId);
                    taskIdsToBatch.push(item.WorkflowPendingTaskId);
                }).value();
            return taskIdsToBatch;
        };

        $scope.workflowBatchOperationOnTasks = {
            notifyName: {
                //NotifyNameOnBatchOperation:
                NotifyName_BatchOperation_OnException: '',
                NotifyName_BatchOperation_OnBatchMarkered: controllerId + 'NotifyName_BatchOperation_OnBatchMarkered',
                NotifyName_BatchOperation_OnPreExecutionException: controllerId + 'NotifyName_BatchOperation_OnPreExecutionException',
                NotifyName_BatchOperation_OnPreExecuted: '',
                NotifyName_BatchOperation_OnReleased: controllerId + 'NotifyName_BatchOperation_OnReleased',
                //NotifyNameOnBatchPreExecution:
                NotifyName_BatchPreExecution_OnReleased_DirectDeposit: controllerId + 'NotifyName_BatchPreExecution_OnReleased' + '_DirectDeposit',
                NotifyName_BatchPreExecution_OnReleased_WireTransfer: controllerId + 'NotifyName_BatchPreExecution_OnReleased' + '_WireTransfer',
                NotifyName_BatchPreExecution_OnReleased_Adp: controllerId + 'NotifyName_BatchPreExecution_OnReleased' + '_Adp',
                NotifyName_BatchPreExecution_OnReleased_Cheque: controllerId + 'NotifyName_BatchPreExecution_OnReleased' + '_Cheque',
                NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged: controllerId + 'NotifyName_BatchPreExecution_OnReleased' + '_PaymentMethodChanged',
                //NotifyNameOnBatchThreadExecution:
                NotifyName_BatchThreadExecution_OnReleased: controllerId + 'NotifyName_BatchThreadExecution_OnReleased'
            },

            //freezeScreenUntilBatchMarked: function () {
            //    var d = $q.defer();
            //    $scope.$on('$stateChangeStart', function () { d.resolve(); });
            //    $scope.loadItemsPromise = d.promise;
            //},

            transactionPaymentCreateBatch: function () {
                if ($scope.model.paymentMethodId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                    this.transactionPaymentCreateWireTransferBatch();
                } else if ($scope.model.paymentMethodId == ApplicationConstants.PaymentMethodType.ADP) {
                    this.transactionPaymentCreateADPBatch()
                }
                else {
                    var taskIdsToBatch = getTaskIdsToBatch();
                    var dialogConfig = {
                        title: "Create Direct Deposit Batch",
                        paymentMethodId: ApplicationConstants.PaymentMethodType.DirectDeposit,
                        amount: $scope.model.paymentTotal,
                        currency: currencyCode.code,
                        bankAccounts: $scope.bankAccounts,
                        taskIds: taskIdsToBatch
                    };
                    dialogs.create('/Phoenix/modules/payment/views/PaymentBatchDialog.html', 'PaymentBatchDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                        function (result) {
                            var action = result.action;
                            if (action == "create") {
                                //$scope.workflowBatchOperationOnTasks.freezeScreenUntilBatchMarked();
                                WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                    TaskIdsToBatch: result.taskIds,
                                    TaskResultId: ApplicationConstants.TaskResult.Complete,

                                    //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                    NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                    NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                    //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                    NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                    CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactions', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_DirectDeposit, BankId: result.bankId, DepositDate: result.date },
                                    CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsToPaymentsOnDirectDeposit', NotifyName_BatchThreadExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, BankId: result.bankId, DepositDate: result.date }
                                }).then(function (response) {
                                    $scope.batchArray = [];
                                    updateTotal();
                                });
                            }
                        },
                        function (result) {
                            $scope.batchArray = [];
                            updateTotal();
                        });
                }

            },

            transactionPaymentCreateWireTransferBatch: function () {
                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    title: "Create Wire Transfer Batch",
                    paymentMethodId: ApplicationConstants.PaymentMethodType.WireTransfer,
                    amount: $scope.model.paymentTotal,
                    currency: currencyCode.code,
                    bankAccounts: $scope.bankAccounts,
                    taskIds: taskIdsToBatch
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentBatchDialog.html', 'PaymentBatchDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                    function (result) {
                        var action = result.action;
                        if (action == "create") {
                            //$scope.workflowBatchOperationOnTasks.freezeScreenUntilBatchMarked();
                            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                TaskIdsToBatch: result.taskIds,
                                TaskResultId: ApplicationConstants.TaskResult.Complete,

                                //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactions', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_WireTransfer, BankId: result.bankId, DepositDate: result.date },
                                CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsToPaymentsOnWireTransfer', NotifyName_BatchThreadExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, BankId: result.bankId, DepositDate: result.date }
                            }).then(function (response) {
                                $scope.batchArray = [];
                                updateTotal();
                            });
                        }
                    },
                    function (result) {
                        $scope.batchArray = [];
                        updateTotal();
                    });
            },

            transactionPaymentCreateADPBatch: function () {
                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    title: "Create ADP Batch",
                    paymentMethodId: ApplicationConstants.PaymentMethodType.ADP,
                    amount: $scope.model.paymentTotal,
                    currency: currencyCode.code,
                    bankAccounts: null,
                    taskIds: taskIdsToBatch
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentBatchDialog.html', 'PaymentBatchDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                    function (result) {
                        var action = result.action;
                        if (action == "create") {
                            //$scope.workflowBatchOperationOnTasks.freezeScreenUntilBatchMarked();
                            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                TaskIdsToBatch: result.taskIds,
                                TaskResultId: ApplicationConstants.TaskResult.Complete,

                                //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactions', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_Adp, BankId: 0, DepositDate: result.date },
                                CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsToPaymentsOnADP', NotifyName_BatchThreadExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, BankId: null, DepositDate: result.date }
                            }).then(function (response) {
                                $scope.batchArray = [];
                                updateTotal();
                            });
                        }
                    },
                    function (result) {
                        $scope.batchArray = [];
                        updateTotal();
                    });
            },

            transactionPaymentChequesToPrint: function () {
                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    title: "Create Cheques Batch",
                    paymentMethodId: ApplicationConstants.PaymentMethodType.Cheque,
                    amount: $scope.model.paymentTotal,
                    currency: currencyCode.code,
                    bankAccounts: $scope.bankAccounts,
                    taskIds: taskIdsToBatch
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentBatchDialog.html', 'PaymentBatchDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                    function (result) {
                        var action = result.action;
                        if (action == "create") {
                            //$scope.workflowBatchOperationOnTasks.freezeScreenUntilBatchMarked();
                            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                TaskIdsToBatch: taskIdsToBatch,
                                TaskResultId: ApplicationConstants.TaskResult.Complete,

                                //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactions', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_Cheque, BankId: result.bankId }, 
                                CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsToPaymentsOnCheque', BankId: result.bankId }
                            }).then(function (response) {
                                $scope.batchArray = [];
                                updateTotal();
                            });
                        }
                    },
                    function (result) {
                        $scope.batchArray = [];
                        updateTotal();
                    });
            },

            transactionPaymentChangeReleaseDateOrPutOnHold: function () {
                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    paymentTransactionIds: taskIdsToBatch,
                    statusId: $stateParams.statusId,
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentChangeReleaseDateDialog.html', 'PaymentChangeReleaseDateDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "releaseDateWindow" }).result.then(
                    function (result) {
                        var action = result.action;
                        if (action == "change") {
                            $scope.dateChangeMessage = "Release Date(s) have been changed successfully";
                            if (!result.changeOrHold) {
                                $scope.dateChangeMessage = "Release Date(s) have been put on hold successfully";
                            }
                            var taskIdsToBatch = getTaskIdsToBatch();
                            if (result.changeOrHold) {
                                WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                    TaskIdsToBatch: taskIdsToBatch,//result.ids,
                                    TaskResultId: ApplicationConstants.TaskResult.Complete,

                                    //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                    NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                    NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                    //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                    NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                    CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactionsSetPlannedReleaseDate', WorkflowPendingTaskId: -1, PlannedReleaseDate: result.date },
                                    CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsSetPlannedReleaseDate', PlannedReleaseDate: result.date }
                                }).then(function (response) {
                                    $scope.batchArray = [];
                                    updateTotal();
                                });
                            }
                            else {
                                WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                    TaskIdsToBatch: taskIdsToBatch,//result.ids,
                                    TaskResultId: ApplicationConstants.TaskResult.Complete,

                                    //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                    NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                    NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                    NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                    NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                    CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactionsSetPlannedReleaseDateToNull', WorkflowPendingTaskId: -1 },
                                    CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsSetPlannedReleaseDateToNull' }
                                }).then(function (response) {
                                    $scope.batchArray = [];
                                    updateTotal();
                                });
                            }
                        }
                    },
                    function (result) {
                        $scope.batchArray = [];
                        updateTotal();
                    });
            },

            transactionPaymentSuppressRelease: function () {

                var dlg = dialogs.confirm('Suppress Release','Are you sure you want to suppress these payments?');
                dlg.result.then(function (btn) {
                    var taskIdsToBatch = getTaskIdsToBatch();
                    WorkflowApiService.workflowBatchOperationOnTasksSelected({
                        TaskIdsToBatch: taskIdsToBatch,
                        TaskResultId: ApplicationConstants.TaskResult.Complete,

                        //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                        NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                        NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                        //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                        NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                        CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactionsToPaymentsOnMarkPaid', WorkflowPendingTaskId: -1 }, CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionsToPaymentsOnMarkPaid' }
                    }).then(
                    function (response) {
                        $scope.batchArray = [];
                        updateTotal();
                    });
                }, function (btn) {
                    
                });                
            },

            transactionPaymentChangePaymentMethod: function () {
                
                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    title: "Change Payment Method",
                    taskIds: taskIdsToBatch,
                    methodId: methodId
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentMethodChangeDialog.html', 'PaymentMethodChangeDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                    function (result) {
                        var action = result.action;
                        if (action == "create") {
                            changePaymentMethodId = result.paymentMethodId;
                            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                TaskIdsToBatch: result.taskIds,
                                TaskResultId: ApplicationConstants.TaskResult.Complete,

                                NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentMethodChange', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged, PaymentMethodId: result.paymentMethodId },
                                CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentMethodChange', NotifyName_BatchThreadExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, PaymentMethodId: result.paymentMethodId }
                            }).then(function (response) {
                                $scope.batchArray = [];
                                updateTotal();
                            });
                        }
                    },
                    function (result) {
                        $scope.batchArray = [];
                        updateTotal();
                    });

            },
        };

        var reloadPageOnPrivateEvent = function (data, toCallServer, message) {
            $scope.loadItemsPromise = null;
            var newLine = '<br/>';

            if (message !== null && typeof data.CountAll !== 'undefined' && data.CountAll !== null && typeof data.CountExecutionSuccess !== 'undefined' && data.CountExecutionSuccess !== null) {
                if (data.CountExecutionSuccess > 0) {
                    message = message + newLine + data.CountExecutionSuccess + ' of ' + data.CountAll + ' items processed';
                }

                if (data.CountAll - data.CountExecutionSuccess > 0) {
                    message = message + newLine + (data.CountAll - data.CountExecutionSuccess) + ' of ' + data.CountAll + ' items not processed';
                }

                if (data.CountAll === data.CountExecutionSuccess) {
                    common.logSuccess(message);
                }
                else {
                    common.logError(message);
                }
            }

            if (typeof data.ValidationMessages !== 'undefined' && !common.isEmptyObject(data.ValidationMessages)) {
                $scope.model.ValidationMessages = data.ValidationMessages;
            }
            $scope.batchArray = [];
            if (typeof $scope.clearOldSelection !== 'undefined') {
                $scope.clearOldSelection();
            }
            if (toCallServer) {
                $scope.model.ValidationMessages = [];
                //$state.reload();
                //$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
                //Do NOT use $state.reload() or $state.transitionTo because it will erase notify events by 'unregisterFunctionList' on $destroy
                $scope.callServer($scope.tableState);
            }
        };

        var unregisterFunctionList = [];
        $scope.$on('$destroy', function () {
            if (unregisterFunctionList && unregisterFunctionList.length) {
                for (var i = 0; i < unregisterFunctionList.length; i++) {
                    if (typeof unregisterFunctionList[i] === 'function') {
                        unregisterFunctionList[i]();
                    }
                }
            }
        });

        //  Notifications for BatchOperation
        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException, function (event, data) {
            reloadPageOnPrivateEvent(data, true, 'Exception');
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered, function (event, data) {
            reloadPageOnPrivateEvent(data, true, null);//'On batch initialize:'
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException, function (event, data) {
            reloadPageOnPrivateEvent(data, true, 'On batch pre-validation:');
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted, function (event, data) {
            reloadPageOnPrivateEvent(data, false);
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased, function (event, data) {
            reloadPageOnPrivateEvent(data, false, data.CountAll !== data.CountExecutionSuccess ? 'Some items cannot be processed:' : null);
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        //  Notifications for BatchPreExecution
        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_DirectDeposit, function (event, data) {
            $scope.loadItemsPromise = null;
            $scope.batchArray = [];
            dialogs.create('/Phoenix/modules/payment/views/PaymentBatchGroupedByPayeeDialog.html', 'PaymentBatchGroupedByPayeeDialogController', { validationEventData: data, bankAccounts: $scope.bankAccounts, isNotifyEventsSet: true }, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                function (result) {
                    if (result.action == "ok") {
                        reloadPageOnPrivateEvent(data, true);
                    }
                });
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_WireTransfer, function (event, data) {
            $scope.loadItemsPromise = null;
            $scope.batchArray = [];
            dialogs.create('/Phoenix/modules/payment/views/PaymentBatchGroupedByPayeeDialog.html', 'PaymentBatchGroupedByPayeeDialogController', { validationEventData: data, bankAccounts: $scope.bankAccounts, isNotifyEventsSet: true }, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                function (result) {
                    if (result.action == "ok") {
                        reloadPageOnPrivateEvent(data, true);
                    }
                });
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_Cheque, function (event, data) {
            $scope.loadItemsPromise = null;
            $scope.batchArray = [];
            dialogs.create('/Phoenix/modules/payment/views/PaymentBatchGroupedByPayeeDialog.html', 'PaymentBatchGroupedByPayeeDialogController', { validationEventData: data, bankAccounts: $scope.bankAccounts, isNotifyEventsSet: true }, { key: false, back: 'static', windowClass: "paymentBatchWindow" }).result.then(
                function (result) {
                    if (result.action == "ok") {
                        reloadPageOnPrivateEvent(data, true);
                    }
                });
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged, function (event, data) {
            $scope.loadItemsPromise = null;
            $scope.batchArray = [];
            dialogs.create('/Phoenix/modules/payment/views/PaymentMethodBatchGroupedByPayeeDialog.html', 'PaymentMethodBatchGroupedByPayeeDialogController', { validationEventData: data, paymentMethodId: changePaymentMethodId }, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                function (result) {
                    if (result.action == "ok") {
                        reloadPageOnPrivateEvent(data, true);
                    }
                });
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

        //  Notifications for BatchThreadExecution
        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, function (event, data) {
            common.logSuccess('Batch completed. To manage batch, go to the Manage Direct Deposit page');
            //    $scope.batchArray = [];
            //    if (data && data.TargetEntityTypeId == ApplicationConstants.EntityType.PaymentReleaseBatch) {
            //        common.logSuccess("Redirecting to Direct Deposit batch management page");
            //        $state.transitionTo('payment.directdepositbatch.management', { batchId: data.TargetEntityId });
            //    }
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });
    }
})();