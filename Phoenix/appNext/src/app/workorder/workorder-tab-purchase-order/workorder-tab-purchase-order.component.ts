import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { WorkorderService } from '../workorder.service';
import { IPurchaseOrderDetails, IWorkOrder, IWorkOrderPurchaseOrderLines, IPurchaseOrderLineLists } from '../state/workorder.interface';
import { CodeValueService, CommonService, PhxConstants } from '../../common';
import { CodeValue } from '../../common/model';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { WorkorderObservableService } from '../state/workorder.observable.service';
import { WorkorderAction } from '../state';
import { each, find } from 'lodash';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'app-workorder-tab-purchase-order',
  templateUrl: './workorder-tab-purchase-order.component.html'
})
export class WorkorderTabPurchaseOrderComponent extends BaseComponentActionContainer implements OnInit {
  // @Input() workOrder: IWorkOrder;
  @Input() workOrderId: number;
  @Output() outputEvent = new EventEmitter<any>();
  @ViewChild('modalLine') modalLine: PhxModalComponent;
  @ViewChild('modalLineEdit') modalLineEdit: PhxModalComponent;
  purchaseOrders: IPurchaseOrderDetails;
  codeValueGroups: any;
  purchaseOrderDepletedGroupList: Array<CodeValue>;
  purchaseOrderStatuses: Array<CodeValue>;
  currencyList: Array<CodeValue>;
  workOrderPurchaseOrderLineStatusList: Array<CodeValue>;
  phxConstants: any;
  workOrder: IWorkOrder;
  primaryworkunit: string;
  primaryFirstBillingRate: number;
  organizationId: number;
  purchaseOrderSearchLines: any = [];
  LineId: number;
  poLineNum: string;
  polines: any;
  poNumber: string;
  workOderPurchaseOrderLineId: string;
  AssignmentId: number;
  workorderId: number;
  workorderNumber: number;
  workorderVersion: number;

  constructor(private workorderService: WorkorderService, private codevalueservice: CodeValueService, private commonservice: CommonService, private workOrderObservableService: WorkorderObservableService) {
    super();
    this.codeValueGroups = this.commonservice.CodeValueGroups;
    this.purchaseOrderDepletedGroupList = this.codevalueservice.getCodeValues(this.codeValueGroups.PurchaseOrderDepletedGroups, true);
    this.purchaseOrderStatuses = this.purchaseOrderStatuses = this.codevalueservice.getCodeValues(this.codeValueGroups.PurchaseOrderStatus, true);
  }

  ngOnInit() {
    this.getWorkOrderModel();
    this.phxConstants = PhxConstants;
    this.getWorkOrderPurchaseOrderLinesByWorkOrderId();
    this.getBillingRate();
    this.organizationId = this.workOrder.WorkOrderVersion.BillingInfoes[0].OrganizationIdClient;
    this.modalLine.addClassToConfig('modal-lg purchaseorder-modal');
    this.modalLineEdit.addClassToConfig('modal-lg purchaseorder-modal');
  }

