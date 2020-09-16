import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxConstants, CommonService, NavigationService, CodeValueService, PhxLocalizationService } from '../../common';
import { PhoenixCommonModuleResourceKeys } from '../../common/PhoenixCommon.module';
import { StateAction, StateActionDisplayType, StateActionButtonStyle } from '../../common/model/index';
import { InvoiceService } from '../shared/invoice.service';
import { Invoice } from '../shared/index';

@Component({
  selector: 'app-invoice-add-billing-transactions',
  templateUrl: './invoice-add-billing-transactions.component.html',
  styleUrls: ['./invoice-add-billing-transactions.component.less']
})
export class InvoiceAddBillingTransactionsComponent implements OnInit {
  isAlive: boolean = true;
  internalOrganizationId: number;
  internalOrganizationLegalName: string;
  currencyId: number;
  currencyCode: string;
  clientId: number;
  clientName: string;
  invoiceId: number;
  //workflowPendingTaskId: number;
  totalSelectedAmount: number = 0;
  totalSelectedRows: number = 0;
  selectedBillingTransactionIds: Array<number> = [];

  BillingInvoicePresentationStyle = PhxConstants.BillingInvoicePresentationStyle;
  codeValueGroups: any;

  invoice: Invoice;
  loadBillingTransactions: boolean = false;
  stateActions: StateAction[];
  availableStateActions: number[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private invoiceService: InvoiceService,
    private localizationService: PhxLocalizationService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.invoiceId = +params['invoiceId'];
        this.loadInvoice(this.invoiceId);
      });
  }

  loadInvoice(id: number) {
    this.invoiceService.getInvoice(id)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        if (data) {
          this.invoice = data;
          this.availableStateActions = this.invoice.AvailableStateActions;

          this.internalOrganizationId = this.invoice.OrganizationIdInternal;
          this.clientId = this.invoice.OrganizationIdClient;
          this.currencyId = this.invoice.CurrencyId;

          this.internalOrganizationLegalName = this.invoice.InternalCompanyLegalName;
          this.clientName = this.invoice.OrganizationClientLegalName;
         // this.workflowPendingTaskId = this.invoice.WorkflowPendingTaskId;

          const currency = this.codeValueService.getCodeValue(this.currencyId, this.codeValueGroups.Currency);
          this.currencyCode = currency ? currency.code : null;
          this.navigationService.setTitle('add-billing-transactions-to-invoice', [this.invoice.InternalCompanyLegalName, this.currencyCode]);

          this.loadBillingTransactions = true;
          this._initStateActions();
        }
      });
  }

  onSelectionChanged(data) {
    this.totalSelectedAmount = 0;
    this.totalSelectedRows = data.selectedRowsData.length;
    this.selectedBillingTransactionIds = [];
    data.selectedRowsData.map((item) => {
      this.selectedBillingTransactionIds.push(item.BillingTransactionId);
      this.totalSelectedAmount += item.TotalAmount;
    });
  }

  addTransactionToInvoice() {
    const payload = {
      BillingTransactionIds: this.selectedBillingTransactionIds,
      //WorkflowPendingTaskId: this.workflowPendingTaskId,
      Id: this.invoiceId
    };

    this.invoiceService.executeCommand(PhxConstants.CommandNamesSupportedByUi.InvoiceConsolidatedUserActionBillingTransactionAdd, payload, null, true)
      .then((id) => {
        this.navigateToInvoice(this.invoiceId, 'transactions');
      })
      .catch(err => {
        this.showError('Error adding transactions to this invoice', err);
      });

  }

  cancelAddTransactionToInvoice() {
    this.navigateToInvoice(this.invoiceId, 'transactions');
  }

  navigateToInvoice(id: number, tab: string) {
    this.router.navigate(['next', 'invoice', id, tab])
      .catch((err) => {
        console.error(`error navigating to invoice ${id}`, err);
      });
  }

  showError(message: string, error: any) {
    console.error(message, error);
    this.commonService.logError(message);
  }

  _initStateActions() {
    const self = this;
    self.stateActions = [
      { // add billing transactions
        actionId: PhxConstants.StateAction.InvoiceAddBillingTransaction,
        style: StateActionButtonStyle.PRIMARY,
        disabledFn: function(action, componentOption) {
          return self.totalSelectedRows === 0;
        },
        onClick: function(action, componentOption, actionOption) {
          const payload = {
            EntityIds: [self.invoiceId],
            BillingTransactionIds: self.selectedBillingTransactionIds
          };

          self.invoiceService.executeStateCommand(action.commandName, payload)
            .then(() => {
              self.invoiceService.getInvoiceFromApi(self.invoiceId)
              .then(() => {
                self.navigateToInvoice(self.invoiceId, 'transactions');
              });
            })
            .catch(err => {
              self.showError('Error adding transactions to this invoice', err);
            });
        }
      },
      { // cancel
        displayText: self.localizationService.translate(PhoenixCommonModuleResourceKeys.generic.cancel),
        onClick: function(action, componentOption, actionOption) {
          self.navigateToInvoice(self.invoiceId, 'transactions');
        }
      }
    ];
  }
}
