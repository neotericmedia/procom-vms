import { PaymentDocumentComponent } from './../payment-document/payment-document.component';
import { PaymentService } from './../payment.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType, PhxDataTableSelectionMode, PhxDataTableSelectallMode, WorkflowAction, StateAction, StateActionButtonStyle, PhxConstants } from '../../common/model/index';
import { NavigationService } from '../../common/services/navigation.service';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { ChequeService } from '../cheque.service';
import { ChequeWorkflowCommentDialogComponent } from '../cheque-workflow-comment-dialog/cheque-workflow-comment-dialog.component';
import {ChequeStateActions, Cheque, ChequeWorkflowComment } from '../share';
import { CodeValueService, CommonService, WorkflowService, DialogService, WindowRefService, PhxLocalizationService, LoadingSpinnerService } from '../../common/index';
import { CodeValue } from '../../common/model/index';

declare var oreq: any;

@Component({
  selector: 'cheque-inprogress-list',
  templateUrl: './cheque-inprogress-list.component.html',
  styleUrls: ['./cheque-inprogress-list.component.less']
})
export class ChequeInprogressListComponent implements OnInit {
  @ViewChild('grid') grid: PhxDataTableComponent;
  @ViewChild('workflowDialog') workflowDialog: ChequeWorkflowCommentDialogComponent;

  live: boolean = true;
  amountColumnFormat = { type: 'fixedPoint', precision: 2 };
  codeValueGroups: any;
  applicationConstants: any;
  stateActions: StateAction[];
  availableStateActions: number[];
  selectedRowKeys: any[] = [];
  currrentAction: any;
  validationMessages: any;
  odataParams = '';
  originalOdataParams = oreq
    .request()
    .withSelect([
      'Id',
      'ChequeNumber',
      'PaymentTotal',
      'PaymentDate',
      'PayeeName',
      'PaymentNumber',
      'OrganizationalInternalLegalName',
      'BankId',
      'BankName',
      'PayeeTypeId',
      'AvailableStateActions'
    ])
    .url();

