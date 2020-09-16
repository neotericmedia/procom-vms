// angular
import { Component, OnInit, SimpleChanges } from '@angular/core';
// common
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType, PhxFormControlLayoutType } from '../../common/model';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
// transaction
import { TransactionService } from '../transaction.service';
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { TransactionObservableService } from '../state/transaction.observable.service';
import { IHeader, IFormGroupSetup, ITransactionHeader } from '../state';

@Component({
  selector: 'app-transaction-header',
  templateUrl: './transaction-header.component.html'
})
export class TransactionHeaderComponent extends TransactionBaseComponentPresentational<IHeader> implements OnInit {
  html: {
    lists: {
      transactionCategoryList: Array<any>;
    };
    worker: any;
  } = {
    lists: {
      transactionCategoryList: []
    },
    worker: null
  };
  codeValueGroups: any;
  layoutType: any;
  transaction: ITransactionHeader;

  constructor(private transactionService: TransactionService, private transactionObservableService: TransactionObservableService) {
    super('TransactionHeaderComponent');
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.layoutType = PhxFormControlLayoutType;
  }

  ngOnInit() {
    this.html.lists.transactionCategoryList = this.codeValueService.getCodeValues(this.codeValueGroups.TransactionCategory, true);
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        const transactionTypeCodeValue = this.codeValueService.getCodeValue(this.transaction.TransactionTypeId, this.codeValueGroups.TransactionType);
        this.transaction['TransactionType'] = transactionTypeCodeValue && transactionTypeCodeValue.text;
      }
    });
    this.getProfileWorker();
  }

  additionalOnchanges(changes: SimpleChanges) {
    const x = 9;
  }

  businessRules(obj: any) {
    if (obj.name === 'StartDate' || obj.name === 'EndDate') {
      this.debounce();
    }
  }

  getProfileWorker() {
    this.transactionService
      .getProfileWorker(this.transaction.WorkerUserProfileId)
      .takeUntil(this.isDestroyed$)
      .subscribe(response => {
        this.html.worker = response;
      });
  }

  debounce(emit = true) {
    const rootFormGroup: FormGroup<any> = <FormGroup<any>>this.getRootFormGroup(this.inputFormGroup);
    rootFormGroup.get('IsDebounce').setValue(true);
    if (emit) {
      this.outputEvent.emit();
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transaction: ITransactionHeader): FormGroup<IHeader> {
    const formGroup: FormGroup<IHeader> = formGroupSetup.formBuilder.group<IHeader>({
      TransactionCategoryId: [transaction.TransactionCategoryId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('TransactionCategoryId', CustomFieldErrorType.required))]],
      StartDate: [transaction.StartDate, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('StartDate', CustomFieldErrorType.required))]],
      EndDate: [transaction.EndDate, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EndDate', CustomFieldErrorType.required))]]
    });
    return formGroup;
  }

  public static formGroupToPartial(transaction: any, formGroupNotes: FormGroup<IHeader>): any {
    transaction.TransactionCategoryId = formGroupNotes.value.TransactionCategoryId;
    transaction.StartDate = formGroupNotes.value.StartDate;
    transaction.EndDate = formGroupNotes.value.EndDate;
    return transaction;
  }
}
