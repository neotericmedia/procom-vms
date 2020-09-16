import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService, DialogService, LoadingSpinnerService, ApiService } from '../../common';
import { InvoiceService } from '../shared/invoice.service';
import { PhxDataTableConfiguration, PhxDataTableSelectionMode, PhxDataTableShowCheckboxesMode, PhxDataTableSelectallMode, DialogResultType, StateAction, StateActionButtonStyle, PhxConstants } from '../../common/model';
import { InvoiceListTableComponent } from '../invoice-list-table/invoice-list-table.component';

@Component({
  selector: 'app-invoice-clearing-list',
  templateUrl: './invoice-clearing-list.component.html',
  styleUrls: ['./invoice-clearing-list.component.less']
})
export class InvoiceClearingListComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: InvoiceListTableComponent;
  isAlive: boolean = true;
  batchActions: any;
  componentName: string = '';

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Multiple,
    showCheckBoxesMode: PhxDataTableShowCheckboxesMode.Always,
    selectAllMode: PhxDataTableSelectallMode.AllPages
  });

  organizationIdInternal: number;
  billingInvoicePresentationStyleId: number;
  dataSourceUrl: string = '';
  validationMessages: any;
  selectedRowKeys: any[] = [];
  unregisterList: any[] = [];

  notifyName: any = {
    NotifyName_BatchOperation_OnBatchMarkered: 'InvoiceClearingList' + 'NotifyName_BatchOperation_OnBatchMarkered',
    NotifyName_BatchOperation_OnPreExecutionException: 'InvoiceClearingList' + 'NotifyName_BatchOperation_OnPreExecutionException',
    NotifyName_BatchOperation_OnReleased: 'InvoiceClearingList' + 'NotifyName_BatchOperation_OnReleased'
  };

  stateActions: StateAction[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private apiService: ApiService,
    private invoiceService: InvoiceService,
    private dialogService: DialogService,
    private loadingSpinnerService: LoadingSpinnerService
  ) {}

  ngOnInit() {
    /*
    this.setupPrivateEvents();
*/
    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe(parentParams => {
        this.organizationIdInternal = +parentParams['organizationIdInternal'];

        this.activatedRoute.url
          .takeWhile(() => this.isAlive === true)
          .subscribe(segments => {
            this.billingInvoicePresentationStyleId = parseInt(segments[1].path, 10);
            this.componentName = `InvoiceClearingListComponent${segments[1].path}`;

            this.dataSourceUrl = `invoice/pendingRelease/internalorganization/${this.organizationIdInternal}/billinginvoicepresentationstyle/${this.billingInvoicePresentationStyleId}`;
          });
      });
    /*
    this.batchActions = {
      Release: {
        Name: 'Release',
        SuccessMessage: 'Released successfully.',
        BatchPreExecutionCommandName: 'BatchPreExecutionOnTransactionBillingInvoiceRelease',
        BatchThreadExecutionCommandName: 'InvoiceOneToOneUserActionBatchThreadExecutionRelease',
        TaskResultId: this.commonService.ApplicationConstants.TaskResult.TransactionBillingInvoiceActionRelease
      },
      SuppressRelease: {
        Name: 'Suppress Release',
        SuccessMessage: 'Suppressed successfully.',
        BatchPreExecutionCommandName: 'BatchPreExecutionOnTransactionBillingInvoiceSuppressRelease',
        BatchThreadExecutionCommandName: 'InvoiceOneToOneUserActionBatchThreadExecutionSupressRelease',
        TaskResultId: this.commonService.ApplicationConstants.TaskResult.TransactionBillingInvoiceActionSuppressRelease
      }
    };
*/
    this._initStateActions();
  }

  ngOnDestroy() {
    this.isAlive = false;
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }
  /*
  setupPrivateEvents() {
    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnException, (event, data) => {
      this.refreshPageOnPrivateEvent(data, true, 'Exception');
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnBatchMarkered, (event, data) => {
      this.refreshPageOnPrivateEvent(data, true, null);
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnPreExecutionException, (event, data) => {
      this.refreshPageOnPrivateEvent(data, true, 'On batch pre-validation:');
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnPreExecuted, (event, data) => {
      this.refreshPageOnPrivateEvent(data, false, null);
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });

    this.apiService.onPrivate(this.notifyName.NotifyName_BatchOperation_OnReleased, (event, data) => {
      this.refreshPageOnPrivateEvent(data, false, data.CountAll !== data.CountExecutionSuccess ? 'Some items cannot be processed:' : null);
    }).then((unregister) => {
      this.unregisterList.push(unregister);
    });
  }
*/
  onSelectionChanged(event) {
    this.selectedRowKeys = event.selectedRowKeys;
  }
  /*
  executeBatchCommand(action) {
    this.dialogService.confirm(action.Name, `Are you sure you want to ${action.Name.toLowerCase()}?`)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.validationMessages = null;
          this.loadingSpinnerService.show();
          const taskIdsToBatch: number[] = this.selectedRowKeys.map(row => row.WorkflowPendingTaskId);
          if (taskIdsToBatch.length > 0) {
            this.workflowService.workflowBatchOperationOnTasksSelected({
              TaskIdsToBatch: taskIdsToBatch,
              TaskResultId: action.TaskResultId,
              NotifyName_BatchOperation_OnBatchMarkered: this.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
              NotifyName_BatchOperation_OnPreExecutionException: this.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
              NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
              CommandBatchPreExecutionJsonBody: { CommandName: action.BatchPreExecutionCommandName, WorkflowPendingTaskId: -1 },
              CommandBatchThreadExecutionJsonBody: { CommandName: action.BatchThreadExecutionCommandName }
            })
              .then((res) => {
                this.grid.clearSelection();
                this.loadingSpinnerService.hide();
                this.commonService.logSuccess(action.SuccessMessage);
              })
              .catch((err) => {
                this.loadingSpinnerService.hideAll();
                this.showError(`Error executing ${action.Name.toLowerCase()}`, err);
              });
          } else {
            this.commonService.logError(`Select invoice(s) to ${action.Name.toLowerCase()}`);
          }
        }
      });
  }

  private refreshPageOnPrivateEvent(data, toCallServer, message) {
    const newLine: string = '<br/>';
    if (message !== null && data.CountAll != null && data.CountExecutionSuccess != null) {
      if (data.CountExecutionSuccess > 0) {
        message = message + newLine + data.CountExecutionSuccess + ' of ' + data.CountAll + ' items processed';
      }
      if (data.CountAll - data.CountExecutionSuccess > 0) {
        message = message + newLine + (data.CountAll - data.CountExecutionSuccess) + ' of ' + data.CountAll + ' items not processed';
      }

      if (data.CountAll === data.CountExecutionSuccess) {
        this.commonService.logSuccess(message);
      } else {
        this.commonService.logError(message);
      }
    }

    if (data.ValidationMessages != null && data.ValidationMessages.length) {
      this.validationMessages = data;
    }
    this.grid.refresh();
    this.invoiceService.updateInvoiceClearingCounts(this.organizationIdInternal);
  }
*/
  // workaround for a known bug
  isSelectionReset = false;
  onContentReady(event) {
    if (this.isSelectionReset === false) {
      this.isSelectionReset = true;
      this.grid.clearSelection();
    }
  }
  // end-workaround for a known bug

  showError(message: string, error: any) {
    console.error(message, error);
    this.commonService.logError(message);
  }

  _initStateActions() {
    const self = this;
    self.stateActions = [
      {
        // batch release
        actionId: PhxConstants.StateAction.InvoiceRelease,
        skipSecurityCheck: true,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: function(action, componentOption) {
          return self.selectedRowKeys.length === 0;
        },
        onClick: function(action, componentOption, actionOption) {
          const selectedRowIds: number[] = self.selectedRowKeys.map(row => row.Id);
          if (selectedRowIds.length > 0) {
            const payload = {
              EntityIds: selectedRowIds
            };
            self._showConfirmDialog(action, payload);
          }
        }
      },
      {
        // batch suppress release
        actionId: PhxConstants.StateAction.InvoiceSuppress,
        skipSecurityCheck: true,
        disabledFn: function(action, componentOption) {
          return self.selectedRowKeys.length === 0;
        },
        onClick: function(action, componentOption, actionOption) {
          const selectedRowIds: number[] = self.selectedRowKeys.map(row => row.Id);
          if (selectedRowIds.length > 0) {
            const payload = {
              EntityIds: selectedRowIds
            };
            self._showConfirmDialog(action, payload);
          }
        }
      }
    ];
  }

  _showConfirmDialog(action: StateAction, payload: any) {
    const self = this;
    self.dialogService.confirm(action.displayText, `Are you sure you want to ${action.displayText.toLowerCase()}?`).then(function(button) {
      if (button === DialogResultType.Yes) {
        self._executeStateCommand(action.commandName, payload);
      }
    });
  }

  _executeStateCommand(commandName: string, payload: any) {
    const self = this;
    self.validationMessages = null;
    self.loadingSpinnerService.show();
    self.invoiceService
      .executeStateCommand(commandName, payload)
      .then(function() {
        self.grid.refresh();
        self.invoiceService.updateInvoiceClearingCounts(self.organizationIdInternal);
        self.loadingSpinnerService.hide();
      })
      .catch(function(err) {
        self.validationMessages = err;
        self.loadingSpinnerService.hideAll();
      });
  }
}
