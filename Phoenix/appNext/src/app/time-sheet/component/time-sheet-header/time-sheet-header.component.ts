import { Component, OnInit, OnChanges, OnDestroy, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as moment from 'moment';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { Observable } from 'rxjs/rx';
import { Subscription } from 'rxjs/Subscription';

import { PhxLocalizationService } from '../../../common/services/phx-localization.service';
import { CommonService } from '../../../common/services/common.service';
import { ModalDatePickerData } from './../../../common/model/modal-date-picker-data';
import { NavigationBarItem } from '../../../common/model/navigation-bar-item';
import { StateService } from '../../../common/state/state.module';
import { PhxModalDatePickerComponent } from '../../../common/components/phx-modal-date-picker/phx-modal-date-picker.component';
import { WorkflowAction, PhxConstants } from '../../../common/model/index';

import { TimeSheet, TimeSheetHeader, TimeSheetUnitsByRateType } from '../../model';
import { TimeSheetService } from '../../service/time-sheet.service';

@Component({
  selector: 'app-time-sheet-header',
  templateUrl: './time-sheet-header.component.html',
  styleUrls: ['./time-sheet-header.component.less']
})
export class TimeSheetHeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input('timeSheet') timeSheet: TimeSheet;
  private alive: boolean = true;
  private workflowUpdated: boolean = false;
  headers: TimeSheetHeader[] = [];
  headerExists = false;
  timeSheetDate: Date = null;
  timeSheetHeaderSubscription: Subscription;
  totalsByRateType: Array<TimeSheetUnitsByRateType>;
  modalDatePickerModel: ModalDatePickerData = {
    Title: '',
    Caption: ''
  };
  @ViewChild('modalTimeCardPeriodDatePicker')
  modalTimeCardPeriodDatePicker: PhxModalDatePickerComponent;
  showTotals = false;

  headerFields: Array<any>;
  headerFieldsStructure = [
    {
      Key: 'workOrderLabel',
      Label: 'timesheet.header.workOrderLabel',
      Value: null,
      Priority: 4,
      Visible: true,
      DisplayOrder: 2,
      MinWidth: 2,
      MaxWidth: 2
    },
    {
      Key: 'idLabel',
      Label: 'timesheet.header.idLabel',
      Value: null,
      Priority: 3,
      Visible: true,
      DisplayOrder: 3,
      MinWidth: 2,
      MaxWidth: 2
    },
    {
      Key: 'clientNameLabel',
      Label: 'timesheet.header.clientNameLabel',
      Value: null,
      Priority: 2,
      Visible: true,
      DisplayOrder: 4,
      MinWidth: 2,
      MaxWidth: 2
    },
    {
      Key: 'statusLabel',
      Label: 'timesheet.header.statusLabel',
      Value: null,
      Priority: 1,
      Visible: true,
      DisplayOrder: 7,
      MinWidth: 2,
      MaxWidth: 3
    },
    {
      Key: 'approversLabel',
      Label: 'timesheet.header.approversLabel',
      Value: null,
      Priority: 1,
      Visible: true,
      DisplayOrder: 8,
      MinWidth: 2,
      MaxWidth: 3
    },
    {
      Key: 'poNumberLabel',
      Label: 'timesheet.header.poNumberLabel',
      Value: null,
      Priority: 4,
      Visible: true,
      DisplayOrder: 5,
      MinWidth: 2,
      MaxWidth: 2
    },
    {
      Key: 'poUnitsRemainingLabel',
      Label: 'timesheet.header.poUnitsRemainingLabel',
      Value: null,
      Priority: 1,
      Visible: true,
      DisplayOrder: 6,
      MinWidth: 2,
      MaxWidth: 2
    }
  ];

  constructor(
    private timeSheetService: TimeSheetService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private state: StateService,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
  ) {
    this.modalDatePickerModel.Title = this.localizationService.translate('timesheet.header.datePickerTitle');
    this.modalDatePickerModel.Caption = this.localizationService.translate('timesheet.header.datePickerDescription');
  }

  ngOnInit() {
    this.timeSheetService.workflowUpdated$()
      .takeWhile(() => this.alive)
      .subscribe(workflowUpdated => {
        this.workflowUpdated = workflowUpdated;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const prevTimeSheet: TimeSheet = changes && changes.timeSheet ? changes.timeSheet.previousValue : null;
    const currTimeSheet: TimeSheet = changes && changes.timeSheet ? changes.timeSheet.currentValue : null;

    if (currTimeSheet) {
      if (!this.timeSheetDate) {
        this.timeSheetDate = this.timeSheet.StartDate;
      }

      const prevId: number = prevTimeSheet ? prevTimeSheet.Id : 0;
      const currId: number = currTimeSheet ? currTimeSheet.Id : 0;
      if (prevId !== currId) {
        this.configureModalDatePicker(this.timeSheet);
        this.setupHeaderFields();
      }

      if (this.timeSheet.TimeSheetTypeId === PhxConstants.TimeSheetType.Manual) {
        this.totalsByRateType = this.timeSheetService.getTimeSheetUnitsByRateType(
          this.timeSheet
        );
      } else {
        this.totalsByRateType = this.timeSheetService.getTimeSheetUnitsForImported(
          this.timeSheet
        );
      }
      if (this.workflowUpdated) {
        this.workflowUpdated = false;
        this.setupHeaderFields();
      }

      if (!this.timeSheetHeaderSubscription) {
        this.timeSheetHeaderSubscription = this.state
          .select<TimeSheetHeader[]>('timeSheet.headers.Items')
          .takeWhile(() => this.alive)
          .subscribe(o => {
            this.headers = [];
            if (o !== undefined) {
              this.headers = o;
              this.configureModalDatePicker(this.timeSheet);
            }
          });
      }
    }
  }

  applyLocalization() {
    for (const field of this.headerFields) {
      field.Label = this.localizationService.translate(field.Label);
    }
  }

  setupHeaderFields() {
    this.headerFields = JSON.parse(JSON.stringify(this.headerFieldsStructure));

    this.headerFields[0].Value = this.timeSheet.WorkOrderNumberFull;
    this.headerFields[1].Value = this.timeSheet.Id;
    this.headerFields[2].Value = this.timeSheet.ClientName;

    this.headerFields[3].Value = this.timeSheet.TimeSheetStatusId;

    if (this.timeSheet.ApproverNames !== null) {
      this.headerFields[4].Value = this.timeSheet.ApproverNames;
    }
    if (this.timeSheet.ApproverNames === null || [4, 6, 8, 9, 10].indexOf(this.timeSheet.TimeSheetStatusId) > -1) {
      this.headerFields[4].Visible = false;
      --this.headerFields[2].Priority;
      --this.headerFields[1].Priority;
      --this.headerFields[0].Priority;
    }

    this.headerFields[5].Value = this.timeSheet.PONumber;
    this.headerFields[6].Value = this.timeSheet.POUnitsRemaining;
    if (this.timeSheet.POUnitsRemaining === null || this.timeSheet.POUnitsRemaining === 0) {
      this.headerFields[5].Visible = false;
      this.headerFields[6].Visible = false;
      --this.headerFields[2].Priority;
      --this.headerFields[1].Priority;
      --this.headerFields[0].Priority;
    }

    this.headerFields.forEach((o, i, a) => a[i].Priority = a[i].Priority < 1 ? 1 : a[i].Priority);

    this.headerFields = this.headerFields.filter(x => x.Visible === true);

    this.applyLocalization();
  }

  configureModalDatePicker(timeSheet: TimeSheet) {
    const activeHeaders = this.headers.filter(
      (header: TimeSheetHeader) =>
        header.AssignmentId === timeSheet.AssignmentId
    );

    this.modalDatePickerModel.StartDate = new Date(
      Math.min.apply(null, activeHeaders.map(x => x.TimesheetStartDate))
    );
    this.modalDatePickerModel.EndDate = new Date(
      Math.max.apply(null, activeHeaders.map(x => x.TimesheetEndDate))
    );

    if (!this.modalDatePickerModel.SelectedDate) {
      this.modalDatePickerModel.SelectedDate = timeSheet.StartDate;
    }

    this.modalDatePickerModel.HighlightedDates = this.getDateRange(
      timeSheet.StartDate,
      timeSheet.EndDate
    );

    // cloning the modalDatePickerModel and reassigning to trigger change detection on the modal-date-picker component
    this.modalDatePickerModel = JSON.parse(
      JSON.stringify(this.modalDatePickerModel)
    );
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dateArray = Array<Date>();
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  payPeriodChange(newDate: any): void {
    const selectedHeader: TimeSheetHeader = this.headers.filter(
      header =>
        header.AssignmentId === this.timeSheet.AssignmentId &&
        header.TimesheetStartDate <= newDate &&
        header.TimesheetEndDate >= newDate
    )[0];

    if (selectedHeader) {
      this.router
        .navigate([selectedHeader.TimeSheetId], {
          relativeTo: this.activatedRoute.parent,
          queryParams: { date: newDate.toISOString().substring(0, 10) }
        })
        .catch(err => {
          console.error(
            `error navigating to timesheet/${selectedHeader.TimeSheetId}`,
            err
          );
        });
      this.timeSheetDate = newDate;
    } else {
      alert(this.localizationService.translate('timesheet.header.noTimesheetsForPeriodMessage'));
    }
  }

  /** Formats the pay period, used beside the timesheet selector */
  payPeriodDisplay(timeSheet: TimeSheet, contentSize: string): string {
    const dateFormat = contentSize === 'full' ? 'LL' : 'll';

    /*if (!timeSheet || !this.headers) { return ''; }
    const selectedHeader = this.headers.filter(header => header.TimeSheetId === timeSheet.Id)[0];
    return selectedHeader
      ? `${moment(selectedHeader.TimesheetStartDate).format(dateFormat)} - ${moment(selectedHeader.TimesheetEndDate).format(dateFormat)}`
      : '';*/
    this.headerExists = this.headers
      ? this.headers.filter(header => header.TimeSheetId === timeSheet.Id)
        .length > 0
      : false;
    return timeSheet
      ? `${moment(timeSheet.StartDate).format(dateFormat)} - ${moment(
        timeSheet.EndDate
      ).format(dateFormat)}`
      : '';
  }

  showDatepicker() {
    if (this.headerExists) {
      this.modalTimeCardPeriodDatePicker.showModal();
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
