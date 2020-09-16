import { Observable } from 'rxjs/Observable';
import { Project, ProjectVersion, ProjectManagement } from './../../../project/model/index';
import { ProjectService } from './../../../project/service/project.service';
import { CommonService } from '../../../common/services/common.service';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TimeSheet, TimeSheetDay, TimeSheetDetail, TimeSheetConfirmationMessage } from '../../model';
import { TimeSheetService } from '../../service/time-sheet.service';
import { Subscription } from 'rxjs/subscription';
import { trigger, state, transition, animate, keyframes, style } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { CollapseDirective } from '../../../common/directives/collapse.directive';
import { CodeValueService, DialogService } from '../../../common/index';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { TimeSheetUtil } from './../../time-sheet.util';

@Component({
  selector: 'app-time-sheet-notes-attachments-day-detail',
  templateUrl: './time-sheet-notes-attachments-day-detail.component.html',
  styleUrls: ['./time-sheet-notes-attachments-day-detail.component.less'],
})
export class TimeSheetNotesAttachmentsDayDetailComponent implements OnInit, OnDestroy, OnChanges {
  private alive: boolean = true;

  @Input() date: Date;
  @Input() isCollapsedContent;
  @Input() timeSheet: TimeSheet;
  @Input() timeSheetDay: TimeSheetDay;
  @Input() assignmentId: number;

  noteCount = 0;
  formatDateFull: string;

  projectLookup: Array<any> = [];

  constructor(
    private timeSheetService: TimeSheetService,
    private uiService: TimeSheetUiService,
    private projectService: ProjectService,
    private activatedRoute: ActivatedRoute,
    private codeValueService: CodeValueService,
    private dialogService: DialogService,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.formatDateFull = this.commonService.ApplicationConstants.DateFormat.longDate;
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.timeSheetDay && changes.timeSheetDay.currentValue && changes.timeSheetDay.currentValue.TimeSheetDetails) {
      const timeSheetDetailsList = TimeSheetUtil.timeSheetDetailsAsList(this.timeSheetDay.TimeSheetDetails);
      this.noteCount = this.timeSheetDay.TimeSheetDetails && timeSheetDetailsList.filter(detail => !!detail.Note).length;

    }

    if (changes.assignmentId && changes.assignmentId.currentValue) {

      if (this.timeSheet && this.timeSheet.IsTimeSheetUsesProjects) {

        this.projectService.getProjectManagementByAssignmentId(this.assignmentId)
          .takeWhile(() => this.alive)
          .subscribe((pm: ProjectManagement) => {
            const timeSheetDetailsList = TimeSheetUtil.timeSheetDetailsAsList(this.timeSheetDay.TimeSheetDetails);
            this.projectLookup = (pm ? pm.Projects : [])
              .map((p: Project) => {
                const detailProject = timeSheetDetailsList.find(d => (d.Project ? d.Project.Id  : null) === p.Id);
                const version: ProjectVersion = detailProject && detailProject.ProjectVersionIdAtSubmission
                  ? p.ProjectVersions.find(x => x.Id === detailProject.ProjectVersionIdAtSubmission)
                  : p.ActiveProjectVersion;
                return {
                  id: p.Id,
                  text: version.Name
                };
              });
          });

      }
    }

  }

  formatLabel(timeSheetDetail: TimeSheetDetail) {

    let label = '';

    if (timeSheetDetail.Project) {

      const filtered = this.projectLookup.filter(p => p.id === timeSheetDetail.Project.Id);

      if (filtered && filtered.length > 0) {

        label += `${filtered[0].text}, `;
      }

    }

    if (timeSheetDetail.RateTypeId) {

      label += `${this.codeValueService.getCodeValueText(timeSheetDetail.RateTypeId, this.commonService.CodeValueGroups.RateType)}, `;

    }

    if (timeSheetDetail.RateUnitId) {

      label += `${timeSheetDetail.UnitAmount} ${this.codeValueService.getCodeValueText(timeSheetDetail.RateUnitId, this.commonService.CodeValueGroups.RateUnit)}`;

    }

    return label;

  }

  identify(index, timeSheetDetailItem) {
    return timeSheetDetailItem.value.Guid;
  }

  onUpdatedNote(timeSheetDetail: TimeSheetDetail, noteText: string) {

    if (!noteText) {

      this.deleteTimeSheetNote(timeSheetDetail);

    } else {
      timeSheetDetail.Note =  noteText;
      this.saveTimeSheetNote(timeSheetDetail);
    }
  }


  saveTimeSheetNote(timeSheetDetail: TimeSheetDetail) {

    this.timeSheetService.updateTimeSheetDetailNoteAndSave(this.timeSheet.Id, timeSheetDetail);

  }


  deleteTimeSheetNote(timeSheetDetail: TimeSheetDetail) {

    const message = this.uiService.getMessage('deleteDetailNote' );

    this.dialogService.confirm(message.title, message.body).then((button) => {
      timeSheetDetail.Note = null;
      this.timeSheetService.updateTimeSheetDetailNoteAndSave(this.timeSheet.Id, timeSheetDetail);
      this.noteCount--;
    })
    .catch((e) => {
      console.log(e);
    });

  }

  ngOnDestroy() {
    this.alive = false;
  }

}
