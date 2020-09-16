import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { IFormGroupSetup, IWorkOrder, IReadOnlyStorage, ITabTimeMaterialInvoice, IBillingInfoes, IPaymentInfoes, ITabTimeMaterialInvoiceDetail, IRoot } from './../state/workorder.interface';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkorderTimeMaterialDetailComponent } from '../workorder-time-material-detail/workorder-time-material-detail.component';
import { PhxConstants, ValidationExtensions } from '../../common';
import { WorkorderBillingInvoicesComponent } from '../workorder-billing-invoices/workorder-billing-invoices.component';
import { WorkorderBillingInvoiceComponent } from '../workorder-billing-invoice/workorder-billing-invoice.component';
import { WorkorderPaymentInvoicesComponent } from '../workorder-payment-invoices/workorder-payment-invoices.component';
import { CustomFieldErrorType } from '../../common/model';

@Component({
  selector: 'app-workorder-tab-time-material',
  templateUrl: './workorder-tab-time-material.component.html'
})

export class WorkorderTabTimeMaterialAndInvoiceComponent implements OnInit {

  @Input() inputFormGroup: FormGroup<ITabTimeMaterialInvoice>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  IsTimesheetExpenseBillingVisible: boolean = false;
  phxConstants: any;
  formGroupSetup: IFormGroupSetup;

  constructor() {
    this.phxConstants = PhxConstants;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  ngOnInit() {
  }

  public static setValidationsForTimeMaterialInvoiceDetails(workorder: IWorkOrder) {
    const valid = {
      isTimeSheetMethodologyId: true,
      isTimeSheetCycleId: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId !== PhxConstants.TimeSheetMethodology.NoTimesheet),
      isTimeSheetApprovers: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval),
      isTimeSheetApprovalFlowId: ((workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId !== PhxConstants.TimeSheetMethodology.NoTimesheet)
        && workorder.WorkOrderVersion.TimeSheetApprovers
        && workorder.WorkOrderVersion.TimeSheetApprovers.length > 1),
      isTimeSheetUsesProjects: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && (workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval
          || workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval)),
      isVmsWorkOrderReference: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.ThirdPartyImport),
      isDisplayEstimatedInvoiceAmount: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval),
      isDisplayEstimatedPaymentAmount: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && workorder.WorkOrderVersion.TimeSheetMethodologyId !== PhxConstants.TimeSheetMethodology.NoTimesheet)
    };
    return valid;
  }

  public static setValidationsForBillingInfoes(workorder: IWorkOrder) {
    const valid = {
      isBillingValid: (workorder.WorkOrderVersion.TimeSheetMethodologyId
        && (workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OnlineApproval
          || workorder.WorkOrderVersion.TimeSheetMethodologyId === PhxConstants.TimeSheetMethodology.OfflineApproval)
        && workorder.WorkOrderVersion.IsTimeSheetUsesProjects),
      isNoExpenseValid: false
    };
    return valid;
  }

  public static setValidationsForPaymentInfoes() {
    const valid = {
      isNoExpenseValid: false
    };
    return valid;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder, workorderObservableService: WorkorderObservableService, contacts): FormGroup<ITabTimeMaterialInvoice> {

    const timeMaterialInvoiceDetails = {
      IsDisplayEstimatedInvoiceAmount: workorder.WorkOrderVersion.IsDisplayEstimatedInvoiceAmount,
      IsDisplayEstimatedPaymentAmount: workorder.WorkOrderVersion.IsDisplayEstimatedPaymentAmount,
      IsTimeSheetUsesProjects: workorder.WorkOrderVersion.IsTimeSheetUsesProjects,
      TimeSheetApprovalFlowId: workorder.WorkOrderVersion.TimeSheetApprovalFlowId,
      TimeSheetApprovers: workorder.WorkOrderVersion.TimeSheetApprovers,
      TimeSheetCycleId: workorder.WorkOrderVersion.TimeSheetCycleId,
      TimeSheetDescription: workorder.WorkOrderVersion.TimeSheetDescription,
      TimeSheetMethodologyId: workorder.WorkOrderVersion.TimeSheetMethodologyId,
      VmsWorkOrderReference: workorder.WorkOrderVersion.VmsWorkOrderReference,
      OrganizationIdClient: workorder.WorkOrderVersion.BillingInfoes[0].OrganizationIdClient
    };

    const validationRulesForDetail = this.setValidationsForTimeMaterialInvoiceDetails(workorder);
    const validationRulesForBillingInvoice = this.setValidationsForBillingInfoes(workorder);
    const validationRulesForPaymentInvoice = this.setValidationsForPaymentInfoes();

    const formGroup: FormGroup<ITabTimeMaterialInvoice> = formGroupSetup.formBuilder.group<ITabTimeMaterialInvoice>({
      TabTimeMaterialInvoiceDetail: WorkorderTimeMaterialDetailComponent.formBuilderGroupSetup(formGroupSetup, timeMaterialInvoiceDetails, validationRulesForDetail),
      TabTimeMaterialInvoiceBillingInfoes: formGroupSetup.formBuilder.group<IBillingInfoes>({
        BillingInfoes: WorkorderBillingInvoicesComponent.formBuilderGroupSetup(formGroupSetup, workorder.WorkOrderVersion.BillingInfoes, validationRulesForBillingInvoice, PhxConstants.InvoiceType.TimeSheet)
      }),
      TabTimeMaterialInvoicePaymentInfoes: formGroupSetup.formBuilder.group<IPaymentInfoes>({
        PaymentInfoes: WorkorderPaymentInvoicesComponent.formBuilderGroupSetup(formGroupSetup, workorder.WorkOrderVersion.PaymentInfoes, validationRulesForPaymentInvoice, PhxConstants.InvoiceType.TimeSheet)
      }),
      IsContactValid: [contacts.valid ? contacts.valid : null,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsContactValid', CustomFieldErrorType.required))
        ]]
    });

    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, rootFormGroup: FormGroup<IRoot>): IWorkOrder {
    const formGroupTabTimeMaterialInvoice = rootFormGroup.controls.TabTimeMaterialInvoice as FormGroup<ITabTimeMaterialInvoice>;
    workOrder = WorkorderTimeMaterialDetailComponent.formGroupToPartial(workOrder,
      <FormGroup<ITabTimeMaterialInvoiceDetail>>formGroupTabTimeMaterialInvoice.controls.TabTimeMaterialInvoiceDetail);
    workOrder = WorkorderBillingInvoiceComponent.formGroupToPartial(workOrder,
      <FormGroup<IBillingInfoes>>formGroupTabTimeMaterialInvoice.controls.TabTimeMaterialInvoiceBillingInfoes, PhxConstants.InvoiceType.TimeSheet);
    workOrder = WorkorderPaymentInvoicesComponent.formGroupToPartial(workOrder,
      <FormGroup<IPaymentInfoes>>formGroupTabTimeMaterialInvoice.controls.TabTimeMaterialInvoicePaymentInfoes, PhxConstants.InvoiceType.TimeSheet, rootFormGroup);
    return workOrder;
  }
}
