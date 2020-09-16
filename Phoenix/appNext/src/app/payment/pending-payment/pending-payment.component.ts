import { PaymentService } from './../payment.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { Component, OnInit, Input, ViewChild, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import {
  PhxDataTableConfiguration,
  PhxDataTableColumn,
  PhxDataTableSummaryItem,
  PhxDataTableSummaryType,
  WorkflowAction,
  CodeValue,
  DialogResultType,
  PhxDataTableSelectionMode,
  PhxDataTableShowCheckboxesMode,
  ConcurrencyError
} from '../../common/model/index';
import { NavigationService } from '../../common/services/navigation.service';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import {
  CodeValueService,
  CommonService,
  WorkflowService,
  DialogService,
  ApiService,
  LoadingSpinnerService,
  PhxConstants
} from '../../common/index';
import { ChequeWorkflowActions, ChequeWorkflowComment } from '../share/index';
import { ChequeWorkflowCommentDialogComponent } from '../cheque-workflow-comment-dialog/cheque-workflow-comment-dialog.component';
import { PhxLocalizationService } from '../../common/services/phx-localization.service';
import { WindowRefService } from '../../common/index';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { PhxButton } from '../../common/model/phx-button';
import { AddToBatchComponent } from '../add-to-batch/add-to-batch.component';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

declare var oreq: any;

