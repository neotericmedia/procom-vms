import { CustomFieldVersion, CustomFieldVersionConfiguration, CustomFieldDataSourceDetail, CustomFieldValue } from './../../common/model/index';
import { projectInitial } from './project.initial';
import { ProjectAction } from './project.action';
import { ProjectState } from './project.interface';
import { Project, ProjectVersion, ProjectManagement } from '../model';

export const projectReducer = (currState: ProjectState = projectInitial, action: ProjectAction.action): ProjectState => {
  switch (action.type) {
    case ProjectAction.type.ProjectManagementUpdate: {
      const payload = action as ProjectAction.ProjectManagementUpdate;

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [payload.projectManagement.AssignmentId]: {
            ...currState.assignments[payload.projectManagement.AssignmentId],
            projectManagement: {
              ...payload.projectManagement
            },
            activeProject: null
          }
        }
      };
    }

    case ProjectAction.type.ProjectSetEdit: {
      const payload = action as ProjectAction.ProjectSetEdit;
      const project: Project = payload.project;

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [project.AssignmentId]: {
            ...currState.assignments[project.AssignmentId],
            activeProject: project
          }
        }
      };
    }

    case ProjectAction.type.ProjectClearEdit: {
      const payload = action as ProjectAction.ProjectClearEdit;

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [payload.assignmentId]: {
            ...currState.assignments[payload.assignmentId],
            activeProject: null
          }
        }
      };
    }

    case ProjectAction.type.ProjectUpdateActiveProject: {
      const payload = action as ProjectAction.ProjectUpdateActiveProject;

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [payload.assignmentId]: {
            ...currState.assignments[payload.assignmentId],
            activeProject: {
              ...currState.assignments[payload.assignmentId].activeProject,
              [payload.propertyName]: payload.newValue
            }
          }
        }
      };
    }

    case ProjectAction.type.ProjectUpdateActiveProjectVersion: {
      const payload = action as ProjectAction.ProjectUpdateActiveProjectVersion;

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [payload.assignmentId]: {
            ...currState.assignments[payload.assignmentId],
            activeProject: {
              ...currState.assignments[payload.assignmentId].activeProject,
              ActiveProjectVersion: {
                ...currState.assignments[payload.assignmentId].activeProject.ActiveProjectVersion,
                [payload.propertyName]: payload.newValue
              }
            }
          }
        }
      };
    }

    case ProjectAction.type.ProjectUpdateCustomFieldValue: {
      const payload = action as ProjectAction.ProjectUpdateCustomFieldValue;
      const activeProject: Project = currState.assignments[payload.assignmentId].activeProject;
      const newValue: CustomFieldValue = payload.newValue;

      if (newValue && isNaN(newValue.CustomFieldDataSourceDetailId)) {
        newValue.CustomFieldDataSourceDetailId = null;
      }

      return {
        ...currState,
        assignments: {
          ...currState.assignments,
          [payload.assignmentId]: {
            ...currState.assignments[payload.assignmentId],
            activeProject: {
              ...currState.assignments[payload.assignmentId].activeProject,
              ActiveProjectVersion: {
                ...currState.assignments[payload.assignmentId].activeProject.ActiveProjectVersion,
                CustomFieldValues: currState.assignments[payload.assignmentId].activeProject.ActiveProjectVersion.CustomFieldValues.map((customFieldValue: CustomFieldValue, index: number) => {
                  if (customFieldValue.CustomFieldConfigurationId === newValue.CustomFieldConfigurationId) {
                    return { ...newValue };
                  } else {
                    return customFieldValue;
                  }
                })
              }
            }
          }
        }
      };
    }

    default: {
      return currState;
    }
  }
};
