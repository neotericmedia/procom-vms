import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { PhxLocalizationService } from '../../common/index';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../common/model/index';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';
import { CommonService } from '../../common/services/common.service';

@Component({
  selector: 'app-batch-grouped-by-payee-dialog',
  templateUrl: './batch-grouped-by-payee-dialog.component.html',
  styleUrls: ['./batch-grouped-by-payee-dialog.component.less']
})
export class BatchGroupedByPayeeDialogComponent implements OnInit, OnChanges {

  constructor( private localizationService: PhxLocalizationService,
    private commonService: CommonService ) {
    }

  @ViewChild('grid') grid: PhxDataTableComponent;
  @Input() dataItems: any;
  @Input() bankAccounts: any[];

  columns: Array<PhxDataTableColumn>;
  exportFileName: string;
  componentName: string;
  decimalColumnFormat = { type: 'fixedPoint', precision: 2 };
  payeeList: any[];
  isNotValidTransactions: boolean;
  hasCreditTransactions: boolean;
  batchNo: number;
  bankName: string;
  formatDateFull: string;
  isDepositdate: boolean;


  detailDataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    columnHidingEnabled: true,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    showFilter: false,
    showColumnChooser: false,
    showSearch: false,
    showGrouping: false,
    showTotalCount: false,
    showBorders: false,
    rowAlternationEnabled: false,
  });

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'PayeeName',
        caption: 'Payee Name',
        width: 200
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentSubtotal',
        caption: 'Subtotal',
        dataType: 'decimal',
        format: this.decimalColumnFormat,
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentSalesTax',
        caption: 'SalesTax',
        dataType: 'decimal',
        format: this.decimalColumnFormat,
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTotal',
        dataType: 'decimal',
        caption: 'Total',
        format: this.decimalColumnFormat,
      }),
    ];
  }


  ngOnInit() {
    this.formatDateFull = this.commonService.ApplicationConstants.DateFormat.longDate;
    this.buildColumns();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.dataItems && changes.dataItems.currentValue) {
      this.dataItems = changes.dataItems.currentValue;
    }
    if (this.dataItems && this.dataItems.GroupedPaymentTransactionsList) {
      const batch: any = this.bankAccounts.find(bankAccount => bankAccount.id === this.dataItems.BankId);
      this.batchNo = batch && batch.batchNo;
      this.bankName = batch && batch.text;
      this.isDepositdate = typeof(this.dataItems.DepositDate) === 'object';
      this.isNotValidTransactions = this.dataItems.GroupedPaymentTransactionsList.some(trn => trn['IsSelected'] !== true);
      this.payeeList = this.dataItems.GroupedPaymentTransactionsList.filter(x => x.IsNegativeSelected !== true);
      this.hasCreditTransactions = this.payeeList.length > 0;
    }
  }
}
