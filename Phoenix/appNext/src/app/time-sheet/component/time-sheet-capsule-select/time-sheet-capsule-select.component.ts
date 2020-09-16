import { timeSheetState } from './../../state/time-sheet/time-sheet.state';
import { StateService } from './../../../common/state/service/state.service';
import { ProjectService } from './../../../project/service/project.service';
import { TimeSheetService } from './../../service/time-sheet.service';
import { ProjectManagementState, Project } from './../../../project/model';
import { Subscription } from 'rxjs/rx';
import { TimeSheetLineManagement } from './../../model/time-sheet-line-management';
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { TimeSheetCapsule, TimeSheetDetail, TimeSheet } from '../../model';
import { PhxButton } from '../../../common/model/index';
import { PhxLocalizationService } from '../../../common/services/phx-localization.service';

@Component({
  selector: 'app-time-sheet-capsule-select',
  templateUrl: './time-sheet-capsule-select.component.html',
  styleUrls: ['./time-sheet-capsule-select.component.less']
})
export class TimeSheetCapsuleSelectComponent implements OnInit, OnDestroy {
  @ViewChild('capsuleModal') modalRef: any;

  @Output() capsuleSelect: EventEmitter<TimeSheetCapsule> = new EventEmitter<TimeSheetCapsule>();
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  @Input() timeSheet: TimeSheet;
  @Input() lineManagement: TimeSheetLineManagement;

  private alive: boolean = true;
  isTimeSheetSaving: boolean = false;

  ProjectManagementState: typeof ProjectManagementState = ProjectManagementState;
  activeProjectManagementState: ProjectManagementState = ProjectManagementState.disabled;

  showCapsuleCreate: boolean = false;

  fabButtons: PhxButton[] = [
    {
      icon: 'playlist_add',
      tooltip: this.localizationService.translate('timesheet.capsuleSelect.addNewTimesheetBlock'),
      btnType: 'primary',
      action: () => this.goToCreateNewCapsule()
    }
  ];

  constructor(private timeSheetService: TimeSheetService,
    private projectService: ProjectService,
    private stateService: StateService,
    private localizationService: PhxLocalizationService
  ) { }

  ngOnInit() {
    this.timeSheetService.isTimeSheetSaving()
      .takeWhile(() => this.alive)
      .subscribe(isTimeSheetSaving => {
        this.isTimeSheetSaving = isTimeSheetSaving;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  selectCapsule(capsule: TimeSheetCapsule) {
    this.capsuleSelect.emit(capsule);
  }

  goToCreateNewCapsule() {
    this.showCapsuleCreate = true;
  }

  onCreateCapsule(capsule: TimeSheetCapsule) {
    this.goToCapsuleSelect();
    const filter = capsule.timeSheetDetail.ProjectId ? capsule.timeSheetDetail.Project.ActiveProjectVersion.Name : capsule.rateName;
    this.timeSheetService.setLineManagementFilter(filter);
  }

  goToCapsuleSelect() {
    this.showCapsuleCreate = false;
  }

  cancel() {
    this.hideModal();
  }

  showModal() {
    this.goToCapsuleSelect();
    this.modalRef.show();
  }

  hideModal() {
    this.modalRef.hide();
  }

  onRemoveCapsule(capsuleGuid: string) {
    this.timeSheetService.updateCapsuleIsActiveStatus(this.timeSheet.Id, capsuleGuid, this.lineManagement, false);
  }

  onCapsulePrefill() {
    this.hideModal();
  }

  onCapsuleClear() {
    this.hideModal();
  }

  onCapsuleSpotlight() {
    this.hideModal();
  }
}
