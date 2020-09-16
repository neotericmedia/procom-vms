
export interface CommissionRateRestriction {
    CommissionRateRestrictionTypeId: number;
    OrganizationIdClient: number;
    Name: string;
    OrganizationIdInternal?: number;
    InternalOrganizationDefinition1Id?: number;
}

export interface CommissionRateVersion {
    Percentage: number;
    CommissionRateVersionStatusId: number;
    ScheduledChangeRateApplicationId: number;
}

export interface TemplateMetadata {
    TemplateMetadataName: string;
    TemplateMetadataValue: number;
}

export interface Entity {
    CommissionRoleId: number;
    CommissionRateTypeId: number;
    Description: string;
    CommissionRateHeaderStatusId: number;
    CommissionRateRestrictions: CommissionRateRestriction[];
    CommissionRateVersions: CommissionRateVersion[];
    TemplateMetadatas: TemplateMetadata[];
}

export interface CommissionTemplate {
    Id: number;
    Name: string;
    Description: string;
    StatusId: number;
    EntityTypeId: number;
    EntityTemplate: string;
    Entity: Entity;
    IsDraft: boolean;
    IsPrivate: boolean;
    LastModifiedByProfileId: number;
    LastModifiedDateTime: Date;
    CreatedByFirstName: string;
    CreatedByFullName: string;
    CreatedByLastName: string;
    CreatedByProfileId: number;
    CreatedDateTime: Date;
    TemplateMetadatas: TemplateMetadata[];
}

export interface CommissionRateRestrictionType {
    id: number;
    groupName: string;
    parentId?: number;
    parentGroup?: any;
    code: string;
    text: string;
    description: string;
    sortOrder: number;
}

export interface Branch {
    CommissionRateRestrictionTypeId: number;
    InternalOrganizationDefinition1Id: number;
    Name: string;
}

export interface LineOfBusiness {
    CommissionRateRestrictionTypeId: number;
    LineOfBusinessId: number;
    Name: string;
}

export interface ClientOrganization {
    CommissionRateRestrictionTypeId: number;
    OrganizationIdClient: number;
    Name: string;
}

export interface InternalOrganization {
    CommissionRateRestrictionTypeId: number;
    OrganizationIdInternal: number;
    Name: string;
}
export interface ScheduledChangeRateApplicationDetails {
    value: number;
    text: string;
}

export interface CommissionTemplateList {
    Branch: Array<Branch>;
    LineOfBusiness: Array<LineOfBusiness>;
    ClientOrganization: Array<ClientOrganization>;
    InternalOrganization: Array<InternalOrganization>;
    ListCommissionRole: Array<CommissionRateRestrictionType>;
    ListCommissionRateType: Array<CommissionRateRestrictionType>;
    CommissionRateRestrictionType: Array<CommissionRateRestrictionType>;
    ScheduledChangeRateApplicationDetails: Array<ScheduledChangeRateApplicationDetails>;
}

export interface CommissionRateAddRestrictionConfig {
    ViewType: string;
    SelectedRestrictionTypeId: number;
    RestrictionList: any;
    ValueField: string;
}

export interface SelectedRestrictionList {
    RestrictionTypeName: string;
    RestrictionTypeCode: string;
    SelectedRestrictions: any;
}
