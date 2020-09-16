import { Component, OnInit } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { PurchaseOrderObservableService } from '../state/purchase-order.observable.service';
import { IPurchaseOrder } from '../state';
import { PhxConstants, CommonService } from '../../common';

@Component({
  selector: 'app-purchase-order-tab-history',
  templateUrl: './purchase-order-tab-history.component.html',
  styleUrls: ['./purchase-order-tab-history.component.less']
})
export class PurchaseOrderTabHistoryComponent extends BaseComponentOnDestroy implements OnInit {
  public purchaseOrder: IPurchaseOrder = null;
  html: {
    codeValueGroups: any;
    phxConstants: typeof PhxConstants;
    entityTypeId: number;
    entityId: number;
    changeHistoryBlackList: any[];
  } = {
      codeValueGroups: null,
      phxConstants: null,
      entityTypeId: null,
      entityId: null,
      changeHistoryBlackList: null
    };

  constructor(private commonService: CommonService,
    private purchaseOrderObservableService: PurchaseOrderObservableService) {
    super();
    this.html.phxConstants = PhxConstants;
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.purchaseOrderObservableService
      .purchaseOrderOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(purchaseOrder => {
        if (purchaseOrder) {
          this.onInitPurchaseOrder(purchaseOrder);
        }
      });
  }

  onInitPurchaseOrder(purchaseOrder: IPurchaseOrder) {
    this.purchaseOrder = purchaseOrder;
    this.html.entityTypeId = PhxConstants.EntityType.PurchaseOrder;
    this.html.entityId = this.purchaseOrder.Id;
    this.recalcLocalProperties();
  }

  recalcLocalProperties() {
    this.html.changeHistoryBlackList = [
      { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
      { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'PurchaseOrderId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'PurchaseOrderLineId' },

      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

      { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
      { TableSchemaName: '', TableName: '', ColumnName: 'StatusId' },
      { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
      { TableSchemaName: 'po', TableName: 'PurchaseOrderLine', ColumnName: 'StartDate' },
      { TableSchemaName: 'po', TableName: 'PurchaseOrderLine', ColumnName: 'EndDate' },
      { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'WorkOrderVersion' }
    ];
  }
}
