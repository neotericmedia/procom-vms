import { ProjectService } from './../../../project/service/project.service';
import { ActivatedRoute } from '@angular/router';
import { TimeSheetService } from './../../service/time-sheet.service';
import { TimeSheet, TimeSheetDetail } from './../../model/index';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { ProjectManagement, Project, ProjectVersion } from '../../../project/model/index';
import { Subscription } from 'rxjs/Rx';
import { TimeSheetUtil } from './../../time-sheet.util';

@Component({
  selector: 'app-time-sheet-time-card-summary-component',
  templateUrl: './time-sheet-time-card-summary.component.html',
  styleUrls: ['./time-sheet-time-card-summary.component.less']
})
export class TimeSheetTimeCardSummaryComponent implements OnInit {

  timeSheet: TimeSheet;
  totalHours: number;
  projectManagement: ProjectManagement;
  private alive: boolean = true;

  timeSheetSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private timeSheetService: TimeSheetService,
    private projectService: ProjectService,
    private commonService: CommonService
  ) {

    this.activatedRoute.parent.params
      .subscribe((params) => {

        const id = +params['TimeSheetId'];
        if (this.timeSheetSubscription) {
          this.timeSheetSubscription.unsubscribe();
        }

        this.timeSheetSubscription = this.timeSheetService.getTimeSheetById(id)
          .subscribe(timeSheet => {
            this.timeSheet = timeSheet;

            if (this.timeSheet && this.timeSheet.IsTimeSheetUsesProjects) {
              this.projectService.getProjectManagementByAssignmentId(this.timeSheet.AssignmentId)
                .takeWhile(() => this.alive)
                .subscribe((projectManagement: ProjectManagement) => {
                  this.projectManagement = projectManagement;
                });

            }

          });
      });
  }

  ngOnInit() {
  }

  getUnitsByRateType() {
    const unitsByRateTypeArray = Array<UnitsByRateType>();
    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);
    timeSheetDayList.map(
      (day) => {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        for (let i = 0; i < timeSheetDetailList.length; i++) {
          const instance = unitsByRateTypeArray.find(x => x.RateTypeId === timeSheetDetailList[i].RateTypeId);
          if (instance === undefined) {
            unitsByRateTypeArray.push({
              RateTypeId: timeSheetDetailList[i].RateTypeId,
              UnitAmount: timeSheetDetailList[i].UnitAmount,
              UnitId: timeSheetDetailList[i].RateUnitId
            });
          } else {
            instance.UnitAmount += timeSheetDetailList[i].UnitAmount;
          }
        }
      });
    this.totalHours = unitsByRateTypeArray.reduce((acc, value) => acc + value.UnitAmount, 0);
    return unitsByRateTypeArray;
  }

  getUnitsByProjectAndRateType() {
    const hoursByProjectAndRateTypeArray = Array<UnitsByProjectAndRateType>();
    const timeSheetDayList = TimeSheetUtil.timeSheetDaysAsList(this.timeSheet.TimeSheetDays);
    timeSheetDayList.map(
      (day) => {
        const timeSheetDetailList = TimeSheetUtil.timeSheetDetailsAsList(day.TimeSheetDetails);
        timeSheetDetailList.forEach((detail: TimeSheetDetail) => {
          // TODO: look at this
          const instance = hoursByProjectAndRateTypeArray.find(x => x.ProjectId === (detail.Project ? detail.Project.Id : null) && x.ProjectVersionId === detail.ProjectVersionIdAtSubmission);
          if (instance === undefined) {
            const project = detail.Project ? this.projectManagement.Projects.find(x => x.Id === (detail.Project ? detail.Project.Id : null)) : null;
            hoursByProjectAndRateTypeArray.push({
              ProjectId: (detail.Project ? detail.Project.Id : null),
              ProjectVersionId: detail.ProjectVersionIdAtSubmission ? detail.ProjectVersionIdAtSubmission : project ? project.ActiveProjectVersion.Id : null,
              UnitsByRateType: [{
                RateTypeId: detail.RateTypeId,
                UnitAmount: detail.UnitAmount,
                UnitId: detail.RateUnitId
              }]
            });
          } else {
            const data = instance.UnitsByRateType.find(x => x.RateTypeId === detail.RateTypeId);
            if (data === undefined) {
              instance.UnitsByRateType.push({
                RateTypeId: detail.RateTypeId,
                UnitAmount: detail.UnitAmount,
                UnitId: detail.RateUnitId
              });
            } else {
              data.UnitAmount += detail.UnitAmount;
            }
          }
        });
      });
    return hoursByProjectAndRateTypeArray;
  }

  getProjectNameById(projectId: number, projectVersionId: number) {

    if (projectId && this.projectManagement && this.projectManagement.Projects) {

      const activeProject: Project = this.projectManagement.Projects.filter((project: Project) => project.Id === projectId)[0];
      const activeVersion: ProjectVersion = activeProject ? activeProject.ProjectVersions.find(x => x.Id === projectVersionId) : null;
      if (activeVersion) {
        return activeVersion.Name;
      }

    }
    return '';

  }

}

interface UnitsByRateType {
  RateTypeId: number;
  UnitAmount: number;
  UnitId: number;
}

interface UnitsByProjectAndRateType {
  ProjectId: number;
  ProjectVersionId?: number;
  UnitsByRateType: UnitsByRateType[];
}
