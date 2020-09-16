import { PhxConstants } from '../common';

export const ConstStateActionSuccessMessages = {
    [PhxConstants.StateAction.ComplianceDocumentSubmit]: 'Document Submitted',
    [PhxConstants.StateAction.ComplianceDocumentDiscard]: 'Document Deleted',
    [PhxConstants.StateAction.ComplianceDocumentRecall]: 'Document Recalled',

    [PhxConstants.StateAction.ComplianceDocumentRequestSnooze]: 'Document Snoozed',
    [PhxConstants.StateAction.ComplianceDocumentDeclineSnooze]: 'Snooze Declined',
    [PhxConstants.StateAction.ComplianceDocumentApproveSnooze]: 'Snooze Approved',

    [PhxConstants.StateAction.ComplianceDocumentDiscard]: 'Document Deleted',
    [PhxConstants.StateAction.ComplianceDocumentArchive]: 'Document Archived',

    [PhxConstants.StateAction.ComplianceDocumentApprove]: 'Document Approved',
    [PhxConstants.StateAction.ComplianceDocumentDecline]: 'Document Declined',
};
