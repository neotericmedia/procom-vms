import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { PhxDataTableConfiguration } from '../../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../../common/model/data-table/phx-data-table-column';

import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
declare var oreq: any;

@Component({
  selector: 'app-purchase-order-work-orders',
  templateUrl: './purchase-order-work-orders.component.html',
  styleUrls: ['./purchase-order-work-orders.component.less']
})

export class PurchaseOrderWorkOrdersComponent implements OnInit {
  @Input() purchaseOrderId: number;
  purchaseOrders: any;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=AssignmentId,WorkOrderId,PurchaseOrderLineNumber,WorkOrderFullNumber,AmountCommited,AmountSpent,PurchaseOrderLineCurrencyId';
  dataSourceUrl: string;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderLineNumber',
      caption: 'PO Line',
      dataType: 'number',
      sortIndex: 2,
      sortOrder: 'asc',
    }),
    new PhxDataTableColumn({
      dataField: 'WorkOrderFullNumber',
      caption: 'Work Order',
      dataType: 'string',
      sortIndex: 1,
      sortOrder: 'asc',
    }),
    new PhxDataTableColumn({
      dataField: 'AmountCommited',
      caption: 'Funds Committed',
      cellTemplate: 'viewFormattedFundsCommitted',
      alignment: 'right',
      dataType: 'decimal'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountSpent',
      caption: 'Funds Spent',
      cellTemplate: 'viewFormattedFundsSpent',
      alignment: 'right',
      dataType: 'decimal'
    })
  ];

  constructor(
    private codeValueService: CodeValueService,
    private router: Router
  ) { }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewWorkOrderDetail(event.currentSelectedRowKeys[0]);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewWorkOrderDetail(rowdata) {
    // fix me
    // this.$state.go('workorder.edit.core', { assignmentId: rowdata.AssignmentId, workOrderId: rowdata.WorkOrderId, workOrderVersionId: 0 });
    this.router.navigate(['/next', 'purchase-order', rowdata.WorkOrderId, 'details']);
  }
  ngOnInit() {
    console.log(this.purchaseOrderId);
    this.dataSourceUrl = 'purchaseorder/getWorkOrderPurchaseOrderLinesByPurchaseOrderId/' + this.purchaseOrderId;
  }
  displayCurrency(currencyId) {
    return this.getCurrencyCode().find(c => c.value === currencyId).text;
  }

  getCurrencyCode() {
    return this.codeValueService.getCodeValues('geo.CodeCurrency', true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.code,
          value: codeValue.id
        };
      });
  }
}
