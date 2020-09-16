// angular
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
// common
import { PhxConstants } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
// transaction
import { TransactionService } from './../transaction.service';
import { TransactionDetailsNotesComponent } from './../transaction-details-notes/transaction-details-notes.component';
import { TransactionDetailsStatHolidayLineComponent } from './../transaction-details-stat-holiday-line/transaction-details-stat-holiday-line.component';
import { TransactionDetailsTransactionLinesComponent } from './../transaction-details-transaction-lines/transaction-details-transaction-lines.component';
import { TransactionDetailsAmountSummaryComponent } from '../transaction-details-amount-summary/transaction-details-amount-summary.component';
import { IFormGroupSetup, IDetails, ITransactionHeader, ITransactionDetailsNotes } from '../state';
import { TransactionDetailsGrossProfitComponent } from '../transaction-details-gross-profit/transaction-details-gross-profit.component';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html'
})
export class TransactionDetailsComponent extends BaseComponentOnDestroy implements OnInit, OnChanges {
  @Input() inputFormGroup: FormGroup<IDetails>;
  html: {
    phxConstants: any;
    worker: any;
  } = {
    phxConstants: null,
    worker: null
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
  isLoadedWorker: boolean = false;
  clearPOSelectedRows: boolean = false;
  @Input() transaction: ITransactionHeader;
  @Output() addOrRemoveTransactionLine = new EventEmitter();
  @Output() recalculate = new EventEmitter();
  @ViewChild('modalLineEdit') modalLineEdit: PhxModalComponent;

  constructor(private transactionService: TransactionService) {
    super();
  }

  ngOnInit() {
    this.html.phxConstants = PhxConstants;
    if (this.transaction) {
      this.getProfileWorker();
    }
    this.modalLineEdit.addClassToConfig('modal-lg');
  }

  trackByFn(index: number) {
    return index;
  }

  getProfileWorker() {
    this.transactionService
      .getProfileWorker(this.transaction.WorkerUserProfileId)
      .takeUntil(this.isDestroyed$)
      .subscribe(response => {
        this.html.worker = response;
        this.isLoadedWorker = true;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.transaction && changes.transaction.currentValue) {
      this.transaction = changes.transaction.currentValue;
      this.showToRecalc();
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

  filterpaymentTransactions(controls) {
    return controls.filter(a => a.value.RateTypeId === PhxConstants.RateType.Stat);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  transactionPoNavigationOpen() {
    this.modalLineEdit.show();
  }

  addOrRemoveTransactionLines(status) {
    this.addOrRemoveTransactionLine.emit(status);
  }

  emitRecalculate() {
    this.recalculate.emit();
  }

  onRowSelected(event: any = {}) {
    this.addOrRemoveTransactionLine.emit({
      status: event.status,
      PurchaseOrderLineId: event.event.selectedRowsData[0].PurchaseOrderLineId
    });
    this.modalLineEdit.hide();
  }
  transactionPORemove() {
    this.addOrRemoveTransactionLine.emit({
      status: 'PORemove',
      PurchaseOrderLineId: null
    });

    this.clearPOSelectedRows = !this.clearPOSelectedRows;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transaction: ITransactionHeader): FormGroup<IDetails> {
    const formGroup: FormGroup<IDetails> = formGroupSetup.formBuilder.group<IDetails>({
      Notes: TransactionDetailsNotesComponent.formBuilderGroupSetup(formGroupSetup, transaction),
      StatHoliday: TransactionDetailsStatHolidayLineComponent.formBuilderGroupSetup(formGroupSetup, transaction),
      TransactionLines: TransactionDetailsTransactionLinesComponent.formBuilderGroupSetup(formGroupSetup, transaction)
    });
    return formGroup;
  }
  public static formGroupToPartial(transaction: any, formGroupDetails: FormGroup<IDetails>): any {
    transaction = TransactionDetailsAmountSummaryComponent.formGroupToPartial(transaction);
    transaction = TransactionDetailsNotesComponent.formGroupToPartial(transaction, <FormArray<ITransactionDetailsNotes>>formGroupDetails.controls.Notes);
    transaction = TransactionDetailsTransactionLinesComponent.formGroupToPartial(transaction, <any>formGroupDetails.controls.TransactionLines);
    transaction = TransactionDetailsStatHolidayLineComponent.formGroupToPartial(transaction, <any>formGroupDetails.controls.StatHoliday);
    transaction = TransactionDetailsGrossProfitComponent.formGroupToPartial(transaction);
    return transaction;
  }
}
