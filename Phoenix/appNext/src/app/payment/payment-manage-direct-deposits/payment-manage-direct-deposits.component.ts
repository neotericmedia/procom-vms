// angular
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../payment.service';
import { NavigationService, CodeValueService, CommonService } from '../../common';
import { AuthService } from '../../common/services/auth.service';
import { UserInfo } from '../../common/model';
import { groupBy, omit } from 'lodash';
import { AggregateSummarizerService } from '../../common/services/aggregateSummarizer.service';

@Component({
  selector: 'app-payment-manage-direct-deposits',
  templateUrl: './payment-manage-direct-deposits.component.html',
  styleUrls: ['./payment-manage-direct-deposits.component.less']
})

export class PaymentManageDirectDepositsComponent implements OnInit {
  private companies;
  defaultOrganizationId: number;
  codeValueGroups: any;
  orgID: any;
  companyCount: number = 0;
  currencyList: Array<any>;
  paymentReleaseBatchStatusList: Array<any>;

  constructor(
    private paymentService: PaymentService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private authService: AuthService,
    private aggregateSummarizerService: AggregateSummarizerService,
    private activatedRoute: ActivatedRoute,
    protected router: Router,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  private directDepositBatchGroupings: any = {
    companies: {
      apply: function (key, data) {
        return {
          companyName: key,
          companyId: data[0].OrganizationIdInternal,
          count: 0,
          open: false
        };
      },
      action: function (data) {
        return groupBy(data, 'InternalOrganizationLegalName');
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
        return groupBy(data, 'InternalOrganizationBankAccountCurrencyId');
      },
      next: {
        property: 'bankAccounts',
        target: 'bankAccounts'
      }
    },
    bankAccounts: {
      apply: function (key, data) {
        return {
          bankAccountName: key,
          bankAccountId: data[0].InternalOrganizationBankAccountId,
          count: data.length,
          open: false
        };
      },
      action: function (data) {
        return groupBy(data, 'InternalOrganizationBankAccountBankName');
      },
      next: {
        property: 'statuses',
        target: 'statuses'
      }
    },

    statuses: {
      apply: function (key, data) {
        return {
          statusId: key,
          count: data.length > 0 ? data[0].Count : 0
        };
      },
      action: function (data) {
        let statuses = groupBy(data, 'BatchStatusId');
        statuses = omit(statuses, ['2', '3', '4', '6', '7']);
        return statuses;
      },
      template: {
        1: []
      }
    }
  };

  ngOnInit() {
    this.navigationService.setTitle('payments-managedd');

    this.getUserDetails();
    this.getLists();
    this.getPaymentGroups();
  }

  getUserDetails() {
    this.authService.getCurrentUser().subscribe((user: UserInfo) => {
      this.orgID = user.Profiles[0].OrganizationId;
    });
  }

  getPaymentGroups() {
    this.paymentService.getPaymentDirectDepositBatchesUpdated().subscribe((data: any) => {
      const groupedCompanies = this.aggregateSummarizerService.aggregateGroups(this.directDepositBatchGroupings, 'companies', data);
      groupedCompanies.forEach(company => {
        company.currencies.forEach(currency => {
          currency.count = 0;
          currency.bankAccounts.forEach(account => {
            let accountCount = 0;
            account.statuses.forEach(status => {
              currency.count += status.count;
              accountCount += status.count;
            });
            account.statuses.length = 1;
            account.statuses[0].count = accountCount;
          });
          company.count += currency.count;
        });
        if (company.companyId === this.orgID) {
          company.open = true;
          company.currencies[0].open = true;
        }
      });
      if (this.orgID) {
        const self = this;
        this.companies = groupedCompanies.sort(function (a, b) {
          if (a.companyId === self.orgID && b.companyId !== self.orgID) {
            return -1;
          } else if (a.companyId !== self.orgID && b.companyId === self.orgID) {
            return 1;
          } else {
            return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
          }
        });
      } else {
        this.companies = groupedCompanies;
      }
      this.companyCount = this.companies.length;
    });
  }

  getLists() {
    this.currencyList = this.codeValueService.getCodeValues(this.codeValueGroups.Currency, true);
    this.paymentReleaseBatchStatusList = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentReleaseBatchStatus, true);
  }

  bankaccountRedirect(bankAccountId: any, currencyCode: any) {
    const nav = (accountId: any, currencyId: any) => {
      const navigatePath = `/next/payment/directdepositbatch/searchbybankaccount/${accountId}/${currencyId}`;
      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`Direct Deposit Batch : Error navigating to ${accountId}/${currencyId}`, err);
      });
    };
    nav(bankAccountId, currencyCode);
  }

  showCompany(company, companyData) {
    const isOpen = company.open;
    companyData.forEach(eachComp => {
      eachComp.open = false;
    });
    company.open = !isOpen;
  }

  showCurrency(currency, currencyData) {
    const isOpen = currency.open;
    currencyData.forEach(eachCurrency => {
      eachCurrency.open = false;
    });
    currency.open = !isOpen;
  }
}








