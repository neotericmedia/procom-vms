import { StateAction } from './../../common/model/state-action';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { WorkflowAction } from './../../common/model/workflow-action';
import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'complianceDocumentWorkflowActionButtonName'
})
export class ComplianceDocumentWorkflowActionButtonName implements PipeTransform {
  constructor() {}

  transform(action: StateAction, statusId: PhxConstants.ComplianceDocumentStatus): string {
    switch (action.commandName) {
      case PhxConstants.CommandNamesSupportedByUi.ComplianceDocumentUserActionViewDocument:
        switch (statusId) {
          case PhxConstants.ComplianceDocumentStatus.PendingReview:
          case PhxConstants.ComplianceDocumentStatus.PendingExemptionRequest:
            return 'Review';
          default:
            return 'View';
        }

      case PhxConstants.CommandNamesSupportedByUi.ComplianceDocumentUserActionUploadDocumentMain:
        return 'Upload';

      case PhxConstants.CommandNamesSupportedByUi.ComplianceDocumentUserActionViewDocumentTemplate:
        return 'Generate';

      case PhxConstants.CommandNamesSupportedByUi.ComplianceDocumentUserActionRequestSnoozeApprovalApprove:
        return 'Approve';

      case PhxConstants.CommandNamesSupportedByUi.ComplianceDocumentUserActionRequestSnoozeApprovalDecline:
        return 'Decline';
    }

    return action.displayText;
  }
}
