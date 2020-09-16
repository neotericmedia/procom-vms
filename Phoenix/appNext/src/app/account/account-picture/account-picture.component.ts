import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AngularCropperjsComponent } from 'angular-cropperjs';
import { Router } from '@angular/router';

import { FileUploader, FileUploaderOptions, FileItem, ParsedResponseHeaders, FileLikeObject } from 'ng2-file-upload';
import { PhxDocumentFileUploadConfiguration, PhxDocumentFileUploadFileItemActionEventArg } from '../../common/model';
import { CommonService, PhxLocalizationService, ApiService, NavigationService, LoadingSpinnerService } from '../../common';
import { PhxDocumentFileUploadResourceKeys } from '../../common/components/phx-document-file-upload/phx-document-file-upload.resource-keys';
import { uuid } from '../../common/PhoenixCommon.module';
import { DocumentService } from '../../common/services/document.service';
import { AccountService } from '../shared';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-account-picture',
  templateUrl: './account-picture.component.html',
  styleUrls: ['./account-picture.component.less']
})
export class AccountPictureComponent implements OnInit {
  private uploader: FileUploader;
  private endpoint: string = '/command/postfile';
  private error: string;
  private url: string;
  private configuration: PhxDocumentFileUploadConfiguration;
  private multiDocumentUploadBatchId: string;
  public docPublicId: string;
  @ViewChild('angularCropper') public angularCropper: AngularCropperjsComponent;
  @ViewChild('inputImage') public inputImage: ElementRef;

  config = {
    aspectRatio: 1,
    zoomable: true,
    preview: '.img-preview',
    autoCropArea: 1,
    minContainerWidth: 1,
    minContainerHeight: 1,
    zoomOnWheel: false,
    zoomOnTouch: false
  };
  imageUrl: string | SafeUrl = '';

  constructor(
    private router: Router,
    private zone: NgZone,
    private commonService: CommonService,
    private localizationService: PhxLocalizationService,
    private apiService: ApiService,
    private accountService: AccountService,
    private documentService: DocumentService,
    private navigationService: NavigationService,
    private loadingSpinnerService: LoadingSpinnerService,
    private sanitizer: DomSanitizer
  ) {
    this.navigationService.setTitle('account-picture');
    this.accountService.setCurrentUser();
  }

  ngOnInit() {
    const contactId = this.accountService.contactId;
    this.setNewBatchId();
    this.setImage(contactId);
    this.initUploader(contactId);
  }

  setImage(contactId: number) {
    this.documentService.getEntityDocuments(this.commonService.ApplicationConstants.EntityType.Contact, contactId)
      .then((docList) => {
        if (docList.Items.length > 0) {
          this.docPublicId = docList.Items[0].PublicId;
          this.imageUrl = this.documentService.createDocumentLink(this.docPublicId);
        }
      });
  }

  reset() {
    this.angularCropper.cropper.reset();
  }

  changeImage(event) {
    const target = event.target || event.srcElement;
    const file = target.files[0];
    if (this.configuration.SupportedFileExtensions.split(',').some(extension => extension === file.type.split('/')[1].toUpperCase())) {
      this.imageUrl = '';
      setTimeout(() => {
        const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
        this.imageUrl = sanitizedUrl;
      }, 0);
    } else {
      const fileTypeError = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadFailedFileTypeMessage);
      this.commonService.logError(fileTypeError);
    }
  }

  zoom(ratio) {
    this.angularCropper.cropper.zoom(ratio);
  }

  rotate(degree) {
    this.angularCropper.cropper.rotate(degree);
  }

  delete() {
    this.imageUrl = '';
    this.inputImage.nativeElement.value = '';
  }

  cancel() {
    this.router.navigate(['/next/account/manage']);
  }

  save() {
    this.loadingSpinnerService.show();
    if (this.imageUrl) {
      this.angularCropper.cropper.getCroppedCanvas().toBlob((blob: Blob) => {
        const d = new Date();
        const fileName = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds() + '.jpg';
        const fileFromBlob: any = blob;
        fileFromBlob.name = fileName;
        fileFromBlob.lastModifiedDate = new Date();
        this.uploader.addToQueue(new Array<File>(fileFromBlob));
        this.uploader.uploadAll();
      });
    } else {
      if (this.docPublicId) {
        this.documentService.deleteDocumentByPublicId(this.docPublicId).then(x => {
          this.commonService.logSuccess(this.localizationService.translate('account.picture.deleteSuccessMessage'));
          this.refreshNavbarProfilePic();
        }).catch(() => {
          this.commonService.logError(this.localizationService.translate('account.picture.deleteErrorMessage'));
        });
      }
    }
  }

  setNewBatchId() {
    this.multiDocumentUploadBatchId = uuid.create();
    this.url = this.apiService.urlWithRoom(this.endpoint, this.multiDocumentUploadBatchId);
  }

  // TODO: Extract phx-document-file-upload core functionality
  private initUploader(contactId: number) {
    this.zone.run(() => {
      this.configuration = new PhxDocumentFileUploadConfiguration({
        UploadTitle: '',
        WorkflowPendingTaskId: 0,
        entityTypeId: this.commonService.ApplicationConstants.EntityType.Contact,
        entityId: contactId,
        customId1: 0,
        customId2: 0,
        customMethodata: null,
        description: '',
        documentTypeId: this.commonService.ApplicationConstants.DocumentType.Profile,
        SupportedFileExtensions: 'JPEG,JPG,PNG,BMP,GIF,TIFF'
      });

      this.error = '';
      const url: string = this.url;

      const uploaderOptions: FileUploaderOptions = { url: url };

      this.uploader = new FileUploader(uploaderOptions);

      this.uploader.authToken = 'Bearer ' + this.commonService.bearerToken();

      this.uploader.onBeforeUploadItem = (item: FileItem) => {
        item.withCredentials = false;
        if (this.configuration == null) {
          this.error = `configuration property on phx-document-file-upload is null`;
          this.commonService.logError(this.error);
        }
        if (this.uploader.getIndexOfItem(item) === this.uploader.queue.length - 1) {
          this.configuration.isFinalDocument = true;
        }
        if (this.configuration.customUiConfig) {
          this.configuration.customDateTime = (this.configuration.customUiConfig.objectDate != null && this.configuration.customUiConfig.objectDate.value != null)
            ? new Date(this.configuration.customUiConfig.objectDate.value)
            : null;
          this.configuration.customComment = (this.configuration.customUiConfig.objectComment != null && this.configuration.customUiConfig.objectComment.value != null)
            ? this.configuration.customUiConfig.objectComment.value
            : null;
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
              this.onSuccessItem({ item, response: JSON.parse(response), status });
            }
          }
        } else {
          this.error = this.localizationService.translate(PhxDocumentFileUploadResourceKeys.documentFileUploadComponent.uploadErrorMessage, item.file.name, status, response);

          this.commonService.logError(this.error);
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
      };
      this.uploader.onCompleteAll = () => {
        this.loadingSpinnerService.hide();
        this.setNewBatchId();
      };
    });
  }

  onSuccessItem(event: PhxDocumentFileUploadFileItemActionEventArg) {
    this.commonService.logSuccess(this.localizationService.translate('account.picture.saveSuccessMessage'), event);
    this.refreshNavbarProfilePic();
  }
  // TODO: change the window.location.reload, once the application completely upgraded to angular2
  refreshNavbarProfilePic() {
    this.router.navigate(['/next/account/manage']).then(() => {
      window.location.reload(true);
    });
  }
}
