import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Invoice, InvoiceExtension } from '../shared/index';
import { InvoiceService } from '../shared/invoice.service';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-detail-notes',
  templateUrl: './invoice-detail-notes.component.html',
  styleUrls: ['./invoice-detail-notes.component.less']
})
export class InvoiceDetailNotesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() invoice: Invoice;
  @Input() editable: boolean;

  notes1: Array<string> = [];
  notes2: Array<string> = [];
  notes3: Array<string> = [];
  notes4: Array<string> = [];

  isAlive: boolean = true;
  form: FormGroup;
  invoiceModuleResourceKeys: any;
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
    this.form = this.fb.group({
      InvoiceNote1: [''],
      InvoiceNote2: [''],
      InvoiceNote3: [''],
      InvoiceNote4: [''],
    });

    this.updateFormValues();

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        Object.assign(this.invoice, value);
        this.invoiceService.updateState(this.invoice);
      });
    this.notes1 = InvoiceExtension.getBillingTransactionNotes(this.invoice, 'InvoiceNote1');
    this.notes2 = InvoiceExtension.getBillingTransactionNotes(this.invoice, 'InvoiceNote2');
    this.notes3 = InvoiceExtension.getBillingTransactionNotes(this.invoice, 'InvoiceNote3');
    this.notes4 = InvoiceExtension.getBillingTransactionNotes(this.invoice, 'InvoiceNote4');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.invoice) {
      if (changes.invoice.currentValue != null && this.form) {
        this.updateFormValues();
      }
    }
  }

  onCustomItemCreating(invNoteProperty, item) {
    this.form.controls[invNoteProperty].setValue(item.text);
  }

  updateFormValues() {
    if (this.invoice) {
      this.form.patchValue(this.invoice, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
