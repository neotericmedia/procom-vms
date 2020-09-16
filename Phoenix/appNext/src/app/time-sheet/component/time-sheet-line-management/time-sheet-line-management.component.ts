import { timeSheetState } from './../../state/time-sheet/time-sheet.state';
import { Component, OnInit, OnDestroy, Directive, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { TimeSheetService } from '../../service/time-sheet.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as moment from 'moment';
import { TimeSheetDetail, TimeSheetDay, TimeSheetCapsule, TimeSheet, TimeSheetLineManagement, TimeSheetConfirmationMessage } from '../../model/index';
import { TimeSheetRate } from '../../model/time-sheet-rate';
import { Project, ProjectManagementState, ProjectManagement } from '../../../project/model';
import { uuid } from '../../../common/PhoenixCommon.module';
import { ProjectService } from '../../../project/service/project.service';
import { Subscription } from 'rxjs/Subscription';
import { StateService } from '../../../common/state/state.module';

@Component({
  selector: 'app-time-sheet-line-management',
  templateUrl: './time-sheet-line-management.component.html',
  styleUrls: ['./time-sheet-line-management.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeSheetLineManagementComponent implements OnInit, OnDestroy {

  @Input() timeSheet: TimeSheet;
  @Input() lineManagement: TimeSheetLineManagement;

  private alive: boolean = true;
  isTimeSheetSaving: boolean = false;

  ProjectManagementState: typeof ProjectManagementState = ProjectManagementState;
  activeProjectManagementState: ProjectManagementState = ProjectManagementState.disabled;

  constructor(private timeSheetService: TimeSheetService,
    private projectService: ProjectService,
    private stateService: StateService
  ) { }

  ngOnInit() {
    this.timeSheetService.isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isTimeSheetSaving => {
        this.isTimeSheetSaving = isTimeSheetSaving;
      });
  }

  toggleShowAddMenu() {
    this.timeSheetService.toggleAddMenu(!this.lineManagement.showAddMenu);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  onRemoveCapsule(capsuleGuid: string) {
    this.timeSheetService.updateCapsuleIsActiveStatus(this.timeSheet.Id, capsuleGuid, this.lineManagement, false);
  }
}
