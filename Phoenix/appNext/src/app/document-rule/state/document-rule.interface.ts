import { AccessAction, WorkflowAction } from '../../common/model';

export interface IRoot {
    Id: number;
    DocumentRuleDetails: IDocumentRuleDetails;
    DocumentRules: IRules;
}

export interface IDocumentRuleDetails {
    Description?: string;
    DisplayName?: string;
    DocumentType?: number;
    OrganizationIdClient?: number;
    ComplianceDocumentRuleUserDefinedDocumentTypes?: IComplianceDocumentRuleUserDefinedDocumentType[];
}

export interface IRules extends IRestrictions {
    ComplianceDocumentRuleEntityTypeId: number;
    ComplianceDocumentRuleRequiredTypeId: number;
    ComplianceDocumentRuleExpiryTypeId: number;
    IsRequiredReview: boolean;
    ComplianceDocumentRuleRequiredSituations: IComplianceDocumentRuleRequiredSituation[];
    ComplianceDocumentRuleProfileVisibilities: IComplianceDocumentRuleProfileVisibility[];
}

export interface IRestrictions {
    ComplianceDocumentRuleRestrictions: IComplianceDocumentRuleRestriction[];
}

export interface IDocumentRule extends IDocumentRuleDetails, IRules, IRestrictions {
    IsMultipleSubstitutionsAllowed: boolean;
    OrganizationIdClient: number;
    ComplianceDocumentRuleAreaTypeId: number;
    ComplianceDocumentRuleStatusId: number;
    OriginalId: number;
    Id: number;
    IsOriginalAndStatusIsAtiveOrPendingChange: boolean;
    IsOriginal: boolean;
    Versions: Version[];
    WorkflowAvailableActions: WorkflowAction[];
    WorkflowPendingTaskId: number;
    AccessActions: AccessAction[];
    readonly ReadOnlyStorage: IReadOnlyStorage;
    ValidationErrors: Array<IDocumentRuleValidationError>
}

export interface IReadOnlyStorage {
    readonly IsEditable: boolean;
    readonly IsDebugMode: boolean;
    readonly AccessActions: Array<AccessAction>;
}


export interface IComplianceDocumentRuleProfileVisibility {
    IsSelected: boolean;
    ComplianceDocumentRuleProfileVisibilityTypeId: number;
    Id: number;
}

export interface IDocumentRuleValidationError {
    ValidationErrors: Array<string>;
}

export interface IComplianceDocumentRuleRequiredSituation {
    IsSelected: boolean;
    ComplianceDocumentRuleRequiredSituationTypeId: number;
    Id: number;
}

export interface IComplianceDocumentRuleRestriction {
    Name: string;
    WorkerEligibilityId: null;
    TaxSubdivisionId: null;
    OrganizationRoleTypeId: null;
    WorksiteId: null;
    InternalOrganizationId: number | null;
    ProfileTypeId: null;
    BranchId: null;
    ClientOrganizationId: null;
    LineOfBusinessId: number | null;
    IsInclusive: boolean;
    ComplianceDocumentRuleRestrictionTypeId: number;
    Id: number;
}

export interface IComplianceDocumentRuleUserDefinedDocumentType {
    UserDefinedCodeComplianceDocumentTypeId: number;
    Id: number;
    Name?: string;
}

export interface Version {
    IsOriginal: boolean;
    ComplianceDocumentRuleStatusId: number;
    Id: number;
}