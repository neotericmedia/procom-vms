import { PhxDateBoxComponent } from './../../common/components/phx-date-box/phx-date-box.component';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { Subscription } from 'rxjs/Rx';

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PaymentService } from './../payment.service';

import { NavigationService } from './../../common/services/navigation.service';
import { CommonService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, UserInfo } from '../../common/model/index';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxConstants } from '../../common/model/phx-constants';

import { PhxDataTableComponent } from './../../common/components/phx-data-table/phx-data-table.component';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import * as moment from 'moment';
import * as _ from 'lodash';
import { AuthService } from '../../common/services/auth.service';
import { NavigationBarItem } from '../../common/model/navigation-bar-item';
import { PhxNavigationBarComponent } from '../../common/components/phx-navigation-bar/phx-navigation-bar.component';
import { Observable } from 'rxjs/Observable';
import { PaymentYtdEarningsExport } from './payment-ytd-earnings-export';
import { PaymentModuleResourceKeys } from './../payment-module-resource-keys';
declare var oreq: any;

@Component({
  selector: 'app-payment-ytd-earnings',
  templateUrl: './payment-ytd-earnings.component.html',
  styleUrls: ['./payment-ytd-earnings.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentYtdEarningsComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;
  WorkerProfileId?: number;
  selectedWorkerProfile?: any;
  workerProfiles: any = [];
  isInternal: boolean = false;

  paymentModuleResourceKeys: any;
  userInfo: UserInfo;
  reportYear: number;
  arrYear: Array<number>;
  profileId: number;
  startDate: any;
  endDate: any;
  ytdEarningDetails: any;
  ytdEarning: any;
  ytdAvailableCols: any;
  internalOrganizations: any = [];
  private navBarComponent: PhxNavigationBarComponent;
  public getInternalOrgLookupCallback: Function;
  subActiveRoute: Subscription;

  @ViewChild('navBar')
  set content(content: PhxNavigationBarComponent) {
    this.navBarComponent = content;
  }
  tabList: NavigationBarItem[] = [
    {
      Id: 1,
      Name: 'summary',
      Path: './',
      DisplayText: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.summary),
      Icon: 'fa-rocket',
      IsDefault: true,
      SubMenu: []
    },
    {
      Id: 2,
      Name: 'details',
      Path: './',
      DisplayText: this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.details),
      Icon: 'fa-clock-o',
      IsDefault: false
    }
  ];

  constructor(
    private router: Router,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    protected commonService: CommonService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private codeValueService: CodeValueService,
    private loadingSpinnerService: LoadingSpinnerService,
    protected localizationService: PhxLocalizationService
  ) {
    this.paymentModuleResourceKeys = PaymentModuleResourceKeys;
    this.activatedRoute.data.subscribe(data => {
      if (data && data.resolvedData && data.resolvedData.internalOrgs) {
        this.internalOrganizations = data.resolvedData.internalOrgs;
      }
    });
  }

  ngOnInit() {
    this.navigationService.setTitle('payment-ytd-earning');
    this.startDate = moment()
      .startOf('year')
      .toDate();
    this.endDate = moment()
      .endOf('month')
      .toDate();
    this.authService
      .getCurrentUser()
      .take(1)
      .combineLatest(this.authService.getCurrentProfile().take(1))
      .subscribe(item => {
        const [userInfo, profile] = item;

        this.userInfo = userInfo;
        this.isInternal = this.userInfo.Profiles[0].ProfileTypeId === PhxConstants.ProfileType.Internal;
        this.profileId = profile.Id;
        this.getInternalOrgLookupCallback = this.getInternalOrgLookup.bind(this);
        
        // Show report during initialize if single worker only. If list of workers, select the worker before get report and only internal can see list of workers. 
        if (!this.isInternal) {  
          this.getReport();
        }
      });
    this.activatedRoute.data.takeWhile(() => this.isAlive).subscribe(data => {
      if (data && data.resolvedData && data.resolvedData.workerProfiles) {
        this.workerProfiles = data.resolvedData.workerProfiles;
      }
    });
  }

  onStartDateChange(dateControl: PhxDateBoxComponent) {
    if (this.endDate && this.endDate < dateControl.value) {
      this.endDate = null;
    }
  }

  export() {
    const csvText = PaymentYtdEarningsExport.produceCsvText(this.ytdEarningDetails, this.userInfo, this.startDate, this.endDate, this.codeValueService, this.commonService, this.localizationService);
    const encodedData = btoa(csvText);
    const fileName = this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.reportName) + '.csv';
    this.commonService.base64FileSaveAs(encodedData, 'text/csv', 'utf-8', fileName);
  }

  getReport() {
    if (this.startDate && this.endDate) {
      this.loadingSpinnerService.show();

      const profId = this.WorkerProfileId != null ? this.WorkerProfileId : this.profileId;
      this.selectedWorkerProfile = this.userInfo.Profiles[0];
      if (this.WorkerProfileId != null) {
        this.selectedWorkerProfile = this.workerProfiles.find(prof => prof.Id === this.WorkerProfileId);
      }

      this.paymentService
        .getYTDEarningInfo(profId, this.startDate, this.endDate)
        .mergeMap(
          info => {
            const cols = _.filter(this.generateCols(info), col => {
              return col.value === true;
            }).map(col => {
              return col.key;
            });
            return Observable.forkJoin([this.paymentService.getYTDEarningInfoDetails(profId, this.startDate, this.endDate, cols), this.paymentService.getYTDEarningMaximumInfo(profId, this.startDate, this.endDate)]).map((data: any[]) => {
              return { items: data[0], maxInfo: data[1] };
            });
          },
          (info: any, details: any) => {
            info.workerProfile = this.selectedWorkerProfile;
            info.data = details.items;
            info.maxInfo = details.maxInfo;
            return info;
          }
        )
        .subscribe(
          (data: any) => {
            this.ytdEarning = data;
            this.ytdEarningDetails = {
              items: data.data.Items,
              maxInfo: data.maxInfo,
              workerProfile: this.selectedWorkerProfile,
              filters: {
                startDate: this.startDate,
                endDate: moment(this.endDate)
                  .endOf('month')
                  .toDate()
              }
            };
            this.translateGridData(this.ytdEarningDetails.items);
            this.ytdEarningDetails.cols = this.ytdAvailableCols;
            this.ref.detectChanges();
            this.navBarComponent.activeTab = this.tabList[0];
            this.ref.detectChanges();
            this.loadingSpinnerService.hide();
          },
          err => {
            console.log(err);
            this.loadingSpinnerService.hide();
          }
        );
    } else {
      this.ytdEarningDetails = null;
    }
  }

  generateCols(colInfo) {
    const c = _.reduce(
      _.pickBy(colInfo, (value, key) => _.includes(key, 'Has')),
      function(result, value, key) {
        result[key] = value;
        return result;
      },
      {}
    );
    const cols = _.mapKeys(c, (value: any, key: any) => {
      return key.replace('Has', 'Amount');
    });

    this.ytdAvailableCols = Object.keys(cols).map(key => ({ key, value: cols[key], name: key.replace('Total', '') })); //  Object.keys(cols).map(key => { const a = {}; a[key] = cols[key]; return a; });
    return this.ytdAvailableCols;
  }

  onTabSelected(item: any) {}

  get isExportEnable() {
    let retVal = false;
    if (this.ytdEarningDetails && this.ytdEarningDetails.filters) {
      if (this.ytdEarningDetails.filters.startDate && this.ytdEarningDetails.filters.endDate) {
        if (
          moment(this.startDate).format('MMM-YYYY') === moment(this.ytdEarningDetails.filters.startDate).format('MMM-YYYY') &&
          moment(this.endDate).format('MMM-YYYY') === moment(this.ytdEarningDetails.filters.endDate).format('MMM-YYYY')
        ) {
          retVal = true;
        }
      }
    }
    return retVal;
  }

  getInternalOrgLookup() {
    return this.internalOrganizations.sort(this.compareValues('text'));
  }

  compareValues(key, order = 'asc') {
    return function(a, b) {
      let comparison = 0;

      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return comparison;
      }

      const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }

      return order === 'desc' ? comparison * -1 : comparison;
    };
  }

  translateGridData(items: any) {
    items.forEach(rowItem => {
      if (rowItem['IsOpeningBalance']) {
        rowItem['PaymentTransactionNumber'] = this.localizationService.translate(PaymentModuleResourceKeys.ytdEarning.openingBalance);
      }
    });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
