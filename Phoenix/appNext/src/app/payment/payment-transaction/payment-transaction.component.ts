import { WindowRefService } from './../../common/services/WindowRef.service';
import { CodeValue } from './../../common/model/code-value';
import { CodeValueService } from './../../common/services/code-value.service';
import { PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableStateSavingMode, UserProfile, PhxConstants } from './../../common/model/index';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-payment-transaction',
  templateUrl: './payment-transaction.component.html',
  styleUrls: ['./payment-transaction.component.less']
})
export class PaymentTransactionComponent implements OnInit, AfterViewInit {
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
  currentUserProfile: UserProfile;

  constructor(
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
    private winRef: WindowRefService,
    private authService: AuthService
  ) {
    this.authService.getCurrentProfile().subscribe(userProfile => {
      this.currentUserProfile = userProfile;
    });
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate('payment.transaction.idColumnHeader'),
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
        dataField: 'AssignmnetWorkOrderNumber',
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
        dataField: 'WorksiteId',
        caption: this.localizationService.translate('payment.transaction.worksiteColumnHeader'),
        hidingPriority: 3,
        lookup: {
          dataSource: this.getWorksiteLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
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

  getWorksiteLookup() {
    return this.codeValueService
      .getCodeValues('workorder.CodeWorksite', true)
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
      this.odataParams = `$filter= PaymentIds/any(x: x eq ` + this.paymentId + `)`;
    }
  }
  ngAfterViewInit(): void {
    if (this.isShowFirstTransactionDocument) {
      this.showFirstTransactionDocument();
    }
  }

  private showFirstTransactionDocument(): void {
    this.grid.grid.onContentReady.take(1).subscribe(() => {
      const row = this.grid.grid.instance.getVisibleRows()[0];
      this.grid.grid.instance.selectRows(row.data, false);
      this.onRowClick(row);
    });
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data'
      && (this.currentUserProfile.ProfileTypeId === PhxConstants.UserProfileType.Internal
        || this.currentUserProfile.ProfileTypeId === PhxConstants.UserProfileType.Organizational)) {
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
