// angular
import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
// common
import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from '../../common';
import { CodeValue } from '../../common/model';
// purchase order
import { IPurchaseOrder } from './../state/purchase-order.interface';
import { PurchaseOrderService } from '../purchase-order.service';

@Component({
  selector: 'app-purchase-order-header',
  templateUrl: './purchase-order-header.component.html',
  styleUrls: ['./purchase-order-header.component.less']
})
export class PurchaseOrderHeaderComponent implements OnInit, OnChanges {
  @Input() purchaseOrder: IPurchaseOrder;
  totalFund: number = 0;
  totalCommitted: number = 0;
  amountSpentTotal: number = 0;
  currencyId: number;
  html: { codeValueGroups: any } = { codeValueGroups: this.commonService.CodeValueGroups };
  listOrganizationClient: any;
  purchaseOrderStatuses: Array<CodeValue>;
  listCurrency: Array<CodeValue>;

  constructor(private commonService: CommonService,
    private purchaseOrderService: PurchaseOrderService,
    private changeRef: ChangeDetectorRef,
    private codeValueService: CodeValueService) {
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.purchaseOrderStatuses = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderStatus, true);
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.purchaseOrder && changes.purchaseOrder.currentValue) {
      this.purchaseOrder = changes.purchaseOrder.currentValue;
      this.currencyId = this.purchaseOrder.PurchaseOrderLines.length > 0 ? this.purchaseOrder.PurchaseOrderLines[0].CurrencyId : null;
    }
  }

  ngOnInit() {
    this.getOrganization();
  }

  getOrganization() {
    this.purchaseOrderService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().subscribe(response => {
      if (response) {
        this.listOrganizationClient = response.Items;
        this.listOrganizationClient.forEach(val => {
          val.DisplayValue = val.DisplayName + ' - ' + val.Id;
        });
      }
      this.changeRef.detectChanges();
    });
  }
}
