import { TimeSheetLineManagement } from './../../model/time-sheet-line-management';
import { TimeSheet } from './../../model/time-sheet';
import { ProjectManagementState } from './../../../project/model/project-management-state';
import { TimeSheetService } from './../../service/time-sheet.service';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter, TemplateRef } from '@angular/core';
import { TimeSheetRate, TimeSheetCapsule } from '../../model';
import { TimeSheetState } from '../../state/time-sheet';
import { ProjectVersion, Project } from '../../../project/model';
import { ProjectEditComponent } from '../../../project/component/project-edit/project-edit.component';
import { CustomFieldVersion } from '../../../common/model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-time-sheet-line-management-capsule-edit',
  templateUrl: './time-sheet-line-management-capsule-edit.component.html',
  styleUrls: ['./time-sheet-line-management-capsule-edit.component.less']
})
export class TimeSheetLineManagementCapsuleEditComponent implements OnInit, OnDestroy {

  @ViewChild(ProjectEditComponent) projectEdit: ProjectEditComponent;
  @ViewChild('selectProjectModal') selectProjectTemplate: TemplateRef<any>;

  @Input() timeSheet: TimeSheet;
  @Input() lineManagement: TimeSheetLineManagement;

  @Output() create: EventEmitter<TimeSheetCapsule> = new EventEmitter<TimeSheetCapsule>();

  ProjectManagementState: typeof ProjectManagementState = ProjectManagementState;
  activeProjectManagementState: ProjectManagementState = ProjectManagementState.disabled;

  selectProjectModalRef: BsModalRef;

  private modalConfig: any = {
    backdrop: 'static',
    keyboard: true,
    class: 'responsiveModal responsive-modal modal-sm'
  };

  private alive: boolean = true;

  constructor(
    private timeSheetService: TimeSheetService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  addCapsule() {
    const capsule = this.timeSheetService.addLineManagementCapsule(this.timeSheet, this.lineManagement, this.lineManagement.activeRate, this.lineManagement.activeProject);
    this.timeSheetService.clearLineManagementActiveProjectRate(this.timeSheet.Id);
    this.create.emit(capsule);
  }

  addProject(): void {
    this.projectEdit.add();
    this.activeProjectManagementState = ProjectManagementState.edit;
  }

  setSelectedRate(rateTypeId: number) {
    const rate = this.timeSheet.Rates.find(x => x.RateTypeId === rateTypeId);
    this.timeSheetService.setLineManagementActiveRate(this.timeSheet.Id, rate);
  }

  setSelectedProject(project: Project) {
    this.timeSheetService.setLineManagementActiveProject(this.timeSheet.Id, project);
  }

  startPorjectDialog() {

    this.activeProjectManagementState = ProjectManagementState.list;
    this.selectProjectModalRef = this.modalService.show(this.selectProjectTemplate, this.modalConfig);
  }

  projectListStateChange(addProjectState: ProjectManagementState) {

    this.activeProjectManagementState = addProjectState;

    switch (this.activeProjectManagementState) {

      case ProjectManagementState.selected:
      case ProjectManagementState.cancel: {
        this.selectProjectModalRef.hide();
      }
        break;
    }
  }

  projectEditStateChange(addProjectState: ProjectManagementState) {

    this.activeProjectManagementState = addProjectState;

    switch (this.activeProjectManagementState) {

      case ProjectManagementState.saved: {
        this.selectProjectModalRef.hide();
      }
        break;
      case ProjectManagementState.cancel: {
        this.activeProjectManagementState = ProjectManagementState.list;
      }
        break;
    }
  }
}
