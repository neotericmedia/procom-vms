export const projectState = {
  byAssignmentId: (assignmentId: number) => {
    return {
      instance: `project.assignments.${assignmentId}`,
      activeProject: `project.assignments.${assignmentId}.activeProject`,
      projectManagement: `project.assignments.${assignmentId}.projectManagement`,
      projectList: `project.assignments.${assignmentId}.projectManagement.Projects`
    };
  }
};
