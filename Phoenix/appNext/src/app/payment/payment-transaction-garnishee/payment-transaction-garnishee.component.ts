import { WindowRefService } from './../../common/services/WindowRef.service';
import { CodeValue } from './../../common/model/code-value';
import { CodeValueService } from './../../common/services/code-value.service';
import { PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableStateSavingMode } from './../../common/model/index';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonService, PhxLocalizationService } from '../../common/index';

@Component({
  selector: 'app-payment-transaction-garnishee',
  templateUrl: './payment-transaction-garnishee.component.html',
  styleUrls: ['./payment-transaction-garnishee.component.less']
})
export class PaymentTransactionGarnisheeComponent implements OnInit {
  @ViewChild('grid') grid: PhxDataTableComponent;
  amountColumnFormat = { type: 'fixedPoint', precision: 2 };

  // odataParams = '';
  odataParams: string = `CurrencyId`;
  @Input() paymentId: number;
  @Input() isShowFirstTransactionDocument: boolean;
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    showSearch: false,
    showFilter: false,
    showGrouping: false,
    showColumnChooser: false,
    showTotalCount: false
  });

  columns: Array<PhxDataTableColumn>;

  constructor(private codeValueService: CodeValueService, private commonService: CommonService, private localizationService: PhxLocalizationService, private winRef: WindowRefService) {}

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'GarnisheeId',
        width: 100,
        caption: this.localizationService.translate('payment.transactionGarnishee.garnisheeIdColumnHeader'),
        hidingPriority: 1
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'PaymentTransactionNumber',
        caption: this.localizationService.translate('payment.transaction.paymentTransactionNumberColumnHeader'),
        hidingPriority: 9
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'AssignmentWorkOrderNumber',
        caption: this.localizationService.translate('payment.transaction.workOrderColumnHeader'),
        hidingPriority: 2,
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate('payment.transaction.workerColumnHeader'),
        hidingPriority: 5
      }),
      new PhxDataTableColumn({
        dataField: 'TransactionTypeId',
        caption: this.localizationService.translate('payment.transaction.transactionTypeColumnHeader'),
        hidingPriority: 4,
        dataType: 'number',
        lookup: {
          dataSource: this.getTransactionTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: this.localizationService.translate('payment.transaction.startDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 7
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: this.localizationService.translate('payment.transaction.endDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 6
      }),
      new PhxDataTableColumn({
        dataField: 'GarnisheeReference',
        caption: this.localizationService.translate('payment.transactionGarnishee.garnisheeReferenceColumnHeader'),
        hidingPriority: 3
      }),
      new PhxDataTableColumn({
        dataField: 'AmountNet',
        caption: this.localizationService.translate('payment.transaction.amountNetColumnHeader'),
        dataType: 'decimal',
        alignment: 'right',
        hidingPriority: 8,
        cellTemplate: 'currencyTemplate'
      })
    ];
  }

  getTransactionTypeLookup() {
    return this.codeValueService
      .getCodeValues('trn.CodeTransactionType', true)
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
          value: codeValue.id
        };
      });
  }

  ngOnInit() {
    this.buildColumns();

    if (this.paymentId) {
      this.odataParams = `$filter= PaymentId eq ` + this.paymentId;
    }
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [
        {
          text: this.localizationService.translate('payment.transaction.openTransactionNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionHeaderId}/summary`);
          }
        }
      ];

      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: this.localizationService.translate('payment.transaction.openWorkOrderNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
          }
        });
      }
    }
  }

  onRowClick(event: any) {
    event.data.PaymentId = this.paymentId;
    this.rowClick.emit(event.data);
  }

  displayCurrencyCode(currencyId): string {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }

  getCodeValue(codeTable: string) {
    return this.codeValueService
      .getCodeValues(codeTable, true)
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
          code: codeValue.code
        };
      });
  }
}
