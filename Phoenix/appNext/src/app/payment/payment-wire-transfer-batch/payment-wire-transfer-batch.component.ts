import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { PhxNavigationBarComponent } from './../../common/components/phx-navigation-bar/phx-navigation-bar.component';
import { PaymentBatchBaseComponent } from './../share/payment-batch-base/payment-batch-base.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, NavigationService, CodeValueService, CommonService, ApiService, WorkflowService, PhxConstants, PhxLocalizationService, LoadingSpinnerService } from '../../common';
import { PaymentService } from '../payment.service';
import { PhxDataTableColumn } from '../../common/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { PhxButton } from '../../common/model/phx-button';
import { Subject } from 'rxjs/Subject';

import * as _ from 'lodash';
@Component({
  selector: 'app-payment-wire-transfer-batch',
  templateUrl: './payment-wire-transfer-batch.component.html',
  styleUrls: ['./payment-wire-transfer-batch.component.less']
})
export class PaymentWireTransferBatchComponent extends PaymentBatchBaseComponent implements OnInit {
  protected currencyColumnFormat = { type: 'fixedPoint', precision: 2 };
  batchId: number;
  _dataGridComponentNamePayment: string = 'PaymentWireTransferBatchPayment';
  _dataGridComponentNameTransaction: string = 'PaymentWireTransferBatchTransaction';
  columnsPayment: Array<PhxDataTableColumn>;
  detailColumnsPayment: Array<PhxDataTableColumn>;
  columnsTransaction: Array<PhxDataTableColumn>;
  detailColumnsTransaction: Array<PhxDataTableColumn>;
  dataSourceUrlPayment: string;
  dataSourceUrlTransaction: string;
  model: any = {};
  pageTitle: string;
  @ViewChild('changeBatchDetailsModal')
  changeBatchDetailsModal: PhxModalComponent;
  @ViewChild('navBar')
  navBar: PhxNavigationBarComponent;
  @ViewChild('gridPayment')
  gridPayment: PhxDataTableComponent;
  @ViewChild('gridDetailPayment')
  gridDetailPayment: PhxDataTableComponent;
  @ViewChild('gridTransaction')
  gridTransaction: PhxDataTableComponent;
  @ViewChild('batchGroupedByPayeeDialog')
  batchGroupedByPayeeDialog: PhxModalComponent;
  batchDetailsModalForm: any = {};
  batchDetailsModalFormData: any = {};
  gridViewMode: string = 'payment';
  batchGroupedByPayeeDialogData: any;
  changeBatchDetailsModalButtons = [
    {
      icon: 'done',
      tooltip: 'Save',
      btnType: 'primary',
      disabled: (): boolean => {
        return !this.batchDetailsModalForm.valid;
      },
      action: () => {
        this.changeBatchDetailsModal.hide();
        this.paymentService
          .changeBatchDetails(this.batchId, this.batchDetailsModalFormData)
          .then(response => {
            this.commonService.logSuccess('Batch details updated.');
            this.loadPaymentBatch();
          })
          .catch(error => {
            this.commonService.logError('Error updating batch details.', error);
            this.validationMessages = error;
          });
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        this.changeBatchDetailsModal.hide();
        console.log('Close');
      }
    }
  ];
  bankAccounts: any[] = [];

