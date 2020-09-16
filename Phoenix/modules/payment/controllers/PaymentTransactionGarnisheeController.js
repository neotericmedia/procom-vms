(function () {
    'use strict';

    var controllerId = 'PaymentTransactionGarnisheeController';
    angular.module('phoenix.payment.controllers').controller(controllerId, ['$rootScope', '$scope', '$stateParams', 'dialogs', '$state', '$timeout', 'common', 'NavigationService', 'CodeValueService', 'PaymentApiService', 'WorkflowApiService', 'OrgApiService', 'phoenixsocket', PaymentTransactionGarnisheeController]);
    function PaymentTransactionGarnisheeController($rootScope, $scope, $stateParams, dialogs, $state, $timeout, common, NavigationService, CodeValueService, PaymentApiService, WorkflowApiService, OrgApiService, phoenixsocket) {
        common.setControllerName(controllerId);

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.isDisabled = true;
        $scope.pageCount = 1;

        $scope.tableState = {};
        $scope.loadItemsPromise = null;

        $scope.items = [];
        $scope.batchArray = [];
        $scope.bankAccounts = [];
        $scope.emptyMessageToShow = false;
        $scope.dateChangeMessage = '';

        $scope.model = {};
        $scope.model.currencyCode = CodeValueService.getCodeValue($stateParams.currencyId, CodeValueGroups.Currency).code;
        $scope.model.isReadyToRelease = $stateParams.isReadyToRelease;
        $scope.model.amountTotal = 0;
        $scope.model.ValidationMessages = [];
        var header = $stateParams.isReadyToRelease == 1 ? 'Ready for release' : 'Planned for release';
        // NavigationService.setTitle('PCGL - ' + $scope.model.currencyCode + ' - ' + (($stateParams.isReadyToRelease == 1) ? 'Payments ready for release' : 'Payments planned for release'), 'icon icon-payment');
        var pageTitle = ($stateParams.isReadyToRelease == 1) ? 'payments-garnishee-ready' : 'payments-garnishee-planned';
        NavigationService.setTitle(pageTitle);
        // Reloading data entry point
        $scope.callServer = function (tableState) {
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element('table[data-st-table="items"] tbody').scrollTop(0);
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

            var oDataParams =
                oreq.request()
                .withSelect([
                    'GarnisheeId',
                    'PaymentTransactionGarnisheId',
                    'WorkflowPendingTaskId',
                    //'IsReadyToRelease',
                    //'OrganizationIdInternal',
                    'InternalOrganizationLegalName',
                    'GarnisheePayeeName',
                    //'GarnisheeOrganizationIdSupplier',
                    //'GarnisheeUserProfileWorkerId',
                    'GarnisheePayToName',
                    //'GarnisheePayToType',
                    //'GarnisheePayToId',
                    'Amount',
                    //'CurrencyId',
                    //'PaymentTransactionId',
                    'PaymentTransactionNumber',
                ]).url();

            var promise = PaymentApiService.getPaymentTransactionGarnishees($stateParams.organizationIdInternal, $stateParams.currencyId, $stateParams.isReadyToRelease, tableState, oDataParams).then(
               function (responseSuccess) {
                   if (responseSuccess.Items.length > 0) {
                          NavigationService.setTitle('payments-pendinggarnishee',
                         [responseSuccess.Items[0].InternalOrganizationLegalName, $scope.model.currencyCode, header]);
                   }
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(responseSuccess.Items);
                       $scope.totalItemCount = responseSuccess.Count;
                   } else {
                       $scope.totalItemCount = responseSuccess.Count;
                       $scope.items = responseSuccess.Items;
                   }
                   NavigationService.setTitle(pageTitle, [($scope.items[0] && $scope.items[0].InternalOrganizationLegalName), $scope.model.currencyCode]);
               }, function (responseError) {
                   var e = responseError;
               });
            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        $scope.selectAllEntities = function () {
            $scope.batchArray = $scope.items;
            $scope.model.amountTotal = _.reduce($scope.batchArray, function (memo, number) {
                return memo + (number.Amount);
            }, 0);
        };

        $scope.deselectAllEntities = function () {
            $scope.batchArray = [];
            $scope.model.amountTotal = _.reduce($scope.batchArray, function (memo, number) {
                return memo + (number.Amount);
            }, 0);
        };

        $scope.selectPayment = function (payment) {
            var isPaymentAlreadySelected = false;
            for (var j = 0; j < $scope.batchArray.length; j++) {
                if ($scope.batchArray[j].PaymentTransactionGarnisheId == payment.PaymentTransactionGarnisheId) {
                    isPaymentAlreadySelected = true;
                }
            }

            if (!isPaymentAlreadySelected) {
                $scope.batchArray.push(payment);
            }
            else {
                $scope.batchArray = _.filter($scope.batchArray, function (p) {
                    return p.PaymentTransactionGarnisheId !== payment.PaymentTransactionGarnisheId;
                });
            }
            $scope.model.amountTotal = _.reduce($scope.batchArray, function (memo, number) {
                return memo + (number.Amount);
            }, 0);
        };

        var onLoad = function () {
            OrgApiService.getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization($stateParams.organizationIdInternal).then(function (response) {
                if (response.BankAccounts !== null) {
                    var items = response.BankAccounts;
                    $scope.bankAccounts = _.chain(items).filter(function (ba) {
                        return ba.CurrencyId == $stateParams.currencyId;
                    }).map(function (value, key) {
                        return {
                            'id': value.Id, 'text': value.BankName, 'directDepositBatchNo': value.NexDirectDepositBatchNumber, 'wireTransferBatchNo': value.NexWireTransferBatchNumber, 'chequeNo': value.NextChequeNumber, isPrimary: value.IsPrimary
                        };
                    }).value();
                    $scope.model.bankAccounts = angular.copy($scope.bankAccounts);
                }
            });

            if (typeof $scope.clearOldSelection !== 'undefined') {
                $scope.clearOldSelection();
            }
        };

        onLoad();

        $scope.workflowBatchOperationOnTasks = {
            notifyName: {
                ////NotifyNameOnBatchOperation:
                //NotifyName_BatchOperation_OnException: '',
                NotifyName_BatchOperation_OnBatchMarkered: controllerId + 'NotifyName_BatchOperation_OnBatchMarkered',
                NotifyName_BatchOperation_OnPreExecutionException: controllerId + 'NotifyName_BatchOperation_OnPreExecutionException',
                //NotifyName_BatchOperation_OnPreExecuted: '',
                NotifyName_BatchOperation_OnReleased: controllerId + 'NotifyName_BatchOperation_OnReleased',
                ////NotifyNameOnBatchPreExecution:
                NotifyName_BatchPreExecution_OnReleased: controllerId + 'NotifyName_BatchPreExecution_OnReleased',
                ////NotifyNameOnBatchThreadExecution:
                NotifyName_BatchThreadExecution_OnReleased: controllerId + 'NotifyName_BatchThreadExecution_OnReleased',
            },

            paymentTransactionGarnisheeCreateBatch: function () {

                var getTaskIdsToBatch = function () {
                    var taskIdsToBatch = [];
                    //_.chain($scope.batchArray).map('WorkflowAvailableActions').each(function (item) {
                    //    taskIdsToBatch.push(item[0].WorkflowPendingTaskId);
                    //}).value();
                    _.chain($scope.batchArray).each(function (item) {
                        taskIdsToBatch.push(item.WorkflowPendingTaskId);
                    }).value();
                    return taskIdsToBatch;
                };

                var taskIdsToBatch = getTaskIdsToBatch();
                var dialogConfig = {
                    title: 'Create Garnishee Batch',
                    amount: $scope.model.amountTotal,
                    currency: $scope.model.currencyCode,
                    bankAccounts: $scope.bankAccounts,
                    taskIds: taskIdsToBatch
                };
                dialogs.create('/Phoenix/modules/payment/views/PaymentTransactionGarnisheeBatchDialog.html', 'PaymentTransactionGarnisheeBatchDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: 'paymentBatchWindow' })
                    .result.then(function (result) {
                        var action = result.action;
                        if (action == 'create') {
                            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                                TaskIdsToBatch: result.taskIds,
                                TaskResultId: ApplicationConstants.TaskResult.Complete,

                                //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                                NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                                NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                                //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                                NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnPaymentTransactionGarnisheesToPayments', WorkflowPendingTaskId: -1, ToSendNotifyOnPreExecutionNotValidResult: true, NotifyName_BatchPreExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased, BankId: result.bankId },
                                CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionGarnisheesToPayments', NotifyName_BatchThreadExecution_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, BankId: result.bankId }
                            }).then(
                            function (responseSuccess) {
                                $scope.batchArray = [];
                            },
                            function (responseError) {
                                $scope.batchArray = [];
                            });
                        }
                    }, function (result) {
                        $scope.batchArray = [];
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
            reloadPageOnPrivateEvent(data, false, data.CountAll !== data.CountExecutionSuccess ? 'Some items cannot be processed:' : 'Batch created successfully');
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });
        //  Notifications for BatchPreExecution
        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchPreExecution_OnReleased, function (event, data) {
            dialogs.create('/Phoenix/modules/payment/views/PaymentTransactionGarnisheeBatchGroupedDialog.html', 'PaymentTransactionGarnisheeBatchGroupedDialogController', { validationEventData: data, bankAccounts: $scope.bankAccounts, isNotifyEventsSet: true }, { key: false, back: 'static', windowClass: 'paymentBatchWindow' })
                .result.then(function (result) {
                    if (result.action == "ok") {
                        reloadPageOnPrivateEvent(data, true);
                    }
                    //var action = result.action;
                    //if (action == 'create') {
                    //    WorkflowApiService.workflowBatchOperationOnTasksSelected({
                    //        TaskIdsToBatch: result.taskIds,
                    //        TaskResultId: ApplicationConstants.TaskResult.Complete,

                    //        //NotifyName_BatchOperation_OnException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnException,
                    //        NotifyName_BatchOperation_OnBatchMarkered: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                    //        NotifyName_BatchOperation_OnPreExecutionException: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
                    //        //NotifyName_BatchOperation_OnPreExecuted: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnPreExecuted,
                    //        NotifyName_BatchOperation_OnReleased: $scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnReleased,

                    //        CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnPaymentTransactionGarnisheesToPayments', BankId: result.bankId }
                    //    }).then(function (response) { });
                    //}
                });
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });
        //  Notifications for BatchThreadExecution
        phoenixsocket.onPrivate($scope.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchThreadExecution_OnReleased, function (event, data) {
            //common.logSuccess('Batch completed. To manage batch, go to the Manage Direct Deposit page');
            if (data && data.TargetEntityTypeId == ApplicationConstants.EntityType.PaymentReleaseBatch) {
                common.logSuccess('Redirecting to Direct Deposit batch management page');
                $state.transitionTo('payment.directdepositbatch.management', { batchId: data.TargetEntityId });
            }
        }).then(function (unregister) { if (unregister) { unregisterFunctionList.push(unregister); } });

    }
})();