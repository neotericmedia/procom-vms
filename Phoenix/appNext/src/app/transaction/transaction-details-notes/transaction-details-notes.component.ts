// angualar
import { Component, OnInit, SimpleChanges } from '@angular/core';
// common
import { ValidationExtensions } from '../../common';
import { FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CustomFieldErrorType } from '../../common/model';
// transaction
import { TransactionBaseComponentPresentational } from '../transaction-base-component-presentational';
import { ITransactionHeader, ITransactionDetailsNotes, IFormGroupSetup } from '../state';

@Component({
  selector: 'app-transaction-details-notes',
  templateUrl: './transaction-details-notes.component.html'
})
export class TransactionDetailsNotesComponent extends TransactionBaseComponentPresentational<ITransactionDetailsNotes> implements OnInit {
  transaction: ITransactionHeader;
  constructor() {
    super('TransactionHeaderComponent');
  }

  ngOnInit() {
  }

  additionalOnchanges(changes: SimpleChanges) {}

  businessRules(obj: any) {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, transaction: any): FormArray<ITransactionDetailsNotes> {
    const formArray = formGroupSetup.formBuilder.array<ITransactionDetailsNotes>(
        transaction.BillingTransactions.map((notes: ITransactionDetailsNotes) => {
          return formGroupSetup.formBuilder.group<ITransactionDetailsNotes>({
            InvoiceNote1: [notes.InvoiceNote1,
              [ValidationExtensions.maxLength(128)]],
            InvoiceNote2: [notes.InvoiceNote2,
              [ValidationExtensions.maxLength(128)]],
            InvoiceNote3: [notes.InvoiceNote3,
              [ValidationExtensions.maxLength(128)]],
            InvoiceNote4: [notes.InvoiceNote4,
              [ValidationExtensions.maxLength(128)]],
            IsInternalTransaction: [notes.IsInternalTransaction,
              [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsInternalTransaction', CustomFieldErrorType.required))]]
        });
        })
      );
    return formArray;
  }

  public static formGroupToPartial(transaction: any, formGroupNotes: FormArray<ITransactionDetailsNotes>): any {
    formGroupNotes.value.forEach((value, index) => {
      transaction.BillingTransactions[index] = {...transaction.BillingTransactions[index], ...value};
    });
    return transaction;
  }
}
