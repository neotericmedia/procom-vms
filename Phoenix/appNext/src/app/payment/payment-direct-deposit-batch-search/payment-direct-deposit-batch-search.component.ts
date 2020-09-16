import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from './../../common/services/navigation.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { CommonService, CodeValueService, PhxConstants } from '../../common/index';
import { CodeValue } from '../../common/model/index';
import * as _ from 'lodash';
import { EdmLiteral } from 'devextreme/data/odata/utils';
import { Subscription } from 'rxjs/Subscription';
import { WindowRefService } from '../../common/index';
declare var oreq: any;
@Component({
  selector: 'payment-direct-deposit-batch-search',
  templateUrl: './payment-direct-deposit-batch-search.component.html',
  styleUrls: ['./payment-direct-deposit-batch-search.component.less']
})
export class PaymentDirectDepositBatchSearchComponent implements OnInit, OnDestroy {
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  paramSubscription: Subscription;
  pageTitle: string = 'Branch List';
  dataSourceUrl: string;
  bankAccountId: number = 0;
  currencyId: number = 0;
  oDataParams: string = '';
  dataGridComponentName: string = 'PaymentDirectDepositBatchSearch';
  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'ID',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];
  columns: Array<PhxDataTableColumn>;
  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    protected commonService: CommonService,
    private navigationService: NavigationService,
    private winRef: WindowRefService,
    private codeValueService: CodeValueService,
  ) {
    this.paramSubscription = this.route.params.subscribe(params => {
      this.bankAccountId = +params['bankAccountId'];
      this.currencyId = +params['currencyId'];
    });
  }

  ngOnInit() {
    this.dataSourceUrl = 'payment/getPaymentDirectDepositBatchesByBankAccountAndBatchStatus/bankAccount/' + this.bankAccountId;
    this.columns = this.buildColumns();
    this.oDataParams = oreq.request()
      .withSelect(['Id', 'BatchNumber', 'DepositDate', 'Amount', 'CurrencyId', 'BatchStatusId', 'InternalOrganizationBankAccountBankName', 'InternalOrganizationLegalName'])
      .withFilter(oreq.filter('BatchStatusId').ne(PhxConstants.PaymentReleaseBatchStatus.Deleted))
      .url();
  }

  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: 'ID',
        dataType: 'number',
      }),
      new PhxDataTableColumn({
        dataField: 'BatchNumber',
        caption: 'Batch Number',
        dataType: 'number',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'DepositDate',
        caption: 'Deposit Date',
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'Amount',
        caption: 'Amount',
        dataType: 'decimal',
        cellTemplate: 'viewFormattedTotalAmount',
        alignment: 'right'
      }),
      new PhxDataTableColumn({
        dataField: 'BatchStatusId',
        caption: 'Batch Status',
        lookup: {
          dataSource: this.getBatchStatusLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      })
    ];
  }

  getBatchStatusLookup() {
    return this.codeValueService.getCodeValues('payment.CodePaymentReleaseBatchStatus', true)
      .filter((x) => x.id !== PhxConstants.PaymentReleaseBatchStatus.Deleted)
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
          this.viewDirectDepositBatchDetails(event.currentSelectedRowKeys[0]);
        }
      }
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewDirectDepositBatchDetails(item: any) {
    this.router.navigate([`/next/payment/directdepositbatch/${this.bankAccountId}/${this.currencyId}/details/${item.Id}`]);
  }

  dataReceived(data) {
    if (data.length > 0) {
      this.navigationService.setTitle('payments-managedd', [data[0].InternalOrganizationLegalName, data[0].InternalOrganizationBankAccountBankName]);
    }
  }

  onContextMenuOpenTab(event) {
    this.winRef.openUrl(`#/payment/directdepositbatch/management/${event.Id}`, '_blank');
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
