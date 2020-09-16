import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { IBillingPartyInfoes, IReadOnlyStorage } from './../state/index';
@Component({
  selector: 'app-workorder-billing-parties',
  templateUrl: './workorder-billing-parties.component.html'
})
export class WorkorderBillingPartiesComponent {
  @Input() inputFormGroup: FormGroup<IBillingPartyInfoes>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  @Output() addBillingPartyRate = new EventEmitter();
  @Output() removeBillingPartyRate = new EventEmitter<number>();
  @Output() addPaymentPartyRate = new EventEmitter<number>();

  constructor() {
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onAddBillingPartyRate() {
    this.addBillingPartyRate.emit();
  }

  onRemoveBillingPartyRate(rateIndex) {
    this.removeBillingPartyRate.emit(rateIndex);
  }

  onAddPaymentPartyRate(rateTypeId) {
    this.addPaymentPartyRate.emit(rateTypeId);
  }
}
