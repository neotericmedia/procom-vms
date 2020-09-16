import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, RowHighlightingConfig, PhxConstants } from '../../../common/model/index';

import { NavigationService } from './../../../common/services/navigation.service';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { CommonService, PhxLocalizationService } from '../../../common/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
import { WindowRefService } from '../../../common/services/WindowRef.service';
import * as moment from 'moment';

@Component({
  selector: 'app-transaction-search',
  templateUrl: './transaction-search.component.html',
  styleUrls: ['./transaction-search.component.less']
})
export class TransactionSearchComponent implements OnInit, OnDestroy {

  phxConstants: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  // tslint:disable-next-line:max-line-length
  odataParams: string = '$expand=BillingTransactions/BillingTransactionLines&$select=Id,TransactionNumber,AssignmentId,WorkOrderNumber,WorkOrderFullNumber,TransactionTypeId,TransactionCategoryId,OrganizationIdInternal,OrganizationInternalCode,WorkerName,PayeeName,ClientCompany,FromDate,ToDate,Subtotal,Tax,Total,PaymentSubtotal,PaymentTax,PaymentDeductions,PaymentTotal,PONumber,IsDraft, LineOfBusinessId, InvoiceNote1, AlternateBillingClient, BillingTransactions/CurrencyId,WorkOrderId,WorkOrderVersionId,IsTest';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    rowHighlightingConfig: new RowHighlightingConfig()
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      dataType: 'number',
    }),
    new PhxDataTableColumn({
      dataField: 'TransactionNumber',
      caption: 'TXN. #',
    }),
    // new PhxDataTableColumn({
    //    dataField: 'AssignmentId',
    //    caption: 'Work Order',
    //    dataType: 'number',
    //    calculateDisplayValue: function (e) {
    //        return e.AssignmentId.toString() + '.' + e.WorkOrderNumber;
    //    }
    // }),
    new PhxDataTableColumn({
        dataField: 'WorkOrderFullNumber',
        caption: 'Work Order',
        calculateSortValue: 'AssignmentId',
    }),
    new PhxDataTableColumn({
      dataField: 'TransactionTypeId',
      caption: 'Type',
      lookup: {
        dataSource: this.getTypeLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'TransactionCategoryId',
      caption: 'Category',
      lookup: {
        dataSource: this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.TransactionCategory, true),
        valueExpr: 'id',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'OrganizationInternalCode',
      caption: 'Internal Company',
    }),
    new PhxDataTableColumn({
      dataField: 'WorkerName',
      caption: 'Worker Name',
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeName',
      caption: 'Payee Name',
    }),
    new PhxDataTableColumn({
      dataField: 'ClientCompany',
      caption: 'Client Company',
    }),
    new PhxDataTableColumn({
    dataField: 'LineOfBusinessId',
    caption: 'Line Of Business',
    lookup: {
        dataSource: this.getLOBLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
    }
    }),
    new PhxDataTableColumn({
        dataField: 'InvoiceNote1',
        caption: 'Invoice Note 1',
    }),
    new PhxDataTableColumn({
        dataField: 'AlternateBillingClient',
        caption: 'Alternate Billing Client',
    }),
    new PhxDataTableColumn({
      dataField: 'FromDate',
      caption: 'From',
      dataType: 'date',
      // format: 'yyyy-MM-dd',
      // calculateFilterExpression: function (filterValue, selectedFilterOperation) {
      //   return this.defaultCalculateFilterExpression(
      //     new Date(moment(filterValue).format('YYYY-MM-DD') + 'T00:00:00.000Z')
      //     , selectedFilterOperation
      //   );
      // },
    }),
    new PhxDataTableColumn({
      dataField: 'ToDate',
      caption: 'To',
      dataType: 'date',
      // format: 'yyyy-MM-dd',
      // calculateFilterExpression: function (filterValue, selectedFilterOperation) {
      //   return this.defaultCalculateFilterExpression(
      //     new Date(moment(filterValue).format('YYYY-MM-DD') + 'T00:00:00.000Z')
      //     , selectedFilterOperation
      //   );
      // },
    }),
    new PhxDataTableColumn({
      dataField: 'Subtotal',
      caption: 'Bill Subtotal',
      dataType: 'decimal',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'Tax',
      caption: 'Bill Tax',
      dataType: 'decimal',
      cellTemplate: 'billTaxCellTemplate',
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'Total',
      caption: 'Bill Total',
      dataType: 'decimal',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentSubtotal',
      caption: 'Pay Subtotal',
      dataType: 'number',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTax',
      caption: 'Pay Tax',
      dataType: 'decimal',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentDeductions',
      caption: 'Deductions',
      dataType: 'decimal',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTotal',
      caption: 'Pay Total',
      dataType: 'decimal',
      format: this.totalColumnFormat,
      alignment: 'right',
    }),
    new PhxDataTableColumn({
      dataField: 'PONumber',
      caption: 'PO Number',
    }),
    new PhxDataTableColumn({
      dataField: 'IsDraft',
      caption: 'Status',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'IsTest',
      caption: this.localizationService.translate('common.phxDataTable.implementationHeader'),
      dataType: 'boolean',
      lookup: {
        dataSource: PhxDataTableColumn.isTest.lookupDataSource(this.localizationService),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    })
  ];

  constructor(
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private localizationService: PhxLocalizationService,
    private router: Router,
  ) {
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
      this.navigationService.setTitle('transaction-manage');
  }

  ngOnDestroy() {
  }

  public onRowSelected(event: any) {
    if (event && event.data) {
      this.goToTransaction(event.data);
    }
  }

  goToTransaction(transaction) {
    const isManualDraft = transaction.IsDraft && (transaction.TransactionTypeId === PhxConstants.TransactionType.Manual);
    if (isManualDraft) {
      this.router.navigate(['/next', 'transaction', transaction.Id, PhxConstants.TransactionNavigationName.detail ]);
    } else {
      this.router.navigate(['/next', 'transaction', transaction.Id, PhxConstants.TransactionNavigationName.summary ]);
    }
  }

  getTypeLookup() {
    const codeValueGroups = this.commonService.CodeValueGroups;
    return this.codeValueService.getCodeValues(codeValueGroups.TransactionType, true)
      .map((i: CodeValue) => {
        return {
          value: i.id,
          text: i.text,
        };
      });
  }

  getStatusLookup() {
    return [{ value: false, text: 'Active' }, { value: true, text: 'Draft' }];
  }

  // displayCurrencyCode(currencyId): string {
    // return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  // }

  // getCodeValue(codeTable: string) {
  //   return this.codeValueService.getCodeValues(codeTable, true)
  //     .sort((a, b) => {
  //       if (a.code < b.code) {
  //         return -1;
  //       }
  //       if (a.code > b.code) {
  //         return 1;
  //       }
  //       return 0;
  //     })
  //     .map((codeValue: CodeValue) => {
  //       return {
  //         text: codeValue.text,
  //         id: codeValue.id,
  //         code: codeValue.code,
  //       };
  //     });
  // }

  getLOBLookup() {
      return this.codeValueService
          .getCodeValues(this.commonService.CodeValueGroups.LineOfBusiness, true)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((codeValue: CodeValue) => {
              return {
                  text: codeValue.text,
                  value: codeValue.id
              };
          });
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
    event.items = [{
      text: 'Open transaction in new tab',
      onItemClick: () => {
        if (event.row.data.IsDraft && (event.row.data.TransactionTypeId === PhxConstants.TransactionType.Manual)) {
          return this.winRef.nativeWindow.open(`#/next/transaction/${event.row.data.Id}/detail`,  '_blank');
        } else {
          return this.winRef.nativeWindow.open(`#/next/transaction/${event.row.data.Id}/summary`,  '_blank');
        }
      }}];

      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId ) {
        event.items.push({
          text: 'Open work order in new tab',
          onItemClick: () => {
          this.winRef.nativeWindow.open(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`, '_blank');
          }
        });
      }
    }
  }
}
