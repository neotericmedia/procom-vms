/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AssignmentEventHandlerController';

    const WORK_ORDER_STATUS = ApplicationConstants.WorkOrderStatus;
    const PROFILE_TYPES = ApplicationConstants.UserProfileType;

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.workorder.controllers').controller(controllerId,
        ['$scope', '$state', '$stateParams', 'dialogs', 'common', 'commonDataService', 'AssignmentDataService', 'AssignmentApiService', 'AssignmentValidationService', 'AssignmentCommonFunctionalityService', 'TemplateApiService', 'CodeValueService', 'WorkflowApiService', 'ComplianceDocumentRuleApiService', 'phoenixsocket', 'UtilityDataChangeTrackerApiService', 'UrlData', '$location', AssignmentEventHandlerController]);

    function AssignmentEventHandlerController($scope, $state, $stateParams, dialogs, common, commonDataService, AssignmentDataService, AssignmentApiService, AssignmentValidationService, AssignmentCommonFunctionalityService, TemplateApiService, CodeValueService, WorkflowApiService, ComplianceDocumentRuleApiService, phoenixsocket, UtilityDataChangeTrackerApiService, UrlData, $location) {

        common.setControllerName(controllerId);

        $scope.unregisterFunctionList = [];

        var $q = common.$q;
        var $timeout = common.$timeout;
        $scope.actionButton = {

            show: {
                workOrderSaveAsTemplate: false,
                graphIsNew: false,
                workOrderAddRemoveSubEntities: false,
                syncFromATS: false,
                assignmentChangeWorker: false,
            },

            showToDisable: function () {
                var self = this;
                self.show.workOrderAddRemoveSubEntities = false;
            },

            showToRecalc: function () {
                let self = this;
                var editable = !$scope.workflow.runningStatus.IsRunning && $scope.CurrentWorkOrderVersion.IsDraftStatus;
                var isTemplate = $state.includes('template.workorder');
                
                self.show.syncFromATS = $scope.model.entity.AtsPlacementId > 0 &&
                    $scope.CurrentProfile.ProfileTypeId === PROFILE_TYPES.Internal &&
                    $scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    (_.findLastIndex($scope.model.entity.WorkOrders, function(wo) {return wo.IsDraftStatus || wo.StatusId === ApplicationConstants.WorkOrderStatus.Active;}) === $scope.model.WorkOrderIndex)

                self.show.workOrderSaveAsTemplate = true;
                self.show.graphIsNew = $scope.model.entity.StatusId == WORK_ORDER_STATUS.New && $scope.CurrentWorkOrder.StatusId == WORK_ORDER_STATUS.New && $scope.CurrentWorkOrderVersion.StatusId == WORK_ORDER_STATUS.New;
                self.show.workOrderAddRemoveSubEntities = editable;
                
                self.show.assignmentChangeWorker = editable && $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.New;
                
                if (!isTemplate) {
                    $scope.workflow.getWorkOrderVersionAvailableActions(parseInt($state.params.workOrderVersionId, 10));
                }
            },

            onClick: {
                syncFromATS: function(){
                    $scope.loadItemsPromise = AssignmentApiService.getAts($scope.model.entity.AtsSourceId, $scope.model.entity.AtsPlacementId).then(
                        function (ats) {
                            // sync the start date only if its the only work order
                            if ($scope.model.entity.WorkOrders.length === 1) {
                                if ($scope.editableWorkOrderStartDateState()) {
                                    $scope.CurrentWorkOrderVersion.WorkOrderStartDateState = ats.StartDate;
                                }
                                else {
                                    $scope.CurrentWorkOrder.StartDate = ats.StartDate;
                                }
                            }

                            if ($scope.editableWorkOrderEndDateState()) {
                                $scope.CurrentWorkOrderVersion.WorkOrderEndDateState = ats.EndDate;
                            }
                            else {
                                $scope.CurrentWorkOrder.EndDate = ats.EndDate;
                            }

                            ats.BillingRates.forEach(function(rate) {
                                const billingInfo = $scope.CurrentWorkOrderVersion.BillingInfoes[0].BillingRates.find(function(bi) {
                                    return bi.RateTypeId === rate.RateTypeId;
                                });
                                if (billingInfo) {
                                    billingInfo.Rate = rate.Rate;
                                    billingInfo.RateUnitId = ats.BillingRateUnitId;
                                }
                                else {
                                    $scope.CurrentWorkOrderVersion.BillingInfoes[0].BillingRates.push({ RateTypeId: rate.RateTypeId, Rate: rate.Rate, RateUnitId: ats.BillingRateUnitId });
                                }
                            });

                            ats.PaymentRates.forEach(function(rate) {
                                const paymentInfo = $scope.CurrentWorkOrderVersion.PaymentInfoes[0].PaymentRates.find(function(pi) {
                                    return pi.RateTypeId === rate.RateTypeId;
                                });
                                if (paymentInfo) {
                                    paymentInfo.Rate = rate.Rate;
                                    paymentInfo.RateUnitId = ats.PaymentRateUnitId;
                                    paymentInfo.IsApplyDeductions = rate.IsApplyDeductions;
                                    paymentInfo.IsApplyVacation = rate.IsApplyVacation;
                                }
                                else {
                                    $scope.CurrentWorkOrderVersion.PaymentInfoes[0].PaymentRates.push({ RateTypeId: rate.RateTypeId, Rate: rate.Rate, RateUnitId: ats.PaymentRateUnitId, IsApplyDeductions: rate.IsApplyDeductions, IsApplyVacation: rate.IsApplyVacation});
                                }
                            });
                            $scope.loadItemsPromise = null;
                            
                            $scope.workflow.actionButtonOnClick({CommandName: 'WorkOrderSave', successMessage: 'Work Order synced with ATS'});
                        },
                        function (err) {
                            onResponseError(err);
                        });
                },
                // Save as Template
                workOrderSaveAsTemplate: function () {
                    var assignmentTemplate = TemplateApiService.assignmentToTemplate($scope.model.entity, $scope.model.WorkOrderIndex, $scope.model.WorkOrderVersionIndex);
                    $scope.templateControl.openDialog(ApplicationConstants.EntityType.Assignment, assignmentTemplate).then(function (result) {
                        toUnregisterFunctions().then(
                            function (unregisterFunctionsSucces) {
                                $state.transitionTo('template.workorder.edit.core', { templateId: result.Id }, { reload: true, inherit: true, notify: true });
                            });

                    });
                },
                ////  New
                //workOrderNew: function () {
                //    onClickBeforeEvent();
                //    var workOrderNewCommand = {
                //        WorkflowPendingTaskId: -1,
                //        UserProfileIdWorker: $scope.model.entity.UserProfileIdWorker,
                //        OrganizationIdInternal: $scope.model.entity.OrganizationIdInternal,
                //        StartDate: $scope.CurrentWorkOrder.StartDate,
                //        EndDate: $scope.CurrentWorkOrder.EndDate,
                //        WorkOrderVersion: $scope.CurrentWorkOrderVersion
                //    };
                //    $scope.loadItemsPromise = AssignmentApiService.workOrderNew(workOrderNewCommand).then(
                //        function (responseSucces) {
                //            commonDataService.setWatchConfigOnWorkflowEvent('workorder.edit.core', 'workorder.edit', ApplicationConstants.EntityType.Assignment, ApplicationConstants.EntityType.WorkOrderVersion, responseSucces.EntityId, { assignmentId: 0, workOrderId: 0, workOrderVersionId: responseSucces.EntityId });
                //            toUnregisterFunctions().then(
                //                function (unregisterFunctionsSucces) {
                //                    $state.transitionTo('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: responseSucces.EntityId }, { reload: true, inherit: true, notify: true });
                //                });

                //        },
                //        function (responseError) {
                //            onResponseError(responseError);
                //        });
                //},


            },

            onChange: {

                // update timecard methodology
                timecardMethodology: function () {
                    set('timecardCycle', 'TimeSheetCycleId');
                    set('timecardApproval', 'TimeSheetApprovalFlowId');
                    set('projectsAndCoding', 'IsTimeSheetUsesProjects');
                    set('configurationAndDescriptors', 'IsDisplayEstimatedPaymentAmount');
                    set('thirdPartyWorkerID', 'VmsWorkOrderReference');
                    set('displayEstimatedInvoiceAmount', 'IsDisplayEstimatedInvoiceAmount');
                    set('displayEstimatedPaymentAmount', 'IsDisplayEstimatedPaymentAmount');
                    set('timecardDescription', 'TimeSheetDescription');
                    function set(timecardProperty, wovProperty) {
                        $scope.actionButton.timecard[timecardProperty] = AssignmentValidationService.isPropertyValidForTimeSheetMethodology(wovProperty, $scope.CurrentWorkOrderVersion.TimeSheetMethodologyId);
                    }

                    // set a default approver if changing to online and there are no TimeSheetApprovers
                    if ($scope.CurrentWorkOrderVersion.TimeSheetMethodologyId === 1) {
                        if ($scope.CurrentWorkOrderVersion.TimeSheetApprovers && $scope.CurrentWorkOrderVersion.TimeSheetApprovers.length === 0) {
                            $scope.addTimeSheetApproverDefinition();
                        }
                    }

                },

                // update timecard billing info note
                timecardBillingInfoNote: function (billingInfo, showIndex) {
                    var timecard = $scope.actionButton.timecard;

                    if (showIndex !== null && showIndex !== undefined) {
                        timecard.billingInfoNote2 = showIndex >= 2;
                        timecard.billingInfoNote3 = showIndex >= 3;
                        timecard.billingInfoNote4 = showIndex >= 4;
                    }
                    // billing info add button
                    timecard.billingInfoAddDisable = timecard.billingInfoNote4;

                },

                // update approver controls
                timecardApprover: function () {
                    $scope.actionButton.timecard.approverAddDisable = ($scope.CurrentWorkOrderVersion.TimeSheetApprovers || []).length <= 1;
                    $scope.actionButton.timecard.approverFlow = ($scope.CurrentWorkOrderVersion.TimeSheetApprovers || []).length > 1;

                    if ($scope.CurrentWorkOrderVersion.TimeSheetApprovalFlowId === null || $scope.CurrentWorkOrderVersion.TimeSheetApprovalFlowId === undefined) {
                        if (AssignmentValidationService.isPropertyValidForTimeSheetMethodology('TimeSheetApprovalFlowId', $scope.CurrentWorkOrderVersion.TimeSheetMethodologyId)) {
                            $scope.CurrentWorkOrderVersion.TimeSheetApprovalFlowId = 2;
                        }
                    }

                },

                expenseMethodology: function () {

                    set('expenseApproval', 'ExpenseApprovalFlowId');
                    set('projectsAndCoding', 'IsExpenseUsesProjects');
                    set('configurationAndDescriptors', 'configurationAndDescriptors');
                    set('thirdPartyWorkerID', 'ExpenseThirdPartyWorkerReference');
                    set('displayRequiresOriginal', 'IsExpenseRequiresOriginal');
                    set('displayEstimatedPaymentAmount', 'IsDisplayEstimatedPaymentAmount');
                    set('expenseDescription', 'ExpenseDescription');

                    function set(expenseProperty, wovProperty) {

                        $scope.actionButton.expense[expenseProperty] = AssignmentValidationService.isPropertyValidForExpenseMethodology(wovProperty, $scope.CurrentWorkOrderVersion.ExpenseMethodologyId);
                    }


                    if ($scope.CurrentWorkOrderVersion.TimeSheetMethodologyId === 1) {
                        if ($scope.CurrentWorkOrderVersion.TimeSheetApprovers && $scope.CurrentWorkOrderVersion.TimeSheetApprovers.length === 0) {
                            $scope.addTimeSheetApproverDefinition();
                        }
                    }

                },

                expenseBillingInfoNote: function (billingInfo, showIndex) {
                    var expense = $scope.actionButton.expense;

                    if (showIndex !== null && showIndex !== undefined) {
                        expense.billingInfoNote2 = showIndex >= 2;
                        expense.billingInfoNote3 = showIndex >= 3;
                        expense.billingInfoNote4 = showIndex >= 4;
                    }

                    expense.billingInfoAddDisable = expense.billingInfoNote4;

                },

                expenseApprover: function () {
                    $scope.actionButton.expense.approverAddDisable = ($scope.CurrentWorkOrderVersion.ExpenseApprovers || []).length <= 1;
                    $scope.actionButton.expense.approverFlow = ($scope.CurrentWorkOrderVersion.ExpenseApprovers || []).length > 3; // requires supplier and internal

                    if ($scope.CurrentWorkOrderVersion.ExpenseApprovalFlowId === null || $scope.CurrentWorkOrderVersion.ExpenseApprovalFlowId === undefined) {
                        if (AssignmentValidationService.isPropertyValidForExpenseMethodology('ExpenseApprovalFlowId', $scope.CurrentWorkOrderVersion.ExpenseMethodologyId)) {
                            $scope.CurrentWorkOrderVersion.ExpenseApprovalFlowId = 2;
                        }
                    }

                },

            },

            timecard: {
                timecardCycle: true,
                timecardApproval: true,
                projectsAndCoding: true,
                configurationAndDescriptors: true,
                thirdPartyWorkerId: true,
                displayRequiresOriginal: true,
                timecardDescription: true,
                billingInfoNote2: true,
                billingInfoNote3: true,
                billingInfoNote4: true,
                billingInfoAddDisable: true,
                approverAddDisable: true,
                approverFlow: true,
            },

            //todo add list of visibility
            expense: {

                expenseApproval: true,
                projectsAndCoding: true,
                configurationAndDescriptors: true,
                thirdPartyWorkerId: true,
                displayRequiresOriginal: true,
                expenseDescription: true,
                billingInfoNote2: true,
                billingInfoNote3: true,
                billingInfoNote4: true,
                billingInfoAddDisable: true,
                approverAddDisable: true,
                approverFlow: true

            }

        };

        $scope.workflow = {

            WorkflowAvailableActions: [],

            trackFieldChanges: [],

            runningStatus: {
                IsRunning: false,
            },

            buttonClass: function (commandName) {
                switch (commandName) {
                    case 'WorkOrderSubmit':
                    case 'WorkOrderFinalize':
                    case 'WorkOrderVersionUserActionApprovalApprove':
                    case 'WorkOrderUnterminate':
                        return 'btn-primary';
                    default:
                        return 'btn-default';
                }
            },

            validateButton: function (commandName) {
                switch (commandName) {
                    case 'WorkOrderSubmit':
                    case 'WorkOrderFinalize':
                        return true;
                    default:
                        return false;
                }
            },

            actionButtonOnClick: function (action) {
                var self = this;
                var successMessage = action.DisplayHistoryEventName && action.DisplayHistoryEventName.length > 0 ? action.DisplayHistoryEventName : 'Work Order';

                if (action.CommandName == 'WorkOrderSave') { WorkOrderSave(); }
                else if (action.CommandName == 'WorkOrderSubmit') { WorkOrderSubmit(); }
                else if (action.CommandName == 'WorkOrderDiscardChanges') { $state.reload(); }
                else if (action.CommandName == 'WorkOrderFinalize') { WorkOrderFinalize(); }
                else if (action.CommandName == 'WorkOrderTerminate') { WorkOrderTerminate(); }
                else if (action.CommandName == 'WorkOrderScheduleChange') { WorkOrderScheduleChange(); }
                else if (action.CommandName == 'WorkOrderCorrect') { WorkOrderCorrect(); }
                else if (action.CommandName == 'TransactionHeaderManualNew') { TransactionHeaderManualNew(); }
                else if (action.CommandName == 'TransactionHeaderAdjustmentSubmit') { TransactionHeaderAdjustmentSubmit(); }
                else if (action.CommandName == 'TransactionHeaderReleaseVacationPaySubmit') { TransactionHeaderReleaseVacationPaySubmit(); }
                else {
                    var suffix = '';
                    if (action.Name == 'Approve' || action.Name == 'Decline') {
                        suffix = 'd';
                    } else if (action.Name == 'Discard' || action.Name == 'Recall') {
                        suffix = 'ed';
                    }
                    var messages = {
                        dialogsConfirmHeader: 'Work Order',
                        dialogsConfirmQuestion: 'This Work Order will be changed. Continue?',
                        successMessage: 'Work Order ' + action.Name + suffix
                    };

                    if (action.CommandName == 'WorkOrderUnterminate') {
                        messages.dialogsConfirmHeader = 'Unterminate Work Order';
                        messages.dialogsConfirmQuestion = 'This Work Order will be Unterminated. Continue?';
                        messages.successMessage = 'Work Order Unterminated';
                    }
                    else if (action.CommandName == 'WorkOrderUnterminateRequest') {
                        messages.dialogsConfirmHeader = 'Unterminate Work Order';
                        messages.dialogsConfirmQuestion = 'This Work Order will be Unterminated. Continue?';
                        messages.successMessage = 'Work Order Unterminated';
                    }
                    else if (action.CommandName == 'WorkOrderSendNotificationOnUnterminateDecline') {
                        messages.dialogsConfirmHeader = 'Decline Untermination of Work Order';
                        messages.dialogsConfirmQuestion = 'This Work Order Untermination will be declined. Continue?';
                        messages.successMessage = 'Work Order declined';
                    }
                    else if (action.CommandName == 'WorkOrderCancel') {
                        if ($scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Active) {
                            messages.dialogsConfirmHeader = 'Cancel Work Order';
                            messages.dialogsConfirmQuestion = 'This Work Order will be cancelled. Continue?';
                            messages.successMessage = 'Work Order Cancelled';
                        }
                        else {
                            messages.dialogsConfirmHeader = 'Discard Work Order';
                            messages.dialogsConfirmQuestion = 'This Work Order will be discarded. Continue?';
                            messages.successMessage = 'Work Order Discarded';
                        }
                    }
                    else if (action.CommandName == 'WorkOrderExtend') {
                        messages.dialogsConfirmHeader = 'Extend Work Order';
                        messages.dialogsConfirmQuestion = 'This Work Order will be extended. Continue?';
                        messages.successMessage = 'Work Order Extended';
                    }

                    else if (action.CommandName == 'WorkOrderPaymentStop') {
                        messages.dialogsConfirmHeader = 'Stop Payments';
                        messages.dialogsConfirmQuestion = 'Are you sure you want to stop payments for all parties in this work order?';
                        messages.successMessage = 'Work Order Payments Stopped';
                    }

                    else if (action.CommandName == 'WorkOrderPaymentResume') {
                        messages.dialogsConfirmHeader = 'Resume Payments';
                        messages.dialogsConfirmQuestion = 'Are you sure you want to resume payments for all parties?';
                        messages.successMessage = 'Work Order Payments Resumed';
                    }

                    else {
                        switch (action.CommandName) {
                            case "WorkOrderVersionUserActionCancel": messages.dialogsConfirmQuestion = 'This Work Order will be cancelled and discarded. Continue?'; break;
                            case "WorkOrderVersionUserActionApprovalDecline": messages.dialogsConfirmQuestion = 'This Work Order will be declined. Continue?'; break;
                            case "WorkOrderVersionUserActionRecall": messages.dialogsConfirmQuestion = 'This Work Order will be recalled. Continue?'; break;
                            case "WorkOrderVersionUserActionApprovalApprove": messages.dialogsConfirmQuestion = 'This Work Order will be approved. Continue?'; break;
                            default: break;
                        }

                    }

                    dialogs.confirm(messages.dialogsConfirmHeader, messages.dialogsConfirmQuestion).result.then(function (btn) {
                        var dialogResult = 'Confirmed';
                        onClickBeforeEvent();
                        commonDataService.setWatchConfigOnWorkflowEvent('workorder.edit.core', 'workorder.edit', ApplicationConstants.EntityType.Assignment, ApplicationConstants.EntityType.WorkOrderVersion, $scope.CurrentWorkOrderVersion.Id, { assignmentId: 0, workOrderId: 0, workOrderVersionId: $scope.CurrentWorkOrderVersion.Id });
                        WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.WorkOrderVersion, $scope.CurrentWorkOrderVersion.Id).then(
                            function (responseSucces) { onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', messages.successMessage);
                        let path = UrlData.getUrl();
                        if (path && (action.CommandName == 'WorkOrderVersionUserActionApprovalDecline' || action.CommandName == 'WorkOrderVersionUserActionApprovalApprove'
                                        || action.CommandName == 'WorkOrderUnterminate' || action.CommandName == 'WorkOrderUnterminateDecline')) {
                            $location.path(path);
                        }
                        },
                            function (responseError) { onResponseError(responseError); });    
                    }, function (btn) {
                        var dialogResult = 'Not Confirmed';
                    });
                }



                function WorkOrderSave(callbackFunction, callbackFunctionParameters) {
                    onClickBeforeEvent();
                    $scope.CurrentWorkOrderVersion.AllowTimeImport = false;
                    var workOrderSaveCommand = getBaseWorkOrderVersionSaveCommand();

                    // remove fields that have been hidden when saving the work order version record
                    CleanWorkOrderVersionTimeMaterialFields();
                    CleanWorkOrderVersionExpenseFields();
                    CleanWorkOrderVersionClientSpecificFields();
                    CleanWorkOrderVersionPaymentRateFields();
                    workOrderSaveCommand.WorkOrderVersion.ExpenseApprovers = getCleanExpenseApproverList();

                    $scope.loadItemsPromise = AssignmentApiService.workOrderSave(workOrderSaveCommand).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, $state.current.name, action.successMessage || 'Work Order Saved');
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }

                function WorkOrderSubmit() {
                    onClickBeforeEvent();
                    $scope.CurrentWorkOrderVersion.TimeSheetPreviousApprovalRequired = false;
                    $scope.CurrentWorkOrderVersion.AllowTimeImport = false;

                    var workOrderSubmitCommand = getBaseWorkOrderVersionSaveCommand();

                    // make a copy of CurrentWorkOrderVersion before removing hidden fields, and rollback when submission failed
                    var CurrentWorkOrderVersionBackUp = angular.copy($scope.CurrentWorkOrderVersion);

                    // remove fields that have been hidden when saving the work order version record
                    CleanWorkOrderVersionTimeMaterialFields();
                    CleanWorkOrderVersionExpenseFields();
                    CleanWorkOrderVersionClientSpecificFields();
                    CleanWorkOrderVersionPaymentRateFields();
                    workOrderSubmitCommand.WorkOrderVersion.ExpenseApprovers = getCleanExpenseApproverList();

                    $scope.loadItemsPromise = AssignmentApiService.workOrderSubmit(workOrderSubmitCommand).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', 'Work Order Submitted');
                        },
                        function (responseError) {
                            angular.merge($scope.CurrentWorkOrderVersion, CurrentWorkOrderVersionBackUp);
                            onResponseError(responseError);
                        });
                }

                function WorkOrderFinalize() {
                    onClickBeforeEvent();
                    $scope.CurrentWorkOrderVersion.TimeSheetPreviousApprovalRequired = false;
                    $scope.CurrentWorkOrderVersion.AllowTimeImport = false;

                    var command = getBaseWorkOrderVersionSaveCommand();

                    // make a copy of CurrentWorkOrderVersion before removing hidden fields, and rollback when submission failed
                    var CurrentWorkOrderVersionBackUp = angular.copy($scope.CurrentWorkOrderVersion);

                    // remove fields that have been hidden when saving the work order version record
                    CleanWorkOrderVersionTimeMaterialFields();
                    CleanWorkOrderVersionExpenseFields();
                    CleanWorkOrderVersionClientSpecificFields();
                    CleanWorkOrderVersionPaymentRateFields();
                    command.WorkOrderVersion.ExpenseApprovers = getCleanExpenseApproverList();

                    $scope.loadItemsPromise = AssignmentApiService.workOrderFinalize(command).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', 'Work Order Finalized');
                        },
                        function (responseError) {
                            angular.merge($scope.CurrentWorkOrderVersion, CurrentWorkOrderVersionBackUp);
                            onResponseError(responseError);
                        });
                }

                function WorkOrderTerminate() {
                    var dialogConfig = {
                        title: 'Terminate Work Order',
                        header: 'This action will terminate the work order and cancel any future versions',
                        commentHeader: 'Enter the reason for termination',
                        isDatePickerRequired: true,
                        datePickerHeader: 'Termination Date',
                        isReasonRequired: true,
                        ReasonHeader: 'Termination Reason',
                        buttonNameForCancel: 'Discard',
                        buttonNameForSave: 'Proceed'
                    };
                    var dlg = dialogs.create('/Phoenix/modules/workorder/views/DialogWorkOrderUpdate.html', 'WorkOrderUpdateDialogController', dialogConfig, { keyboard: false, backdrop: 'static' });
                    dlg.result.then(function (resultModel) {
                        var dialogResult = 'Confirmed';
                        onClickBeforeEvent();
                        var workOrderTerminateCommand = {
                            WorkflowPendingTaskId: $scope.CurrentWorkOrderVersion.WorkflowPendingTaskId,
                            WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                            TerminationDate: resultModel.datePicker,
                            TerminationReasonId: resultModel.terminationReason,
                            AdditionalNotes: resultModel.comment
                        };
                        $scope.loadItemsPromise = AssignmentApiService.workOrderTerminate(workOrderTerminateCommand).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', 'Work Order Terminated');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (resultModel) {
                        var dialogResult = 'Not Confirmed';
                    });
                }

                function WorkOrderScheduleChange() {
                    var dialogConfig = { title: 'Schedule a Work Order Change', header: 'This action will create a new work order version', commentHeader: 'Enter the reason for the schedule change', buttonNameForCancel: 'Discard', buttonNameForSave: 'Proceed' };
                    dialogs.create('/Phoenix/modules/workorder/views/DialogWorkOrderUpdate.html', 'WorkOrderUpdateDialogController', dialogConfig, { keyboard: false, backdrop: 'static' }).result.then(function (resultModel) {
                        var dialogResult = 'Confirmed';
                        onClickBeforeEvent();
                        var workOrderScheduleChangeCommand = { WorkflowPendingTaskId: $scope.CurrentWorkOrderVersion.WorkflowPendingTaskId, WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id, AdditionalNotes: resultModel.comment };
                        $scope.loadItemsPromise = AssignmentApiService.workOrderScheduleChange(workOrderScheduleChangeCommand).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', 'Work Order Schedule Changed');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (resultModel) {
                        var dialogResult = 'Not Confirmed';
                    });
                }

                function WorkOrderCorrect() {
                    var dialogConfig = { title: 'Correct a Work Order Version', header: 'This action will replace the selected work order version', commentHeader: 'Enter reason for correction', buttonNameForCancel: 'Discard', buttonNameForSave: 'Proceed' };
                    var dlg = dialogs.create('/Phoenix/modules/workorder/views/DialogWorkOrderUpdate.html', 'WorkOrderUpdateDialogController', dialogConfig, { key: false, back: 'static' });
                    dlg.result.then(function (resultModel) {
                        var dialogResult = 'Confirmed';
                        onClickBeforeEvent();
                        var workOrderCorrectCommand = { WorkflowPendingTaskId: $scope.CurrentWorkOrderVersion.WorkflowPendingTaskId, WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id, AdditionalNotes: resultModel.comment };
                        $scope.loadItemsPromise = AssignmentApiService.workOrderCorrect(workOrderCorrectCommand).then(
                            function (responseSucces) {
                                onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, 'workorder.edit.core', 'Work Order Corrected');
                            },
                            function (responseError) {
                                onResponseError(responseError);
                            });
                    }, function (resultModel) {
                        var dialogResult = 'Not Confirmed';
                    });
                }

                function TransactionHeaderManualNew() {
                    onClickBeforeEvent();

                    $scope.loadItemsPromise = AssignmentApiService.transactionHeaderManualNew({ WorkflowPendingTaskId: $scope.CurrentWorkOrderVersion.WorkflowPendingTaskId, WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id }).then(
                        function (responseSucces) {
                            toUnregisterFunctions().then(
                                function (unregisterFunctionsSucces) {
                                    commonDataService.setWatchConfigOnWorkflowEvent('transaction.manual.detail', 'workorder.edit', ApplicationConstants.EntityType.Assignment, ApplicationConstants.EntityType.WorkOrderVersion, $state.params.workOrderVersionId, { transactionHeaderId: responseSucces.EntityIdRedirect });
                                    $state.transitionTo('transaction.manual.detail', { transactionHeaderId: responseSucces.EntityIdRedirect }, { reload: true, inherit: true, notify: true });
                                });
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }

                function TransactionHeaderAdjustmentSubmit() {
                    onClickBeforeEvent();
                    $state.transitionTo('transaction.adjustment', { workOrderVersionId: $state.params.workOrderVersionId, userProfileId: $scope.model.entity.UserProfileIdWorker }, { reload: true, inherit: true, notify: true });
                }

                function TransactionHeaderReleaseVacationPaySubmit() {
                    onClickBeforeEvent();
                    $state.go('ngtwo.m', { p: 'transaction/releasevacationpay/' + $state.params.workOrderVersionId });
                }
            },

            getWorkOrderVersionAvailableActions: function (workOrderVersionId) {
                var self = this;
                var deferred = $q.defer();

                WorkflowApiService.getWorkflowAvailableActions(self, $scope.CurrentWorkOrderVersion, ApplicationConstants.EntityType.WorkOrderVersion).then(
                    function (responseSuccess) {
                        angular.forEach(self.WorkflowAvailableActions, function (action) {
                            if (action.Name.indexOf('@') === 0) {
                                action.Name = action.Name.substring(1);
                            }
                            if (action.CommandName == 'WorkOrderSendNotificationOnSubmitApprove') {
                                //getTrackFieldChangeBySelf was removed
                                //UtilityDataChangeTrackerApiService.getTrackFieldChangeBySelf(ApplicationConstants.EntityType.WorkOrderVersion, workOrderVersionId).then(
                                //    function (responseSuccess) {
                                //        self.trackFieldChanges = responseSuccess.Items;
                                //    },
                                //    function (responseError) {
                                //        var e = responseError;
                                //    });
                            }
                            else if (action.CommandName == 'WorkOrderCancel') {
                                if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                                    action.Name = 'Discard';
                                }
                                else {
                                    action.Name = 'Cancel';
                                }
                            }
                            if (action.CommandName == 'WorkOrderSave' &&
                                ($scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Draft ||
                                $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Recalled ||
                                $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Declined ||
                                $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.ComplianceDraft ||
                                $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.RecalledCompliance)) {
                                self.WorkflowAvailableActions.push({Name: 'Cancel', CommandName: 'WorkOrderDiscardChanges', IsActionButton: true, DisplayButtonOrder: 0});
                            }
                        });
                        if (ApplicationConstants.UserProfileType.WorkerTemp != $scope.model.entity.workerProfileTypeId) {
                            _.remove(self.WorkflowAvailableActions, function (item) { return item.CommandName == "TransactionHeaderReleaseVacationPaySubmit" })
                        }
                        if ($scope.CurrentWorkOrder.IsPaymentStopped) {
                            _.remove(self.WorkflowAvailableActions, function (item) { return item.CommandName == "WorkOrderPaymentStop" });
                        }
                        else {
                            self.WorkflowAvailableActions.some(function (action) { return action.CommandName === 'WorkOrderPaymentResume' })
                            {
                                _.remove(self.WorkflowAvailableActions, function (item) { return item.CommandName == "WorkOrderPaymentResume" });
                            }
                        }

                        deferred.resolve(responseSuccess);
                    },
                    function (responseError) {
                        deferred.reject(responseError);
                    });
                return deferred.promise;
            },

            getTrackFieldChange: function (tableSchemaName, tableName, columnName, entityId) {
                if (_.find($scope.workflow.trackFieldChanges, function (item) {
                    return item.TableSchemaName == tableSchemaName &&
                        item.TableName == tableName &&
                        item.ColumnName == columnName &&
                        item.New_EntityId == entityId;
                })) {
                    return 'alert-danger bold';
                    //return 'label-warning';
                    //return 'label-info';
                }
                else {
                    return '';
                }
            },
        };

        $scope.html = {
            show: {
                t4Form: false,
                t4AForm: false
            },

            t4AEffectiveYear: null,

            calculateVisibility: function () {
                var self = this;

                var assignment = $scope.model.entity;
                var worker = AssignmentCommonFunctionalityService.getWorker(assignment, $scope.lists.listUserProfileWorker);
                var wov = $scope.CurrentWorkOrderVersion;

                self.calculateT4T4AVisibility(worker, wov);
            },

            calculateT4T4AVisibility: function (worker, wov) {
                var self = this;
                
                var excludedWovStatuses = [WORK_ORDER_STATUS.Replaced, WORK_ORDER_STATUS.Cancelled, WORK_ORDER_STATUS.Discarded];
                
                var clientId = wov.BillingInfoes[0].OrganizationIdClient;
                var effectiveDate = wov.EffectiveDate;
                var endDate = wov.wovEndDate;
                
                var showTAForm = false;
                var t4AEffectiveYear = null;
                
                if (excludedWovStatuses.indexOf(wov.StatusId) == -1 && worker.ProfileTypeId == PROFILE_TYPES.WorkerCanadianSp && clientId > 0 && (effectiveDate != null || endDate != null)) {

                    var wovEffectiveYear = effectiveDate ? moment(effectiveDate, 'YYYY-MM-DD').year() : null;
                    var wovEndYear = endDate ? moment(endDate, 'YYYY-MM-DD').year() : null;
                    var yearToCompare = wovEndYear != null ? wovEndYear : wovEffectiveYear; // If end date isn't set (e.g. Draft), use start/effective date
                    
                    // Find T4A Government Ruling for this work order client and effective year
                    var effectiveRuling = _.find(worker.UserProfileWorkerSPGovernmentRulings, function(ruling) {
                        return ruling.OrganizationIdClient == clientId && ruling.EffectiveYear <= yearToCompare;
                    });
                    if (effectiveRuling != null) {
                        showTAForm = true;
                        t4AEffectiveYear = effectiveRuling.EffectiveYear;
                    }
                }

                self.show.t4AForm = showTAForm;
                self.t4AEffectiveYear = t4AEffectiveYear;
            }
        }

        function onClickBeforeEvent(viewLoading) {
            $scope.model.ValidationMessages = [];
            AssignmentDataService.setValidationMessages([]);
            lockScreen();
            //currentUserEvent = true;
        }

        function lockScreen() {
            $scope.actionButton.showToDisable();
            //$scope.actionButton.show.workOrderAddRemoveSubEntities = false;
            $scope.workflow.runningStatus.IsRunning = true;
        }

        function onResponseSuccesWatchWorkflowEvent(workOrderVersionId, stateName, successMessage) {
            $scope.workflow.WorkflowAvailableActions = [];
            // Bug 20095. We will go to another screen ultimately when the workflow finishes. Lock this screen.
            var d = $q.defer();
            $scope.$on('$stateChangeStart', function () {
                d.resolve();
            });
            $scope.loadItemsPromise = d.promise;

            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateName, 'workorder.edit', ApplicationConstants.EntityType.Assignment, ApplicationConstants.EntityType.WorkOrderVersion, workOrderVersionId, { assignmentId: 0, workOrderId: 0, workOrderVersionId: workOrderVersionId });
            $scope.triggerToRefreshComplianceDocument++;
        }

        function onResponseError(responseError) {
            $scope.loadItemsPromise = null;
            $scope.workflow.runningStatus.IsRunning = false;
            $scope.actionButton.showToRecalc();
            $scope.html.calculateVisibility();
            $scope.model.ValidationMessages = common.responseErrorMessages(responseError);
            $scope.triggerToRefreshComplianceDocument++;
        }

        function stateGoWorkorderSearch(toUnbindWorkOrderEvents) {
            toUnbindWorkOrderEvents = toUnbindWorkOrderEvents != []._ ? toUnbindWorkOrderEvents : false;
            AssignmentDataService.setAssignment({});
            if (toUnbindWorkOrderEvents) {
                $scope.unbindWorkOrderEvents('stateChangeWatchOff');
            }
            $state.go('workorder.search');
        }

        $scope.unregisterFunctionList.push(phoenixsocket.onPublic('UserProfileWorkerIsActivated', function (event, data) {
            if (data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfileWorkerCanadianInc ||
                data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfileWOrkerCanadianSP ||
                data.GroupingEntityTypeId == ApplicationConstants.EntityType.WorkerUnitedStatesW2 ||
                data.GroupingEntityTypeId == ApplicationConstants.EntityType.WorkerUnitedStatesLLC ||
                data.GroupingEntityTypeId == ApplicationConstants.EntityType.UserProfileWorkerTemp) {
                var result = _.find($scope.lists.listUserProfileWorker, function (item) {
                    return (item.Id == data.TargetEntityId);
                });
                if (result === null || typeof (result) === 'undefined') {
                    AssignmentDataService.setListUserProfileWorker([]);
                    AssignmentApiService.getListUserProfileWorker().then(
                        function (response) {
                            $scope.lists.listUserProfileWorker = response;
                        },
                        function (responseError) {

                        });
                }
            }
        }));

        function toUnregisterFunctions() {
            var result = $q.defer();
            if ($scope.unregisterFunctionList && $scope.unregisterFunctionList.length) {
                for (var i = 0; i < $scope.unregisterFunctionList.length; i++) {
                    if (typeof $scope.unregisterFunctionList[i] === 'function') {
                        $scope.unregisterFunctionList[i]();
                    }
                }
                result.resolve({});
            }
            return result.promise;
        }

        $scope.$on('$destroy', function () {
            toUnregisterFunctions();
        });

        $scope.workOrderVersionChange = function (assignmentId, workOrderId, workOrderVersionId, stateName) {
            stateName = stateName || $state.current.name;
            $state.transitionTo(stateName, { assignmentId: assignmentId, workOrderId: workOrderId, workOrderVersionId: workOrderVersionId }, { reload: true, inherit: true, notify: true });
        };

        $scope.templateControl = {};

        // remove fields that have been hidden when saving/submitting the work order version record
        function CleanWorkOrderVersionTimeMaterialFields() {

            var wov = $scope.CurrentWorkOrderVersion;
            [
                'TimeSheetCycleId',
                'TimeSheetApprovers',
                'TimeSheetApprovalFlowId',
                'IsTimeSheetUsesProjects',
                'BillingTransactionGenerationMethodId',
                'VmsWorkOrderReference', // third party worker id
                'IsDisplayEstimatedInvoiceAmount',
                'IsDisplayEstimatedPaymentAmount',
                'TimeSheetDescription',
            ].map(function (prop) {

                if (prop === 'PaymentInvoice') {
                    ClearHiddenPaymentInvoice();
                }

                if (!AssignmentValidationService.isPropertyValidForTimeSheetMethodology(prop, wov.TimeSheetMethodologyId)) {
                    switch (prop) {
                        case 'TimeSheetApprovers': wov[prop] = []; break;
                        case 'BillingInvoice': ClearBillingInvoice(); break;
                        case 'PaymentInvoice': ClearPaymentInvoice(); break;
                        case 'IsTimeSheetUsesProjects': {
                            wov[prop] = null;
                            ClearBillingTransactionGenerationMethodId();
                            break;
                        };
                        default: wov[prop] = null; break;
                    }
                } else {

                    if (prop === 'IsTimeSheetUsesProjects') {
                        if (wov[prop] === false) {
                            ClearBillingTransactionGenerationMethodId();
                        }
                    }

                }

            });

            // reset the approval flow id if the approval flow is valid and when approvers is one or less
            if (AssignmentValidationService.isPropertyValidForTimeSheetMethodology('TimeSheetApprovalFlowId', wov.TimeSheetMethodologyId)) {
                if (!wov.TimeSheetApprovers || wov.TimeSheetApprovers.length === 1) {
                    wov.TimeSheetApprovalFlowId = 2;
                }
            } else {
                wov.TimeSheetApprovalFlowId = null;
            }

            function ClearBillingInvoice() {
                if (wov.BillingInfoes) {
                    wov.BillingInfoes.map(function (info) {
                        // clear invoice
                        info.BillingInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 1; })
                            .map(function (inv) {
                                inv.BillingFrequencyId = null;
                                inv.BillingInvoiceTemplateId = null;
                                inv.BillingInvoiceTermsId = null;
                                // clear recipients
                                inv.BillingRecipients = inv.BillingRecipients
                                    .filter(function (rec) { return rec.RecipientTypeId === 1; })
                                    .map(function (rec) {
                                        rec.DeliveryMethodId = null;
                                        rec.UserProfileId = null;
                                        rec.DeliverToUserProfileId = null;
                                        return rec;
                                    });
                                inv.InvoiceNote1 = null;
                                inv.InvoiceNote2 = null;
                                inv.InvoiceNote3 = null;
                                inv.InvoiceNote4 = null;
                                inv.IsUsesAlternateBilling = null;
                                inv.OrganizatonClientRoleAlternateBillingId = null;
                                inv.BillingTransactionGenerationMethodId = null;
                                return inv;
                            });
                    });
                }
            }

            function ClearBillingTransactionGenerationMethodId() {
                if (wov.BillingInfoes) {
                    wov.BillingInfoes.map(function (info) {
                        // clear invoice
                        info.BillingInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 1; })
                            .map(function (inv) {
                                inv.BillingTransactionGenerationMethodId = null;
                                return inv;
                            });
                    });
                }
            }

            function ClearHiddenPaymentInvoice() {
                if (wov.PaymentInfoes) {
                    wov.PaymentInfoes.map(function (info) {
                        info.PaymentInvoices
                            .map(function (inv) {
                                if (inv.PaymentInvoiceTermsId === ApplicationConstants.PaymentInvoiceTerms.ScheduledTerms) {
                                    inv.PaymentFrequency = null;
                                } else if (inv.PaymentInvoiceTermsId === ApplicationConstants.PaymentInvoiceTerms.Term) {
                                    inv.PaymentReleaseScheduleId = null;
                                } else {
                                    inv.PaymentFrequency = null;
                                    inv.PaymentReleaseScheduleId = null;
                                }
                            });
                    });
                };
            }

            function ClearPaymentInvoice() {
                if (wov.PaymentInfoes) {
                    wov.PaymentInfoes.map(function (info) {
                        // clear invoice
                        info.PaymentInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 1; })
                            .map(function (inv) {
                                inv.PaymentFrequency = null;
                                inv.PaymentInvoiceTemplateId = null;
                                inv.PaymentInvoiceTermsId = null;
                                inv.PaymentMethodId = null;
                                inv.PaymentReleaseScheduleId = null;
                                return inv;
                            });
                    });
                }
            }

        }

        // remove fields that have been hidden when saving/submitting the work order version record
        function CleanWorkOrderVersionExpenseFields() {

            var wov = $scope.CurrentWorkOrderVersion;
            [
                'ExpenseApprovers',
                'ExpenseApprovalFlowId',
                'IsExpenseUsesProjects',
                'BillingTransactionGenerationMethodId',
                'ExpenseThirdPartyWorkerReference', // third party worker id
                'IsExpenseRequiresOriginal',
                'ExpenseDescription',
                'BillingInvoice',
                'PaymentInvoice',
            ].map(function (prop) {

                if (prop === 'PaymentInvoice') {
                    ClearHiddenPaymentInvoice();
                }

                if (!AssignmentValidationService.isPropertyValidForExpenseMethodology(prop, wov.ExpenseMethodologyId)) {
                    switch (prop) {
                        case 'ExpenseApprovers': wov[prop] = []; break;
                        case 'BillingInvoice': ClearBillingInvoice(); break;
                        case 'PaymentInvoice': ClearPaymentInvoice(); break;
                        case 'IsExpenseUsesProjects': {
                            wov[prop] = null;
                            ClearBillingTransactionGenerationMethodId();
                            break;
                        };
                        default: wov[prop] = null; break;
                    }
                } else {

                    if (prop === 'IsExpenseUsesProjects') {
                        if (wov[prop] === false) {
                            ClearBillingTransactionGenerationMethodId();
                        }
                    }

                }
            });

            // reset the approval flow id if the approval flow is valid and when client approvers is one or less
            if (AssignmentValidationService.isPropertyValidForExpenseMethodology('ExpenseApprovalFlowId', wov.ExpenseMethodologyId)) {
                if (!wov.ExpenseApprovers || wov.ExpenseApprovers.filter(function (appr) { return appr.ApproverTypeId === 1; }).length === 1) {
                    wov.ExpenseApprovalFlowId = 2;
                }
            } else {
                wov.ExpenseApprovalFlowId = null;
            }


            // clear the expense billing and payment info values if "No Expense" is selected, DO NOT REMOVE
            function ClearBillingInvoice() {
                if (wov.BillingInfoes) {
                    wov.BillingInfoes.map(function (info) {
                        // clear invoice
                        info.BillingInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 2; })
                            .map(function (inv) {
                                inv.BillingFrequencyId = null;
                                inv.BillingInvoiceTemplateId = null;
                                inv.BillingInvoiceTermsId = null;
                                // clear recipients
                                inv.BillingRecipients = inv.BillingRecipients
                                    .filter(function (rec) { return rec.RecipientTypeId === 1; })
                                    .map(function (rec) {
                                        rec.DeliveryMethodId = null;
                                        rec.UserProfileId = null;
                                        rec.DeliverToUserProfileId = null;
                                        return rec;
                                    });
                                inv.InvoiceNote1 = null;
                                inv.InvoiceNote2 = null;
                                inv.InvoiceNote3 = null;
                                inv.InvoiceNote4 = null;
                                inv.IsUsesAlternateBilling = null;
                                inv.OrganizatonClientRoleAlternateBillingId = null;
                                inv.BillingTransactionGenerationMethodId = null;
                                return inv;
                            });
                    });
                }
            }

            function ClearHiddenPaymentInvoice() {
                if (wov.PaymentInfoes) {
                    wov.PaymentInfoes.map(function (info) {
                        info.PaymentInvoices
                            .map(function (inv) {
                                if (inv.PaymentInvoiceTermsId === ApplicationConstants.PaymentInvoiceTerms.ScheduledTerms) {
                                    inv.PaymentFrequency = null;
                                } else if (inv.PaymentInvoiceTermsId === ApplicationConstants.PaymentInvoiceTerms.Term) {
                                    inv.PaymentReleaseScheduleId = null;
                                } else {
                                    inv.PaymentFrequency = null;
                                    inv.PaymentReleaseScheduleId = null;
                                }
                            });
                    });
                };
            }

            function ClearBillingTransactionGenerationMethodId() {
                if (wov.BillingInfoes) {
                    wov.BillingInfoes.map(function (info) {
                        // clear invoice
                        info.BillingInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 2; })
                            .map(function (inv) {
                                inv.BillingTransactionGenerationMethodId = null;
                                return inv;
                            });
                    });
                }
            }

            function ClearPaymentInvoice() {
                if (wov.PaymentInfoes) {
                    wov.PaymentInfoes.map(function (info) {
                        // clear invoice
                        info.PaymentInvoices
                            .filter(function (inv) { return inv.InvoiceTypeId === 2; })
                            .map(function (inv) {
                                inv.PaymentFrequency = null;
                                inv.PaymentInvoiceTemplateId = null;
                                inv.PaymentInvoiceTermsId = null;
                                inv.PaymentMethodId = null;
                                inv.PaymentReleaseScheduleId = null;
                                return inv;
                            });
                    });
                }
            }

        }

        function getCleanExpenseApproverList() {

            var filteredApproveres = [];
            angular.forEach($scope.CurrentWorkOrderVersion.ExpenseApprovers, function (approver, i) {

                if (approver.UserProfileId) {
                    filteredApproveres.push(approver);
                }
            });
            return filteredApproveres;
        }

        function CleanWorkOrderVersionClientSpecificFields() {
            if (_.isEmpty($scope.CurrentWorkOrderVersion.ClientBasedEntityCustomFieldValue)) {
                delete $scope.CurrentWorkOrderVersion.ClientBasedEntityCustomFieldValue;
            }
        }

        function CleanWorkOrderVersionPaymentRateFields() {
            if ($scope.model.entity.workerProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp) {
                $scope.CurrentWorkOrderVersion.PaymentInfoes.forEach(function(paymentInfo) {
                    paymentInfo.PaymentRates.forEach(function(paymentRate) {
                        if (paymentRate.RateUnitId !== ApplicationConstants.RateUnit.Hour && paymentRate.RateUnitId !== ApplicationConstants.RateUnit.Day) {
                            paymentRate.IsApplyStatHoliday = null;
                        }
                    });
                });
            }
        }

        function getBaseWorkOrderVersionSaveCommand() {
            return {
                WorkflowPendingTaskId: $scope.CurrentWorkOrderVersion.WorkflowPendingTaskId,
                AssignmentId: $scope.CurrentWorkOrder.AssignmentId,
                WorkOrderId: $scope.CurrentWorkOrder.Id,

                UserProfileIdWorker: $scope.model.entity.UserProfileIdWorker,
                OrganizationIdInternal: $scope.model.entity.OrganizationIdInternal,


                StartDate: $scope.editableWorkOrderStartDateState() === true ?
                    $scope.CurrentWorkOrderVersion.WorkOrderStartDateState : $scope.CurrentWorkOrder.StartDate,
                EndDate: $scope.editableWorkOrderEndDateState() === true ?
                    $scope.CurrentWorkOrderVersion.WorkOrderEndDateState : $scope.CurrentWorkOrder.EndDate,

                WorkOrderVersion: $scope.CurrentWorkOrderVersion
            };
        }

    }

})(angular, Phoenix.App);