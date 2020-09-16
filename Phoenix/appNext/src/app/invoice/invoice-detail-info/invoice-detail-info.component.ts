import { InvoiceBillingTransaction } from './../shared/invoice-billing-transaction';
import { Component, OnInit, Input, SimpleChanges, OnDestroy, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../../common/index';
import { Invoice } from '../shared/index';
import { InvoiceService } from '../shared/invoice.service';
import { CodeValue } from '../../common/model/index';
import { PhxSelectBoxCodeValueComponent } from '../../common/components/phx-select-box-code-value/phx-select-box-code-value.component';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { IOrganizationClientRoleAlternateBill } from '../../organization/state/index';
import { InvoiceModuleResourceKeys } from '../invoice-module-resource-keys';

@Component({
  selector: 'app-invoice-detail-info',
  templateUrl: './invoice-detail-info.component.html',
  styleUrls: ['./invoice-detail-info.component.less']
})
export class InvoiceDetailInfoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() invoice: Invoice;
  @Input() editable: boolean;
  @Input() isCurrentUserHasClientRelatedRoles: boolean;

  @Input() availableBillingTerms: Array<number> = [];
  @Input() availableBillingTemplates: Array<number> = [];

  @ViewChild('invoiceterm') invoiceterm: PhxSelectBoxCodeValueComponent;
  @ViewChild('invoicetemplate') invoicetemplate: PhxSelectBoxCodeValueComponent;

  alternateBillClients: Array<IOrganizationClientRoleAlternateBill> = [];
  currentInvoiceId: number;

  filterAvailableBillingTerms: Function;

  isAlive: boolean = true;
  form: FormGroup;
  codeValueGroups: any;
  invoiceModuleResourceKeys: any;
  constructor(
    private fb: FormBuilder,
    public commonService: CommonService,
    private organizationService: OrganizationApiService,
    private invoiceService: InvoiceService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.invoiceModuleResourceKeys = InvoiceModuleResourceKeys;
  }

  ngOnInit() {
    this.filterAvailableBillingTerms = this.isBillingTermAvailable.bind(this);

    this.form = this.fb.group({
      InvoiceDate: ['', [Validators.required]],
      ReleaseDate: [''],
      OrganizationClientRoleAlternateBillId: [''],
      BillingInvoiceTemplateId: ['', [Validators.required]],
      BillingInvoiceTermId: ['', [Validators.required]],
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.invoice) {
      if (changes.invoice.currentValue != null) {
        if (this.currentInvoiceId !== changes.invoice.currentValue.Id) {
          this.currentInvoiceId = changes.invoice.currentValue.Id;
          this.loadAlternateBillClients();
        }
        if (this.form) {
          this.updateFormValues();
          this.invoiceterm.refresh();
          this.invoicetemplate.refresh();
        }
      }
    }
  }

  updateFormValues() {
    if (this.invoice) {
      this.form.patchValue(this.invoice, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadAlternateBillClients() {
    this.organizationService.getByOrganizationId(this.invoice.OrganizationIdClient, 'InvoiceDetailInfo')
      .takeWhile(() => this.isAlive)
      .subscribe((organization) => {
        if (organization != null) {
          organization.OrganizationClientRoles.forEach((organizationClientRole) => {
            this.alternateBillClients = this.alternateBillClients.concat(organizationClientRole.OrganizationClientRoleAlternateBills);
          });
        }
      });
  }

  isBillingTermAvailable(codeValue: CodeValue) {
    return this.availableBillingTerms.includes(codeValue.id);
  }

}
