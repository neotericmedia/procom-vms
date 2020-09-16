import { PhxConstants } from './../../../common/model/phx-constants';
import { PaymentService } from './../../payment.service';
import { CodeValueService } from './../../../common/services/code-value.service';
import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { NavigationService } from '../../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../../common/model/index';
import { DialogService, CommonService, ApiService, LoadingSpinnerService, WorkflowService } from '../../../common/index';
import { PhxLocalizationService } from '../../../common';
import * as _ from 'lodash';
import { PhxDataTableComponent } from '../../../common/components/phx-data-table/phx-data-table.component';
import { DialogResultType } from '../../../common/model/dialog-result-type';
import { CodeValue } from '../../../common/model/code-value';

declare var oreq: any;

export abstract class PaymentBatchDetailsBaseComponent implements OnInit, OnDestroy {
  protected currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  formatDate: string;
  organizationIdInternal: number;
  batchId: number;
  currencyId: number;
  currencyCode: string;
  dataSourceUrl: string;
  oDataParams: string = '';
  oreq: any = oreq;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>{
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true
  });
  detailDataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    showSearch: false,
    showFilter: false,
    showGrouping: false,
    showColumnChooser: false,
    showTotalCount: false
  });
  items: any[];
  columns: Array<PhxDataTableColumn>;
  detailColumns: Array<PhxDataTableColumn>;
  validationMessages: any;
  componentName: string = 'PaymentBatchDetails';

  pageTitle: string;
  isAlive: boolean = true;
  model: any = {};
  // Common columns
  colDefs = {
    id: new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      fixed: true,
      dataType: 'number'
    }),
    paymentNumber: new PhxDataTableColumn({
      dataField: 'PaymentNumber',
      caption: 'Payment Number',
      dataType: 'string'
    }),
    paymentPayeeName: new PhxDataTableColumn({
      dataField: 'PaymentPayeeName',
      caption: 'Payee',
      dataType: 'string'
    }),
    groupedWorkerName: new PhxDataTableColumn({
      dataField: 'GroupedWorkerName',
      caption: 'Worker',
      dataType: 'string'
    }),
    status: new PhxDataTableColumn({
      dataField: 'PaymentStatusId',
      caption: 'Status',
      alignment: 'left',
      lookup: {
        dataSource: this.getPaymentStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    amount: new PhxDataTableColumn({
      dataField: 'Amount',
      caption: 'Payment Amount',
      dataType: 'currency',
      cellTemplate: ''
    }),
    action: new PhxDataTableColumn({
      dataField: 'Id',
      caption: 'Action',
      cellTemplate: 'ActionTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  };
  protected abstract getPaymentBatch(onSuccess: (data: any) => void): void;
  protected abstract getGenerateFileActionName(): void;
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialogService: DialogService,
    protected navigationService: NavigationService,
    protected codeValueService: CodeValueService,
    protected commonService: CommonService,
    protected apiService: ApiService,
    protected paymentService: PaymentService,
    protected workflowService: WorkflowService,
    protected paymentType: PhxConstants.PaymentMethodType,
    protected localizationService: PhxLocalizationService,
    protected loadingSpinnerService: LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.navigationService.setTitle(this.pageTitle);
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe(params => {
        this.organizationIdInternal = +params['organizationIdInternal'];
        this.batchId = +params['batchId'];
        this.currencyId = +params['currencyId'];
        this.currencyCode = this.codeValueService.getCodeValues('geo.CodeCurrency', true).find(c => {
          return c.id === this.currencyId;
        }).code;
        this.getPaymentBatch((data: any) => {
          this.model = data;
          if (
            this.model &&
            this.model.WorkflowAvailableActions &&
            (this.model.BatchStatusId === this.commonService.ApplicationConstants.PaymentReleaseBatchStatus.Finalized || this.model.BatchStatusId === this.commonService.ApplicationConstants.PaymentReleaseBatchStatus.Transferred)
          ) {
            this.model.WorkflowAvailableActions.push({
              Id: -1,
              Name: this.getGenerateFileActionName(),
              IsWorkflow: false
            });
          }
        });
        this.dataSourceUrl = 'payment/getPaymentJoinedToTask/' + this.batchId;
      });
    this.detailColumns = [
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'PaymentTransactionNumber',
        caption: 'Tr. Number'
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'PaymentTransactionPayeeName',
        caption: 'Supplier'
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'WorkerName',
        caption: 'Worker'
      }),
      new PhxDataTableColumn({
        dataType: 'string',
        dataField: 'WorksiteId',
        caption: 'Work Site'
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: 'Start - End Date',
        dataType: 'string',
        calculateDisplayValue: e => {
          return e.StartDate + '-' + e.EndDate;
        }
      }),
      new PhxDataTableColumn({
        dataType: 'number',
        dataField: 'Amount',
        caption: 'Amount',
        cellTemplate: 'currencyTemplate'
      })
    ];
  }

  getPaymentStatusLookup() {
    return this.codeValueService
      .getCodeValues('payment.CodePaymentStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  dataReceived(data: any[]) {
    this.items = data;
  }

  executeAction(action, entityTypeId, entityId) {
    this.loadingSpinnerService.show();
    this.workflowService
      .executeAction(action, entityTypeId, entityId)
      .then(responseSuccess => {
        this.loadingSpinnerService.hide();
      })
      .catch(ex => {
        console.error(ex);
        this.loadingSpinnerService.hide();
      });

    this.workflowService.setWatchConfigOnWorkflowEvent('/next/', entityTypeId, entityTypeId, entityId).then(() => {
      const currentUrl = this.router.url;
      this.router.navigate(['search'], { relativeTo: this.route.parent }).then(() => {
        window.setTimeout(() => {
          this.router.navigateByUrl(currentUrl);
        }, 0);
      });
    });
  }

  onActionSelect(action) {
    console.log(action);
    if (action && action.IsWorkflow === false) {
      window.location.assign(this.paymentService.getPaymentAdpStream(this.batchId));
    } else {
      const dlg = this.dialogService.confirm('Batch Payments Action', 'Are you sure you want to ' + action.Name + ' these payments?');
      dlg.then(
        btn => {
          this.executeAction(action, this.commonService.ApplicationConstants.EntityType.PaymentReleaseBatch, this.batchId);
        },
        function(btn) {}
      );
    }
  }

  recallPayment = item => {
    if (item && item.data) {
      const record = item.data;
      console.log(item);
      this.dialogService.confirm('Payment Action', 'Are you sure you want to Recall this payment?').then(button => {
        if (button === DialogResultType.Yes) {
          this.paymentService.recallPayment(record.Id);
        }
      });
    }
  };

  ngOnDestroy() {
    this.isAlive = false;
  }
}
