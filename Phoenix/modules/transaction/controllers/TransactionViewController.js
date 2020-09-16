(function (app) {
    'use strict';

    var controllerId = 'TransactionViewController';


    angular.module('phoenix.transaction.controllers').controller(controllerId,
        ['$scope', '$state', '$stateParams', 'dialogs', 'common', 'commonDataService', 'transactionHeader', 'CodeValueService', 'TimesheetApiService', 'TransactionViewService', 'ProfileApiService', 'DocumentApiService', 'TransactionApiService', 'WorkflowApiService', 'phoenixsocket', 'NavigationService', 'phoenixapi', TransactionViewController]);

    function TransactionViewController($scope, $state, $stateParams, dialogs, common, commonDataService, transactionHeader, CodeValueService, TimesheetApiService, TransactionViewService, ProfileApiService, DocumentApiService, TransactionApiService, WorkflowApiService, phoenixsocket, NavigationService, PhoenixApiService) {

        NavigationService.setTitle('transaction-viewedit', [transactionHeader.TransactionNumber]);

        $scope.unregisterFunctionList = [];

        $scope.viewLoading = true;
        common.setControllerName(controllerId);
        var $q = common.$q;
        var $timeout = common.$timeout;

        $scope.loadItemsPromise = null;

        $scope.showDetailType = {
            SalesTaxTotal: 'SalesTaxTotal',
            SalesTaxLine: 'SalesTaxLine'
        };

        $scope.lists = {
            transactionCategoryList: [],
            RateUnits: [],
            sourceDeductionTypeList: [],
            rateTypes: []
        };

        $scope.model = {
            allTimesheets: [],
            transactionHeader: transactionHeader,
            timesheet: {},
            ValidationMessages: [],
            worker: {},
            transactionCalculation: {},
            cultureId: 48,
            changeHistoryBlackList: [{
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'IsDraft'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'IsDeleted'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'SourceId'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'Id'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'Metadata'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'LastModifiedByProfileId'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'LastModifiedDatetime'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'CreatedByProfileId'
                },
                {
                    TableSchemaName: '',
                    TableName: '',
                    ColumnName: 'CreatedDatetime'
                }
            ],
            ARStatuses: CodeValueService.getCodeValues(CodeValueGroups.ARStatus)

        };

        if ($scope.model.transactionHeader.TransactionHeaderStatusId == ApplicationConstants.TransactionHeaderStatus.Draft) {
            $state.transitionTo('transaction.manual.detail', {
                transactionHeaderId: $stateParams.transactionHeaderId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        }

        var transactionTypeCodeValue = CodeValueService.getCodeValue($scope.model.transactionHeader.TransactionTypeId, CodeValueGroups.TransactionType);
        $scope.model.transactionHeader.transactionType = transactionTypeCodeValue && transactionTypeCodeValue.text;

        function onResponseSuccesWatchWorkflowEvent(transactionHeaderId, stateNameGo, successMessage) {
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'transaction.view', ApplicationConstants.EntityType.TransactionHeader, ApplicationConstants.EntityType.TransactionHeader, transactionHeaderId, {
                transactionHeaderId: transactionHeaderId
            });
        }

        function onResponseSuccessStateGo(transactionHeaderId, stateNameGo, successMessage) {
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            $state.transitionTo(stateNameGo, {
                transactionHeaderId: transactionHeaderId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        }

        function onResponseError(responseError) {
            $scope.workflow.runningStatus.IsRunning = false;
            $scope.model.transactionHeader.workflow.SelectedActionId = null;
            $scope.workflow.getWorkflowActions($scope.model.transactionHeader);
            $scope.model.ValidationMessages = common.responseErrorMessages(responseError);
        }

        $scope.actionReverseTransaction = function (stateActionId) {
            var currentStateAction = CodeValueService.getCodeValue(stateActionId, CodeValueGroups.StateAction);
            if (currentStateAction.code == 'TransactionHeaderActionReverseAction' ||
                currentStateAction.code == 'TransactionHeaderActionReverseTimeSheetUnsubmitAction' ||
                currentStateAction.code == 'TransactionHeaderActionReverseTimeSheetReturnToExceptionAction' ||
                currentStateAction.code == 'TransactionHeaderActionReverseAndUnsubmitExpenseClaimAction' ||
                currentStateAction.code == 'TransactionHeaderActionReverseAndReturnExpenseClaimToExceptionAction'
            ) {
                var transactionReverseDialogConfig = {
                    title: currentStateAction.text,
                    header: 'Enter the reversal reason:',
                    commentHeader: 'Reversal Message',
                    buttonNameForCancel: 'Cancel',
                    buttonNameForSave: 'Reverse Transaction',
                    reverseReasonOptions: CodeValueService.getCodeValues(CodeValueGroups.TransactionHeaderReversalReason, true)
                };
                dialogs.create('/Phoenix/modules/transaction/views/View/DialogTransactionReverse.html', 'TransactionReverseDialogController', transactionReverseDialogConfig, {
                    keyboard: false,
                    backdrop: 'static'
                }).result.then(function (resultModel) {
                    var dialogResult = 'Confirmed';
                    var reverseReasonText = _.find(transactionReverseDialogConfig.reverseReasonOptions, function (reason) {
                        return (reason.id == resultModel.reverseReasonId);
                    }).text;
                    var comments = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + resultModel.comment;
                    PhoenixApiService.command({
                        CommandName: currentStateAction.code.replace(/Action$/, 'State'),
                        EntityIds: [$stateParams.transactionHeaderId],
                        EntityTypeId: ApplicationConstants.EntityType.TransactionHeader,
                        Comment: comments
                    }).then(
                        function (responseSuccess) {
                            onResponseSuccessStateGo($stateParams.transactionHeaderId, 'transaction.view.summary', 'Transaction Reversed');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }, function (resultModel) {
                    var dialogResult = 'Not Confirmed';
                    $scope.model.transactionHeader.workflow.SelectedActionId = null;
                });
            } else if (currentStateAction.code == 'TransactionHeaderActionReverseAdvanceAction') {
                dialogs.confirm('Reverse Advance Transaction', 'This "Advance" Transaction will be Reversed. Continue?').result.then(function (btn) {
                    var result = 'Confirmed';
                    PhoenixApiService.command({
                        CommandName: currentStateAction.code.replace(/Action$/, 'State'),
                        EntityIds: [$stateParams.transactionHeaderId],
                        EntityTypeId: ApplicationConstants.EntityType.TransactionHeader,
                        Comment: resultModel.comment
                    }).then(
                        function (responseSucces) {
                            onResponseSuccessStateGo($stateParams.transactionHeaderId, 'transaction.view.summary', 'Transaction Reversed');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }, function (btn) {
                    var result = 'Not Confirmed';
                    $scope.model.transactionHeader.workflow.SelectedActionId = null;
                });
            } else if (currentStateAction.code == 'TransactionHeaderActionReverseAdjustmentAction') {
                var transactionReverseDialogConfigAdjustment = {
                    title: currentStateAction.text,
                    header: 'Enter the reversal reason:',
                    commentHeader: 'Reversal Message',
                    buttonNameForCancel: 'Cancel',
                    buttonNameForSave: 'Reverse Transaction',
                    reverseReasonOptions: [{
                        id: 7,
                        text: 'Incorrect Tax'
                    }, {
                        id: 8,
                        text: 'Incorrect PO'
                    }, {
                        id: 9,
                        text: 'Incorrect Payroll Burden'
                    }]
                };
                dialogs.create('/Phoenix/modules/transaction/views/View/DialogTransactionReverse.html', 'TransactionReverseDialogController', transactionReverseDialogConfigAdjustment, {
                    keyboard: false,
                    backdrop: 'static'
                }).result.then(function (resultModel) {
                    var dialogResult = 'Confirmed';
                    var reverseReasonText = _.find(transactionReverseDialogConfigAdjustment.reverseReasonOptions, function (reason) {
                        return (reason.id == resultModel.reverseReasonId);
                    }).text;
                    var comments = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + resultModel.comment;
                    PhoenixApiService.command({
                        CommandName: currentStateAction.code.replace(/Action$/, 'State'),
                        EntityIds: [$stateParams.transactionHeaderId],
                        EntityTypeId: ApplicationConstants.EntityType.TransactionHeader,
                        Comment: comments
                    }).then(
                        function (responseSucces) {
                            onResponseSuccessStateGo($stateParams.transactionHeaderId, 'transaction.view.summary', 'Transaction Reversed');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }, function (resultModel) {
                    var dialogResult = 'Not Confirmed';
                    $scope.model.transactionHeader.workflow.SelectedActionId = null;
                });
            }
        }

        $scope.workflow = {

            onLoad: function (action) {
                var self = this;
                $scope.model.transactionHeader.workflow = {
                    WorkflowAvailableActions: [],
                    SelectedActionId: null
                };
                angular.forEach($scope.model.transactionHeader.BillingTransactions, function (billingTransaction) {
                    billingTransaction.workflow = {
                        WorkflowAvailableActions: [],
                        SelectedActionId: null
                    };
                });
            },

            runningStatus: {
                IsRunning: false,
            },

            actionButtonOnClickTransactionHeader: function (action) {
                var self = this;
                if (action.CommandName == 'TransactionHeaderActionReverse' ||
                    action.CommandName == 'TransactionHeaderActionReverseTimeSheetUnsubmit' ||
                    action.CommandName == 'TransactionHeaderActionReverseTimeSheetReturnToException' ||
                    action.CommandName == 'TransactionHeaderActionReverseAndUnsubmitExpenseClaim' ||
                    action.CommandName == 'TransactionHeaderActionReverseAndReturnExpenseClaimToException'
                ) {
                    var transactionReverseDialogConfig = {
                        title: action.Name,
                        header: 'Enter the reversal reason:',
                        commentHeader: 'Reversal Message',
                        buttonNameForCancel: 'Cancel',
                        buttonNameForSave: 'Reverse Transaction',
                        reverseReasonOptions: CodeValueService.getCodeValues(CodeValueGroups.TransactionHeaderReversalReason, true)
                    };
                    dialogs.create('/Phoenix/modules/transaction/views/View/DialogTransactionReverse.html', 'TransactionReverseDialogController', transactionReverseDialogConfig, {
                        keyboard: false,
                        backdrop: 'static'
                    }).result.then(function (resultModel) {
                        var dialogResult = 'Confirmed';
                        var reverseReasonText = _.find(transactionReverseDialogConfig.reverseReasonOptions, function (reason) {
                            return (reason.id == resultModel.reverseReasonId);
                        }).text;
                        action.Comments = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + resultModel.comment;
                        self.runningStatus.IsRunning = true;
                        WorkflowApiService.executeCommand({
                            CommandName: action.CommandName,
                            WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId,
                            TransactionHeaderId: $stateParams.transactionHeaderId,
                            Comment: action.Comments
                        }).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.view.summary', 'Transaction Reversed');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (resultModel) {
                        var dialogResult = 'Not Confirmed';
                        $scope.model.transactionHeader.workflow.SelectedActionId = null;
                    });
                } else if (action.CommandName == 'TransactionHeaderActionReverseAdvance') {
                    dialogs.confirm('Reverse Advance Transaction', 'This "Advance" Transaction will be Reversed. Continue?').result.then(function (btn) {
                        var result = 'Confirmed';
                        WorkflowApiService.executeCommand({
                            CommandName: action.CommandName,
                            WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId,
                            TransactionHeaderId: $stateParams.transactionHeaderId,
                            Comment: action.Comments
                        }).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.view.summary', 'Transaction Reversed');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (btn) {
                        var result = 'Not Confirmed';
                        $scope.model.transactionHeader.workflow.SelectedActionId = null;
                    });
                } else if (action.CommandName == 'TransactionHeaderActionReverseAdjustment') {
                    var transactionReverseDialogConfigAdjustment = {
                        title: action.Name,
                        header: 'Enter the reversal reason:',
                        commentHeader: 'Reversal Message',
                        buttonNameForCancel: 'Cancel',
                        buttonNameForSave: 'Reverse Transaction',
                        reverseReasonOptions: [{
                            id: 7,
                            text: 'Incorrect Tax'
                        }, {
                            id: 8,
                            text: 'Incorrect PO'
                        }, {
                            id: 9,
                            text: 'Incorrect Payroll Burden'
                        }]
                    };
                    dialogs.create('/Phoenix/modules/transaction/views/View/DialogTransactionReverse.html', 'TransactionReverseDialogController', transactionReverseDialogConfigAdjustment, {
                        keyboard: false,
                        backdrop: 'static'
                    }).result.then(function (resultModel) {
                        var dialogResult = 'Confirmed';
                        var reverseReasonText = _.find(transactionReverseDialogConfigAdjustment.reverseReasonOptions, function (reason) {
                            return (reason.id == resultModel.reverseReasonId);
                        }).text;
                        action.Comments = 'Reversal Reason: ' + reverseReasonText + '\n Message: ' + resultModel.comment;
                        self.runningStatus.IsRunning = true;
                        WorkflowApiService.executeCommand({
                            CommandName: action.CommandName,
                            WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId,
                            TransactionHeaderId: $stateParams.transactionHeaderId,
                            Comment: action.Comments
                        }).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.view.summary', 'Transaction Reversed');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (resultModel) {
                        var dialogResult = 'Not Confirmed';
                        $scope.model.transactionHeader.workflow.SelectedActionId = null;
                    });
                }
            },

            getWorkflowActions: function (transactionHeader) {
                var self = this;
                var promises = [];
                promises.push(self.getTransactionHeaderAvailableActions(transactionHeader));
                return $q.all(promises);
            },

            getTransactionHeaderAvailableActions: function (transactionHeader) {
                var self = this;
                transactionHeader.workflow = {
                    WorkflowAvailableActions: [],
                    SelectedActionId: null
                };
                var deferred = $q.defer();
                if (transactionHeader !== null && transactionHeader.Id > 0) {
                    WorkflowApiService.getTasksAvailableActionsByTargetEntity(ApplicationConstants.EntityType.TransactionHeader, transactionHeader.Id).then(
                        function (responseSucces) {
                            if (responseSucces instanceof Array && responseSucces.length > 0) {

                                angular.forEach(responseSucces, function (workflowTask) {
                                    transactionHeader.workflow.WorkflowAvailableActions = [];
                                    angular.forEach(workflowTask.WorkflowAvailableActions, function (action) {

                                        //  get list of transactionHeader.workflow.WorkflowAvailableActions
                                        if (action.CommandName == 'TransactionHeaderActionReverse' ||
                                            action.CommandName == 'TransactionHeaderActionReverseTimeSheetUnsubmit' ||
                                            action.CommandName == 'TransactionHeaderActionReverseTimeSheetReturnToException' ||
                                            action.CommandName == 'TransactionHeaderActionReverseAndUnsubmitExpenseClaim' ||
                                            action.CommandName == 'TransactionHeaderActionReverseAndReturnExpenseClaimToException' ||
                                            action.CommandName == 'TransactionHeaderActionReverseAdvance' ||
                                            action.CommandName == 'TransactionHeaderActionReverseAdjustment') {
                                            transactionHeader.workflow.WorkflowAvailableActions.push(action);
                                        }

                                        //  only if it is Event of current User 
                                        var watchConfigOnWorkflowEvent = commonDataService.getWatchConfigOnWorkflowEvent();
                                        if (watchConfigOnWorkflowEvent.groupingEntityTypeId == ApplicationConstants.EntityType.TransactionHeader &&
                                            watchConfigOnWorkflowEvent.targetEntityTypeId == ApplicationConstants.EntityType.TransactionHeader &&
                                            watchConfigOnWorkflowEvent.targetEntityId == $stateParams.transactionHeaderId) {
                                            if (action.CommandName == 'TransactionHeaderOnReversedNotification') {
                                                commonDataService.eraseWatchConfigOnWorkflowEvent();
                                                var transactionHeaderReverseNotificationDialog = dialogs.create(
                                                    '/Phoenix/modules/transaction/views/View/DialogTransactionReverseNotification.html',
                                                    'TransactionReverseNotificationDialogController', {
                                                        transactionHeader: $scope.model.transactionHeader,
                                                        worker: $scope.model.worker,
                                                        admin: $scope.model.admin,
                                                        message: workflowTask.Comments.length > 0 ? workflowTask.Comments[0] : '',
                                                    }, {
                                                        keyboard: false,
                                                        backdrop: 'static',
                                                        windowClass: 'feedbackDialog'
                                                    });
                                                transactionHeaderReverseNotificationDialog.result.then(function (resultModel) {
                                                    var dialogResult = 'Confirmed';
                                                    TransactionApiService.transactionHeaderOnReversedNotification({
                                                        TransactionHeaderId: transactionHeader.Id,
                                                        EmailTo: resultModel.emailTo,
                                                        EmailCc: resultModel.emailCc,
                                                        MessageSubject: resultModel.messageSubject,
                                                        MessageBody: resultModel.messageBody.replace(/\n/g, '<br/>')
                                                    }).then(function (response) {});
                                                    self.runningStatus.IsRunning = true;
                                                    commonDataService.setWatchConfigOnWorkflowEvent('transaction.view.summary', 'transaction.view', ApplicationConstants.EntityType.TransactionHeader, ApplicationConstants.EntityType.TransactionHeader, transactionHeader.Id, {
                                                        transactionHeaderId: transactionHeader.Id
                                                    });
                                                }, function (resultModel) {
                                                    var dialogResult = 'Not Confirmed';
                                                    TransactionApiService.transactionHeaderOnReversedNoNotification({
                                                        TransactionHeaderId: transactionHeader.Id
                                                    }).then(function (response) {});
                                                    self.runningStatus.IsRunning = true;
                                                    commonDataService.setWatchConfigOnWorkflowEvent('transaction.view.summary', 'transaction.view', ApplicationConstants.EntityType.TransactionHeader, ApplicationConstants.EntityType.TransactionHeader, transactionHeader.Id, {
                                                        transactionHeaderId: transactionHeader.Id
                                                    });
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                            deferred.resolve(responseSucces);
                        },
                        function (responseError) {
                            deferred.reject(responseError);
                        });
                }
                return deferred.promise;
            }
        };

        $scope.$on('$destroy', function () {
            if ($scope.unregisterFunctionList && $scope.unregisterFunctionList.length) {
                for (var i = 0; i < $scope.unregisterFunctionList.length; i++) {
                    if (typeof $scope.unregisterFunctionList[i] === 'function') {
                        $scope.unregisterFunctionList[i]();
                    }
                }
            }
        });

        phoenixsocket.onPrivate("TransactionHeaderManualCalculation", function (event, data) {
            $scope.model.transactionCalculation = data;
            if (data.Billings[0] && data.Billings[0].BillingTransactionLineSalesTaxes) {
                angular.forEach(data.Billings[0].BillingTransactionLineSalesTaxes, function (value) {

                    if (value.SalesTaxId == ApplicationConstants.SalesTaxType.GSTHST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxGSTHST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.QST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxQST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.PST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxPST = value.Rate;
                });
            }
            if (data.Payments[0] && data.Payments[0].PaymentTransactionLineSalesTaxes) {
                angular.forEach(data.Payments[0].PaymentTransactionLineSalesTaxes, function (value) {

                    if (value.SalesTaxId == ApplicationConstants.SalesTaxType.GSTHST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxGSTHST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.QST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxQST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.PST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxPST = value.Rate;
                });
            }
            angular.forEach(data.Payments, function (line) {
                angular.forEach($scope.model.transactionHeader.PaymentTransactions, function (ptrans) {
                    var pay = _.find(ptrans.PaymentTransactionLines, function (payment) {
                        return payment.Id === line.Id;
                    });
                    if (angular.isDefined(pay)) {
                        angular.extend(pay, line);
                    }
                });
            });

            angular.forEach(data.Billings, function (line) {
                angular.forEach($scope.model.transactionHeader.BillingTransactions, function (btrans) {
                    var bill = _.find(btrans.BillingTransactionLines, function (billing) {
                        return billing.Id === line.Id;
                    });
                    if (angular.isDefined(bill)) {
                        angular.extend(bill, line);
                    }
                });
            });

            angular.forEach($scope.model.transactionHeader.BillingTransactions, function (billingTransaction) {
                billingTransaction.CurrencyCode = CodeValueService.getCodeValue(billingTransaction.CurrencyId, CodeValueGroups.Currency).code;
            });
            angular.forEach($scope.model.transactionHeader.PaymentTransactions, function (paymentTransaction) {
                paymentTransaction.CurrencyCode = CodeValueService.getCodeValue(paymentTransaction.CurrencyId, CodeValueGroups.Currency).code;
            });

            $scope.model.transactionHeader.CurrencyCode = ($scope.model.transactionHeader.BillingTransactions[0] || $scope.model.transactionHeader.PaymentTransactions[0]).CurrencyCode;

        }).then(function (unregister) {
            if (unregister) {
                $scope.unregisterFunctionList.push(unregister);
            }
        });

        function transactionHeaderManualCalculation(header) {
            TransactionApiService.transactionHeaderManualCalculation({
                WorkflowPendingTaskId: -1,
                TransactionHeader: header,
                Recalculate: false
            }).then(
                function (responseSucces) {},
                function (responseError) {
                    onResponseError(responseError);
                });
        }

        function onLoad() {
            var promises = [];

            promises.push($scope.workflow.onLoad());
            $scope.lists.transactionCategoryList = CodeValueService.getCodeValues(CodeValueGroups.TransactionCategory, true);
            $scope.lists.RateUnits = CodeValueService.getCodeValues(CodeValueGroups.RateUnit, true);
            $scope.lists.sourceDeductionTypeList = CodeValueService.getCodeValues(CodeValueGroups.SourceDeductionType, true);
            $scope.lists.rateTypes = CodeValueService.getCodeValues(CodeValueGroups.RateType, true);
            $scope.lists.earningsAndDeductionsTypeList = CodeValueService.getCodeValues(CodeValueGroups.EarningsAndDeductionsType, true);
            $scope.lists.stateActionList = CodeValueService.getCodeValues(CodeValueGroups.StateAction, true);
            $scope.lists.YesNo = [{
                value: true,
                text: 'Yes'
            }, {
                value: false,
                text: 'No'
            }];

            var oDataParams = oreq.request().url();
            promises.push(
                TimesheetApiService.getTimesheetsAndWorkOrdersSummary($scope.model.transactionHeader.WorkOrderId, oDataParams)
                .then(function (response) {
                    var allTimesheets = _.map((response.Items || []), function (i) {
                        return {
                            Id: i.TimeSheetId,
                            StartDate: i.TimesheetStartDate,
                            EndDate: i.TimesheetEndDate,
                            Description: '#' + i.TimeSheetId + ' : ' + moment.utc(i.TimesheetStartDate).format('MMM DD, YYYY') + ' - ' + moment.utc(i.TimesheetEndDate).format('MMM DD, YYYY') + ' - ' + i.UserProfileWorkerName + ' - ' + i.OrganizationClientLegalName,
                            WorkOrderId: i.WorkOrderId,
                            TimeSheetTypeId: i.TimesheetTypeId
                        };
                    });
                    $scope.model.allTimesheets = allTimesheets;
                }));

            //if ($scope.model.transactionHeader.TransactionTypeId == ApplicationConstants.TransactionType.Manual) {
            promises.push(transactionHeaderManualCalculation($scope.model.transactionHeader));
            //}

            promises.push(ProfileApiService.get($scope.model.transactionHeader.WorkerUserProfileId).then(function (response) {
                $scope.model.worker = response;
            }));
            promises.push($scope.workflow.getWorkflowActions($scope.model.transactionHeader));

            if (($scope.model.transactionHeader.TransactionTypeId == ApplicationConstants.TransactionType.Advance) && $scope.model.worker && _.isEmpty($scope.model.worker)) {
                var userProfileWorkerId = $scope.model.transactionHeader.PaymentTransactions.length && $scope.model.transactionHeader.PaymentTransactions[0].PayeeUserProfileWorkerId;
                if (userProfileWorkerId) {
                    ProfileApiService.get(userProfileWorkerId)
                        .then(
                            function (response) {
                                $scope.model.worker = response;
                            },
                            function (responseError) {
                                common.logError(responseError);
                            }
                        );
                }
            }

            return $q.all(promises);
        }

        onLoad();

        $scope.billingShowDetailTypeSalesTaxLine = function (billingTransaction, billingTransactionLine) {
            billingTransaction.ShowDetailTransactionLineIndex = billingTransaction.BillingTransactionLines.indexOf(billingTransactionLine);
            billingTransaction.ShowDetailType = $scope.showDetailType.SalesTaxLine;
        };

        $scope.paymentShowDetailTypeSalesTaxLine = function (paymentTransaction, paymentTransactionLine) {
            paymentTransaction.ShowDetailTransactionLineIndex = paymentTransaction.PaymentTransactionLines.indexOf(paymentTransactionLine);
            paymentTransaction.ShowDetailType = $scope.showDetailType.SalesTaxLine;
        };

        $scope.$on('$viewContentLoaded', function () {
            $scope.viewLoading = false;
        });

        $scope.filterWorkflowActions = function (value) {
            // Actions for the Timesheet on Transaction Reverse are not available if it comes from VMS Import.
            return ($scope.model.transactionHeader.TransactionTypeId != ApplicationConstants.TransactionType.VmsTimesheet) ||
                (value.CommandName.toLowerCase().indexOf("timesheet") === -1);
        };

        $scope.showIsReplaceByZeroInputCheckBox = false;
        $scope.showIsReplaceByZeroIcon = $scope.model.transactionHeader.TransactionTypeId === ApplicationConstants.TransactionType.Manual;
        $scope.showSummaryEarningsAndDeductions = function (amountSummary, itemToCheck, subLevel) {
            //return true;
            //$scope.model.transactionCalculation.AmountSummary
            if (!amountSummary || !itemToCheck) {
                return false;
            }
            if (typeof subLevel === 'undefined' || subLevel === null) {
                var existsInBill = (typeof amountSummary.AmountSummaryPayees !== 'undefined' && amountSummary.AmountSummaryPayees != null && amountSummary.AmountSummaryPayees.filter(function (val) {
                    return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null;
                }).length > 0);
                var existsInPay = (typeof amountSummary.AmountSummaryBills !== 'undefined' && amountSummary.AmountSummaryBills != null && amountSummary.AmountSummaryBills.filter(function (val) {
                    return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null;
                }).length > 0);
                var existsinInternal = (typeof amountSummary.AmountSummaryEmployer !== 'undefined' && amountSummary.AmountSummaryEmployer != null && typeof amountSummary.AmountSummaryEmployer[itemToCheck] !== 'undefined' && amountSummary.AmountSummaryEmployer[itemToCheck] !== null);
                var existsInRoot = (typeof amountSummary !== 'undefined' && amountSummary != null && typeof amountSummary[itemToCheck] !== 'undefined' && amountSummary[itemToCheck] !== null);
                return existsInBill || existsInPay || existsinInternal || existsInRoot;
            } else {
                return subLevel[itemToCheck] !== null;
            }
        };

        $scope.model.transactionHeader.IsPaymentStopped = _.findIndex($scope.model.transactionHeader.PaymentTransactions, 'IsPaymentStopped') !== -1;
    }

})(angular, Phoenix.App);