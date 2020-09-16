import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IFormGroupSetup, IReadOnlyStorage } from '../../organization/state';
import { IWorkOrder, ITabTaxes, IBillingInfo, IPaymentInfo, IRoot } from '../state';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { PhxConstants } from '../../common';
import { WorkorderBillingTaxesComponent } from '../workorder-billing-taxes/workorder-billing-taxes.component';
import { WorkorderPaymentTaxesComponent } from '../workorder-payment-taxes/workorder-payment-taxes.component';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';

@Component({
  selector: 'app-workorder-tab-taxes',
  templateUrl: './workorder-tab-taxes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkorderTabTaxesComponent extends BaseComponentActionContainer implements OnInit {
  @Input() inputFormGroup: FormGroup<ITabTaxes>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  showPaymentSalesTax: boolean;
  editable: boolean;
  userProfileIdWorker: number;
  workerProfileTypeId: number;
  workerContactId: number;
  phxConstants: any;
  validateComplianceDraft: boolean;
  formGroupSetup: IFormGroupSetup;

  constructor(private workOrderObservableService: WorkorderObservableService) {
    super();
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.workOrderObservableService
      .workorderOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((workorder: IWorkOrder) => {
        if (workorder) {
          this.userProfileIdWorker = workorder.UserProfileIdWorker;
          this.workerProfileTypeId = workorder.workerProfileTypeId;
          this.workerContactId = workorder.workerContactId;
          this.validateComplianceDraft = workorder.WorkOrderVersion.ValidateComplianceDraft;
          this.editable = workorder.WorkOrderVersion.IsComplianceDraftStatus;
        }
      });
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, workorder: IWorkOrder): FormGroup<ITabTaxes> {
    const formGroup: FormGroup<ITabTaxes> = formGroupSetup.formBuilder.group<ITabTaxes>({
      BillingInfoes: WorkorderBillingTaxesComponent.formBuilderBillingInfoesSetup(formGroupSetup, workorder.WorkOrderVersion.BillingInfoes, workorder.WorkOrderVersion.ValidateComplianceDraft),
      PaymentInfoes: WorkorderPaymentTaxesComponent.formBuilderPaymentInfoesSetup(formGroupSetup, workorder.WorkOrderVersion.PaymentInfoes, workorder.WorkOrderVersion.ValidateComplianceDraft),
      OrganizationIdInternal: [workorder.OrganizationIdInternal],
      StatusId: workorder.WorkOrderVersion.StatusId,
      ValidateComplianceDraft: workorder.WorkOrderVersion.ValidateComplianceDraft
    });
    return formGroup;
  }

  public static formGroupToPartial(workOrder: IWorkOrder, rootForm: FormGroup<IRoot>): IWorkOrder {
    const formGroupTabTaxes: FormGroup<ITabTaxes> = <FormGroup<ITabTaxes>>rootForm.controls.TabTaxes;
    const billingInfoes: Array<IBillingInfo> = formGroupTabTaxes.value.BillingInfoes;
    const paymentInfoes: Array<IPaymentInfo> = formGroupTabTaxes.value.PaymentInfoes;

    billingInfoes.forEach(i => {
      workOrder.WorkOrderVersion.BillingInfoes.forEach(() => {
        WorkorderBillingTaxesComponent.formGroupToPartial(workOrder, i);
      });
    });

    paymentInfoes.forEach(i => {
      workOrder.WorkOrderVersion.PaymentInfoes.forEach(() => {
        WorkorderPaymentTaxesComponent.formGroupToPartial(workOrder, i);
      });
    });

    return workOrder;
  }
}
