import { CustomFieldVersion, AccessAction } from './../../common/model/index';
import { Project } from './project';

export interface ProjectManagement {
    AssignmentId: number;
    AccessActions?: AccessAction[];
    CustomFieldVersions: Array<CustomFieldVersion>;
    ActiveCustomFieldVersion: CustomFieldVersion;
    Projects: Project[];
}
