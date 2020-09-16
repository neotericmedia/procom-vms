// angular
import { Component, OnInit } from '@angular/core';
// common
import { PhxConstants, CodeValueService, CommonService } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
// transaction
import { TransactionObservableService } from '../state/transaction.observable.service';

@Component({
  selector: 'app-transaction-vms-record',
  templateUrl: './transaction-vms-record.component.html'
})
export class TransactionVmsRecordComponent extends BaseComponentOnDestroy implements OnInit {
  html: {
    lists: {
      rateTypeList: Array<any>;
    };
    phxConstants: any;
    worker: any;
  } = {
    lists: {
      rateTypeList: []
    },
    phxConstants: null,
    worker: null
  };
  transaction: any;

  constructor(private codeValueService: CodeValueService, private commonService: CommonService, private transactionObservableService: TransactionObservableService) {
    super();
  }

  ngOnInit() {
    this.html.lists.rateTypeList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateType, true);
    this.html.phxConstants = PhxConstants;
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
      }
    });
  }
}