@Component({
  selector: 'app-pending-payment',
  templateUrl: './pending-payment.component.html',
  styleUrls: ['./pending-payment.component.less']
})
export class PendingPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: PhxDataTableComponent;
  @ViewChild('addToBatchModal') addToBatchModal: PhxModalComponent;
  @ViewChild('changePaymentMethodModal') changePaymentMethodModal: PhxModalComponent;
  @ViewChild('changePaymentReleaseDateModal') changePaymentReleaseDateModal: PhxModalComponent;
  @ViewChild('batchGroupedByPayeeDialog') batchGroupedByPayeeDialog: PhxModalComponent;
  @ViewChild('paymentMethodBatchGroupedByPayeeModal') paymentMethodBatchGroupedByPayeeModal: PhxModalComponent;
  @ViewChild('createChequesModal') createChequesModal: PhxModalComponent;
  @ViewChild('addToBatch') addToBatch: AddToBatchComponent;
  @ViewChild('createCheques') createCheques: AddToBatchComponent;
  isAlive: boolean = true;
  amountColumnFormat = { type: 'fixedPoint', precision: 2 };
  codeValueGroups: any;
  applicationConstants: any;
  dialogSubTitle: string = '';
  actionToExecute: WorkflowAction;
  organizationId?: number;
  methodId?: number;
  changePaymentMethodId?: number;
  paymentMethodId?: number;
  paymentTotal?: number = 0;
  currencyId?: number;
  paymentId: number;
  currencyCode: CodeValue;
  paymentMethodCode: CodeValue;
  bankName: string = '';
  organizationName: string = '';
  isDue: boolean = false;
  statusId: number;
  isPaymentStopped: boolean = false;
  dataSourceUrl: string = '';
  componentName: string = 'PendingPaymentComponent';
  codeValuesRateUnit: CodeValue[];
  bankAccounts: any[] = [];
  dateChangeMessage = '';
  amountSelected: number;
  selectedGarnisheePayToCount: number;
  garnisheeBankAccountId: number;
  paymentIdsToBatch: number[];
  addToBatchModalForm: any = {};
  createChequesForm: any = {};
  redirectAfterAddToBatch: boolean = false;
  batchGroupedByPayeeDialogData: any;
  isHiddenPaymentReleaseDateModalInfoBox: boolean = false;
  odataParams: string = oreq
    .request()
    .withExpand(['Units'])
    .withSelect([
      'Id',
      'PaymentTransactionNumber',
      'PaymentTransactionPayeeName',
      'PaymentSubtotal',
      'PaymentSalesTax',
      'PaymentTotal',
      'PaymentDate',

      'PayeeName',
      'PayeeOrganizationIdSupplier',
      'PayeeUserProfileWorkerId',

      'PlannedReleaseDate',
      'StartDate',
      'EndDate',
      'GarnisheePayToIds',

      'ClientCompany',
      'WorkerName',
      'WorkerProfileTypeId',
      'Units',
      'Units/Units',
      'Units/RateUnitId',
      'CurrencyId',
      'TransactionHeaderId',
      'WorkOrderId',
      'AssignmentId',
      'WorkOrderVersionId'
    ])
    .url();

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      dataType: 'number',
      sortIndex: 0,
      sortOrder: 'asc'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTransactionNumber',
      caption: 'Payment Transaction Number'
    }),
    new PhxDataTableColumn({
      dataField: 'PayeeName',
      caption: 'Payee'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentSubtotal',
      caption: 'Payment Subtotal',
      dataType: 'money',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentSalesTax',
      caption: 'Sales Tax',
      dataType: 'money',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'PaymentTotal',
      caption: 'Payment Total',
      dataType: 'money',
      alignment: 'right',
      cellTemplate: 'currencyTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'WorkerName',
      caption: 'Worker'
    }),
    new PhxDataTableColumn({
      dataField: 'WorkerProfileTypeId',
      caption: 'Profile',
      alignment: 'left',
      dataType: 'number',
      lookup: {
        dataSource: this.getProfileLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
    new PhxDataTableColumn({
      dataField: 'ClientCompany',
      caption: 'Client'
    }),
    new PhxDataTableColumn({
      dataField: 'StartDate',
      caption: 'From',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'EndDate',
      caption: 'To',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'PlannedReleaseDate',
      caption: 'Planned Release Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'unitsFormatted',
      caption: 'Units',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false
    })
  ];

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration(
    {
      enableExport: true,
      selectionMode: PhxDataTableSelectionMode.Multiple,
      showCheckBoxesMode: PhxDataTableShowCheckboxesMode.Always,
      pageSize: 100000,
    }
  );

  excludeCurrentPaymentMethod(item) {
    return item.id !== this.paymentMethodId && item.id !== PhxConstants.PaymentMethodType.FromPayeeProfile;
  }

  excludeCurrentPaymentMethodCallback = this.excludeCurrentPaymentMethod.bind(this);

  addToBatchModalButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Add',
      btnType: 'primary',
      disabled: (): boolean => {
        return !this.addToBatch.addToBatchForm.valid;
      },
      action: () => {
        this.addToBatchModal.hide();
        this.redirectAfterAddToBatch = false;

        this.ExecutePaymentTransactionAddToBatch();
      }
    },
    {
      icon: 'done',
      tooltip: 'Process',
      btnType: 'default',
      disabled: (): boolean => {
        return !this.addToBatch.addToBatchForm.valid;
      },
      action: () => {
        this.addToBatchModal.hide();
        this.redirectAfterAddToBatch = true;

        this.ExecutePaymentTransactionAddToBatch();
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        const gridInstance = this.grid.grid.instance;
        gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
        this.addToBatchModal.hide();
      }
    }
  ];
  changePaymentMethodModalButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Submit',
      btnType: 'default',
      disabled: (): boolean => {
        return !this.changePaymentMethodForm.valid;
      },
      action: () => {
        this.changePaymentMethodModal.hide();
        this.changePaymentMethodId = this.changePaymentMethodForm.controls['paymentMethodId'].value;
        this.transactionPaymentChangePaymentMethod();
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        const gridInstance = this.grid.grid.instance;
        gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
        this.changePaymentMethodModal.hide();
      }
    }
  ];

  changePaymentReleaseDateModalButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Submit',
      btnType: 'default',
      disabled: (): boolean => {
        return !this.changePaymentReleaseDateForm.valid;
      },
      action: () => {
        this.changePaymentReleaseDateModal.hide();
        this.transactionPaymentChangeReleaseDateOrPutOnHold();
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        const gridInstance = this.grid.grid.instance;
        gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
        this.changePaymentReleaseDateModal.hide();
      }
    }
  ];

  batchGroupedByPayeeDialogButtons: PhxButton[] = [
    {
      icon: 'clear',
      tooltip: 'Ok',
      btnType: 'default',
      action: () => {
        this.batchGroupedByPayeeDialog.hide();
        this.refreshPageOnPrivateEvent(this.batchGroupedByPayeeDialogData, true, null);
      }
    }
  ];

  changePaymentMethod: string;
  batchPreExecutionOnReleasedPaymentMethodChangedData: any;
  paymentMethodBatchGroupedByPayeeModalButtons: PhxButton[] = [
    {
      icon: 'clear',
      tooltip: 'Ok',
      btnType: 'primary',
      action: () => {
        this.paymentMethodBatchGroupedByPayeeModal.hide();
        this.refreshPageOnPrivateEvent(this.batchPreExecutionOnReleasedPaymentMethodChangedData, true, null);
      }
    }
  ];

  createChequesModalButtons: PhxButton[] = [
    {
      icon: 'done',
      tooltip: 'Create',
      btnType: 'primary',
      disabled: (): boolean => {
        return !this.createCheques.addToBatchForm.valid || !(this.createChequesForm.selectedBankAccount && this.createChequesForm.selectedBankAccount.chequeNo);
      },
      action: () => {
        this.createChequesModal.hide();
        this.ExecuteCreateChequesBatch();
      }
    },
    {
      icon: 'clear',
      tooltip: 'Cancel',
      btnType: 'default',
      action: () => {
        const gridInstance = this.grid.grid.instance;
        gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
        this.createChequesModal.hide();
      }
    }
  ];

  notifyName: any = {
    NotifyName_BatchOperation_OnException:
      this.componentName + 'NotifyName_BatchOperation_OnException',
    NotifyName_BatchOperation_OnBatchMarkered:
      this.componentName + 'NotifyName_BatchOperation_OnBatchMarkered',
    NotifyName_BatchOperation_OnPreExecutionException:
      this.componentName + 'NotifyName_BatchOperation_OnPreExecutionException',
    NotifyName_BatchOperation_OnReleased:
      this.componentName + 'NotifyName_BatchOperation_OnReleased',
    NotifyName_BatchThreadExecution_OnProcessing:
      this.componentName + 'NotifyName_BatchThreadExecution_OnProcessing',
    NotifyName_BatchPreExecution_OnReleased_DirectDeposit:
      this.componentName +
      'NotifyName_BatchPreExecution_OnReleased' +
      '_DirectDeposit',
    NotifyName_BatchPreExecution_OnReleased_WireTransfer:
      this.componentName +
      'NotifyName_BatchPreExecution_OnReleased' +
      '_WireTransfer',
    NotifyName_BatchPreExecution_OnReleased_Adp:
      this.componentName +
      'NotifyName_BatchPreExecution_OnReleased' +
      '_Adp',
    NotifyName_BatchPreExecution_OnReleased_Cheque:
      this.componentName +
      'NotifyName_BatchPreExecution_OnReleased' +
      '_Cheque',
    NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged:
      this.componentName +
      'NotifyName_BatchPreExecution_OnReleased' +
      '_PaymentMethodChanged',
    NotifyName_BatchOperation_OnPaymentResumed:
      this.componentName +
      'NotifyName_BatchOperation_OnPaymentResumed',
    // NotifyNameOnBatchThreadExecution:
    NotifyName_BatchThreadExecution_OnReleased:
      this.componentName + 'NotifyName_BatchThreadExecution_OnReleased'
  };
  unregisterList: any[] = [];
  ValidationMessages: any;
  //#region paymentmethodChange
  changePaymentMethodForm: FormGroup;
  changePaymentReleaseDateForm: FormGroup;
  //#endregion
  constructor(
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private router: Router,
    private codeValueService: CodeValueService,
    public commonService: CommonService,
    private workflowService: WorkflowService,
    private dialogService: DialogService,
    private organizationApiService: OrganizationApiService,
    private paymentService: PaymentService,
    private apiService: ApiService,
    private phxLocalizationService: PhxLocalizationService,
    private winRef: WindowRefService,
    private loadingSpinnerService: LoadingSpinnerService,
    private fb: FormBuilder,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.applicationConstants = this.commonService.ApplicationConstants;
  }

  ngOnInit() {
    this.codeValuesRateUnit = this.codeValueService.getCodeValues(
      this.codeValueGroups.RateUnit,
      true
    );
    this.route.params.first().subscribe(params => {
      this.organizationId = +params['orgId'];
      this.currencyId = +params['currencyId'];
      this.statusId = +params['statusId'];
      this.methodId = +params['methodId'];
      this.changePaymentMethodId = this.methodId;
      this.paymentMethodId = this.methodId;
      this.isDue = +params['dueId'] === 1;
      this.isPaymentStopped = this.route.routeConfig.path.includes('/stopped');
      this.currencyCode = this.codeValueService.getCodeValue(
        this.currencyId,
        this.codeValueGroups.Currency
      );
      this.paymentMethodCode = this.codeValueService.getCodeValue(
        this.methodId,
        this.codeValueGroups.PaymentMethodType
      );
      this.buildDataSourceUrl(
        this.organizationId,
        this.methodId,
        this.currencyId,
        this.statusId,
        this.isDue,
        this.isPaymentStopped
      );
      this.setTitle();
      this.organizationApiService.getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization(this.organizationId)
        .subscribe(response => {
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
                  directDepositBatchNo: value.NextDirectDepositBatchNumber,
                  wireTransferBatchNo: value.NextWireTransferBatchNumber,
                  chequeNo: value.NextChequeNumber,
                  isPrimary: value.IsPrimary,
                  description: value.BankName + '-' + value.Description
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
    });

    this.registerEvent();
    this.createPaymentMethodChangeForm();
    this.createPaymenReleaseDateChangeForm();
  }


  createPaymentMethodChangeForm() {
    this.changePaymentMethodForm = this.fb.group({
      paymentMethodId: ['', [Validators.required]],
    });
  }
  createPaymenReleaseDateChangeForm() {
    this.changePaymentReleaseDateForm = this.fb.group({
      statusId: ['', [Validators.required]],
      releaseDate: ['']
    });
    this.changePaymentReleaseDateForm.get('statusId').valueChanges.subscribe(val => {
      const dtReleaseDate: AbstractControl = this.changePaymentReleaseDateForm.get('releaseDate');
      if (val === 'releasedate') {
        dtReleaseDate.setValidators([Validators.required]);
      } else {
        dtReleaseDate.clearValidators();
      }
      dtReleaseDate.updateValueAndValidity();
    });
  }
  registerEvent() {
    this.apiService.OnConcurrencyError
      .takeWhile(() => this.isAlive)
      .subscribe((data: ConcurrencyError) => {
        if (data.TargetEntityTypeId === this.commonService.ApplicationConstants.EntityType.PaymentTransaction && data.TargetEntityId === 0) {
          this.loadingSpinnerService.hideAll();
          this.grid.refresh();
        }
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnException,
        (event, data) => {
          this.refreshPageOnPrivateEvent(data, true, 'Exception');
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
        (event, data) => {
          this.commonService.logSuccess('Pre process done, Starting Batch.');
          this.refreshPageOnPrivateEvent(data, true, null);
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnPreExecutionException,
        (event, data) => {
          this.refreshPageOnPrivateEvent(
            data,
            true,
            'On batch pre-validation:'
          );
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnPreExecuted,
        (event, data) => {
          this.refreshPageOnPrivateEvent(data, false, null);
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnReleased,
        (event, data) => {
          this.refreshPageOnPrivateEvent(
            data,
            false,
            data.CountAll !== data.CountExecutionSuccess
              ? 'Some items cannot be processed:'
              : null
          );
          this.onResponseSuccess(data);
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchPreExecution_OnReleased_DirectDeposit,
        (event, data) => {
          this.batchGroupedByPayeeDialogData = data;
          this.batchGroupedByPayeeDialog.show();
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchThreadExecution_OnProcessing,
        (event, data) => {
          if (data.CountFinishedWithSuccess !== data.CountTotal) {
            this.loadingSpinnerService.setProgressText(`${data.CountFinishedWithSuccess} of ${data.CountTotal} items processed.`);
          } else {
            this.loadingSpinnerService.setProgressText(`Saving Changes`);
          }
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchPreExecution_OnReleased_WireTransfer,
        (event, data) => {
          this.batchGroupedByPayeeDialogData = data;
          this.batchGroupedByPayeeDialog.show();
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchPreExecution_OnReleased_Adp,
        (event, data) => {
          this.batchGroupedByPayeeDialogData = data;
          this.batchGroupedByPayeeDialog.show();
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchPreExecution_OnReleased_Cheque,
        (event, data) => {
          this.batchGroupedByPayeeDialogData = data;
          this.batchGroupedByPayeeDialog.show();
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName
          .NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged,
        (event, data) => {
          this.batchPreExecutionOnReleasedPaymentMethodChangedData = data;
          this.changePaymentMethod = this.codeValueService.getCodeValueText(this.changePaymentMethodId, this.codeValueGroups.PaymentMethodType);
          this.paymentMethodBatchGroupedByPayeeModal.show();
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchOperation_OnPaymentResumed,
        (event, data) => {
          if (data.CountAll === data.CountExecutionSuccess) {
            this.commonService.logSuccess('Payment(s) resumed successfully');
            this.grid.refresh();
          } else {
            this.refreshPageOnPrivateEvent(data, false, 'Some items cannot be processed:');
          }
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
      });

    this.apiService
      .onPrivate(
        this.notifyName.NotifyName_BatchThreadExecution_OnReleased,
        (event, data) => {
          let responseMessage;
          this.loadingSpinnerService.hide();
          responseMessage = 'Batch added to draft.';
          if (data.ReferenceCommandName === 'ProcessBatchPaymentTransactionsForDirectDepositState') {
            if (this.redirectAfterAddToBatch && data.TargetEntityTypeId === this.commonService.ApplicationConstants.EntityType.PaymentReleaseBatch && data.TargetEntityId) {
              this.router.navigate(['directdepositbatch', this.organizationId, this.currencyId, 'details', data.TargetEntityId], { relativeTo: this.route.parent })
                .catch((err) => {
                  console.error(`error navigating to Payment Batch`, err);
                });
            }
          } else if (data.ReferenceCommandName === 'ProcessBatchPaymentTransactionsForWireTransferState') {
            if (this.redirectAfterAddToBatch && data.TargetEntityTypeId === this.commonService.ApplicationConstants.EntityType.PaymentReleaseBatch && data.TargetEntityId) {
              this.router.navigate(['wiretransferbatch', this.organizationId, this.currencyId, 'details', data.TargetEntityId], { relativeTo: this.route.parent })
                .catch((err) => {
                  console.error(`error navigating to Payment Batch`, err);
                });
            }
          } else if (data.ReferenceCommandName === 'ProcessBatchPaymentTransactionsForADPState') {
            if (this.redirectAfterAddToBatch && data.TargetEntityTypeId === this.commonService.ApplicationConstants.EntityType.PaymentReleaseBatch && data.TargetEntityId) {
              this.router.navigate(['adpbatch', this.organizationId, this.currencyId, 'details', data.TargetEntityId], { relativeTo: this.route.parent })
                .catch((err) => {
                  console.error(`error navigating to Payment Batch`, err);
                });
            }
          } else {
            responseMessage = 'An error occurred: Unknown ReferenceCommandName';
          }

          this.commonService.logSuccess(
            // 'Batch completed. To manage batch, go to the Manage Direct Deposit page'
            responseMessage
          );
        }
      )
      .then(unregister => {
        this.unregisterList.push(unregister);
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

  buildDataSourceUrl(
    organizationId?: number,
    methodId?: number,
    currencyId?: number,
    statusId?: number,
    isDue?: boolean,
    isPaymentStopped?: boolean
  ) {
    if (isPaymentStopped) {
      this.dataSourceUrl = `payment/getListStoppedPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId/organization/${organizationId}/currency/${currencyId}/method/${methodId}/due/${isDue ? 1 : 0}`;
    } else {
      this.dataSourceUrl = `payment/getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId/organization/${organizationId}/currency/${currencyId}/method/${methodId}/status/${this
        .statusId}/due/${isDue ? 1 : 0}`;
    }
  }

  dataReceived(data) {
    const rateUnits: any[] = [
      { id: 1, text: 'Hours' },
      { id: 2, text: 'Days' },
      { id: 3, text: 'Fixed' },
      { id: 0, text: '' }
    ];
    // must replace with this.codeValueService.getCodeValue(unit.RateUnitId, this.codeValueGroups.RateUnit).text , // case plural
    _.forEach(data, (item: any) => {
      if (item.Units) {
        const value = _.map(item.Units, (unit: any) => {
          return `${unit.Units} ${_.find(rateUnits, rateUnit => {
            return rateUnit.id === unit.RateUnitId || rateUnit.id === 0;
          }).text}`;
        });
        item.unitsFormatted = _.truncate((value || []).join(', '), {
          length: 35
        });
      }

    });
  }

  setTitle() {
    this.organizationApiService.getListOrganizationInternal(true)
      .subscribe((orgs) => {
        const internalOrg = _.find(orgs, (org: any) => {
          return org.Id === this.organizationId;
        });
        let header2 =
          this.statusId === this.commonService.ApplicationConstants.PaymentTransactionStatus.OnHold
            ? 'On Hold'
            : this.statusId === this.commonService.ApplicationConstants.PaymentTransactionStatus.PendingReview
              ? 'Ready for review'
              : this.isDue ? 'Ready for release' : 'Planned for release';
        if (this.isPaymentStopped) {
          header2 = 'Stopped';
        }
        this.navigationService.setTitle('payments-pending', [
          internalOrg.DisplayName,
          this.currencyCode.code || '',
          this.paymentMethodCode.text || '',
          this.phxLocalizationService.translate('payment.common.' + header2.replace(/\s/g, '').toLowerCase())
        ]);
      });
  }

  getProfileLookup() {
    return this.codeValueService
      .getCodeValues('usr.CodeProfileType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  selectedItemCount() {
    return (
      (this.grid &&
        this.grid.grid &&
        this.grid.grid.instance &&
        this.grid.grid.instance.getSelectedRowKeys().length) ||
      0
    );
  }

  allSelectedItemsAreCreditTransactions() {
    return (
      (this.grid &&
        this.grid.grid &&
        this.grid.grid.instance &&
        _.filter(this.grid.grid.instance.getSelectedRowsData(), (o: any) => {
          return o.PaymentTotal >= 0;
        }).length === 0
      )
    );
  }

  updateTotal() {
    this.paymentTotal = _.sumBy(
      this.grid.grid.instance.getSelectedRowsData(),
      (o: any) => {
        return o.PaymentTotal;
      }
    );
  }

  getPaymentTotal(selectedRows: any = this.grid.grid.instance.getSelectedRowsData()) {
    return _.sumBy(selectedRows, (o: any) => {
      return o.PaymentTotal;
    });
  }

  getSelectedGarnisheePayToCount(selectedRows: any = this.grid.grid.instance.getSelectedRowsData()) {
    let selectedGarnisheesPayTo: any;

    selectedGarnisheesPayTo = selectedRows.map(m => {
      return m.GarnisheePayToIds;
    }).reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);

    return Array.from(new Set(selectedGarnisheesPayTo)).length;
  }

  private getSelectedPaymentTransactionIds(selectedRows: any = this.grid.grid.instance.getSelectedRowsData()): number[] {
    const paymentTransactionIds = _.map(selectedRows, (item: any) => {
      return item.Id;
    });
    return paymentTransactionIds;
  }

  private getSelectedPaymentTransactionIdsExcludingCreditTransactions(selectedRows: any = this.grid.grid.instance.getSelectedRowsData()): number[] {
    const paymentTransactionIds = _.map(_.filter(selectedRows, (item: any) => { return item.PaymentTotal >= 0; }), (item: any) => {
      return item.Id;
    });
    return paymentTransactionIds;
  }

  private getNegativeTransactionsOfSelectedPayee() {
    const rows: any = this.grid.grid.instance.getDataSource().items();
    const selectedRows: any = this.grid.grid.instance.getSelectedRowsData();
    const includeRows: any = rows.filter(x =>
      (x.PayeeOrganizationIdSupplier != null ? selectedRows.some(item => item.PayeeOrganizationIdSupplier === x.PayeeOrganizationIdSupplier) : selectedRows.some(item => item.PayeeUserProfileWorkerId === x.PayeeUserProfileWorkerId))
      && ((x.PaymentTotal) <= 0 || selectedRows.some(item => item.Id === x.Id))
    );
    return includeRows;
  }

  public onRowClick(event: any) {
    event.isSelected = true;
  }

  transactionPaymentChangePaymentMethodShowDialog() {
    this.changePaymentMethodForm.patchValue({
      paymentMethodId: this.paymentMethodId
    }, { emitEvent: true });
    this.changePaymentMethodModal.show();
  }

  transactionPaymentChangePaymentMethod() {
    const self = this;

    const payload = {
      EntityIds: this.getSelectedPaymentTransactionIds(),
      NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
      NotifyName_BatchPreExecution_OnReleased: this.notifyName.NotifyName_BatchPreExecution_OnReleased_PaymentMethodChanged,
      PaymentMethodType: this.changePaymentMethodId,
    };

    return self.apiService.command('PaymentTransactionChangePaymentMethod', payload);
  }

  transactionPaymentChangeReleaseDateOrPutOnHoldShowDialog() {
    this.changePaymentReleaseDateForm.patchValue({
      statusId: null,
      releaseDate: null
    }, { emitEvent: true });
    this.isHiddenPaymentReleaseDateModalInfoBox = false;
    this.changePaymentReleaseDateModal.show();
  }

  transactionPaymentChangeReleaseDateOrPutOnHold() {
    const self = this;

    const changeOrHold: boolean = this.changePaymentReleaseDateForm.value.statusId === 'onhold';
    const plannedReleaseDate: Date = this.changePaymentReleaseDateForm.value.releaseDate;

    this.dateChangeMessage = (changeOrHold) ? 'Release Date(s) have been put on hold successfully' : 'Release Date(s) have been changed successfully';

    const payload = {
      EntityIds: this.getSelectedPaymentTransactionIdsExcludingCreditTransactions(),
      NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
      PlannedReleaseDate: null
    };

    if (!changeOrHold) {
      payload.PlannedReleaseDate = plannedReleaseDate;
    }

    return self.apiService.command('PaymentTransactionChangeReleaseDate', payload);
  }

  transactionPaymentSuppressRelease() {
    const self = this;
    const paymentTransactionIdsToBatch: number[] = this.getSelectedPaymentTransactionIds();

    this.dialogService
      .confirm(
        'Suppress Release',
        'Are you sure you want to suppress these payments?'
      )
      .then(
        btn => {
          const payload = {
            EntityIds: paymentTransactionIdsToBatch,
            NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased
          };

          return self.apiService.command('PaymentTransactionSuppressRelease', payload);
        },
        btn => {
          const gridInstance = this.grid.grid.instance;
          gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
        }
      );
  }

  transactionPaymentAddToBatch() {
    const negativeTransactionsOfSelectedPayee = this.getNegativeTransactionsOfSelectedPayee();

    this.paymentIdsToBatch = this.getSelectedPaymentTransactionIds(negativeTransactionsOfSelectedPayee);
    this.amountSelected = this.getPaymentTotal(negativeTransactionsOfSelectedPayee);
    this.selectedGarnisheePayToCount = this.getSelectedGarnisheePayToCount(negativeTransactionsOfSelectedPayee);

    this.addToBatch.loadPaymentBatch();
    if (this.methodId === PhxConstants.PaymentMethodType.ADP) {
      this.addToBatchModal.title = 'Add to ADP Batch';
    } else if (this.methodId === PhxConstants.PaymentMethodType.DirectDeposit) {
      this.addToBatchModal.title = 'Add to Direct Deposit Batch';
    } else if (this.methodId === PhxConstants.PaymentMethodType.WireTransfer) {
      this.addToBatchModal.title = 'Add to Wire Transfer Batch';
    }
    this.addToBatchModal.show();
  }

  ExecutePaymentTransactionAddToBatch() {
    const self = this;
    const payload = {
      NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
      NotifyName_BatchThreadExecution_OnProcessing: this.notifyName.NotifyName_BatchThreadExecution_OnProcessing,
      EntityIds: this.paymentIdsToBatch,
      BankId: this.addToBatchModalForm.selectedBankAccountId,
      OrganizationIdInternal: this.organizationId,
      DepositDate: this.addToBatchModalForm.depositDate,
      GarnisheeBankAccountId: this.addToBatchModalForm.garnisheeBankAccountId,
      PaymentMethodType: this.methodId
    };

    this.loadingSpinnerService.show();

    this.apiService.command('PaymentTransactionAddToBatch', payload).then(
      function (responseSuccess) {
        // self.onResponseSuccess(responseSuccess);
      },
      function (responseError) {
        self.onResponseError(responseError);
      });
  }

  onResponseError(responseError) {
    this.loadingSpinnerService.hide();
    this.commonService.logError(responseError.Message);
  }

  onResponseSuccess(responseSuccess) {
    let responseMessage;
    this.loadingSpinnerService.hide();
    responseMessage = 'Batch added to draft.';
    if (this.methodId === PhxConstants.PaymentMethodType.DirectDeposit) {
      if (this.redirectAfterAddToBatch) {
        this.router.navigate(['directdepositbatch', this.addToBatchModalForm.selectedBankAccountId, this.currencyId, 'details', responseSuccess.EntityId], { relativeTo: this.route.parent })
          .catch((err) => {
            console.error(`error navigating to Payment Batch`, err);
          });
      }
    } else if (this.methodId === PhxConstants.PaymentMethodType.WireTransfer) {
      if (this.redirectAfterAddToBatch) {
        this.router.navigate(['wiretransferbatch', this.addToBatchModalForm.selectedBankAccountId, this.currencyId, 'details', responseSuccess.EntityId], { relativeTo: this.route.parent })
          .catch((err) => {
            console.error(`error navigating to Payment Batch`, err);
          });
      }
    } else if (this.methodId === PhxConstants.PaymentMethodType.ADP) {
      if (this.redirectAfterAddToBatch) {
        this.router.navigate(['adpbatch', this.addToBatchModalForm.selectedBankAccountId, this.currencyId, 'details', responseSuccess.EntityId], { relativeTo: this.route.parent })
          .catch((err) => {
            console.error(`error navigating to Payment Batch`, err);
          });
      }
    } else if (this.methodId === PhxConstants.PaymentMethodType.Cheque) {
      responseMessage = 'Cheque added to print queue successfully.';
    } else {
      responseMessage = 'An error occurred: Unknown ReferenceCommandName';
    }

    this.commonService.logSuccess(
      // 'Batch completed. To manage batch, go to the Manage Direct Deposit page'
      responseMessage
    );
  }

  ExecuteCreateChequesBatch() {
    const self = this;
    const paymentTransactionIdsToBatch: number[] = this.getSelectedPaymentTransactionIds();

    const payload = {
      EntityIds: paymentTransactionIdsToBatch,
      NotifyName_BatchPreExecution_OnReleased: this.notifyName.NotifyName_BatchPreExecution_OnReleased_Cheque,
      NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
      BankId: this.createChequesForm.selectedBankAccountId,
      PaymentMethodTypeId: this.commonService.ApplicationConstants.PaymentMethodType.Cheque,
      GarnisheeBankAccountId: this.createChequesForm.garnisheeBankAccountId,
    };

    return self.apiService.command('PaymentTransactionCreateCheques', payload);
  }

  transactionPaymentChequesToPrint() {
    this.amountSelected = this.getPaymentTotal();
    this.selectedGarnisheePayToCount = this.getSelectedGarnisheePayToCount();

    this.createCheques.loadPaymentBatch();
    this.createChequesModal.show();
  }

  transactionPaymentResume() {
    const self = this;
    const paymentTransactionIdsToBatch: number[] = this.getSelectedPaymentTransactionIds();

    this.dialogService
      .confirm(
        'Resume Payments',
        'Are you sure you want to Resume these payments?'
      )
      .then(
        btn => {
          const payload = {
            EntityIds: paymentTransactionIdsToBatch,
            NotifyName_BatchPreExecution_OnReleased: this.notifyName.NotifyName_BatchPreExecution_OnReleased_Cheque,
            NotifyName_BatchOperation_OnReleased: this.notifyName.NotifyName_BatchOperation_OnReleased,
          };

          return self.apiService.command('PaymentTransactionResumePayment', payload);
        },
        btn => { }
      );
  }

  private refreshPageOnPrivateEvent(data, toCallServer, message) {
    const newLine: string = '<br/>';
    if (
      message !== null &&
      typeof data.CountAll !== 'undefined' &&
      data.CountAll !== null &&
      typeof data.CountExecutionSuccess !== 'undefined' &&
      data.CountExecutionSuccess !== null
    ) {
      if (data.CountExecutionSuccess > 0) {
        message =
          message +
          newLine +
          data.CountExecutionSuccess +
          ' of ' +
          data.CountAll +
          ' items processed';
      }
      if (data.CountAll - data.CountExecutionSuccess > 0) {
        message =
          message +
          newLine +
          (data.CountAll - data.CountExecutionSuccess) +
          ' of ' +
          data.CountAll +
          ' items not processed';
      }

      if (data.CountAll === data.CountExecutionSuccess) {
        this.commonService.logSuccess(message);
      } else {
        this.commonService.logError(message);
      }
    }

    if (
      typeof data.ValidationMessages !== 'undefined' &&
      data.ValidationMessages &&
      Object.keys(data.ValidationMessages).length !== 0
    ) {
      this.ValidationMessages = data;
    }
    const gridInstance = this.grid.grid.instance;

    gridInstance.deselectRows(gridInstance.getSelectedRowKeys());
    this.grid.refresh();
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [{
        text: this.phxLocalizationService.translate('payment.transaction.openTransactionNewTab'),
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/transaction/${event.row.data.TransactionHeaderId}/${PhxConstants.TransactionNavigationName.summary}`);
        }
      }];

      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: this.phxLocalizationService.translate('payment.transaction.openWorkOrderNewTab'),
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
          }
        });
      }
    }
  }

}
