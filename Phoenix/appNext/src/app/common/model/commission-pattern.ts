export interface CommissionRateVersion {
    WorkflowPendingTaskId?: any;
    WorkflowAvailableActions?: any;
    Id: number;
    EffectiveDate: string;
    CommissionRateHeaderId: number;
    CommissionRateVersionStatusId: number;
    ScheduledChangeRateApplicationId: number;
    Percentage: number;
}

export interface CommissionRateRestriction {
    Id: number;
    CommissionRateHeaderId: number;
    CommissionRateRestrictionTypeId: number;
    Name: string;
    OrganizationIdInternal?: number;
    OrganizationIdClient?: number;
    LineOfBusinessId?: number;
    InternalOrganizationDefinition1Id?: number;
}

export interface CommissionRateHeaderUser {
    AccessLevelId: number;
    Id: number;
    CommissionUserProfileId: number;
    CommissionUserProfileStatusId: number;
    CommissionUserProfileFirstName: string;
    CommissionUserProfileLastName: string;
    CommissionUserProfileStatusName: string;
    CommissionRateTypeId: number;
    CommissionRoleId: number;
    CommissionRateHeaderStatusId: number;
    Description: string;
    CommissionRateVersions: CommissionRateVersion[];
    CommissionRateRestrictions: CommissionRateRestriction[];
}

export interface CommissionRateHeaderUsersCollection {
    Items: CommissionRateHeaderUser[];
    NextPageLink?: any;
    Count?: any;
}

export interface CommissionSalesPatternSupporter {
    CommissionRoleId: number;
    UserProfileId: number;
    Id: number;
}

export interface CommissionSalesPattern {
    LastModifiedDatetime: Date;
    Description: string;
    SalesPatternStatusId: number;
    Id: number;
    CommissionSalesPatternSupporters: CommissionSalesPatternSupporter[];
}
