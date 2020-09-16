import { PhxConstants } from './../../common/model/phx-constants';

export class FunctionalRole {
    Id: number;
    Name: string;
    FunctionalRoleId: number;
}

export class ProfileReassignFrom {
    latestProfileId: number;
    latestContactId: number;
    FullName: number;
    UserProfileFunctionalRoles: FunctionalRole[];
}

export class AssignType {
    Id: PhxConstants.ReassignmentType;
    Description: string;
}
export class InternalUserProfile {
    ContactId: number;
    ProfileId: number;
    FullName: string;
}
export class RecruiterProfile {
    ProfileId: number;
    FullName: string;
    BranchId: number;
}
export class BranchManaged {
    CodeInternalOrganizationDefinition1Id: number;
    ManagerId: number;
}

export class ExpenseApprover {
    UserProfileId: number;
}

export class CollaboratorWO {
    ClientOrganizationId: number;
    ClientDisplayName: string;
    AssignedToUserProfileId: number;
    WorkOrderVersionId: number;
    StatusId: number;
    VersionNumber: number;
    EffectiveDate: Date;
    ExpenseApprovers: ExpenseApprover[];
}

export class RecruiterWO {
    BranchId: number;
    BranchName: string;
    RecruiterUserProfileId: number;
    WorkOrderVersionId: number;
}

export class WOVExpenseApproverInfo {
    WorkOrderVersionId: number;
    IsExpenseApprover: boolean;
}

export class GroupedWOsByClient {
    ClientOrganizationId: number;
    ClientDisplayName: string;
    WOVExpenseApproverInfos: WOVExpenseApproverInfo[];
    WorkorderCount: number;
}

export class WorkOrdersByBranch {
    BranchId: number;
    BranchName: string;
    WorkorderCount: number;
    WorkOrderVersionIdList: number[];
}

export class OrganizationCollaborator {
    Id: number;
    DisplayName: string;
}

export class ContactCollaborator {
    Id: number;
    FullName: string;
}

export class WorkOrderVersionReassign {
    WorkOrderVersionId: number;
    AssignedToUserProfileId: number;
    IsExpenseApprover: boolean;
}

export class WorkOrderVersionRecruiterReassign {
    WorkOrderVersionId: number;
    AssignedToUserProfileId: number;
}

export class OrganizationReassign {
    OrganizationId: number;
    AssignedToUserProfileId: number;
}

export class UserProfileReassign {
    ContactId: number;
    AssignedToUserProfileId: number;
}

export class BranchReassign {
    BranchManagerId: number;
    CodeInternalOrganizationDefinition1Id: number;
    AssignedToUserProfileId: number;
}

export class Reassign {
    WOVReassign: WorkOrderVersionReassign[];
    OrgReassign: OrganizationReassign[];
    ProfileReassign: UserProfileReassign[];
    BranchReassign: BranchReassign[];
    CurrentAssignedToUserProfileId: number;
}

export class ReassignRecruiter {
    CurrentAssignedToUserProfileId: number;
    WOVRecruiterReassign: WorkOrderVersionRecruiterReassign[];
}


export class WOReassignmentFormModel {
    WOClient: GroupedWOsByClient;
    AssignedToUserProfileId: InternalUserProfile;
}

export class OrgReassignmentFormModel {
    Organization: OrganizationCollaborator;
    AssignedToUserProfileId: InternalUserProfile;
}

export class ProfileReassignmentFormModel {
    Profile: ContactCollaborator;
    AssignedToUserProfileId: InternalUserProfile;
}

export class InternalUserOffboardingFormModel {
    AssignType: AssignType;
    BranchManagerReassignedTo: InternalUserProfile;
    ReassignAllItemsTo: InternalUserProfile;
    ReassignAllWOsTo: InternalUserProfile;
    GroupedWOsByClientList: WOReassignmentFormModel[];
    ReassignAllOrgsTo: InternalUserProfile;
    OrganizationList: OrgReassignmentFormModel[];
    ReassignAllProfilesTo: InternalUserProfile;
    ProfileList: ProfileReassignmentFormModel[];
}
