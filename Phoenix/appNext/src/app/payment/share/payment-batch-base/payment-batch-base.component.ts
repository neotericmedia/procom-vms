import { WorkflowAction } from './../../../common/model/workflow-action';
import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, NavigationService, CodeValueService, CommonService, ApiService, WorkflowService, PhxConstants, PhxLocalizationService, LoadingSpinnerService } from '../../../common';
import { PaymentService } from '../../payment.service';
import { PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableColumn, NavigationBarItem, CodeValue } from '../../../common/model';
import { PhxNavigationBarComponent } from '../../../common/components/phx-navigation-bar/phx-navigation-bar.component';
declare var oreq: any;

export abstract class PaymentBatchBaseComponent implements OnInit, OnDestroy {
  unregisterList: any[] = [];
  transactions: any[];
  payments: any[];
  isAlive: boolean = true;
  oreq: any = oreq;
  protected currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  batchId: number;
  currencyId: number;
  currencyCode: string;
  entityTypeId: number;
  validationMessages: any;
  workflowGenerateFileButtonText: string = '';
  dataTableConfigurationPayment: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>{
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true,
    enableExport: true,
    pageSize: 10000
  });
  detailDataTableConfigurationPayment: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    stateSavingMode: PhxDataTableStateSavingMode.None,
    enableExport: false,
    showSearch: false,
    showFilter: false,
    showGrouping: false,
    showColumnChooser: false,
    showTotalCount: false,
    pageSize: 10000
  });
  dataTableConfigurationTransaction: PhxDataTableConfiguration = new PhxDataTableConfiguration(<PhxDataTableConfiguration>{
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true,
    enableExport: true,
    pageSize: 10000
  });
  private navBarComponent: PhxNavigationBarComponent;
  public getInternalOrgLookupCallback: Function;

  @ViewChild('navBar')
  set content(content: PhxNavigationBarComponent) {
    this.navBarComponent = content;
  }
  abstract get dataGridComponentNamePayment();
  abstract get dataGridComponentNameTransaction();
  columnsPayment: Array<PhxDataTableColumn>;
  detailColumnsPayment: Array<PhxDataTableColumn>;
  columnsTransaction: Array<PhxDataTableColumn>;
  detailColumnsTransaction: Array<PhxDataTableColumn>;
  dataSourceUrlPayment: string;
  dataSourceUrlTransaction: string;
  oDataParamsPayment: string = '';
  oDataParamsTransaction: string = '';
  model: any = {};
  pageTitle: string;
  formatDate: string;
  protected abstract getPaymentBatch(onSuccess: (data: any) => void): void;
  protected abstract discardPaymentBatch(onSuccess: (data: any) => void): void;
  // protected abstract recallPaymentBatch(onSuccess: (data: any) => void): void;
  protected abstract finalizePaymentBatch(onSuccess: (data: any) => void, onError: (err: any) => void): void;
  protected abstract removeAffectedItems(onSuccess: (data: any) => void, onError: (err: any) => void): void;
  protected onPaymentDataReceived(data: any): void {}
  protected abstract onError_Batch_Finalize(data: any): void;
  // merge fix
  // protected abstract onError_Batch_Deleted(data: any): void;
  protected abstract onSuccess_Batch_Finalize(data: any): void;
  abstract get getComponentName();
  colDefsPayment = {
    id: new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: this.localizationService.translate('common.generic.id'),
      dataType: 'number'
    }),
    paymentNumber: new PhxDataTableColumn({
      dataField: 'PaymentNumber',
      caption: this.localizationService.translate('payment.search.paymentNumberColumnHeader'),
      dataType: 'string'
    }),
    paymentPayeeName: new PhxDataTableColumn({
      dataField: 'PaymentPayeeName',
      caption: this.localizationService.translate('payment.search.payeeNameColumnHeader'),
      dataType: 'string'
    }),
    groupedWorkerName: new PhxDataTableColumn({
      dataField: 'GroupedWorkerName',
      caption: this.localizationService.translate('payment.search.workerNameColumnHeader'),
      dataType: 'string'
    }),
    status: new PhxDataTableColumn({
      dataField: 'PaymentStatusId',
      caption: this.localizationService.translate('common.generic.status'),
      alignment: 'left',
      lookup: {
        dataSource: this.codeValueService.getCodeValues('payment.CodePaymentStatus', true),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    amount: new PhxDataTableColumn({
      dataField: 'Amount',
      caption: this.localizationService.translate('payment.common.paymentAmount'),
      dataType: 'money'
    }),
    action: new PhxDataTableColumn({
      dataField: 'Action',
      caption: '',
      width: 60,
      cellTemplate: 'viewPaymentActionTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowResizing: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  };
  colDefsPaymentTransaction = {
    trNumber: new PhxDataTableColumn({
      dataType: 'string',
      dataField: 'PaymentTransactionNumber',
      caption: 'Tr. Number'
    }),
    supplier: new PhxDataTableColumn({
      dataType: 'string',
      dataField: 'PaymentTransactionPayeeName',
      caption: 'Supplier'
    }),
    worker: new PhxDataTableColumn({
      dataType: 'string',
      dataField: 'WorkerName',
      caption: 'Worker'
    }),
    workSite: new PhxDataTableColumn({
      dataField: 'WorksiteId',
      caption: this.localizationService.translate('payment.transaction.worksiteColumnHeader'),
      hidingPriority: 3,
      lookup: {
        dataSource: this.codeValueService.getCodeValues('workorder.CodeWorksite', true), // this.getWorksiteLookup(),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    workOrder: new PhxDataTableColumn({
      dataField: 'WorkOrderFullNumber',
      caption: 'Work Order ID',
      dataType: 'string',
      calculateSortValue: 'AssignmentId'
    }),
    startDate: new PhxDataTableColumn({
      dataField: 'StartDate',
      caption: 'Start Date',
      dataType: 'date'
    }),
    endDate: new PhxDataTableColumn({
      dataField: 'EndDate',
      caption: 'End Date',
      dataType: 'date'
    }),
    plannedReleaseDate: new PhxDataTableColumn({
      dataField: 'PlannedReleaseDate',
      caption: 'Planned Release Date',
      dataType: 'date'
    }),
    amount: new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'Amount',
      caption: 'Amount',
      cellTemplate: 'currencyTemplate'
    }),
    branch: new PhxDataTableColumn({
      dataField: 'Branch',
      caption: 'Branch',
      lookup: {
        dataSource: this.codeValueService.getCodeValues('workorder.CodeInternalOrganizationDefinition1', true),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    jobOwner: new PhxDataTableColumn({
      dataField: 'JobOwner',
      caption: 'Job Owner',
      dataType: 'string'
    }),
    client: new PhxDataTableColumn({
      dataField: 'Client',
      caption: 'Client',
      dataType: 'string'
    }),
    action: new PhxDataTableColumn({
      dataField: 'Action',
      caption: '',
      width: 60,
      cellTemplate: 'viewPaymentDetailActionTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowResizing: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  };
  colDefsPaymentTransactionLines = {
    rateType: new PhxDataTableColumn({
      dataField: 'RateTypeId',
      caption: 'Rate Type',
      lookup: {
        dataSource: this.getRateTypeLoopkup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
      width: '150'
    }),
    rate: new PhxDataTableColumn({
      dataField: 'Rate',
      caption: 'Rate',
      dataType: 'decimal',
      format: { type: 'fixedPoint', precision: 2 },
      width: '150'
    }),
    units: new PhxDataTableColumn({
      dataField: 'Units',
      caption: 'Units',
      dataType: 'decimal',
      format: { type: 'fixedPoint', precision: 2 },
      width: '150'
    }),
    unitType: new PhxDataTableColumn({
      dataField: 'RateUnitId',
      caption: 'Unit Type',
      lookup: {
        dataSource: this.getUnitTypeLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
      width: '150'
    })
  };

  tabList: NavigationBarItem[] = [
    {
      Id: 1,
      Name: 'details',
      Path: './',
      DisplayText: this.localizationService.translate('common.generic.details'),
      Icon: '',
      IsDefault: true
    },
    {
      Id: 2,
      Name: 'history',
      Path: './',
      DisplayText: this.localizationService.translate('common.generic.history'),
      Icon: '',
      IsDefault: false,
      SubMenu: []
    }
  ];

  changeHistoryBlackList: any[] = [
    { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
    { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
    { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
    { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
    { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
    { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
    { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
    { TableSchemaName: 'payment', TableName: 'PaymentTransactionPayment', ColumnName: 'PaymentId' },
    { TableSchemaName: 'payment', TableName: 'PaymentTransactionPayment', ColumnName: 'PaymentTransactionId' }
  ];
  notifyName: any;
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialogService: DialogService,
    protected localizationService: PhxLocalizationService,
    protected navigationService: NavigationService,
    protected codeValueService: CodeValueService,
    protected commonService: CommonService,
    protected apiService: ApiService,
    protected paymentService: PaymentService,
    protected workflowService: WorkflowService,
    protected paymentType: PhxConstants.PaymentMethodType,
    protected loadingSpinnerService: LoadingSpinnerService
  ) {
    this.entityTypeId = PhxConstants.EntityType.PaymentReleaseBatch;
  }

  ngOnInit() {
    this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy;
    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe(params => {
        this.batchId = +params['batchId'];
        this.currencyId = +params['currencyId'];
        this.currencyCode = this.codeValueService.getCodeValues('geo.CodeCurrency', true).find(c => {
          return c.id === this.currencyId;
        }).code;
        this.loadPaymentBatch();
        this.dataSourceUrlPayment = 'payment/getPaymentJoinedToTask/' + this.batchId;
        this.dataSourceUrlTransaction = 'payment/getTransactionJoinedToTask/' + this.batchId;
      });
    this.notifyName = {
      NotifyName_BatchFinalize_OnError: this.getComponentName + 'NotifyName_BatchFinalize_OnError',
      NotifyName_BatchFinalize_OnSuccess: this.getComponentName + 'NotifyName_BatchFinalize_OnSuccess',
      NotifyName_BatchFinalize_OnProcessing: this.getComponentName + 'NotifyName_BatchFinalize_OnProcessing',
      NotifyName_BatchRemoveAffectedPayments_OnError: this.getComponentName + 'NotifyName_BatchRemoveAffectedPayments_OnError',
      NotifyName_BatchRemoveAffectedPayments_OnSuccess: this.getComponentName + 'NotifyName_BatchRemoveAffectedPayments_OnSuccess',
      NotifyName_BatchRemoveAffectedPayments_OnProgress: this.getComponentName + 'NotifyName_PaymentReleaseBatchRemoveAffectPayment_OnProcessing',
      NotifyName_PaymentRemove_OnError: this.getComponentName + 'NotifyName_PaymentRemove_OnError',
      NotifyName_BatchDeleted_OnError: this.getComponentName + 'NotifyName_BatchDeleted_OnError',
      NotifyName_BatchCreationInProgress_OnError: this.getComponentName + 'NotifyName_BatchCreationInProgress_OnError'
    };
    this.registerEvent();
  }

  loadPaymentBatch() {
    this.getPaymentBatch((data: any) => {
      this.model = data;
      this.navBarComponent.activeTab = this.tabList[0];

      this.workflowService.getAvailableStateActions(PhxConstants.EntityType.PaymentReleaseBatch, this.batchId).then((response: Array<any>) => {
        this.model.AvailableStateActions = response;
      });
    });
  }

  onActionSelect(action) {
    console.log(action);
    if (action && action.IsWorkflow === false) {
    } else {
      switch (action.CommandName) {
        case 'Discard':
          this.discardBatchWithConfirmation(action);
          break;
        case 'Finalize':
          this.finalizeBatchWithConfirmation(action);
          break;
        case 'PaymentBatchDraftActionChangeDetails':
          break;
        default:
          break;
      }
    }
  }

  getRateTypeLoopkup() {
    return this.codeValueService
      .getCodeValues('workorder.CodeRateType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  getUnitTypeLookup() {
    return this.codeValueService
      .getCodeValues('workorder.CodeRateUnit', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  onRowPrepared(event: any) {
    if (event.rowType === 'data' && event.data[this.colDefsPayment.amount.dataField] < 0) {
      event.rowElement.classList.add('negativeRowClass');
    }
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [
        {
          text: this.localizationService.translate('payment.transaction.openTransactionNewTab'),
          onItemClick: () => {
            this.commonService.window.open(`#/next/transaction/${event.row.data.TransactionHeaderId}/summary`, '_blank');
          }
        }
      ];

      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: this.localizationService.translate('payment.transaction.openWorkOrderNewTab'),
          onItemClick: () => {
            this.commonService.window.open('#/next/workorder/' + event.row.data.AssignmentId + '/' + event.row.data.WorkOrderId + '/' + event.row.data.WorkOrderVersionId + '/core', '_blank');
          }
        });
      }
    }
  }

  protected discardBatchWithConfirmation(action: any) {
    const dlg = this.dialogService.confirm('Discard batch', 'Are you sure you want to discard batch?');
    dlg.then(
      btn => {
        this.discardPaymentBatch(data => {});
      },
      btn => {}
    );
  }

  protected finalizeBatchWithConfirmation(action: any, confirmation: boolean = true) {
    const fnFinalizePaymentBatch = () => {
      this.finalizePaymentBatch(
        data => {
          this.onSuccess_Batch_Finalize(data);
        },
        err => {
          this.validationMessages = err;
        }
      );
    };
    if (confirmation) {
      const dlg = this.dialogService.confirm('Finalize batch', 'Are you sure you want to finalize batch?');
      dlg.then(
        btn => {
          fnFinalizePaymentBatch();
        },
        btn => {}
      );
    } else {
      fnFinalizePaymentBatch();
    }
  }

  protected recallBatchWithConfirmation(action: any) {
    return new Promise((resolve, reject) => {
      const dlg = this.dialogService.confirm('Batch Payments Action', 'Are you sure you want to Recall batch?');
      dlg.then(
        btn => {
          this.paymentService.recallBatchPayment(this.batchId).then(
            responseSucces => {
              resolve(responseSucces);
            },
            responseError => {
              reject(responseError);
            }
          );
        },
        btn => {
          reject();
        }
      );
    });
  }

  protected transferBatchWithConfirmation(workflowAction: any) {
    return new Promise((resolve, reject) => {
      const dlg = this.dialogService.confirm('Batch Payments Action', 'Are you sure you want to Set To Transferred batch?');
      dlg.then(
        btn => {
          this.paymentService.transferBatch(this.batchId).then(
            responseSucces => {
              resolve(responseSucces);
            },
            responseError => {
              reject(responseError);
            }
          );
        },
        btn => {
          reject();
        }
      );
    });
  }

  protected removeAffectedItemsConfirmation(action: any, isFinalize: boolean = false) {
    const dlg = this.dialogService.confirm('Warning', 'All removed payments will be moved to the pending payment list. Continue?');
    dlg.then(
      btn => {
        this.removeAffectedItems(
          data => {
            if (isFinalize) {
              this.finalizeBatchWithConfirmation(action, false);
            }
          },
          err => {
            this.validationMessages = err;
          }
        );
      },
      btn => {}
    );
  }

  recallPaymentWithConfirmation = item => {
    return new Promise((resolve, reject) => {
      const record = item.data;
      console.log(item);
      const dlg = this.dialogService.confirm('Batch Payments Action', 'Are you sure you want to Recall this payment?');
      dlg.then(
        btn => {
          this.paymentService.recallPayment(record.Id).then(
            responseSucces => {
              resolve(responseSucces);
            },
            responseError => {
              reject(responseError);
            }
          );
        },
        btn => {
          reject();
        }
      );
    });
  };

  dataReceivedPayment(data: any[]) {
    this.payments = data;
    this.transactions = [].concat(...data.map(d => d.PaymentTransactions));
    this.onPaymentDataReceived(data);
  }

  isEnableFinalize() {
    return this.payments && this.payments.length > 0;
  }

  onTabSelected(event) {}

  registerEvent() {
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchFinalize_OnError, (event, data) => {
        this.onError_Batch_Finalize(data);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchCreationInProgress_OnError, (event, data) => {
        this.loadingSpinnerService.hide();
        this.commonService.logError(data.Message);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    // merge fix
    // this.apiService
    //   .onPrivate(this.notifyName.NotifyName_BatchDeleted_OnError, (event, data) => {
    //     this.onError_Batch_Deleted(data);
    //   })
    //   .then(unregister => {
    //     this.unregisterFunctionList.push(unregister);
    //   });

    this.apiService
      .onPrivate(this.notifyName.NotifyName_PaymentRemove_OnError, (event, data) => {
        this.commonService.logError(data.Message);
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchRemoveAffectedPayments_OnProgress, (event, data) => {
        if (data.CountFinishedWithSuccess !== data.CountTotal) {
          this.loadingSpinnerService.setProgressText(`${data.CountFinishedWithSuccess} of ${data.CountTotal} items removed.`);
        } else {
          this.loadingSpinnerService.setProgressText(`Saving Changes`);
        }
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchFinalize_OnProcessing, (event, data) => {
        if (data.CountFinishedWithSuccess !== data.CountTotal) {
          this.loadingSpinnerService.setProgressText(`${data.CountFinishedWithSuccess} of ${data.CountTotal} items processed.`);
        } else {
          this.loadingSpinnerService.setProgressText(`Saving Changes`);
        }
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchFinalize_OnSuccess, (event, data) => {
        this.onSuccess_Batch_Finalize(data);
        this.loadingSpinnerService.hide();
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
  }

  ngOnDestroy() {
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  getPaymentByTransactionNumber(transactionNumber: string) {
    for (let i = 0; i < this.payments.length; i++) {
      const transactions = this.payments[i].PaymentTransactions.filter(ptr => ptr.PaymentTransactionNumber === transactionNumber);
      if (transactions.length > 0) {
        return this.payments[i];
      }
    }
    return null;
  }
}
