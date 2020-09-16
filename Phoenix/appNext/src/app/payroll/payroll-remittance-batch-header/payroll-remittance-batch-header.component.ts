import { PhxNavigationBarComponent } from './../../common/components/phx-navigation-bar/phx-navigation-bar.component';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs/rx';

import { CommonService } from '../../common/services/common.service';
import { ApiService } from './../../common/services/api.service';
import { NavigationBarItem } from '../../common/model/navigation-bar-item';
import { NavigationService } from '../../common/services/navigation.service';
import { PayrollService } from '../payroll.service';
import { RemittanceBatch } from '../model';
import { StateAction, StateActionButtonStyle } from '../../common/model/state-action';

declare var oreq: any;

@Component({
    selector: 'app-payroll-remittance-batch-header',
    templateUrl: './payroll-remittance-batch-header.component.html',
    styleUrls: ['./payroll-remittance-batch-header.component.less']
})
export class PayrollRemittanceBatchHeaderComponent implements OnInit, OnDestroy {

    public remittanceBatch: RemittanceBatch = <any>{};
    subscription: Subscription;
    organizationIdInternal: number;
    public batchId: number;
    oDataParams: string;
    formatDate: string;
    stateActions: StateAction[];
    availableStateActions: number[];
    validationMessages: any;

    @ViewChild('navBar') navBar: PhxNavigationBarComponent;
    tabList: NavigationBarItem[] = [
        {
            Id: 1,
            Name: 'details',
            Path: './',
            DisplayText: 'Details',
            Icon: 'fa-clock-o',
            IsDefault: true,
            SubMenu: []
        },
        {
            Id: 2,
            Name: 'summary',
            Path: './summary',
            DisplayText: 'Summary',
            Icon: 'fa-rocket',
            IsDefault: false
        },
        {
            Id: 3,
            Name: 'workflow',
            Path: './workflow',
            DisplayText: 'Workflow',
            Icon: 'fa-clipboard',
            IsDefault: false
        }
    ];

    constructor(
        private apiService: ApiService,
        private payrollService: PayrollService,
        private navigationService: NavigationService,
        private activatedRoute: ActivatedRoute,
        protected commonService: CommonService,
        private router: Router) {
        this.organizationIdInternal = +this.activatedRoute.snapshot.params['organizationIdInternal'];
        this.batchId = +this.activatedRoute.snapshot.params['batchId'];
    }

    extractData = (batch: any) => {
        if (batch && batch.Items) {
            this.remittanceBatch = batch.Items[0];
            this.initStateActions();
        }
    }

    ngOnInit() {

        // tslint:disable-next-line:max-line-length
        this.oDataParams = oreq.request().withSelect(['Id', 'OrganizationIdInternal', 'OrganizationInternalDisplayName', 'RemittanceDate', 'BatchNumber', 'RemittanceTypeId', 'RemittanceTransactionBatchStatusId', 'TotalAmount', 'CurrencyId', 'AvailableStateActions']).withFilter(oreq.filter('Id').eq(this.batchId)).url();
        this.subscription = this.payrollService.getRemittanceBatches(this.organizationIdInternal, this.oDataParams).subscribe(batch => this.extractData(batch));
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .first()
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) { route = route.firstChild; }
                return route;
            })
            .filter(route =>
                route.outlet === 'primary'
            )
            .subscribe((event) => {
                let index = 0;
                switch (event.routeConfig.path) {
                    case 'details':
                        index = 0;
                        break;
                    case 'summary':
                        index = 1;
                        break;
                    case 'workflow':
                        index = 2;
                        break;

                    default:
                        break;
                }
                this.navBar.activeTab = this.tabList[index];
            }
            );
        this.formatDate = this.commonService.ApplicationConstants.DateFormat.MMM_ddComma_yyyy;
        // this.navigationService.setTitle('Payroll Remittance Batch Details', ['icon icon-payroll']);
    }


    initStateActions() {
        const self = this;
        self.stateActions = [
            {
                actionId: self.commonService.ApplicationConstants.StateAction.RemittanceBatchRecallState,
                displayText: 'Recall',
                onClick: function (action, componentOption, actionOption) {
                    const payload = {
                        EntityIds: [self.batchId]
                    };
                    self.executeStateCommand(action.commandName, payload);
                }
            },
        ];
    }

    executeStateCommand(commandName: string, payload: any) {
        const self = this;
        self.validationMessages = null;
        self.payrollService.executeAction(commandName, payload)
            .subscribe(response => {
                this.commonService.logSuccess(`${commandName} Remittance Batch succeeded.`);
                this.router.navigateByUrl('/next/payroll/remittancebatch/' + this.organizationIdInternal);
            }),
            error => {
                self.validationMessages = error;
            }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
