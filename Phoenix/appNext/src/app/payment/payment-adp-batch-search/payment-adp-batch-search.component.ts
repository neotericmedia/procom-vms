import { Router } from '@angular/router/';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-payment-adp-batch-search',
  templateUrl: './payment-adp-batch-search.component.html',
  styleUrls: ['./payment-adp-batch-search.component.less']
})
export class PaymentAdpBatchSearchComponent implements OnInit, OnDestroy {
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });

  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  paramSubscription: Subscription;
  dataSourceUrl: string;
  currencyId: number = 0;
  organizationIdInternal: number = 0;
  oDataParams: string = '';
  dataGridComponentName: string = 'PaymentAdpBatchSearch';
  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'ID',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];
  columns: Array<PhxDataTableColumn>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
  ) {
    this.paramSubscription = this.route.params.subscribe(params => {
      this.currencyId = +params['currencyId'];
      this.organizationIdInternal = +params['organizationIdInternal'];
    });
  }

  ngOnInit() {
    this.dataSourceUrl = 'payment/getPaymentAdpBatchesByCurrencyId/' + this.currencyId;
    this.columns = this.buildColumns();
    const filter = oreq.filter('OrganizationIdInternal').eq(this.organizationIdInternal);
    this.oDataParams = oreq.request().withSelect([
      'Id', 'DepositDate', 'Amount', 'CurrencyId', 'BatchStatusId', 'InternalOrganizationLegalName'
    ])
      .withFilter(filter)
      .url();
    const currencyCode = this.codeValueService.getCodeValues('geo.CodeCurrency', true).find((c) => { return c.id === this.currencyId; }).code;
    this.navigationService.setTitle('payments-manageadp', [currencyCode]);
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
        if (event.currentSelectedRowKeys[0].BatchStatusId === PhxConstants.PaymentReleaseBatchStatus.CreationInProgress) {
          // prevent click event
          this.commonService.logWarning('Creation in progress. Please wait.');
        } else if (event.currentSelectedRowKeys[0].BatchStatusId === this.commonService.ApplicationConstants.PaymentReleaseBatchStatus.DeletionInProgress) {
          // prevent click event
          this.commonService.logWarning('Deletion in progress. Please wait.');
        } else {
          this.viewAdpBatchDetails(event.currentSelectedRowKeys[0]);
        }
      }
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewAdpBatchDetails(item: any) {
      this.router.navigate(['/next', 'payment', 'adpbatch', this.organizationIdInternal, this.currencyId, 'details', item.Id]);
  }

  dataReceived(data) {
    if (data.length > 0) {
      const currencyCode = this.codeValueService.getCodeValues('geo.CodeCurrency', true).find((c) => { return c.id === this.currencyId; }).code;
      this.navigationService.setTitle('payments-manageadp', [data[0].InternalOrganizationLegalName, currencyCode]);
    }
  }

  onContextMenuOpenTab(event) {
    this.winRef.nativeWindow.open(`#/next/payment/adp/${this.organizationIdInternal}/${this.currencyId}/details/${event.Id}`, '_blank');
}

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
  }
}
