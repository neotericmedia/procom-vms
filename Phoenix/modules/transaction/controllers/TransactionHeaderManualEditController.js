(function (angular, app) {
    'use strict';

    var controllerId = 'TransactionHeaderManualEditController';

    angular.module('phoenix.transaction.controllers').controller(controllerId,
    [
       '$scope', '$state', '$stateParams', '$timeout', 'dialogs', 'common', 'commonDataService', 'resolveTransactionHeader', 'resolveCodeValueLists', 'NavigationService', 'TransactionApiService', 'PurchaseOrderApiService', 'CodeValueService', 'TimesheetApiService', 'ProfileApiService', 'phoenixsocket', 'phxLocalizationService', TransactionHeaderManualEditController
    ]);

    function TransactionHeaderManualEditController($scope, $state, $stateParams, $timeout, dialogs, common, commonDataService, resolveTransactionHeader, resolveCodeValueLists, NavigationService, TransactionApiService, PurchaseOrderApiService, CodeValueService, TimesheetApiService, ProfileApiService, phoenixsocket, phxLocalizationService) {

        $scope.unregisterFunctionList = [];

        common.setControllerName(controllerId);

        NavigationService.setTitle('transaction-viewedit', [(resolveTransactionHeader.TransactionNumber || phxLocalizationService.translate('common.generic.new'))]);

        $scope.model = {
            validationMessages: [],
            transactionHeader: resolveTransactionHeader,
            transactionCalculation: {},
            groupedTransactionLinesByLineNumber: {},
            countOfGroupedTransactionLinesByLineNumber: 0,
            timesheet: {},
            worker: {},
            purchaseOrderLines: {
                items: [],
                selectedCount: 0,
                totalItemCount: 0,
                currentPage: 1,
                totalItems: 0,
                pageSize: 10,
                pageCount: 1,
                loadPurchaseOrderLinesPromise: null,
            },
            allTimesheets: []
        };

        // track workorderid for concurrency bug
        $state.current.WorkOrderId = $scope.model.transactionHeader.WorkOrderId;

        var debounce = _.debounce(transactionHeaderManualCalculation, 250, false);

        if ($scope.model.transactionHeader.TransactionHeaderStatusId == ApplicationConstants.TransactionHeaderStatus.Active) {
            $state.transitionTo('transaction.view.summary', { transactionHeaderId: $stateParams.transactionHeaderId }, { reload: true, inherit: true, notify: true });
        }
        //(['Id', 'WorkOrderId', 'EndDate', 'StartDate', 'WorkerName', 'ClientName'])
        var oDataParams = oreq.request().withSelect(['TimeSheetId', 'TimesheetTypeId', 'WorkOrderId', 'TimesheetTypeId', 'TimesheetEndDate', 'TimesheetStartDate', 'UserProfileWorkerName', 'OrganizationClientLegalName']).url();
        TimesheetApiService.getTimesheetsAndWorkOrdersSummary($scope.model.transactionHeader.WorkOrderId, oDataParams).then(function (response) {

            var allTimesheets = _.map((response.Items || []), function (item) {
                return {
                    Id: item.TimeSheetId,
                    WorkOrderId: item.WorkOrderId,
                    TimeSheetTypeId: item.TimesheetTypeId,
                    EndDate: item.TimesheetEndDate,
                    StartDate: item.TimesheetStartDate,
                    WorkerName: item.UserProfileWorkerName,
                    ClientName: item.OrganizationClientLegalName
                };
            });

            _.each(allTimesheets, function (item) {
                item.Description = '#' + item.Id + ' : ' + moment.utc(item.StartDate).format('MMM DD, YYYY') + ' - ' + moment.utc(item.EndDate).format('MMM DD, YYYY') + ' - ' + item.WorkerName + ' - ' + item.ClientName;
            });
            $scope.model.allTimesheets = allTimesheets;
        });

        $scope.showDetailType = {
            SalesTaxTotal: 'SalesTaxTotal',
            SalesTaxLine: 'SalesTaxLine'
        };

        $scope.lists = {
            rateUnitList: [],
            transactionTypeList: [],
            transactionCategoryList: [],
            currencyList: [],
            workOrderPurchaseOrderLineStatusList: [],
            sourceDeductionTypeList: [],
            earningsAndDeductionsTypeList:[],
        };

        $scope.loadResolveStaticLists = function () {
            $scope.lists.rateUnitList = resolveCodeValueLists.rateUnitList;
            $scope.lists.transactionTypeList = resolveCodeValueLists.transactionTypeList;
            $scope.lists.transactionCategoryList = resolveCodeValueLists.transactionCategoryList;
            $scope.lists.currencyList = resolveCodeValueLists.currencyList;
            $scope.lists.workOrderPurchaseOrderLineStatusList = resolveCodeValueLists.workOrderPurchaseOrderLineStatusList;
            $scope.lists.sourceDeductionTypeList = resolveCodeValueLists.sourceDeductionTypeList;
            $scope.lists.earningsAndDeductionsTypeList = resolveCodeValueLists.earningsAndDeductionsTypeList;
        };

        $scope.actionButton = {
            show: {
                transactionSave: false,
                transactionSubmit: false,
                TransactionHeaderManualDiscard: false,
                transactionLineAdd: false,
                transactionLineRemove: false,
                transactionPOAdd: false,
                transactionPOLink: false,
                transactionPOChange: false,
                transactionPORemove: false,
                transactionPoNavigation: false,
            },

            showToRecalc: function () {
                var self = this;
                self.show.transactionSave = true;
                self.show.transactionSubmit = true;
                self.show.TransactionHeaderManualDiscard = true;
                self.show.transactionLineAdd = true;
                self.show.transactionLineRemove = true;
                self.show.transactionPOAdd = $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId === null || $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId === 0;
                self.show.transactionPOLink = $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId !== null && $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId > 0;
                self.show.transactionPOChange = !self.show.transactionPOAdd;
                self.show.transactionPORemove = !self.show.transactionPOAdd;
                self.show.transactionPoNavigation = false;
                $scope.viewLoading = false;
            },

            onClick: {

                //  transaction: Save, Submit, Discard
                transactionSave: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualSave({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeader: $scope.model.transactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.manual.detail', 'Transaction Saved');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },

                transactionSaveAction: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualSaveState({ TransactionHeader: $scope.model.transactionHeader, EntityIds: [$scope.model.transactionHeader.Id], EntityTypeId: ApplicationConstants.EntityType.TransactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo($scope.model.transactionHeader.Id, 'transaction.manual.detail', 'Transaction Saved');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                //  Submit
                transactionSubmit: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderUserActionManualSubmit({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeader: $scope.model.transactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.view.summary', 'Transaction Submitted');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });                       
                },

                transactionSubmitAction: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderUserActionManualSubmitState({ TransactionHeader: $scope.model.transactionHeader, EntityIds: [$scope.model.transactionHeader.Id], EntityTypeId: ApplicationConstants.EntityType.TransactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo($scope.model.transactionHeader.Id, 'transaction.view.summary', 'Transaction Submitted');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });                        
                },

                //  Discard
                TransactionHeaderManualDiscard: function () {
                    var dlg = dialogs.confirm('Discard Transaction', 'This Transaction will be discarded. Continue?');
                    dlg.result.then(function (btn) {
                        var dialogResult = 'Confirmed';
                        var workOrderId = $scope.model.transactionHeader.WorkOrderId;
                        onClickBeforeEvent();
                        TransactionApiService.TransactionHeaderManualDiscard({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeaderId: $scope.model.transactionHeader.Id }).then(
                            function (responseSucces) {
                                $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true })
                                    // random error, occurs when state.go is called right after TransactionHeaderManualDiscard
                                    // it works when there is a delay between calls. the TransactionHeadermanualEditController 
                                    // is being resolved and calls the discarded transaction retry transition
                                    // "Error: transition superseded at $StateProvider.$get"                                    
                                    .catch(function () {
                                        $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true });
                                    });
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            }
                        );
                    }, function (btn) {
                        var dialogResult = 'Not Confirmed';
                    });
                },

                TransactionHeaderManualDiscardAction: function () {
                    var dlg = dialogs.confirm('Discard Transaction', 'This Transaction will be discarded. Continue?');
                    dlg.result.then(function (btn) {
                        var dialogResult = 'Confirmed';
                        var workOrderId = $scope.model.transactionHeader.WorkOrderId;
                        onClickBeforeEvent();
                        TransactionApiService.TransactionHeaderManualDiscardState({ TransactionHeaderId: $scope.model.transactionHeader.Id, EntityIds: [$scope.model.transactionHeader.Id], EntityTypeId: ApplicationConstants.EntityType.TransactionHeader }).then(
                            function (responseSucces) {
                                $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true })
                                    // random error, occurs when state.go is called right after TransactionHeaderManualDiscard
                                    // it works when there is a delay between calls. the TransactionHeadermanualEditController 
                                    // is being resolved and calls the discarded transaction retry transition
                                    // "Error: transition superseded at $StateProvider.$get"                                    
                                    .catch(function () {
                                        $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: workOrderId, workOrderVersionId: 0 }, { reload: true, inherit: true, notify: true });
                                    });
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            }
                        );
                    }, function (btn) {
                        var dialogResult = 'Not Confirmed';
                    });
                },

                //  transactionLine: Add, Remove
                transactionLineAdd: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualAddLine({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeader: $scope.model.transactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo(responseSucces.EntityId, 'transaction.manual.detail', '');//'Transaction Line Added'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                transactionLineAddAction: function () {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualAddLineState({ TransactionHeader: $scope.model.transactionHeader, EntityIds: [$scope.model.transactionHeader.Id], EntityTypeId: ApplicationConstants.EntityType.TransactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo($scope.model.transactionHeader.Id, 'transaction.manual.detail', '');//'Transaction Line Added'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                transactionLineRemove: function (lineNumber) {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualRemoveLine({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeaderId: $scope.model.transactionHeader.Id, TransactionLineNumber: lineNumber }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo(responseSucces.EntityId, 'transaction.manual.detail', '');//'Transaction Line "' + transactionHeaderManualRemoveLineCommand.TransactionLineNumber + '" Removed'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                transactionLineRemoveAction: function (lineNumber) {
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualRemoveLineState({ TransactionHeaderId: $scope.model.transactionHeader.Id, TransactionLineNumber: lineNumber, EntityIds: [$scope.model.transactionHeader.Id], EntityTypeId: ApplicationConstants.EntityType.TransactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesStateGo($scope.model.transactionHeader.Id, 'transaction.manual.detail', '');//'Transaction Line "' + transactionHeaderManualRemoveLineCommand.TransactionLineNumber + '" Removed'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                //  transactionPO: NavigationOpen, NavigationClose, Assign, Remove
                transactionPoNavigationOpen: function () {
                    $scope.actionButton.show.transactionPoNavigation = true;
                },
                transactionPoNavigationClose: function () {
                    $scope.actionButton.show.transactionPoNavigation = false;
                },
                transactionPOAssign: function (po) {
                    $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId = po.PurchaseOrderLineId;
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualSave({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeader: $scope.model.transactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.manual.detail', '');//'Purcahse Order Assigned'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                transactionPORemove: function () {
                    $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId = null;
                    onClickBeforeEvent();
                    TransactionApiService.transactionHeaderManualSave({ WorkflowPendingTaskId: $scope.model.transactionHeader.WorkflowPendingTaskId, TransactionHeader: $scope.model.transactionHeader }).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'transaction.manual.detail', '');//'Purcahse Order Removed'
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                },
                editSalesTax: function (lineNumberItem) {
                    var dlg = dialogs.create('/Phoenix/modules/transaction/views/EditManual/DialogSalesTaxEdit.html', 'SalesTaxEditController', lineNumberItem, {});

                    dlg.result.then(function (rsp) {
                        if (!angular.isDefined(rsp) || !angular.isArray(rsp) || rsp.length <= 0) return;

                        if (lineNumberItem.transactionLine.PaymentTransactionLineSalesTaxes) {
                            lineNumberItem.transactionLine.PaymentTransactionLineSalesTaxes = _.map(rsp, function (elem) {
                                return {
                                    SalesTaxVersionRateId: elem.Id, Amount: +elem.Amount, PaymentTransactionLineId: lineNumberItem.transactionLine.Id
                                };
                            });
                        }
                        else if (lineNumberItem.transactionLine.BillingTransactionLineSalesTaxes) {
                            lineNumberItem.transactionLine.BillingTransactionLineSalesTaxes = _.map(rsp, function (elem) {
                                return {
                                    SalesTaxVersionRateId: elem.Id, Amount: +elem.Amount, BillingTransactionLineId: lineNumberItem.transactionLine.Id
                                };
                            });
                        }
                        //transactionHeaderManualCalculation();
                        debounce();
                    }, function (rsp) {
                        var result = 'Not Confirmed';
                    });
                }
            },

        };

        function onClickBeforeEvent(viewLoading) {
            viewLoading = typeof viewLoading === 'undefined' ? true : viewLoading;
            $scope.viewLoading = viewLoading;
            $scope.actionButton.show.transactionSave = false;
            $scope.actionButton.show.transactionSubmit = false;
            $scope.actionButton.show.TransactionHeaderManualDiscard = false;
            $scope.actionButton.show.transactionLineAdd = false;
            $scope.actionButton.show.transactionLineRemove = false;
            $scope.actionButton.show.transactionPOAdd = false;
            $scope.actionButton.show.transactionPOLink = $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId !== null && $scope.model.transactionHeader.BillingTransactions[0].PurchaseOrderLineId > 0;
            $scope.actionButton.show.transactionPOChange = false;
            $scope.actionButton.show.transactionPORemove = false;
            $scope.actionButton.show.transactionPoNavigation = false;
        }

        var lastCommandIdToExecute = '';

        function transactionHeaderManualCalculation() {
            onClickBeforeEvent(false);
            $scope.isCalculating = true;
            var command = { WorkflowPendingTaskId: -1, TransactionHeader: $scope.model.transactionHeader };
            TransactionApiService.transactionHeaderManualCalculation(command).then(
                function (responseSucces) { },
                function (responseError) {
                    $scope.isCalculating = false;
                    onResponseError(responseError);
                });

            lastCommandIdToExecute = command.CommandId;
        }

        function onResponseError(responseError) {
            $scope.actionButton.showToRecalc();
            $scope.model.validationMessages = common.responseErrorMessages(responseError);
        }

        function onResponseSuccesWatchWorkflowEvent(transactionHeaderId, stateNameGo, successMessage) {
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'transaction.manual', ApplicationConstants.EntityType.TransactionHeader, ApplicationConstants.EntityType.TransactionHeader, transactionHeaderId, { transactionHeaderId: transactionHeaderId });
        }

        function onResponseSuccesStateGo(transactionHeaderId, stateNameGo, successMessage) {
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            $state.transitionTo(stateNameGo, { transactionHeaderId: transactionHeaderId }, { reload: true, inherit: true, notify: true });
        }

        function onLoad() {
            $scope.loadResolveStaticLists();
            $scope.actionButton.showToRecalc();
            $scope.model.transactionHeader.CurrencyCode = _.find($scope.lists.currencyList, function (currency) { return currency.id == $scope.model.transactionHeader.BillingTransactions[0].CurrencyId; }).code;

            //  Load worker
            ProfileApiService.get($scope.model.transactionHeader.WorkerUserProfileId).then(
                function (responseSucces) {
                    $scope.model.worker = responseSucces;
                },
                function (responseError) {
                    onResponseError(responseError);
                }
            );

            angular.forEach($scope.model.transactionHeader.BillingTransactions, function (billingTransaction) {
                angular.forEach(billingTransaction.BillingTransactionLines, function (billingTransactionLine) {
                    if (!$scope.model.groupedTransactionLinesByLineNumber[billingTransactionLine.LineNumber]) {
                        $scope.model.countOfGroupedTransactionLinesByLineNumber++;
                        $scope.model.groupedTransactionLinesByLineNumber[billingTransactionLine.LineNumber] = {
                            lineNumber: billingTransactionLine.LineNumber,
                            rateTypeId: billingTransactionLine.RateTypeId,
                            rateTypeList: _.filter(resolveCodeValueLists.rateTypeList, function (rateType) { return rateType.id == ApplicationConstants.RateType.Other || _.find(billingTransactionLine.VersionRates, function (versionRate) { return versionRate.RateTypeId == rateType.id; }); }),
                            billings: [],
                            payments: []
                        };
                    }
                    $scope.model.groupedTransactionLinesByLineNumber[billingTransactionLine.LineNumber].billings.push(
                        {
                            Id: billingTransactionLine.Id,
                            transactionLine: billingTransactionLine,
                            hours: billingTransactionLine.Hours,
                            OrganizationIdClient: billingTransaction.OrganizationIdClient,
                            OrganizationClientDisplayName: billingTransaction.OrganizationClientDisplayName,
                            OrganizationIdInternal: billingTransaction.OrganizationIdInternal,
                            OrganizationInternalLegalName: billingTransaction.OrganizationInternalLegalName,
                            VersionRates: billingTransactionLine.VersionRates,
                            SubdivisionId: billingTransactionLine.SubdivisionId,
                            CurrencyId: billingTransaction.CurrencyId,
                            //rateUnitId: billingTransactionLine.RateUnitId,
                        }
                    );
                });
            });

            angular.forEach($scope.model.transactionHeader.PaymentTransactions, function (paymentTransaction) {
                angular.forEach(paymentTransaction.PaymentTransactionLines, function (paymentTransactionLine) {
                    if (paymentTransactionLine.RateTypeId !== ApplicationConstants.RateType.Stat) {
                        $scope.model.groupedTransactionLinesByLineNumber[paymentTransactionLine.LineNumber].payments.push(
                            {
                                Id: paymentTransactionLine.Id,
                                transactionLine: paymentTransactionLine,
                                hours: paymentTransactionLine.Hours,
                                rateTypeId: paymentTransactionLine.RateTypeId,
                                PayeeName: paymentTransaction.PayeeName,
                                PayeeOrganizationIdSupplier: paymentTransaction.PayeeOrganizationIdSupplier,
                                PayeeUserProfileWorkerId: paymentTransaction.PayeeUserProfileWorkerId,
                                VersionRates: paymentTransactionLine.VersionRates,
                                SubdivisionId: paymentTransactionLine.SubdivisionId,
                                CurrencyId: paymentTransaction.CurrencyId,
                                //rateUnitId: paymentTransactionLine.RateUnitId,
                            });
                    }
                });
            });
            debounce();
            //transactionHeaderManualCalculation();
        }

        onLoad();

        function rateUnitConverter(paymentRateUnit, value, hours) {
            value = parseFloat(value);

            if (paymentRateUnit == ApplicationConstants.RateUnit.Hour) {
                value = parseFloat(value * hours).toFixed(2) / 1;
            }
            else if (paymentRateUnit == ApplicationConstants.RateUnit.Day) {
                value = parseFloat(value / hours).toFixed(2) / 1;
            }

            return value;
        }

        function bpUnitAdjuster(billingRateUnit, paymentRateUnit, newValue, hours) {
            if (billingRateUnit === paymentRateUnit || billingRateUnit === ApplicationConstants.RateUnit.Fixed || paymentRateUnit === ApplicationConstants.RateUnit.Fixed) return newValue;
            newValue = rateUnitConverter(paymentRateUnit, newValue, hours);
            return newValue;
        }

        $scope.onEraseRateType = function (lineNumberItem) {
            lineNumberItem.rateTypeId = undefined;
            $scope.onChangeRateType(lineNumberItem);
        };

        $scope.onChangeRateType = function (lineNumberItem) {
            angular.forEach(lineNumberItem.billings, function (billing) {
                billing.transactionLine.RateTypeId = lineNumberItem.rateTypeId;
                var rate = !lineNumberItem.rateTypeId || lineNumberItem.rateTypeId == ApplicationConstants.RateType.Other ?
                    null : _.find(billing.VersionRates, function (versionRate) { return versionRate.RateTypeId == lineNumberItem.rateTypeId; });

                billing.transactionLine.Rate = rate ? rate.Rate : 0;
                billing.transactionLine.RateUnitId = rate ? rate.RateUnitId : null;
                //billing.transactionLine.BillingTransactionLineSalesTaxes = [];
            });
            angular.forEach(lineNumberItem.payments, function (payment) {
                payment.transactionLine.RateTypeId = lineNumberItem.rateTypeId;

                var rate = !lineNumberItem.rateTypeId || lineNumberItem.rateTypeId == ApplicationConstants.RateType.Other ?
                    null : _.find(payment.VersionRates, function (versionRate) {
                        return versionRate.RateTypeId == lineNumberItem.rateTypeId;
                    });                
                
                payment.transactionLine.Rate = rate ? rate.Rate : 0;
                payment.transactionLine.RateUnitId = rate ? rate.RateUnitId : null;

                // Business rule: For rate type "Other", use primary rate settings for vacation, stat holiday and deductions
                if (lineNumberItem.rateTypeId === ApplicationConstants.RateType.Other) {
                    var primaryRate = _.find(payment.VersionRates, function (versionRate) {
                        if (lineNumberItem.rateTypeId == ApplicationConstants.RateType.Other)
                            return versionRate.RateTypeId == ApplicationConstants.RateType.Primary
                    });

                    payment.transactionLine.IsApplyDeductions = primaryRate ? primaryRate.IsApplyDeductions : null;
                    payment.transactionLine.IsApplyVacation = primaryRate ? primaryRate.IsApplyVacation : null;

                } else {
                    payment.transactionLine.IsApplyDeductions = rate ? rate.IsApplyDeductions : null;
                    payment.transactionLine.IsApplyVacation = rate ? rate.IsApplyVacation : null;
                }
            });
            debounce();
        };

        $scope.onBillingDescriptionChange = function (lineNumberItem, newValue, oldValue) {
            angular.forEach(lineNumberItem.billings, function (billing) {
                billing.transactionLine.Description = newValue;
            });
            angular.forEach(lineNumberItem.payments, function (payment) {
                if (!payment.transactionLine.Description || payment.transactionLine.Description.length === 0 || payment.transactionLine.Description == oldValue) {
                    payment.transactionLine.Description = newValue;
                }
            });
        };



        $scope.onBillingUnitsChange = function (lineNumberItem, billingTransactionLineUnitsNew, billingTransactionLineUnitsOld) {
            if (typeof billingTransactionLineUnitsNew === 'undefined') {
                billingTransactionLineUnitsNew = 0;
            }
            var billingRateUnit = lineNumberItem.billings[0].transactionLine.RateUnitId;
            var hours = lineNumberItem.billings[0].hours;
            angular.forEach(lineNumberItem.billings, function (billing) {
                billing.transactionLine.Units = billingTransactionLineUnitsNew;
                //billing.transactionLine.BillingTransactionLineSalesTaxes = [];
            });
            angular.forEach(lineNumberItem.payments, function (payment) {
                var paymentRateUnit = payment.transactionLine.RateUnitId;
                var paymentTransactionLineUnitsOld = null;
                if (billingRateUnit === paymentRateUnit || billingRateUnit === ApplicationConstants.RateUnit.Fixed || paymentRateUnit === ApplicationConstants.RateUnit.Fixed) {
                    paymentTransactionLineUnitsOld = parseFloat(billingTransactionLineUnitsOld).toFixed(2) / 1;
                }
                else {
                    paymentTransactionLineUnitsOld = rateUnitConverter(paymentRateUnit, billingTransactionLineUnitsOld, hours);
                }
                if (!payment.transactionLine.Units || payment.transactionLine.Units === 0 || payment.transactionLine.Units == paymentTransactionLineUnitsOld) {
                    payment.transactionLine.Units = bpUnitAdjuster(billingRateUnit, paymentRateUnit, billingTransactionLineUnitsNew, hours);
                    //payment.transactionLine.PaymentTransactionLineSalesTaxes = [];
                }
            });

            //transactionHeaderManualCalculation();
            debounce();
        };

        phoenixsocket.onPrivate("TransactionHeaderManualCalculation", function (event, data) {
            if (data.CommandId !== lastCommandIdToExecute) {
                return;
            }

            $scope.model.transactionCalculation = data;
            if (data.Billings[0] && data.Billings[0].BillingTransactionLineSalesTaxes) {
                angular.forEach(data.Billings[0].BillingTransactionLineSalesTaxes, function (value) {

                    if (value.SalesTaxId == ApplicationConstants.SalesTaxType.GSTHST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxGSTHST = value.Rate;

                    else if (value.SalesTaxId === ApplicationConstants.SalesTaxType.QST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxQST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.PST)
                        $scope.model.transactionCalculation.BillRate_SalesTaxPST = value.Rate;
                });
            }
            if (data.Payments[0] && data.Payments[0].PaymentTransactionLineSalesTaxes){
                angular.forEach(data.Payments[0].PaymentTransactionLineSalesTaxes, function (value) {

                    if (value.SalesTaxId == ApplicationConstants.SalesTaxType.GSTHST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxGSTHST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.QST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxQST = value.Rate;

                    else if (value.SalesTaxId == ApplicationConstants.SalesTaxType.PST)
                        $scope.model.transactionCalculation.PaymentRate_SalesTaxPST = value.Rate;
                });
            }
            // Remove all of the existing stat items
            var firstPaymentTransaction = _.first($scope.model.transactionHeader && $scope.model.transactionHeader.PaymentTransactions);
            var statLines = firstPaymentTransaction && firstPaymentTransaction.PaymentTransactionLines ?
                         _.remove(firstPaymentTransaction.PaymentTransactionLines, { RateTypeId: ApplicationConstants.RateType.Stat }) : [];

            angular.forEach(data.Payments, function (line) {
                if (line.RateTypeId === ApplicationConstants.RateType.Stat) {

                    // Stat Line
                    var foundLine = _.find(statLines, function (statLine) {
                        return moment(statLine.Date).isSame(line.Date, 'day');
                    });

                    if (foundLine) {
                        angular.extend(foundLine, line);
                    }
                    firstPaymentTransaction.PaymentTransactionLines.push(foundLine ? foundLine : line);
                    return;
                }


                if (typeof $scope.model.groupedTransactionLinesByLineNumber[line.LineNumber] !== 'undefined') {
                    var pay = _.find($scope.model.groupedTransactionLinesByLineNumber[line.LineNumber].payments, function (payment) {
                        return payment.Id === line.Id;
                    });
                    if (angular.isDefined(pay)) { angular.extend(pay, line); }
                }
                angular.forEach($scope.model.transactionHeader.PaymentTransactions, function (tr) {
                    angular.forEach(tr.PaymentTransactionLines, function (pl) {
                        if (pl.Id === line.Id) {
                            angular.extend(pl, line);
                        }
                    });
                });
            });

            angular.forEach(data.Billings, function (line) {
                if (typeof $scope.model.groupedTransactionLinesByLineNumber[line.LineNumber] !== 'undefined') {
                    var bill = _.find($scope.model.groupedTransactionLinesByLineNumber[line.LineNumber].billings, function (billing) {
                        return billing.Id === line.Id;
                    });
                    if (angular.isDefined(bill)) { angular.extend(bill, line); }
                }
                angular.forEach($scope.model.transactionHeader.BillingTransactions, function (tr) {
                    angular.forEach(tr.BillingTransactionLines, function (bl) {
                        if (bl.Id === line.Id) {
                            angular.extend(bl, line);
                        }
                    });
                });
            });

            //var dict = _.keyBy($scope.model.transactionHeader.StatHolidayTransactions, 'LineNumber');

            //var oldTransactions = $scope.model.transactionHeader.StatHolidayTransactions.splice(0, $scope.model.transactionHeader.StatHolidayTransactions.length);

            //angular.forEach(data.StatHolidays, function (line) {
            //    if (typeof dict[line.LineNumber] !== 'undefined') {
            //        angular.extend(dict[line.LineNumber], line);
            //    } else {
            //        dict[line.LineNumber] = line;
            //    }

            //    if (!dict[line.LineNumber].UnitsOverwrite && dict[line.LineNumber].UnitsOverwrite !== 0) {
            //        dict[line.LineNumber].UnitsOverwrite = dict[line.LineNumber].Units;
            //    }

            //    $scope.model.transactionHeader.StatHolidayTransactions.push(dict[line.LineNumber]);
            //});

            $scope.actionButton.showToRecalc();
            $scope.isCalculating = false;

        }).then(function (unregister) {
            if (unregister) {
                $scope.unregisterFunctionList.push(unregister);
            }
        });

        $scope.$on('$destroy', function () {
            if ($scope.unregisterFunctionList && $scope.unregisterFunctionList.length) {
                for (var i = 0; i < $scope.unregisterFunctionList.length; i++) {
                    if (typeof $scope.unregisterFunctionList[i] === 'function') {
                        $scope.unregisterFunctionList[i]();
                    }
                }
            }
        });

        $scope.$watch('model.transactionHeader.StartDate', function () {
            debounce();
        });
        $scope.$watch('model.transactionHeader.EndDate', function () {
            debounce();
        });

        $scope.resetTaxesAndCalculate = function (line) {
            //if (line.rateTypeId == null) return;
            //if (angular.isDefined(line.PaymentTransactionLineSalesTaxes)) {
            //    line.PaymentTransactionLineSalesTaxes = [];
            //}
            //if (angular.isDefined(line.BillingTransactionLineSalesTaxes)) {
            //    line.BillingTransactionLineSalesTaxes = [];
            //}
            //transactionHeaderManualCalculation();
            debounce();
        };

        $scope.callServer = function (tableState) {
            $scope.model.purchaseOrderLines.currentPage = $scope.model.purchaseOrderLines.currentPage || 1;
            var isPaging = false, sortByOrganiation = false;
            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                isPaging = false;
            }
                // pagination
            else {
                $scope.model.purchaseOrderLines.currentPage++;
                isPaging = true;
            }
            $scope.model.purchaseOrderLines.loadPurchaseOrderLinesPromise = null;

            tableState.pagination.currentPage = $scope.model.purchaseOrderLines.currentPage;
            tableState.pagination.pageSize = $scope.model.purchaseOrderLines.pageSize;

            var oDataParams = oreq.request().withSelect([
                'PurchaseOrderLineCurrencyId',
                 'PurchaseOrderLineStatusId',
                 'PurchaseOrderLineStartDate',
                 'PurchaseOrderLineEndDate',
                 'Id',
                 'PurchaseOrderId',
                 'PurchaseOrderNumber',
                 'PurchaseOrderLineNumber',
                 'PurchaseOrderLineId',
                 'StatusId',
                 'Amount',
                 'AmountCommited',
                 'AmountReserved',
                 'AmountRemaining',
                 'AmountSpent'
            ])
            .url();

            var promise = PurchaseOrderApiService.getWorkOrderPurchaseOrderLinesByTransactionHeaderId($stateParams.transactionHeaderId, tableState, oDataParams)
                .then(function (responseSuccess) {
                    var responseItems = [];
                    _.each(responseSuccess.Items, function (item) {
                        responseItems.push({
                            Id: item.Id,
                            StartDate: item.PurchaseOrderLineStartDate,
                            EndDate: item.PurchaseOrderLineEndDate,
                            PurchaseOrderId: item.PurchaseOrderId,
                            PurchaseOrderLineId: item.PurchaseOrderLineId,
                            PurchaseOrderNumber: item.PurchaseOrderNumber,
                            PurchaseOrderLineNumber: item.PurchaseOrderLineNumber,
                            Amount: item.Amount,
                            AmountCommited: item.AmountCommited,
                            AmountSpent: item.AmountSpent,
                            StatusId: item.StatusId,
                            //CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id == pol.CurrencyId; }).code,
                            PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id == item.StatusId; }).code,
                            AmountRemaining: item.AmountRemaining
                        });
                    });

                    if (isPaging === true) {
                        $scope.model.purchaseOrderLines.items = $scope.model.purchaseOrderLines.items.concat(responseItems);
                        $scope.model.purchaseOrderLines.totalItemCount = responseSuccess.Count;
                    } else {
                        $scope.model.purchaseOrderLines.items = responseItems;
                        $scope.model.purchaseOrderLines.currentPage = 1;
                        $scope.model.purchaseOrderLines.totalItemCount = responseSuccess.Count;
                    }
                },
               function (responseError) {
                   common.responseErrorMessages(responseError);
               });

            if (isPaging !== true) {
                $scope.model.purchaseOrderLines.loadPurchaseOrderLinesPromise = promise;
            }
        };

        $scope.showIsReplaceByZeroInputCheckBox = true;
        $scope.showIsReplaceByZeroIcon = false;
        $scope.showSummaryEarningsAndDeductions = function (amountSummary, itemToCheck, subLevel) {
            //return true;
            //$scope.model.transactionCalculation.AmountSummary
            if (!amountSummary || !itemToCheck) {
                return false;
            }
            if (typeof subLevel === 'undefined' || subLevel === null) {
                var existsInBill = (typeof amountSummary.AmountSummaryPayees !== 'undefined' && amountSummary.AmountSummaryPayees != null && amountSummary.AmountSummaryPayees.filter(function (val) { return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null; }).length > 0);
                var existsInPay = (typeof amountSummary.AmountSummaryBills !== 'undefined' && amountSummary.AmountSummaryBills != null && amountSummary.AmountSummaryBills.filter(function (val) { return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null; }).length > 0);
                var existsinInternal = (typeof amountSummary.AmountSummaryEmployer !== 'undefined' && amountSummary.AmountSummaryEmployer != null && typeof amountSummary.AmountSummaryEmployer[itemToCheck] !== 'undefined' && amountSummary.AmountSummaryEmployer[itemToCheck] !== null);
                var existsInRoot = (typeof amountSummary !== 'undefined' && amountSummary != null && typeof amountSummary[itemToCheck] !== 'undefined' && amountSummary[itemToCheck] !== null);
                return existsInBill || existsInPay || existsinInternal || existsInRoot;
            }
            else
            {
                return subLevel[itemToCheck] !== null;
            }
        };

    }

    if (!app.resolve) app.resolve = {};
    app.resolve.TransactionHeaderManualEditController = {

        resolveTransactionHeader: ['$stateParams', '$q', 'TransactionApiService', 'WorkflowApiService', function ($stateParams, $q, TransactionApiService, WorkflowApiService) {
            var result = $q.defer();
            TransactionApiService.getByTransactionHeaderId($stateParams.transactionHeaderId).then(
                function (responseSucces) {
                    WorkflowApiService.getWorkflowAvailableActions(responseSucces, responseSucces, ApplicationConstants.EntityType.TransactionHeader).then(
                                        function (responseSuccess) {
                                            result.resolve(responseSucces);
                                        },
                                        function (responseError) {
                                            result.reject(responseError);
                                        });
                },
                function (responseError) {
                    result.reject(responseError);
                }
            );
            return result.promise;
        }],

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var list = {
            };

            list.transactionTypeList = CodeValueService.getCodeValues(CodeValueGroups.TransactionType, true);
            list.transactionCategoryList = CodeValueService.getCodeValues(CodeValueGroups.TransactionCategory, true);
            list.currencyList = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
            list.rateUnitList = CodeValueService.getCodeValues(CodeValueGroups.RateUnit, true);
            list.rateTypeList = CodeValueService.getCodeValues(CodeValueGroups.RateType, true);
            list.workOrderPurchaseOrderLineStatusList = CodeValueService.getCodeValues(CodeValueGroups.WorkOrderPurchaseOrderLineStatus, true);
            list.sourceDeductionTypeList = CodeValueService.getCodeValues(CodeValueGroups.SourceDeductionType, true);
            list.earningsAndDeductionsTypeList = CodeValueService.getCodeValues(CodeValueGroups.EarningsAndDeductionsType, true);

            result.resolve(list);
            return result.promise;
        }],
    };

})(angular, Phoenix.App);