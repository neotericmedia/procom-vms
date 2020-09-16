import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CodeValueService, CommonService } from '../../common';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { CodeValue, PhxDataTableColumn, PhxDataTableConfiguration } from '../../common/model';
import { WindowRefService } from './../../common/services/WindowRef.service';

@Component({
  selector: 'app-commission-report-drilldown',
  templateUrl: './commission-report-drilldown.component.html',
  styleUrls: ['./commission-report-drilldown.component.less']
})
export class CommissionReportDrilldownComponent implements OnInit, OnChanges {

  @ViewChild('grid') grid: PhxDataTableComponent;
  _data: any;
  title: string;
  columnTemplate: string;
  dataItems: any[];
  @Input('data')
  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    if (this._data) {
      const { columnTemplate, title, dataItems } = this._data;
      this.columnTemplate = columnTemplate;
      this.title = title;
      this.componentName = `commissionReport${this.title.replace(/ /g, '')}Component`;
      this.dataItems = dataItems;

      // this.grid.instance.refresh();
    } else {

    }
  }
  exportFileName: string;
  componentName: string;
  decimalColumnFormat = { type: 'fixedPoint', precision: 2 };
  decimalColumnFormat4 = { type: 'fixedPoint', precision: 4 };
  codeValueGroups: any;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: true,
    pageSize: 100000,
  });

  columns: Array<PhxDataTableColumn>;
  earningColumns: Array<PhxDataTableColumn>;
  intrestColumns: Array<PhxDataTableColumn>;
  adjustmentColumns: Array<PhxDataTableColumn>;
  recurringAdjustmentColumns: Array<PhxDataTableColumn>;


  constructor(
    protected commonService: CommonService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.initColumns();
  }

  generateColumns() {
    if (this.columnTemplate === 'EarningsModal') {
      this.columns = this.earningColumns;
    } else if (this.columnTemplate === 'IntrestModal') {
      this.columns = this.intrestColumns;
    } else if (this.columnTemplate === 'AdjustmentsModal') {
      this.columns = this.adjustmentColumns;
    } else if (this.columnTemplate === 'RecurringAdjustmentsModal') {
      this.columns = this.recurringAdjustmentColumns;
    }

  }

  onRowClick($event) {
    console.log($event);
  }
  ngOnInit() {


  }

  initColumns() {
    this.earningColumns = [
      new PhxDataTableColumn({
        dataField: 'TransactionNumber',
        caption: 'TransactionNumber',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'LegalStatus',
        caption: 'Legal Status',
        lookup: {
          dataSource: this.getUserProfileTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ClientOrganizationName',
        caption: 'ClientOrganizationName',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'GrossMargin',
        caption: 'Gross Profit',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'LineOfBusinessId',
        caption: 'LOB',
        lookup: {
          dataSource: this.getLineOfBusinessLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionDescription',
        caption: 'Commission',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionPercentage',
        caption: 'Commission Percentage',
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'commissionPercentageCellTemplate',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionAmount',
        caption: 'Commission Amount',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: 'Start Date',
        dataType: 'date',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: 'End Date',
        dataType: 'date',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'BillAmount',
        caption: 'Bill Amount',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'GrossPay',
        caption: 'Gross Pay',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'Units',
        caption: 'Units',
        dataType: 'decimal',
        alignment: 'right',
        format: this.decimalColumnFormat,
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'EmployerCost',
        caption: 'Employer Cost',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'VmsOrMspFee',
        caption: 'Vms/Msp Fee',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'Rebate',
        caption: 'Rebate',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'CommissionStatusId',
        caption: 'Status',
        lookup: {
          dataSource: this.getCommissionTransactionStatusLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'AccruedVacationPay',
        caption: 'Accrued VacationPay',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
            dataField: 'CPP_EI_EHT_Amounts',
            caption: 'CPP/EI Maxout | EHT Liability',
            dataType: 'money',
            isFromOdata: false
        }),
	  new PhxDataTableColumn({
        dataField: 'MultiPay',
        caption: 'Multi Pay',
        isFromOdata: false
      }),
    ];
    this.intrestColumns = [
      new PhxDataTableColumn({
        dataField: 'TransactionId',
        caption: 'TransactionId',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'ClientOrganization',
        caption: 'ClientOrganization',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'InvoiceReleaseDate',
        caption: 'Invoice Release Date',
        dataType: 'date',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerPayReleaseDate',
        caption: 'Worker Pay Date',
        dataType: 'date',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'ClientPayDate',
        caption: 'Client Pay Date',
        dataType: 'date',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentAmount',
        caption: 'Payment Amount',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'DaysPassed',
        caption: 'Days Passed',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'DaysInterestAccrued',
        caption: 'Intrest Days',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionRate',
        caption: 'Commission Rate',
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'commissionPercentageCellTemplate',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'ClientPercentPaid',
        caption: 'Commission Percentage Paid',
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'commissionPercentageCellTemplate',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'InterestIncurred',
        caption: 'Intrest Incurred',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'InterestOnTransaction',
        caption: 'Intrest On Transaction',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'InterestToSales',
        caption: 'Intrest To Sales',
        dataType: 'number',
        isFromOdata: false
      }),
    ];
    this.adjustmentColumns = [
      new PhxDataTableColumn({
        dataField: 'CommissionRateHeaderId',
        caption: 'Commission Rate Id',
        dataType: 'number',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'AdjustmentTypeId',
        caption: 'Type',
        lookup: {
          dataSource: this.getAdjustmentTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Description',
        caption: 'Description',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionDescription',
        caption: 'Commission',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'AdjustmentAmountNet',
        caption: 'Total Amount',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionPercentage',
        caption: 'Commission Percentage',
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'commissionPercentageCellTemplate',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionAmount',
        caption: 'Commission Amount',
        dataType: 'money',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'CommissionStatusId',
        caption: 'Status',
        lookup: {
          dataSource: this.getCommissionTransactionStatusLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
    ];
    this.recurringAdjustmentColumns = [
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'AdjustmentTypeId',
        caption: 'Type',
        lookup: {
          dataSource: this.getAdjustmentTypeLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Description',
        caption: 'Description',
        isFromOdata: false
      }),
      new PhxDataTableColumn({
        dataField: 'CommissionAmount',
        caption: 'Commission Amount',
        dataType: 'money',
        isFromOdata: false
      }),
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.generateColumns();
      this.exportFileName = this.title;
    }
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [];
      if (this.columnTemplate === 'EarningsModal' || this.columnTemplate === 'IntrestModal') {
        event.items.push({
          text: 'Open in new tab',
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionId}/summary`);
          }
        });
      } else if (this.columnTemplate === 'AdjustmentsModal' || this.columnTemplate === 'RecurringAdjustmentsModal') {
        event.items.push({
          text: 'Open in new tab',
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/commission/adjustment/edit/${event.row.data.AdjustmentId}`);
          }
        });
      }
    }
  }

  getLineOfBusinessLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.LineOfBusiness, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getUserProfileTypeLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.ProfileType, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getCommissionStatusLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.CommissionTransactionStatus, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getAdjustmentTypeLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.CommissionAdjustmentHeaderType, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getCommissionTransactionStatusLookup() {
    return this.codeValueService
      .getCodeValues(this.codeValueGroups.CommissionTransactionStatus, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

}