  totalSelected: number = 0;
  dialogSubTitle: string = '';
  actionToExecute: WorkflowAction;
  organizationId?: number;
  bankId?: number;
  currencyId?: number;
  bankName: string = '';
  organizationName: string = '';
  paymentId: number;
  paymentTransactionId: number;
  showSlider: boolean = false;

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    selectionMode: PhxDataTableSelectionMode.Multiple,
    selectAllMode: PhxDataTableSelectallMode.Page,
    enableExport: true,
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'Id',
      width: 100,
      caption: 'Payment Id',
      alignment: 'left'
    }),
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'ChequeNumber',
      caption: 'Cheque Number',
      alignment: 'right'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTotal',
      caption: 'Amount',
      dataType: 'decimal',
      alignment: 'right',
      format: this.amountColumnFormat
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentDate',
      caption: 'Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeName',
      caption: 'Payee Name'
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeTypeId',
      caption: 'Payee Type',
      lookup: {
        dataSource: this.getPayeeTypeLookup(),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentNumber',
      caption: 'Payment Number'
    })
  ];


  constructor(
    private navigationService: NavigationService,
    private chequeService: ChequeService,
    private route: ActivatedRoute,
    protected commonService: CommonService,
    private workflowService: WorkflowService,
    private paymentService: PaymentService,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService,
    private winRef: WindowRefService,
    private codeValueService: CodeValueService,
    private loadingSpinnerService: LoadingSpinnerService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  ngOnInit() {
    this.navigationService.setTitle('cheques-inprogress');
    this.route.params.takeWhile(() => this.live).subscribe(params => {
      this.organizationId = +params['orgId'];
      this.bankId = +params['bankId'];
      this.currencyId = +params['currencyId'];
      this.buildOdataParam(this.organizationId, this.bankId, this.currencyId);
      this.setBankName(this.organizationId, this.bankId);
    });

  }

  initStateActions() {
    const self = this;
    self.stateActions = [
      {
        actionId: PhxConstants.StateAction.PaymentMarkAsNSF,
        displayText: 'Mark As NSF',
        skipSecurityCheck: true,
        sortOrder: 4,
        onClick: function(action, componentOption, actionOption) {
          self.currrentAction = {

              Id: this.actionId,
              Name: 'Mark As NSF',
              CommandName: action.commandName
            };
          self.handleOnClick(self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentStopPayment,
        displayText: 'Stop Payment',
        skipSecurityCheck: true,
        sortOrder: 3,
        onClick: function(action, componentOption, actionOption) {
          self.currrentAction = {
              Id: this.actionId,
              Name: 'Stop Payment',
              CommandName: action.commandName
            };
          self.handleOnClick(self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentCancelCheques,
        skipSecurityCheck: true,
        displayText: 'Cancel Cheques',
        sortOrder: 2,
        onClick: function(action, componentOption, actionOption) {
          self.currrentAction = {
              Id: this.actionId,
              Name: 'Cancel Cheques',
              CommandName: action.commandName
            };
          self.handleOnClick(self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentClearCheques,
        skipSecurityCheck: true,
        displayText: 'Clear Cheques',
        style: StateActionButtonStyle.PRIMARY,
        sortOrder: 1,
        onClick: function(action, componentOption, actionOption) {
          self.currrentAction = {
              Id: this.actionId,
              Name: 'Clear Cheques',
              CommandName: action.commandName
            };
          self.handleOnClick(self.currrentAction);
        }
      },
    ];
  }

  setBankName(organizationId?: number, bankId?: number) {
    this.paymentService.getOriginalOrganizationBankAccount(this.bankId).subscribe(org => {
      this.bankName = org.Items[0].OrganizationInternalRoles[0].BankAccounts.filter(item => {
        return item.Id === this.bankId;
      })[0].BankName;
    });
  }

  buildOdataParam(organizationId?: number, bankId?: number, currencyId?: number) {
    let filter = '';
    if (organizationId) {
      filter += (filter !== '' ? ' and ' : '') + `OrganizationalIdInternal eq ${organizationId}`;
    }
    if (bankId) {
      filter += (filter !== '' ? ' and ' : '') + `BankId eq ${bankId}`;
    }
    if (currencyId) {
      filter += (filter !== '' ? ' and ' : '') + `CurrencyId eq ${currencyId}`;
    }

    filter = (filter !== '' ? ' and ' : '') + filter;

    if (filter !== '') {
      this.odataParams = this.originalOdataParams + `&$filter= PaymentStatus eq 8 ${filter}`;
    } else {
      this.odataParams = this.originalOdataParams + `&$filter= PaymentStatus eq 8`;
    }
  }

  executeAction(cheque: Cheque, action: WorkflowAction, reason: string, completionDate?: Date) {
    if (action) {
      this.chequeService
        .executeCommand(action.CommandName, reason, {
          PaymentId: cheque.Id,
          WorkflowPendingTaskId: action.WorkflowPendingTaskId,
          ChequeCompletionDate: completionDate
        })
        .then(r => {
          const entityTypeId = this.applicationConstants.EntityType.Payment;
          this.workflowService
            .setWatchConfigOnWorkflowEvent('/next/', entityTypeId, entityTypeId, r.EntityId)
            .then(() => {
              this.grid.refresh();
            })
            .catch(err => {
              this.grid.refresh();
            });
        });
    }
  }

  handleOnClick(action: any) {
    const selectedRows = this.grid.getSelectedRowsData();
    if (!selectedRows || !selectedRows.length || selectedRows.length === 0) {
      this.dialogService.notify('', 'Please select at least one cheque', { backdrop: 'static', size: 'md' });
      return;
    }

    this.dialogSubTitle = this.bankName;
    this.actionToExecute = action;
    const model: ChequeWorkflowComment = {
      ChequeCount: selectedRows.length,
      CurrencyId: this.currencyId,
      Date: new Date(),
      Message: '',
      Reason: '',
      TotalAmount: this.totalSelected
    };
    this.workflowDialog.open(selectedRows, model);
  }

  onRowSelected(event: any) {
    this.totalSelected = 0;
    const selectedRows = this.grid.getSelectedRowsData();
    if (selectedRows) {
      selectedRows.forEach((item: Cheque) => {
        this.totalSelected += item.PaymentTotal;
      });
    }
  }

  onRowExpanding(event: any) {
    if (event.key && event.key.Id) {
      this.paymentId = event.key.Id;
    }
  }

  dataReceived(data) {
    if (data.length > 0) {
      this.navigationService.setTitle('cheques-inprogress', [data[0].OrganizationalInternalLegalName, this.bankName]);
      this.availableStateActions = data[0].AvailableStateActions;
      this.initStateActions();
    }
  }
  onPaymentTransactionRowClick(data: any) {
    this.showSlider = true;
    this.paymentId = data.PaymentId;
    this.paymentTransactionId = data.Id;
  }

  dialogSaved(event: { selectedRows: any; chequeWorkflowComment: ChequeWorkflowComment }) {
    if (event.selectedRows) {
      var ids = event.selectedRows.map(r => r.Id);
      event.selectedRows.forEach((cheque: Cheque) => {
        const correspondingActions = cheque.AvailableStateActions.filter(i => i=== this.actionToExecute.Id);
        if (correspondingActions.length <= 0) {
            let index = ids.findIndex(d => d === cheque.Id);
            ids.splice(index, 1);//remove element from array
            console.error(`StateAction ${this.actionToExecute.Name}:${this.actionToExecute.Id} is not available on cheque ${cheque.ChequeNumber}, available StateActions:${JSON.stringify(cheque.AvailableStateActions, null, 2)}`);
        } 
        });

        const payload = {
            EntityIds: ids,
            EntityTypeId: this.commonService.ApplicationConstants.EntityType.Payment,
            ChequeCompletionDate: event.chequeWorkflowComment.Date,
            Comments: event.chequeWorkflowComment.Reason
        };
        if (payload.EntityIds.length > 0) {
            this.executeStateCommand(this.actionToExecute.CommandName, payload);
        }
    }
  }

  executeStateCommand(commandName: string, payload: any) {
    const self = this;
    self.validationMessages = null;
    self.loadingSpinnerService.show();
    self.chequeService.executeStateCommand(commandName, payload)
      .then(function() {
        self.grid.refresh();
        self.loadingSpinnerService.hide();
      })
      .catch(function(err) {
        self.validationMessages = err;
        self.loadingSpinnerService.hideAll();
      });
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [
        {
          text: this.localizationService.translate('payment.transaction.openTransactionNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionHeaderId}/summary`);
          }
        }
      ];
    }
  }

  getPayeeTypeLookup() {
    return this.codeValueService.getCodeValues('payment.CodePayeeType', true);
  }
}
