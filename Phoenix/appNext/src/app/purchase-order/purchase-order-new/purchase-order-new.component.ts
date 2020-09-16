import { Component, OnInit } from '@angular/core';
import { IPurchaseOrder } from '../state';
import { PurchaseOrderService } from '../purchase-order.service';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-purchase-order-new',
  templateUrl: './purchase-order-new.component.html',
  styleUrls: ['./purchase-order-new.component.less']
})
export class PurchaseOrderNewComponent implements OnInit {
  purhaseOrder: IPurchaseOrder;
  constructor(private purchaseOrderService: PurchaseOrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.purhaseOrder = this.newPurchaseOrder();
    this.savePurchaseOrder(this.purhaseOrder);
  }

  savePurchaseOrder(newPO: IPurchaseOrder) {
    const commandSave: IPurchaseOrder = newPO;
    commandSave.LastModifiedDatetime = new Date(Date.now());
    this.purchaseOrderService.purchaseOrderSave(commandSave).subscribe(response => {
      if (response.EntityId) {
        this.navigateTo(response.EntityId, 'details');
      }
    });
  }

  navigateTo(poIdNavigateTo: number, tabNavigationName: string, roleId: number = null) {
    const navigatePath = `/next/purchase-order/${poIdNavigateTo}/${tabNavigationName}`;
    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      console.error(`app-purchaseorder: error navigating to ${poIdNavigateTo} , ${tabNavigationName}`, err);
    });
  }

  newPurchaseOrder() {
    const newPurch: IPurchaseOrder = {
      DepletedActionId: null,
      Description: null,
      Id: 0,
      InvoiceRestrictionId: null,
      IsDraft: true,
      OrganizationId: null,
      PurchaseOrderLines: null,
      PurchaseOrderNumber: null,
      StatusId: 1
    };
    return newPurch;
  }
}
