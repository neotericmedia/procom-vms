// angular
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// transaction
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { findIndex } from 'lodash';
import { TransactionObservableService } from '../state/transaction.observable.service';
import { ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-details-gross-profit',
  templateUrl: './transaction-details-gross-profit.component.html',
  styleUrls: ['./transaction-details-gross-profit.component.less']
})
export class TransactionDetailsGrossProfitComponent extends TransactionBaseComponentPresentational<any> implements OnInit, OnChanges {
  showIsReplaceByZeroIcon: boolean;
  showIsReplaceByZeroInputCheckBox: boolean;
  transaction: ITransactionHeader;
  html: {
    lists: {
      earningsAndDeductionsTypeList: Array<any>;
    };
  } = {
    lists: {
      earningsAndDeductionsTypeList: []
    }
  };
  static transactionDetails: any;
  static propertyVal: string[] = [];

  constructor(private transactionObservableService: TransactionObservableService) {
    super('TransactionDetailsGrossProfitComponent');
  }

  ngOnInit() {
    this.html.lists.earningsAndDeductionsTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.EarningsAndDeductionsType, true);
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        TransactionDetailsGrossProfitComponent.transactionDetails = { ...transaction };
        if (transaction.IsDraft) {
          this.showIsReplaceByZeroInputCheckBox = true;
          this.showIsReplaceByZeroIcon = false;
        } else {
          this.showIsReplaceByZeroInputCheckBox = false;
          this.showIsReplaceByZeroIcon = this.transaction.TransactionTypeId === this.phxConstants.TransactionType.Manual;
        }
      }
    });
  }

  additionalOnchanges(changes: SimpleChanges) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transaction = changes.transaction.currentValue;
    }
  }

  businessRules(obj: any) {}

  showSummaryEarningsAndDeductions(itemToCheck) {
    const amountSummary = this.transaction.TransactionCalculation.AmountSummary;
    if (!amountSummary || !itemToCheck) {
      return false;
    }
    const existsInBill =
      typeof amountSummary.AmountSummaryPayees !== 'undefined' &&
      amountSummary.AmountSummaryPayees != null &&
      amountSummary.AmountSummaryPayees.filter(val => {
        return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null;
      }).length > 0;
    const existsInPay =
      typeof amountSummary.AmountSummaryBills !== 'undefined' &&
      amountSummary.AmountSummaryBills != null &&
      amountSummary.AmountSummaryBills.filter(val => {
        return typeof val[itemToCheck] !== 'undefined' && val[itemToCheck] !== null;
      }).length > 0;
    const existsinInternal =
      typeof amountSummary.AmountSummaryEmployer !== 'undefined' &&
      amountSummary.AmountSummaryEmployer != null &&
      typeof amountSummary.AmountSummaryEmployer[itemToCheck] !== 'undefined' &&
      amountSummary.AmountSummaryEmployer[itemToCheck] !== null;
    const existsInRoot = typeof amountSummary !== 'undefined' && amountSummary != null && typeof amountSummary[itemToCheck] !== 'undefined' && amountSummary[itemToCheck] !== null;
    return existsInBill || existsInPay || existsinInternal || existsInRoot;
  }

  resetTaxesAndCalculate() {
    this.transaction.IsDebounce = true;
    TransactionDetailsGrossProfitComponent.transactionDetails = { ...this.transaction };
    this.outputEvent.emit();
  }

  getModel(propertyVal: string, filterObj: any) {
    this.checkProprtyValue(propertyVal);
    const i = findIndex(this.transaction[propertyVal], filterObj);
    if (i !== -1) {
      return this.transaction[propertyVal][i];
    } else {
      return { IsExcluded: true };
    }
  }

  checkProprtyValue(propertyVal) {
    if (TransactionDetailsGrossProfitComponent.propertyVal.findIndex(a => a === propertyVal) === -1) {
      TransactionDetailsGrossProfitComponent.propertyVal.push(propertyVal);
    }
  }

  public static formGroupToPartial(transaction: any): any {
    if (TransactionDetailsGrossProfitComponent.transactionDetails) {
      transaction.IsDebounce = TransactionDetailsGrossProfitComponent.transactionDetails.IsDebounce ? TransactionDetailsGrossProfitComponent.transactionDetails.IsDebounce : transaction.IsDebounce;
      TransactionDetailsGrossProfitComponent.propertyVal.forEach(value => {
        transaction[value] = TransactionDetailsGrossProfitComponent.transactionDetails[value];
      });
    }
    return transaction;
  }
}
