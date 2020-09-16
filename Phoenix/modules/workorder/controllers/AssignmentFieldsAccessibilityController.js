/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AssignmentFieldsAccessibilityController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.workorder.controllers').controller(controllerId,
        ['$scope', '$parse', '$state', 'common', AssignmentFieldsAccessibilityController]);


    function AssignmentFieldsAccessibilityController($scope, $parse, $state, common) {

        $scope.correction = function () {
            return ($scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionLatest ||
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionMiddle ||
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique);
        }

        $scope.editableStartAndEndDate = function () {
            var editable = false;
            if ($scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.New
                && $scope.CurrentWorkOrderVersion.StatusId === ApplicationConstants.WorkOrderStatus.PendingReview) {
                editable = true;
            } else if ($scope.currentProfileUnderAccountingRole() || $scope.currentProfileIsSystemAdministrator()) {
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                    editable = true;
                }

                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.Extend) {
                    editable = true;
                }

                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.correction()) {
                    editable = true;
                }

                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.ScheduleChange) {
                    editable = false;
                }
            }

            return editable;
        }

        $scope.editableInternalCompany = function () {
            var editable = false;
            if ($scope.currentProfileUnderAccountingRole() || $scope.currentProfileIsSystemAdministrator()) {
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                    editable = true;
                }
            }
            if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                $scope.correction()) {
                editable = true;
            }

            if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.ScheduleChange) {
                editable = false;
            }

            if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.Extend) {
                editable = false;
            }

            return editable;
        }

        $scope.editableRatesAndLineOfBusiness = function () {
            var editable = false;
            if ($scope.currentProfileUnderAccountingRole() || $scope.currentProfileIsSystemAdministrator()) {
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                    editable = true;
                }
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.Extend) {
                    editable = true;
                }
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId === ApplicationConstants.WorkOrderCreationReason.ScheduleChange) {
                    editable = true;
                }
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.correction()) {
                    editable = true;
                }
            }

            return editable;
        }

        $scope.editableComplianceDraftFields = function () {
            return $scope.CurrentWorkOrderVersion.IsComplianceDraftStatus && $scope.CurrentWorkOrderVersion.IsComplianceDraftStatus;
        }

        $scope.displayWorkOrderStartDateState = function () {
            return ($scope.CurrentWorkOrderVersion.IsDraftStatus || $scope.CurrentWorkOrderVersion.IsComplianceDraftStatus || $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.PendingReview) &&
                (
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
                );
        };

        $scope.editableWorkOrderStartDateState = function () {
            if (!$scope.displayWorkOrderStartDateState()) {
                return false;
            }

            if ($scope.model.entity.AtsPlacementId > 0) {
                return $scope.editableStartAndEndDate();
            } else {
                return true;
            }
        };

        $scope.displayWorkOrderEndDateState = function () {
            return ($scope.CurrentWorkOrderVersion.IsDraftStatus || $scope.CurrentWorkOrderVersion.IsComplianceDraftStatus || $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.PendingReview) &&
                (
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionLatest ||
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
                );
        };

        $scope.editableWorkOrderEndDateState = function () {
            if (!$scope.displayWorkOrderEndDateState()) {
                return false;
            }

            if ($scope.model.entity.AtsPlacementId > 0) {
                return $scope.editableStartAndEndDate();
            } else {
                return true;
            }
        };

        $scope.ptFieldViewMessages = function (message) {
            common.logWarning(message);
        };

        $scope.ptFieldViewEventOnChangeStatusId = function (modelPrefix, fieldName, modelValidation) {
            if (fieldName === 'WorkOrderStartDateState' && !$scope.editableWorkOrderStartDateState()) {
                return ApplicationConstants.viewStatuses.view;
            }

            if (fieldName === 'WorkOrderEndDateState' && !$scope.editableWorkOrderEndDateState()) {
                return ApplicationConstants.viewStatuses.view;
            }

            if ($scope.model.entity.AtsPlacementId > 0) {

                if (fieldName === 'Rate' || fieldName === 'RateUnitId') {
                    if ($scope.editableRatesAndLineOfBusiness()) {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                }

                if (fieldName === 'LineOfBusinessId' && $scope.editableRatesAndLineOfBusiness()) {
                    return ApplicationConstants.viewStatuses.edit;
                }

                if (fieldName === 'OrganizationIdInternal' && $scope.editableInternalCompany()) {
                    return ApplicationConstants.viewStatuses.edit;
                }


                if (modelPrefix == 'CurrentWorkOrder' && (fieldName == 'StartDate' || fieldName == 'EndDate')) {
                    if ($scope.CurrentWorkOrderVersion.IsComplianceDraftStatus && $scope.currentProfileUnderComplianceRole())
                        return ApplicationConstants.viewStatuses.edit;
                    else
                        return ApplicationConstants.viewStatuses.view;
                }

                if (modelPrefix == 'billingInfo' && fieldName == 'RateUnitId' && modelValidation && $scope.CurrentWorkOrderVersion.BillingInfoes[0].Id == modelValidation.Id) {
                    return ApplicationConstants.viewStatuses.view;
                }

                if (modelPrefix == 'paymentInfo' && fieldName == 'RateUnitId' && modelValidation && $scope.CurrentWorkOrderVersion.PaymentInfoes[0].Id == modelValidation.Id) {
                    return ApplicationConstants.viewStatuses.view;
                }

                if (modelPrefix == 'billingRate' && fieldName == 'Rate' && modelValidation && $scope.CurrentWorkOrderVersion.BillingInfoes[0].Id == modelValidation.Id) {
                    return ApplicationConstants.viewStatuses.view;
                }

                if (modelPrefix == 'paymentRate' && fieldName == 'Rate' && modelValidation && $scope.CurrentWorkOrderVersion.PaymentInfoes[0].Id == modelValidation.Id) {
                    return ApplicationConstants.viewStatuses.view;
                }
            }

            if (modelPrefix == 'CurrentWorkOrderVersion' && fieldName == 'LineOfBusinessId' && modelValidation && modelValidation.LineOfBusinessId > 0) {
                return ApplicationConstants.viewStatuses.view;
            }


            if (fieldName == 'TimeSheetPreviousApprovalRequired') {
                return ApplicationConstants.viewStatuses.hideFormGroup;
            }

            if ($scope.workflow.runningStatus.IsRunning) {
                return ApplicationConstants.viewStatuses.view;
            }

            if (modelPrefix == 'model.purchaseOrderEntity.PurchaseOrderLines[model.purchaseOrderLineIndex]') {
                return ApplicationConstants.viewStatuses.view;
            }

            if (modelPrefix == 'model.entity' && (fieldName == 'OrganizationIdInternal' || fieldName == 'UserProfileIdWorker')) {
                if ($scope.model.entity.IsDraftStatus) {
                    return ApplicationConstants.viewStatuses.edit;
                }
                else {
                    return ApplicationConstants.viewStatuses.view;
                }
            }

            if (modelPrefix == 'CurrentWorkOrder' &&
                ($scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Active ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Replaced ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.PendingReview ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Cancelled ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Terminated ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.PendingUnterminate ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Discarded ||
                    $scope.CurrentWorkOrder.StatusId == ApplicationConstants.WorkOrderStatus.Expired ||
                    ($scope.CurrentWorkOrderVersion.IsComplianceDraftStatus && !$scope.CurrentWorkOrderVersion.IsDraftStatus)
                )) {
                return ApplicationConstants.viewStatuses.view;
            }

            if (modelPrefix == 'CurrentWorkOrder' && (fieldName == 'StartDate' || fieldName == 'EndDate')) {
                if ($scope.CurrentWorkOrder.IsDraftStatus) {
                    return ApplicationConstants.viewStatuses.edit;
                }
                else {
                    return ApplicationConstants.viewStatuses.view;
                }
            }

            if (
                (
                    modelPrefix == 'CurrentWorkOrderVersion' ||
                    modelPrefix == "timeSheetApprover" ||
                    modelPrefix == "expenseApprover" ||
                    modelPrefix == 'billingInfo' ||
                    modelPrefix == 'billingInvoice' ||
                    modelPrefix == 'billingRate' ||
                    modelPrefix == 'billingRecipient' ||
                    modelPrefix == 'billingSalesTax' ||
                    modelPrefix == 'paymentInfo' ||
                    modelPrefix == 'paymentInvoice' ||
                    modelPrefix == 'paymentRate' ||
                    modelPrefix == 'paymentContact' ||
                    modelPrefix == 'paymentSourceDeduction' ||
                    modelPrefix == 'paymentOtherEarning' ||
                    modelPrefix == 'paymentSalesTax' ||
                    modelPrefix == "CurrentWorkOrderVersion.JobOwner" ||
                    modelPrefix == "support" ||
                    modelPrefix == "recruiter" ||
                    modelPrefix == "commission"
                ) &&
                (
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Active ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Replaced ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.PendingReview ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Cancelled ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Terminated ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.PendingUnterminate ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Discarded ||
                    $scope.CurrentWorkOrderVersion.StatusId == ApplicationConstants.WorkOrderStatus.Expired ||
                    ($scope.CurrentWorkOrderVersion.IsComplianceDraftStatus && !$scope.CurrentWorkOrderVersion.IsDraftStatus)
                )
            ) {
                return ApplicationConstants.viewStatuses.view;
            }

            if (modelPrefix == 'CurrentWorkOrderVersion' && fieldName == 'EffectiveDate') {
                if ($scope.CurrentWorkOrderVersion.IsDraftStatus &&
                    $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.ScheduleChange
                ) {
                    return ApplicationConstants.viewStatuses.edit;
                }
                else {
                    return ApplicationConstants.viewStatuses.view;
                }
            }

            if (((modelPrefix == 'paymentInfo' && (fieldName == 'IsUseUserProfileWorkerSourceDeduction' || fieldName == 'SubdivisionIdSourceDeduction')) || modelPrefix == 'paymentSourceDeduction')
                && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.WorkOrderVersionChangePaymentSourceDeduction)) {
                return ApplicationConstants.viewStatuses.view;
            }

            // Only editable in a Compliance 'Draft' status by Accounting
            if (!$scope.editableComplianceDraftFields() && (
                (!$scope.model.entity.AtsPlacementId && modelPrefix == 'paymentRate' && (
                    fieldName == 'IsApplyDeductions' ||
                    fieldName == 'IsApplyVacation' ||
                    fieldName == 'IsApplyStatHoliday'
                )) ||
                (modelPrefix == 'billingInvoice' && (
                    fieldName == 'BillingInvoicePresentationStyleId' ||
                    fieldName == 'BillingInvoiceTermsId' ||
                    fieldName == 'BillingInvoiceTemplateId' ||
                    fieldName == 'BillingConsolidationTypeId'
                )) ||
                (modelPrefix == 'paymentInvoice' && (
                    fieldName == 'PaymentMethodId'
                ) ||
                    $state.current.name === 'workorder.edit.earningsanddeductions' ||
                    $state.current.name == 'workorder.edit.taxes'
                )
            )) {
                return ApplicationConstants.viewStatuses.view;
            }

            if ($scope.model.entity.IsDraftStatus) {
                return ApplicationConstants.viewStatuses.edit;
            }

            return ApplicationConstants.viewStatuses.edit;
        };

        $scope.model.ptFieldViewConfigOnChangeStatusId = {
            funcToCheckViewStatus: 'ptFieldViewEventOnChangeStatusId',
            //watchChangeEvent: 'CurrentWorkOrderVersion.StatusId',
            watchChangeEvent: '[CurrentWorkOrderVersion.StatusId, workflow.runningStatus.IsRunning]',
            //watchChangeEvent: 'qAll',
            funcToPassMessages: 'ptFieldViewMessages'
        };

        $scope.ValidToAddBillingRate = function (billingRates) {
            var result = _.find(billingRates, function (billingRate) {
                return (billingRate.RateTypeId == null || billingRate.RateUnitId == null || billingRate.Rate == null);
            });
            return !result;
        };

    }

})(angular, Phoenix.App);