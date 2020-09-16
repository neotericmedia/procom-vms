// angular
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { forEach, find, filter, first, remove, cloneDeep, findIndex } from 'lodash';
import * as moment from 'moment';
// common
import { NavigationService } from './../../common/services/navigation.service';
import { CustomFieldService, PhxConstants, CommonService } from '../../common';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { NavigationBarItem } from '../../common/model';
import { CodeValueService } from '../../common/services/code-value.service';
import { HashModel } from '../../common/utility/hash-model';
// transaction
import { TransactionObservableService } from '../state/transaction.observable.service';
import { TransactionService } from './../transaction.service';
import { FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { TransactionHeaderComponent } from './../transaction-header/transaction-header.component';
import { TransactionDetailsComponent } from './../transaction-detail/transaction-detail.component';
import { TransactionAction, ITransactionHeader, IFormGroupSetup, IHeader, IDetails, IRoot, IRouterState as IRouterStateResult } from '../state';
import { TransactionWorkflowComponent } from '../transaction-workflow/transaction-workflow.component';
import { TransactionBillingDocumentsComponent } from '../transaction-billing-documents/transaction-billing-documents.component';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html'
})
export class TransactionComponent extends BaseComponentActionContainer implements OnInit, OnDestroy {
  formGroupSetup: IFormGroupSetup;
  rootFormGroup: FormGroup<IRoot>;
  transaction: ITransactionHeader;
  stateActions: any;
  html: {
    navigationBarContent: Array<NavigationBarItem>;
    phxConstants: any;
    validationMessages: any;
    codeValueLists: {};
    commonLists: {};
    list: {
    };
    access: {};
  } = {
      navigationBarContent: null,
      phxConstants: PhxConstants,
      validationMessages: null,
      codeValueLists: {},
      commonLists: {},
      list: {
      },
      access: {}
    };
  actionButton = {
    show: {
      transactionSave: false,
      transactionSubmit: false,
      TransactionHeaderManualDiscard: false,
      transactionLineAdd: false,
      transactionLineRemove: false,
      transactionPOAdd: false,
      transactionPOLink: false,
      transactionPOChange: false,
      transactionPORemove: false,
      transactionPoNavigation: false
    }
  };
  routerState: IRouterStateResult = null;
  routerParams: any;
  codeValueGroups: any;
  readOnlyStorage: any;

  @ViewChild(TransactionWorkflowComponent) transactionWorkflow: TransactionWorkflowComponent;
  constructor(
    private navigationService: NavigationService,
    private transactionObservableService: TransactionObservableService,
    private customFieldService: CustomFieldService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private transactionService: TransactionService,
    private formBuilder: FormBuilder
  ) {
    super();
    // console.log(this.constructor.name + '.constructor');
    this.navigationService.setTitle('Transaction', 'icon organization-edit');
    this.html.phxConstants = PhxConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  _initStateActions() {
    this.stateActions = [
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransaction,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || this.transaction.TransactionTypeId === PhxConstants.TransactionType.Advance
          || this.transaction.TransactionTypeId === PhxConstants.TransactionType.Adjustment
          || this.transaction.TransactionTypeId === PhxConstants.TransactionType.VacationPayment
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdjustment,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || (this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Adjustment
            && this.transaction.TransactionTypeId !== PhxConstants.TransactionType.VacationPayment)
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitTimeSheet,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || (this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Timesheet)
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendTimeSheetToException,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || (this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Timesheet)
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndAdvance,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Advance
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndUnsubmitExpenseClaim,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Expense
      },
      {
        actionId: PhxConstants.StateAction.TransactionHeaderReverseTransactionAndSendExpenseClaimToException,
        onClick: (event) => this.onClickStateAction(event.actionId),
        hiddenFn: () => !this.transaction
          || this.transaction.TransactionTypeId !== PhxConstants.TransactionType.Expense
      }
    ];
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.stateService.dispatchOnAction(new TransactionAction.TransactionDelete(this.transaction.Id));
  }

