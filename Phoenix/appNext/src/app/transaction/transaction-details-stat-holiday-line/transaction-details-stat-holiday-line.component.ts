// angular
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
// transaction
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { IFormGroupSetup, IPaymentTransactions, IPaymentTransactionLines, ITransactionHeader, IPaymentTransactionLine } from '../state';

@Component({
  selector: 'app-transaction-details-stat-holiday-line',
  templateUrl: './transaction-details-stat-holiday-line.component.html'
})

export class TransactionDetailsStatHolidayLineComponent extends TransactionBaseComponentPresentational<IPaymentTransactionLines> implements OnInit, OnChanges {
  html: {
    lists: {
      rateUnitList: Array<any>;
    };
  } = {
    lists: {
      rateUnitList: []
    },
  };
  unitsOverwriteFilter: any = { from: 0, to: 9999999.99, decimalplaces: 2 };
  @Input() transaction: ITransactionHeader;

  constructor() {
    super('TransactionDetailsStatHolidayLineComponent');
  }

  ngOnInit() {
    this.html.lists.rateUnitList = this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true);
  }
  additionalOnchanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transaction = changes.transaction.currentValue;
    }
  }

  businessRules(obj: any) {
    if (obj.name === 'UnitsOverwrite') {
      const rootFormGroup: FormGroup<any> = <FormGroup<any>>this.getRootFormGroup(this.inputFormGroup);
      rootFormGroup.get('IsDebounce').setValue(true);
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transaction: any): FormArray<IPaymentTransactions> {
    const formArray = formGroupSetup.formBuilder.array<IPaymentTransactions>(
        transaction.PaymentTransactions.map((paymentTransactions: any) => {
          return formGroupSetup.formBuilder.group<IPaymentTransactions>({
            Id: [paymentTransactions.Id],
            PaymentTransactionLines: formGroupSetup.formBuilder.array<IPaymentTransactionLines>(
              paymentTransactions.PaymentTransactionLines.map((paymentTransactionLine) => {
                return formGroupSetup.formBuilder.group<IPaymentTransactionLines>({
                  Id: [paymentTransactionLine.Id],
                  Description: [paymentTransactionLine.Description],
                  Date: [paymentTransactionLine.Date],
                  Units: [paymentTransactionLine.Units],
                  UnitsOverwrite: [paymentTransactionLine.UnitsOverwrite],
                  Rate: [paymentTransactionLine.Rate],
                  Total: [paymentTransactionLine.Total],
                  RateUnitId: [paymentTransactionLine.RateUnitId],
                  RateTypeId: [paymentTransactionLine.RateTypeId]
                });
              })
            )
          });
        })
      );
    return formArray;
  }

  public static formGroupToPartial(transaction: ITransactionHeader, formArrayPaymentTransaction: FormArray<IPaymentTransactions>): any {
    const formArrayValues: Array<IPaymentTransactions> = formArrayPaymentTransaction.value;
    transaction.PaymentTransactions.forEach((paymentTransaction, i) => {
      const transactionLine: Array<IPaymentTransactionLines> = formArrayValues.find(a => a.Id === paymentTransaction.Id).PaymentTransactionLines;
      paymentTransaction.PaymentTransactionLines.forEach((paymentTransactionLine: IPaymentTransactionLine, j) => {
        const line = transactionLine.find(a => a.Date === paymentTransactionLine.Date);
        transaction.PaymentTransactions[i].PaymentTransactionLines[j] = {
          ...transaction.PaymentTransactions[i].PaymentTransactionLines[j],
          UnitsOverwrite: line.UnitsOverwrite
        };
      });
    });
    return {...transaction};
  }
}
