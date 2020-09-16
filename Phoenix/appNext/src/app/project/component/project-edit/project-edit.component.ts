import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { CustomFieldValue, CustomFieldErrorType, PhxFormControlLayoutType } from './../../../common/model/index';
import { ProjectManagement } from './../../model/project-management';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { ProjectService } from '../../service/project.service';
import { Project, ProjectManagementState } from '../../model';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { CommonService, DialogService, CustomFieldService } from '../../../common/index';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { ValidationExtensions } from '../../../common/components/phx-form-control/validation.extensions';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.less']
})
export class ProjectEditComponent implements OnInit, OnDestroy, OnChanges {
  @Output() projectManagementState: EventEmitter<ProjectManagementState> = new EventEmitter();
  @Output() selectedProject: EventEmitter<Project> = new EventEmitter();
  @Input() isEditable: boolean = true;
  @Input() assignmentId: number;

  private alive: boolean = true;

  projectManagement: ProjectManagement;
  projectSubscription: Subscription;
  activeProjectSubscription: Subscription;

  activeProject: Project;
  projectEditForm: FormGroup;
  isSubmitted: boolean = false;
  showingConfirmModal: boolean = false;

  PhxFormControlLayoutType: typeof PhxFormControlLayoutType = PhxFormControlLayoutType;

  validationMessages: any;

  deactivateTitle = 'common.generic.confirm';
  deactivateMessage = 'project.messages.confirmDeactivateMessage';

  constructor(
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private customFieldService: CustomFieldService,
    private localizationService: PhxLocalizationService
  ) {}

