import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationBarItem } from '../../common/model';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonService, PhxConstants, NavigationService } from '../../common';
import { InvoiceService } from '../shared/invoice.service';
import { InvoiceGrouped } from '../shared';

@Component({
  selector: 'app-invoice-clearing',
  templateUrl: './invoice-clearing.component.html',
  styleUrls: ['./invoice-clearing.component.less']
})
export class InvoiceClearingComponent implements OnInit, OnDestroy {

  isAlive: boolean = true;
  currentUrl: string;
  tabList: NavigationBarItem[] = [
    {
      Id: PhxConstants.BillingInvoicePresentationStyle.OneInvoicePerTransactions,
      Name: 'invoicingtype/' + PhxConstants.BillingInvoicePresentationStyle.OneInvoicePerTransactions,
      Path: './invoicingtype/' + PhxConstants.BillingInvoicePresentationStyle.OneInvoicePerTransactions,
      DisplayText: 'Single',
      Icon: '',
      IsDefault: true
    },
    {
      Id: PhxConstants.BillingInvoicePresentationStyle.Consolidated,
      Name: 'invoicingtype/' + PhxConstants.BillingInvoicePresentationStyle.Consolidated,
      Path: './invoicingtype/' + PhxConstants.BillingInvoicePresentationStyle.Consolidated,
      DisplayText: 'Consolidated',
      Icon: '',
      IsDefault: false
    }
  ];

  organizationIdInternal: number;
  billingInvoicePresentationStyleId: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private commonService: CommonService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.navigationService.setTitle('invoice', ['Invoice Clearing']);

    this.currentUrl = this.router.url;

    this.router.events
      .takeWhile(() => this.isAlive)
      .subscribe(
        (val) => {
          if (val instanceof NavigationEnd) {
            this.currentUrl = val.url;
          }
        });

    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe(params => {
        this.organizationIdInternal = +params['organizationIdInternal'];
        this.billingInvoicePresentationStyleId = +params['billingInvoicePresentationStyleId'];
        this.loadCounts();
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadCounts() {
    this.invoiceService.getInternalOrganizationPendingReleaseGrouped(this.organizationIdInternal, true)
      .takeWhile(() => this.isAlive)
      .subscribe((invoiceClearingCounts: InvoiceGrouped) => {
        if (invoiceClearingCounts) {
          this.navigationService.setTitle('invoice', [invoiceClearingCounts.OrganizationInternalLegalName, 'Invoice Clearing']);
          this.tabList.forEach(tab => {
            const sourceIndex = invoiceClearingCounts.BillingInvoicePresentationStyles.findIndex(i => i.BillingInvoicePresentationStyleId === tab.Id);
            if (sourceIndex !== -1) {
              tab.BadgeCount = invoiceClearingCounts.BillingInvoicePresentationStyles[sourceIndex].Count;
            } else {
              tab.BadgeCount = 0;
            }
          });
        }
      },
        error => {
          console.error(error);
          this.commonService.logError('Error loading data', error);
        });
  }

}
