import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';
import { NavigationService, CommonService, ApiService, DialogService, LoadingSpinnerService, WindowRefService, PhxLocalizationService, CodeValueService } from '../../common/index';
import { NavigationBarItem, WorkflowAction, DialogResultType, StateAction, StateActionDisplayType, StateActionButtonStyle, DialogOptions } from '../../common/model/index';
import { PhxConstants, PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';
import { InvoiceService } from '../shared/invoice.service';
import { Invoice } from '../shared/index';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.less']
})
export class InvoiceComponent implements OnInit, OnDestroy {
  invoice: Invoice;
  id: number;
  workflowActions: Array<WorkflowAction> = [];
  validationMessages: {};
  InvoiceUserActionEdit = 'InvoiceUserActionEdit';

  isAlive: boolean = true;
  invoiceDeletedEventListener: any;
  forceEdit: boolean = false;
  saveWorkflowAction: WorkflowAction;
  stateActions: StateAction[];

  currentUrl: string;
  tabList: NavigationBarItem[];
  phoenixCommonModuleResourceKeys: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private winRef: WindowRefService,
    private navigationService: NavigationService,
    private invoiceService: InvoiceService,
    private commonService: CommonService,
    private apiService: ApiService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
    private loadingSpinnerService: LoadingSpinnerService,
    private codeValueService: CodeValueService
  ) {
    this.phoenixCommonModuleResourceKeys = PhoenixCommonModuleResourceKeys;
  }

  ngOnInit() {
    this.navigationService.setTitle('invoice-edit');
    this.currentUrl = this.router.url;

    this.tabList = [
      {
        Id: 1,
        Name: 'detail',
        Path: './detail',
        DisplayText: this.localizationService.translate(InvoiceModuleResourceKeys.detail.detailTab),
        Icon: '',
        IsDefault: true,
      }, {
        Id: 2,
        Name: 'transactions',
        Path: './transactions',
        DisplayText: this.localizationService.translate(InvoiceModuleResourceKeys.detail.transactionsTab),
        Icon: '',
        IsDefault: false,
      }, {
        Id: 3,
        Name: 'documents',
        Path: './documents',
        DisplayText: this.localizationService.translate(InvoiceModuleResourceKeys.detail.documentsTab),
        Icon: '',
        IsDefault: false,
      },
    ];

    this.invoiceService.isCurrentUserHasClientRelatedRoles()
      .takeWhile(() => this.isAlive)
      .subscribe((isCurrentUserHasClientRelatedRoles: boolean) => {
        if (isCurrentUserHasClientRelatedRoles === false) {
          this.tabList.push({
            Id: 4,
            Name: 'history',
            Path: './history',
            DisplayText: this.localizationService.translate(InvoiceModuleResourceKeys.detail.historyTab),
            Icon: '',
            IsDefault: false,
          });
        }
      });

    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(
        (val) => {
          if (val instanceof NavigationEnd) {
            this.currentUrl = val.url;
          }
        });

    this.route.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadInvoice(this.id);
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
    this.unsubscribeDeleteEventListener();
  }

  unsubscribeDeleteEventListener() {
    if (this.invoiceDeletedEventListener && typeof this.invoiceDeletedEventListener === 'function') {
      this.invoiceDeletedEventListener();
    }
  }

  loadInvoice(id: number, force: boolean = false) {
    this.invoiceService.getInvoice(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.invoice = data;
        if (this.invoice) {
/*
          this.workflowActions = this.invoice.WorkflowAvailableActions.filter(action => {
            if (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceConsolidatedUserActionBillingTransactionAdd
              || (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionRelease && this.invoice.InvoiceBillingTransactions.length === 0)
            ) {
              return false;
            }
            return true;
          });
          // if invoice status is pending client payment or is paid and workflowActions containns Save
          // add a dummy workflow actiion to workflowactions, dummyCommandName
          if (this.workflowActions.some(c => c.CommandName.includes('Save')
            && (this.invoice.StatusId === PhxConstants.InvoiceStatus.PendingClientPayment ||
              this.invoice.StatusId === PhxConstants.InvoiceStatus.Paid))) {
            this.workflowActions.push(
              {
                CommandName: this.InvoiceUserActionEdit,
                DisplayButtonOrder: 3,
                DisplayHistoryEventName: 'Edit Invoice',
                Id: 1,
                IsActionButton: false,
                Name: this.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.edit),
                WorkflowPendingTaskId: null,
                PendingCommandName: 'WorkflowExecuteUserTask',
                TaskResultId: 1,
                TaskRoutingDialogTypeId: 1
              }
            );
            this.saveWorkflowAction = this.workflowActions.find(w => w.CommandName ===
              PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionSave);
            this.workflowActions = this.workflowActions.filter(n => n.CommandName !==
              PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionSave);
          }
*/
          this.invoiceService.getInvoiceEditMode(this.id)
            .takeWhile(() => this.isAlive)
            .subscribe((editable) => {
              this.forceEdit = editable;
            });
/*
          this.initListener();
*/
          this.navigationService.setTitle('invoice-edit', [this.invoice.InvoiceNumber]);
          this._initStateActions();
        } else {
          this.workflowActions = [];
        }
      });
  }
