import { CommonService } from '../../../common/services/common.service';
import { Component, OnInit, OnDestroy, AfterContentChecked, Input, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { TimeSheetService } from '../../service/time-sheet.service';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/subscription';
import { TimeSheet, TimeSheetDay, TimeSheetDetail, TimeSheetCapsule, TimeSheetLineManagement, TimeSheetWeek } from '../../model/index';
import { ProjectService } from '../../../project/service/project.service';
import { ModalDatePickerData } from '../../../common/model/index';
import { ProjectManagement } from '../../../project/model/index';
import { PhxModalDatePickerComponent } from '../../../common/components/phx-modal-date-picker/phx-modal-date-picker.component';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';
import { TimeSheetCapsuleSelectComponent } from '../time-sheet-capsule-select/time-sheet-capsule-select.component';
import { TimeSheetUtil } from './../../time-sheet.util';

declare var $; // fix me

@Component({
  selector: 'app-time-sheet-calendar',
  templateUrl: './time-sheet-calendar.component.html',
  styleUrls: ['./time-sheet-calendar.component.less']
})
export class TimeSheetCalendarComponent implements OnInit, OnDestroy, OnChanges, AfterContentChecked {
  private calendarDOM;
  private alive: boolean = true;
  @Input()
  timeSheet: TimeSheet;
  @Input()
  lineManagement: TimeSheetLineManagement;
  timeSheetId: number;
  projectManagement: ProjectManagement;
  selectedDay: TimeSheetDay;
  selectedCapsule: TimeSheetCapsule;
  isDetailsSavingSubscription: Subscription;
  isDetailsSaving: boolean = false;
  selectedDateSubscription: Subscription;
  currentTimeCardDatePickerModel: ModalDatePickerData = {
    Title: 'timesheet.calendar.datePickerTitle',
    Caption: 'timesheet.calendar.datePickerDescription'
  };
  dateDisabled: Array<Date>;
  overrideSelectedDay = false;
  inProgressFocusSelectedDay = false;
  reFocusSelectedDay = false;
  @ViewChild(TimeSheetCapsuleSelectComponent)
  capsuleSelectModal: TimeSheetCapsuleSelectComponent;
  @ViewChild(PhxModalDatePickerComponent)
  datePickerModal: PhxModalDatePickerComponent;

  constructor(
    private timeSheetService: TimeSheetService,
    private activatedRoute: ActivatedRoute,
    private uiService: TimeSheetUiService,
    private projectService: ProjectService,
    private commonService: CommonService,
    private elementRef: ElementRef,
    private localizationService: PhxLocalizationService
  ) {
    this.calendarDOM = this.elementRef.nativeElement;
    this.selectedDateSubscription = activatedRoute.queryParams.takeWhile(() => this.alive).subscribe((queryParam: any) => {
      this.reFocusSelectedDay = true;
      if (queryParam['date'] && this.timeSheet) {
        this.currentTimeCardDatePickerModel.SelectedDate = new Date(queryParam['date'].split('-').join('/'));

        const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);

        this.selectedDay = timeSheetDaysList.filter(function(item) {
          return item.Date.toISOString().substring(0, 10) === queryParam['date'];
        })[0];
      }
    });
  }

  ngOnInit() {
    this.applyLocalization();

    this.isDetailsSavingSubscription = this.timeSheetService
      .isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isDetailsSaving => {
        this.isDetailsSaving = isDetailsSaving;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    /*
      Fix for Safari flex-grow issue when parent doesn't have a defined height
      https://stackoverflow.com/questions/33636796/chrome-safari-not-filling-100-height-of-flex-parent
      TFS Bug ID : 6274

      $(".cell-day").each(function(){
        $(this).height($(this).height());
      });
    */

    /* var cellDOM = this.calendarDOM.getElementsByClassName('cell-day');

    for (var i = 0; i < cellDOM.length; i++){
      cellDOM[i].style.height = cellDOM[i].offsetHeight + 'px';
    }  */

    if (changes.timeSheet && changes.timeSheet.currentValue != null) {
      const selectedDate = this.activatedRoute.snapshot.queryParams['date'];

      if (!selectedDate) {
        if (this.selectedDay) {
          this.currentTimeCardDatePickerModel.SelectedDate = this.selectedDay.Date;
        } else {
          this.currentTimeCardDatePickerModel.SelectedDate = this.timeSheet.StartDate;
        }
      }

      this.currentTimeCardDatePickerModel.StartDate = this.timeSheet.StartDate;
      this.currentTimeCardDatePickerModel.EndDate = this.timeSheet.EndDate;

      this.currentTimeCardDatePickerModel.HighlightedDates = this.getDateRange(this.timeSheet.StartDate, this.timeSheet.EndDate);

      if (this.timeSheetId !== this.timeSheet.Id && selectedDate && this.timeSheet) {
        this.timeSheetId = this.timeSheet.Id;

        this.currentTimeCardDatePickerModel.SelectedDate = new Date(selectedDate.split('-').join('/'));

        const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);

        this.selectedDay = timeSheetDaysList.filter(function(item) {
          return item.Date.toISOString().substring(0, 10) === selectedDate;
        })[0];
      }

      if (this.timeSheet.IsTimeSheetUsesProjects === true && (!this.projectManagement || (this.projectManagement && this.projectManagement.AssignmentId !== this.timeSheet.AssignmentId))) {
        this.projectService
          .getProjectManagementByAssignmentId(this.timeSheet.AssignmentId)
          .takeWhile(() => this.alive)
          .subscribe((projectManagement: ProjectManagement) => {
            this.projectManagement = projectManagement;
          });
      }
    }
  }

  applyLocalization() {
    this.currentTimeCardDatePickerModel.Title = this.localizationService.translate(this.currentTimeCardDatePickerModel.Title);
    this.currentTimeCardDatePickerModel.Caption = this.localizationService.translate(this.currentTimeCardDatePickerModel.Caption);
  }

  onSelect(day: TimeSheetDay) {
    if (this.timeSheet.IsEditable && day && day.Id !== null) {
      this.selectedDay = day;
      this.currentTimeCardDatePickerModel.SelectedDate = day.Date;

      this.timeSheetService.setActiveCapsule(this.timeSheet.Id, this.timeSheetService.createEmptyTimeSheetDetail(day.Id, this.timeSheet.CustomFieldVersion), true, false);
    }
  }

  getCalendarBackgroundColor(day: TimeSheetDay): string {
    if (day == null || day.Id === null) {
      return 'fillDay';
    }
    const weekday = day.Date.getDay();
    if (weekday === 0 || weekday === 6) {
      return 'weekend';
    }
    if (day.IsHoliday) {
      return 'holiday';
    }
    return 'weekday';
  }
  // New capsule modal flow
  openCapsuleSelectModal() {
    this.capsuleSelectModal.showModal();
  }

  onCapsuleSelected(capsule: TimeSheetCapsule) {
    this.capsuleSelectModal.hideModal();

    this.selectedCapsule = capsule;

    this.openDatePickerModal();
  }

  skipCapsuleSelection() {
    this.capsuleSelectModal.hideModal();
    this.timeSheetService.setActiveCapsule(this.timeSheet.Id, this.timeSheetService.createEmptyTimeSheetDetail(this.selectedDay.Id, this.timeSheet.CustomFieldVersion), true, false);
    this.openDatePickerModal();
  }

  openDatePickerModal() {
    this.datePickerModal.showModal();
  }

  onCurrentPeriodDateSelected(date: Date) {
    this.datePickerModal.hideModal();

    const timeSheetDaysList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);
    this.selectedDay = timeSheetDaysList.filter(function(item) {
      return item.Date.getTime() === date.getTime();
    })[0];

    this.setActiveCapsuleFromSelections();
  }

  onDatePickerBack() {
    this.selectedDay = null;
    this.openCapsuleSelectModal();
  }

  setActiveCapsuleFromSelections() {
    const timeSheetDetail: TimeSheetDetail = this.timeSheetService.createEmptyTimeSheetDetail(this.selectedDay.Id, this.timeSheet.CustomFieldVersion);

    timeSheetDetail.Project = this.selectedCapsule.timeSheetDetail.Project;
    timeSheetDetail.ProjectId = this.selectedCapsule.timeSheetDetail.ProjectId;
    timeSheetDetail.RateTypeId = this.selectedCapsule.timeSheetDetail.RateTypeId;
    timeSheetDetail.RateUnitId = this.selectedCapsule.timeSheetDetail.RateUnitId;
    timeSheetDetail.styleId = this.selectedCapsule.style.Id;

    this.timeSheetService.setActiveCapsule(this.timeSheet.Id, timeSheetDetail, true, false);
  }

  focusSelectedDay() {
    const self = this;

    if (self.reFocusSelectedDay && !self.inProgressFocusSelectedDay) {
      const containerSelector = 'body';
      const divClassName = self.activatedRoute.snapshot.queryParams['date'];

      // fix me
      const containerCurrentTop = $(containerSelector).scrollTop();

      const $targetElement = $('.' + divClassName);

      if ($targetElement.length > 0) {
        const targetDivTop = $targetElement.position().top;

        if (targetDivTop !== 1) {
          self.inProgressFocusSelectedDay = true;
          $(containerSelector).animate(
            {
              scrollTop: containerCurrentTop + targetDivTop - 1
            },
            800,
            function() {
              self.inProgressFocusSelectedDay = false;
              self.reFocusSelectedDay = false;

              $targetElement.find('.toggle-capsule').click();
            }
          );
        }
      }
    }
  }

  ngAfterContentChecked() {
    this.focusSelectedDay();
  }

  canDisplayCapsule(targetCapsule: TimeSheetCapsule) {
    return this.uiService.canDisplayCapsule(this.timeSheet, targetCapsule) && (this.timeSheet.IsTimeSheetUsesProjects || (!this.timeSheet.IsTimeSheetUsesProjects && !targetCapsule.timeSheetDetail.Project));
  }

  identifyDay(index: number, day: TimeSheetDay) {
    return day ? day.Id : null;
  }

  identifyWeek(index: number, week: TimeSheetWeek) {
    return week ? week.Id : null;
  }

  ngOnDestroy() {
    this.selectedDateSubscription.unsubscribe();
    this.alive = false;
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
}
