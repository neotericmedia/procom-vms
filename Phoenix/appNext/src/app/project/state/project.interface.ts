import { ProjectManagement } from '../model';
import { Project } from './../model';

export interface ProjectState {
  assignments: {
    [Id: string]: {
      projectManagement: ProjectManagement;
      activeProject: Project;
    };
  };
}
