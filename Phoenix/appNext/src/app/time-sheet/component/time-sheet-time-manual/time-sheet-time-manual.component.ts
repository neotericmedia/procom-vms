import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { TimeSheet, TimeSheetLineManagement, TimeSheetUnitsByRateType } from '../../model';
import { ActivatedRoute } from '@angular/router';
import { TimeSheetService } from '../../service/time-sheet.service';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { StateService } from '../../../common/state/state.module';
import { DialogService, WindowRefService, CommonService } from '../../../common';
import { ProjectService } from '../../../project/service/project.service';
import { Project } from '../../../project/model';
import { TimeSheetActionBaseComponent } from '../shared/time-sheet-action-base.component';
import { StateAction, StateActionDisplayType, StateActionButtonStyle, PhxConstants } from '../../../common/model';

@Component({
  selector: 'app-time-sheet-time-manual',
  templateUrl: './time-sheet-time-manual.component.html',
  styleUrls: ['./time-sheet-time-manual.component.less']
})
export class TimeSheetTimeManualComponent extends TimeSheetActionBaseComponent implements OnInit, OnDestroy, OnChanges {
  @Input() timeSheet: TimeSheet;

  private alive: boolean = true;
  timeSheetSubscription: Subscription;
  validationMessages: any;
  StateActionDisplayType = StateActionDisplayType;

  stateActions: StateAction[];

  lineManagement: TimeSheetLineManagement;
  lineManagementSub: Subscription;
  projectSub: Subscription;

  hasSubmitAction: boolean = false;

  isDetailsSaving: boolean = false;

  previousTimeSheetsNotSubmittedMessage = null;
  totalPrimaryUnitDetail: TimeSheetUnitsByRateType;
  totalsByRateType: Array<TimeSheetUnitsByRateType> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    protected timeSheetService: TimeSheetService,
    protected uiService: TimeSheetUiService,
    private state: StateService,
    protected dialogService: DialogService,
    protected windowRef: WindowRefService,
    private commonService: CommonService,
    private projectService: ProjectService
  ) {
    super(timeSheetService, windowRef, uiService, dialogService);
  }

  ngOnInit() {
    if (!this.previousTimeSheetsNotSubmittedMessage) {
      this.previousTimeSheetsNotSubmittedMessage = this.uiService.getMessage('previousTimeSheetMustBeSubmitted');
    }
    this.validationMessages = null;
    this.hasSubmitAction = this.timeSheet && this.timeSheet.AvailableStateActions && this.timeSheet.AvailableStateActions.includes(PhxConstants.StateAction.TimesheetSubmit);

    if (this.timeSheet) {
      if (!this.lineManagementSub) {
        this.lineManagementSub = this.timeSheetService
          .getLineManagementByAssignmentIdFromState(this.timeSheet.AssignmentId)
          .takeWhile(() => this.alive)
          .subscribe(lm => {
            if (lm && lm.capsuleStyleList) {
              this.lineManagement = lm;
            }

            if (!this.projectSub && this.timeSheet && this.timeSheet.Id && this.timeSheet.IsTimeSheetUsesProjects) {
              this.projectSub = this.projectService
                .getProjectList(this.timeSheet.AssignmentId)
                .takeWhile(() => this.alive === true)
                .subscribe((projectList: Array<Project>) => {
                  if (projectList && this.lineManagement) {
                    this.timeSheetService.updateLineManagementProjectData(this.timeSheet.Id, this.lineManagement.filterText, projectList);
                  }
                });
            }
          });
      }

      const totalsByRateType = this.timeSheetService.getTimeSheetUnitsByRateType(this.timeSheet);
      if (totalsByRateType && totalsByRateType.length > 0) {
        this.totalPrimaryUnitDetail = totalsByRateType.pop();
        this.totalsByRateType = totalsByRateType;
      }
    }

    this.timeSheetService
      .isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isDetailsSaving => {
        this.isDetailsSaving = isDetailsSaving;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeSheet) {
      const totalsByRateType = this.timeSheetService.getTimeSheetUnitsByRateType(this.timeSheet);
      if (totalsByRateType && totalsByRateType.length > 0) {
        this.totalPrimaryUnitDetail = totalsByRateType.pop();
        this.totalsByRateType = totalsByRateType;
      }
    }
  }

  clearTimeSheetErrors() {
    this.timeSheetService.clearTimeSheetError(this.timeSheet.Id, 'TimeSheetDays', null);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  setSpotLightRate(rateId: number) {
    this.timeSheetService.setSpotLightRate(rateId, this.timeSheet.Id);
  }

  clearSpotLight() {
    this.timeSheetService.clearSpotLight(this.timeSheet.Id);
  }
}
