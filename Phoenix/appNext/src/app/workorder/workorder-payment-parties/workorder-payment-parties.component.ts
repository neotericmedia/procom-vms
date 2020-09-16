import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CustomFieldService, ValidationExtensions } from '../../common';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { IPaymentPartyInfoes, IPaymentPartiesRateDetail, IPaymentRatesDetail, IReadOnlyStorage, IPaymentInvoice } from './../state/workorder.interface';
import { CustomFieldErrorType } from '../../common/model';
import { IFormGroupOnNew } from '../../organization/state/organization.interface';
import { WorkorderPaymentRateComponent } from '../workorder-payment-rate/workorder-payment-rate.component';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { IWorkOrder } from '../state/workorder.interface';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { WorkorderPaymentPartyComponent } from '../workorder-payment-party/workorder-payment-party.component';
@Component({
  selector: 'app-workorder-payment-parties',
  templateUrl: './workorder-payment-parties.component.html'
})
export class WorkorderPaymentPartiesComponent extends BaseComponentOnDestroy {
  @Input() inputFormGroup: FormGroup<IPaymentPartyInfoes>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  workOrderDetails: IWorkOrder;
  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private workOrderObservableService: WorkorderObservableService) {
    super();
    this.getWorkOrderDetails();
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  addPaymentInfo() {
    const PaymentInfoes = this.inputFormGroup.controls.PaymentPartiesRateDetails as FormArray<IPaymentPartiesRateDetail>;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    PaymentInfoes.push(WorkorderPaymentPartiesComponent.formBuilderGroupAddNew(formGroupOnNew, PaymentInfoes));
    this.outputEvent.emit();
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, paymentInfo: FormArray<IPaymentPartiesRateDetail>)
    : FormGroup<IPaymentPartiesRateDetail> {
    const formPaymentRates: FormGroup<IPaymentRatesDetail> = <FormGroup<IPaymentRatesDetail>>paymentInfo.at(0).get('PaymentRatesDetail');
    const newForm = formGroupOnNew.formBuilder.group<IPaymentPartiesRateDetail>({
      Id: [0],
      IsDraft: [true],
      IsUseUserProfileWorkerSourceDeduction: [true],
      CurrencyId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('CurrencyId', CustomFieldErrorType.required))]],
      Hours: [paymentInfo.at(0).get('Hours').value],
      OrganizationIdSupplier: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('OrganizationIdSupplier', CustomFieldErrorType.required))]],
      UserProfileIdSupplier: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('UserProfileIdSupplier', CustomFieldErrorType.required))]],
      ApplySalesTax: [true],
      OrganizationSupplierDisplayName: [null],
      PaymentRatesDetail: WorkorderPaymentPartyComponent.formBuilderGroupAddNewPaymentRatesDetail(formGroupOnNew, formPaymentRates.value),
      PaymentOtherEarnings: formGroupOnNew.formBuilder.array([]),
      PaymentSourceDeductions: formGroupOnNew.formBuilder.array([]),
      PaymentContacts: formGroupOnNew.formBuilder.array([]),
      PaymentSalesTaxes: formGroupOnNew.formBuilder.array([]),
      PaymentInvoices: WorkorderPaymentPartiesComponent.defaultInvoce(formGroupOnNew),
      WorkOrderVersionId: [0],
      SubdivisionIdSalesTax: [null],
      SubdivisionIdSourceDeduction: [null]
    });
    return newForm;
  }

  static defaultInvoce(formGroupOnNew: IFormGroupOnNew) {
    return formGroupOnNew.formBuilder.array<IPaymentInvoice>([
      {
        Id: 0,
        InvoiceTypeId: 1,
        IsDraft: true,
        PaymentInfoId: 0,
        PaymentInvoiceTemplateId: 1,
        PaymentMethodId: 4
      },
      {
        Id: 0,
        InvoiceTypeId: 2,
        IsDraft: true,
        PaymentInfoId: 0
      }
    ]);
  }

  removePaymentInfo(pIndex: number) {
    const paymentPartyInfoes = <FormArray<IPaymentPartiesRateDetail>>this.inputFormGroup.controls.PaymentPartiesRateDetails;
    paymentPartyInfoes.removeAt(pIndex);
    this.outputEvent.emit(true);
  }

  getWorkOrderDetails() {
    this.workOrderObservableService.workorderOnRouteChange$(this).takeUntil(this.isDestroyed$).subscribe((workOrder: IWorkOrder) => {
      this.workOrderDetails = workOrder;
    });
  }
}
