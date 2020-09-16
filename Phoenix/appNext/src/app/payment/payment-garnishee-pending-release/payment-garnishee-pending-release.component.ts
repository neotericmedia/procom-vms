import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import {
  PhxDataTableConfiguration,
  PhxDataTableColumn,
  PhxDataTableSummaryItem,
  PhxDataTableSummaryType,
  PhxDataTableSelectionMode,
  PhxDataTableSelectallMode,
  PhxDataTableShowCheckboxesMode,
  WorkflowAction
} from '../../common/model/index';

import { CodeValueService } from '../../common/services/code-value.service';
import { CommonService } from '../../common/index';
import { CodeValue } from '../../common/model/code-value';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { pxCurrencyPipe } from './../../common/pipes/pxCurrency.pipe';

declare var oreq: any;
@Component({
  selector: 'app-payment-garnishee-pending-release',
  templateUrl: './payment-garnishee-pending-release.component.html',
  styleUrls: ['./payment-garnishee-pending-release.component.less'],
  providers: [CurrencyPipe, DecimalPipe]
})
export class PaymentGarnisheePendingReleaseComponent implements OnInit {
  paramSubscription: Subscription;
  organizationIdInternal: number = 0;
  currencyId: number = 0;
  isReadyToRelease: number;

  // dto and odata
  odataParams = oreq.request().withSelect([
    'GarnisheeId',
    'PaymentTransactionGarnisheId',
    'InternalOrganizationLegalName',
    'GarnisheePayeeName',
    'GarnisheePayToName',
    'Amount',
    'PaymentTransactionNumber',
  ]).url();

  dataSourceUrl: string;
  componentName: string = 'PaymentGarnisheePendingReleaseComponent';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Multiple,
    showCheckBoxesMode: PhxDataTableShowCheckboxesMode.Always,
    pageSize: 100000,
  });
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  @ViewChild('grid') grid: PhxDataTableComponent;

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'GarnisheeId',
      width: 130,
      caption: 'Garnishee Id',
      dataType: 'number',
      sortIndex: 0,
      sortOrder: 'asc',
    }),
    new PhxDataTableColumn({
      dataField: 'GarnisheePayeeName',
      caption: 'Garnishee From',
      dataType: 'string',
    }),
    new PhxDataTableColumn({
      dataField: 'GarnisheePayToName',
      caption: 'Pay To',
      dataType: 'string',
    }),
    new PhxDataTableColumn({
      dataField: 'Amount',
      caption: 'Amount',
      dataType: 'decimal',
      alignment: 'right',
      cellTemplate: (cellElement: any, cellInfo: any) => {
        const currencyCode: string = this.codeValueService.getCodeValue(this.currencyId, this.commonService.CodeValueGroups.Currency).code;
        cellElement.html(`${this.pxCurrency.transform(cellInfo.value)} ${currencyCode}`);
      },
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTransactionNumber',
      caption: 'Transaction Number',
      dataType: 'string',
    }),
  ];
  constructor(
    private route: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private pxCurrency: pxCurrencyPipe,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
  ) {
    this.paramSubscription = this.route.params.subscribe(params => {
      this.organizationIdInternal = +params['organizationIdInternal'];
      this.currencyId = +params['currencyId'];
      this.isReadyToRelease = +params['isReadyToRelease'];
      this.dataSourceUrl = 'Payment/getPaymentTransactionGarnishees/internalorganization/' + this.organizationIdInternal + '/currency/' + this.currencyId + '/readytorelease/' + this.isReadyToRelease;
    });
  }

  ngOnInit() {
  }
}
