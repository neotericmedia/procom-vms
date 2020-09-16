import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild } from '@angular/core';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { IWorkOrder } from '../state';

@Component({
  selector: 'app-workorder-tab-purchaseorder-lines',
  templateUrl: './workorder-tab-purchaseorder-lines.component.html',
  styleUrls: ['./workorder-tab-purchaseorder-lines.component.less']
})
export class WorkorderTabPurchaseorderLinesComponent implements OnInit, OnChanges {
  @Input() lineModal: PhxModalComponent;
  @Input() purchaseOrderSearchLines: any[] = [];
  @Input() workOderPurchaseOrderLineId: string;
  @Input() AssignmentId: number;
  @Input() workorderId: number;
  @Input() workorderNumber: number;
  @Input() workorderVersion: number;
  @Output() cancelLineEvent = new EventEmitter<any>();
  @ViewChild('modalLineAdd') modalLineAdd: PhxModalComponent;
  @Output() OnClickCancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() outputEvent = new EventEmitter<any>();

  lineId: number;
  lineNumber: number;
  poNumber: string;
  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.AssignmentId && changes.AssignmentId.currentValue) {
      this.AssignmentId = changes.AssignmentId.currentValue;
    }
    if (changes.workorderId && changes.workorderId.currentValue) {
      this.workorderId = changes.workorderId.currentValue;
    }
    if (changes.workorderNumber && changes.workorderNumber.currentValue) {
      this.workorderNumber = changes.workorderNumber.currentValue;
    }
    if (changes.workorderVersion && changes.workorderVersion.currentValue) {
      this.workorderVersion = changes.workorderVersion.currentValue;
    }
  }

  ngOnInit() {
    this.modalLineAdd.addClassToConfig('modal-lg');
  }

  onItemClicked(item: any) {
    this.lineId = item.Id;
    this.lineNumber = item.PurchaseOrderLineNumber;
    this.poNumber = item.PurchaseOrderNumber;
    this.lineModal.hide();
    this.workOderPurchaseOrderLineId = '-1';
    this.modalLineAdd.show();
  }

  cancel() {
    this.OnClickCancel.emit();
    this.modalLineAdd.hide();
    this.cancelLineEvent.emit();
  }

  onCancel(e) {
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

}
