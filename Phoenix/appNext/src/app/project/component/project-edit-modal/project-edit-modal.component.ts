import { UserProfile } from './../../../common/model/user';
import { Component, OnDestroy, ViewChild, Input } from '@angular/core';
import { ProjectEditComponent } from '../project-edit/project-edit.component';
import { Project, ProjectManagementState } from '../../model';

@Component({
  selector: 'app-project-edit-modal',
  templateUrl: './project-edit-modal.component.html',
  styleUrls: ['./project-edit-modal.component.less']
})
export class ProjectEditModalComponent implements OnDestroy {

  @ViewChild(ProjectEditComponent) projectEdit: ProjectEditComponent;
  @ViewChild('projectModal') projectModal: any;
  @Input() isEditable: boolean = true;
  @Input() assignmentId: number;
  
  private alive: boolean = true;

  constructor() {}

  add() {
    this.projectEdit.add();
    this.projectModal.show();
  }

  toggleModal(showModal: boolean) {

    if (showModal) {
      this.projectModal.show();
    } else {
      this.projectModal.hide();
    }
  }

  projectEditStateChange(activeProjectManagementState: ProjectManagementState) {

    switch ( activeProjectManagementState ) {

      case ProjectManagementState.saved :
      case ProjectManagementState.cancel : {

        this.projectModal.hide();

      }
      break;

    }

  }

  ngOnDestroy() {
    this.alive = false;
  }

}
