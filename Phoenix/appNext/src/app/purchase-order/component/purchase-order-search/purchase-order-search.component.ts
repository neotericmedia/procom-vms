import { Component, OnInit, Inject } from '@angular/core';
import { PhxDataTableConfiguration } from '../../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../../common/state/service/state.service';
import { NavigationService } from './../../../common/services/navigation.service';

import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
import { WindowRefService } from '../../../common/services/WindowRef.service';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';

declare var oreq: any;

@Component({
  selector: 'app-purchase-order-search',
  templateUrl: './purchase-order-search.component.html',
  styleUrls: ['./purchase-order-search.component.less']
})

export class PurchaseOrderSearchComponent implements OnInit {
  purchaseOrders: any;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=Id,PurchaseOrderNumber,OrganizationDisplayName,TotalAmount,TotalAmountCommitted,TotalAmountSpent,PurchaseOrderStatusId,CurrencyId,OrganizationId';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
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
      dataField: 'OrganizationDisplayName',
      caption: 'Client Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'TotalAmount',
      caption: 'Total Funds',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'TotalAmountCommitted',
      caption: 'Funds Committed',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
      cellTemplate: 'viewCurrencyCodeTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'TotalAmountSpent',
      caption: 'Funds Spent',
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
    }),
    new PhxDataTableColumn({
      dataField: 'CurrencyId',
      caption: 'Currency',
      dataType: 'string',
      lookup: {
        dataSource: this.getCurrencyLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    })
  ];

  constructor(
    private codeValueService: CodeValueService,
    private navigationService: NavigationService,
    private winRef: WindowRefService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewPurchaseOrderDetail(event.currentSelectedRowKeys[0]);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewPurchaseOrderDetail(rowdata) {
    // this.$state.go('purchaseorder.edit.details', { purchaseOrderId: rowdata.Id });
    this.router.navigate(['/next', 'purchase-order', rowdata.Id, 'details']);
  }

  createPurchaseOrder() {
    this.router.navigate(['create'], { relativeTo: this.activatedRoute.parent });
  }

  ngOnInit() {
    this.navigationService.setTitle('purchaseorder-manage');
  }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('po.CodePurchaseOrderStatus', true)
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

  getCurrencyLookup() {
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
          text: codeValue.code + ' - ' + codeValue.text,
          value: codeValue.id
        };
      });
  }

  getCodeValue(codeTable: string) {
    return this.codeValueService.getCodeValues(codeTable, true)
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
          text: codeValue.text,
          id: codeValue.id,
          code: codeValue.code,
        };
      });
  }

  public displayCurrencyCode(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }

  public displayCurrencyText(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).text;
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [{
        text: 'Open purchase order in new tab',
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/purchase-order/${event.row.data.Id}/details`);
        }
      },
      {
        text: 'Open client company in new tab',
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/organization/${event.row.data.OrganizationId}/details`);
        }
      }];
    }
  }
}
