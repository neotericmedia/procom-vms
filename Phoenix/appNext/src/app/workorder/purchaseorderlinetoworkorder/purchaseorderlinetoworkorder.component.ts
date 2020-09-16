import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhxDataTableStateSavingMode, PhxDataTableConfiguration, PhxDataTableColumn, CodeValue } from '../../common/model/index';

@Component({
  selector: 'app-purchaseorderlinetoworkorder',
  templateUrl: './purchaseorderlinetoworkorder.component.html',
  styleUrls: ['./purchaseorderlinetoworkorder.component.less']
})
export class PurchaseorderlinetoworkorderComponent implements OnInit {
  @Input() purchaseOrderSearchLines: any[] = [];
  @Output() itemClicked:EventEmitter<any> = new EventEmitter<any>();
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    columnHidingEnabled: true,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    showColumnChooser: false,
    showGrouping: false,
    showSearch: false,

  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderNumber',
      caption: 'PO Number',
      width: 100
    }),
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderLineNumber',
      caption: 'Line',
      alignment: 'right',
      width: 50
    }),
    new PhxDataTableColumn({
      dataField: 'PurchaseOrderDepletionGroupId',
      caption: 'Depletion Group',
      dataType: 'number',
      lookup: {
        dataSource: this.getPurchaseOrderDepletedGroups(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'Amount',
      caption: 'Total Funds',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountCommited',
      caption: 'Funds Committed',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'AmountSpent',
      caption: 'Funds Spent',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'StatusId',
      caption: 'Status',
      dataType: 'number',
      lookup: {
        dataSource: this.getPurchaseOrderStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    })
  ];

  constructor(
    private commonService: CommonService,
    private codeValueService: CodeValueService,
  ) { }

  ngOnInit() {
  }

  public onRowClick(event: any) {
    if (event && event.rowType === 'data') {
      this.itemClicked.emit(event.data);
    }
  }



  getPurchaseOrderDepletedGroups() {
    return this.codeValueService
      .getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderDepletedGroups, true)
      .sort((a, b) => a.sortOrder - b.sortOrder).map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getPurchaseOrderStatusLookup() {
    return this.codeValueService
      .getCodeValues(this.commonService.CodeValueGroups.PurchaseOrderStatus, true)
      .sort((a, b) => a.sortOrder - b.sortOrder).map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }
}
