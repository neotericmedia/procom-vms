// angular
import { Component, OnInit } from '@angular/core';
// common
import { PhxConstants, CodeValueService, CommonService } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
// transaction
import { TransactionObservableService } from '../state/transaction.observable.service';
import { ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-details-view',
  templateUrl: './transaction-details-view.component.html',
  styleUrls: ['./transaction-details-view.component.component.less']
})
export class TransactionDetailsViewComponent extends BaseComponentOnDestroy implements OnInit {
  html: {
    phxConstants: any;
    lists: {
      RateUnits: Array<any>;
      ARStatuses: Array<any>;
      YesNo: Array<any>;
    };
  } = {
    phxConstants: null,
    lists: {
      RateUnits: [],
      ARStatuses: [],
      YesNo: []
    }
  };
  transaction: ITransactionHeader;
  codeValueGroups: any;
  showARPayment: boolean = false;

  constructor(private transactionObservableService: TransactionObservableService, private codeValueService: CodeValueService, private commonService: CommonService) {
    super();
  }

  ngOnInit() {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.html.phxConstants = PhxConstants;
    this.html.lists.ARStatuses = this.codeValueService.getCodeValues(this.codeValueGroups.ARStatus, true);
    this.html.lists.RateUnits = this.codeValueService.getCodeValues(this.codeValueGroups.RateUnit, true);
    this.html.lists.YesNo = this.codeValueService.getCodeValues(this.codeValueGroups.YesNo, true);
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
      }
    });
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }
}
