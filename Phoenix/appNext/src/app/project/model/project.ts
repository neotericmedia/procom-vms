import { ProjectVersion } from '../model/index';

export interface Project {
    Id: number;
    AssignmentId: number;
    LastModifiedDatetime?: Date;
    ProjectVersions: Array<ProjectVersion>;
    ActiveProjectVersion: ProjectVersion;
    IsActive: boolean;
    IsFavourite: boolean;
}
