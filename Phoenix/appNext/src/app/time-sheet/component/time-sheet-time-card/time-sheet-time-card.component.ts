import { DialogService } from '../../../common/services/dialog.service';
import { TimeSheetHeader } from './../../model/time-sheet-header';
import { TimeSheetUiService } from './../../service/time-sheet-ui.service';
import { WorkflowAction } from './../../../common/model/workflow-action';
import { TimeSheet } from './../../model/time-sheet';
import { ActivatedRoute } from '@angular/router';
import { TimeSheetService } from './../../service/time-sheet.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { StateService } from '../../../common/state/state.module';
import { TimeSheetCapsuleStyle, TimeSheetLineManagement, TimeSheetConfirmationMessage, TimeSheetUnitsByRateType } from '../../model/index';
import { WindowRefService, CommonService, PhxConstants } from '../../../common/index';
import { ProjectService } from '../../../project/service/project.service';
import { Project } from '../../../project/model';
import { TimeSheetUtil } from './../../time-sheet.util';
import { TimeSheetActionBaseComponent } from '../shared/time-sheet-action-base.component';

@Component({
  selector: 'app-time-sheet-time-card',
  templateUrl: './time-sheet-time-card.component.html',
  styleUrls: ['./time-sheet-time-card.component.less']
})
export class TimeSheetTimeCardComponent extends TimeSheetActionBaseComponent implements OnInit {
  private alive: boolean = true;
  timeSheetSubscription: Subscription;
  validationMessages: any;

  timeSheet: TimeSheet;
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

    this.activatedRoute.parent.params
      .subscribe((params) => {

        const id = +params['TimeSheetId'];
        if (this.timeSheetSubscription) {
          this.timeSheetSubscription.unsubscribe();
        }
        this.timeSheetSubscription = this.timeSheetService.getTimeSheetById(id)
          .takeWhile(() => this.alive)
          .subscribe(timeSheet => {
            this.timeSheet = timeSheet;
          });
      });
  }

  isManual(): boolean {
    return this.timeSheet.TimeSheetTypeId === PhxConstants.TimeSheetType.Manual;
  }

  isImported(): boolean {
    return this.timeSheet.TimeSheetTypeId === PhxConstants.TimeSheetType.Imported;
  }
}

