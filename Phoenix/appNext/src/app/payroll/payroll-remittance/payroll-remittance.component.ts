import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserProfile } from './../../common/model/user';
import { AuthService } from './../../common/services/auth.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { PayrollService } from './../payroll.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AggregateSummarizerService } from '../../common/index';
import { OrganizationApiService } from './../../organization/organization.api.service';
@Component({
  selector: 'app-payroll-remittance',
  templateUrl: './payroll-remittance.component.html',
  styleUrls: ['./payroll-remittance.component.less']
})
export class PayrollRemittanceComponent implements OnInit {
  pageTitle: string;
  pendingRemittanceGrouping: any;
  applicationConstants: any;
  codeValueGroups: any;
  companies: any[] = [];
  internalOrgs: any[];
  currentUserProfile: UserProfile;
  getSafeCodeValue(id) {
    const val: any = this.codeValueService.getCodeValue(id, 'payroll.CodeSourceDeductionType');
    return val && val.text;
  }

  constructor(
    private payrollService: PayrollService,
    private aggregateSummarizer: AggregateSummarizerService,
    private OrganizationApiService: OrganizationApiService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const that = this;
    this.applicationConstants = this.commonService.ApplicationConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.authService.getCurrentProfile()
      .subscribe(userProfile => {
        this.currentUserProfile = userProfile;
      });
    this.pendingRemittanceGrouping = {
      companies: {
        apply: function (key, data) {
          return {
            companyId: key,
            companyName: data[0].OrganizationInternalLegalName,
            pendingItems: 0,
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
            currencyCode: key,
            count: data.length,
            open: false
          };
        },
        action: function (data) {
          return _.groupBy(data, 'CurrencyId');
        },
        next: {
          property: 'sourcedeductions',
          target: 'sourcedeductions'
        }
      },
      sourcedeductions: {
        apply: function (key, data) {
          return {
            SourceDeductionTypeId: key,
            SourceDeductionTypeName: that.getSafeCodeValue(key),
            Id: data[0].SourceDeductionTypeId,
            count: data.length,
            open: false
          };
        },
        action: function (data) {
          return _.groupBy(data, function (d) {
            const id = d['SourceDeductionTypeId'];
            let val;
            switch (id) {
              case that.applicationConstants.SourceDeductionType.WCB:
                val = 'Worker Safety';
                break;
              case that.applicationConstants.SourceDeductionType.HealthCare:
                val = 'Health Tax';
                break;
              default:
                val = 'Payroll Deduction';
                break;
            }
            return val;
          });
        }
      },
    };
  }

  ngOnInit() {
      this.navigationService.setTitle('remittance-manage');
    this.OrganizationApiService.getListOrganizationInternal(true)
      .subscribe((internalOrgs) => {
        this.internalOrgs = internalOrgs;
        this.payrollService.getListPendingRemittanceTransaction(null)
          .subscribe((pendingRemittancesResponse) => {
            this.companies = this.aggregateSummarizer.aggregateGroups(this.pendingRemittanceGrouping, 'companies', pendingRemittancesResponse.Items, null);
            this.internalOrgs.forEach(org => {
              // tslint:disable-next-line:triple-equals
              let company = this.companies.find((c) => c.companyId == org.Id);
              if (company) {
                // tslint:disable-next-line:triple-equals

                company.currencies.forEach(currency => {
                  company.pendingItems += currency.count;
                  currency.sourcedeductions = _.sortBy(currency.sourcedeductions, (e: any) => {
                    const rank = { 'Worker Safety': 3, 'Health Tax': 2, 'Payroll Deduction': 1 };
                    return rank[e.SourceDeductionTypeId];
                  });
                });
              } else {
                company = { companyId: org.Id, pendingItems: 0, companyName: org.DisplayName, sourcedeductions: [] };
                this.companies.push(company);
              }
              const isCompanyUser = this.currentUserProfile.OrganizationId == company.companyId;
              company.isOpen = isCompanyUser;
              company.currencies && company.currencies[0] && (company.currencies[0].open = isCompanyUser);
              
            });
            this.companies = this.companies.sort((a, b) => {
              // tslint:disable-next-line:triple-equals
              if (a.companyId == this.currentUserProfile.OrganizationId && b.companyId != this.currentUserProfile.OrganizationId) {
                return -1;
                // tslint:disable-next-line:triple-equals
              } else if (a.companyId != this.currentUserProfile.OrganizationId && b.companyId == this.currentUserProfile.OrganizationId) {
                return 1;
              } else {
                return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
              }
            });
          });

      });
  }

  goToRemittedBatches(company) {
    this.router.navigate([`remittancebatch`, company.companyId], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to remittancebatch`, err);
      });
  }

  goToPendingRemittanceByType(company, currency, sourceDeduction){
    let deductionPath ;
    switch (sourceDeduction.Id) {
      case 4:
        deductionPath = 'pending-ht-remittance';
        break;
      case 5:
        deductionPath = 'pending-ws-remittance';
        break;
      default:
        deductionPath = 'pending-pd-remittance';
        break;
    }
    this.router.navigate([deductionPath, 'organization' , company.companyId, 'currency', currency.currencyCode], { relativeTo: this.route.parent });
  }
}
