import { Component, OnInit, Input, Inject, EventEmitter, Output, ElementRef, ViewChild, OnDestroy, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { FileUploader, FileItem, FileLikeObject, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonService, ApiService } from '../../index';
import { PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadFileItemEventArg, PhxDocumentFileUploadFileItemActionEventArg, CodeValue, PhxDocumentFileUploadError } from '../../model/index';
import { PhxLocalizationService } from '../../services/phx-localization.service';
import { PhxDocumentFileUploadResourceKeys } from './phx-document-file-upload.resource-keys';
import { uuid } from '../../PhoenixCommon.module';

@Component({
  selector: 'app-phx-document-file-upload',
  templateUrl: './phx-document-file-upload.component.html',
  styleUrls: ['./phx-document-file-upload.component.less']
})
export class PhxDocumentFileUploadComponent implements OnInit, OnDestroy, OnChanges {
  @Input() configuration: PhxDocumentFileUploadConfiguration;
  @Input() fileUploaderOptions: PhxDocumentFileUploaderOptions;
  @Input() editable: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() docTypeList: CodeValue[] = [];
  @Input() funcValidation?: (queue: any) => Array<any>;


  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onShowUploader: EventEmitter<any> = new EventEmitter();
  @Output() onCompleteAll: EventEmitter<any> = new EventEmitter();
  @Output() onStartUpload: EventEmitter<any> = new EventEmitter();
  @Output() onBeforeUploadItem: EventEmitter<PhxDocumentFileUploadFileItemEventArg> = new EventEmitter<PhxDocumentFileUploadFileItemEventArg>();
  @Output() onAfterAddingFile: EventEmitter<PhxDocumentFileUploadFileItemEventArg> = new EventEmitter<PhxDocumentFileUploadFileItemEventArg>();
  @Output() onSuccessItem: EventEmitter<PhxDocumentFileUploadFileItemActionEventArg> = new EventEmitter<PhxDocumentFileUploadFileItemActionEventArg>();
  @Output() onErrorItem: EventEmitter<PhxDocumentFileUploadError> = new EventEmitter<PhxDocumentFileUploadError>();
  @Output() onCancelItem: EventEmitter<PhxDocumentFileUploadFileItemActionEventArg> = new EventEmitter<PhxDocumentFileUploadFileItemActionEventArg>();
  @Output() onCompleteItem: EventEmitter<PhxDocumentFileUploadFileItemActionEventArg> = new EventEmitter<PhxDocumentFileUploadFileItemActionEventArg>();
  @Output() onWhenAddingFileFailed: EventEmitter<{ item: FileLikeObject, filter: any }> = new EventEmitter();

  @Input() getCustomDataModel; // fix me
  @Input() isDisabled; // fix me

  @ViewChild('fileUploadModal') fileUploadModal: any;

  public uploader: FileUploader;
  public hasBaseDropZoneOver: boolean;
  private endpoint: string = '/command/postfile';
  private error: string;

  private url: string;
  private multiDocumentUploadBatchId: string;
  private isAlive = true;
  private validationMessages: Array<any>;

  constructor(private commonService: CommonService, private apiService: ApiService, private zone: NgZone, private localizationService: PhxLocalizationService) {
    this.hasBaseDropZoneOver = false;
    this.setNewBatchId();
  }

  setNewBatchId() {
    this.multiDocumentUploadBatchId = uuid.create();
    this.url = this.apiService.urlWithRoom(this.endpoint, this.multiDocumentUploadBatchId);
  }

  ngOnDestroy() {
    this.close();
  }

  ngOnInit() {
    this.initUploader();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileUploaderOptions || changes.configuration) {
      this.initUploader();
    }
  }

  public close() {
    if (this.fileUploadModal !== null) {
      this.fileUploadModal.hide();
    }
    this.initUploader();
    this.onClose.emit();
  }

  public showModal(fileUploaderOptions: PhxDocumentFileUploaderOptions = null) {
    if (this.uploader && fileUploaderOptions !== null) {
      this.fileUploaderOptions = fileUploaderOptions;
      this.initUploader();
    }
    this.onShowUploader.emit();
    this.fileUploadModal.show();
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public startUpload() {
    let valMessages: Array<any> = [];
    this.validationMessages = [];
    if (this.funcValidation) {
      valMessages = this.funcValidation(this.uploader.queue);
    }
    if (valMessages.length > 0) {
      this.validationMessages = valMessages;
    } else {
      this.onStartUpload.emit();
      this.uploader.uploadAll();
    }
  }

  onSubDocumentTypeSelected($event) {}

  private initUploader() {
    if (!this.isAlive) {
      return;
    }
    this.zone.run(() => {
      this.error = '';
      const url: string = this.url;

      const uploaderOptions: FileUploaderOptions = {
        url: url,
        filters: [{
          name: 'minSize',
          fn: (item?: FileLikeObject, options?: FileUploaderOptions): boolean => {
            return item.size > 0;
          }
        }]
      };

      if (this.fileUploaderOptions) {
        if (this.fileUploaderOptions.maxFileSize !== null && this.fileUploaderOptions.maxFileSize > 0) {
          uploaderOptions.maxFileSize = this.fileUploaderOptions.maxFileSize;
        }

        if (this.fileUploaderOptions.queueLimit !== null && this.fileUploaderOptions.queueLimit > 0) {
          uploaderOptions.queueLimit = this.fileUploaderOptions.queueLimit;
        }

        if (this.fileUploaderOptions.allowedMimeType && this.fileUploaderOptions.allowedMimeType.length > 0) {
          uploaderOptions.allowedMimeType = this.fileUploaderOptions.allowedMimeType;
        }

        if (this.fileUploaderOptions.allowedFileType !== null && this.fileUploaderOptions.allowedFileType.length > 0) {
          uploaderOptions.allowedFileType = this.fileUploaderOptions.allowedFileType;
        }
      }

      this.uploader = new FileUploader(uploaderOptions);

      this.uploader.authToken = 'Bearer ' + this.commonService.bearerToken();

      this.uploader.onAfterAddingFile = (item: FileItem) => {
        this.onAfterAddingFile.emit({ item: item });
      };

      this.uploader.onBeforeUploadItem = (item: FileItem) => {
        this.onBeforeUploadItem.emit({ item: item });
        item.withCredentials = false;
        if (this.configuration == null) {
          this.error = `configuration property on phx-document-file-upload is null`;
          this.commonService.logError(this.error);
        }
        if (this.uploader.getIndexOfItem(item) === this.uploader.queue.length - 1) {
          this.configuration.isFinalDocument = true;
        }
        if (this.configuration.customUiConfig) {
          this.configuration.customDateTime = this.configuration.customUiConfig.objectDate !== null && this.configuration.customUiConfig.objectDate.value !== null ? new Date(this.configuration.customUiConfig.objectDate.value) : null;
          this.configuration.customComment = this.configuration.customUiConfig.objectComment !== null && this.configuration.customUiConfig.objectComment.value !== null ? this.configuration.customUiConfig.objectComment.value : null;

          this.configuration.documentTypeId =
            this.configuration.customUiConfig.objectDocumentType && this.configuration.customUiConfig.objectDocumentType.value !== null
              ? this.configuration.customUiConfig.objectDocumentType.value
              : this.configuration.documentTypeId || null;

          this.configuration.customUiConfig = null;
        }

        this.uploader.options.additionalParameter = { ...this.configuration, multiDocumentUploadBatchId: this.multiDocumentUploadBatchId };
      };

      this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
        if (status === 200) {
          const responseJson = JSON.parse(response);

          if (responseJson.publicId === '00000000-0000-0000-0000-000000000000') {
            this.commonService.logError(this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadErrorRefreshListMessage));
          } else {
            if (this.uploader.getIndexOfItem(item) === this.uploader.queue.length - 1) {
              this.onSuccessItem.emit({ item, response: JSON.parse(response), status });
            }
          }
        } else {
          this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadErrorMessage, item.file.name, status, response);

          this.commonService.logError(this.error);
          this.onErrorItem.emit({ item, response, status });
        }
      };

      this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
        const res = JSON.parse(response === '' ? '{}' : response);
        if (res && response !== '') {
          this.error = JSON.stringify(res);
        } else {
          this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadErrorMessage, item.file.name, status, response);
        }
        this.commonService.logError(this.error);
        this.onErrorItem.emit({ item, response, status });
      };

      this.uploader.onCompleteItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
        this.onCompleteItem.emit({ item, response: JSON.parse(response), status });
      };

      this.uploader.onCancelItem = () => {
        this.onCancelItem.emit();
      };

      this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
        switch (filter.name) {
          case 'fileSize':
            this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedFileSizeMessage, item.name, this.fileUploaderOptions.maxFileSize / 1024 / 1024);
            break;
          case 'minSize':
            this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.invalidFileUploaded);
            break;
          case 'mimeType':
          case 'fileType':
            this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedFileTypeMessage);
            break;
          case 'queueLimit':
            this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedQueueLimitMessage, this.fileUploaderOptions.queueLimit);
            break;
          default:
            this.error =
              item && item.name
                ? this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedDefaultWithNameMessage, filter.name, item.name)
                : this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedDefaultMessage, filter.name);
        }
        this.commonService.logError(this.error);
        this.onWhenAddingFileFailed.emit({ item, filter });
      };

      this.uploader.onCompleteAll = () => {
        this.fileUploadModal.hide();
        this.close();
        this.setNewBatchId();
        this.onCompleteAll.emit();
      };
    });
  }
}
