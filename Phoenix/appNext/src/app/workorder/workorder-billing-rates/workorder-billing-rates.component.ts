import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '../../common/ngx-strongly-typed-forms/model';
import { IBillingRatesDetails, IReadOnlyStorage, IBillingRate, IFormGroupOnNew, IWorkOrder } from '../state';
import { CustomFieldService, CodeValueService, CommonService } from '../../common';
import { WorkorderBillingRateComponent } from '../workorder-billing-rate/workorder-billing-rate.component';
import { CodeValue } from '../../common/model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkorderPaymentRateComponent } from '../workorder-payment-rate/workorder-payment-rate.component';

@Component({
  selector: 'app-workorder-billing-rates',
  templateUrl: './workorder-billing-rates.component.html',
  styleUrls: ['./workorder-billing-rates.component.less']
})
export class WorkorderBillingRatesComponent extends BaseComponentOnDestroy implements OnInit {
  @Input() billingInfoIndex: number;
  @Input() inputFormGroup: FormGroup<IBillingRatesDetails>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() selectedRateType: AbstractControl<any>;
  @Output() outputEvent = new EventEmitter();
  @Output() addBillingPartyRate = new EventEmitter();
  @Output() removeBillingPartyRate = new EventEmitter<number>();
  @Output() addPaymentPartyRate = new EventEmitter<number>();
  codeValGroup: any;
  workOrderRateTypes: Array<CodeValue>;
  workOrderDetails: IWorkOrder;

  constructor(
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private codeValService: CodeValueService,
    private commonService: CommonService,
    private workOrderObservableService: WorkorderObservableService
  ) {
    super();
    this.getWorkOrderDetails();
    this.codeValGroup = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.workOrderRateTypes = this.codeValService.getCodeValues(this.codeValGroup.RateType, true);
    this.workOrderRateTypes.splice(5, 1);
    this.workOrderRateTypes.splice(4, 1);
  }

  trackByFn(index: number) {
    return index;
  }

  onAddBillingPartyRate() {
    this.addBillingPartyRate.emit();
  }

  onAddPaymentPartyRate(rateTypeId) {
    this.addPaymentPartyRate.emit(rateTypeId);
  }

  onRemoveBillingPartyRate(rateIndex) {
    this.removeBillingPartyRate.emit(rateIndex);
  }

  ValidToAddBillingRate(): boolean {
    const formArrayBillingRates: Array<IBillingRate> = <Array<IBillingRate>>this.inputFormGroup.controls.BillingRates.value;
    let isValid: boolean = true;
    formArrayBillingRates.forEach(element => {
      if (element.Rate === null || element.RateTypeId === null || element.RateUnitId === null) {
        isValid = false;
      } else {
        isValid = true;
      }
    });
    return isValid;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  getWorkOrderDetails() {
    this.workOrderObservableService
      .workorderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe((workOrder: IWorkOrder) => {
        this.workOrderDetails = workOrder;
      });
  }
}
