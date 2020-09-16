// angular
import { Component, OnInit, Input } from '@angular/core';
// common
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService } from '../../common/index';
import { CodeValue } from '../../common/model/code-value';

@Component({
  selector: 'app-transaction-payments',
  templateUrl: './transaction-payments.component.html',
  styleUrls: ['./transaction-payments.component.less']
})
export class TransactionPaymentsComponent implements OnInit {
  @Input() transactionHeaderId: number;
  transactionPayments: any;
  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  odataParams: string = '$select=Id,PaymentNumber,PaymentDate,PaymentMethodId,PaymentReference,CurrencyId,PaymentAmount,PaymentTransactionStatusId,PayeeTypeId';
  dataSourceUrl: string;
  workflowPendingTaskId: number;
  showSlider: boolean = false;
  paymentId: number;
  paymentTransactionId: number;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true,
    showFilter: true
  });
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentNumber',
      caption: 'Payment Number',
      dataType: 'string',
      sortIndex: 0,
      sortOrder: 'asc'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentDate',
      caption: 'Payment Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentMethodId',
      caption: 'Payment Method',
      dataType: 'string',
      lookup: {
        dataSource: this.getCodeValue('payment.CodePaymentMethodType'),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentReference',
      caption: 'Payment Reference',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeTypeId',
      caption: 'Payee Type',
      lookup: {
        dataSource: this.getCodeValue('payment.CodePayeeType'),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentAmount',
      caption: 'Amount',
      alignment: 'right',
      dataType: 'decimal',
      cellTemplate: 'viewFormattedPaymentAmount'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTransactionStatusId',
      caption: 'Payment Status',
      lookup: {
        dataSource: this.getCodeValue('trn.CodePaymentTransactionStatus'),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    })
  ];

  constructor(private codeValueService: CodeValueService, public commonService: CommonService) {}

  ngOnInit() {
    this.dataSourceUrl = 'transactionHeader/getTransactionHeaderPayments/transactionHeader/' + this.transactionHeaderId;
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

  public onRowClick(event: any) {}
  onPaymentTransactionRowClick(data: any) {
    console.log(data);
    this.showSlider = true;
    this.paymentId = data.PaymentId;
    this.paymentTransactionId = data.Id;
  }

  public displayCurrency(currencyId) {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
  }
}
