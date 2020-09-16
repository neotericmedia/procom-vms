import { PhxLocalizationService } from './../../../common/services/phx-localization.service';
import { TimeSheetDetail } from './../../model/time-sheet-detail';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import {
  AccessAction,
  PhxDocument,
  PhxDocumentFileUploaderOptions,
  PhxDocumentFileUploadConfiguration,
  PhxDocumentFileUploadFileItemActionEventArg
} from '../../../common/model/index';
import { CommonService, WorkflowService, DialogService } from '../../../common/index';
import { ActivatedRoute } from '@angular/router';
import { TimeSheet, TimeSheetConfirmationMessage } from '../../model';
import { TimeSheetService } from '../../service/time-sheet.service';
import { uuid } from '../../../common/PhoenixCommon.module';
import { TimeSheetDocumentService } from '../../service/time-sheet-document.service';
import { TimeSheetUiService } from '../../service/time-sheet-ui.service';
import { DocumentService } from '../../../common/services/document.service';


@Component({
  selector: 'app-time-sheet-notes-attachments',
  templateUrl: './time-sheet-notes-attachments.component.html',
  styleUrls: ['./time-sheet-notes-attachments.component.less']
})
export class TimeSheetNotesAttachmentsComponent implements OnInit, OnDestroy {
  private alive: boolean = true;
  timeSheetSubscription: Subscription;
  timeSheetDocumentSubscription: Subscription;

  timeSheet: TimeSheet = <TimeSheet>{};
  documentList: Array<PhxDocument> = [];
  documentUploadConfiguration: PhxDocumentFileUploadConfiguration;

  documentDeleteConfiguration: any = <any>{
    action: null
  };

  projectGroupedTimeSheetDetails: Array<TimeSheetDetail>;

  fileUploadOptions: PhxDocumentFileUploaderOptions = {
    maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
    allowedFileType: [
      'compress',
      'xls',
      'ppt',
      'image',
      'pdf',
      'doc',
    ],
  };

  formatDateTime: any;
  formatDateFull: string;

  showNoteBackOffice: boolean;
  isNotesBlockCollapsed = true;