  private gridPaymentDebouncer$ = new Subject<boolean>();
  private gridTransactionDebouncer$ = new Subject<boolean>();

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
    private organizationApiService: OrganizationApiService,
    private fb: FormBuilder,
    protected loadingSpinnerService: LoadingSpinnerService
  ) {
    super(route, router, dialogService, localizationService, navigationService, codeValueService, commonService, apiService, paymentService, workflowService, PhxConstants.PaymentMethodType.ADP, loadingSpinnerService);
  }

  ngOnInit() {
    this.workflowGenerateFileButtonText = 'Generate Wire Transfer File';

    this.columnsPayment = [
      this.colDefsPayment.id,
      this.colDefsPayment.paymentNumber,
      this.colDefsPayment.paymentPayeeName,
      this.colDefsPayment.groupedWorkerName,
      this.colDefsPayment.status,
      Object.assign(this.colDefsPayment.amount, {
        sortIndex: 0,
        sortOrder: 'asc'
      }),
      this.colDefsPayment.action
    ];
    this.detailColumnsPayment = [
      this.colDefsPaymentTransaction.trNumber,
      this.colDefsPaymentTransaction.supplier,
      this.colDefsPaymentTransaction.worker,
      this.colDefsPaymentTransaction.workSite,
      this.colDefsPaymentTransaction.startDate,
      this.colDefsPaymentTransaction.endDate,
      this.colDefsPaymentTransaction.amount,
      this.colDefsPaymentTransaction.action
    ];
    this.columnsTransaction = [
      this.colDefsPaymentTransaction.trNumber,
      this.colDefsPaymentTransaction.supplier,
      this.colDefsPaymentTransaction.worker,
      this.colDefsPaymentTransaction.workSite,
      this.colDefsPaymentTransaction.workOrder,
      this.colDefsPaymentTransaction.startDate,
      this.colDefsPaymentTransaction.endDate,
      this.colDefsPaymentTransaction.plannedReleaseDate,
      this.colDefsPaymentTransaction.amount,
      this.colDefsPaymentTransaction.branch,
      this.colDefsPaymentTransaction.jobOwner,
      this.colDefsPaymentTransaction.client,
      this.colDefsPaymentTransaction.action
    ];
    this.detailColumnsTransaction = [this.colDefsPaymentTransactionLines.rateType, this.colDefsPaymentTransactionLines.rate, this.colDefsPaymentTransactionLines.units, this.colDefsPaymentTransactionLines.unitType];
    this.batchDetailsModalForm = this.fb.group({
      PayFrom: ['', [Validators.required], [this.checkPaymentBatchExist.bind(this)]],
      DepositDate: ['', [Validators.required]],
      PayGarnisheeFrom: ['', [this.ValidatorGarnisheeBank.bind(this)]]
    });
    super.ngOnInit();
    this.navBar.activeTab = this.tabList[0];

    this.gridPaymentDebouncer$.debounceTime(100).subscribe(() => {
      if (this.gridPayment) {
        this.gridPayment.updateDimensions();
      }
    });

    this.gridTransactionDebouncer$.debounceTime(100).subscribe(() => {
      if (this.gridTransaction) {
        this.gridTransaction.updateDimensions();
      }
    });
  }

  batchGroupedByPayeeDialogButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Remove and Finalize',
      btnType: 'primary',
      action: () => {
        this.removeAffectedItemsConfirmation(null, true);
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        this.batchGroupedByPayeeDialog.hide();
        console.log('Close');
      }
    }
  ];

  ValidatorGarnisheeBank(control: AbstractControl): { [key: string]: any } {
    if ((this.model.GarnisheeBankAccountId > 0 || this.model.GarnisheeUniqueCount > 0) && !control.value) {
      return { PayGarnisheeFrom: false };
    }
    return null;
  }

  checkPaymentBatchExist(control: AbstractControl) {
    return this.paymentService
      .getPaymentWireTransferDraftBatchesByBankAccount(control.value)
      .then((res: any) => {
        return res.Items[0] && res.Items[0].Id !== this.batchId ? { paymentBatchExist: true } : null;
      })
      .catch(error => {
        console.log(error);
        return null;
      });
  }

  get dataGridComponentNamePayment() {
    return this._dataGridComponentNamePayment;
  }

  get dataGridComponentNameTransaction() {
    return this._dataGridComponentNameTransaction;
  }

  get getComponentName() {
    return 'PaymentWireTransferBatchComponent';
  }
  protected getPaymentBatch(onSuccess: (data: any) => void) {
    const oDataParams = this.oreq
      .request()
      .withSelect([
        'Id',
        'BatchNumber',
        'DepositDate',
        'CreateDate',
        'Amount',
        'CurrencyId',
        'BatchStatusId',
        'InternalOrganizationLegalName',
        'InternalOrganizationBankAccountBankName',
        'InternalOrganizationBankAccountId',
        'InternalOrganizationBankAccountDescription',
        'GarnisheeBankAccountId',
        'OrganizationIdInternal',
        'GarnisheeUniqueCount',
        'GarnisheeAmount',
      ])
      .url();

    const result = this.paymentService.getPaymentWireTransferBatch(this.batchId, oDataParams).subscribe((data: any) => {
      this.navigationService.setTitle('payments-managewire', [data.InternalOrganizationLegalName, this.currencyCode, this.batchId]);
      this.batchDetailsModalFormData = {
        depositDate: data.DepositDate,
        bankId: data.InternalOrganizationBankAccountId,
        garnisheeBankAccountId: data.GarnisheeBankAccountId,
      };
      onSuccess(data);
      this.model.fullBankName =
        this.model.InternalOrganizationBankAccountDescription !== '' ? this.model.InternalOrganizationBankAccountBankName + '-' + this.model.InternalOrganizationBankAccountDescription : this.model.InternalOrganizationBankAccountBankName;
      this.fetchBankDetails();
      const isPaymentActionVisible = [PhxConstants.PaymentReleaseBatchStatus.Draft, PhxConstants.PaymentReleaseBatchStatus.Transferred, PhxConstants.PaymentReleaseBatchStatus.Finalized].some(status => status === this.model.BatchStatusId);
      this.gridPayment.grid.instance.columnOption(this.colDefsPayment.action.dataField, 'visible', isPaymentActionVisible);
      const isPaymentTransactionActionAvailable = this.model.BatchStatusId === PhxConstants.PaymentReleaseBatchStatus.Draft;
      this.detailColumnsPayment.find(col => col.dataField === 'Action').visible = isPaymentTransactionActionAvailable;
      const isPaymentTransactionActionVisible = [PhxConstants.PaymentReleaseBatchStatus.Draft].some(status => status === this.model.BatchStatusId);
      this.gridTransaction.grid.instance.columnOption(this.colDefsPaymentTransaction.action.dataField, 'visible', isPaymentTransactionActionVisible);
    });
  }

  fetchBankDetails() {
    this.organizationApiService.getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization(this.model.OrganizationIdInternal).subscribe(
      response => {
        if (response.BankAccounts !== null) {
          const items = response.BankAccounts;
          this.bankAccounts = _.chain(items)
            .filter((ba: any) => {
              return ba.CurrencyId === this.currencyId;
            })
            .map((value, key) => {
              return {
                id: value.Id,
                text: value.BankName,
                directDepositBatchNo: value.NextWireTransferBatchNumber,
                wireTransferBatchNo: value.NextWireTransferBatchNumber,
                chequeNo: value.NextChequeNumber,
                isPrimary: value.IsPrimary,
                fullBankName: value.BankName + '-' + value.Description
              };
            })
            .value();
          // $scope.model.bankAccounts = angular.copy($scope.bankAccounts);
        }
      },
      error => {
        throw error;
      }
    );
  }

  changeGridViewMode(mode: string) {
    this.gridViewMode = mode;
    setTimeout(() => {
      if (this.gridViewMode === 'payment') {
        this.gridPaymentDebouncer$.next();
      }
      if (this.gridViewMode === 'transaction') {
        this.gridTransactionDebouncer$.next();
      }
    });
  }

  protected discardPaymentBatch(onSuccess: (data: any) => void) {
    this.paymentService
      .removeDraftBatchPayment(this.batchId, this.batchDetailsModalFormData.bankId)
      .then(response => {
        onSuccess(this.batchId);
        this.router.navigate(['/next', 'payment', 'wiretransferbatch', 'searchbybankaccount', this.model.InternalOrganizationBankAccountId, this.currencyId]);
      })
      .catch(error => {
        console.log(error);
      });
  }

  protected finalizePaymentBatch(onSuccess: (data: any) => void, onError: (err: any) => void): void {
    this.loadingSpinnerService.show();
    this.paymentService
      .finalizeDraftBatchPayment(
        this.batchId,
        this.batchDetailsModalFormData.bankId,
        this.notifyName.NotifyName_BatchFinalize_OnError,
        this.notifyName.NotifyName_BatchFinalize_OnSuccess,
        this.notifyName.NotifyName_BatchFinalize_OnProcessing
      )
      .then(response => {
        this.commonService.logInfo('Finalizing in progress');
        const entityTypeId = PhxConstants.EntityType.PaymentReleaseBatch;
        this.workflowService.setWatchConfigOnWorkflowEvent('/next/', entityTypeId, entityTypeId, response.EntityId).then(() => {
          onSuccess(response);
          this.loadingSpinnerService.hide();
        });
      })
      .catch(error => {
        onError(error);
      });
  }

  protected removeAffectedItems(onSuccess: (data: any) => void, onError: (err: any) => void): void {
    if (this.batchGroupedByPayeeDialog.isVisible) {
      this.batchGroupedByPayeeDialog.hide();
    }
    this.loadingSpinnerService.show();
    this.paymentService
      .removeAffectedPayments(
        this.batchId,
        this.batchDetailsModalFormData.bankId,
        this.notifyName.NotifyName_BatchRemoveAffectedPayments_OnError,
        this.notifyName.NotifyName_BatchRemoveAffectedPayments_OnSuccess,
        this.notifyName.NotifyName_BatchRemoveAffectedPayments_OnProgress
      )
      .then(response => {
        this.commonService.logInfo('Affected payments removed.');
        onSuccess(this.batchId);
        this.loadingSpinnerService.hide();
        this.gridPayment.refresh();
      })
      .catch(error => {
        onError(error);
        this.loadingSpinnerService.hide();
        this.gridPayment.refresh();
      });
  }

  removeTransaction(event, payment) {
    const oPayment = this.getPaymentByTransactionNumber(event.data.PaymentTransactionNumber);
    payment = payment ? payment : oPayment;
    const paymentTransactions = payment && payment.PaymentTransactions;
    const dlg = this.dialogService.confirm('Discard Payment', 'Are you sure you want to discard payment transaction?');
    dlg.then(
      btn => {
        this.paymentService
          .removePaymentTransaction(event.data.Id, payment.Id, this.batchId, this.batchDetailsModalFormData.bankId)
          .then(response => {
            this.loadPaymentBatch();
            if (paymentTransactions && paymentTransactions.length > 1) {
              _.remove(paymentTransactions, { Id: event.data.Id });
              _.remove(this.transactions, { Id: event.data.Id });
              payment.Amount = paymentTransactions.reduce((acc, pt) => pt.Amount + acc, 0);
              event.component.refresh();

              this.gridTransaction.rebindDataSource();
              const self = this;
              setTimeout(function () {
                self.gridPayment.rebindDataSource();
                self.gridPayment.refresh();
              }, 0);
            } else {
              this.gridPayment.refresh();
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      btn => { }
    );
  }

  removePayment(payment) {
    const dlg = this.dialogService.confirm('Discard Payment', 'Are you sure you want to discard payment?');
    dlg.then(
      btn => {
        this.paymentService
          .removePayment(payment.Id, this.batchId, this.batchDetailsModalFormData.bankId)
          .then(response => {
            this.gridPayment.refresh();
            this.loadPaymentBatch();
          })
          .catch(error => {
            console.log(error);
          });
      },
      btn => { }
    );
  }

  recallPayment(item: any) {
    this.recallPaymentWithConfirmation(item).then(r => {
      this.loadPaymentBatch();
      this.gridPayment.refresh();
    })
      .catch(e => {

      });
  }

  onError_Batch_Finalize(data) {
    this.loadingSpinnerService.hide();
    this.batchGroupedByPayeeDialogData = data;
    this.batchGroupedByPayeeDialog.show();
  }

  onSuccess_Batch_Finalize(data) {
    this.commonService.logInfo('Batch finalized successfully.');
    this.router.navigate(['/next', 'payment', 'wiretransferbatch', 'searchbybankaccount', this.batchDetailsModalFormData.bankId, this.currencyId]);
  }

  onError_Batch_Deleted(data) {
    this.commonService.logError(data.Message);
    this.loadingSpinnerService.hide();
    this.router.navigate(['/next', 'payment', 'wiretransferbatch', 'searchbybankaccount', this.model.InternalOrganizationBankAccountId, this.currencyId]);
  }

  onActionClick(stateActionId) {
    const currentStateAction = this.codeValueService.getCodeValue(stateActionId, this.commonService.CodeValueGroups.StateAction);

    this.validationMessages = null;
    switch (currentStateAction.code) {
      case 'PaymentReleaseBatchDiscard':
        this.discardBatchWithConfirmation(currentStateAction);
        break;
      case 'PaymentReleaseBatchFinalize':
        this.finalizeBatchWithConfirmation(currentStateAction);
        break;
      case 'PaymentReleaseBatchChangeDetails':
        this.batchDetailsModalFormData = {
          bankId: this.model.InternalOrganizationBankAccountId,
          depositDate: this.model.DepositDate,
          garnisheeBankAccountId: this.model.GarnisheeBankAccountId
        };
        this.changeBatchDetailsModal.show();
        break;
      case 'PaymentReleaseBatchRecall':
          this.recallBatchWithConfirmation(currentStateAction).then(r => {
            this.router.navigate(['/next', 'payment', 'wiretransferbatch', 'searchbybankaccount', this.batchDetailsModalFormData.bankId, this.currencyId]);
          });
          break;
      case 'PaymentReleaseBatchTransferToBank':
          this.transferBatchWithConfirmation(currentStateAction).then(r => {
            this.loadPaymentBatch();
            this.gridPayment.refresh();
          });
          break;
      case 'PaymentReleaseBatchGenerateFile':
          window.location.assign(this.paymentService.getPaymentWTStream(this.batchId));
          break;
      default:
        break;
    }
  }

  onPaymentRowPrepared(event) {
    this.gridPaymentDebouncer$.next();
  }

  onDetailRowPrepared(event) {
    this.gridPaymentDebouncer$.next();
  }

  onTransactionRowPrepared(event) {
    this.gridTransactionDebouncer$.next();
  }
}
