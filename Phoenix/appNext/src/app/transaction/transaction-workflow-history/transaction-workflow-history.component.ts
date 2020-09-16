import { Component, OnInit } from '@angular/core';
import { TransactionObservableService } from '../state/transaction.observable.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { PhxConstants } from '../../common';
@Component({
  selector: 'app-transaction-workflow-history',
  templateUrl: './transaction-workflow-history.component.html'
})
export class TransactionWorkflowHistoryComponent extends BaseComponentOnDestroy implements OnInit {
  transaction: any;
  phxConstants: any;
  reversedTransactions: any;
  hasReversedTransaction: any;

  transactionReverseCommandNames = ['TransactionHeaderActionReverse', 'TransactionHeaderActionReverseTimeSheetUnsubmit', 'TransactionHeaderActionReverseTimeSheetReturnToException'];

  importReverseCommandNames = ['VmsDiscountRecordReverseTransaction'];
  constructor(private transactionObservableService: TransactionObservableService) {
    super();
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        this.reversedTransactions = this.transaction.BillingTransactions.filter(function(i) {
            return i.ReversedBillingTransactionId !== null;
          });
          this.hasReversedTransaction = !!(this.reversedTransactions && this.reversedTransactions.length);
      }
    });
  }
  transactionWorkflowIterator(item) {
    if (this.processItems) {
      this.processItems(item, this.transactionReverseCommandNames, false);
    }
  }

  discountImportIterator(item) {
    this.processItems(item, this.importReverseCommandNames, false);
  }

  reversedTransactionWorkflowIterator(item) {
    this.processItems(item, this.transactionReverseCommandNames, true);
    if (item) {
      item.action = 'Transaction Reverse';
    }
  }

  reversedDiscountImportIterator(item) {
    this.processItems(item, this.importReverseCommandNames, true);
    if (item) {
      item.action = 'Discount Import Reverse';
    }
  }

  processItems(item, reverseCommandNames, showReversed) {
    if (item) {
      let reversed = false;
      if (item.items && item.items.length) {
        for (let i = 0; i < item.items.length; i++) {
          const currentItem = item.items[i];
          reversed = reversed || reverseCommandNames.indexOf(currentItem.TaskTemplateCommandName) !== -1;
          currentItem.reversed = reversed;
        }
      }

      item.items = item.items.filter(function(i) {
        return i.reversed === showReversed;
      });

      if (reversed && !showReversed) {
        item.started = null;
        item.completed = null;
        item.approver = null;
        item.task = null;
      }
    }
    console.log(item);
  }
}
