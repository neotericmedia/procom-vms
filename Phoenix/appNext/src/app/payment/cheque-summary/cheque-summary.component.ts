import { ChequeService } from './../cheque.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserProfile } from './../../common/model/user';
import { AuthService } from './../../common/services/auth.service';
import { CommonService } from '../../common/services/common.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { OrganizationApiService } from './../../organization/organization.api.service';
import { AggregateSummarizerService } from './../../common/services/aggregateSummarizer.service';
import { Component, OnInit } from '@angular/core';
import { NavigationService } from './../../common/services/navigation.service';
import * as _ from 'lodash';
import { EPPChequePaymentStatusList } from '../share/epp-cheque-payment-status-list';

@Component({
    selector: 'cheque-summary',
    templateUrl: './cheque-summary.component.html',
    styleUrls: ['./cheque-summary.component.less']
})
export class ChequeSummaryComponent implements OnInit {
    applicationConstants: any;
    codeValueGroups: any;
    companies: any[] = [];
    internalOrgs: any[];
    currentUserProfile: UserProfile;
    chequeGrouping: any;
    constructor(
        private navigationService: NavigationService,
        private aggregateSummarizer: AggregateSummarizerService,
        private organizationApiService: OrganizationApiService,
        private codeValueService: CodeValueService,
        private commonService: CommonService,
        private authService: AuthService,
        private chequeService: ChequeService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.applicationConstants = this.commonService.ApplicationConstants;
        this.codeValueGroups = this.commonService.CodeValueGroups;
        this.authService.getCurrentProfile()
            .subscribe(userProfile => {
                this.currentUserProfile = userProfile;
            });
        this.chequeGrouping = {
            companies: {
                apply: function (key, data) {
                    return {
                        companyId: key,
                        companyName: data[0].OrganizationalInternalLegalName,
                        items: 0,
                        chequesInProgress: 0,
                        cheques: 0,
                        open: false,
                        hasItems: true
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'OrganizationalIdInternal');
                },
                next: {
                    property: 'banks',
                    target: 'banks'
                }
            },
            banks: {
                apply: function (key, data) {
                    return {
                        bankId: key,
                        bankName: data[0].BankName,
                        description: data[0].Description,
                        count: data.length,
                        chequesInProgress: 0,
                        cheques: 0,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'BankId');
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
                        chequesInProgress: 0,
                        cheques: 0
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'CurrencyId');
                }
            },
        };
    }

    ngOnInit() {
        this.navigationService.setTitle('manage-cheques');
        this.getAllCheques();
    }

    getAllCheques() {
        this.organizationApiService.getListOrganizationInternal(true)
            .subscribe((internalOrgs) => {
                this.internalOrgs = internalOrgs;
                this.chequeService.getAllCheques(null).subscribe((chequeResponse) => {
                    this.companies = this.aggregateSummarizer.aggregateGroups(this.chequeGrouping, 'companies', chequeResponse.Items, null);
                    this.internalOrgs.forEach(org => {
                        let company = this.companies.find((c) => +c.companyId === +org.Id);
                        if (company) {
                            this.setChequeAndInProgressCount(company, chequeResponse, org);
                        } else {
                            company = { companyId: org.Id, items: 0, companyName: org.DisplayName, chequesInProgress: 0, cheques: 0, hasItems: false };
                            this.companies.push(company);
                        }
                        const isCompanyUser = this.currentUserProfile.OrganizationId === +company.companyId;
                        company.isOpen = isCompanyUser;
                        if (company.banks) {
                            company.banks[0].isOpen = true;
                        }

                    });
                    this.companies = this.companies.sort((a, b) => {
                        if (+a.companyId === this.currentUserProfile.OrganizationId && +b.companyId !== this.currentUserProfile.OrganizationId) {
                            return -1;
                        } else if (+a.companyId !== this.currentUserProfile.OrganizationId && +b.companyId === this.currentUserProfile.OrganizationId) {
                            return 1;
                        } else {
                            return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
                        }
                    });

                });
            });

    }

    setChequeAndInProgressCount(company, response, org) {
        company.banks.forEach(bank => {
            bank.currencies.forEach(currency => {
                currency.chequesInProgressCount = response.Items.filter((element) => {
                    return (+element.PaymentStatus === this.applicationConstants.PaymentStatus.WaitingForClearance
                        && element.OrganizationalIdInternal === +org.Id && element.BankName === bank.bankName
                        && +element.CurrencyId === +currency.currencyCode && +element.BankId === +bank.bankId);
                }).length;
                currency.chequesCount = response.Items.filter((element) => {
                    return (element.OrganizationalIdInternal === +org.Id && element.BankName === bank.bankName
                        && +element.CurrencyId === +currency.currencyCode && +element.BankId === +bank.bankId);
                }).length;
                currency.eppPendingReleaseCount = response.Items.filter((element) => {
                    return (element.OrganizationalIdInternal === +org.Id && element.BankName === bank.bankName
                        && +element.CurrencyId === +currency.currencyCode && +element.BankId === +bank.bankId
                        && EPPChequePaymentStatusList.includes(element.PaymentStatus)
                        && !element.EPPChequeBatchId);
                }).length;
                currency.eppBatchesCount = _.uniqBy(response.Items.filter((element) => {
                    return (element.OrganizationalIdInternal === +org.Id && element.BankName === bank.bankName
                        && +element.CurrencyId === +currency.currencyCode && +element.BankId === +bank.bankId
                        && EPPChequePaymentStatusList.includes(element.PaymentStatus)
                        && element.EPPChequeBatchId);
                }), 'EPPChequeBatchId').length;
            });
        });
        company.chequesInProgressCount = response.Items.filter((element) => {
            return (+element.PaymentStatus === this.applicationConstants.PaymentStatus.WaitingForClearance && element.OrganizationalIdInternal === +org.Id);
        }).length;
    }

    goToChequesInProgress(companyId, bankId, currencyCode) {
        this.router.navigate([`chequesinprogress/org/${companyId}/bank/${bankId}/currency/${currencyCode}`], { relativeTo: this.route.parent })
            .catch((err) => {
                console.error(`error navigating to cheques in progress`, err);
            });
    }
    goToCheques(companyId, bankId, currencyCode) {
        this.router.navigate([`cheques/org/${companyId}/bank/${bankId}/currency/${currencyCode}`], { relativeTo: this.route.parent })
            .catch((err) => {
                console.error(`error navigating to cheques`, err);
            });
    }

    goToEPPPendingRelease(companyId, bankId, currencyCode) {
        this.router.navigate([`epppendingrelease/org/${companyId}/bank/${bankId}/currency/${currencyCode}`], { relativeTo: this.route.parent })
            .catch((err) => {
                console.error(`error navigating to EPP pending release`, err);
            });
    }

    goToEPPBatches(companyId, bankId, currencyCode) {
        this.router.navigate([`eppchequebatch/org/${companyId}/bank/${bankId}/currency/${currencyCode}`], { relativeTo: this.route.parent })
            .catch((err) => {
                console.error(`error navigating to EPP Batches List`, err);
            });
    }


}


