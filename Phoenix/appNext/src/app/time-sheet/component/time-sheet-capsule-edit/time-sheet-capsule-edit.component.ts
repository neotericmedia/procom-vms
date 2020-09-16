import { CustomFieldValue, CustomFieldErrorType, PhxFormControlLayoutType } from './../../../common/model/index';
import { CommonService } from '../../../common/services/common.service';
import { Component, OnChanges, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { TimeSheet, TimeSheetRate, TimeSheetDay, TimeSheetDetail, TimeSheetLineManagement, UnitInput } from '../../model/index';
import { ProjectManagementState, Project, ProjectManagement } from '../../../project/model/index';
import { TimeSheetService } from '../../service/time-sheet.service';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { ValidationExtensions } from '../../../common/components/phx-form-control/validation.extensions';
import { CustomFieldService } from '../../../common/index';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';
import { TimeSheetUtil } from './../../time-sheet.util';

@Component({
  selector: 'app-time-sheet-capsule-edit',
  templateUrl: './time-sheet-capsule-edit.component.html',
  styleUrls: ['./time-sheet-capsule-edit.component.less']
})
export class TimeSheetCapsuleEditComponent implements OnChanges {
  @Input()
  timeSheet: TimeSheet;
  @Input()
  lineManagement: TimeSheetLineManagement;
  @Input()
  projectManagement: ProjectManagement;
  ProjectManagementState: typeof ProjectManagementState = ProjectManagementState;
  activeProjectManagementState: ProjectManagementState = ProjectManagementState.disabled;
  detailEditForm: FormGroup;
  rateTypeFormControl: FormControl;
  PhxFormControlLayoutType: typeof PhxFormControlLayoutType = PhxFormControlLayoutType;
  unitInputProperties: UnitInput = { max: 0, min: 0, step: 0 };
  @ViewChild('txtUnitFormControl') txtUnitFormControl: ElementRef;
  @ViewChild('btnHiddenButton') btnHiddenButton: ElementRef;
  constructor(
    private timeSheetService: TimeSheetService,
    private uiService: TimeSheetUiService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private localizationService: PhxLocalizationService,
    private element: ElementRef
  ) { }

  ngOnChanges() {
    if (this.timeSheet && this.timeSheet.ActiveCapsule.detail) {
      const detail: TimeSheetDetail = this.timeSheet.ActiveCapsule.detail;

      if (detail.RateTypeId == null && this.timeSheet.Rates.length === 1) {
        this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateTypeId', this.timeSheet.Rates[0].RateTypeId);
        this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateUnitId', this.timeSheet.Rates[0].RateUnitId);
      } else if (detail.RateTypeId != null && !this.timeSheet.Rates.some((rate: TimeSheetRate) => detail.RateTypeId === rate.RateTypeId)) {
        this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateTypeId', null);
        this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateUnitId', null);
      }

      this.loadDetailForm();
    }
  }

  loadDetailForm() {
    this.detailEditForm = null;
    TimeSheetUtil.calculateMaxMinAndStepForUnitInputByRateUnit(this.timeSheet.ActiveCapsule.detail.RateUnitId, this.unitInputProperties);

    this.rateTypeFormControl = new FormControl(
      { value: this.timeSheet.ActiveCapsule.detail.RateTypeId, disabled: !this.timeSheet.IsEditable },
      Validators.compose([ValidationExtensions.required(this.localizationService.translate('timesheet.capsuleEdit.rateTypeRequiredValidationMessage'))])
    );
    const errorString = this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Shift ? 'timesheet.capsuleEdit.max3ShiftVaidationMessage' : 'timesheet.capsuleEdit.max24HoursVaidationMessage';
    const controlsConfig = {
      unitAmount: [
        { value: this.timeSheet.ActiveCapsule.detail.UnitAmount ? parseFloat('' + this.timeSheet.ActiveCapsule.detail.UnitAmount).toFixed(2) : '0.00', disabled: !this.timeSheet.IsEditable },
        Validators.compose([
          ValidationExtensions.custom(
            this.withinRange.bind(this),
            this.customFieldService.formatErrorMessage(this.localizationService.translate('timesheet.capsuleEdit.unitAmountLabel'), CustomFieldErrorType.length, [this.unitInputProperties.min, this.unitInputProperties.max])
          ),
          ValidationExtensions.custom(this.withinMaxUnitsForDay.bind(this), this.localizationService.translate(errorString))
        ])
      ],
      note: [{ value: this.timeSheet.ActiveCapsule.detail.Note, disabled: !this.timeSheet.IsEditable }],
      rateTypeId: [
        { value: this.timeSheet.ActiveCapsule.detail.RateTypeId, disabled: !this.timeSheet.IsEditable },
        Validators.compose([ValidationExtensions.required(this.customFieldService.formatErrorMessage(this.localizationService.translate('timesheet.capsuleEdit.rateTypeLabel'), CustomFieldErrorType.required))])
      ]
    };

    if (this.timeSheet.ActiveCapsule && this.timeSheet.ActiveCapsule && this.timeSheet.ActiveCapsule.detail && this.timeSheet.ActiveCapsule.detail.CustomFieldValues && this.timeSheet.ActiveCapsule.detail.CustomFieldValues.length > 0) {
      this.detailEditForm = this.formBuilder.group(this.customFieldService.initializeCustomFields(controlsConfig, this.timeSheet.ActiveCapsule.detail.CustomFieldValues, !this.timeSheet.IsEditable));
    } else {
      this.detailEditForm = this.formBuilder.group(controlsConfig);
    }
  }

  getName(id: number) {
    return this.customFieldService.getFieldName(id);
  }

  parentHasValue(targetCustmField: CustomFieldValue) {
    return this.customFieldService.parentHasValue(targetCustmField, this.timeSheet.ActiveCapsule.detail.CustomFieldValues);
  }

  getParentValue(targetCustmField: CustomFieldValue) {
    return this.customFieldService.getParentValue(targetCustmField, this.timeSheet.ActiveCapsule.detail.CustomFieldValues);
  }

  identifyCustomFieldValue(index: number, value: CustomFieldValue) {
    return value.CustomFieldConfigurationId;
  }

  get timeSheetDay() {
    return this.timeSheetService.getTimeSheetDayById(this.timeSheet, this.timeSheet.ActiveCapsule.detail.TimeSheetDayId);
  }

  getTotalPrimaryUnits() {
    if (this.timeSheetDay && this.timeSheet) {
      return this.uiService.sumUnitsByDayAndRateUnitId(this.timeSheetDay, this.timeSheet.PrimaryRateUnitId);
    } else {
      return 0;
    }
  }

  getactiveProjectName() {
    const projectId: number = this.timeSheet.ActiveCapsule.detail.ProjectId;
    if (projectId && this.projectManagement && this.projectManagement.Projects) {
      const activeProject: Project = this.projectManagement.Projects.filter((project: Project) => project.Id === projectId)[0];
      return activeProject.ActiveProjectVersion.Name;
    } else {
      return '';
    }
  }

  getactiveProject() {
    const proejctId: number = this.timeSheet.ActiveCapsule.detail.ProjectId;
    return proejctId ? this.projectManagement.Projects.filter((project: Project) => project.Id === proejctId)[0] : null;
  }

  getactiveRate() {
    const rateTypeId: number = this.timeSheet.ActiveCapsule.detail.RateTypeId;
    return this.timeSheet.Rates.filter((rate: TimeSheetRate) => rate.RateTypeId === rateTypeId)[0];
  }

  cancel() {
    this.timeSheetService.clearActiveCapsule(this.timeSheet.Id);
  }

  save() {
    this.timeSheet.ActiveCapsule.isSubmitted = true;

    if (this.detailEditForm.valid === false) {
      return false;
    }

    const timeSheetDay: TimeSheetDay = this.timeSheetService.getTimeSheetDayById(this.timeSheet, this.timeSheet.ActiveCapsule.detail.TimeSheetDayId);

    const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(timeSheetDay.TimeSheetDetails);

    const isUpdate = timeSheetDetailList.filter(detail => detail.Guid === this.timeSheet.ActiveCapsule.detail.Guid).length > 0;

    // UI team confirmed to trim the spaces in the background
    if (this.timeSheet.ActiveCapsule.detail.Note) {
      this.timeSheet.ActiveCapsule.detail.Note = this.timeSheet.ActiveCapsule.detail.Note.trim();
    }

    if (isUpdate) {
      this.timeSheetService.updateTimeSheetDetail(this.timeSheet, this.timeSheet.ActiveCapsule.detail, this.lineManagement, this.getactiveRate(), this.getactiveProject());
    } else {
      this.timeSheetService.addTimeSheetDetail(this.timeSheet, this.timeSheet.ActiveCapsule.detail, this.lineManagement, this.getactiveRate(), this.getactiveProject());
    }

    this.timeSheetService.clearActiveCapsule(this.timeSheet.Id);
    this.timeSheetService.sortTimeSheetDetails(this.timeSheet.Id);
  }

  saveAndNew() {
    this.timeSheet.ActiveCapsule.isSubmitted = true;

    if (this.detailEditForm.valid === false) {
      return false;
    }

    const timeSheetDayId: number = this.timeSheet.ActiveCapsule.detail.TimeSheetDayId;
    this.save();
    this.timeSheetService.setActiveCapsule(this.timeSheet.Id, this.timeSheetService.createEmptyTimeSheetDetail(timeSheetDayId, this.timeSheet.CustomFieldVersion), true, false);
  }

  delete() {
    this.timeSheetService.deleteTimeSheetDetail(this.timeSheet.Id, this.timeSheet.ActiveCapsule.detail.TimeSheetDayId, this.timeSheet.ActiveCapsule.detail.Guid);
    this.timeSheetService.clearActiveCapsule(this.timeSheet.Id);
  }

  setActiveCapsuleDetailProperty(propertyName: string, value: any) {
    this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, propertyName, value);
  }

  setRate(rateTypeId: number) {
    if (rateTypeId && rateTypeId != null && !isNaN(rateTypeId)) {
      const selectedRate = this.timeSheet.Rates.filter((rate: TimeSheetRate) => rate.RateTypeId === Number(rateTypeId))[0];

      console.log('setting sele3cted rate ', selectedRate);
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateTypeId', selectedRate.RateTypeId);
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'RateUnitId', selectedRate.RateUnitId);
    }
  }

  quickFill() {
    let quickFill = 0;
    if (this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Day) {
      quickFill = 1;
    } else {
      quickFill = this.timeSheet.HoursPerDay;
    }

    this.detailEditForm.controls['unitAmount'].setValue(quickFill);
    this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'UnitAmount', Number(quickFill));
  }

  getIncrementAmount() {
    return this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Hour ? 0.25 : 1;
  }

  addByIncrement(): void {
    const increment = this.getIncrementAmount();
    const result = Number(this.timeSheet.ActiveCapsule.detail.UnitAmount) + increment;

    if (result <= this.unitInputProperties.max) {
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'UnitAmount', result);
    }
  }

  subtractByIncrement(): void {
    const increment = this.getIncrementAmount();

    const result = Number(this.timeSheet.ActiveCapsule.detail.UnitAmount) - increment;

    if (result >= this.unitInputProperties.min) {
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'UnitAmount', result);
    }
  }

  openProjectSelect() {
    this.activeProjectManagementState = ProjectManagementState.list;
  }

  setSelectedProject(project: Project) {
    if (project) {
      const projectId = project ? project.Id : null;
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'Project', project);
      this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'ProjectId', projectId);
    }
  }

  clearSelectedProject() {
    this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'Project', null);
    this.timeSheetService.setActiveCapsuleDetailProperty(this.timeSheet.Id, 'ProjectId', null);
  }

  projectListStateChange(projectManagementState: ProjectManagementState) {
    this.activeProjectManagementState = projectManagementState;

    switch (this.activeProjectManagementState) {
      case ProjectManagementState.selected:
        {
          this.activeProjectManagementState = ProjectManagementState.disabled;
        }
        break;
      case ProjectManagementState.cancel:
        {
          this.activeProjectManagementState = ProjectManagementState.disabled;
        }
        break;
    }
  }

  projectEditStateChange(projectManagementState: ProjectManagementState) {
    this.activeProjectManagementState = projectManagementState;

    switch (this.activeProjectManagementState) {
      case ProjectManagementState.saved:
      case ProjectManagementState.cancel:
        {
          this.activeProjectManagementState = ProjectManagementState.list;
        }
        break;
    }
  }

  updateCustomFieldValue(value: CustomFieldValue) {
    this.timeSheetService.updateCustomFieldValue(this.timeSheet.Id, value);
  }

  withinRange(control: AbstractControl): { [key: string]: any } {
    let result = null;

    if (control && this.timeSheet) {
      result = Number(control.value) >= this.unitInputProperties.min && Number(control.value) <= this.unitInputProperties.max ? null : { withinRange: true };
    }

    return result;
  }

  withinMaxUnitsForDay(control: AbstractControl): { [key: string]: any } {
    let result = null;

    if (
      control &&
      this.timeSheet &&
      (this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Hour ||
        this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Day ||
        this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Shift)
    ) {
      const detailGuid = this.timeSheet.ActiveCapsule.detail.Guid;
      let dayTotal = 0;
      if (this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Shift) {
        dayTotal = this.uiService.sumTimeUnitesByDayAndShift(this.timeSheetDay);
      } else {
        dayTotal = this.uiService.sumTimeUnitesByDayAndRateUnitId(this.timeSheetDay, this.timeSheet.HoursPerDay);
      }

      let controlTotal = Number(control.value);
      let detailTotal = this.timeSheetDay.TimeSheetDetails[detailGuid] ? this.timeSheetDay.TimeSheetDetails[detailGuid].UnitAmount : 0;

      if (this.timeSheet.ActiveCapsule.detail.RateUnitId === this.commonService.ApplicationConstants.RateUnit.Day) {
        detailTotal = detailTotal * this.timeSheet.HoursPerDay;
        controlTotal = controlTotal * this.timeSheet.HoursPerDay;
      }

      const total = Number(dayTotal) - Number(detailTotal) + Number(controlTotal);
      result = total <= this.unitInputProperties.max ? null : { withinMaxHours: true };
    }

    return result;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.cancel();
      event.preventDefault();
    }
  }

  onShown($event) {
    this.btnHiddenButton.nativeElement.click();
  }

  focusUnitFormInput($event) {
    $event.preventDefault();
    setTimeout(() => {
      this.txtUnitFormControl.nativeElement.select();
      this.txtUnitFormControl.nativeElement.focus();
    }, 0);
  }
}
