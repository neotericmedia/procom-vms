import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxConstants, ValidationExtensions } from '../../common';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { IRoot, ITabExpenseInvoice, IReadOnlyStorage, IFormGroupSetup, IWorkOrder, ITabExpenseInvoiceDetail, IBillingInfoes, IPaymentInfoes } from './../state/workorder.interface';
import { WorkorderObservableService } from './../state/workorder.observable.service';
import { WorkorderBillingInvoicesComponent } from '../workorder-billing-invoices/workorder-billing-invoices.component';
import { WorkorderPaymentInvoicesComponent } from '../workorder-payment-invoices/workorder-payment-invoices.component';
import { WorkorderExpenseDetailComponent } from '../workorder-expense-detail/workorder-expense-detail.component';
import { WorkorderBillingInvoiceComponent } from '../workorder-billing-invoice/workorder-billing-invoice.component';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { CustomFieldErrorType } from '../../common/model';

@Component({
  selector: 'app-workorder-tab-expense-invoice',
  templateUrl: './workorder-tab-expense-invoice.component.html'
})
export class WorkorderTabExpenseInvoiceComponent extends BaseComponentOnDestroy implements OnInit {
  @Input() inputFormGroup: FormGroup<ITabExpenseInvoice>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  phxConstants: any;
  hideBillingPaymentInvoice: boolean = false;
  formGroupSetup: IFormGroupSetup;