  sortedTimeSheetDetails: Array<TimeSheetDetail>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private timeSheetService: TimeSheetService,
    private commonService: CommonService,
    private documentActions: TimeSheetDocumentService,
    private workflowService: WorkflowService,
    private dialogService: DialogService,
    private uiService: TimeSheetUiService,
    private localizationService: PhxLocalizationService,
    private documentService: DocumentService,
  ) {

  }

  ngOnInit() {
    this.formatDateTime = this.commonService.ApplicationConstants.DateFormat.MMM_dd_yyyy_HH_mm; // capitalized AMPM
    this.formatDateFull = this.commonService.ApplicationConstants.DateFormat.longDate;

    this.activatedRoute.parent.params
      .subscribe((params) => {

        const id = +params['TimeSheetId'];
        if (this.timeSheetSubscription) {
          this.timeSheetSubscription.unsubscribe();
        }
        if (this.timeSheetDocumentSubscription) {
          this.timeSheetDocumentSubscription.unsubscribe();
        }
        this.timeSheetSubscription = this.timeSheetService.getTimeSheetById(id)
          .takeWhile(() => this.alive)
          .subscribe((timeSheet: TimeSheet) => {

            // const oldWorkflowPendingTaskId = this.timeSheet && this.timeSheet.WorkflowAvailableActions && this.timeSheet.WorkflowAvailableActions.length ? this.timeSheet.WorkflowAvailableActions[0].WorkflowPendingTaskId : null;
            this.timeSheet = timeSheet || <any>{};
            this.documentUploadConfiguration = this.documentDeleteConfiguration = null;

            if (this.timeSheet && this.timeSheet.Id) {
              this.showNoteBackOffice = this.timeSheet.AccessActions
                .some((action: AccessAction) => action.AccessAction === this.commonService.ApplicationConstants.EntityAccessAction.TimeSheetViewBackOffice);

              const uploadAction = this.timeSheet.AvailableStateActions.find(x => x === this.commonService.ApplicationConstants.StateAction.TimesheetAttachDocument);
              const deleteAction = this.timeSheet.AvailableStateActions.find(x => x === this.commonService.ApplicationConstants.StateAction.TimesheetRemoveDocument);

              if (uploadAction) {
                this.documentUploadConfiguration = new PhxDocumentFileUploadConfiguration({
                  UploadTitle: this.localizationService.translate('timesheet.notesAttachments.documentUploadTitle'),
                  // WorkflowPendingTaskId: uploadAction.WorkflowPendingTaskId,
                  entityTypeId: this.commonService.ApplicationConstants.EntityType.TimeSheet,
                  entityId: this.timeSheet.Id,
                  customId1: 0,
                  customId2: 0,
                  customMethodata: null,
                  description: '',
                  documentTypeId: this.commonService.ApplicationConstants.DocumentType.TimesheetSupportingDocument,
                  // zip file is not supported https://github.com/valor-software/ng2-file-upload/issues/885
                  SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, TIF, DOC, DOCX, XLS, XLSX, RAR, 7Z, TXT'
                });
              }

              if (deleteAction) {
                this.documentDeleteConfiguration = {
                  action: deleteAction
                };
              }

              // const newWorkflowPendingTaskId = timeSheet.WorkflowAvailableActions && timeSheet.WorkflowAvailableActions.length ? timeSheet.WorkflowAvailableActions[0].WorkflowPendingTaskId : null;
               // Documents controlled by workflow, stops flicker from documents loading after timesheet update from note debounce
              //  if (oldWorkflowPendingTaskId !== newWorkflowPendingTaskId) {
                this.documentActions.getTimeSheetDocumentById(this.timeSheet.Id);
              // }

              if (timeSheet.IsTimeSheetUsesProjects) {
                this.sortedTimeSheetDetails = this.sortTimesheetNotesByProject(this.timeSheet);
                this.projectGroupedTimeSheetDetails = this.timeSheetService.groupedTimeSheetDetails(this.sortedTimeSheetDetails, 'ProjectId');
              }
            }
          });

          this.timeSheetDocumentSubscription = this.documentActions.getTimeSheetDocumentById(id)
            .takeWhile(() => this.alive)
            .subscribe((documents: Array<PhxDocument>) => {
              this.documentList = documents;
            });
      });
  }

  sortTimesheetNotesByProject(timeSheet: TimeSheet) {
    return this.timeSheetService.sortTimesheetByProject(timeSheet).filter(x => !!x.Note);
  }

  createPdfDocumentLink(doc: PhxDocument): string {

    return this.documentService.createPdfDocumentLink(doc.PublicId);

  }

  getUploadCompleteNotification(event: PhxDocumentFileUploadFileItemActionEventArg) {
    this.commonService.logSuccess(this.localizationService.translate('timesheet.notesAttachments.documentUploadSuccessMessage', [event.item.file.name]), event);
  }

  onUploadComplete() {
    this.documentActions.getTimeSheetDocumentById(this.timeSheet.Id);
    this.timeSheetService.getTimeSheetById(this.timeSheet.Id, null, true);
  }


  deleteDocument(doc: PhxDocument) {

    const message = this.uiService.getMessage('deleteDocument', [doc.Name]);

    this.dialogService.confirm(message.title, message.body).then((button) => {
      this.documentActions.deleteTimeSheetDocumentByWorkflowAction(doc);
    });
  }

  updateProp(field: string, val: any) {
    this.timeSheetService.updateTimeSheetProperty(this.timeSheet.Id, field, val);
  }

  save() {
    this.timeSheetService.saveTimeSheetNote(this.timeSheet);
  }

  ngOnDestroy() {
    this.alive = false;
  }

  identify(index, timeSheetDayItem) {
    return timeSheetDayItem.value.Id;
  }

  identifyProject(index, projectGroupedDetail) {
    return projectGroupedDetail.key;
  }

  onUpdatedNote(noteText: string, noteType: string) {

    if (noteText) {
      this.saveTimeSheetNote(noteText, noteType);
    } else if (this.timeSheet[noteType] && this.timeSheet[noteType].length > 0) {
      this.deleteTimeSheetNote(noteType);
    }

  }

  saveTimeSheetNote(noteText: string, noteType: string) {

    this.timeSheetService.updateTimeSheetProperty(this.timeSheet.Id, noteType, noteText);
    this.save();
  }

  deleteTimeSheetNote(noteType: string) {

    const message = this.uiService.getMessage('deleteTimeSheetNote');

    this.dialogService.confirm(message.title, message.body).then((button) => {
      this.timeSheetService.updateTimeSheetProperty(this.timeSheet.Id, noteType, '');
      this.save();
    })
      .catch((e) => {
        console.log(e);
      });

  }

}
