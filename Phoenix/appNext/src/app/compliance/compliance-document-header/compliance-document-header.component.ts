import { AvailableStateActions } from './../../common/model/available-state-actions';
import { ComplianceDocumentService } from './../shared/compliance-document.service';
import { CodeValueGroups } from './../../common/model/phx-code-value-groups';
import { style } from '@angular/animations';
import { IComplianceDocumentHeader, IComplianceDocument, IStateActionEvent } from './../shared/compliance-document.model';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PhxConstants, CodeValueService } from '../../common';
import { StateAction, StateActionButtonsOption, StateActionButtonStyle, OnClickStateActionOption } from '../../common/model/state-action';
import { PhxDataTableColumn, PhxDataTableConfiguration, PhxDataTableStateSavingMode } from '../../common/model';

import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compliance-document-header',
  templateUrl: './compliance-document-header.component.html',
  styleUrls: ['./compliance-document-header.component.less']
})
export class ComplianceDocumentHeaderComponent implements OnInit, OnChanges {
  @Input() header: IComplianceDocumentHeader;

  @Output() onStateAction = new EventEmitter<IStateActionEvent>();
  @Output() onGenerateDocument = new EventEmitter<IStateActionEvent>();
  @Output() onViewSample = new EventEmitter<IStateActionEvent>();

  codeValueGroups = CodeValueGroups;

  showWorkflowHistory: boolean = false;
  showPreviousDocuments: boolean = false;
  documentHistoryColumns: PhxDataTableColumn[];

  documentHistoryConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    columnHidingEnabled: true,
    stateSavingMode: PhxDataTableStateSavingMode.None,
    showFilter: false,
    showColumnChooser: false,
    showSearch: false,
    showGrouping: false,
    showTotalCount: false,
    showBorders: false,
    rowAlternationEnabled: false
  });

  stateActions: StateAction[];
  previousVersionStateActions: StateAction[];
  stylePrimary = StateActionButtonStyle.WARNING;

  entityTypeEnum = PhxConstants.EntityType;
  dateFormat = PhxConstants.DateFormat.mediumDate;

  templateExists: boolean;
  sampleExists: boolean;

  documentRuleLink: string;

  constructor(private complianceDocumentService: ComplianceDocumentService, private codeValueService: CodeValueService, private router: Router) {}

  ngOnInit() {
    // this.buildStateActions(); // TODO: extract dynamic styles and DROPDOWN/BUTTON stuff, call that in this.onInit and ngOnChanges
    this.buildDocumentHistoryColumns();
    this.onInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.header && !changes.header.firstChange) {
      const prevHeader: IComplianceDocumentHeader = changes.header.previousValue;
      const prevDocument = prevHeader ? prevHeader.ComplianceDocumentCurrent : null;
      const currDocument = this.header ? this.header.ComplianceDocumentCurrent : null;

      // Change main document
      if ((currDocument ? currDocument.Id : null) !== (prevDocument ? prevDocument.Id : null)) {
        this.onInit();
      } else {
        // Have to do this every time due to Pending Upload, otherwise refresh on Status or Documents.length > 0) change
        const prevStatus = prevDocument ? prevDocument.ComplianceDocumentStatusId : null;

        const prevHasDocuments = prevDocument ? prevDocument.Documents.length > 0 : null;
        const currHasDocuments = currDocument ? currDocument.Documents.length > 0 : null;

        let shouldRebuildStateActions = false;

        if ((currDocument ? currDocument.ComplianceDocumentStatusId : null) !== prevStatus) {
          // Status Change
          shouldRebuildStateActions = true;
        } else if (currHasDocuments !== prevHasDocuments) {
          // HasDocuments change
          shouldRebuildStateActions = true;
        }

        if (shouldRebuildStateActions) {
          this.buildStateActions();
        }
      }
    }
  }

  private onInit() {
    this.documentRuleLink = this.router.createUrlTree(['/next/document/rule/edit/', this.header.ComplianceDocumentRuleId, 'details']).toString();
    this.templateExists = this.header.HasTemplates;
    this.sampleExists = this.header.HasSamples;

    if (this.header.ComplianceDocumentCurrent) {
      this.buildStateActions();
      const entity = this.header.ComplianceDocumentCurrent;

      this.complianceDocumentService.getAvailableStateActions(entity.Id).then(actions => {
        // TODO: redux?
        const actionsForStatus = actions.find(x => x.EntityStatusId === entity.ComplianceDocumentStatusId);

        this.complianceDocumentService.updateAvailableStateActions(entity.Id, actionsForStatus ? actionsForStatus.AvailableStateActions : []);
      });
    }
  }

  onToggleHistory() {
    this.showPreviousDocuments = !this.showPreviousDocuments;
    this.showWorkflowHistory = !this.showWorkflowHistory;
  }

  private onClickStateAction = (action: StateAction, componentOption: StateActionButtonsOption, actionOption?: OnClickStateActionOption) => {
    const entity: IComplianceDocument = componentOption.refData ? componentOption.refData : this.header.ComplianceDocumentCurrent;
    const event: IStateActionEvent = {
      stateAction: action,
      entity: entity,
      header: this.header
    };

    if (actionOption && actionOption.comment) {
      event.payload = { Comments: actionOption.comment };
    }

    this.onStateAction.emit(event);
  };

  private buildStateActions() {
    const complianceDocumentCurrent = this.header ? this.header.ComplianceDocumentCurrent : null;
    const curStatusId = complianceDocumentCurrent ? complianceDocumentCurrent.ComplianceDocumentStatusId : null;
    const isDocUploaded = this.isDocumentuploaded();
    const isDocMandatory = this.isUploadMandatory(this.header.ComplianceDocumentRuleRequiredTypeId, curStatusId, complianceDocumentCurrent.ComplianceDocumentSnoozeExpiryDate);

    this.stateActions = [
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentSubmit,
        style: this.stylePrimary,
        hiddenFn: () => !this.isDocumentuploaded(),
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentApproveSnooze,
        displayText: 'Approve',
        style: this.stylePrimary,
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentDeclineSnooze,
        displayText: 'Decline',
        style: StateActionButtonStyle.SECONDARY,
        showDeclinedCommentDialog: true,
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentView,
        displayText: curStatusId === PhxConstants.ComplianceDocumentStatus.PendingReview || curStatusId === PhxConstants.ComplianceDocumentStatus.PendingExemptionRequest ? 'Review' : 'View',
        style: this.getViewActionStyle(curStatusId, isDocUploaded),
        hiddenFn: () => !this.isDocumentuploaded(),
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentUploadDocument,
        displayText: 'Upload',
        style: this.getUploadActionStyle(curStatusId, isDocUploaded, isDocMandatory),
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentGenerateDocument,
        displayText: 'Generate',
        style: this.getGenerateActionStyle(curStatusId, isDocUploaded),
        hiddenFn: () => !this.templateExists,
        onClick: action => this.onGenerateDocument.emit({ stateAction: action, entity: complianceDocumentCurrent, header: this.header })
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentRecall,
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentRequestSnooze,
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentRequestExemption,
        onClick: this.onClickStateAction,
        hiddenFn: () => complianceDocumentCurrent.ComplianceDocumentStatusId === PhxConstants.ComplianceDocumentStatus.PendingUpload && this.isDocumentuploaded()
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentArchive,
        showDeclinedCommentDialog: true,
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentDiscard,
        showDeclinedCommentDialog: true,
        hiddenFn: () => !this.isDocumentuploaded(),
        onClick: this.onClickStateAction
      },
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentViewSample,
        hiddenFn: () => !this.sampleExists,
        onClick: action => this.onViewSample.emit({ stateAction: action, entity: complianceDocumentCurrent, header: this.header })
      }
    ];

    this.previousVersionStateActions = [
      {
        actionId: PhxConstants.StateAction.ComplianceDocumentView,
        hiddenFn: (action, componentOption) => !this.isDocumentuploaded(componentOption.refData),
        onClick: this.onClickStateAction,
        skipSecurityCheck: true
      }
    ];
  }

  private getUploadActionStyle(docStatusId: number, isDocUploaded: boolean, isDocMandatory: boolean) {
    if (docStatusId === PhxConstants.ComplianceDocumentStatus.PendingUpload) {
      if (isDocUploaded) {
        return null;
      } else if (isDocMandatory) {
        return this.stylePrimary;
      } else {
        return StateActionButtonStyle.SECONDARY;
      }
    } else if (docStatusId === PhxConstants.ComplianceDocumentStatus.Snooze) {
      return StateActionButtonStyle.SECONDARY;
    }
    return null;
  }

  private getGenerateActionStyle(docStatusId: number, isDocUploaded: boolean) {
    if ((docStatusId === PhxConstants.ComplianceDocumentStatus.PendingUpload && !isDocUploaded) || docStatusId === PhxConstants.ComplianceDocumentStatus.PendingSnoozeRequest || docStatusId === PhxConstants.ComplianceDocumentStatus.Snooze) {
      return StateActionButtonStyle.SECONDARY;
    }
    return null;
  }

  private getViewActionStyle(docStatusId: number, isDocUploaded: boolean) {
    if (docStatusId === PhxConstants.ComplianceDocumentStatus.PendingReview || docStatusId === PhxConstants.ComplianceDocumentStatus.PendingExemptionRequest) {
      return this.stylePrimary;
    } else if (isDocUploaded) {
      return StateActionButtonStyle.SECONDARY;
    }
    return null;
  }

  // FBO document sequence V3.xlsx
  private getStateActionLists(stateActions: StateAction[], statusId: PhxConstants.ComplianceDocumentStatus): { buttons: StateAction[]; moreItems: StateAction[] } {
    const isDocumentUploaded = this.isDocumentuploaded();

    const buttons = stateActions.filter(item => {
      switch (item.actionId) {
        case PhxConstants.StateAction.ComplianceDocumentSubmit:
        case PhxConstants.StateAction.ComplianceDocumentApproveSnooze:
        case PhxConstants.StateAction.ComplianceDocumentDeclineSnooze:
          return true;
        case PhxConstants.StateAction.ComplianceDocumentView:
          return statusId === PhxConstants.ComplianceDocumentStatus.PendingUpload || statusId === PhxConstants.ComplianceDocumentStatus.Active || statusId === PhxConstants.ComplianceDocumentStatus.Exemption;
        case PhxConstants.StateAction.ComplianceDocumentUploadDocument:
        case PhxConstants.StateAction.ComplianceDocumentGenerateDocument:
          return statusId === PhxConstants.ComplianceDocumentStatus.Snooze || (statusId === PhxConstants.ComplianceDocumentStatus.PendingUpload && !isDocumentUploaded);
        default:
          return false;
      }
    });

    const moreItems = stateActions.filter(item => {
      return !buttons.some(button => button.actionId === item.actionId) || (item.actionId === PhxConstants.StateAction.ComplianceDocumentView && statusId === PhxConstants.ComplianceDocumentStatus.PendingReview); // Always show view in both lists on Pending Review
    });

    return {
      buttons: buttons,
      moreItems: moreItems
    };
  }

  private isDocumentuploaded(entity?: IComplianceDocument) {
    const complianceDocument = entity ? entity : this.header.ComplianceDocumentCurrent;
    return complianceDocument && complianceDocument.Documents && complianceDocument.Documents.length > 0;
  }

  private canEditExpiryDate() {
    return this.header.ComplianceDocumentRuleExpiryTypeId !== PhxConstants.ComplianceDocumentRuleExpiryType.None;
  }

  private isUploadMandatory(requiredTypeId: PhxConstants.ComplianceDocumentRuleRequiredType, statusId: PhxConstants.ComplianceDocumentStatus, snoozeExpiryDate: Date): boolean {
    const ComplianceDocumentStatus = PhxConstants.ComplianceDocumentStatus;

    const isMandatory = requiredTypeId === PhxConstants.ComplianceDocumentRuleRequiredType.MandatoryForSubmission;

    const now = moment()
      .startOf('day')
      .toDate(); // TODO: handle time component when implemented

    let result = false;

    const statusListMandatory = [
      ComplianceDocumentStatus.PendingUpload,
      ComplianceDocumentStatus.PendingReview,
      ComplianceDocumentStatus.Declined,
      ComplianceDocumentStatus.Archived,
      ComplianceDocumentStatus.Expired,
      ComplianceDocumentStatus.Snooze,
      ComplianceDocumentStatus.PendingSnoozeRequest,
      ComplianceDocumentStatus.PendingExemptionRequest
    ];

    if (isMandatory && statusListMandatory.some(x => x === statusId)) {
      result = true;
    }

    if (isMandatory && statusId === ComplianceDocumentStatus.Snooze && snoozeExpiryDate !== null && snoozeExpiryDate > now) {
      result = false;
    }

    return result;
  }

  private buildDocumentHistoryColumns() {
    this.documentHistoryColumns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'ID',
        dataType: 'string',
        cellTemplate: 'idCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'Expiry Date',
        dataType: 'date',
        cellTemplate: 'expiryDateCellTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'ComplianceDocumentStatusId',
        caption: 'Status',
        dataType: 'string',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceDocumentStatus, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'Action',
        allowSearch: false,
        cellTemplate: 'actionCellTemplate'
      })
    ];
  }
}
