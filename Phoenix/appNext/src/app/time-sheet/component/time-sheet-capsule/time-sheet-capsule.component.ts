import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { CommonService } from '../../../common/services/common.service';
import { TimeSheetCapsuleStyle } from '../../model/time-sheet-capsule-style';
import { Component, Input, OnChanges, SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { TimeSheet, TimeSheetDay, TimeSheetDetail, TimeSheetRate, TimeSheetLineManagement, TimeSheetSpotLightMode, UnitInput } from '../../model/index';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { TimeSheetService } from '../../service/time-sheet.service';
import { Project, ProjectManagement } from '../../../project/model';
import { ValidationExtensions } from '../../../common/components/phx-form-control/validation.extensions';
import { DialogService } from '../../../common/index';
import { TimeSheetUtil } from '../../time-sheet.util';

@Component({
  selector: 'app-time-sheet-capsule',
  templateUrl: './time-sheet-capsule.component.html',
  styleUrls: ['./time-sheet-capsule.component.less']
})
export class TimeSheetCapsuleComponent implements OnChanges, OnInit, OnDestroy {
  timeSheetDetailEdit: TimeSheetDetail;
  @Input()
  timeSheet: TimeSheet;
  @Input()
  lineManagement: TimeSheetLineManagement;
  @Input()
  timeSheetDay: TimeSheetDay;
  @Input()
  timeSheetDetail: TimeSheetDetail;
  @Input()
  projectManagement: ProjectManagement;
  @Input()
  spotLightMode: TimeSheetSpotLightMode;

  @ViewChild('directEntry')
  directEntry: ElementRef;

  @Output()
  notifyChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  alive: boolean = false;
  isTimeSheetSaving: boolean = false;

  showProjectView: boolean = false;
  style: { [key: string]: string };
  projectName: string = null;
  spotlightClass: string = null;

  detailEditForm: FormGroup;
  unitInputProperties: UnitInput = { max: 0, min: 0, step: 0 };

  constructor(
    private timeSheetService: TimeSheetService,
    private uiService: TimeSheetUiService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private localizationService: PhxLocalizationService
  ) {}

  ngOnInit() {
    this.timeSheetService
      .isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isTimeSheetSaving => {
        this.isTimeSheetSaving = isTimeSheetSaving;
      });
    TimeSheetUtil.calculateMaxMinAndStepForUnitInputByRateUnit(this.timeSheetDetail.RateUnitId, this.unitInputProperties);
    if (this.timeSheetDetail) {
      this.detailEditForm = this.formBuilder.group({
        unitAmount: [
          { value: this.timeSheetDetail.UnitAmount, disabled: !this.timeSheet.IsEditable },
          Validators.compose([
            ValidationExtensions.custom(this.withinRange.bind(this), this.localizationService.translate('timesheet.timesheetCapusle.unitAmountRangeValidationMessage')),
            ValidationExtensions.custom(this.withinMaxUnitsForDay.bind(this), this.localizationService.translate('timesheet.timesheetCapusle.unitAmountMaxValidationMessage'))
          ])
        ]
      });
    }
  }

  get totalPrimaryUnits() {
    return this.uiService.sumUnitsByDayAndRateUnitId(this.timeSheetDay, this.timeSheet.PrimaryRateUnitId);
  }

  getactiveProject() {
    const proejctId: number = this.timeSheetDetail.Project ? this.timeSheetDetail.Project.Id : null;
    return proejctId ? this.projectManagement.Projects.filter((project: Project) => project.Id === proejctId)[0] : null;
  }

  getactiveRate() {
    const rateTypeId: number = this.timeSheetDetail.RateTypeId;
    return this.timeSheet.Rates.filter((rate: TimeSheetRate) => rate.RateTypeId === rateTypeId)[0];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.projectManagement && changes.projectManagement != null) {
      this.setProjectName();
    }

    if (changes.spotLightMode) {
      this.setSpotlightClass();
    }
    // timeSheetDetail comes from redux state change, should be a new object for every update action
    if (changes.timeSheetDetail) {
      this.setStyle();
    }
  }

  setStyle() {
    if (this.lineManagement && this.lineManagement.capsuleStyleList && this.timeSheetDetail.styleId) {
      const capsuleStyle: TimeSheetCapsuleStyle = this.lineManagement.capsuleStyleList.find((styleItem: TimeSheetCapsuleStyle) => {
        return styleItem.Id === this.timeSheetDetail.styleId;
      });

      if (capsuleStyle) {
        this.style = {
          color: capsuleStyle.FontColor,
          'background-color': capsuleStyle.BackgroundColor
        };
      }
    }
  }

  setSpotlightClass() {
    let result = null;
    switch (this.spotLightMode) {
      case TimeSheetSpotLightMode.rate:
        result = this.lineManagement.spotLightRateId === this.timeSheetDetail.RateTypeId ? 'spotlight' : 'dimmer';
        break;
      case TimeSheetSpotLightMode.capsuleConfig:
        result =
          this.lineManagement.spotLightRateId === this.timeSheetDetail.RateTypeId &&
          (this.lineManagement.spotLightProjectId === this.timeSheetDetail.ProjectId || (this.lineManagement.spotLightProjectId == null && this.timeSheetDetail.ProjectId == null))
            ? 'spotlight'
            : 'dimmer';
        break;
    }

    this.spotlightClass = result;
  }

  setEdit() {
    this.timeSheetService.setActiveCapsule(this.timeSheet.Id, this.timeSheetDetail, true, true);
  }

  setProjectName() {
    if (this.projectManagement && this.timeSheet.IsTimeSheetUsesProjects && this.projectManagement.Projects && this.timeSheetDetail && this.timeSheetDetail.Project && this.timeSheetDetail.Project.Id) {
      const project = this.projectManagement.Projects.find(p => p.Id === (this.timeSheetDetail.Project ? this.timeSheetDetail.Project.Id : null));
      const version = this.timeSheetDetail.ProjectVersionIdAtSubmission && project ? project.ProjectVersions.find(v => v.Id === this.timeSheetDetail.ProjectVersionIdAtSubmission) : project.ActiveProjectVersion;
      this.projectName = version ? version.Name : '';
    }
  }

  public setDetailProperty(propertyName: string, newValue: any) {
    if (propertyName === 'UnitAmount' && (Number(newValue) === this.unitInputProperties.min || Number(newValue) > this.unitInputProperties.max)) {
      return;
    }

    const editDetail = JSON.parse(JSON.stringify(this.timeSheetDetail));

    editDetail[propertyName] = newValue;

    this.timeSheetService.updateTimeSheetDetail(this.timeSheet, editDetail, this.lineManagement, this.getactiveRate(), this.getactiveProject());
    this.notifyChange.emit(true);
  }

  delete() {
    const message = this.uiService.getMessage('deleteCapsule');

    this.dialogService
      .confirm(message.title, message.body)
      .then(() => {
        this.timeSheetService.deleteTimeSheetDetail(this.timeSheet.Id, this.timeSheetDetail.TimeSheetDayId, this.timeSheetDetail.Guid);
        this.notifyChange.emit(true);
      })
      .catch(e => {
        console.log(e);
      });
  }

  withinRange(control: AbstractControl): { [key: string]: any } {
    let result = null;

    if (control && this.timeSheet && this.timeSheetDetail) {
      result = Number(control.value) >= this.unitInputProperties.min && Number(control.value) <= this.unitInputProperties.max ? null : { withinRange: true };
    }

    return result;
  }

  withinMaxUnitsForDay(control: AbstractControl): { [key: string]: any } {
    let result = null;
    if (
      control &&
      this.timeSheet &&
      this.timeSheetDetail &&
      (this.timeSheetDetail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Hour ||
        this.timeSheetDetail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Day ||
        this.timeSheetDetail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Shift)
    ) {
      let controlTotal = Number(control.value);
      let detailTotal = this.timeSheetDetail.UnitAmount;

      let dayTotal = 0;
      if (this.timeSheetDetail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Shift) {
        dayTotal = this.uiService.sumTimeUnitesByDayAndShift(this.timeSheetDay);
      } else {
        dayTotal = this.uiService.sumTimeUnitesByDayAndRateUnitId(this.timeSheetDay, this.timeSheet.HoursPerDay);
      }

      if (this.timeSheetDetail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Day) {
        detailTotal = detailTotal * this.timeSheet.HoursPerDay;
        controlTotal = controlTotal * this.timeSheet.HoursPerDay;
      }

      const total = Number(dayTotal) - Number(detailTotal) + Number(controlTotal);
      result = total <= this.unitInputProperties.max ? null : { withinMaxHoursForDay: true };
    }

    return result;
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