  getWorkOrderModel() {
    this.workOrderObservableService
      .workorderOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response) {
          this.workOrder = response;
          this.AssignmentId = this.workOrder.AssignmentId;
          this.workorderId = this.workOrder.WorkOrderId;
          this.workorderNumber = this.workOrder.WorkOrderVersion.WorkOrderNumber;
          this.workorderVersion = this.workOrder.WorkOrderVersion.Id;
        }
      });
  }

  getWorkOrderPurchaseOrderLinesByWorkOrderId() {
    this.workorderService.getWorkOrderPurchaseOrderLinesByWorkOrderId(this.workOrderId).subscribe((result: any) => {
      this.purchaseOrders = result.Items;
      this.workOrder.WorkOrderVersion.WorkOrderPurchaseOrderLines = [];
      each(this.purchaseOrders, (item: any) => {
        this.workOrder.WorkOrderVersion.WorkOrderPurchaseOrderLines.push({
          Id: item.Id,
          PurchaseOrderDepletionGroupId: item.PurchaseOrderDepletionGroupId,
          StartDate: item.PurchaseOrderLineStartDate,
          EndDate: item.PurchaseOrderLineEndDate,
          PurchaseOrderId: item.PurchaseOrderId,
          PurchaseOrderLineId: item.PurchaseOrderLineId,
          PurchaseOrderNumber: item.PurchaseOrderNumber,
          PurchaseOrderLineNumber: item.PurchaseOrderLineNumber,
          Amount: item.Amount,
          AmountCommited: item.AmountCommited,
          AmountSpent: item.AmountSpent,
          AmountReserved: item.AmountReserved,
          StatusId: item.StatusId
        });
      });
      this.stateService.dispatchOnAction(
        new WorkorderAction.WorkorderUpdate({
          ...this.workOrder
        })
      );
    });
  }

  addWorkOrderPurchaseOrderLine(orgId) {
    this.workOderPurchaseOrderLineId = '-1';
    this.currencyList = this.codevalueservice.getCodeValues(this.codeValueGroups.Currency, true);
    this.workOrderPurchaseOrderLineStatusList = this.codevalueservice.getCodeValues(this.codeValueGroups.WorkOrderPurchaseOrderLineStatus, true);
    const organizationIdClient = this.organizationId ? this.organizationId : 0;
    this.workorderService
      .getPurchaseOrderLineByOrganizationIdClient(
        organizationIdClient,
        oreq
          .request()
          .withExpand(['WorkOrderPurchaseOrderLines', 'PurchaseOrderTransactions'])
          .withSelect([
            'CurrencyId',
            'Id',
            'StatusId',
            'PurchaseOrderNumber',
            'DepletionGroupId',
            'PurchaseOrderLineNumber',
            'PurchaseOrderId',
            'Amount',
            'WorkOrderPurchaseOrderLines/Id',
            'WorkOrderPurchaseOrderLines/AmountCommited',
            'WorkOrderPurchaseOrderLines/AmountSpent'
          ])
          .url()
      )
      .subscribe((response: any) => {
        if (response) {
          let newItem: IPurchaseOrderLineLists;
          const responseItems: any = [];
          each(response.Items, item => {
            newItem = {
              Id: item.Id,
              PurchaseOrderId: item.PurchaseOrderId,
              PurchaseOrderDepletionGroupId: item.DepletionGroupId,
              PurchaseOrderNumber: item.PurchaseOrderNumber,
              PurchaseOrderLineNumber: item.PurchaseOrderLineNumber,
              Amount: item.Amount,
              AmountCommited: 0,
              AmountSpent: 0,
              CurrencyCode: find(this.currencyList, function (currency) {
                return currency.id === item.CurrencyId;
              }).code,
              StatusId: item.StatusId,
              PurchaseOrderLineStatusName: find(this.workOrderPurchaseOrderLineStatusList, function (status) {
                return status.id === item.StatusId;
              }).code
            };
            each(item.WorkOrderPurchaseOrderLines, wopol => {
              newItem.AmountCommited += wopol.AmountCommited;
              newItem.AmountSpent += wopol.AmountSpent;
            });
            responseItems.push(newItem);
          });

          this.purchaseOrderSearchLines = this.purchaseOrderLinesFilteredByUsage(responseItems, this.workOrder.WorkOrderVersion.WorkOrderPurchaseOrderLines);
        }
      });
    this.modalLine.show();
  }

  purchaseOrderLinesFilteredByUsage(inputList: any, excludeCollection: any) {
    const result = [];
    inputList.forEach(i => {
      let exists = false;
      excludeCollection.forEach(e => {
        if (e.PurchaseOrderNumber === i.PurchaseOrderNumber && e.PurchaseOrderLineNumber === i.PurchaseOrderLineNumber) {
          exists = true;
        }
      });
      if (!exists) {
        result.push(i);
      }
    });
    return result;
  }

  purchaseOrderLineOpen(po: any, index: number) {
    this.LineId = po.PurchaseOrderLineId;
    this.poLineNum = po.PurchaseOrderLineNumber;
    this.poNumber = po.PurchaseOrderNumber;
    this.modalLineEdit.show();
  }

  purchaseOrderLineActivate(pol: any, index: number) {
    this.workorderService.getByPurchaseOrderId(pol.PurchaseOrderId).subscribe(response => {
      if (response) {
        this.polines = response;
        this.workorderService
          .workOrderPurchaseOrderLineStatusToActivate({
            WorkOrderPurchaseOrderLineId: pol.Id,
            LastModifiedDatetime: this.getMaxLastModified()
          })
          .subscribe(rsp => {
            if (rsp) {
              this.ngOnInit();
            }
          });
      }
    });
  }

  getMaxLastModified() {
    if (!this.polines.LastModifiedDatetime) {
      return new Date(Date.now());
    }
    let dates = [this.polines.LastModifiedDatetime];
    each(this.polines.PurchaseOrderLines, function (pol) {
      if (!pol.LastModifiedDatetime || typeof pol.LastModifiedDatetime === 'string') {
        return;
      }
      dates.push(pol.LastModifiedDatetime);
      each(pol.WorkOrderPurchaseOrderLines, function (wopol) {
        if (!wopol.LastModifiedDatetime || typeof wopol.LastModifiedDatetime === 'string') {
          return;
        }
        dates.push(wopol.LastModifiedDatetime);
      });
    });
    if (this.polines.deletedPurchaseOrderLines) {
      dates = dates.concat(this.polines.deletedPurchaseOrderLines);
    }
    return new Date(Math.max.apply(Math, dates));
  }

  getBillingRate() {
    const allRates = this.workOrder.WorkOrderVersion.BillingInfoes[0].BillingRates;
    const billingRate = find(allRates, { RateTypeId: 1 });
    this.primaryFirstBillingRate = Number(billingRate ? billingRate.Rate : 0);

    switch (billingRate ? billingRate.RateUnitId : 0) {
      case 1:
        this.primaryworkunit = 'H';
        break;
      case 2:
        this.primaryworkunit = 'D';
        break;
      case 3:
        this.primaryworkunit = 'F';
        break;
      default:
        this.primaryworkunit = '?';
    }
  }

  getCodeText(statusId: number) {
    const code = this.codevalueservice.getCodeValue(statusId, this.codeValueGroups.WorkOrderPurchaseOrderLineStatus);
    if (code) {
      return code.text;
    } else {
      return null;
    }
  }

  onCancel(e) {
    this.workOderPurchaseOrderLineId = '0';
  }

  hideModal() {
    this.modalLine.hide();
  }

  onCancelPOLine() {
    this.modalLine.hide();
  }

  onOutputEvent() {
    this.getWorkOrderPurchaseOrderLinesByWorkOrderId();
  }
}
