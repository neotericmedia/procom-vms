// angular
import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
// common
import { PhxConstants, CodeValueService, CommonService } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
// transaction
import { TransactionService } from './../transaction.service';
import { ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html'
})
export class TransactionSummaryComponent extends BaseComponentOnDestroy implements OnInit, OnChanges {
  html: {
    phxConstants: any;
    worker: any;
    lists: {
      ARStatuses: Array<any>;
    }
  } = {
    phxConstants: null,
    worker: null,
    lists: {
      ARStatuses: []
    }
  };
  @Input() transaction: ITransactionHeader;
  constructor(private transactionService: TransactionService,
    private codeValueService: CodeValueService
    , private commonService: CommonService) {
    super();
  }

  ngOnInit() {
    this.html.phxConstants = PhxConstants;
    const codeValueGroups = this.commonService.CodeValueGroups;
    this.html.lists.ARStatuses = this.codeValueService.getCodeValues(codeValueGroups.ARStatus, true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transaction = changes.transaction.currentValue;
      if (!this.html.worker) {
        this.getProfileWorker();
      }
    }
  }

  getProfileWorker() {
    this.transactionService
      .getProfileWorker(this.transaction.WorkerUserProfileId)
      .takeUntil(this.isDestroyed$)
      .subscribe(response => {
        this.html.worker = response || {};
      });
  }
}
