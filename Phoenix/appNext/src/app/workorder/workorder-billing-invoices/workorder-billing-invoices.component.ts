import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IFormGroupSetup, IBillingInfo, IBillingInfoes } from '../state/workorder.interface';
import { WorkOrderBaseComponentPresentational } from '../workorder-base-component-presentational';
import { WorkorderBillingInvoiceComponent } from '../workorder-billing-invoice/workorder-billing-invoice.component';
import { FormArray, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { IReadOnlyStorage } from '../../organization/state';

@Component({
  selector: 'app-workorder-billing-invoices',
  templateUrl: './workorder-billing-invoices.component.html',
  styleUrls: ['./workorder-billing-invoices.component.less']
})
export class WorkorderBillingInvoicesComponent implements OnInit {

  @Input() invoiceType: number;
  @Input() inputFormGroup: FormGroup<IBillingInfoes>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();

  constructor() {
  }

  businessRules() { }

  ngOnInit() {
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, billingInfoes: Array<IBillingInfo>, validations: any, invoiceType: number): FormArray<IBillingInfo> {
    const formGroup = formGroupSetup.formBuilder.array<IBillingInfo>(
      billingInfoes.map((info: IBillingInfo) =>
        formGroupSetup.formBuilder.group<IBillingInfo>({
          BillingInvoices: WorkorderBillingInvoiceComponent.formBuilderBillingInvoices(formGroupSetup, info.BillingInvoices, validations, invoiceType),
          OrganizationIdClient: [info.OrganizationIdClient],
          OrganizationClientDisplayName: [info.OrganizationClientDisplayName],
          Id: [info.Id]
        })
      )
    );
    return formGroup;
  }

  trackByForBillingInvoice(index: number) {
    return index;
  }

  trackByForBillingInfo(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

}
