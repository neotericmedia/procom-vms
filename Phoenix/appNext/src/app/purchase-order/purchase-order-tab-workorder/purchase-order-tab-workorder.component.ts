import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-purchase-order-tab-workorder',
  templateUrl: './purchase-order-tab-workorder.component.html',
  styleUrls: ['./purchase-order-tab-workorder.component.less']
})
export class PurchaseOrderTabWorkorderComponent implements OnInit {
  @Input() purchaseOrderId: number;
  constructor() { }

  ngOnInit() {
  }

}
