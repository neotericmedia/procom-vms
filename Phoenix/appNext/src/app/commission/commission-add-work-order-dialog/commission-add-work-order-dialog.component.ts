import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

@Component({
  selector: 'app-commission-add-work-order-dialog',
  templateUrl: './commission-add-work-order-dialog.component.html',
  styleUrls: ['./commission-add-work-order-dialog.component.less']
})

export class CommissionAddWorkOrderDialogComponent implements OnInit, OnChanges {

  workOrders: Array<any> = [];
  @Input() selectedWorkorders: any[];
  @Input() organizationIdInternal: number;
  @Input() clientOrganizationId: number;
  @Output() workOrderSelectionChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelWorkOrderDialog: EventEmitter<any> = new EventEmitter<any>();;

  constructor() { }

  ngOnInit() {
  }

  onChangeWorkOrderSelection(workOrders: any) {
    this.workOrders = [];
    this.workOrders = cloneDeep(workOrders);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedWorkorders && changes.selectedWorkorders.currentValue) {
      this.selectedWorkorders = changes.selectedWorkorders.currentValue.map(a => a.value);
    }
  }

  onClickSelect() {
    this.workOrderSelectionChange.emit(this.workOrders);
  }

  onClickCancel() {
    this.cancelWorkOrderDialog.emit();
  }

}
