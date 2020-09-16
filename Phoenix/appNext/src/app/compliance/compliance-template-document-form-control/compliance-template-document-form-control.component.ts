import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { CommonService } from '../../common/index';
import { PhxDocumentFileUploadFileItemActionEventArg, PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions } from '../../common/model/index';
import { AbstractControl } from '@angular/forms';
import { DocumentService } from '../../common/services/document.service';

@Component({
  selector: 'app-compliance-template-document-form-control',
  templateUrl: './compliance-template-document-form-control.component.html',
  styleUrls: ['./compliance-template-document-form-control.component.less']
})
export class ComplianceTemplateDocumentFormControlComponent implements OnInit {
  @Input() control: AbstractControl;
  @Input() editable: boolean;
  @Input() labelText: string;
  @Input() documentName: string;
  @Input() documentId?: number;
  @Input() documentPublicId: string;
  @Input() uploadConfiguration: PhxDocumentFileUploadConfiguration;
  @Input() uploadOptions: PhxDocumentFileUploaderOptions;

  @Output() onShowUploader: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUploadComplete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDeleteDocumentClick: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;

  constructor(
    private commonService: CommonService,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
  }

  createPdfDocumentLink(publicId: string) {
    return this.documentService.createPdfDocumentLink(publicId);
  }

  openFileUpload() {
    this.fileUpload.showModal();
  }

  onShowFileUploader() {
    this.onShowUploader.emit();
  }

  onFileUploadComplete() {
    this.onUploadComplete.emit();
  }

  getUploadCompleteNotification(event: PhxDocumentFileUploadFileItemActionEventArg) {
    this.commonService.logSuccess(`${event.item.file.name} uploaded successfully.`, event);
  }

  delete() {
    this.onDeleteDocumentClick.emit(this.documentId);
  }

}
