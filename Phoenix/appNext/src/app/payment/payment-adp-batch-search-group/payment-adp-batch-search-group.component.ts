import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './../../common/services/auth.service';
import { PaymentService } from './../payment.service';
import { AggregateSummarizerService } from '../../common/index';
import { NavigationService } from './../../common/services/navigation.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { UserProfile } from './../../common/model/user';
import { CommonService } from '../../common/services/common.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-payment-adp-batch-search-group',
  templateUrl: './payment-adp-batch-search-group.component.html',
  styleUrls: ['./payment-adp-batch-search-group.component.less']
})
export class PaymentAdpBatchSearchGroupComponent implements OnInit {
  companies: any[] = [];
  internalOrgs: any[];
  batchGrouping: any;
  currentUserProfile: UserProfile;
  codeValueGroups: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private aggregateSummarizer: AggregateSummarizerService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private organizationApiService: OrganizationApiService,
    private commonService: CommonService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;

    this.authService.getCurrentProfile().subscribe(userProfile => {
      this.currentUserProfile = userProfile;
    });

    this.batchGrouping = {
      companies: {
        apply: function (key, data) {
          return {
            OrganizationIdInternal: key,
            InternalOrganizationLegalName: data[0].InternalOrganizationLegalName,
            PendingCount: 0,
            TotalCount: 0,
            open: false
          };
        },
        action: function (data) {
          return _.groupBy(data, 'OrganizationIdInternal');
        },
        next: {
          property: 'currencies',
          target: 'currencies'
        }
      },
      currencies: {
        apply: function (key, data) {
          return {
            CurrencyId: key,
            PendingCount: data[0].PendingCount,
            TotalCount: data[0].TotalCount,
            open: false
          };
        },
        action: function (data) {
          return _.groupBy(data, 'CurrencyId');
        },
      },
    };
  }

  ngOnInit() {
    this.navigationService.setTitle('payment-apd-batch-search-group');
    this.organizationApiService.getListOrganizationInternal(true)
      .subscribe((internalOrgs) => {
        this.internalOrgs = internalOrgs;
        this.paymentService.getPaymentAdpBatchesGrouped('')
          .subscribe((groupedResponse) => {
            this.companies = this.aggregateSummarizer.aggregateGroups(this.batchGrouping, 'companies', groupedResponse.Items, null);

            this.internalOrgs.forEach(org => {
              // tslint:disable-next-line:triple-equals
              let company = this.companies.find((c) => c.OrganizationIdInternal == org.Id);
              if (company) {
                // tslint:disable-next-line:triple-equals

                company.currencies.forEach(currency => {
                  company.PendingCount += currency.PendingCount;
                  company.TotalCount += currency.TotalCount;
                });
              } else {
                company = { OrganizationIdInternal: org.Id, InternalOrganizationLegalName: org.LegalName, PendingCount: 0, TotalCount: 0 };
                this.companies.push(company);
              }

              // tslint:disable-next-line:triple-equals
              const isCompanyUser = this.currentUserProfile.OrganizationId == company.OrganizationIdInternal;
              company.isOpen = isCompanyUser;
            });
            this.companies = this.companies.sort((a, b) => {
              // tslint:disable-next-line:triple-equals
              if (a.OrganizationIdInternal == this.currentUserProfile.OrganizationId && b.OrganizationIdInternal != this.currentUserProfile.OrganizationId) {
                return -1;
                // tslint:disable-next-line:triple-equals
              } else if (a.OrganizationIdInternal != this.currentUserProfile.OrganizationId && b.OrganizationIdInternal == this.currentUserProfile.OrganizationId) {
                return 1;
              } else {
                return a.InternalOrganizationLegalName < b.InternalOrganizationLegalName ? -1 : b.InternalOrganizationLegalName < a.InternalOrganizationLegalName ? 1 : 0;
              }
            });
          });
      });
  }

  goToAdpBatchSearchByCurrency(companyId, currencyId) {
    this.router.navigate([`adp`, companyId, currencyId], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to remittancebatch`, err);
      });
  }
}
