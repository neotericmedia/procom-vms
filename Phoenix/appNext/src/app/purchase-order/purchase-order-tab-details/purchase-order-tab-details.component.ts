// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// Common
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// Purchase order

import { IReadOnlyStorage, IPurchaseOrder, ITabDetailsDetail, ITabDetails, IFormGroupSetup, IRoot } from '../state/purchase-order.interface';
import { PurchaseOrderObservableService } from '../state/purchase-order.observable.service';
import { PurchaseOrderDetailsComponent } from '../purchase-order-details/purchase-order-details.component';


@Component({
  selector: 'app-purchase-order-tab-details',
  templateUrl: './purchase-order-tab-details.component.html',
  styleUrls: ['./purchase-order-tab-details.component.less']
})
export class PurchaseOrderTabDetailsComponent implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ITabDetails>;
  @Input() rootModel: IPurchaseOrder;
  @Input() activeInEditMode: boolean;
  @Input() showAddLine: boolean;
  @Input() showDeleteLine: boolean;
  @Output() outputEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }
  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    purchaseOrder: IPurchaseOrder,
    purchaseOrderObservableService: PurchaseOrderObservableService
  ): FormGroup<ITabDetails> {
    const formGroup: FormGroup<ITabDetails> = formGroupSetup.formBuilder.group<ITabDetails>({
      PurchaseOrderId: [purchaseOrder.Id],
      TabDetailsDetail: PurchaseOrderDetailsComponent.formBuilderGroupSetup(formGroupSetup, purchaseOrder),
    });
    return formGroup;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formGroupToPartial(purchaseOrder: IPurchaseOrder, formGroupRoot: FormGroup<IRoot>): IPurchaseOrder {
    const formGroupTabDetails: FormGroup<ITabDetails> = <FormGroup<ITabDetails>>formGroupRoot.controls.TabDetails;
    return { ...PurchaseOrderDetailsComponent.formGroupToPartial(purchaseOrder, <FormGroup<ITabDetailsDetail>>formGroupTabDetails.controls.TabDetailsDetail) };
  }
}
