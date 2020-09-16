import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IReadOnlyStorage, IPaymentRatesDetail, IWorkOrder } from '../state/workorder.interface';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
@Component({
  selector: 'app-workorder-payment-rates',
  templateUrl: './workorder-payment-rates.component.html',
  styleUrls: ['./workorder-payment-rates.component.less']
})
export class WorkorderPaymentRatesComponent extends BaseComponentOnDestroy {
  @Input() inputFormGroup: FormGroup<IPaymentRatesDetail>;
  @Output() outputEvent = new EventEmitter();
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() paymentInfoIndex: number;
  workOrder: IWorkOrder;
  constructor() {
    super();
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

}
