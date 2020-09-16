import { Action } from 'redux';
import { CustomFieldValue } from './../../common/model/index';
import { Project, ProjectManagement } from './../model/index';

export namespace ProjectAction {
  export enum type {
    ProjectManagementUpdate = <any>'@phoenix/ProjectManagementUpdate',
    ProjectSetEdit = <any>'@phoenix/ProjectSetEdit',
    ProjectClearEdit = <any>'@phoenix/ProjectClearEdit',
    ProjectUpdateActiveProject = <any>'@phoenix/ProjectUpdateActiveProject',
    ProjectUpdateActiveProjectVersion = <any>'@phoenix/ProjectUpdateActiveProjectVersion',
    ProjectUpdateCustomFieldValue = <any>'@phoenix/ProjectUpdateCustomFieldValue'
  }

  export type action = ProjectManagementUpdate | ProjectSetEdit | ProjectClearEdit | ProjectUpdateActiveProject | ProjectUpdateActiveProjectVersion | ProjectUpdateCustomFieldValue;

  export class ProjectManagementUpdate implements Action {
    public readonly type = type.ProjectManagementUpdate;
    constructor(public projectManagement: ProjectManagement) {}
  }
  export class ProjectSetEdit implements Action {
    public readonly type = type.ProjectSetEdit;
    constructor(public project: Project) {}
  }
  export class ProjectClearEdit implements Action {
    public readonly type = type.ProjectClearEdit;
    constructor(public assignmentId: number) {}
  }
  export class ProjectUpdateActiveProject implements Action {
    public readonly type = type.ProjectUpdateActiveProject;
    constructor(public assignmentId: number, public propertyName: string, public newValue: any) {}
  }
  export class ProjectUpdateActiveProjectVersion implements Action {
    public readonly type = type.ProjectUpdateActiveProjectVersion;
    constructor(public assignmentId: number, public propertyName: string, public newValue: any) {}
  }
  export class ProjectUpdateCustomFieldValue implements Action {
    public readonly type = type.ProjectUpdateCustomFieldValue;
    constructor(public assignmentId: number, public newValue: CustomFieldValue) {}
  }
}
