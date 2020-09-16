import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserProfile } from '../../common/model';
import { CommonService, NavigationService, PhxConstants } from '../../common';
import { InvoiceService } from '../shared/invoice.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/services/auth.service';
import { BillingTransactionGrouped } from '../shared';

@Component({
  selector: 'app-billing-transaction-clearing-grouped',
  templateUrl: './billing-transaction-clearing-grouped.component.html',
  styleUrls: ['./billing-transaction-clearing-grouped.component.less']
})
export class BillingTransactionClearingGroupedComponent implements OnInit, OnDestroy {
  codeValueGroups: any;
  billingTransactionGrouped: BillingTransactionGrouped[] = [];
  isAlive: boolean = true;
  currentUserProfile: UserProfile;

  constructor(
    private commonService: CommonService,
    private navigationService: NavigationService,
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.navigationService.setTitle('invoice-transaction-clearing');

    this.authService.getCurrentProfile()
      .takeWhile(() => this.isAlive === true)
      .subscribe(userProfile => {
        this.currentUserProfile = userProfile;

        this.invoiceService.getBillingTransactionGrouped()
          .takeWhile(() => this.isAlive === true)
          .subscribe(response => {
            if (response && response.Items) {
              this.billingTransactionGrouped = response.Items;
              this.sortByUserDefaultInternalOrganization();
            }
          },
            error => {
              console.error(error);
              this.commonService.logError('Error loading data', error);
            });
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  sortByUserDefaultInternalOrganization() {
    this.billingTransactionGrouped = this.billingTransactionGrouped
      .sort((a: BillingTransactionGrouped, b: BillingTransactionGrouped) => {
        if (a.OrganizationIdInternal === this.currentUserProfile.OrganizationId
          && b.OrganizationIdInternal !== this.currentUserProfile.OrganizationId) {
          return -1;
        } else if (a.OrganizationIdInternal !== this.currentUserProfile.OrganizationId
          && b.OrganizationIdInternal === this.currentUserProfile.OrganizationId) {
          return 1;
        } else {
          return a.OrganizationInternalLegalName < b.OrganizationInternalLegalName ? -1
            : b.OrganizationInternalLegalName < a.OrganizationInternalLegalName ? 1 : 0;
        }
      });
  }

  goToTransactionClearing(organizationIdInternal: number, billingInvoicePresentationStyleId: number) {
    this.router.navigate([`billingtransactionclearing/internalorganization/${organizationIdInternal}/invoicingtype/${billingInvoicePresentationStyleId}`], { relativeTo: this.route.parent })
      .catch((err) => {
        this.commonService.logError('error navigating to transaction clearing page', err);
      });

  }

}
