import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { NavigationService, PhxConstants, LoadingSpinnerService, DialogService, CommonService, ApiService } from '../../common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavigationBarItem, DialogResultType } from '../../common/model';
import { InvoiceService } from '../shared/invoice.service';

@Component({
  selector: 'app-consolidated-billing-transaction-clearing',
  templateUrl: './consolidated-billing-transaction-clearing.component.html',
  styleUrls: ['./consolidated-billing-transaction-clearing.component.less']
})
export class ConsolidatedBillingTransactionClearingComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;
  navigatePage: boolean = false;
  selectedRowKeys: any[] = [];
  validationMessages: any;
  batchActions: any;
  organizationIdInternal: number;
  selectedClient: any;
  selectedCurrency: any;

  clients: Array<any> = [];
  invoiceTypeId = 1;
  unregisterList: any[] = [];
  BillingInvoicePresentationStyle = PhxConstants.BillingInvoicePresentationStyle;
  notifyName: any = {
    NotifyName_BatchPreExecution_OnReleased: 'ConsolidatedBillingTransactionClearingComponent' + 'NotifyName_BatchPreExecution_OnReleased'
  };

  @ViewChild('grid') grid;
  @ViewChild('clientsSelectBox') clientId;
  @ViewChild('currencySelectBox') currencyId;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private dialogService: DialogService,
    private commonService: CommonService,
    private invoiceService: InvoiceService,
    private loadingSpinnerService: LoadingSpinnerService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.batchActions = {
      CreateInvoice: {
        Name: 'Create Invoice',
        SuccessMessage: 'Invoice Created successfully.',
        stateAction: PhxConstants.StateAction.BillingTransactionCreateInvoice
      },
      SuppressTransaction: {
        Name: 'Suppress Transaction',
        SuccessMessage: 'Suppressed successfully.',
        stateAction: PhxConstants.StateAction.BillingTransactionSuppress
      },
      ChangeToSingle: {
        Name: 'Change To Single',
        SuccessMessage: 'Changed to Single successfully.',
        stateAction: PhxConstants.StateAction.BillingTransactionChangeToSingle
      }
    };

    this.setupPrivateEvents();

    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe(parentParams => {
        this.organizationIdInternal = +parentParams['organizationIdInternal'];
      });

    this.invoiceService
      .getBillingTransactionClientList(this.organizationIdInternal, this.invoiceTypeId)
      .takeWhile(() => this.isAlive)
      .subscribe(data => {
        this.clients = data;
      });
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

  onSelectionChanged(event) {
    this.selectedRowKeys = event.selectedRowKeys;
  }

  setupPrivateEvents() {
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchPreExecution_OnReleased, (event, data) => {
        if (data.ExceptionEntityIds && data.ExceptionEntityIds.length > 0) {
          this.validationMessages = data;
        }
        const invoiceId = data.CreatedInvoceIds[0];
        if (this.navigatePage && invoiceId) {
          this.navigateToInvoiceDetail(invoiceId);
        } else {
          this.refreshPageOnInvoiceCreation();
        }
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
  }

  executeBatchCommand(action) {
    const self = this;

    this.dialogService.confirm(action.Name, `Are you sure you want to ${action.Name.toLowerCase()}?`).then(button => {
      if (button === DialogResultType.Yes) {
        this.validationMessages = null;
        this.loadingSpinnerService.show();

        const billingTransactionIds: number[] = this.selectedRowKeys.map(row => row.BillingTransactionId);

        if (billingTransactionIds.length > 0) {
          const payload = {
            EntityIds: billingTransactionIds,
            NotifyName_BatchPreExecution_OnReleased: this.notifyName.NotifyName_BatchPreExecution_OnReleased
          };

          self.apiService
            .command(PhxConstants.StateAction[action.stateAction], payload)
            .then(res => {
              this.loadingSpinnerService.hide();
              this.commonService.logSuccess(action.SuccessMessage);
              if (!this.navigatePage) {
                this.refreshPageOnInvoiceCreation();
              }
            })
            .catch(err => {
              this.loadingSpinnerService.hideAll();
              this.showError(`Error executing ${action.Name.toLowerCase()}`, err);
            });
        } else {
          this.commonService.logError(`Select transaction(s) to ${action.Name.toLowerCase()}`);
        }
      }
    });
  }

  showError(message: string, error: any) {
    console.error(message, error);
    this.commonService.logError(message);
  }

  refreshPageOnInvoiceCreation() {
    this.grid.refresh();
    this.invoiceService.updateBillingTransactionClearingCounts(this.organizationIdInternal);
    this.refreshBillingTransactionClientList();
  }

  refreshBillingTransactionClientList() {
    this.invoiceService
      .getBillingTransactionClientList(this.organizationIdInternal, this.invoiceTypeId)
      .takeWhile(() => this.isAlive)
      .subscribe(data => {
        this.clients = data;
        const client = this.clients.find(c => c.ClientId === this.clientId.value.ClientId);
        if (client != null) {
          this.selectedClient = client;
        } else {
          this.selectedCurrency = null;
        }
      });
  }
  createAndReviewInvoice() {
    this.navigatePage = true;
    this.executeBatchCommand(this.batchActions.CreateInvoice);
  }

  createInvoiceAndStay() {
    this.navigatePage = false;
    this.executeBatchCommand(this.batchActions.CreateInvoice);
  }

  navigateToInvoiceDetail(invoiceId: number) {
    this.router.navigate(['next', 'invoice', invoiceId, 'detail']).catch(err => {
      console.error(`error navigating to consolidatable transactions`, err);
    });
  }
}
