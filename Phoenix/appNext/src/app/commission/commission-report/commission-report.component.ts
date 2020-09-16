import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { AuthService } from './../../common/services/auth.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { CommissionService } from './../commission.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, ApiService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';

import { PhxConstants } from '../../common/model/phx-constants';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';

declare var oreq: any;

@Component({
  selector: 'app-commission-report',
  templateUrl: './commission-report.component.html',
  styleUrls: ['./commission-report.component.less']
})
export class CommissionReportComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;
  reportData: any;
  internalOrgs: any = [];
  commissionUserProfiles: any = [];
  dataSourceUrl: string;
  validationMessages: string;
  odataParams: string = '';
  codeValueGroups: any;

  CommissionUserProfileId?: number;
  OrganizationIdInternal?: number;
  reportDate?: Date;
  reportYear: number;
  reportMonth: number;
  HasAdministratorView: boolean = false;
  hasFinalizeAccess: boolean = false;
  DisplayOwnName: string;
  NotifyName_CommissionFinalize_OnProcessing: string = 'NotifyName_CommissionFinalize_OnProcessing';
  notifyName: any;
  unregisterList: any[] = [];
  @ViewChild('reportDetailsModel')
  reportDetailsModel: PhxModalComponent;

  modelData: any;
  isModelShow: boolean = false;
  reportDetailsModelButtons = [
    {
      icon: 'done',
      tooltip: 'Ok',
      btnType: 'primary',
      action: () => {
        this.reportDetailsModel.hide();
      }
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected commonService: CommonService,
    private navigationService: NavigationService,
    private commissionService: CommissionService,
    private codeValueService: CodeValueService,
    private authService: AuthService,
    private apiService: ApiService,
    private loadingSpinnerService: LoadingSpinnerService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;

    this.route.params.takeWhile(() => this.isAlive).subscribe(params => {
      this.CommissionUserProfileId = +params['CommissionUserProfileId'] || null;
      this.OrganizationIdInternal = +params['OrganizationIdInternal'] || null;
      this.reportYear = +params['reportYear'] || null;
      this.reportMonth = +params['reportMonth'] || null;
    });
  }

  ngOnInit() {
    this.navigationService.setTitle('commission-report');
    this.initSignalR();
    this.HasAdministratorView = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.CommissionReportAdministratorView);
    this.hasFinalizeAccess = this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.CommissionReportFinalize);
    this.registerEvent();
    this.route.data.takeWhile(() => this.isAlive).subscribe(data => {
      if (data && data.resolvedData && data.resolvedData.internalOrgs && data.resolvedData.commissionUserProfiles) {
        this.internalOrgs = data.resolvedData.internalOrgs;
        this.commissionUserProfiles = this.sortCommisionUserProfiles(data.resolvedData.commissionUserProfiles);
      }
      if (!this.HasAdministratorView) {
        this.authService
          .getCurrentProfile()
          .take(1)
          .subscribe(value => {
            this.CommissionUserProfileId = value.Id;
            this.authService.getUserContext().then(user => {
              this.DisplayOwnName = user.User.PreferredFirstName + ' ' + user.User.PreferredLastName;
            });
            if (this.hasQueryData()) {
              this.reportDate = new Date(this.reportYear, this.reportMonth - 1);
              this.getCommissionReport();
            }
          });
      } else {
        if (this.hasQueryData()) {
          this.reportDate = new Date(this.reportYear, this.reportMonth - 1);
          this.getCommissionReport();
        }
        if (!this.commissionUserProfiles.some(e => e.displayName === 'ALL')) {
          this.commissionUserProfiles.unshift({
            CommissionUserProfileFirstName: '',
            CommissionUserProfileId: -1,
            CommissionUserProfileLastName: '',
            displayName: 'ALL'
          });
        }
      }
    });
    if (!this.internalOrgs.some(e => e.Code === 'ALL')) {
      this.internalOrgs.unshift({
        Code : 'ALL',
        DisplayName : 'ALL',
        Id : -1,
        IsTest : false,
        LegalName : 'ALL'
      });
    }
  }

  initSignalR() {
    this.notifyName = {
      CommissionReport: 'CommissionReport'
    };
    this.apiService
      .onPrivate(this.notifyName.CommissionReport, (event, data) => {
        this.reportData = data;
      })
      .then(unregister => {
        this.unregisterList.push(unregister);
      });
  }

  onChangeInternalComp(value) {
    if (value === -1 && this.commissionUserProfiles) {
      this.commissionUserProfiles = this.commissionUserProfiles.filter(function( obj ) {
        return obj.displayName !== 'ALL';
    });
    } else {
      if (!this.commissionUserProfiles.some(e => e.displayName === 'ALL')) {
        this.commissionUserProfiles.unshift({
          CommissionUserProfileFirstName: '',
          CommissionUserProfileId: -1,
          CommissionUserProfileLastName: '',
          displayName: 'ALL'
        });
      }
    }
  }

  onChangeName(value) {
    if (value === -1 && this.internalOrgs) {
      this.internalOrgs = this.internalOrgs.filter(function( obj ) {
        return obj.DisplayName !== 'ALL';
      });
    } else if (this.HasAdministratorView) {
      if (!this.internalOrgs.some(e => e.Code === 'ALL')) {
        this.internalOrgs.unshift({
          Code : 'ALL',
          DisplayName : 'ALL',
          Id : -1,
          IsTest : false,
          LegalName : 'ALL'
        });
      }
    }
  }

  getReport() {
    this.router.navigate(['report', this.CommissionUserProfileId, this.reportDate.getFullYear(), this.reportDate.getMonth() + 1, this.OrganizationIdInternal], { relativeTo: this.route.parent });
  }

  public getCommissionReport() {
    if (this.CommissionUserProfileId && this.OrganizationIdInternal && this.reportDate && this.reportDate instanceof Date && !isNaN(this.reportDate.valueOf())) {
      const command = {
        WorkflowPendingTaskId: -1,
        CommissionUserProfileId: this.CommissionUserProfileId,
        Month: this.reportDate.getMonth() + 1,
        Year: this.reportDate.getFullYear(),
        OrganizationIdInternal: this.OrganizationIdInternal
      };
      this.commissionService.getCommissionReport(command);
    }
  }

  public finalize() {
    if (this.CommissionUserProfileId && this.OrganizationIdInternal && this.OrganizationIdInternal > 0 && this.reportDate && this.reportDate instanceof Date && !isNaN(this.reportDate.valueOf())) {
      const command = {
        // EntityIds: [ this.CommissionUserProfileId ], // zlk
        EntityTypeId: PhxConstants.EntityType.CommissionTransaction,
        WorkflowPendingTaskId: -1,
        CommissionUserProfileId: this.CommissionUserProfileId,
        Month: this.reportDate.getMonth() + 1,
        Year: this.reportDate.getFullYear(),
        OrganizationIdInternal: this.OrganizationIdInternal,
        NotifyName_CommissionFinalize_OnProcessing: this.NotifyName_CommissionFinalize_OnProcessing,
      };

      this.commissionService.finalizeCommissionReport(command).then(() => {
        this.getCommissionReport();
      });
    }
  }

  registerEvent() {
    this.apiService
    .onPrivate(this.NotifyName_CommissionFinalize_OnProcessing, (event, data) => {
      this.loadingSpinnerService.setProgressText(`${data.CountFinishedWithSuccess} of ${data.CountTotal} items processed.`);
    })
    .then(unregister => {
      this.unregisterList.push(unregister);
    });
  }

  public modalInvoicesIssued() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Invoices Issued', dataItems: this.reportData.InvoicesIssued });
  }
  public modalInvoicesReversed() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Invoices Reversed', dataItems: this.reportData.InvoicesReversed });
  }
  public modalInterest() {
    this.showModel({ columnTemplate: 'IntrestModal', title: 'Interest', dataItems: this.reportData.Interest });
  }
  public modalDirectCharges() {
    this.showModel({ columnTemplate: 'AdjustmentsModal', title: 'Direct Charges', dataItems: this.reportData.DirectCharges });
  }
  public modalRecurringCharges() {
    this.showModel({ columnTemplate: 'RecurringAdjustmentsModal', title: 'Recurring Charges', dataItems: this.reportData.RecurringAdjustments });
  }
  public modalCorrections() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Corrections / Reversals', dataItems: this.reportData.Corrections });
  }
  public modalRebooked() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Rebooked Transactions', dataItems: this.reportData.Rebooked });
  }
  public modalScheduledFutureMonth() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Payments scheduled for Future Months', dataItems: this.reportData.ScheduledFutureMonth });
  }
  public modalReadyToReleasePriorMonthTransactions() {
    this.showModel({ columnTemplate: 'EarningsModal', title: 'Ready to Release transactions from Prior Periods', dataItems: this.reportData.ReadyToReleasePriorMonthTransactions });
  }
  public modalReadyToReleasePriorMonthAdjustments() {
    this.showModel({ columnTemplate: 'AdjustmentsModal', title: 'Ready to Release adjustments from Prior Periods', dataItems: this.reportData.ReadyToReleasePriorMonthAdjustments });
  }

  private hasQueryData(): boolean {
    return !!this.CommissionUserProfileId && !!this.OrganizationIdInternal && !!this.reportYear && !!this.reportMonth;
  }

  private showModel(data) {
    this.modelData = data;
    this.reportDetailsModel.title = data.title;
    this.reportDetailsModel.show();
  }

  ngOnDestroy() {
    this.isAlive = false;
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  private sortCommisionUserProfiles(commisionUserProfiles) {
    return commisionUserProfiles
      .sort((a, b) => {
        const compareA = a.displayName.toLowerCase();
        const compareB = b.displayName.toLowerCase();
        if (compareA > compareB) {
          return 1;
        }
        if (compareA < compareB) {
          return -1;
        }
        return 0;
      });
  }
}
