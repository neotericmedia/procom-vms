import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationBarItem } from '../../common/model';
import { PhxConstants, NavigationService, CommonService } from '../../common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { InvoiceService } from '../shared/invoice.service';
import { BillingTransactionGrouped } from '../shared';

@Component({
  selector: 'app-billing-transaction-clearing',
  templateUrl: './billing-transaction-clearing.component.html',
  styleUrls: ['./billing-transaction-clearing.component.less']
})
export class BillingTransactionClearingComponent implements OnInit, OnDestroy {

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
      DisplayText: 'Pending Consolidation',
      Icon: '',
      IsDefault: false
    }
  ];

  organizationIdInternal: number;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private commonService: CommonService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.navigationService.setTitle('invoice', ['Transaction Clearing']);

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
        this.loadCounts();
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadCounts() {
    this.invoiceService.getInternalOrganizationBillingTransactionGrouped(this.organizationIdInternal, true)
      .takeWhile(() => this.isAlive)
      .subscribe((billingTransactionClearingCounts: BillingTransactionGrouped) => {
        if (billingTransactionClearingCounts) {
          this.navigationService.setTitle('invoice', [billingTransactionClearingCounts.OrganizationInternalLegalName, 'Transaction Clearing']);
          this.tabList.forEach(tab => {
            const sourceIndex = billingTransactionClearingCounts.BillingInvoicePresentationStyles.findIndex(i => i.BillingInvoicePresentationStyleId === tab.Id);
            if (sourceIndex !== -1) {
              tab.BadgeCount = billingTransactionClearingCounts.BillingInvoicePresentationStyles[sourceIndex].Count;
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

