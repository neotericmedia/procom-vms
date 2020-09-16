import { Component, Input, EventEmitter, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, ControlsConfig } from '../../common/ngx-strongly-typed-forms/model';
import { IOrganizationInternalRole, IReadOnlyStorage, IOrganization, IRoot } from '../state';
import { PhxDocumentFileUploadConfiguration } from '../../common/model';
import { PhxConstants, DialogService, LoadingSpinnerService, CommonService } from '../../common';
import { OrganizationApiService } from '../organization.api.service';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';

@Component({
  selector: 'app-organization-role-internal-org-images',
  templateUrl: './organization-role-internal-org-images.component.html',
  styleUrls: ['./organization-role-internal-org-images.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class OrganizationRoleInternalOrgImagesComponent {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IOrganizationInternalRole>;
  @Output() outputEvent = new EventEmitter();
  @Input() workflowPendingTaskId: number;
  @Input() allowEditing: boolean = false;

  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;

  PhxConstants: any;

  html: {
    dataHeaderText: string;
    complianceDocumentFileUploadConfiguration?: PhxDocumentFileUploadConfiguration;
  } = {
      dataHeaderText: null
    };

  constructor(private dialog: DialogService, private orgService: OrganizationApiService, private loader: LoadingSpinnerService, private commonService: CommonService, private chRef: ChangeDetectorRef) {
    this.PhxConstants = PhxConstants;
  }

  public get isEditable() {
    return this.allowEditing ? (this.readOnlyStorage ? this.readOnlyStorage.IsEditable : false) : false;
  }

  public get model() {
    return this.inputFormGroup.value;
  }

  public get orgId() {
    return (this.inputFormGroup.parent.parent.parent as FormGroup<IRoot>).controls.OrganizationId.value;
  }

  generateFileUploadConfig(title: string, documentType: PhxConstants.DocumentType, workflowPendingTaskId?: number): PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.OrganizationInternalRole,
      entityId: this.inputFormGroup.value.Id,
      documentTypeId: documentType,
      WorkflowPendingTaskId: this.workflowPendingTaskId,
      UploadTitle: title,
      SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, BMP | 20 MB file size limit',
      customComment: null,
      customUiConfig: {
        objectDate: null,
        objectComment: {
          value: null,
          isRequared: false,
          label: 'Comment',
          helpBlock: null,
          minlength: 3,
          maxlength: 200
        }
      }
    });
  }

  documentUploadCallbackOnDone(document) {
    this.outputEvent.emit();
    this.reloadHeaderFooterImagesData();
  }

  onSuccessItem($event) {
    this.commonService.logSuccess(`${$event.item.file.name} uploaded successfully.`, $event);
  }

  funcOnDocumentDeleteException(documentsUploadedException, entityTypeId, entityId) {
    this.commonService.logError(`Concurrency exception on delete document. The documents list will be refreshed`);
  }

  uploadDocument(docTypeId: PhxConstants.DocumentType) {
    let title = '';
    if (docTypeId === PhxConstants.DocumentType.InternalOrganizationPortraitHeader) {
      title = 'Upload a portrait header image';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationPortraitFooter) {
      title = 'Upload a portrait footer image';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationLandscapeHeader) {
      title = 'Upload a landscape header image';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationLandscapeFooter) {
      title = 'Upload a landscape footer image';
    }

    this.html.complianceDocumentFileUploadConfiguration = this.generateFileUploadConfig(title, docTypeId, this.workflowPendingTaskId);

    this.fileUpload.showModal({
      maxFileSize: 20 * 1024 * 1024,
      queueLimit: 1,
      allowedFileType: ['image']
    });
  }

  createDocumentLink(publicId) {
    return this.orgService.createDocumentLink(publicId);
  }

  public static formGroupSetupPartial(role: IOrganizationInternalRole): any {
    const partialForm: Partial<ControlsConfig<IOrganizationInternalRole>> = {
      DocumentFooterName: [role.DocumentFooterName],
      DocumentFooterPublicId: [role.DocumentFooterPublicId],
      DocumentHeaderName: [role.DocumentHeaderName],
      DocumentHeaderPublicId: [role.DocumentHeaderPublicId],
      DocumentIdFooter: [role.DocumentIdFooter],
      DocumentIdHeader: [role.DocumentIdHeader],
      DocumentIdLandscapeFooter: [role.DocumentIdLandscapeFooter],
      DocumentIdLandscapeHeader: [role.DocumentIdLandscapeHeader],
      DocumentLandscapeFooterName: [role.DocumentLandscapeFooterName],
      DocumentLandscapeFooterPublicId: [role.DocumentLandscapeFooterPublicId],
      DocumentLandscapeHeaderName: [role.DocumentLandscapeHeaderName],
      DocumentLandscapeHeaderPublicId: [role.DocumentLandscapeHeaderPublicId]
    };

    return partialForm;
  }

  public static formGroupSetupPartialNew(role: IOrganizationInternalRole): any {
    const partialForm: Partial<ControlsConfig<IOrganizationInternalRole>> = {
      DocumentFooterName: [null],
      DocumentFooterPublicId: [null],
      DocumentHeaderName: [null],
      DocumentHeaderPublicId: [null],
      DocumentIdFooter: [0],
      DocumentIdHeader: [0],
      DocumentIdLandscapeFooter: [0],
      DocumentIdLandscapeHeader: [0],
      DocumentLandscapeFooterName: [null],
      DocumentLandscapeFooterPublicId: [null],
      DocumentLandscapeHeaderName: [null],
      DocumentLandscapeHeaderPublicId: [null]
    };

    return partialForm;
  }

  deleteImage(id: number, docTypeId: PhxConstants.DocumentType) {
    let dialogMessage = '';
    const dialogHeader = 'Confirm';
    if (docTypeId === PhxConstants.DocumentType.InternalOrganizationPortraitHeader) {
      dialogMessage = 'Are you sure you want to delete portrait header image?';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationPortraitFooter) {
      dialogMessage = 'Are you sure you want to delete portrait footer image?';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationLandscapeHeader) {
      dialogMessage = 'Are you sure you want to delete landscape header image?';
    } else if (docTypeId === PhxConstants.DocumentType.InternalOrganizationLandscapeFooter) {
      dialogMessage = 'Are you sure you want to delete landscape footer image?';
    }

    this.dialog.confirm(dialogHeader, dialogMessage).then(() => {
      this.orgService.deleteInternalOrganizationImage(id, docTypeId).then(() => {
        this.reloadHeaderFooterImagesData();
      });
    });
  }

  reloadHeaderFooterImagesData() {
    this.loader.show();
    this.orgService.reloadHeaderFooterImagesData(this.orgId).then(
      (response: IOrganization) => {
        if (response && response.OrganizationInternalRoles && response.OrganizationInternalRoles.length > 0) {
          const role = response.OrganizationInternalRoles[0];
          this.inputFormGroup.controls.DocumentFooterName.setValue(role.DocumentFooterName, { emitEvent: false });
          this.inputFormGroup.controls.DocumentFooterPublicId.setValue(role.DocumentFooterPublicId, { emitEvent: false });
          this.inputFormGroup.controls.DocumentHeaderName.setValue(role.DocumentHeaderName, { emitEvent: false });
          this.inputFormGroup.controls.DocumentHeaderPublicId.setValue(role.DocumentHeaderPublicId, { emitEvent: false });
          this.inputFormGroup.controls.DocumentIdFooter.setValue(role.DocumentIdFooter, { emitEvent: false });
          this.inputFormGroup.controls.DocumentIdHeader.setValue(role.DocumentIdHeader, { emitEvent: false });
          this.inputFormGroup.controls.DocumentIdLandscapeFooter.setValue(role.DocumentIdLandscapeFooter, { emitEvent: false });
          this.inputFormGroup.controls.DocumentIdLandscapeHeader.setValue(role.DocumentIdLandscapeHeader, { emitEvent: false });
          this.inputFormGroup.controls.DocumentLandscapeFooterName.setValue(role.DocumentLandscapeFooterName, { emitEvent: false });
          this.inputFormGroup.controls.DocumentLandscapeFooterPublicId.setValue(role.DocumentLandscapeFooterPublicId, { emitEvent: false });
          this.inputFormGroup.controls.DocumentLandscapeHeaderName.setValue(role.DocumentLandscapeHeaderName, { emitEvent: false });
          this.inputFormGroup.controls.DocumentLandscapeHeaderPublicId.setValue(role.DocumentLandscapeHeaderPublicId, { emitEvent: false });
          this.chRef.detectChanges();
        }
        this.loader.hide();
      },
      err => {
        this.loader.hide();
        this.commonService.logError('Error reloading file data, please refresh your page');
      }
    );
  }
}
