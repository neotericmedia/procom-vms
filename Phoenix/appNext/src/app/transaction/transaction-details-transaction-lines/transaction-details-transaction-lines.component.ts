// angular
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { forEach, find, cloneDeep, map, flatMap } from 'lodash';
import { Observable } from 'rxjs/Observable';
// common
import { PhxConstants, ValidationExtensions } from '../../common';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType, PhxFormControlLayoutType } from '../../common/model';
import { HashModel } from '../../common/utility/hash-model';
// transaction
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { TransactionObservableService } from './../state/transaction.observable.service';
import { ITransactionLines, IPayments, IBilling, IFormGroupSetup, ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-details-transaction-lines',
  templateUrl: './transaction-details-transaction-lines.component.html'
})
export class TransactionDetailsTransactionLinesComponent extends TransactionBaseComponentPresentational<ITransactionLines> implements OnInit {
  html: {
    lists: {
      rateTypeList: Array<any>;
      currencyList: Array<any>;
      rateUnitList: Array<any>;
    };
  } = {
      lists: {
        rateTypeList: [],
        currencyList: [],
        rateUnitList: []
      }
    };
  layoutType: any;
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
  formGroupSetup: IFormGroupSetup;
  groupedTransactionLinesByLineNumber: any;
  transaction: ITransactionHeader;
  @Input() worker: any;
  @Output() addOrRemoveTransactionLine = new EventEmitter();
  constructor(private transactionObservableService: TransactionObservableService) {
    super('TransactionHeaderComponent');
    this.excludedFields = ['Billings', 'Payments'];
    this.layoutType = PhxFormControlLayoutType;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  ngOnInit() {
    this.html.lists.currencyList = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.html.lists.rateTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.RateType, true);
    this.html.lists.rateUnitList = this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true);
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        this.groupedTransactionLinesByLineNumber = this.transaction.GroupedTransactionLinesByLineNumber;
        this.showToRecalc();
      }
    });
  }

  trackByFn(index: number) {
    return index;
  }

  additionalOnchanges(changes: SimpleChanges) {
    if (changes.inputFormGroup && changes.inputFormGroup.currentValue) {
      this.inputFormGroup = changes.inputFormGroup.currentValue;
      const BillingArray = this.inputFormGroup.controls.Billings as FormArray<IBilling>;
      const ObservableBillingArray = flatMap(BillingArray.controls, (billing: FormGroup<IBilling>, i) => {
        const transactionLine = billing.controls.TransactionLine as FormGroup<any>;
        return map(Object.keys(transactionLine.value), key => {
          return transactionLine.controls[key].valueChanges
            .distinctUntilChanged()
            .map(a => {
              return { name: key, container: 'Billings', index: i, value: a };
            })
            .debounceTime(300)
            .takeUntil(this.isDestroyed$);
        });
      });
      const PaymentArray = this.inputFormGroup.controls.Payments as FormArray<IPayments>;
      const ObservablePaymentArray = flatMap(PaymentArray.controls, (payment: FormGroup<IPayments>, j) => {
        const transactionLine = payment.controls.TransactionLine as FormGroup<any>;
        return map(Object.keys(transactionLine.value), (key, index) => {
          return transactionLine.controls[key].valueChanges
            .distinctUntilChanged()
            .map(a => {
              return { name: key, container: 'Payments', index: j, value: a };
            })
            .debounceTime(300)
            .takeUntil(this.isDestroyed$);
        });
      });
      Observable.merge(...ObservableBillingArray, ...ObservablePaymentArray).subscribe(obj => {
        this.businessRules(obj);
      });
    }
  }

  businessRules(obj: any) {
    if (obj.name === 'RateTypeId') {
      this.onChangeRateType();
    } else if (obj.name === 'Rate') {
      this.debounce();
    } else if (obj.container === 'Billings' && obj.name === 'Units') {
      obj.value = obj.value.replace(/^0+/, '');
      // this.onBillingUnitsChange(obj.index, obj.value);
    }
  }

  showToRecalc() {
    this.actionButton.show.transactionSave = true;
    this.actionButton.show.transactionSubmit = true;
    this.actionButton.show.TransactionHeaderManualDiscard = true;
    this.actionButton.show.transactionLineAdd = true;
    this.actionButton.show.transactionLineRemove = true;
    this.actionButton.show.transactionPOAdd = this.transaction.BillingTransactions[0].PurchaseOrderLineId === null || this.transaction.BillingTransactions[0].PurchaseOrderLineId === 0;
    this.actionButton.show.transactionPOLink = this.transaction.BillingTransactions[0].PurchaseOrderLineId !== null && this.transaction.BillingTransactions[0].PurchaseOrderLineId > 0;
    this.actionButton.show.transactionPOChange = !this.actionButton.show.transactionPOAdd;
    this.actionButton.show.transactionPORemove = !this.actionButton.show.transactionPOAdd;
    this.actionButton.show.transactionPoNavigation = false;
  }

  onChangeRateType() {
    let billings = cloneDeep(this.inputFormGroup.value.Billings);
    billings = map(billings, billing => {
      billing.TransactionLine.RateTypeId = this.inputFormGroup.value.RateTypeId;
      const rate =
        !this.inputFormGroup.value.RateTypeId || this.inputFormGroup.value.RateTypeId === PhxConstants.RateType.Other
          ? null
          : find(billing.VersionRates, versionRate => {
            return versionRate.RateTypeId === this.inputFormGroup.value.RateTypeId;
          });

      billing.TransactionLine.Rate = rate ? rate.Rate : 0;
      billing.TransactionLine.RateUnitId = rate ? rate.RateUnitId : null;
      return billing;
    });
    this.inputFormGroup.setControl('Billings', TransactionDetailsTransactionLinesComponent.bilingFormArray(this.formGroupSetup, billings, this.inputFormGroup.value.RateTypeId));

    let payments = cloneDeep(this.inputFormGroup.value.Payments);
    payments = map(payments, payment => {
      payment.TransactionLine.RateTypeId = this.inputFormGroup.value.RateTypeId;
      const rate = !this.inputFormGroup.value.RateTypeId || this.inputFormGroup.value.RateTypeId === PhxConstants.RateType.Other
        ? null : find(payment.VersionRates, versionRate => {
          return versionRate.RateTypeId === this.inputFormGroup.value.RateTypeId;
        });
      payment.TransactionLine.Rate = rate ? rate.Rate : 0;
      payment.TransactionLine.RateUnitId = rate ? rate.RateUnitId : null;

      if (this.inputFormGroup.value.RateTypeId === PhxConstants.RateType.Other) {
        const primaryRate = find(payment.VersionRates, versionRate => {
          if (this.inputFormGroup.value.RateTypeId === PhxConstants.RateType.Other) {
            return versionRate.RateTypeId === PhxConstants.RateType.Primary;
          }
        });

        payment.TransactionLine.IsApplyDeductions = primaryRate ? primaryRate.IsApplyDeductions : null;
        payment.TransactionLine.IsApplyVacation = primaryRate ? primaryRate.IsApplyVacation : null;
      } else {
        payment.TransactionLine.IsApplyDeductions = rate ? rate.IsApplyDeductions : null;
        payment.TransactionLine.IsApplyVacation = rate ? rate.IsApplyVacation : null;
      }
      return payment;
    });
    this.inputFormGroup.setControl('Payments', TransactionDetailsTransactionLinesComponent.paymentsFormArray(this.formGroupSetup, payments, this.inputFormGroup.value.RateTypeId));
    this.debounce(false);
  }

  onBillingDescriptionChange(index: number, newValue: string) {
    const billings = map(this.inputFormGroup.value.Billings, billing => {
      billing.TransactionLine.Description = newValue;
      return billing;
    });
    const oldValue = this.groupedTransactionLinesByLineNumber.find(a => a.LineNumber === +this.inputFormGroup.value.LineNumber).Billings[index];
    this.inputFormGroup.setControl('Billings', TransactionDetailsTransactionLinesComponent.bilingFormArray(this.formGroupSetup, billings, this.inputFormGroup.value.RateTypeId));
    const payments = map(this.inputFormGroup.value.Payments, payment => {
      if (!payment.TransactionLine.Description || payment.TransactionLine.Description.length === 0 || (oldValue && payment.TransactionLine.Description === oldValue.TransactionLine.Description)) {
        payment.TransactionLine.Description = newValue;
      }
      return payment;
    });
    oldValue.TransactionLine.Description = newValue;
    this.inputFormGroup.setControl('Payments', TransactionDetailsTransactionLinesComponent.paymentsFormArray(this.formGroupSetup, payments, this.inputFormGroup.value.RateTypeId));
    this.outputEvent.emit();
  }

  onBillingUnitsChange(index, newValue) {
    if (!newValue) {
      newValue = 0;
    }
    const billingTransactionLineUnitsOld: any = Number(this.groupedTransactionLinesByLineNumber.find(a => a.LineNumber === +this.inputFormGroup.value.LineNumber).Billings[index].TransactionLine.Units);
    const billingRateUnit = this.inputFormGroup.value.Billings[0].TransactionLine.RateUnitId;
    const hours = this.inputFormGroup.value.Billings[0].Hours;
    const billings = map(this.inputFormGroup.value.Billings, billing => {
      billing.TransactionLine.Units = newValue;
      return billing;
    });
      this.inputFormGroup.setControl('Billings', TransactionDetailsTransactionLinesComponent.bilingFormArray(this.formGroupSetup, billings, this.inputFormGroup.value.RateTypeId));
    const payments = map(this.inputFormGroup.value.Payments, payment => {
      const paymentRateUnit = payment.TransactionLine.RateUnitId;
      let paymentTransactionLineUnitsOld: any = null;
      if (billingRateUnit === paymentRateUnit || billingRateUnit === PhxConstants.RateUnit.Fixed || paymentRateUnit === PhxConstants.RateUnit.Fixed) {
        paymentTransactionLineUnitsOld = <any>parseFloat(billingTransactionLineUnitsOld).toFixed(2) / 1;
      } else {
        paymentTransactionLineUnitsOld = this.rateUnitConverter(paymentRateUnit, billingTransactionLineUnitsOld, hours);
      }
      payment.TransactionLine.Units = payment.TransactionLine.Units;
      if (!payment.TransactionLine.Units || payment.TransactionLine.Units === 0 || Number(payment.TransactionLine.Units) === paymentTransactionLineUnitsOld) {
        payment.TransactionLine.Units = this.bpUnitAdjuster(billingRateUnit, paymentRateUnit, <number>newValue, <number>hours);
      }
      return payment;
    });
    this.inputFormGroup.setControl('Payments', TransactionDetailsTransactionLinesComponent.paymentsFormArray(this.formGroupSetup, payments, this.inputFormGroup.value.RateTypeId));
    this.debounce();
  }

  onRateChange() {
    this.debounce();
  }

  onRateUnitChange() {
    this.debounce();
  }

  onPaymentUnitsChange(event, index) {
    const PaymentArray = this.inputFormGroup.controls.Payments as FormArray<IPayments>;
    const item = PaymentArray.at(index) as FormGroup<IPayments>;
    const transactionLine = item.get('TransactionLine') as FormGroup<any>;
    if (transactionLine.get('Units').value === '') {
      transactionLine.get('Units').setValue(0);
    }
    this.debounce();
  }

  onPaymentRateChange() {
    this.debounce();
  }

  onPaymentRateUnitChange() {
    this.debounce();
  }

  rateUnitConverter(paymentRateUnit: any, value: any, hours: any) {
    value = Number(parseFloat(value));
    if (paymentRateUnit === PhxConstants.RateUnit.Hour) {
      value = <any>parseFloat((value * hours).toString()).toFixed(2) / 1;
    } else if (paymentRateUnit === PhxConstants.RateUnit.Day) {
      value = Number(parseFloat(<any>(value / hours)).toFixed(2)) / 1;
    }

    return value;
  }

  bpUnitAdjuster(billingRateUnit, paymentRateUnit, newValue, hours) {
    if (billingRateUnit === paymentRateUnit || billingRateUnit === PhxConstants.RateUnit.Fixed || paymentRateUnit === PhxConstants.RateUnit.Fixed) {
      return newValue;
    }
    newValue = this.rateUnitConverter(paymentRateUnit, newValue, hours);
    return newValue;
  }

  debounce(emit = true) {
    const rootFormGroup: FormGroup<any> = <FormGroup<any>>this.getRootFormGroup(this.inputFormGroup);
    rootFormGroup.get('IsDebounce').setValue(true);
    if (emit) {
      this.outputEvent.emit();
    }
  }

  addOrRemoveTransactionLines(lineNumber?: any) {
    this.addOrRemoveTransactionLine.emit({ status: 'TransactionRemoveLine', lineNumber: lineNumber });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transaction: any): FormArray<ITransactionLines> {
    const formArray = formGroupSetup.formBuilder.array<ITransactionLines>(
      transaction.GroupedTransactionLinesByLineNumber.map((transactionLine: any) => {
        return formGroupSetup.formBuilder.group<ITransactionLines>({
          LineNumber: [transactionLine.LineNumber],
          RateTypeId: [transactionLine.RateTypeId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateTypeId', CustomFieldErrorType.required))]],
          Billings: TransactionDetailsTransactionLinesComponent.bilingFormArray(formGroupSetup, transactionLine.Billings, transactionLine.RateTypeId),
          Payments: TransactionDetailsTransactionLinesComponent.paymentsFormArray(formGroupSetup, transactionLine.Payments, transactionLine.RateTypeId),
          RateTypeList: [transactionLine.RateTypeList]
        });
      })
    );
    return formArray;
  }

  public static paymentsFormArray(formGroupSetup: IFormGroupSetup, payments, rateTypeId) {
    return formGroupSetup.formBuilder.array<IPayments>(
      payments.map(payment => {
        return formGroupSetup.formBuilder.group<IPayments>({
          Id: [payment.Id],
          TransactionLine: formGroupSetup.formBuilder.group<any>({
            Id: [payment.TransactionLine.Id],
            Units: [payment.TransactionLine.Units],
            Description: [payment.TransactionLine.Description, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
            Rate: [payment.TransactionLine.Rate, rateTypeId === PhxConstants.RateType.Other ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))] : null],
            RateUnitId: [
              payment.TransactionLine.RateUnitId,
              rateTypeId === PhxConstants.RateType.Other ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateUnitId', CustomFieldErrorType.required))] : null
            ],
            RateTypeId: [payment.TransactionLine.RateTypeId]
          }),
          Hours: [payment.Hours],
          RateTypeId: [payment.RateTypeId],
          PayeeName: [payment.PayeeName],
          PayeeOrganizationIdSupplier: [payment.PayeeOrganizationIdSupplier],
          PayeeUserProfileWorkerId: [payment.PayeeUserProfileWorkerId],
          VersionRates: [payment.VersionRates],
          SubdivisionId: [payment.SubdivisionId],
          CurrencyId: [payment.CurrencyId],
          PreTaxTotal: [payment.PreTaxTotal],
          SalesTaxTotal: [payment.SalesTaxTotal],
          Total: [payment.Total],
          PaymentTransactionLineSalesTaxes: [payment.PaymentTransactionLineSalesTaxes]
        });
      })
    );
  }

  public static bilingFormArray(formGroupSetup: IFormGroupSetup, billings, rateTypeId) {
    return formGroupSetup.formBuilder.array<IBilling>(
      billings.map(billing => {
        return formGroupSetup.formBuilder.group<IBilling>({
          Id: [billing.Id],
          TransactionLine: formGroupSetup.formBuilder.group<any>({
            Id: [billing.TransactionLine.Id],
            Units: [billing.TransactionLine.Units],
            Description: [billing.TransactionLine.Description, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
            Rate: [billing.TransactionLine.Rate, rateTypeId === PhxConstants.RateType.Other ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Rate', CustomFieldErrorType.required))] : null],
            RateUnitId: [
              billing.TransactionLine.RateUnitId,
              rateTypeId === PhxConstants.RateType.Other ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('RateUnitId', CustomFieldErrorType.required))] : null
            ],
            RateTypeId: [billing.TransactionLine.RateTypeId]
          }),
          Hours: [billing.Hours],
          OrganizationIdClient: [billing.OrganizationIdClient],
          OrganizationClientDisplayName: [billing.OrganizationClientDisplayName],
          OrganizationIdInternal: [billing.OrganizationIdInternal],
          OrganizationInternalLegalName: [billing.OrganizationInternalLegalName],
          VersionRates: [billing.VersionRates],
          SubdivisionId: [billing.SubdivisionId],
          CurrencyId: [billing.CurrencyId],
          PreTaxTotal: [billing.PreTaxTotal],
          SalesTaxTotal: [billing.SalesTaxTotal],
          Total: [billing.Total],
          BillingTransactionLineSalesTaxes: [billing.BillingTransactionLineSalesTaxes]
        });
      })
    );
  }

  public static formGroupToPartial(transaction: any, formGroupTransactionLine: FormArray<ITransactionLines>): any {
    forEach(formGroupTransactionLine.value, (GroupedTransactionLine, index) => {
      transaction.GroupedTransactionLinesByLineNumber[index] = {
        ...transaction.GroupedTransactionLinesByLineNumber[index],
        LineNumber: GroupedTransactionLine.LineNumber,
        RateTypeId: GroupedTransactionLine.RateTypeId
      };

      GroupedTransactionLine.Billings.forEach(billing => {
        const billingIndex = transaction.GroupedTransactionLinesByLineNumber[index].Billings.findIndex(a => a.Id === billing.Id);
        if (billingIndex !== -1) {
          transaction.GroupedTransactionLinesByLineNumber[index].Billings[billingIndex] = {
            ...transaction.GroupedTransactionLinesByLineNumber[index].Billings[billingIndex],
            Hours: billing.Hours,
            OrganizationIdClient: billing.OrganizationIdClient,
            OrganizationClientDisplayName: billing.OrganizationClientDisplayName,
            OrganizationIdInternal: billing.OrganizationIdInternal,
            OrganizationInternalLegalName: billing.OrganizationInternalLegalName,
            VersionRates: billing.VersionRates,
            SubdivisionId: billing.SubdivisionId,
            CurrencyId: billing.CurrencyId,
            PreTaxTotal: billing.PreTaxTotal,
            SalesTaxTotal: billing.SalesTaxTotal,
            Total: billing.Total,
            BillingTransactionLineSalesTaxes: billing.BillingTransactionLineSalesTaxes,
            TransactionLine: {
              ...transaction.GroupedTransactionLinesByLineNumber[0].Billings[billingIndex].TransactionLine,
              Units: billing.TransactionLine.Units,
              Description: billing.TransactionLine.Description,
              Rate: billing.TransactionLine.Rate,
              RateUnitId: billing.TransactionLine.RateUnitId
            }
          };
        }
      });
      GroupedTransactionLine.Payments.forEach(payment => {
        const paymentIndex = transaction.GroupedTransactionLinesByLineNumber[index].Payments.findIndex(a => a.Id === payment.Id);
        if (paymentIndex !== -1) {
          transaction.GroupedTransactionLinesByLineNumber[index].Payments[paymentIndex] = {
            ...transaction.GroupedTransactionLinesByLineNumber[index].Payments[paymentIndex],
            Hours: payment.Hours,
            RateTypeId: payment.RateTypeId,
            PayeeName: payment.PayeeName,
            PayeeOrganizationIdSupplier: payment.PayeeOrganizationIdSupplier,
            PayeeUserProfileWorkerId: payment.PayeeUserProfileWorkerId,
            VersionRates: payment.VersionRates,
            SubdivisionId: payment.SubdivisionId,
            CurrencyId: payment.CurrencyId,
            PreTaxTotal: payment.PreTaxTotal,
            SalesTaxTotal: payment.SalesTaxTotal,
            Total: payment.Total,
            PaymentTransactionLineSalesTaxes: payment.PaymentTransactionLineSalesTaxes,
            TransactionLine: {
              ...transaction.GroupedTransactionLinesByLineNumber[0].Payments[paymentIndex].TransactionLine,
              Units: payment.TransactionLine.Units,
              Description: payment.TransactionLine.Description,
              Rate: payment.TransactionLine.Rate,
              RateUnitId: payment.TransactionLine.RateUnitId
            }
          };
        }
      });

      transaction.BillingTransactions.forEach((billing, i) => {
        forEach(billing.BillingTransactionLines, (billingTransactionLine, j) => {
          const groupedBilling = transaction.GroupedTransactionLinesByLineNumber[index].Billings.find(a => a.Id === billingTransactionLine.Id);
          if (groupedBilling) {
            transaction.BillingTransactions[i].BillingTransactionLines[j] = {
              ...transaction.BillingTransactions[i].BillingTransactionLines[j],
              Description: groupedBilling.TransactionLine.Description,
              Units: groupedBilling.TransactionLine.Units,
              Rate: groupedBilling.TransactionLine.Rate,
              RateUnitId: groupedBilling.TransactionLine.RateUnitId,
              RateTypeId: transaction.GroupedTransactionLinesByLineNumber[index].RateTypeId
            };
          }
        });
      });

      transaction.PaymentTransactions.forEach((payment, i) => {
        forEach(payment.PaymentTransactionLines, (paymentTransactionLine, j) => {
          const groupedPayments = transaction.GroupedTransactionLinesByLineNumber[index].Payments.find(a => a.Id === paymentTransactionLine.Id);
          if (groupedPayments) {
            transaction.PaymentTransactions[i].PaymentTransactionLines[j] = {
              ...transaction.PaymentTransactions[i].PaymentTransactionLines[j],
              Units: groupedPayments.TransactionLine.Units,
              Description: groupedPayments.TransactionLine.Description,
              Rate: groupedPayments.TransactionLine.Rate,
              RateUnitId: groupedPayments.TransactionLine.RateUnitId,
              RateTypeId: transaction.GroupedTransactionLinesByLineNumber[index].RateTypeId
            };
          }
        });
      });
    });
    return transaction;
  }
}
