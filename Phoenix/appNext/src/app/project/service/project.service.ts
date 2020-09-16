import { CustomFieldService } from './../../common/services/custom-field.service';
import { ProjectState } from './../state/project.interface';
import { AccessAction } from './../../common/model/access-action';
import { CommonService } from '../../common/services/common.service';
import { CommandResponse } from './../../common/model/command-response';
import { Injectable, Inject } from '@angular/core';
import { StateService } from '../../common/state/state.module';
import { ProjectManagement, Project, ProjectVersion } from '../model';
import { CustomFieldVersion, CustomFieldValue } from './../../common/model/index';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../common/services/api.service';
import { ProjectAction, projectState } from '../state/index';
import { PhxLocalizationService } from '../../common/services/phx-localization.service';

@Injectable()
export class ProjectService {
  private isProjectLoading: boolean = false;

  constructor(private apiService: ApiService, private state: StateService, private commonService: CommonService, private customFieldService: CustomFieldService, private localizationService: PhxLocalizationService) {}

  private param(oDataParams) {
    return oDataParams ? `?${oDataParams}` : '';
  }

  public getProjectList(assignmentId: number) {
    return this.state.select<Project[]>(projectState.byAssignmentId(assignmentId).projectList);
  }

  private getProjectManagementByAssignmentIdApiCall(assignmentId: number) {
    this.isProjectLoading = true; // TODO: is this used?

    return new Promise((resolve, reject) => {
      this.apiService
        .query(`assignment/getProjectManagementByAssignmentId/${assignmentId}`)
        .then((response: ProjectManagement) => {
          response.ActiveCustomFieldVersion = response.CustomFieldVersions.slice(-1)[0];
          response.AccessActions.sort((a: AccessAction, b: AccessAction) => a.AccessAction - b.AccessAction);

          response.Projects.forEach((project: Project) => {

            // TODO: order versions by id
            // Make duplicate here so that out of date project custom field values can still be viewed, but project to be saved/used in draft is latest
            project.ActiveProjectVersion = JSON.parse(JSON.stringify(project.ProjectVersions.slice(-1)[0]));

            if (response.ActiveCustomFieldVersion) {
              project.ActiveProjectVersion.CustomFieldValues = this.customFieldService.mergeTransformCustomFieldValues(response.ActiveCustomFieldVersion, project.ActiveProjectVersion.CustomFieldValues);
            }
          });

          this.state.dispatchOnAction(new ProjectAction.ProjectManagementUpdate(response));

          resolve(response);

          this.isProjectLoading = false;
        })
        .catch(e => {
          this.isProjectLoading = false;
          reject(e);
        });
    });
  }

  public getProjectManagementByAssignmentId(assignmentId: number, forceGet: boolean = false): Observable<ProjectManagement> {
    const state = this.state.value;
    const targetValue = state && state.project && state.project.assignments && state.project.assignments[assignmentId] && state.project.assignments[assignmentId].projectManagement;
    if (forceGet) {
      this.getProjectManagementByAssignmentIdApiCall(assignmentId);
    }

    return this.state.select<ProjectManagement>(projectState.byAssignmentId(assignmentId).projectManagement).asObservable();
  }

  public getProjectListAsPromise(assignmentId: number) {
    const state = this.state.value;
    const targetValue = state && state.project && state.project.assignments && state.project.assignments[assignmentId] && state.project.assignments[assignmentId].projectManagement;

    if (targetValue === null || targetValue === undefined) {
      return new Promise((resolve, reject) => {
        this.getProjectManagementByAssignmentIdApiCall(assignmentId)
          .then((response: ProjectManagement) => {
            resolve(response.Projects);
          })
          .catch(ex => reject(ex));
      });
    } else {
      return new Promise((resolve, reject) => {
        resolve(state.project.assignments[assignmentId] ? state.project.assignments[assignmentId].projectManagement.Projects : null);
      });
    }
  }

  public getActiveProject(assignmentId: number) {
    return this.state.select<Project>(projectState.byAssignmentId(assignmentId).activeProject).asObservable();
  }

