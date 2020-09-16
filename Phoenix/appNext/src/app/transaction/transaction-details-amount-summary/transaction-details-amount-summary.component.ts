// angular
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { findIndex } from 'lodash';
// common
import { PhxConstants } from '../../common';
// transaction
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { TransactionObservableService } from '../state/transaction.observable.service';
import { ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-details-amount-summary',
  templateUrl: './transaction-details-amount-summary.component.html',
  styleUrls: ['./transaction-details-amount-summary.component.less']
})
export class TransactionDetailsAmountSummaryComponent extends TransactionBaseComponentPresentational<any> implements OnInit {
  showIsReplaceByZeroIcon: boolean;
  showIsReplaceByZeroInputCheckBox: boolean;
  html: {
    lists: {
      earningsAndDeductionsTypeList: Array<any>;
    };
  } = {
    lists: {
      earningsAndDeductionsTypeList: []
    }
  };

  transaction: ITransactionHeader;
  static propertyVal: string[] = [];
  static transactionDetails: any;

  constructor(private transactionObservableService: TransactionObservableService) {
    super('TransactionDetailsAmountSummaryComponent');
  }

  ngOnInit() {
    this.html.lists.earningsAndDeductionsTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.EarningsAndDeductionsType, true);
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        TransactionDetailsAmountSummaryComponent.transactionDetails = { ...transaction };
        if (transaction.IsDraft) {
          this.showIsReplaceByZeroInputCheckBox = true;
          this.showIsReplaceByZeroIcon = false;
        } else {
          this.showIsReplaceByZeroInputCheckBox = false;
          this.showIsReplaceByZeroIcon = this.transaction.TransactionTypeId === PhxConstants.TransactionType.Manual;
        }
      }
    });
  }

  additionalOnchanges(changes: SimpleChanges) {}

  businessRules(obj: any) {}

  showSummaryEarningsAndDeductions(itemToCheck, subLevel) {
    const amountSummary = this.transaction.TransactionCalculation.AmountSummary;
    if (!amountSummary || !itemToCheck) {
      return false;
    }
    if (typeof subLevel === 'undefined' || subLevel === null) {
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
    } else {
      return subLevel[itemToCheck] !== null;
    }
  }

  getModel(propertyVal: string, filterObj: any) {
    const i = findIndex(this.transaction[propertyVal], filterObj);
    this.checkProprtyValue(propertyVal);
    if (i !== -1) {
      return this.transaction[propertyVal][i];
    } else {
      return {};
    }
  }

  checkProprtyValue(propertyVal) {
    if (TransactionDetailsAmountSummaryComponent.propertyVal.findIndex(a => a === propertyVal) === -1) {
      TransactionDetailsAmountSummaryComponent.propertyVal.push(propertyVal);
    }
  }

  resetTaxesAndCalculate() {
    this.transaction.IsDebounce = true;
    TransactionDetailsAmountSummaryComponent.transactionDetails = { ...this.transaction };
    this.outputEvent.emit();
  }

  public static formGroupToPartial(transaction: any): any {
    if (TransactionDetailsAmountSummaryComponent.transactionDetails) {
      transaction.IsDebounce = TransactionDetailsAmountSummaryComponent.transactionDetails.IsDebounce ? TransactionDetailsAmountSummaryComponent.transactionDetails.IsDebounce : transaction.IsDebounce;
      TransactionDetailsAmountSummaryComponent.propertyVal.forEach(value => {
        transaction[value] = TransactionDetailsAmountSummaryComponent.transactionDetails[value];
      });
    }
    return transaction;
  }
}
