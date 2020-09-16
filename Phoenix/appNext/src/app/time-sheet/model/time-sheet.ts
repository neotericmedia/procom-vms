import { AccessAction, WorkflowAction, CustomFieldVersion } from './../../common/model/index';
import { TimeSheetActiveCapsule, TimeSheetDay, TimeSheetWeek, TimeSheetLineManagement, TimeSheetRate, TimeSheetError } from './index';

export interface TimeSheet {

    Id: number;
    WorkOrderId: number;
    WorkOrderNumberFull: string;
    StartDate: Date ;
    Description: string;
    EndDate: Date;
    TimeSheetStatusId: number;
    TimeSheetTypeId: number;
    LastModifiedByProfileId: number;
    LastModifiedDatetime: Date;
    CreatedByProfileId: number;
    CreatedDatetime: Date;
    OrganizationIdClient: number;
    ClientName: string;
    OrganizationIdInternal: number;
    InternalName: string;
    IsDraft: boolean;
    IsEditable: boolean;
    ExpandAllDays: boolean;
    IsWorkflowRunning: boolean;
    WorkerProfileId: number;
    WorkerFirstName: string;
    WorkerLastName: string;
    ApproverNames: string;
    PrimaryRateUnitId: number;
    Rates: Array<TimeSheetRate>;
    IsTimeSheetUsesProjects?: boolean;
    AssignmentId: number;
    TimeSheetDays: Array<TimeSheetDay> | { [id: number]: TimeSheetDay };
    ImportedDetails: any[]; // TODO: make model
    NoteBackOffice: string;
    NoteClientApprover: string;
    AccessActions: Array<AccessAction>;
    AvailableStateActions: Array<number>;
    IsPreviousSubmitted: boolean;
    ActiveCapsule: TimeSheetActiveCapsule;
    Calendar: Array<TimeSheetWeek>;
    HoursPerDay: number;
    PONumber: string;
    POUnitsRemaining: number;
    AvailableProjectList?: Array<number>;
    CustomFieldVersion: CustomFieldVersion;
    Errors?: TimeSheetError;
    ServerError?: any;
}

