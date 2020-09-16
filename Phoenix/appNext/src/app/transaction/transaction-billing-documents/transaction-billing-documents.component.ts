// angular
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { map, each, filter } from 'lodash';
import { Router } from '@angular/router';
// common
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { CodeValue, PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions, PhxConstants } from '../../common/model';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { PhxEntityDocumentsListComponent } from '../../common/components/phx-entity-documents-list/phx-entity-documents-list.component';
import { CodeValueService, CommonService } from '../../common';
// transaction
import { TransactionService } from './../transaction.service';
import { TransactionObservableService } from '../state/transaction.observable.service';
import { ITransactionHeader } from '../state';
import { PhxEntityDocumentsList2Component } from '../../common/components/phx-entity-documents-list2/phx-entity-documents-list2.component';

@Component({
  selector: 'app-transaction-billing-documents',
  templateUrl: './transaction-billing-documents.component.html'
})
export class TransactionBillingDocumentsComponent extends BaseComponentOnDestroy implements OnInit, AfterViewInit {
  transaction: ITransactionHeader;
  timesheetId: number;
  static transactionTimeSheetId: number;
  listLoaded: boolean = false;

  html: {
    phxConstants: typeof PhxConstants;
    documentTypeSubList: CodeValue[];
    documentTypeUnfilteredSubList: CodeValue[];
    documentFileUploadConfiguration?: PhxDocumentFileUploadConfiguration;
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions;
    list: {
      timesheet: Array<any>;
    };
  } = {
      phxConstants: PhxConstants,
      list: {
        timesheet: []
      },
      fileUploaderOptions_DocumentMain: {
        queueLimit: 15,
        maxFileSize: 20 * 1024 * 1024,
        allowedMimeType: ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowedFileType: ['image', 'pdf', 'doc']
      },
      documentTypeSubList: [],
      documentTypeUnfilteredSubList: [],
      documentFileUploadConfiguration: null
    };

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;
  @ViewChild(PhxEntityDocumentsList2Component) documentList: PhxEntityDocumentsList2Component;

  constructor(private transactionService: TransactionService,
    private transactionObservableService: TransactionObservableService,
    private codeValueService: CodeValueService, private router: Router,
    private commonService: CommonService) {
    super();
  }

  ngOnInit() {
    this.transactionObservableService.transactionOnRouteChange$(this).subscribe(transaction => {
      if (transaction) {
        this.transaction = transaction;
        TransactionBillingDocumentsComponent.transactionTimeSheetId = this.timesheetId = this.transaction.TimeSheetId;
        if (!this.listLoaded) {
          this.getTimesheetsAndWorkOrdersSummary();
        }
      }
    });

    this.loadDocumentTypes();
  }

  ngAfterViewInit() {
    if (this.documentList) {
      this.documentList.loadDocumentsList();
    }
  }

  getTimesheetsAndWorkOrdersSummary() {
    const oDataParams = oreq
      .request()
      .withSelect(['TimeSheetId', 'TimesheetTypeId', 'WorkOrderId', 'TimesheetTypeId', 'TimesheetEndDate', 'TimesheetStartDate', 'UserProfileWorkerName', 'OrganizationClientLegalName'])
      .url();
    this.transactionService.getTimesheetsAndWorkOrdersSummary(this.transaction.WorkOrderId, oDataParams).subscribe((timesheet: any) => {
      const allTimesheets = map(timesheet.Items || [], (item: any) => {
        return {
          Id: item.TimeSheetId,
          WorkOrderId: item.WorkOrderId,
          TimeSheetTypeId: item.TimesheetTypeId,
          EndDate: item.TimesheetEndDate,
          StartDate: item.TimesheetStartDate,
          WorkerName: item.UserProfileWorkerName,
          ClientName: item.OrganizationClientLegalName
        };
      });

      each(allTimesheets, (item: any) => {
        item.Description = '#' + item.Id + ' : ' + moment.utc(item.StartDate).format('MMM DD, YYYY') + ' - ' + moment.utc(item.EndDate).format('MMM DD, YYYY') + ' - ' + item.WorkerName + ' - ' + item.ClientName;
      });
      this.html.list.timesheet = allTimesheets;
      this.listLoaded = true;
    });
  }

  loadDocumentTypes() {
    this.html.documentTypeUnfilteredSubList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.DocumentType, null);
  }

  generateFileUploadConfig(title: string, documentType: PhxConstants.DocumentType, workflowPendingTaskId?: number): PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.TransactionHeader,
      entityId: this.transaction.Id,
      documentTypeId: documentType,
      WorkflowPendingTaskId: workflowPendingTaskId ? workflowPendingTaskId : -1,
      UploadTitle: title,
      SupportedFileExtensions: 'PNG, JPG, JPEG, TIF, BMP, PDF, DOC, DOCX | 20 MB file size limit',
      customComment: null,
      customUiConfig: {
        objectDate: null,
        objectComment: {
          value: null,
          isRequared: false,
          label: 'Description',
          helpBlock: null,
          minlength: 3,
          maxlength: 200
        },
        objectDocumentType: {
          value: null,
          isRequared: false,
          label: 'Document Type',
          helpBlock: null
        }
      }
    });
  }

  documentUploadCallbackOnDone(document) {
    this.outputEvent.emit();
    this.documentList.loadDocumentsList();
  }

  onSuccessItem($event) {
    this.commonService.logSuccess(`${$event.item.file.name} uploaded successfully.`, $event);
    this.outputEvent.emit();
    this.documentList.loadDocumentsList();
  }

  funcOnDocumentDeleteException(documentsUploadedException, entityTypeId, entityId) {
    this.commonService.logError(`Concurrency exception on delete document. The documents list will be refreshed`);
    this.documentList.loadDocumentsList();
  }

  uploadDocument() {
    const title = 'Upload documents';
    this.html.documentFileUploadConfiguration = this.generateFileUploadConfig(title, this.html.phxConstants.DocumentType.TransactionBillingDocument);

    if (this.fileUpload) {
      this.html.documentTypeSubList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.DocumentType, null).filter(x => x.id === this.html.phxConstants.DocumentType.TransactionBillingDocument);
      this.fileUpload.showModal(this.html.fileUploaderOptions_DocumentMain);
    }
  }

  changeTimesheet(event) {
    if (event.value !== TransactionBillingDocumentsComponent.transactionTimeSheetId) {
      TransactionBillingDocumentsComponent.transactionTimeSheetId = this.timesheetId;
      this.outputEvent.emit();
    }
  }

  viewTimesheet() {
    const timesheetId = TransactionBillingDocumentsComponent.transactionTimeSheetId;
    if (!timesheetId) {
      return;
    }
    const timesheet = filter(this.html.list.timesheet, ts => {
      return ts.Id === timesheetId;
    });
    if (timesheet) {
      this.router.navigate(['/next', 'timesheet', timesheetId]);
    }
  }

  public static formGroupToPartial(transaction: ITransactionHeader): ITransactionHeader {
    transaction.TimeSheetId = TransactionBillingDocumentsComponent.transactionTimeSheetId;
    return transaction;
  }
}
