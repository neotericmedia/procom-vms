import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { AuthService } from './../../../common/services/auth.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { CodeValue, UserProfile, FunctionalRole } from './../../../common/model/index';
import { CodeValueService } from './../../../common/services/code-value.service';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { WindowRefService } from '../../../common/index';

import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType, PhxDataTableStateSavingMode } from '../../../common/model/index';

import { CommonService } from '../../../common/index';
import { UrlData } from '../../../common/services/urlData.service';

import dataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-time-sheet-search',
  templateUrl: './time-sheet-search.component.html',
  styleUrls: ['./time-sheet-search.component.less']
})
export class TimeSheetSearchComponent implements OnInit, OnDestroy {
  isAlive: boolean = true;

  decimalColumnFormat = { type: 'fixedPoint', precision: 2 };

  pageTitleKey: string = 'timesheet-search';
  dataSourceUrl: string = 'timesheet/getTimeSheetSearch';
  dataGridComponentName: string = 'TimeSheetSearch';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showOpenInNewTab: true
  });
  oDataParams: string;
  oDataSelect: string = '$select=Id,WorkerName,ClientName,StartDate,EndDate,TotalUnits,PrimaryRateUnitId,TimeSheetStatusId,CurrentApprovers,PORateUnitId,POUnitsRemaining,PONumber';

  timeSheetStatus: string = '';

  private sub: any;

  columns: Array<PhxDataTableColumn>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private localizationService: PhxLocalizationService,
    private winRef: WindowRefService,
    private urlData: UrlData
  ) { }

  ngOnInit() {
    this.buildColumns();

    this.route.data
      .subscribe(d => {
        this.dataSourceUrl = d.dataSourceUrl || this.dataSourceUrl;
        this.oDataParams = d.oDataParameterFilters ? this.oDataSelect + d.oDataParameterFilters : this.oDataSelect;
        this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
        this.pageTitleKey = d.pageTitleKey || this.pageTitleKey;

        this.navigationService.setTitle(this.pageTitleKey);
      });

    /* this.authService.getCurrentProfile()
      .takeWhile(() => this.isAlive)
      .subscribe((profile: UserProfile) => {
        this.setColumnHidingPriorityByRole(profile.FunctionalRoles);
      }); */
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  buildColumns() {
    /**
   * Hiding Priority: WorkerName, ClientName, and SupplierName change in priority for user based on user FunctionalRole
   * 100 (static), 200 (dynamic initial setup), 300 (static)
   */
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        width: 100,
        caption: this.localizationService.translate('timesheet.search.idColumnHeader'),
        dataType: 'number',
        hidingPriority: 104,
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate('timesheet.search.workerNameColumnHeader'),
        hidingPriority: 201,
      }),
      new PhxDataTableColumn({
        dataField: 'ClientName',
        caption: this.localizationService.translate('timesheet.search.clientNameColumnHeader'),
        hidingPriority: 200,
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: this.localizationService.translate('timesheet.search.startDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 304,
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: this.localizationService.translate('timesheet.search.endDateColumnHeader'),
        dataType: 'date',
        hidingPriority: 303,
      }),
      new PhxDataTableColumn({
        dataField: 'TotalUnits',
        caption: this.localizationService.translate('timesheet.search.totalUnitsColumnHeader'),
        dataType: 'decimal',
        format: this.decimalColumnFormat,
        hidingPriority: 301,
      }),
      new PhxDataTableColumn({
        dataField: 'PrimaryRateUnitId',
        caption: this.localizationService.translate('timesheet.search.rateUnitColumnHeader'),
        dataType: 'number',
        lookup: {
          dataSource: this.getRateUnitLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        },
        hidingPriority: 300,
      }),
      new PhxDataTableColumn({
        dataField: 'TimeSheetStatusId',
        caption: this.localizationService.translate('timesheet.search.statusColumnHeader'),
        lookup: {
          dataSource: this.getStatusLookup(),
          valueExpr: 'id',
          displayExpr: 'text'
        },
        hidingPriority: 302,
      }),
      new PhxDataTableColumn({
        dataField: 'CurrentApprovers',
        caption: this.localizationService.translate('timesheet.search.approversColumnHeader'),
        hidingPriority: 103,
      }),
      new PhxDataTableColumn({
        dataField: 'POUnitsRemaining',
        caption: this.localizationService.translate('timesheet.search.poUnitsRemainingColumnHeader'),
        dataType: 'decimal',
        cellTemplate: 'poUnitsCellTemplate',
        hidingPriority: 102,
      }),
      new PhxDataTableColumn({
        dataField: 'PONumber',
        caption: this.localizationService.translate('timesheet.search.poNumberColumnHeader'),
        cellTemplate: 'poNumberCellTemplate',
        hidingPriority: 101,
      }),
    ];
  }

  public onRowSelected(event: any) {
    if (event && event.data && event.data.Id) {
      this.viewTimeSheet(event.data.Id);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewTimeSheet(id) {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent })
      .catch((err) => {
        console.error(`error navigating to timesheet/${id}`, err);
      });
    this.urlData.setUrl(this.router.url);
  }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('timesheet.CodeTimeSheetStatus', true);
  }

  getRateUnitLookup() {
    return this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.RateUnit, true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.description,
          value: codeValue.id
        };
      });
  }

  onContextMenuOpenTab(event) {
    this.winRef.nativeWindow.open(`#/next/timesheet/${event.Id}`, '_blank');
  }

}
