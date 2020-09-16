import { SafeResourceUrl } from '@angular/platform-browser';
import { PhxConstants } from '../../common/model/phx-constants';
import { StateAction } from '../../common/model/state-action';

export interface IComplianceDocumentDto {
    ComplianceDocumentHeaderId: number;
    ComplianceDocumentHeaderToEntityTypeId: PhxConstants.EntityType;
    ComplianceDocumentHeaderToEntityId: number;
    // ComplianceDocumentRule
    ComplianceDocumentRuleId: number;
    ComplianceDocumentRuleEntityTypeId: PhxConstants.ComplianceDocumentRuleEntityType;
    ComplianceDocumentRuleAreaTypeId: PhxConstants.ComplianceDocumentRuleAreaType;
    ComplianceDocumentRuleRequiredTypeId: PhxConstants.ComplianceDocumentRuleRequiredType;
    ComplianceDocumentRuleDisplayName: string;
    ComplianceDocumentRuleExpiryTypeId: PhxConstants.ComplianceDocumentRuleExpiryType;
    // ComplianceDocument
    ComplianceDocumentId: number;
    ComplianceDocumentStatusId: PhxConstants.ComplianceDocumentStatus;
    ComplianceDocumentExpiryDate: string;
    ComplianceDocumentSnoozeExpiryDate: string;
    AvailableStateActions: number[];
    Documents: Array<IDocument>;
    ApplicableComplianceTemplates: Array<IApplicableComplianceTemplateDto>;
}

export interface IComplianceDocumentLiteDto {
    ComplianceDocumentHeaderId: number;
    // ComplianceDocument
    ComplianceDocumentId: number;
    ComplianceDocumentStatusId: PhxConstants.ComplianceDocumentStatus;
    ComplianceDocumentExpiryDate: string;
    ComplianceDocumentSnoozeExpiryDate: string;
    AvailableStateActions: number[];
    Documents: Array<IDocument>;
}

export class IApplicableComplianceTemplateDto {
    public ComplianceTemplateId: number;
    public ComplianceTemplateName: string;

    public ComplianceTemplateTemplateDocumentPublicId: string;
    public ComplianceTemplateTemplateDocumentName: string;

    public ComplianceTemplateSampleDocumentPublicId: string;
    public ComplianceTemplateSampleDocumentName: string;

    public ComplianceDocumentRuleId: number;
    public ComplianceDocumentRuleDisplayName: string;
    public ComplianceDocumentId: number;
    public ComplianceDocumentHeaderId: number;
}

export interface IComplianceDocumentEntityGroup {
    EntityTypeId: number;
    EntityId: number;
    Headers: IComplianceDocumentHeader[];
}

export interface IComplianceDocumentHeader {
    Id: number;
    EntityTypeId: PhxConstants.EntityType;
    EntityId: number;

    ComplianceDocumentRuleId: number;
    ComplianceDocumentRuleAreaTypeId: PhxConstants.ComplianceDocumentRuleAreaType;
    ComplianceDocumentRuleRequiredTypeId: PhxConstants.ComplianceDocumentRuleRequiredType;
    ComplianceDocumentRuleDisplayName: string;
    ComplianceDocumentRuleExpiryTypeId: PhxConstants.ComplianceDocumentRuleExpiryType;

    ComplianceDocumentCurrent: IComplianceDocument;
    PreviousDocuments: IComplianceDocument[];

    ApplicableTemplateDocuments: IApplicableComplianceTemplate[];

    HasTemplates: boolean;
    HasSamples: boolean;
}

export interface IApplicableComplianceTemplate {
    Id: number;
    Name: string;

    DocumentPublicId: string;
    DocumentName: string;

    TemplateType: PhxConstants.ComplianceTemplateDocumentType;
}

export interface IComplianceDocument {
    Id: number;
    ComplianceDocumentStatusId: PhxConstants.ComplianceDocumentStatus;
    ComplianceDocumentSnoozeExpiryDate: Date;
    ComplianceDocumentExpiryDate: Date;
    AvailableStateActions: number[];
    Documents: Array<IDocument>;
}

export interface IDocument {
    DocumentName: string;
    DocumentPublicId: string;
    DocumentCreatedDatetime: Date;
    DocumentSrc: string | SafeResourceUrl;
    ESignedStatusId: number;
}

export interface IStateActionEvent {
    stateAction: StateAction;
    entity: IComplianceDocument;
    header: IComplianceDocumentHeader;
    payload?: any;
    successMessage?: string;
}

export interface IExpiryDateForm {
    ExpiryDate: Date;
    Comment: string;
}

export interface ComplianceDocumentCallBackModel {
    AllComplianceDocumentsAreValidForSubmission: boolean;
    ParentEntityHasNoApplicableComplianceDocuments: boolean;
}
export enum ComplianceDocumentApprovalType {
    ReviewApproval = 1,
    ExemptionApproval = 2,
}

export interface NavDoc {
    publicId: string;
    text: string;
    isSelected: boolean;
    eSignedStatusId: PhxConstants.ESignedStatus;
}
export interface DocHeaderWorkOrderInfo {
    WorkOrderFullNumber: string;
    WorkerName: string;
    ClientName: string;
}
export interface DocHeaderOrgInfo {
    DisplayName: string;
    Id: number;
}
export interface DocHeaderUserProfileInfo {
    FirstName: string;
    LastName: string;
}
