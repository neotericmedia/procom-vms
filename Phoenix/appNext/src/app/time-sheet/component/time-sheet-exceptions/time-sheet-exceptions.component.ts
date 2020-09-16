import { NavigationService } from './../../../common/services/navigation.service';
import { CodeValue } from './../../../common/model/code-value';
import { CodeValueService } from './../../../common/services/code-value.service';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableConfiguration, PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType, PhxConstants } from '../../../common/model/index';

import { CommonService, WindowRefService } from '../../../common/index';

import dataSource from 'devextreme/data/data_source';


import { PhxLocalizationService } from '../../../common/services/phx-localization.service';
import { UrlData } from '../../../common/services/urlData.service';

@Component({
  selector: 'app-time-sheet-exceptions',
  templateUrl: './time-sheet-exceptions.component.html',
  styleUrls: ['./time-sheet-exceptions.component.less']
})
export class TimeSheetExceptionsComponent implements OnInit, OnDestroy {

  decimalColumnFormat = { type: 'fixedPoint', precision: 2 };

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true,
  });

  statusHeaderFilter: any[];

  columns: Array<PhxDataTableColumn>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private navigationService: NavigationService,
    private winRef: WindowRefService,
    private localizationService: PhxLocalizationService,
    private urlData: UrlData
  ) {
  }

  ngOnInit() {
    this.navigationService.setTitle('timesheet-exceptions');
    this.buildColumns();
  }

  ngOnDestroy() {
  }

  buildColumns() {
    this.columns = [
      new PhxDataTableColumn({
        dataField: 'TimeSheetId',
        caption: this.localizationService.translate('timesheet.exceptions.idColumnHeader'),
        dataType: 'number',
        fixed: true,
      }),
      new PhxDataTableColumn({
        dataField: 'Comments',
        caption: this.localizationService.translate('timesheet.exceptions.reasonsColumnHeader'),
        cellTemplate: 'commentsCellTemplate',
        allowSearch: false,
        allowFiltering: false,
        allowSorting: false,
        allowExporting: false,
        allowGrouping: false,
      }),
      new PhxDataTableColumn({
        dataField: 'ClientName',
        caption: this.localizationService.translate('timesheet.exceptions.clientNameColumnHeader'),
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationInternalLegalName',
        caption: this.localizationService.translate('timesheet.exceptions.internalNameColumnHeader'),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: this.localizationService.translate('timesheet.exceptions.workerNameColumnHeader'),
      }),
      new PhxDataTableColumn({
        dataField: 'TotalUnits',
        caption: this.localizationService.translate('timesheet.exceptions.totalUnitsColumnHeader'),
        dataType: 'number',
        format: this.decimalColumnFormat,
      }),
      new PhxDataTableColumn({
        dataField: 'PrimaryRateUnitId',
        caption: this.localizationService.translate('timesheet.exceptions.rateUnitColumnHeader'),
        dataType: 'number',
        lookup: {
          dataSource: this.getRateUnitLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: this.localizationService.translate('timesheet.exceptions.startDateColumnHeader'),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: this.localizationService.translate('timesheet.exceptions.endDateColumnHeader'),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'BankBranchCode',
        caption: this.localizationService.translate('timesheet.exceptions.bankBranchCodeColumnHeader'),
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: this.localizationService.translate('timesheet.exceptions.workOrderNumberColumnHeader'),
        cellTemplate: 'workOrderNumberCellTemplate',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderStartDate',
        caption: this.localizationService.translate('timesheet.exceptions.workOrderStartDateColumnHeader'),
        dataType: 'date',
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderEndDate',
        caption: this.localizationService.translate('timesheet.exceptions.workOrderEndDateColumnHeader'),
        dataType: 'date',
      }),
    ];
  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewTimeSheet(event.currentSelectedRowKeys[0].TimeSheetId);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  onCellClick($event: any) {

    if ($event.rowType === 'data' &&
      $event.column.command !== 'adaptive' &&
      $event.column.cellTemplate !== 'actionCellTemplate' &&
      $event.column.cellTemplate !== 'commentsCellTemplate') {

      if ($event.column.cellTemplate === 'workOrderNumberCellTemplate') {
        this.viewWorkOrder($event.data.AssignmentId, $event.data.WorkOrderId, $event.data.WorkOrderVersionId);
      } else {
        this.viewTimeSheet($event.data.TimeSheetId);
      }
    }
  }

  viewExceptionComment(comment, exception) {
    switch (comment.ActivityId) {
      case PhxConstants.ActionActivity.TimeSheetWorkOrderHasDailyPayRates:
      case PhxConstants.ActionActivity.TimeSheetWorkOrderHasFixedRates:
        this.viewWorkOrder(exception.AssignmentId, exception.WorkOrderId, exception.WorkOrderVersionId);
        break;
      default:
        this.viewTimeSheet(exception.TimeSheetId);
        break;
    }
  }

  viewTimeSheet(id: number): void {
    this.router.navigate([`${id}`], { relativeTo: this.route.parent }).catch((err) => {
      console.error(`error navigating to timesheet/${id}`, err);
    });
    this.urlData.setUrl(this.router.url);
  }

  viewWorkOrder(assignmentId: number, workOrderId: number, workOrderVersionId: number): void {
    // fix me
    // this.$state.go('workorder.edit.parties', { assignmentId: assignmentId, workOrderId: workOrderId, workOrderVersionId: workOrderVersionId });
    this.router.navigate(['/next', 'workorder', assignmentId, workOrderId, workOrderVersionId, 'parties']);
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

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [{
        text: this.localizationService.translate('timesheet.exceptions.openWorkOrderNewTab'),
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
        }
      }];
    }
  }
}
