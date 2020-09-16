// angular
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
// common
import { PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model';
import { CodeValueService } from '../../common';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';

@Component({
  selector: 'app-transaction-purchase-order',
  templateUrl: './transaction-purchase-order.component.html',
  styleUrls: ['./transaction-purchase-order.component.less']
})
export class TransactionPurchaseOrderComponent implements OnInit, OnChanges {
  @Input() transactionHeaderId: number;
  @ViewChild('grid') grid: PhxDataTableComponent;

  purchaseOrders: any;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string =
    '$select=PurchaseOrderLineCurrencyId,PurchaseOrderLineStatusId,PurchaseOrderLineStartDate,PurchaseOrderLineEndDate,Id,PurchaseOrderId,PurchaseOrderNumber,PurchaseOrderLineNumber,PurchaseOrderLineId, StatusId,Amount,AmountCommited,AmountReserved,AmountRemaining,AmountSpent';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderLineId',
      width: 100,
      caption: 'ID',
      fixed: true,
      dataType: 'number',
      sortOrder: 'desc'
    }),
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderNumber',
      caption: 'PO Number',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderLineNumber',
      caption: 'Line Number',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'Amount',
      caption: 'Funds',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountCommited',
      caption: 'Funds Committed',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountSpent',
      caption: 'Funds Spent',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountRemaining',
      caption: 'Funds Remaining',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderStatusId',
      caption: 'Status',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    })
  ];
  @Output() selectionChanged = new EventEmitter<any>();
  private _rowsSelected: boolean;
  @Input() public set clearSelectedRows(val: boolean) {
    const gridInstance = this.grid.grid.instance;
    if (gridInstance !== undefined) {
      gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
      this._rowsSelected = false;
    }
  }
  public get clearSelectedRows(): boolean {
    return this._rowsSelected;
  }

  constructor(private codeValueService: CodeValueService) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transactionHeaderId && changes.transactionHeaderId.currentValue) {
      this.transactionHeaderId = changes.transactionHeaderId.currentValue;
    }
  }

  onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.selectionChanged.emit({ status: 'POLineAdd', event: event });
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  getStatusLookup() {
    return this.codeValueService
      .getCodeValues('po.CodePurchaseOrderStatus', true)
      .sort((a, b) => {
        if (a.sortOrder < b.sortOrder) {
          return -1;
        }
        if (a.sortOrder > b.sortOrder) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }
}