  public getNewProject(pm: ProjectManagement, assignmentId: number): Project {
    const projectVersion: ProjectVersion = {
      Id: 0,
      Name: null,
      Code: null,
      Description: null,
      CustomFieldValues: []
    };

    const project: Project = {
      Id: 0,
      AssignmentId: assignmentId,
      IsActive: true,
      IsFavourite: false,
      ProjectVersions: [projectVersion],
      ActiveProjectVersion: projectVersion,
      LastModifiedDatetime: new Date()
    };

    // todo - find version using CustomFieldVersionId
    project.ActiveProjectVersion.CustomFieldValues = this.customFieldService.mergeTransformCustomFieldValues(pm.ActiveCustomFieldVersion, []);

    return project;
  }

  public create(project: Project, assignmentId: number) {
    project.AssignmentId = assignmentId;
    project.LastModifiedDatetime = new Date();

    return new Promise((resolve, reject) => {
      this.apiService
        .command('NewProject', this.formatSaveCommand(project))
        .then((saveResponse: CommandResponse) => {
          this.commonService.logSuccess(this.localizationService.translate('project.messages.createProjectSuccess'));

          this.getProjectManagementByAssignmentIdApiCall(assignmentId).then((pm: ProjectManagement) => {
            this.setProjectForEdit(pm.Projects.find(x => x.Id === saveResponse.EntityId));
            resolve(saveResponse.EntityId);
          });
        })
        .catch(ex => reject(ex));
    });
  }

  public save(project: Project) {
    const id = project.Id;
    return new Promise((resolve, reject) => {
      this.apiService
        .command('SaveProject', this.formatSaveCommand(project))
        .then(saveResponse => {
          this.commonService.logSuccess(this.localizationService.translate('project.messages.saveProjectSuccess'));

          this.getProjectManagementByAssignmentIdApiCall(project.AssignmentId).then((pm: ProjectManagement) => {
            this.setProjectForEdit(pm.Projects.find(x => x.Id === id));
            resolve(saveResponse.EntityId);
          });
        })
        .catch(ex => reject(ex));
    });
  }

  public deactivate(project: Project) {
    return this.apiService.command('DeactivateProject', { ProjectId: project.Id, LastModifiedDatetime: project.LastModifiedDatetime }).then(deactivateResponse => {
      this.commonService.logSuccess(this.localizationService.translate('project.messages.deactivateProjectSuccess'));
      this.getProjectManagementByAssignmentIdApiCall(project.AssignmentId);
    });
  }

  public setProjectForEdit(project: Project) {
    this.state.dispatchOnAction(new ProjectAction.ProjectSetEdit(project));
  }

  public updateActiveProject(assignmentId: number, propertyName: string, newValue: any) {
    this.state.dispatchOnAction(new ProjectAction.ProjectUpdateActiveProject(assignmentId, propertyName, newValue));
  }

  public updateActiveProjectVersion(assignmentId: number, propertyName: string, newValue: any) {
    if (propertyName === 'Name' && typeof newValue === 'string') {
      newValue = this.cleanProjectName(newValue);
    }

    this.state.dispatchOnAction(new ProjectAction.ProjectUpdateActiveProjectVersion(assignmentId, propertyName, newValue));
  }

  public updateCustomFieldValue(assignmentId: number, newValue: CustomFieldValue) {
    this.state.dispatchOnAction(new ProjectAction.ProjectUpdateCustomFieldValue(assignmentId, newValue));
  }

  public clearProjectForEdit(assignmentId: number) {
    this.state.dispatchOnAction(new ProjectAction.ProjectClearEdit(assignmentId));
  }

  public toggleFavouriteProject(project: Project) {
    project.IsFavourite = !project.IsFavourite;
    this.save(project);
  }

  public cleanProjectName(name: string): string {
    return name.trim().replace(/  +/g, ' ');
  }

  private formatSaveCommand(project: Project): Project {
    const projectSaveCommand: any = JSON.parse(JSON.stringify(project));
    delete projectSaveCommand.ProjectVersions;

    return projectSaveCommand;
  }
}
