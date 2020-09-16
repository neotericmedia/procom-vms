import { PaymentService } from './../payment.service';
import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType, WorkflowAction, CodeValue, DialogResultType, StateActionButtonStyle, StateAction, PhxConstants } from '../../common/model/index';
import { NavigationService } from '../../common/services/navigation.service';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { Cheque } from '../share/cheque';
import { ChequeService } from '../cheque.service';
import { CodeValueService, CommonService, WorkflowService, DialogService, LoadingSpinnerService } from '../../common/index';
import { ChequeWorkflowActions, ChequeWorkflowComment, ChequeStateActions } from '../share/index';
import { ChequeWorkflowCommentDialogComponent } from '../cheque-workflow-comment-dialog/cheque-workflow-comment-dialog.component';
import { ChequePaymentStatusList } from '../share/cheque-payment-status-list';

declare var oreq: any;

@Component({
  selector: 'cheque-list',
  templateUrl: './cheque-list.component.html',
  styleUrls: ['./cheque-list.component.less']
})
export class ChequeListComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: PhxDataTableComponent;
  @ViewChild('workflowDialog') workflowDialog: ChequeWorkflowCommentDialogComponent;

  live: boolean = true;
  amountColumnFormat = { type: 'fixedPoint', precision: 2 };
  codeValueGroups: any;
  applicationConstants: any;
  dialogSubTitle: string = '';
  actionToExecute: WorkflowAction;
  organizationId?: number;
  bankId?: number;
  currencyId?: number;
  paymentId: number;
  paymentTransactionId: number;
  bankName: string = '';
  organizationName: string = '';
  showSlider: boolean = false;
  tableStateActions: StateAction[];
  currrentAction: any;
  validationMessages: any;

  odataParams: string = '';
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
      'PaymentStatus',
      'PayeeTypeId',
      'ChequeCompletionDate',
      'ChequeCompletionReason',
      'AvailableStateActions'
    ])
    .url();

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    enableExport: true,
    masterDetailTemplateName: 'detail',
    enableMasterDetail: true
  });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataType: 'number',
      dataField: 'Id',
      width: 100,
      caption: 'Payment Id'
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
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentStatus',
      caption: 'Status',
      dataType: 'string',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'id',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'ChequeCompletionDate',
      caption: 'Status Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'ChequeCompletionReason',
      caption: 'Reason'
    }),
    new PhxDataTableColumn({
      dataField: 'WorkflowAvailableActions',
      caption: 'Action',
      cellTemplate: 'actionCellTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  ];

  constructor(
    private navigationService: NavigationService,
    private chequeService: ChequeService,
    private route: ActivatedRoute,
    private codeValueService: CodeValueService,
    protected commonService: CommonService,
    private workflowService: WorkflowService,
    private dialogService: DialogService,
    private paymentService: PaymentService,
    private loadingSpinnerService: LoadingSpinnerService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  ngOnInit() {
    this.navigationService.setTitle('cheques-all');
    this.route.params.takeWhile(() => this.live).subscribe(params => {
      this.organizationId = +params['orgId'];
      this.bankId = +params['bankId'];
      this.currencyId = +params['currencyId'];
      this.buildOdataParam(this.organizationId, this.bankId, this.currencyId);
      this.setBankName(this.organizationId, this.bankId);
    });
  }

  setBankName(organizationId?: number, bankId?: number) {
    this.paymentService.getOriginalOrganizationBankAccount(this.bankId).subscribe(org => {
      this.bankName = org.Items[0].OrganizationInternalRoles[0].BankAccounts.filter(item => {
        return item.Id === this.bankId;
      })[0].BankName;
    });
  }

  onRowExpanding(event: any) {
    if (event.key && event.key.Id) {
      this.paymentId = event.key.Id;
    }
  }

  dataReceived(data) {
    if (data.length > 0) {
      this.navigationService.setTitle('cheques-all', [data[0].OrganizationalInternalLegalName, this.bankName]);
      this._initTableStateActions();
    }
  }
  handleOnClick(cheque: Cheque, action: any) {
    if (action.Id === ChequeStateActions.PaymentMoveToInProgress) {
      const message = `The cheque will be moved to in progress. Continue?`;
      this.dialogService.confirm(`Move Cheque to In Progress - ${this.dialogSubTitle}`, message).then(button => {
        if (button === DialogResultType.Yes) {
          const payload = {
            EntityIds: [cheque.Id]
          };
          this.executeStateCommand(action.CommandName, payload);

        }
      });
    } else {
      this.dialogSubTitle = this.bankName;
      this.actionToExecute = action;
      const model: ChequeWorkflowComment = {
        ChequeCount: 1,
        CurrencyId: cheque.CurrencyId,
        Date: new Date(),
        Message: '',
        Reason: '',
        TotalAmount: cheque.PaymentTotal
      };
      this.workflowDialog.open([cheque], model);
    }
  }

  _initTableStateActions() {
    const self = this;
    self.tableStateActions = [
      {
        actionId: PhxConstants.StateAction.PaymentMarkAsNSF,
        sortOrder: 4,
        displayText: 'Mark As NSF',
        onClick: function (action, componentOption, actionOption) {
          self.currrentAction =
            {
              Id: this.actionId,
              Name: 'Mark As NSF',
              CommandName: action.commandName
            }
          self.handleOnClick(componentOption.refData.data, self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentStopPayment,
        sortOrder: 3,
        displayText: 'Stop Payment',
        onClick: function (action, componentOption, actionOption) {
          self.currrentAction =
            {
              Id: this.actionId,
              Name: 'Stop Payment',
              CommandName: action.commandName
            }
          self.handleOnClick(componentOption.refData.data, self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentCancelCheques,
        sortOrder: 2,
        displayText: 'Cancel Cheques',
        onClick: function (action, componentOption, actionOption) {
          self.currrentAction =
            {
              Id: this.actionId,
              Name: 'Cancel Cheques',
              CommandName: action.commandName
            }
          self.handleOnClick(componentOption.refData.data, self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentClearCheques,
        sortOrder: 1,
        displayText: 'Clear Cheques',
        onClick: function (action, componentOption, actionOption) {
          self.currrentAction =
            {
              Id: this.actionId,
              Name: 'Clear Cheques',
              CommandName: action.commandName
            }
          self.handleOnClick(componentOption.refData.data, self.currrentAction);
        }
      },
      {
        actionId: PhxConstants.StateAction.PaymentMoveToInProgress,
        sortOrder: 5,
        displayText: 'Move to In-Progress',
        onClick: function (action, componentOption, actionOption) {
          self.currrentAction =
            {
              Id: this.actionId,
              Name: 'Move to In-Progress',
              CommandName: action.commandName
            }
          self.handleOnClick(componentOption.refData.data, self.currrentAction);
        }
      },
    ];
  }

  onPaymentTransactionRowClick(data: any) {
    this.showSlider = true;
    this.paymentId = data.PaymentId;
    this.paymentTransactionId = data.Id;
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
    if (filter !== '') {
      this.odataParams = this.originalOdataParams + `&$filter= ${filter}`;
    } else {
      this.odataParams = this.originalOdataParams;
    }
  }

  executeStateCommand(commandName: string, payload: any) {
    const self = this;
    self.validationMessages = null;
    self.loadingSpinnerService.show();
    self.chequeService.executeStateCommand(commandName, payload)
      .then(function () {
        self.grid.refresh();
        self.loadingSpinnerService.hide();
      })
      .catch(function (err) {
        self.validationMessages = err;
        self.loadingSpinnerService.hideAll();
      });
  }


  getStatusLookup() {
    return this.codeValueService.getCodeValues('payment.CodePaymentStatus', true)
      .filter((codevalue: CodeValue) => ChequePaymentStatusList.includes(codevalue.id));
  }

  getPayeeTypeLookup() {
    return this.codeValueService.getCodeValues('payment.CodePayeeType', true);
  }

  dialogSaved(event: { selectedRows: any; chequeWorkflowComment: ChequeWorkflowComment }) {
    if (event.selectedRows) {
      var ids = event.selectedRows.map(r => r.Id);
      const payload = {
        EntityIds: ids,
        EntityTypeId: this.commonService.ApplicationConstants.EntityType.Payment,
        ChequeCompletionDate: event.chequeWorkflowComment.Date,
        Comments: event.chequeWorkflowComment.Reason
      };
      this.executeStateCommand(this.actionToExecute.CommandName, payload);
    }
  }

  ngOnDestroy() {
    this.live = false;
  }
}
