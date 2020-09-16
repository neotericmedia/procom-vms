import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService, CodeValueService, PhxConstants } from '../../common';
import { CodeValue, PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions } from '../../common/model';
import { StateService } from '../../common/state/state.module';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { PhxEntityDocumentsList2Component } from '../../common/components/phx-entity-documents-list2/phx-entity-documents-list2.component';

@Component({
  selector: 'app-workorder-tab-activity-documents',
  templateUrl: './workorder-tab-activity-documents.component.html',
  styleUrls: ['./workorder-tab-activity-documents.component.less']
})
export class WorkorderTabActivityDocumentsComponent extends BaseComponentOnDestroy implements OnInit {

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;
  @ViewChild('documentList') documentList: PhxEntityDocumentsList2Component;

  html: {
    phxConstants: typeof PhxConstants,
    documentTypeList: CodeValue[],
    documentTypeSubList: CodeValue[],
    documentTypeUnfilteredSubList: CodeValue[],
    documentFileUploadConfiguration?: PhxDocumentFileUploadConfiguration,
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions
  } = {
      fileUploaderOptions_DocumentMain: {
        queueLimit: 5,
        maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
        allowedMimeType: [
          // https://github.com/valor-software/ng2-file-upload/issues/661
          // 'image/gif',
          // 'text/csv',
          // 'application/vnd.ms-excel',
          'image/jpg',
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        allowedFileType: [
          // https://github.com/valor-software/ng2-file-upload/issues/696
          // 'application',
          // 'video',
          // 'audio',
          // 'compress',
          // 'xls',
          // 'ppt',
          'image',
          'pdf',
          'doc',
        ],
      },
      phxConstants: PhxConstants,
      documentTypeSubList: [],
      documentTypeUnfilteredSubList: [],
      documentFileUploadConfiguration: null,
      documentTypeList: []
    };

  workorderId: any;

  constructor(private commonService: CommonService,
    private codeValueService: CodeValueService,
    private stateService: StateService) {
    super();
  }

  ngOnInit() {
    this.loadDocumentTypes();
    this.stateService
      .selectOnAction(getRouterState)
      .takeUntil(this.isDestroyed$)
      .subscribe((routerStateResult: IRouterState) => {
        this.workorderId = routerStateResult.params.workorderId;
      });
  }

  loadDocumentTypes() {
    this.html.documentTypeList = this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.DocumentType,
      this.html.phxConstants.EntityType.WorkOrder, this.commonService.CodeValueGroups.EntityType);
      this.html.documentTypeUnfilteredSubList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.DocumentType, null);
  }

  generateFileUploadConfig(title: string, documentType: PhxConstants.DocumentType, workflowPendingTaskId?: number):

    PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.WorkOrder
      , entityId: this.workorderId
      , documentTypeId: documentType
      , WorkflowPendingTaskId: workflowPendingTaskId ? workflowPendingTaskId : -1
      , UploadTitle: title
      , SupportedFileExtensions: 'PNG, JPG, JPEG, TIF, BMP, PDF, DOC, DOCX | 20 MB file size limit'
      , customComment: null
      , customUiConfig: {
        objectDate: null,
        objectComment: {
          value: null,
          isRequared: false,
          label: 'Description',
          helpBlock: null,
          minlength: 3,
          maxlength: 200,
        },
        objectDocumentType: {
          value: null,
          isRequared: true,
          label: 'Document Type',
          helpBlock: null
        }
      }
    });
  }

  documentUploadCallbackOnDone(document = null) {
    this.outputEvent.emit();
    this.documentList.loadDocumentsList();
  }

  onSuccessItem($event) {
    this.commonService.logSuccess(`${$event.item.file.name} uploaded successfully.`, $event);
    this.documentList.loadDocumentsList();
  }

  funcOnDocumentDeleteException(documentsUploadedException, entityTypeId, entityId) {
    this.commonService.logError(`Concurrency exception on delete document. The documents list will be refreshed`);
    this.documentList.loadDocumentsList();
  }

  uploadDocument(docTypeId: PhxConstants.DocumentType) {

    const title = 'Upload a supporting document to your work order';

    this.html.documentFileUploadConfiguration = this.generateFileUploadConfig(title,
      docTypeId);

    if (this.fileUpload) {
      this.html.documentTypeSubList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.DocumentType, null).filter(x => x.parentId === docTypeId);
      this.fileUpload.showModal(this.html.fileUploaderOptions_DocumentMain);
    }
  }

}
