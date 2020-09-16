import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { POLines, IPurchaseOrder, PurchaseOrderAction, POLineNew } from '../state';
import { CodeValue } from '../../common/model';
import { CodeValueService, CommonService, PhxConstants } from '../../common';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { each, filter, remove, findIndex, find } from 'lodash';
import { PurchaseOrderObservableService } from '../state/purchase-order.observable.service';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { PurchaseOrderService } from '../purchase-order.service';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';


@Component({
  selector: 'app-purchase-order-details-lines',
  templateUrl: './purchase-order-details-lines.component.html',
  styleUrls: ['./purchase-order-details-lines.component.less']
})

export class PurchaseOrderDetailsLinesComponent extends BaseComponentActionContainer implements OnInit {
  @Input() purchaseOrderLines: Array<POLines>;
  @Input() showAddLine: boolean;
  @Input() showDeleteLine: boolean;
  @ViewChild('modal') modal: PhxModalComponent;
  @ViewChild('modalLineEdit') modalLineEdit: PhxModalComponent;
  @Output() removeLines = new EventEmitter<any>();
  @Output() addLines = new EventEmitter<any>();
  purchaseOrder: IPurchaseOrder;
  isAdd = false;
  isEdit = false;
  isCancelled = false;
  minLineId: number;
  lineId: number;
  PONumber: number;
  poLineId: number;
  lineDetails: POLines;
  listCurrency: Array<CodeValue>;
  purchaseOrderStatuses: Array<CodeValue>;
  phxConstants: any;
  removeIndex: number;
  responsePo: POLines;
  pushLastModifiedTime: boolean;
  constructor(private codeValueService: CodeValueService,
    private commonService: CommonService,
    private purchaseOrderObservableService: PurchaseOrderObservableService,
    private purchaseOrderService: PurchaseOrderService,
    private router: Router, private activatedRoute: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.minLineId = 0;
    this.getPurchaseOrderModel();
    this.phxConstants = PhxConstants;
    this.listCurrency = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Currency, true);
    this.purchaseOrderStatuses = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderStatus, true);
    this.modalLineEdit.addClassToConfig('modal-lg');
  }

  getPurchaseOrderModel() {
    this.purchaseOrderObservableService.purchaseOrderOnRouteChange$(this, false).subscribe((response: IPurchaseOrder) => {
      this.purchaseOrder = response;
    });
  }

  removeLine(index: number, pushTime: boolean) {
    this.removeIndex = index;
    this.pushLastModifiedTime = pushTime;
    this.modal.show();
  }

  addLine() {
    this.isAdd = true;
    this.lineId = --this.minLineId;
    this.modalLineEdit.show();
    this.addLines.emit();
    // const navigatePath = `/next/purchase-order/${this.purchaseOrder.Id}/details/line/${this.lineId}`;
    // this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
    //   console.error(`app-subscription: error navigating to ${this.lineId}`, err);
    // });
  }

  onEditLines(id: number, pol: POLines) {
    if (pol && pol.Id && pol.Id > 0) {
      this.isEdit = true;
      this.isAdd = false;
      this.lineId = pol.Id;
      this.lineDetails = pol;
      this.poLineId = pol.PurchaseOrderLineNumber;
      // const navigatePath = `/next/purchase-order/${pol.PurchaseOrderId}/details/line/${this.lineId}`;

      // this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
      //   console.error(`app-subscription: error navigating to ${this.lineId}`, err);
      // });
      this.modalLineEdit.show();
    }
  }

  amountCommitedTotal(po: POLines) {
    let total = 0;
    each(po.WorkOrderPurchaseOrderLines, (link) => {
      total += link.AmountCommited;
    });
    return total;
  }

  amountSpentTotal(po: POLines) {
    let total = 0;
    each(po.WorkOrderPurchaseOrderLines, (link) => {
      total += link.AmountSpent;
    });
    return !total || isNaN(total) ? 0 : total;
  }

  closeModalPOLines() {
    if (!this.isAdd) {
      if (this.purchaseOrder && this.purchaseOrder.PurchaseOrderLines) {
        this.purchaseOrder.PurchaseOrderLines = filter(this.purchaseOrder.PurchaseOrderLines, i => { return i.Id > 0; });
        this.stateService.dispatchOnAction(
          new PurchaseOrderAction.PurchaseOrderUpdate({
            ...this.purchaseOrder
          })
        );
      }
    } else if (this.isCancelled && (this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Draft || this.purchaseOrder.StatusId === PhxConstants.PurchaseOrderStatus.Active)) {
      if (this.purchaseOrder && this.purchaseOrder.PurchaseOrderLines) {
        const count = find(this.purchaseOrder.PurchaseOrderLines, a => { return a.StatusId === PhxConstants.PurchaseOrderStatus.New; });
        if (count) {
          this.purchaseOrder.PurchaseOrderLines.pop();
          this.stateService.dispatchOnAction(
            new PurchaseOrderAction.PurchaseOrderUpdate({
              ...this.purchaseOrder
            })
          );
        }
      }
    }
    // this.router.navigate(['/next', 'purchase-order', this.purchaseOrder.Id, 'details']);
  }

  onOutputEvent(entityId: number) {
    this.purchaseOrderService.getByPurchaseOrderLineId(entityId,
      oreq.request()
        .withExpand(['WorkOrderPurchaseOrderLines'])
        .withSelect([
          'Id',
          'StatusId',
          'PurchaseOrderId',
          'PurchaseOrderLineNumber',
          'PurchaseOrderLineReference',
          'StartDate',
          'EndDate',
          'Amount',
          'CurrencyId',
          'IsTaxIncluded',
          'DepletionOptionId',
          'DepletionGroupId',
          'Description',
          'IsDraft',
          'WorkOrderPurchaseOrderLines',
          'LastModifiedDatetime',
        ]).url()).subscribe((response: any) => {
          if (response) {
            const pol = response.Items[0];
            this.responsePo = {
              Id: pol.Id,
              StartDate: pol.StartDate,
              StatusId: pol.StatusId,
              EndDate: pol.EndDate,
              PurchaseOrderId: pol.PurchaseOrderId,
              PurchaseOrderLineNumber: pol.PurchaseOrderLineNumber,
              PurchaseOrderLineReference: pol.PurchaseOrderLineReference,
              CurrencyId: pol.CurrencyId,
              IsTaxIncluded: pol.IsTaxIncluded,
              DepletionOptionId: pol.DepletionOptionId,
              DepletionGroupId: pol.DepletionGroupId,
              Description: pol.Description,
              IsDraft: pol.IsDraft,
              Amount: pol.Amount,
              WorkOrderPurchaseOrderLines: pol.WorkOrderPurchaseOrderLines,
              LastModifiedDatetime: pol.LastModifiedDatetime,
            };
            this.purchaseOrder.PurchaseOrderLines.push(this.responsePo);
            this.purchaseOrder.PurchaseOrderLines = filter(this.purchaseOrder.PurchaseOrderLines, i => { return i.Id > 0; });
            this.stateService.dispatchOnAction(
              new PurchaseOrderAction.PurchaseOrderUpdate({
                ...this.purchaseOrder
              })
            );
          }
        });
  }

  onDraftStatus(lines: POLineNew) {
    this.isCancelled = false;
    this.responsePo = {
      Id: lines.Id,
      StartDate: lines.StartDate,
      StatusId: lines.StatusId,
      EndDate: lines.EndDate,
      PurchaseOrderId: lines.PurchaseOrderId,
      PurchaseOrderLineNumber: lines.PurchaseOrderLineNumber,
      PurchaseOrderLineReference: lines.PurchaseOrderLineReference,
      CurrencyId: lines.CurrencyId,
      IsTaxIncluded: lines.IsTaxIncluded,
      DepletionOptionId: lines.DepletionOptionId,
      DepletionGroupId: lines.DepletionGroupId,
      Description: lines.Description,
      IsDraft: lines.IsDraft,
      Amount: lines.Amount,
      WorkOrderPurchaseOrderLines: lines.WorkOrderPurchaseOrderLines,
      LastModifiedDatetime: this.getMaxLastModified(),
    };
    const isExist = filter(this.purchaseOrder.PurchaseOrderLines, i => i.Id === this.responsePo.Id).length;
    if (isExist) {
      const index = findIndex(this.purchaseOrder.PurchaseOrderLines, a => { return a.Id === this.responsePo.Id; });
      if (index !== -1) {
        this.purchaseOrder.PurchaseOrderLines.splice(index, 1, this.responsePo);
      }
    }
    this.stateService.dispatchOnAction(
      new PurchaseOrderAction.PurchaseOrderUpdate({
        ...this.purchaseOrder
      })
    );
  }

  getMaxLastModified() {
    if (!this.purchaseOrder.LastModifiedDatetime) {
      return new Date(Date.now());
    }
    let dates = [this.purchaseOrder.LastModifiedDatetime];
    each(this.purchaseOrder.PurchaseOrderLines, (pol: any) => {
      if (!pol.LastModifiedDatetime || typeof pol.LastModifiedDatetime === 'string') { return; }
      dates.push(pol.LastModifiedDatetime);
      each(pol.WorkOrderPurchaseOrderLines, (wopol: any) => {
        if (!wopol.LastModifiedDatetime || typeof wopol.LastModifiedDatetime === 'string') { return; }
        dates.push(wopol.LastModifiedDatetime);
      });
    });
    if (this.purchaseOrder.deletedPurchaseOrderLines && this.purchaseOrder.deletedPurchaseOrderLines.length > 0) {
      dates = dates.concat(this.purchaseOrder.deletedPurchaseOrderLines);
    }
    return new Date(Math.max.apply(Math, dates));
  }

  amountResevedTotal(po: POLines) {
    let total = 0;
    each(po.WorkOrderPurchaseOrderLines, function (link) {
      total += link.AmountReserved;
    });
    return !total || isNaN(total) ? 0 : total;
  }

  onCancel(value: any) {
    this.isCancelled = value;
  }

  modalFabButtons = [
    {
      icon: 'done',
      tooltip: 'Yes',
      btnType: 'primary',
      action: () => {
        this.modal.hide();
        this.removeLines.emit(this.removeIndex);
      }
    },
    {
      icon: 'library_add',
      tooltip: 'No',
      btnType: 'default',
      action: () => {
        this.modal.hide();
        console.log('Save & New');
      }
    }
  ];
}
