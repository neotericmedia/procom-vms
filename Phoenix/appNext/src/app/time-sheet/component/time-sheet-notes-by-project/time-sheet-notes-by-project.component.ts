import { DialogService } from './../../../common/services/dialog.service';
import { TimeSheetUiService } from './../../service/time-sheet-ui.service';
import { CodeValueService } from './../../../common/services/code-value.service';
import { TimeSheetService } from './../../service/time-sheet.service';
import { TimeSheetDetail } from './../../model/time-sheet-detail';
import { TimeSheet } from './../../model/time-sheet';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../common/index';

@Component({
    selector: 'app-time-sheet-notes-by-project',
    templateUrl: './time-sheet-notes-by-project.component.html',
    styleUrls: ['./time-sheet-notes-by-project.component.less']
})
export class TimeSheetNotesByProjectComponent implements OnInit {
    @Input() timeSheet: TimeSheet;
    @Input() isCollapsedContent;
    @Input() projectGroupedTimeSheetDetail;

    formatDateFull: string;

    constructor(
        private timeSheetService: TimeSheetService,
        private codeValueService: CodeValueService,
        private uiService: TimeSheetUiService,
        private dialogService: DialogService,
        private commonService: CommonService
    ) {
        this.formatDateFull = this.commonService.ApplicationConstants.DateFormat.longDate;
    }

    ngOnInit() {
    }

    identify(index, timeSheetDetailItem) {
        return timeSheetDetailItem.Guid;
    }

    onUpdatedNote(timeSheetDetail: TimeSheetDetail, noteText: string) {

        if (!noteText) {

            this.deleteTimeSheetNote(timeSheetDetail);

        } else {
            timeSheetDetail.Note = noteText;
            this.saveTimeSheetNote(timeSheetDetail);
        }
    }

    saveTimeSheetNote(timeSheetDetail: TimeSheetDetail) {
        this.timeSheetService.updateTimeSheetDetailNoteAndSave(this.timeSheet.Id, timeSheetDetail);
    }

    deleteTimeSheetNote(timeSheetDetail: TimeSheetDetail) {
        const message = this.uiService.getMessage('deleteDetailNote');

        this.dialogService.confirm(message.title, message.body).then((button) => {
            timeSheetDetail.Note = null;
            this.timeSheetService.updateTimeSheetDetailNoteAndSave(this.timeSheet.Id, timeSheetDetail);
            this.projectGroupedTimeSheetDetail.value = this.timeSheetService.groupedTimeSheetDetails(
                                                        this.timeSheetService.sortTimesheetByProject(this.timeSheet).filter(x => !!x.Note), 
                                                        'ProjectId')[this.projectGroupedTimeSheetDetail.key];

            this.projectGroupedTimeSheetDetail = this.projectGroupedTimeSheetDetail.value ? this.projectGroupedTimeSheetDetail : null;
        })
            .catch((e) => {
                console.log(e);
            });
    }

    formatLabel(timeSheetDetail: TimeSheetDetail) {

        let label = '';

        if (timeSheetDetail.RateTypeId) {

            label += `${this.codeValueService.getCodeValueText(timeSheetDetail.RateTypeId, this.commonService.CodeValueGroups.RateType)}, `;

        }

        if (timeSheetDetail.RateUnitId) {

            label += `${timeSheetDetail.UnitAmount} ${this.codeValueService.getCodeValueText(timeSheetDetail.RateUnitId, this.commonService.CodeValueGroups.RateUnit)}`;

        }

        return label;

    }

    getProjectName(timeSheetDetail: TimeSheetDetail) {
        if (timeSheetDetail.Project) {

            const projectVersionA = timeSheetDetail.ProjectVersionIdAtSubmission && timeSheetDetail.Project
                ? timeSheetDetail.Project.ProjectVersions.find(v => v.Id === timeSheetDetail.ProjectVersionIdAtSubmission)
                : timeSheetDetail.Project.ActiveProjectVersion;

            return projectVersionA.Name || '---';
        }

        return '---';
    }

    getTimeSheetDate(timeSheetDetail: TimeSheetDetail, timeSheet: TimeSheet) {
        return timeSheet.TimeSheetDays[timeSheetDetail.TimeSheetDayId].Date;
    }

}
