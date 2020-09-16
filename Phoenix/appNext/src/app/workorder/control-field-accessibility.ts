import { IWorkOrder } from './state';
import { PhxConstants, CommonService } from '../common';
import { find, filter } from 'lodash';
import { WorkOrdernWorkflowComponent } from './workorder-workflow/workorder-workflow.component';
import { AuthService } from '../common/services/auth.service';

class TFConstants {
  static view = 0;
  static edit = 1;
  static hideElement = 2;
  static hideFormGroup = 3;
}

export class ControlFieldAccessibility {
  static workorder: IWorkOrder;
  static routerState: any;

  public static correction(workorder: IWorkOrder) {
    return (
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionLatest ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionMiddle ||
      workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
    );
  }

  public static editableStartAndEndDate(workorder: IWorkOrder) {
    let editable = false;
    if (workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.New && workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingReview) {
      editable = true;
    } else if (this.currentProfileUnderAccountingRole() || this.currentProfileIsSystemAdministrator()) {
      if (workorder.WorkOrderVersion.IsDraftStatus) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.Extend) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && this.correction(workorder)) {
        editable = true;
      }

      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        editable = false;
      }
    }

    return editable;
  }
  public static currentProfileUnderCertainRoles() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, function (item) {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.AccountManager ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.ClientServices ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.ClientServicesLead ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BranchManager ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Executive
        );
      }).length > 0
    );
  }


  public static currentProfileUnderAccountingRole() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, function (item) {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.AccountsReceivable ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP
        );
      }).length > 0
    );
  }

  public static currentProfileIsSystemAdministrator() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, function (item) {
        return item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator;
      }).length > 0
    );
  }

  public static currentProfileUnderComplianceRole() {
    return (
      filter(WorkOrdernWorkflowComponent.currentProfile.FunctionalRoles, item => {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP
        );
      }).length > 0
    );
  }

  public static editableInternalCompany(workorder: IWorkOrder) {
    let editable = false;
    if (this.currentProfileUnderAccountingRole() || this.currentProfileIsSystemAdministrator()) {
      if (workorder.WorkOrderVersion.IsDraftStatus) {
        editable = true;
      }
    }
    if (workorder.WorkOrderVersion.IsDraftStatus && this.correction(workorder)) {
      editable = true;
    }

    if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.ScheduleChange) {
      editable = false;
    }

    if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.Extend) {
      editable = false;
    }

    return editable;
  }

  public static editableRatesAndLineOfBusiness(workorder: IWorkOrder) {
    let editable = false;
    if (this.currentProfileUnderAccountingRole() || this.currentProfileIsSystemAdministrator()) {
      if (workorder.WorkOrderVersion.IsDraftStatus) {
        editable = true;
      }
      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.Extend) {
        editable = true;
      }
      if (workorder.WorkOrderVersion.IsDraftStatus && workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        editable = true;
      }
      if (workorder.WorkOrderVersion.IsDraftStatus && this.correction(workorder)) {
        editable = true;
      }
    }
    return editable;
  }

  public static editableComplianceDraftFields(workorder: IWorkOrder) {
    return workorder.WorkOrderVersion.IsComplianceDraftStatus;
  }

  public static displayWorkOrderStartEndDateState(workorder: IWorkOrder) {
    if (this.workorder.StatusId === PhxConstants.WorkOrderStatus.Processing
      || this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved
      || this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Replaced
      || this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingUnterminate
      || this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Deleted) {
      return false;
    } else {
      return true;
    }
  }

  public static editableWorkOrderStartDateState(workorder: IWorkOrder) {
    if (!this.displayWorkOrderStartEndDateState(workorder)) {
      return false;
    }

    if (workorder.AtsPlacementId > 0) {
      return this.editableStartAndEndDate(workorder);
    } else {
      return true;
    }
  }

  public static canEditWorkOrderStartAndEndDate(workorder: IWorkOrder) {
    let editable = false;


    if (this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Draft ||
      this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.ComplianceDraft ||
      this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.RecalledCompliance ||
      this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Recalled) {
      if (this.workorder.WorkOrderVersion.WorkOrderCreationReasonId ===
        PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        editable = false;
      } else if (this.currentProfileUnderAccountingRole() || this.currentProfileIsSystemAdministrator()) {
        editable = true;
      } else if (this.currentProfileUnderCertainRoles()) {
        if (workorder.AtsPlacementId > 0) {
          editable = false;
        } else {
          editable = true;
        }
      }
    }
    return editable;
  }


  public static editableWorkOrderEndDateState(workorder: IWorkOrder) {
    if (!this.displayWorkOrderStartEndDateState(workorder)) {
      return false;
    }

    if (workorder.AtsPlacementId > 0) {
      return this.editableStartAndEndDate(workorder);
    } else {
      return true;
    }
  }

  public static ptFieldViewMessages(commonService, message) {
    commonService.logWarning(message);
  }

  public static ptFieldViewEventOnChangeStatusId(modelPrefix, fieldName, modelValidation, authService: AuthService, isValidationCheck = false) {
    // core tab
    if (fieldName === 'WorkOrderStartDateState' || fieldName === 'WorkOrderEndDateState') {
      if (this.canEditWorkOrderStartAndEndDate(this.workorder)) {
        return TFConstants.edit;
      } else {
        return TFConstants.view;
      }

    }

    if (this.workorder.AtsPlacementId > 0) {
      if (fieldName === 'Rate' || fieldName === 'RateUnitId') {
        if (this.editableRatesAndLineOfBusiness(this.workorder)) {
          return TFConstants.edit;
        }
      }

      // core tab
      if (fieldName === 'LineOfBusinessId' && this.editableRatesAndLineOfBusiness(this.workorder)) {
        return TFConstants.edit;
      }
      // // core tab
      if (fieldName === 'OrganizationIdInternal' && this.editableInternalCompany(this.workorder)) {
        return TFConstants.edit;
      }

      // core tab
      if (modelPrefix === 'WorkOrder' && (fieldName === 'StartDate' || fieldName === 'EndDate')) {
        if (this.workorder.WorkOrderVersion.IsComplianceDraftStatus && this.currentProfileUnderComplianceRole()) {
          return TFConstants.edit;
        } else {
          return TFConstants.view;
        }
      }

      // not used in html page
      if (modelPrefix === 'billingInfo' && fieldName === 'RateUnitId' && modelValidation && this.workorder.WorkOrderVersion.BillingInfoes[0].Id === modelValidation.Id) {
        return TFConstants.view;
      }
      // // not used in html page
      if (modelPrefix === 'paymentInfo' && fieldName === 'RateUnitId' && modelValidation && this.workorder.WorkOrderVersion.PaymentInfoes[0].Id === modelValidation.Id) {
        return TFConstants.view;
      }

      if (modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingRate' && fieldName === 'Rate' && modelValidation && this.workorder.WorkOrderVersion.BillingInfoes[0].Id === modelValidation.Id) {
        return TFConstants.view;
      }

      if (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentRates' && fieldName === 'Rate' && modelValidation && this.workorder.WorkOrderVersion.PaymentInfoes[0].Id === modelValidation.Id) {
        return TFConstants.view;
      }
    }
    // core tab
    if (modelPrefix === 'WorkOrderVersion' && fieldName === 'LineOfBusinessId' && modelValidation && modelValidation.LineOfBusinessId > 0) {
      return TFConstants.view;
    }

    if (fieldName === 'TimeSheetPreviousApprovalRequired') {
      return TFConstants.hideFormGroup;
    }

    // if (workorder.workflow.runningStatus.IsRunning) {
    //     return TFConstants.view;
    // }

    if (modelPrefix === 'model.purchaseOrderEntity.PurchaseOrderLines[model.purchaseOrderLineIndex]') {
      return TFConstants.view;
    }
    // core tab
    if (modelPrefix === 'WorkOrder' && (fieldName === 'OrganizationIdInternal' || fieldName === 'UserProfileIdWorker')) {
      if (this.workorder.AssignmentStatus) {
        return TFConstants.edit;
      } else {
        return TFConstants.view;
      }
    }

    // if (
    //   modelPrefix === 'WorkOrder' &&
    //   (this.workorder.StatusId === PhxConstants.WorkOrderStatus.Active ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.Replaced ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.PendingReview ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.Cancelled ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.Terminated ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.PendingUnterminate ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.Discarded ||
    //     this.workorder.StatusId === PhxConstants.WorkOrderStatus.Expired ||
    //     (this.workorder.WorkOrderVersion.IsComplianceDraftStatus && !this.workorder.WorkOrderVersion.IsDraftStatus))
    // ) {
    //   return TFConstants.view;
    // }

    // // core tab
    if (modelPrefix === 'WorkOrder' && (fieldName === 'StartDate' || fieldName === 'EndDate')) {
      if (this.workorder.StatusId === PhxConstants.WorkOrderStatus.Processing && this.workorder.WorkOrderVersion.WorkOrderCreationReasonId !== PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        return TFConstants.edit;
      } else {
        return TFConstants.view;
      }
    }

    if (
      (modelPrefix === 'WorkOrderVersion' ||
        modelPrefix === 'WorkOrderVersion.TimeSheetApprovers' || // timeSheetApprover
        modelPrefix === 'WorkOrderVersion.ExpenseApprovers' || // expenseApprover
        modelPrefix === 'WorkOrderVersion.BillingInfoes' || // billingInfo
        modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingInvoice' || // billingInvoice
        modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingRate' || // billingRate
        modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingInvoice.BillingRecipients' || // billingRecipient
        modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingSalesTaxes' || // billingSalesTax
        modelPrefix === 'WorkOrderVersion.PaymentInfoes' || // paymentInfo
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentInvoices' || // paymentInvoice
        modelPrefix === 'paymentRate' ||
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentContacts' || // paymentContact
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions' || // paymentSourceDeduction
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings' || // paymentOtherEarning
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSalesTaxes' || // paymentSalesTax
        modelPrefix === 'WorkOrderVersion.JobOwner' ||
        modelPrefix === 'WorkOrderVersion.SupportingJobOwners' ||
        modelPrefix === 'WorkOrderVersion.Recruiters' ||
        modelPrefix === 'WorkOrderVersion.WorkOrderVersionCommissions') &&
      (this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Approved ||
        this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Replaced ||
        this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingReview ||
        this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Cancelled ||
        this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.PendingUnterminate ||
        this.workorder.WorkOrderVersion.StatusId === PhxConstants.WorkOrderVersionStatus.Deleted ||
        (this.workorder.WorkOrderVersion.IsComplianceDraftStatus && !this.workorder.WorkOrderVersion.IsDraftStatus))
    ) {
      return TFConstants.view;
    }

    if (modelPrefix === 'WorkOrderVersion' && fieldName === 'EffectiveDate') {
      if (this.workorder.WorkOrderVersion.IsDraftStatus && this.workorder.WorkOrderVersion.WorkOrderCreationReasonId === PhxConstants.WorkOrderCreationReason.ScheduleChange) {
        return TFConstants.edit;
      } else {
        return TFConstants.view;
      }
    }

    if (
      ((modelPrefix === 'WorkOrderVersion.PaymentInfoes' && (fieldName === 'IsUseUserProfileWorkerSourceDeduction' || fieldName === 'SubdivisionIdSourceDeduction')) ||
        modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions') &&
      !authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.WorkOrderVersionChangePaymentSourceDeduction)
    ) {
      return TFConstants.view;
    }
    if (
      !this.editableComplianceDraftFields(this.workorder) &&
      ((!this.workorder.AtsPlacementId && modelPrefix === 'paymentRate' && (fieldName === 'IsApplyDeductions' || fieldName === 'IsApplyVacation' || fieldName === 'IsApplyStatHoliday')) ||
        (modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingInvoice' &&
          (fieldName === 'BillingInvoicePresentationStyleId' || fieldName === 'BillingInvoiceTermsId' || fieldName === 'BillingInvoiceTemplateId' || fieldName === 'BillingConsolidationTypeId')) ||
        (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentInvoices' && fieldName === 'PaymentMethodId') ||
        // for earnings and deduction controls
        ((modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings' && fieldName === 'IsApplied') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings' && fieldName === 'RatePercentage') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentOtherEarnings' && fieldName === 'IsAccrued') ||
          (modelPrefix === 'WorkOrderVersion' && fieldName === 'WorkerCompensationId') ||
          (modelPrefix === 'WorkOrderVersion' && fieldName === 'WCBIsApplied') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes' && fieldName === 'SubdivisionIdSourceDeduction') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes' && fieldName === 'IsUseUserProfileWorkerSourceDeduction') ||
          (modelPrefix === 'WorkOrderVersion' && fieldName === 'ApplyFlatStatPay') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions' && fieldName === 'IsApplied') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions' && fieldName === 'RatePercentage') ||
          (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSourceDeductions' && fieldName === 'RateAmount') ||
          // for taxed control fields
          ((modelPrefix === 'WorkOrderVersion.BillingInfoes' && fieldName === 'SubdivisionIdSalesTax') ||
            (modelPrefix === 'WorkOrderVersion.BillingInfoes.BillingSalesTaxes' && fieldName === 'IsApplied') ||
            (modelPrefix === 'WorkOrderVersion.PaymentInfoes' && fieldName === 'ApplySalesTax') ||
            (modelPrefix === 'WorkOrderVersion.PaymentInfoes' && fieldName === 'SubdivisionIdSalesTax') ||
            (modelPrefix === 'WorkOrderVersion.PaymentInfoes.PaymentSalesTaxes' && fieldName === 'IsApplied'))))
    ) {
      return TFConstants.view;
    }

    return TFConstants.edit;
  }

  public static ValidToAddBillingRate(billingRates) {
    const result = find(billingRates, function (billingRate) {
      return billingRate.RateTypeId == null || billingRate.RateUnitId == null || billingRate.Rate == null;
    });
    return !result;
  }
}