/*
  clickWorkflowAction(action: WorkflowAction) {
    const confirmMessages: string[] = [];

    const queries: Promise<void>[] = [];

    if (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionMarkAsPaid) {
      queries.push(
        this.apiService.query<boolean>(`invoice/${this.id}/anyUnpaidBillingTransactions`)
          .then(anyUnpaidBillingTransactions => {
            if (anyUnpaidBillingTransactions) {
              confirmMessages.push(this.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmInvoiceMarkAsPaidUnpaidBillingTransactions));
            }
          })
      );
    }

    Promise.all(queries)
    .then(() => {
      let message: string = null;
      if (confirmMessages.length) {
        confirmMessages.push(this.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmContinueMessage));
        message = confirmMessages.join('<br><br>');
      }
      this.executeWorkflowAction(action, message);
    })
    .catch(error => console.log(error));
  }

  executeWorkflowAction(action: WorkflowAction, confirmMessage?: string) {

    let payload = {};
    if (action.CommandName === this.InvoiceUserActionEdit) {
      this.invoiceService.updateUiStateEditable(this.id, true);
      return;
    } else if (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionSave ||
      action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionRelease ||
      action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionSuppressRelease) {
      payload = this.invoice;
    } else if (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionCancel) {
      payload = {
        WorkflowPendingTaskId: action.WorkflowPendingTaskId,
        Id: this.id,
        Comments: 'We need to add Cancel comments entry dialog box'
      };
    } else {
      payload = {
        WorkflowPendingTaskId: action.WorkflowPendingTaskId,
        Id: this.id
      };
    }

    let dialogMsg: string;
    let dialogOptions: DialogOptions = {};
    if (confirmMessage && confirmMessage.length) {
      dialogMsg = confirmMessage;
      dialogOptions = {
        size: 'md'
      };
    } else {
      dialogMsg = this.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmationMessage, action.Name.toLowerCase());
    }

    this.dialogService.confirm(action.Name, dialogMsg, dialogOptions)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.validationMessages = {};
          this.invoiceService.executeCommand(action.CommandName, payload, null, true)
            .catch(err => {
              this.validationMessages = err;
            });
        }
      });
  }

  submit() {
    this.clickWorkflowAction(this.saveWorkflowAction);
  }

  cancelEdit() {
    // There is an issue when reloading the redux state keeps updating due to invoice-detail-notes.updateFormValues
    // this.loadInvoice(this.id, true);
    this.winRef.nativeWindow.location.reload();

  }

  initListener() {
    this.apiService.onPublic('InvoiceDeletedEvent', (event, data) => {
      if (data.ReferenceCommandName === 'InvoiceDelete' && data.EntityId === this.id) {
        this.loadingSpinnerService.hideAll();
        this.commonService.logSuccess(data.Message);
        this.router.navigate(['next', 'invoice', 'search'])
          .catch((err) => {
            console.error(`error navigating to invoice list`, err);
          });
      }
    })
      .then((unregister) => {
        this.unsubscribeDeleteEventListener();
        this.invoiceDeletedEventListener = unregister;
      })
      .catch(err => {
        console.error('Failed to register listener for InvoiceDeletedEvent', err);
      });
  }

  getActionCssClass(action: WorkflowAction): string {
    if (action.CommandName === PhxConstants.CommandNamesSupportedByUi.InvoiceUserActionRelease) {
      return 'primary';
    } else {
      return '';
    }
  }
*/
  hasForceEditAction() {
    return (
      this.invoice
      && _.includes(this.invoice.AvailableStateActions, PhxConstants.StateAction.InvoiceSave)
      && (this.invoice.StatusId === PhxConstants.InvoiceStatus.PendingClientPayment || this.invoice.StatusId === PhxConstants.InvoiceStatus.Paid)
    );
  }

  _initStateActions() {
    const self = this;
    self.stateActions = [
      { // edit
        displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.edit),
        hiddenFn: function(action, componentOption) {
          return !(self.hasForceEditAction() && !self.forceEdit);
        },
        onClick: function(action, componentOption, actionOption) {
          self.invoiceService.updateUiStateEditable(self.id, true);
        }
      },
      { // save edit
        actionId: PhxConstants.StateAction.InvoiceSubmit,
        displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.submit),
        style: StateActionButtonStyle.PRIMARY,
        hiddenFn: function(action, componentOption) {
          return !(componentOption.displayType === StateActionDisplayType.BUTTON && self.hasForceEditAction() && self.forceEdit);
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            ...self.invoice,
            EntityIds: [ self.id ]
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload);
          });
        }
      },
      { // cancel edit
        displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.cancel),
        hiddenFn: function(action, componentOption) {
          return !(componentOption.displayType === StateActionDisplayType.BUTTON && self.hasForceEditAction() && self.forceEdit);
        },
        onClick: function(action, componentOption, actionOption) {
          self.winRef.nativeWindow.location.reload();
        }
      },
      { // save
        actionId: PhxConstants.StateAction.InvoiceSave,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit || self.hasForceEditAction();
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ],
            ...self.invoice
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload);
          });
        }
      },
      { // discard
        actionId: PhxConstants.StateAction.InvoiceDiscard,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ]
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload, false).then(() => {
              const msg = self.localizationService.translate(InvoiceModuleResourceKeys.detail.invoiceDeleted, self.id);
              self.commonService.logSuccess(msg);
              self.router.navigate(['next', 'invoice', 'search'])
                .catch((err) => {
                  console.error(`error navigating to invoice list`, err);
                });
            });
          });
        }
      },
      { // release
        actionId: PhxConstants.StateAction.InvoiceRelease,
        style: StateActionButtonStyle.PRIMARY,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ],
            ...self.invoice
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload);
          });
        }
      },
      { // suppress release
        actionId: PhxConstants.StateAction.InvoiceSuppress,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ],
            ...self.invoice
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload);
          });
        }
      },
      { // mark as paid
        actionId:  PhxConstants.StateAction.InvoiceMarkAsPaid,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ]
          };
          self.invoiceService.anyUnpaidBillingTransactions(self.id)
            .then(anyUnpaidBillingTransactions => {
              const msgs: string[] = [];
              let msg: string = null;
              if (anyUnpaidBillingTransactions) {
                msgs.push(self.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmInvoiceMarkAsPaidUnpaidBillingTransactions));
                msgs.push(self.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmContinueMessage));
                msg = msgs.join('<br><br>');
              }
              self._showConfirmDialog(action, msg).then(() => {
                self._executeStateCommand(action.commandName, payload);
              });
            });
        }
      },
      { // cancel invoice
        actionId:  PhxConstants.StateAction.InvoiceCancel,
        hiddenFn: function(action, componentOption) {
          return self.forceEdit;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [ self.id ],
            Comments: 'We need to add Cancel comments entry dialog box'
          };
          self._showConfirmDialog(action).then(() => {
            self._executeStateCommand(action.commandName, payload);
          });
        }
      }
    ];
  }

  _showConfirmDialog(action: StateAction, msg?: string) {
    const self = this;
    let dialogMsg: string;
    let dialogOptions: DialogOptions = {};
    if (msg) {
      dialogMsg = msg;
      dialogOptions = {
        size: 'md'
      };
    } else {
      dialogMsg = self.localizationService.translate(InvoiceModuleResourceKeys.detail.confirmationMessage, action.displayText.toLowerCase());
    }
    return new Promise((resolve, reject) => {
      self.dialogService.confirm(action.displayText, dialogMsg, dialogOptions)
        .then((button) => {
          if (button === DialogResultType.Yes) {
            resolve();
          } else {
            reject();
          }
        });
    });
  }

  _executeStateCommand(commandName: string, payload: any, refreshInvoice: boolean = true) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.validationMessages = {};
      self.loadingSpinnerService.show();
      self.invoiceService.executeStateCommand(commandName, payload)
        .then(() => {
          if (refreshInvoice) {
            self.invoiceService.getInvoiceFromApi(self.id)
              .then(() => {
                self.loadingSpinnerService.hide();
                resolve();
              })
              .catch(ex => {
                self.loadingSpinnerService.hideAll();
                reject();
              });
          } else {
            self.loadingSpinnerService.hide();
            resolve();
          }
        })
        .catch(err => {
          self.validationMessages = err;
          self.loadingSpinnerService.hideAll();
          reject();
        });
    });
  }
}
