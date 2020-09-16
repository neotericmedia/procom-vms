import { CodeValueService } from './../../common/services/code-value.service';
import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { NavigationService } from '../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn } from '../../common/model/index';
import { DialogService, CommonService, ApiService, LoadingSpinnerService, PhxConstants, WorkflowService } from '../../common/index';
import * as _ from 'lodash';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { DialogResultType } from '../../common/model/dialog-result-type';
import { PaymentBatchDetailsBaseComponent } from '../share/payment-batch-details-base/payment-batch-details-base.component';
import { PaymentService } from '../payment.service';
import { PhxLocalizationService } from './../../common';

@Component({
  templateUrl: './../share/payment-batch-details-base/payment-batch-details-base.component.html',
  styleUrls: ['./../share/payment-batch-details-base/payment-batch-details-base.component.less']
})
export class PaymentAdpBatchDetailsComponent extends PaymentBatchDetailsBaseComponent implements OnInit, OnDestroy {

  constructor(
    route: ActivatedRoute,
    router: Router,
    dialogService: DialogService,
    navigationService: NavigationService,
    codeValueService: CodeValueService,
    commonService: CommonService,
    apiService: ApiService,
    protected paymentService: PaymentService,
    protected workflowService: WorkflowService,
    protected localizationService: PhxLocalizationService,
    protected loadingSpinnerService: LoadingSpinnerService
  ) {
    super(route, router, dialogService, navigationService, codeValueService, commonService, apiService, paymentService, workflowService, PhxConstants.PaymentMethodType.ADP, localizationService, loadingSpinnerService);
  }

  columns: Array<PhxDataTableColumn> = [
    this.colDefs.id,
    this.colDefs.paymentNumber,
    this.colDefs.paymentPayeeName,
    this.colDefs.groupedWorkerName,
    this.colDefs.status,
    this.colDefs.amount,
    this.colDefs.action,
  ];
  ngOnInit() {
    super.ngOnInit();
  }

  protected getGenerateFileActionName() {
    return this.localizationService.translate('payment.common.adpGenerateFile');
  }

  protected getPaymentBatch(onSuccess: (data: any) => void) {
    const oDataParams = this.oreq.request()
      .withExpand([
        'WorkflowAvailableActions'
      ])
      .withSelect([
        'Id',
        'BatchNumber',
        'DepositDate',
        'CreateDate',
        'Amount',
        'CurrencyId',
        'BatchStatusId',
        'InternalOrganizationLegalName',
      ])
      .url();

    const result = this.paymentService.getPaymentAdpBatch(this.batchId, oDataParams).subscribe(
      (data: any) => {
        this.navigationService.setTitle('payments-manageadp', [data.InternalOrganizationLegalName, this.currencyCode, this.batchId]);
        onSuccess(data);
      }
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}