  constructor(private workOrderObservableService: WorkorderObservableService) {
    super();
    this.phxConstants = PhxConstants;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  ngOnInit() {
    this.workOrderObservableService
      .workorderOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.hideBillingPaymentInvoice = !workorder.WorkOrderVersion.ExpenseMethodologyId || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.NoExpense;
        }
      });
  }

  public static setValidationsForExpenseInvoiceDetails(workorder: IWorkOrder) {
    const valid = {
      isExpenseApprovers: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval,
      isExpenseApprovalFlowId:
        workorder.WorkOrderVersion.ExpenseMethodologyId &&
        workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval &&
        workorder.WorkOrderVersion.ExpenseApprovers.filter(i => i.ApproverTypeId === PhxConstants.ApproverType.ClientApprover).length > 1,
      isExpenseUsesProjects:
        workorder.WorkOrderVersion.ExpenseMethodologyId &&
        (workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval),
      isExpenseThirdPartyWorkerReference: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.ThirdPartyImport,
      isIsExpenseRequiresOriginal:
        workorder.WorkOrderVersion.ExpenseMethodologyId &&
        (workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval)
    };
    return valid;
  }

  public static setValidationsForBillingInfoes(workorder: IWorkOrder) {
    const valid = {
      isBillingValid:
        workorder.WorkOrderVersion.ExpenseMethodologyId &&
        (workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OnlineApproval || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.OfflineApproval) &&
        workorder.WorkOrderVersion.IsExpenseUsesProjects,
      isNoExpenseValid: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.NoExpense,
      isSalesTaxAppliedOnVmsImport: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.ThirdPartyImport
    };
    return valid;
  }

  public static setValidationsForPaymentInfoes(workorder: IWorkOrder) {
    const valid = {
      isNoExpenseValid: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.NoExpense,
      isSalesTaxAppliedOnVmsImport: workorder.WorkOrderVersion.ExpenseMethodologyId && workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.ThirdPartyImport
    };
    return valid;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder, workorderObservableService: WorkorderObservableService, contacts): FormGroup<ITabExpenseInvoice> {
    const organizationIdSuppliers = workorder.WorkOrderVersion.PaymentInfoes.map(o => {
      return { OrganizationIdSupplier: o.OrganizationIdSupplier };
    });

    const organizationIdClients = workorder.WorkOrderVersion.BillingInfoes.map(o => {
      return { OrganizationIdClient: o.OrganizationIdClient };
    });

    const expenseInvoiceDetails: ITabExpenseInvoiceDetail = {
      ExpenseMethodologyId: workorder.WorkOrderVersion.ExpenseMethodologyId,
      ExpenseApprovalFlowId: workorder.WorkOrderVersion.ExpenseApprovalFlowId,
      IsExpenseUsesProjects: workorder.WorkOrderVersion.IsExpenseUsesProjects,
      IsExpenseRequiresOriginal: workorder.WorkOrderVersion.IsExpenseRequiresOriginal,
      ExpenseThirdPartyWorkerReference: workorder.WorkOrderVersion.ExpenseThirdPartyWorkerReference,
      ExpenseDescription: workorder.WorkOrderVersion.ExpenseDescription,
      ExpenseApprovers: workorder.WorkOrderVersion.ExpenseApprovers,
      OrganizationIdInternal: workorder.OrganizationIdInternal,
      OrganizationIdSuppliers: organizationIdSuppliers,
      OrganizationIdClients: organizationIdClients
    };

    const validationRulesForExpenseDetails = WorkorderTabExpenseInvoiceComponent.setValidationsForExpenseInvoiceDetails(workorder);
    const validationRulesForBillingInvoice = WorkorderTabExpenseInvoiceComponent.setValidationsForBillingInfoes(workorder);
    const validationRulesForPaymentInvoice = WorkorderTabExpenseInvoiceComponent.setValidationsForPaymentInfoes(workorder);

    const formGroup: FormGroup<ITabExpenseInvoice> = formGroupSetup.formBuilder.group<ITabExpenseInvoice>({
      TabExpenseInvoiceDetail: WorkorderExpenseDetailComponent.formBuilderGroupSetup(formGroupSetup, expenseInvoiceDetails, validationRulesForExpenseDetails),
      TabExpenseInvoiceBillingInfoes: formGroupSetup.formBuilder.group<IBillingInfoes>({
        BillingInfoes: WorkorderBillingInvoicesComponent.formBuilderGroupSetup(formGroupSetup, workorder.WorkOrderVersion.BillingInfoes, validationRulesForBillingInvoice, PhxConstants.InvoiceType.Expense)
      }),
      TabExpenseInvoicePaymentInfoes: formGroupSetup.formBuilder.group<IPaymentInfoes>({
        PaymentInfoes: WorkorderPaymentInvoicesComponent.formBuilderGroupSetup(formGroupSetup, workorder.WorkOrderVersion.PaymentInfoes, validationRulesForPaymentInvoice, PhxConstants.InvoiceType.Expense)
      }),
      IsContactValid: [
        contacts.valid || workorder.WorkOrderVersion.ExpenseMethodologyId === PhxConstants.ExpenseMethodology.NoExpense ? contacts.valid : null,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsContactValid', CustomFieldErrorType.required))]
      ]
    });
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, rootFormGroup: FormGroup<IRoot>): IWorkOrder {
    const formGroupTabExpenseInvoice = rootFormGroup.controls.TabExpenseInvoice as FormGroup<ITabExpenseInvoice>;
    workOrder = WorkorderExpenseDetailComponent.formGroupToPartial(workOrder, <FormGroup<ITabExpenseInvoiceDetail>>formGroupTabExpenseInvoice.controls.TabExpenseInvoiceDetail);
    workOrder = WorkorderBillingInvoiceComponent.formGroupToPartial(workOrder, <FormGroup<IBillingInfoes>>formGroupTabExpenseInvoice.controls.TabExpenseInvoiceBillingInfoes, PhxConstants.InvoiceType.Expense);
    workOrder = WorkorderPaymentInvoicesComponent.formGroupToPartial(workOrder, <FormGroup<IPaymentInfoes>>formGroupTabExpenseInvoice.controls.TabExpenseInvoicePaymentInfoes, PhxConstants.InvoiceType.Expense, rootFormGroup);
    return workOrder;
  }
}