  ngOnInit(): void {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        // console.log(this.constructor.name + '.routerStateResult.location: ' + routerStateResult.location);
        if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.summary)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.summary);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.detail)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.detail);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.notes)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.notes);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.billingdocuments)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.billingdocuments);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.workflow)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.workflow);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.invoices)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.invoices);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.payments)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.payments);
        } else if (routerStateResult.location.includes(PhxConstants.TransactionNavigationName.vmsrecord)) {
          this.setRouterState(routerStateResult, PhxConstants.TransactionNavigationName.vmsrecord);
        }
        this.routerParams = routerStateResult.params;
        return this.routerParams.transactionHeaderId ? this.transactionObservableService.tranaction$(this, this.routerParams) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((transaction: any) => {
        if (transaction) {
          this.transaction = transaction;
          this.html.navigationBarContent = this.navigationBarContentSetup();

          if (transaction.isTransactionCalculation) {
            this.getGroupedTransactionLineByNumber();
            this.transactionHeaderManualCalculation();
          }
          // else if (transaction.IsDebounce) {
          //   this.transactionHeaderManualCalculation();
          // }
          this.formBuilderGroupSetup(this.transaction);
          this.showToRecalc();
        }
      });

    this._initStateActions();
  }

  setRouterState(routerStateResult: IRouterState, WorkorderNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.workOrderId,
      RouterPath: WorkorderNavigationName,
      Url: routerStateResult.location
    };
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/transaction/${this.routerParams.transactionHeaderId}/`;
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: this.transaction.IsDraft,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.summary,
        Path: path + PhxConstants.TransactionNavigationName.summary,
        DisplayText: 'Summary'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.detail,
        Path: path + PhxConstants.TransactionNavigationName.detail,
        DisplayText: 'Detail'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.notes,
        Path: path + PhxConstants.TransactionNavigationName.notes,
        DisplayText: 'Notes'
      },
      {
        Id: 4,
        IsDefault: false,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.billingdocuments,
        Path: path + PhxConstants.TransactionNavigationName.billingdocuments,
        DisplayText: 'Billing Documents'
      },
      {
        Id: 7,
        IsDefault: false,
        IsHidden: this.transaction.TransactionTypeId !== PhxConstants.TransactionType.VmsTimesheet,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.vmsrecord,
        Path: path + PhxConstants.TransactionNavigationName.vmsrecord,
        DisplayText: 'VMS Record'
      },
      {
        Id: 5,
        IsDefault: false,
        IsHidden: this.transaction.IsDraft,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.workflow,
        Path: path + PhxConstants.TransactionNavigationName.workflow,
        DisplayText: 'Workflow'
      },
      {
        Id: 6,
        IsDefault: false,
        IsHidden: this.transaction.IsDraft,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.invoices,
        Path: path + PhxConstants.TransactionNavigationName.invoices,
        DisplayText: 'Invoices'
      },
      {
        Id: 7,
        IsDefault: false,
        IsHidden: this.transaction.IsDraft,
        Valid: true,
        Name: PhxConstants.TransactionNavigationName.payments,
        Path: path + PhxConstants.TransactionNavigationName.payments,
        DisplayText: 'Payments'
      }
    ];
  }

  canShowTransaction() {
    return this.transaction && this.transaction.TransactionCalculation &&
          this.routerState.RouterPath !== this.html.phxConstants.TransactionNavigationName.notes &&
          this.routerState.RouterPath !== this.html.phxConstants.TransactionNavigationName.billingdocuments &&
          this.routerState.RouterPath !== this.html.phxConstants.TransactionNavigationName.vmsrecord &&
          this.routerState.RouterPath !== this.html.phxConstants.TransactionNavigationName.workflow;
  }

  transactionHeaderManualCalculation(recalculate: boolean = false) {
    const currencyList = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.transaction.CurrencyCode = (this.transaction.BillingTransactions.length > 0 && this.transaction.BillingTransactions[0].CurrencyId) ? find(currencyList, currency => {
      return currency.id === this.transaction.BillingTransactions[0].CurrencyId;
    }).code : null;
    let command: any = {};
    let transaction = this.formatTransaction();

    command = { TransactionHeader: transaction, Recalculate: this.transaction.IsDraft && recalculate };

    transaction = this.validateRate(transaction);
    this.transactionService.transactionHeaderManualCalculation(command);

    this.getTransactionHeaderManualCalculation();
  }

  validateRate(transaction) {
    transaction.BillingTransactions.forEach((billingTransaction, i) => {
      billingTransaction.BillingTransactionLines.forEach((billingTransactionLines, j) => {
        if (!transaction.BillingTransactions[i].BillingTransactionLines[j].Rate) {
          delete transaction.BillingTransactions[i].BillingTransactionLines[j].Rate;
        } else if (!transaction.BillingTransactions[i].BillingTransactionLines[j].Units) {
          delete transaction.BillingTransactions[i].BillingTransactionLines[j].Units;
        }
      });
    });
    transaction.PaymentTransactions.forEach((paymentTransactions, i) => {
      paymentTransactions.PaymentTransactionLines.forEach((paymentTransactionLines, j) => {
        if (!transaction.PaymentTransactions[i].PaymentTransactionLines[j].Rate) {
          delete transaction.PaymentTransactions[i].PaymentTransactionLines[j].Rate;
        } else if (!transaction.PaymentTransactions[i].PaymentTransactionLines[j].Units) {
          delete transaction.PaymentTransactions[i].PaymentTransactionLines[j].Units;
        }
      });
    });
    return transaction;
  }

  getTransactionHeaderManualCalculation() {
    this.transactionService.getTransactionHeaderManualCalculation().then((response: any) => {
      console.log('__________________Calculation started__________________');
      this.transaction['TransactionCalculation'] = response;
      if (this.transaction.IsDraft) {
        if (response.Billings.length > 0 && response.Billings[0] && response.Billings[0].BillingTransactionLineSalesTaxes) {
          forEach(response.Billings[0].BillingTransactionLineSalesTaxes, value => {
            if (value.SalesTaxId === PhxConstants.SalesTaxType.GSTHST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxGSTHST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.QST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxQST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.PST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxPST = value.Rate;
            }
          });
        }
        if (response.Payments.length > 0 && response.Payments[0] && response.Payments[0].PaymentTransactionLineSalesTaxes) {
          forEach(response.Payments[0].PaymentTransactionLineSalesTaxes, value => {
            if (value.SalesTaxId === PhxConstants.SalesTaxType.GSTHST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxGSTHST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.QST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxQST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.PST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxPST = value.Rate;
            }
          });
        }
        const firstPaymentTransaction: any = first(this.transaction && this.transaction.PaymentTransactions);
        const statLines = firstPaymentTransaction && firstPaymentTransaction.PaymentTransactionLines ? remove(firstPaymentTransaction.PaymentTransactionLines, { RateTypeId: PhxConstants.RateType.Stat }) : [];

        forEach(response.Payments, line => {
          if (line.RateTypeId === PhxConstants.RateType.Stat) {
            let foundLine = find(statLines, (statLine: any) => {
              return moment(statLine.Date).isSame(line.Date, 'day');
            });

            if (foundLine) {
              foundLine = { ...foundLine, ...line };
            }
            firstPaymentTransaction.PaymentTransactionLines.push(foundLine ? foundLine : line);
            return;
          }

          if (typeof this.transaction.GroupedTransactionLinesByLineNumber.find(a => a.LineNumber === line.LineNumber) !== 'undefined') {
            const index = this.transaction.GroupedTransactionLinesByLineNumber.findIndex(a => a.LineNumber === line.LineNumber);
            if (index !== -1) {
              const payIndex = this.transaction.GroupedTransactionLinesByLineNumber[index].Payments.findIndex(a => a.Id === line.Id);
              if (payIndex !== -1) {
                this.transaction.GroupedTransactionLinesByLineNumber[index].Payments[payIndex] = {
                  ...this.transaction.GroupedTransactionLinesByLineNumber[index].Payments[payIndex],
                  ...line
                };
              }
            }
          }
          forEach(this.transaction.PaymentTransactions, (tr, i) => {
            forEach(tr.PaymentTransactionLines, (pl, j) => {
              if (pl.Id === line.Id) {
                this.transaction.PaymentTransactions[i].PaymentTransactionLines[j] = {
                  ...this.transaction.PaymentTransactions[i].PaymentTransactionLines[j],
                  ...line
                };
              }
            });
          });
        });

        forEach(response.Billings, line => {
          if (typeof this.transaction.GroupedTransactionLinesByLineNumber.find(a => a.LineNumber === line.LineNumber) !== 'undefined') {
            const index = this.transaction.GroupedTransactionLinesByLineNumber.findIndex(a => a.LineNumber === line.LineNumber);
            if (index !== -1) {
              const bilIndex = this.transaction.GroupedTransactionLinesByLineNumber[index].Billings.findIndex(a => a.Id === line.Id);
              if (bilIndex !== -1) {
                this.transaction.GroupedTransactionLinesByLineNumber[index].Billings[bilIndex] = {
                  ...this.transaction.GroupedTransactionLinesByLineNumber[index].Billings[bilIndex],
                  ...line
                };
              }
            }
          }
          forEach(this.transaction.BillingTransactions, (tr, i) => {
            forEach(tr.BillingTransactionLines, (bl, j) => {
              if (bl.Id === line.Id) {
                this.transaction.BillingTransactions[i].BillingTransactionLines[j] = {
                  ...this.transaction.BillingTransactions[i].BillingTransactionLines[j],
                  ...line
                };
              }
            });
          });
        });
      } else {
        if (response.Billings.length > 0 && response.Billings[0] && response.Billings[0].BillingTransactionLineSalesTaxes) {
          forEach(response.Billings[0].BillingTransactionLineSalesTaxes, value => {
            if (value.SalesTaxId === PhxConstants.SalesTaxType.GSTHST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxGSTHST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.QST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxQST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.PST) {
              this.transaction.TransactionCalculation.BillRate_SalesTaxPST = value.Rate;
            }
          });
        }
        if (response.Payments.length > 0 && response.Payments[0] && response.Payments[0].PaymentTransactionLineSalesTaxes) {
          forEach(response.Payments[0].PaymentTransactionLineSalesTaxes, value => {
            if (value.SalesTaxId === PhxConstants.SalesTaxType.GSTHST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxGSTHST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.QST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxQST = value.Rate;
            } else if (value.SalesTaxId === PhxConstants.SalesTaxType.PST) {
              this.transaction.TransactionCalculation.PaymentRate_SalesTaxPST = value.Rate;
            }
          });
        }
        forEach(response.Payments, line => {
          forEach(this.transaction.PaymentTransactions, (ptrans, i) => {
            const payIndex = ptrans.PaymentTransactionLines.findIndex(a => a.Id === line.Id);
            if (payIndex !== -1) {
              this.transaction.PaymentTransactions[i].PaymentTransactionLines[payIndex] = {
                ...this.transaction.PaymentTransactions[i].PaymentTransactionLines[payIndex],
                ...line,
                ShowToolTip: false
              };
            }
          });
        });

        forEach(response.Billings, line => {
          forEach(this.transaction.BillingTransactions, (btrans, j) => {
            const billIndex = btrans.BillingTransactionLines.findIndex(a => a.Id === line.Id);
            if (billIndex !== -1) {
              this.transaction.BillingTransactions[j].BillingTransactionLines[billIndex] = {
                ...this.transaction.BillingTransactions[j].BillingTransactionLines[billIndex],
                ...line,
                ShowToolTip: false
              };
            }
          });
        });

        forEach(this.transaction.BillingTransactions, (billingTransaction) => {
          billingTransaction.CurrencyCode = this.codeValueService.getCodeValue(billingTransaction.CurrencyId, this.codeValueGroups.Currency).code;
        });
        forEach(this.transaction.PaymentTransactions, paymentTransaction => {
          paymentTransaction.CurrencyCode = this.codeValueService.getCodeValue(paymentTransaction.CurrencyId, this.codeValueGroups.Currency).code;
        });
        if (this.transaction.BillingTransactions.length > 0) {
          this.transaction.CurrencyCode = this.transaction.BillingTransactions[0].CurrencyCode;
        } else if (this.transaction.PaymentTransactions.length > 0) {
          this.transaction.CurrencyCode = this.transaction.PaymentTransactions[0].CurrencyCode;
        }
        this.transaction.IsPaymentStopped = findIndex(this.transaction.PaymentTransactions, 'IsPaymentStopped') !== -1;
      }
      this.stateService.dispatchOnAction(
        new TransactionAction.TransactionUpdate({
          ...this.transaction,
          isTransactionCalculation: false,
          IsDebounce: false
        })
      );
    });
  }

  getGroupedTransactionLineByNumber() {
    this.transaction.GroupedTransactionLinesByLineNumber = [];
    const rateTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.RateType, true);
    forEach(this.transaction.BillingTransactions, billingTransaction => {
      forEach(billingTransaction.BillingTransactionLines, billingTransactionLine => {
        if (!this.transaction.GroupedTransactionLinesByLineNumber.find(a => a.LineNumber === billingTransactionLine.LineNumber)) {
          const data = {
            LineNumber: billingTransactionLine.LineNumber,
            RateTypeId: billingTransactionLine.RateTypeId,
            RateTypeList: filter(rateTypeList, rateType => {
              return (
                rateType.id === PhxConstants.RateType.Other ||
                find(billingTransactionLine.VersionRates, versionRate => {
                  return versionRate.RateTypeId === rateType.id;
                })
              );
            }),
            Billings: [],
            Payments: []
          };
          this.transaction.GroupedTransactionLinesByLineNumber.push(data);
        }
        const index = this.transaction.GroupedTransactionLinesByLineNumber.findIndex(a => a.LineNumber === billingTransactionLine.LineNumber);
        if (index !== -1) {
          this.transaction.GroupedTransactionLinesByLineNumber[index].Billings.push({
            Id: billingTransactionLine.Id,
            TransactionLine: billingTransactionLine,
            Hours: billingTransactionLine.Hours,
            OrganizationIdClient: billingTransaction.OrganizationIdClient,
            OrganizationClientDisplayName: billingTransaction.OrganizationClientDisplayName,
            OrganizationIdInternal: billingTransaction.OrganizationIdInternal,
            OrganizationInternalLegalName: billingTransaction.OrganizationInternalLegalName,
            VersionRates: billingTransactionLine.VersionRates,
            SubdivisionId: billingTransactionLine.SubdivisionId,
            CurrencyId: billingTransaction.CurrencyId
          });
        }
      });
    });

    forEach(this.transaction.PaymentTransactions, paymentTransaction => {
      forEach(paymentTransaction.PaymentTransactionLines, paymentTransactionLine => {
        if (paymentTransactionLine.RateTypeId !== PhxConstants.RateType.Stat) {
          const index = this.transaction.GroupedTransactionLinesByLineNumber.findIndex(a => a.LineNumber === paymentTransactionLine.LineNumber);
          if (index !== -1) {
            this.transaction.GroupedTransactionLinesByLineNumber[index].Payments.push({
              Id: paymentTransactionLine.Id,
              TransactionLine: paymentTransactionLine,
              Hours: paymentTransactionLine.Hours,
              RateTypeId: paymentTransactionLine.RateTypeId,
              PayeeName: paymentTransaction.PayeeName,
              PayeeOrganizationIdSupplier: paymentTransaction.PayeeOrganizationIdSupplier,
              PayeeUserProfileWorkerId: paymentTransaction.PayeeUserProfileWorkerId,
              VersionRates: paymentTransactionLine.VersionRates,
              SubdivisionId: paymentTransactionLine.SubdivisionId,
              CurrencyId: paymentTransaction.CurrencyId
            });
          }
        }
      });
    });
  }

  onClickStateAction(event) {
    const transaction = this.formatTransaction();
    this.transactionWorkflow.onClickStateAction(event, transaction);
  }

  formBuilderGroupSetup(transaction: any) {
    this.rootFormGroup = this.formGroupSetup.formBuilder.group<IRoot>({
      Id: [transaction.Id],
      Header: TransactionHeaderComponent.formBuilderGroupSetup(this.formGroupSetup, transaction),
      Details: TransactionDetailsComponent.formBuilderGroupSetup(this.formGroupSetup, transaction),
      IsDebounce: [transaction.IsDebounce]
    });
  }

  showToRecalc() {
    this.actionButton.show.transactionSave = true;
    this.actionButton.show.transactionSubmit = true;
    this.actionButton.show.TransactionHeaderManualDiscard = true;
    this.actionButton.show.transactionLineAdd = true;
    this.actionButton.show.transactionLineRemove = true;
    this.actionButton.show.transactionPOAdd = this.transaction.BillingTransactions.length > 0 && (this.transaction.BillingTransactions[0].PurchaseOrderLineId === null || this.transaction.BillingTransactions[0].PurchaseOrderLineId === 0);
    this.actionButton.show.transactionPOLink = this.transaction.BillingTransactions.length > 0 && (this.transaction.BillingTransactions[0].PurchaseOrderLineId !== null && this.transaction.BillingTransactions[0].PurchaseOrderLineId > 0);
    this.actionButton.show.transactionPOChange = !this.actionButton.show.transactionPOAdd;
    this.actionButton.show.transactionPORemove = !this.actionButton.show.transactionPOAdd;
    this.actionButton.show.transactionPoNavigation = false;
  }

  addOrRemoveTransactionLines(event: any) {
    const transaction = this.formatTransaction();
    if (event.status === 'TransactionAddLine') {
      this.transactionWorkflow.onClickStateAction(
        // this.transaction.WorkflowAvailableActions.find(a => a.CommandName === PhxConstants.CommandNamesSupportedByUi.TransactionHeaderAddLine),
        PhxConstants.StateAction.TransactionHeaderAddTransactionLine,
        transaction);
    } else if (event.status === 'POLineAdd' || event.status === 'PORemove') {
      if (transaction.BillingTransactions.length > 0) {
        transaction.BillingTransactions[0].PurchaseOrderLineId = event.PurchaseOrderLineId;
      }
      this.transactionWorkflow.onClickStateAction(
        PhxConstants.StateAction.TransactionHeaderSave,
        transaction);
    } else if (event.status === 'TransactionRemoveLine') {
      TransactionWorkflowComponent.lineNumber = event.lineNumber;
      this.transactionWorkflow.onClickStateAction(
        PhxConstants.StateAction.TransactionHeaderDiscardTransactionLine,
        transaction);
    }
  }

  manualActionClick(action: PhxConstants.StateAction) {
    const transaction = this.formatTransaction();
    this.transactionWorkflow.onClickStateAction(
      action,
      transaction);
  }

  formatTransaction() {
    const transaction = cloneDeep(this.transaction);
    delete transaction.GroupedTransactionLinesByLineNumber;
    delete transaction.TransactionCalculation;
    delete transaction.IsDebounce;
    return transaction;
  }

  onOutputEvent() {
    let transaction = cloneDeep(this.transaction);
    transaction.isTransactionCalculation = false;
    transaction.IsDebounce = this.rootFormGroup && this.rootFormGroup.controls.IsDebounce.value;
    transaction = TransactionHeaderComponent.formGroupToPartial(transaction, <FormGroup<IHeader>>this.rootFormGroup.controls.Header);
    transaction = TransactionDetailsComponent.formGroupToPartial(transaction, <FormGroup<IDetails>>this.rootFormGroup.controls.Details);
    transaction = TransactionBillingDocumentsComponent.formGroupToPartial(transaction);
    this.stateService.dispatchOnAction(
      new TransactionAction.TransactionUpdate({
        ...transaction
      })
    );
  }

  public getValidationMessages(messages) {
    if (messages) {
      this.html.validationMessages = messages;
    } else {
      this.html.validationMessages = [];
    }
  }
}

