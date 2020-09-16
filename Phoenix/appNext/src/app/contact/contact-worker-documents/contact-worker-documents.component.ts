import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { IProfile } from '../state';
import { IReadOnlyStorage } from '../../purchase-order/state';
import { PhxConstants, DialogService, CommonService, LoadingSpinnerService, CodeValueService } from '../../common';
import { DocumentService } from '../../common/services/document.service';
import { PhxDocument, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadConfiguration, CodeValue, PhxDocumentFileUploadFileItemActionEventArg } from '../../common/model';
import { filter } from 'lodash';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';

@Component({
  selector: 'app-contact-worker-documents',
  templateUrl: './contact-worker-documents.component.html',
  styleUrls: ['./contact-worker-documents.component.less']
})
export class ContactWorkerDocumentsComponent extends BaseComponentOnDestroy implements OnInit {

  @Input() currentProfile: IProfile;

  @Input() readOnlyStorage: IReadOnlyStorage;

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;

  html: {
    phxConstants: typeof PhxConstants;
    isWorkerProfile: boolean;
    workerDocuments: PhxDocument[];
    documentTypeSubList: CodeValue[],
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions,
    fileUploadConfig: PhxDocumentFileUploadConfiguration;
  } = {
      phxConstants: PhxConstants,
      isWorkerProfile: false,
      workerDocuments: [],
      documentTypeSubList: [],
      fileUploaderOptions_DocumentMain: {
        queueLimit: 15,
        maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
        allowedMimeType: [
          'image/jpg',
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/bmp',
          'image/tiff'
        ],
        allowedFileType: [
          'image',
          'pdf',
          'doc',
        ],
      },
      fileUploadConfig: null
    };

  constructor(
    private documentService: DocumentService,
    private loader: LoadingSpinnerService,
    private dialogs: DialogService,
    private commonService: CommonService,
    private codeValueService: CodeValueService) {
    super();
  }

  ngOnInit() {
    this.html.isWorkerProfile =
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerTemp ||
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerCanadianSp ||
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerCanadianInc ||
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerSubVendor ||
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerUnitedStatesW2 ||
      this.currentProfile.ProfileTypeId === this.html.phxConstants.UserProfileType.WorkerUnitedStatesLLC;

    this.html.documentTypeSubList = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.DocumentType, null)
      .filter(x => x.id === this.html.phxConstants.DocumentType.WorkerProfileDocument);

      this.loadWorkerDocumentsList();
  }

  documentUploadCallbackOnDone(document = null) {
    this.outputEvent.emit();
    console.log('All worker documents has been uploaded sucessfully');
  }

  generateFileUploadConfig(title: string, documentType: PhxConstants.DocumentType):

    PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.UserProfile
      , entityId: this.currentProfile.Id
      , documentTypeId: documentType
      , WorkflowPendingTaskId: -1 // TODO: remove
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

  public loadWorkerDocumentsList() {

    if (!this.currentProfile.Contact.IsDraft && this.currentProfile.Contact.Id > 0 && this.currentProfile.Id > 0 && this.html.isWorkerProfile) {
      this.documentService.getEntityDocuments(this.html.phxConstants.EntityType.UserProfile, this.currentProfile.Id).then((response) => {
        this.html.workerDocuments = response.Items;
      });
    }
  }

  onDocumentUploadDone($event: PhxDocumentFileUploadFileItemActionEventArg) {
    this.documentService.getDocumentById($event.response.publicId).then((doc) => {
      this.commonService.logSuccess(`${$event.item.file.name} uploaded successfully.`, $event);
      this.html.workerDocuments.push(doc);
    }, (error) => {
      this.onResponseError(error, 'Error retrieving document!');
      this.loader.hideAll();
    });
  }

  onResponseError(responseError, errorMessage) {
    if (errorMessage && errorMessage.length > 0) {
      this.commonService.logError(errorMessage);
    }
    const errorMessages = this.commonService.parseResponseError(responseError);
    errorMessages.forEach(error => {
      this.commonService.logError(`${error.PropertyName}: ${error.Message}`);
    });
    // Refresh the documents list
  }

  trackByFn(index) {
    return index;
  }

  onAddDocument($event) {
    if (this.fileUpload) {
      this.html.fileUploadConfig = this.generateFileUploadConfig('Upload a supporting document to your commission adjustment',
        this.html.phxConstants.DocumentType.WorkerProfileDocument);

      this.fileUpload.showModal(this.html.fileUploaderOptions_DocumentMain);
    }
  }

  documentDelete(document) {

    const dlg = this.dialogs.confirm('Document Delete', 'This document will be deleted. Continue ?');

    dlg.then((btn) => {
      this.documentService.deleteDocumentByPublicId(document.PublicId).then(() => {
        this.html.workerDocuments = filter(this.html.workerDocuments, (doc) => { return doc.PublicId !== document.PublicId; });
      });
    }, (btn) => { });
  }

  getPdfStreamByPublicId(publicId) {
    return this.documentService.getPdfStreamByPublicId(publicId);
  }

}
