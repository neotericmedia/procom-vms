import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { NavigationBarItem, DialogResultType } from '../../common/model';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavigationService, PhxConstants, DialogService, LoadingSpinnerService, CommonService, ApiService } from '../../common';
import { InvoiceService } from '../shared/invoice.service';

@Component({
  selector: 'app-single-billing-transaction-clearing',
  templateUrl: './single-billing-transaction-clearing.component.html',
  styleUrls: ['./single-billing-transaction-clearing.component.less']
})
export class SingleBillingTransactionClearingComponent implements OnInit, OnDestroy {
  currentUrl: string;
  isAlive: boolean = true;
  unregisterList: any[] = [];
  validationMessages: any;
  selectedRowKeys: any[] = [];
  batchActions: any;
  organizationIdInternal: number;

  @ViewChild('grid') grid;
  BillingInvoicePresentationStyle = PhxConstants.BillingInvoicePresentationStyle;

  notifyName: any = {
    NotifyName_BatchPreExecution_OnReleased: 'SingleBillingTransactionClearingComponent' + 'NotifyName_BatchPreExecution_OnReleased'
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private navigationService: NavigationService,
    private dialogService: DialogService,
    private commonService: CommonService,
    private invoiceService: InvoiceService,
    private loadingSpinnerService: LoadingSpinnerService
  ) {}

  ngOnInit() {
    this.setupPrivateEvents();

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
      ChangeToConsolidated: {
        Name: 'Change To Consolidated',
        SuccessMessage: 'Changed to Consolidated successfully.',
        stateAction: PhxConstants.StateAction.BillingTransactionChangeToConsolidated
      }
    };

    this.activatedRoute.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe(parentParams => {
        this.organizationIdInternal = +parentParams['organizationIdInternal'];
      });
  }

  onSelectionChanged(event) {
    this.selectedRowKeys = event.selectedRowKeys;
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

  setupPrivateEvents() {
    this.apiService
      .onPrivate(this.notifyName.NotifyName_BatchPreExecution_OnReleased, (event, data) => {
        if (data.ExceptionEntityIds && data.ExceptionEntityIds.length > 0) {
          this.validationMessages = data;
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
              this.grid.refresh();
              this.loadingSpinnerService.hide();
              this.commonService.logSuccess(action.SuccessMessage);
              this.invoiceService.updateBillingTransactionClearingCounts(this.organizationIdInternal);
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
}
