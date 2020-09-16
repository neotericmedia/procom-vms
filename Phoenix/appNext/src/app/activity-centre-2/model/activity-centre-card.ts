import { PhxConstants } from '../../common';

export interface ClientInfo {
    Id: number;
    DisplayName: string;
}

export interface Client {
    Client: string;
}

export interface CardActions {
    Actions?: number[];
}

export type TimeSheetActions = 'TimesheetDecline' | 'TimesheetApprove';

export interface TimeSheetActionCommand {
    CommandName: TimeSheetActions;
    TimeSheetId: number;
    EntityIds?: number[];
    LastModifiedDatetime: Date;
    Comment?: string;
}

export interface CardBase extends CardActions {
    title: string;
    subTitle: any;
    EntityTypeId: number;
    EntityId: PhxConstants.EntityType;
    StatusId: number;
    TaskOwner: string;
    TimeInState: number;
    selected: boolean;
    entityAbbreviation: string;
    actionLink: string;
    HasUnitsOnHolidayWeekend: boolean;
}

export interface TimesheetCard extends CardBase, Client {
    LegalName: string;
    LegalStatusId: number;
    TimesheetStartDate: Date;
    TimesheetEndDate: Date;
    Amount: number;
    RateUnitId: number;
    HasUnitsOnHolidayWeekend: boolean;
}

export interface ComplianceDoucmentCard extends CardBase {
    DocumentRuleName: string;
    RequirementTypeId: string;
    DocumentEntityTypeId: number; // Document Header Entity Type in DB
    DocumentEntityId: number;
    DocumentCardEntityTypeId: number; // Document UI Card Entity Type (groups the Org Role EntityTypes into EntityType.Organization)

    OrganizationId: number;
    OrganizationDisplayName: string;
    OrganizationStatusId: PhxConstants.OrganizationStatus;
    OrganizationRoleTypeId: PhxConstants.OrganizationRoleType;

    WorkOrderWorkerName: string;
    WorkOrderNumber: string;
    WorkOrderVersionStatusId: PhxConstants.WorkOrderVersionStatus;
    WorkOrderVersionId: number;
    WorkOrderAssignmentId: number;

    ProfileContactId: number;
    ProfileLegalName: string;
    ProfileStatusId: PhxConstants.ProfileStatus;
    ProfileTypeId: PhxConstants.ProfileType;
}

export interface PaymentCard extends CardBase {
    PayeeName: string;
    LegalStatusId: number;
    PaymentReleaseDate: Date;
    Amount: number;
    NumberOfTransactions: number;
    CurrencyId: number;
}

export interface WorkOrderCard extends CardBase, Client {
    LegalName: string;
    LegalStatusId: number;
    WorkOrderStartDate: Date;
    WorkOrderEndDate: Date;
    WorkOrderId: number;
    AssignmentId: number;
}

export interface ProfileCard extends CardBase, Client {
    LegalName: string;
    LegalStatusId: number;
    CreationDate: Date;
    Organization: string;
}

export interface OrganizationCard extends CardBase, Client {
    OrganizationName: string;
    OrganizationRoleTypeIds: number[];
    CountryId: number;
    CreationDate: Date;
}

export interface CardEntity {
    EntityId: number;
    EntityTypeId: number;
}
