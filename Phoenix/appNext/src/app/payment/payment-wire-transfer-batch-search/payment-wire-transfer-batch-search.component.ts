import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import * as _ from 'lodash';

import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';

import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxConstants } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { PaymentService } from './../payment.service';
import { WindowRefService } from '../../common/index';

declare var oreq: any;

@Component({
  selector: 'app-payment-wire-transfer-batch-search',
  templateUrl: './payment-wire-transfer-batch-search.component.html',
  styleUrls: ['./payment-wire-transfer-batch-search.component.less']
})
export class PaymentWireTransferBatchSearchComponent implements OnInit {
  pageTitle: string;
  dataSourceUrl: string;
  dataGridComponentName: string = 'PaymentWireTransferBatchSearch';

  oDataParams = oreq.request().withSelect([
    'Id',
    'BatchNumber',
    'DepositDate',
    'Amount',
    'CurrencyId',
    'BatchStatusId',
    'InternalOrganizationLegalName'
  ]);

  columns: Array<PhxDataTableColumn>;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  paramSubscription: Subscription;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'Id',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];

  bankAccountId: number = 0;
  bankName: string;
  currencyId: number;

  constructor(
    public commonService: CommonService,
    private navigationService: NavigationService,
    protected router: Router,
    private route: ActivatedRoute,
    private codeValueService: CodeValueService,
    private paymentService: PaymentService,
    private winRef: WindowRefService,
  ) {
    this.paramSubscription = this.route.params.subscribe(params => {
      this.bankAccountId = +params['bankAccountId'];
    });
  }

  ngOnInit() {
    this.route.params.subscribe(
      (values: { bankAccountId: number, currencyId: number, }) => {
        this.bankAccountId = +values.bankAccountId;
        this.currencyId = +values.currencyId;
      });

    const result = this.paymentService.getOriginalOrganizationBankAccount(this.bankAccountId).subscribe(
      data => {
        this.bankName = data.Items[0].OrganizationInternalRoles[0].BankAccounts.filter((item) => {
          return item.Id === this.bankAccountId;
        })[0].BankName;

        this.pageTitle = this.bankName + ' ' + '- Wire Transfer Batches';
      }
    );

    this.columns = this.buildColumns();
    this.dataSourceUrl = 'payment/getPaymentWireTransferBatchesByBankAccountAndBatchStatus/bankAccount/' + this.bankAccountId;
  }

  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: 'ID',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'BatchNumber',
        caption: 'Batch Number',
        alignment: 'right',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'DepositDate',
        caption: 'Deposit Date',
        dataType: 'date',
        cellTemplate: 'dateCellTemplate',
      }),
      new PhxDataTableColumn({
        dataField: 'Amount',
        caption: 'Amount',
        dataType: 'decimal',
        alignment: 'right',
        cellTemplate: 'currencyCellTemplate',
      }),
      new PhxDataTableColumn({
        dataField: 'BatchStatusId',
        caption: 'Batch Status',
        alignment: 'left',
        lookup: {
          dataSource: this.getCodeValue('payment.CodePaymentReleaseBatchStatus'),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      })
    ];
  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      if (event.currentSelectedRowKeys[0]) {
        if (event.currentSelectedRowKeys[0].BatchStatusId === this.commonService.ApplicationConstants.PaymentReleaseBatchStatus.CreationInProgress) {
          // prevent click event
          this.commonService.logWarning('Creation in progress. Please wait.');
        } else if (event.currentSelectedRowKeys[0].BatchStatusId === this.commonService.ApplicationConstants.PaymentReleaseBatchStatus.DeletionInProgress) {
          // prevent click event
          this.commonService.logWarning('Deletion in progress. Please wait.');
        } else {
          this.viewWireTransferBatchDetails(event.currentSelectedRowKeys[0]);
        }
      }
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  dataReceived(data) {
    if (data.length > 0) {
      this.navigationService.setTitle('payments-managewire', [data[0].InternalOrganizationLegalName, this.bankName]);
    }
  }

  viewWireTransferBatchDetails(item: any) {
    this.router.navigate(['/next', 'payment', 'wiretransferbatch', this.bankAccountId, this.currencyId, 'details', item.Id]);
  }

  public displayCurrencyCode(currencyId): string {
    return this.getCodeValue('geo.CodeCurrency').find(c => c.id === currencyId).code;
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

  onContextMenuOpenTab(event) {
    this.winRef.nativeWindow.open(`#/payment/wiretransferbatch/management/${event.Id}`, '_blank');
  }
}
