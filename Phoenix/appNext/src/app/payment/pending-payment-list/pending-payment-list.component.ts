import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserProfile } from './../../common/model/user';
import { AuthService } from './../../common/services/auth.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AggregateSummarizerService, PhxConstants } from '../../common/index';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { PaymentService } from '../payment.service';
import * as moment from 'moment';

@Component({
  selector: 'app-pending-payment-list',
  templateUrl: './pending-payment-list.component.html',
  styleUrls: ['./pending-payment-list.component.less']
})
export class PendingPaymentListComponent implements OnInit {
  paymentPendingGroupings: any;
  codeValueGroups: any;
  companies: any[] = [];
  paymentMethodList: any[] = [];
  currentUserProfile: UserProfile;
  listOrganizationInternal: any[] = [];
  paymentTransactionStatus: any[] = [];
  addedPaymentTransactionTypes: any[] = [];
  constructor(
    private aggregateSummarizer: AggregateSummarizerService,
    private organizationApiService: OrganizationApiService,
    private paymentService: PaymentService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.getAddedPaymentTransactionTypes();
    this.getCurrentProfileDetails();
    this.paymentMethodList = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentMethodType, true);
    this.paymentTransactionStatus = this.codeValueService.getCodeValues(this.codeValueGroups.PaymentTransactionStatus, true).concat(this.addedPaymentTransactionTypes);
    this.getPaymentPendingGroupings();
  }

  ngOnInit() {
    this.navigationService.setTitle('payments-pending');
    this.organizationApiService.getListOrganizationInternal(true)
      .subscribe((internalOrgs) => {
        _.each(internalOrgs, (org: any) => {
          this.listOrganizationInternal.push({ id: org.Id, text: org.DisplayName });
        });
        this.getListPendingPaymentTransaction();
      });
  }

  getAddedPaymentTransactionTypes() {
    this.addedPaymentTransactionTypes.push(
      {
        code: 'ReadyToRelease',
        groupName: 'arbitrary',
        id: PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease,
        parentGroup: null,
        parentId: null,
        text: 'Ready to release'
      },
      {
        code: 'PlannedForRelease',
        groupName: 'arbitrary',
        id: PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.PlannedForRelease,
        parentGroup: null,
        parentId: null,
        text: 'Planned for release'
      },
      {
        code: 'Stopped',
        groupName: 'arbitrary',
        id: PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped,
        parentGroup: null,
        parentId: null,
        text: 'Stopped'
      });
  }

  getCurrentProfileDetails() {
    this.authService.getCurrentProfile()
      .subscribe(userProfile => {
        this.currentUserProfile = userProfile;
      });
  }

  getPaymentPendingGroupings() {
    this.paymentPendingGroupings = {
      companies: {
        apply: function (key, data) {
          return {
            companyId: key,
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
          property: 'paymentMethods',
          target: 'paymentMethods'
        }
      },
      paymentMethods: {
        apply: function (key, data) {
          return {
            methodId: key,
            methods: data.length
          };
        },
        action: function (data) {
          return _.groupBy(data, 'PaymentMethodId');
        },
        template: {
          1: [],
          2: [],
          3: [],
          5: [],
          6: []
        },
        next: {
          property: 'transactions',
          target: 'transactions'
        }
      },

      transactions: {
        apply: function (key, data, context) {
          const item = {
            transactionType: key,
            count: data.length,
            OrganizationIdInternal: null,
            CurrencyId: null,
            PaymentMethodId: null,
            PaymentTransactionStatusId: null
          };

          if (context === PhxConstants.PaymentTransactionStatus.PendingReview && (key === PhxConstants.PaymentTransactionStatus.PendingPaymentProcessing || key === PhxConstants.PaymentTransactionStatus.OnHold)) {
            item.transactionType = 'N/A';
          }

          if (data.length > 0) {
            item.OrganizationIdInternal = data[0].OrganizationIdInternal;
            item.CurrencyId = data[0].CurrencyId;
            item.PaymentMethodId = data[0].PaymentMethodId;
            item.PaymentTransactionStatusId = data[0].PaymentTransactionStatusId;
          }

          return item;
        },
        action: function (data) {
          let originalGrouping = _.groupBy(data, 'PaymentTransactionStatusId');

          const stopped = [];

          if (PhxConstants.PaymentTransactionStatus.PendingPaymentProcessing in originalGrouping) {
            const ready = [];
            const pending = [];

            _.each(originalGrouping[PhxConstants.PaymentTransactionStatus.PendingPaymentProcessing], function (item) {
              if (item.IsPaymentStopped) {
                stopped.push(item);
              } else {
                let extraDays = item.PaymentMethodId === PhxConstants.PaymentMethodType.ADP ? 4 : 2;
                extraDays = (moment().day() === 4 || moment().day() === 5) ? extraDays + 2 : extraDays;

                if (item.PlannedReleaseDate !== null && moment(item.PlannedReleaseDate).isSameOrBefore(moment().startOf('day').add(extraDays, 'days'))) {
                  ready.push(item);
                } else {
                  pending.push(item);
                }
              }
            });
            originalGrouping = _.omit(originalGrouping, PhxConstants.PaymentTransactionStatus.PendingPaymentProcessing);
            originalGrouping[PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease] = ready;
            originalGrouping[PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.PlannedForRelease] = pending;

          }

          if (PhxConstants.PaymentTransactionStatus.OnHold in originalGrouping) {
            const onHold = [];

            _.each(originalGrouping[PhxConstants.PaymentTransactionStatus.OnHold], function (item) {
              if (item.IsPaymentStopped) {
                stopped.push(item);
              } else {
                onHold.push(item);
              }
            });

            originalGrouping[PhxConstants.PaymentTransactionStatus.OnHold] = onHold;
          }

          originalGrouping[PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped] = stopped;

          return originalGrouping;
        },
        template: {
          3: [],
          6: [],
          51: [],
          52: [],
          53: []
        }
      }
    };
  }

  getListPendingPaymentTransaction() {
    this.paymentService.getListPendingPaymentTransaction()
      .subscribe((success => {
        if (success.Items && success.Items.length > 0) {
          const items = _.filter(success.Items, function (item) { return item.CurrencyId > 0; });
          const companies = this.aggregateSummarizer.aggregateGroups(this.paymentPendingGroupings, 'companies', items, null);
          _.each(companies, c => {
            if ((+c.companyId) === this.currentUserProfile.OrganizationId) {
              c.isOpen = true;
              c.currencies[0].isOpen = true;
            }
            const item = _.find(this.listOrganizationInternal, (x: any) => { return x.id === (+c.companyId); });
            c.companyName = item ? item.text : null;
          });

          this.companies = companies.sort((a, b) => {
            return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
          });
          const userCompanyIndex = companies.findIndex(c => c.companyId === this.currentUserProfile.OrganizationId.toString());
          if (userCompanyIndex > -1) {
            const c = companies[userCompanyIndex];
            companies.splice(0, 0, companies.splice(userCompanyIndex, 1)[0]); // shift to 0
          }


        } else {
          this.companies = [];
        }
      }));
  }

  convertToNumber(n: any) {
    return Number(n);
  }

  getPaymentListUrl(transaction: any) {
    if (+(transaction.transactionType) === PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped) {
      // tslint:disable-next-line:max-line-length
      const navigatePath = `/next/payment/organization/${transaction.OrganizationIdInternal}/currency/${transaction.CurrencyId}/method/${transaction.PaymentMethodId}/due/${+transaction.transactionType === PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease ? 1 : 0}/stopped`;
      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to ${transaction.OrganizationIdInternal}/${transaction.CurrencyId}`, err);
      });
    } else {
      // tslint:disable-next-line:max-line-length
      const navigatePath = `/next/payment/organization/${transaction.OrganizationIdInternal}/currency/${transaction.CurrencyId}/method/${transaction.PaymentMethodId}/status/${transaction.PaymentTransactionStatusId}/due/${+transaction.transactionType === PhxConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease ? 1 : 0}`;
      this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent }).catch(err => {
        console.error(`app-organization: error navigating to ${transaction.OrganizationIdInternal}/${transaction.CurrencyId}`, err);
      });
    }
  }
}