  ngOnInit() {
    this.applyLocalization();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.assignmentId) {
      const assignmentId = changes.assignmentId.currentValue;
      if (this.projectSubscription) {
        this.projectSubscription.unsubscribe();
      }
      if (this.activeProjectSubscription) {
        this.activeProjectSubscription.unsubscribe();
      }
      this.projectManagement = null;
      this.activeProject = null;

      if (assignmentId != null) {
        this.projectSubscription = this.projectService
          .getProjectManagementByAssignmentId(this.assignmentId)
          .takeWhile(() => this.alive)
          .subscribe((projectManagement: ProjectManagement) => {
            this.projectManagement = projectManagement;
          });

        this.activeProjectSubscription = this.projectService
          .getActiveProject(this.assignmentId)
          .takeWhile(() => this.alive)
          .subscribe((activeProject: Project) => {
            this.validationMessages = null;
            let loadForm: boolean = false;

            if (
              activeProject &&
              activeProject.ActiveProjectVersion &&
              (!this.activeProject || this.activeProject.Id !== activeProject.Id || (this.activeProject.ActiveProjectVersion && this.activeProject.ActiveProjectVersion.Id !== activeProject.ActiveProjectVersion.Id))
            ) {
              loadForm = true;
            }

            this.activeProject = activeProject;

            if (loadForm) {
              this.loadProjectForm();
            }
          });
      }
    }
  }

  applyLocalization() {
    this.deactivateTitle = this.localizationService.translate(this.deactivateTitle);
    this.deactivateMessage = this.localizationService.translate(this.deactivateMessage);
  }

  loadProjectForm() {
    this.projectEditForm = null;

    const controlsConfig = {
      projectName: [
        { value: this.activeProject && this.activeProject.ActiveProjectVersion.Name ? this.activeProject.ActiveProjectVersion.Name : '', disabled: this.isEditable !== true },
        Validators.compose([
          ValidationExtensions.required(this.customFieldService.formatErrorMessage(this.localizationService.translate('project.edit.nameLabel'), CustomFieldErrorType.required)),
          ValidationExtensions.custom(this.projectNameIsUnique.bind(this), this.customFieldService.formatErrorMessage(this.localizationService.translate('project.edit.nameLabel'), CustomFieldErrorType.unique))
        ])
      ],
      code: [{ value: this.activeProject && this.activeProject.ActiveProjectVersion.Code ? this.activeProject.ActiveProjectVersion.Code : '', disabled: this.isEditable !== true }],
      description: [{ value: this.activeProject && this.activeProject.ActiveProjectVersion.Description ? this.activeProject.ActiveProjectVersion.Description : '', disabled: this.isEditable !== true }],
      favourite: [{ value: this.activeProject && this.activeProject.IsFavourite ? this.activeProject.IsFavourite : false, disabled: this.isEditable !== true }]
    };

    if (this.activeProject.ActiveProjectVersion.CustomFieldValues && this.activeProject.ActiveProjectVersion.CustomFieldValues.length > 0) {
      this.projectEditForm = this.formBuilder.group(this.customFieldService.initializeCustomFields(controlsConfig, this.activeProject.ActiveProjectVersion.CustomFieldValues, !this.isEditable));
    } else {
      this.projectEditForm = this.formBuilder.group(controlsConfig);
    }
  }

  getName(id: number) {
    return this.customFieldService.getFieldName(id);
  }

  parentHasValue(targetCustmField: CustomFieldValue) {
    return this.customFieldService.parentHasValue(targetCustmField, this.activeProject.ActiveProjectVersion.CustomFieldValues);
  }

  getParentValue(targetCustmField: CustomFieldValue) {
    return this.customFieldService.getParentValue(targetCustmField, this.activeProject.ActiveProjectVersion.CustomFieldValues);
  }

  identifyCustomFieldValue(index: number, value: CustomFieldValue) {
    return `${value.EntityId}.${value.CustomFieldConfigurationId}`;
  }

  add() {
    this.projectService.setProjectForEdit(this.projectService.getNewProject(this.projectManagement, this.projectManagement.AssignmentId));
    this.projectManagementState.emit(ProjectManagementState.edit);
    this.isSubmitted = false;
    this.loadProjectForm();
  }

  edit(project: Project) {
    this.projectService.setProjectForEdit(project);
    this.projectManagementState.emit(ProjectManagementState.edit);
    this.isSubmitted = false;
    this.loadProjectForm();
  }

  create() {
    this.isSubmitted = true;

    if (this.projectEditForm.valid) {
      this.projectService
        .create(this.activeProject, this.projectManagement.AssignmentId)
        .then((projectId: number) => {
          this.selectedProject.emit(this.activeProject);
          this.projectManagementState.emit(ProjectManagementState.saved);
        })
        .catch(ex => {
          // TODO: temp parsing, should handle parsing in ValidationMessages component
          this.validationMessages = ex;
        });
    }
  }

  createAndNew() {
    this.isSubmitted = true;

    if (this.projectEditForm.valid) {
      this.projectService
        .create(this.activeProject, this.projectManagement.AssignmentId)
        .then((projectId: number) => {
          this.selectedProject.emit(this.activeProject);
          this.add();
        })
        .catch(ex => {
          // TODO: temp parsing, should handle parsing in ValidationMessages component
          this.validationMessages = ex;
        });
    }
  }

  save() {
    this.isSubmitted = true;

    if (this.projectEditForm.valid) {
      this.projectService
        .save(this.activeProject)
        .then(() => {
          this.selectedProject.emit(this.activeProject);
          this.projectManagementState.emit(ProjectManagementState.saved);
        })
        .catch(ex => {
          // TODO: temp parsing, should handle parsing in ValidationMessages component
          this.validationMessages = ex;
        });
    }
  }

  saveAndNew() {
    this.isSubmitted = true;

    if (this.projectEditForm.valid) {
      this.projectService
        .save(this.activeProject)
        .then(() => {
          this.add();
        })
        .catch(ex => {
          // TODO: temp parsing, should handle parsing in ValidationMessages component
          this.validationMessages = ex;
        });
    }
  }

  cancel() {
    this.projectManagementState.emit(ProjectManagementState.cancel);
    this.projectService.clearProjectForEdit(this.projectManagement.AssignmentId);
  }

  deactivateProject(project: Project) {
    this.showingConfirmModal = true;

    this.dialogService
      .confirm(this.deactivateTitle, this.deactivateMessage)
      .then(button => {
        this.projectService.deactivate(project);
        this.projectManagementState.emit(ProjectManagementState.cancel);
        this.showingConfirmModal = false;
      })
      .catch(e => {
        this.showingConfirmModal = false;
      });
  }

  updateFavourite($event) {
    if (($event.code && $event.code === 'Space') || ($event.key && $event.key === 'Spacebar')) {
      this.projectEditForm.controls['favourite'].setValue(!this.projectEditForm.controls['favourite'].value);
    }
  }

  updateActiveProject(propertyName: string, newValue: any) {
    this.projectService.updateActiveProject(this.projectManagement.AssignmentId, propertyName, newValue);
  }

  updateActiveProjectVersion(propertyName: string, newValue: any) {
    this.projectService.updateActiveProjectVersion(this.projectManagement.AssignmentId, propertyName, newValue);
  }

  updateCustomFieldValue(value: CustomFieldValue) {
    this.projectService.updateCustomFieldValue(this.projectManagement.AssignmentId, value);
  }

  projectNameIsUnique(control: AbstractControl): { [key: string]: any } {
    let result = null;

    if (control && control.value && this.projectManagement && this.projectManagement.Projects) {
      const value: string = this.projectService.cleanProjectName(control.value).toLowerCase();
      const projectNames: Array<string> = [];

      for (const project of this.projectManagement.Projects) {
        if (project.Id !== this.activeProject.Id) {
          projectNames.push(this.projectService.cleanProjectName(project.ActiveProjectVersion.Name).toLowerCase());
        }
      }

      result = projectNames.indexOf(value) === -1 ? null : { projectNameIsUnique: true };
    }

    return result;
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
