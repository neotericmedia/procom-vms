import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService, CommonService } from '../../common/index';
import { Router, ActivatedRoute } from '@angular/router';
import { UserProfile } from '../../common/model/index';
import { AuthService } from '../../common/services/auth.service';
import { InvoiceService } from './../shared/invoice.service';
import { InvoiceGrouped } from '../shared/index';

@Component({
  selector: 'app-invoice-clearing-grouped',
  templateUrl: './invoice-clearing-grouped.component.html',
  styleUrls: ['./invoice-clearing-grouped.component.less']
})
export class InvoiceClearingGroupedComponent implements OnInit, OnDestroy {
  codeValueGroups: any;
  invoiceGrouped: InvoiceGrouped[] = [];
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
    this.navigationService.setTitle('invoice-clearing');

    this.authService.getCurrentProfile()
      .takeWhile(() => this.isAlive === true)
      .subscribe(userProfile => {
        this.currentUserProfile = userProfile;

        this.invoiceService.getPendingReleaseGrouped()
          .takeWhile(() => this.isAlive === true)
          .subscribe(response => {
            if (response && response.Items) {
              this.invoiceGrouped = response.Items;
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
    this.invoiceGrouped = this.invoiceGrouped
      .sort((a: InvoiceGrouped, b: InvoiceGrouped) => {
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

  goToRelease(organizationIdInternal, billingInvoicePresentationStyleId) {
    this.router.navigate([`invoiceclearing/internalorganization/${organizationIdInternal}/invoicingtype/${billingInvoicePresentationStyleId}`], { relativeTo: this.route.parent })
      .catch((err) => {
        this.commonService.logError('error navigating to release page', err);
      });
  }

}
