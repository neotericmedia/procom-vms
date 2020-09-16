import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavigationService, CommonService } from '../../common/index';
import { InvoiceService } from '../shared/invoice.service';
import { Invoice, InvoiceExtension } from '../shared/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.less']
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  codeValueGroups: any;
  invoice: Invoice;
  id: number;

  editable: boolean = true;
  isAlive: boolean = true;
  forceEdit: boolean = false;
  isCurrentUserHasClientRelatedRoles: boolean = true;

  availableBillingTerms: Array<number> = [];
  availableBillingTemplates: Array<number> = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private invoiceService: InvoiceService,
    private commonService: CommonService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {

    this.invoiceService.isCurrentUserHasClientRelatedRoles()
      .takeWhile(() => this.isAlive)
      .subscribe((result: boolean) => {
        this.isCurrentUserHasClientRelatedRoles = result;
        this.activatedRoute.parent.params
          .takeWhile(() => this.isAlive)
          .subscribe((params) => {
            this.id = +params['Id'];
            this.loadInvoice(this.id);
          });
      });

  }

  loadInvoice(id: number, force: boolean = false) {
    this.invoiceService.getInvoice(this.id, null, force)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.invoice = data;
        if (this.invoice) {
          this.availableBillingTerms = this.invoice.InvoiceBillingTransactions.map(bt => bt.BillingInvoiceTermId);
          this.availableBillingTemplates = this.invoice.InvoiceBillingTransactions.map(bt => bt.BillingInvoiceTemplateId);
        } else {
          this.availableBillingTerms = [];
          this.availableBillingTemplates = [];
        }
        this.setInvoiceEditableStatus(this.invoice, this.forceEdit);
      });

    this.invoiceService.getInvoiceEditMode(this.id)
      .takeWhile(() => this.isAlive)
      .subscribe((data) => {
        this.forceEdit = data;
        this.setInvoiceEditableStatus(this.invoice, this.forceEdit);
      });
  }

  setInvoiceEditableStatus(invoice: Invoice, forceEdit: boolean) {
    this.editable = InvoiceExtension.isEditable(invoice, forceEdit);
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

}
