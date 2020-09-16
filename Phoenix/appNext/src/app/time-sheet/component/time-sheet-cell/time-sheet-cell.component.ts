import { CustomFieldValue } from './../../../common/model/index';
import { CommonService } from '../../../common/services/common.service';
import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { TimeSheet, TimeSheetDay, TimeSheetDetail, TimeSheetLineManagement } from '../../model';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { TimeSheetService } from '../../service/time-sheet.service';
import { uuid } from '../../../common/PhoenixCommon.module';
import { ProjectManagement } from '../../../project/model/index';

@Component({
  selector: 'app-time-sheet-cell',
  templateUrl: './time-sheet-cell.component.html',
  styleUrls: ['./time-sheet-cell.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSheetCellComponent {
  @Input()
  timeSheetDay: TimeSheetDay;
  @Input()
  isSelected: boolean;
  @Input()
  timeSheet: TimeSheet;
  @Input()
  lineManagement: TimeSheetLineManagement;
  @Output()
  notifySelection: EventEmitter<TimeSheetDay> = new EventEmitter<TimeSheetDay>();
  @Input()
  projectManagement: ProjectManagement;

  isCapsuleVisible = false;
  constructor(private timeSheetService: TimeSheetService, private uiService: TimeSheetUiService, private commonService: CommonService) {}

  get sumDetailsPrimaryUnits() {
    return this.uiService.sumUnitsByDayAndRateUnitId(this.timeSheetDay, this.timeSheet.PrimaryRateUnitId);
  }

  isEmptyTimeSheetDay() {
    return Object.keys(this.timeSheetDay.TimeSheetDetails).length === 0;
  }

  addNewCapsule(day: TimeSheetDay) {
    if (this.timeSheet.IsEditable) {
      this.notifySelection.emit(this.timeSheetDay);

      this.timeSheetService.setActiveCapsule(this.timeSheet.Id, this.timeSheetService.createEmptyTimeSheetDetail(this.timeSheetDay.Id, this.timeSheet.CustomFieldVersion), true, false);
    }
  }

  allowDropFunction(): any {
    return (targetDetail: TimeSheetDetail) => {
      if (!this.timeSheet.IsEditable) {
        return false;
      } else {
        return true;
      }
    };
  }

  dropSuccess(targetDetail: TimeSheetDetail) {
    const detail: TimeSheetDetail = JSON.parse(JSON.stringify(targetDetail));
    detail.TimeSheetDayId = this.timeSheetDay.Id;
    detail.Id = 0;
    detail.Guid = uuid.create();
    detail.CustomFieldValues.forEach((value: CustomFieldValue) => (value.Id = 0));
    setTimeout(() => this.timeSheetService.setActiveCapsule(this.timeSheet.Id, detail, true, false), 0);
  }

  showCapsules(): string {
    if (Object.keys(this.timeSheetDay.TimeSheetDetails).length > 0) {
      if (this.isCapsuleVisible) {
        this.timeSheetService.updateTimeSheetProperty(this.timeSheet.Id, 'ExpandAllDays', false);
      }

      this.isCapsuleVisible = !this.isCapsuleVisible;
    }
    return this.isCapsuleVisible ? '' : 'collapsed';
  }
}
