import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICommissionAdjustment, IFormGroupSetup, ICommissionAdjustmentDetail } from '../model/commission-adjustment';
import { FormGroup, FormBuilder, FormArray, FormControl } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions, CustomFieldService, CommonService, CodeValueService, WorkflowService } from '../../common';
import { CustomFieldErrorType, CodeValue, PhxConstants, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadConfiguration, PhxDocument, EntityList, PhxDocumentFileUploadFileItemActionEventArg, PhxFormControlLayoutType } from '../../common/model';
import { HashModel } from '../../common/utility/hash-model';
import { CommissionService } from '../commission.service';
import { filter, find, sumBy, forEach, chain, map, cloneDeep, each } from 'lodash';
import { DocumentService } from '../../common/services/document.service';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { PhxDialogComponentConfigModel } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { Validators } from '@angular/forms';
import { PhxModalComponent } from '../../common/components/phx-modal/phx-modal.component';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';

@Component({
  selector: 'app-commission-adjustment-edit',
  templateUrl: './commission-adjustment-edit.component.html',
  styleUrls: ['./commission-adjustment-edit.component.less']
})

export class CommissionAdjustmentEditComponent implements OnInit {

  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @ViewChild('modalWorkOrderAdd') modalWorkOrderAdd: PhxModalComponent;
  @ViewChild('fileUpload') fileUpload: PhxDocumentFileUploadComponent;
  phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;
  showUploader: boolean = true;
  isAlive: boolean = true;
  commissionId: number;
  isCreateMode: boolean = false;
  formGroupSetup: IFormGroupSetup;
  inputFormGroup: FormGroup<ICommissionAdjustment>;
  commissionAdjustmentHeaderTypes: Array<CodeValue>;
  codeValueGroups: any;
  phxConstants: any;
  isEditable: boolean = false;
  internalOrganizations: Array<any>;
  internalUsers: Array<any>;
  clientOrganizations: Array<any>;
  CommissionJobOwners: FormArray<ICommissionAdjustmentDetail>;
  CommissionWorkorders: FormArray<ICommissionAdjustmentDetail>;
  validationMessages: Array<any> = [];
  CommissionUsers: Array<any>;
  AllocatedAmount: number;
  UnallocatedAmount: number;
  commissionUsersAll: any;
  canShow: boolean = false;
  commissionRoles: Array<any> = [];
  commissionAdjustment: ICommissionAdjustment = {
    AdjustmentAmountNet: null,
    AdjustmentDate: null,
    ClientCompany: null,
    ClientOrganizationId: null,
    CommissionAdjustmentDetails: [],
    CommissionAdjustmentHeaderStatusId: null,
    CommissionAdjustmentHeaderTypeId: null,
    CommissionRecurrency: null,
    CreatedByContactId: null,
    CreatedByProfileFullName: null,
    CreatedByProfileId: null,
    CreatedDatetime: null,
    Description: null,
    Id: 0,
    OrganizationIdInternal: null,
    WorkflowAvailableActions: [],
    WorkflowPendingTaskId: -1,
    isAdjustmentAmountAdd: null
  };
  documentTypeList: Array<any>;
  html: {
    dataHeaderText: string,
    fileUploaderOptions_DocumentMain: PhxDocumentFileUploaderOptions,
    DocumentFileUploadConfiguration?: PhxDocumentFileUploadConfiguration
  } = {
      dataHeaderText: null,
      fileUploaderOptions_DocumentMain: {
        queueLimit: 15,
        maxFileSize: (20 * 1024 * 1024),
        allowedMimeType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.openxmlformats-officedocument.presentationml.slide',
          'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
          'application/vnd.openxmlformats-officedocument.presentationml.template',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
          'application/msword',
          'application/vnd.ms-word.document.macroenabled.12',
          'application/vnd.ms-word.template.macroenabled.12',
          // 'application/vnd.ms-excel',
          // 'application/vnd.ms-powerpoint',
          'text/plain'
        ],
        allowedFileType: [
          'image',
          'doc',
          'pdf',
          // 'xls',
          // 'ppt'
        ]
      }
    };
  commissionDocuments: Array<any> = [];
  layoutType: any;

  constructor(private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private commissionService: CommissionService,
    private router: Router,
    private documentService: DocumentService,
    private workflowService: WorkflowService) {
    this.activatedRoute.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.commissionId = +params['Id'];
        this.isCreateMode = this.commissionId === 0;
        this.isEditable = this.isCreateMode;
      });
    this.phxConstants = PhxConstants;
    this.layoutType = PhxFormControlLayoutType;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.loadStaticValues();
  }
  // fix me
  public dialogAction_CallBackObButtonClick(e) {


  }
  loadStaticValues() {
    this.commissionAdjustmentHeaderTypes = this.isCreateMode
      ? this.codeValueService.getCodeValues(this.codeValueGroups.CommissionAdjustmentHeaderType, true).slice(0, 2)
      : this.codeValueService.getCodeValues(this.codeValueGroups.CommissionAdjustmentHeaderType, true);

    this.commissionService.getCommissionRateHeaderUsers().subscribe((response: any) => {
      this.CommissionUsers = response.Items;
      this.commissionUsersAll = this.getAllCommissionUsers();
    });

    this.commissionService.getListOrganizationInternal().subscribe((response: any) => {
      this.internalOrganizations = response;
      this.internalOrganizations.forEach(i => {
        i.DisplayValue = i.DisplayName + ' - ' + i.Id;
      });
    });

    this.commissionService.getInternalUserProfileList().subscribe((response: any) => {
      this.internalUsers = response.Items;
      this.internalUsers.forEach(i => {
        i.CommissionUserProfileFullName = i.CommissionUserProfileFirstName + ' ' + i.CommissionUserProfileLastName;
      });
    });

    this.commissionService.getListOrganizationClient1().subscribe((response: any) => {
      this.clientOrganizations = response.Items;
    });
  }

  ngOnInit() {
    if (this.isCreateMode) {
      this.inputFormGroup = this.formBuilderGroupSetup(this.formGroupSetup, this.commissionAdjustment);
    } else {
      this.loadInitialCommissionHeader();
    }
  }

  loadInitialCommissionHeader() {
    this.commissionService.getCommissionHeaderById(this.commissionId).subscribe((response: ICommissionAdjustment) => {
      this.commissionAdjustment = this.convertCommissionAdjustmentApiToUi(response);
      this.getCommissionAdjustmentDocuments();
      this.getWorkFlowPendingTaskId();
      this.inputFormGroup = this.formBuilderGroupSetup(this.formGroupSetup, this.commissionAdjustment);
    });
  }

  getWorkFlowPendingTaskId() {
    this.workflowService.getAvailableActions(PhxConstants.EntityType.CommissionAdjustmentHeader, this.commissionId)
      .then((workflow: Array<any>) => {
        if (workflow && workflow.length > 0) {
          this.inputFormGroup.controls.WorkflowPendingTaskId.setValue(workflow[0].WorkflowPendingTaskId);
        }
      });
  }

  getCommissionAdjustmentDocuments() {
    this.documentService.getEntityDocuments(PhxConstants.EntityType.CommissionAdjustmentHeader, this.commissionId)
      .then((documents: EntityList<PhxDocument>) => {
        documents.Items.forEach(item => {
          this.commissionDocuments.push(item);
        });
      });
  }

  convertCommissionAdjustmentApiToUi(commissionHeader: ICommissionAdjustment) {
    if (commissionHeader) {
      commissionHeader.isAdjustmentAmountAdd = this.getIsAdjustmentAmountAddFromAdjustmentAmount(commissionHeader.AdjustmentAmountNet);
      commissionHeader.AdjustmentAmountNet = Math.abs(commissionHeader.AdjustmentAmountNet);
      forEach(commissionHeader.CommissionAdjustmentDetails, function (detail) {
        detail.AdjustmentAmount = Math.abs(detail.AdjustmentAmount);
      });
    }
    return commissionHeader;
  }

  getIsAdjustmentAmountAddFromAdjustmentAmount(AdjustmentAmount) {
    return AdjustmentAmount >= 0;
  }

  onAdjustmentTypeChange() {
    const formArray = this.inputFormGroup.get('CommissionAdjustmentDetails') as FormArray<ICommissionAdjustmentDetail>;
    if (this.inputFormGroup.controls.CommissionAdjustmentHeaderTypeId.value === PhxConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {
      if (formArray.value.length === 0) {
        const data = {
          AdjustmentAmount: null,
          CommissionUserProfileId: null,
          CommissionAdjustmentDetailTypeId: 1
        };
        formArray.push(this.getControls(data, this.formGroupSetup));
      }

      this.inputFormGroup.controls.CommissionRecurrency.setValue(false);
      const detail = <FormGroup<ICommissionAdjustmentDetail>>((<FormArray<ICommissionAdjustmentDetail>>this.inputFormGroup.controls.CommissionAdjustmentDetails).at(0));
      detail.controls.CommissionUserProfileId.setValidators(Validators.required);
    } else {
      this.inputFormGroup.setControl('CommissionAdjustmentDetails', this.formBuilderGroupSetupAdjustmentDetail(this.formGroupSetup, []));
      this.inputFormGroup.controls.CommissionRecurrency.setValue(null);
    }
  }

  onSave() {
    this.updateModelFromFormGroup(this.inputFormGroup);
    if (this.inputFormGroup.controls.CommissionAdjustmentHeaderTypeId.value === PhxConstants.CommissionAdjustmentHeaderType.ManualAdjustment) {
      this.onSaveManualAdjustment();
    } else if (this.inputFormGroup.controls.CommissionAdjustmentHeaderTypeId.value === PhxConstants.CommissionAdjustmentHeaderType.BackgroundCheck) {
      const isValid = this.validateAdjustmentAmounts();
      if (isValid) {
        this.onSaveBackgroundCheck();
      }
    }
  }

  updateModelFromFormGroup(formGroup: FormGroup<ICommissionAdjustment>) {
    Object.assign(this.commissionAdjustment, {
      ...formGroup.value
    });
  }

  onSaveManualAdjustment() {
    this.commissionAdjustment.CommissionAdjustmentDetails[0].AdjustmentAmount = this.commissionAdjustment.AdjustmentAmountNet;
    this.commissionService.saveCommissionTransaction(this.convertCommissionAdjustmentUiToApi(this.commissionAdjustment)).subscribe((response: any) => {
      if (response.IsValid) {
        this.commonService.logSuccess('Commission Adjustment has been saved successfully.');
        this.router.navigate(['/next', 'commission', 'adjustment']);
      }
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

  validateAdjustmentAmounts() {
    const errors = [];
    let retVal = true;
    const CommissionJobOwners = this.getFormArrayBasedOnDetailType((<FormArray<ICommissionAdjustmentDetail>>this.inputFormGroup.controls.CommissionAdjustmentDetails).controls, PhxConstants.CommissionAdjustmentDetailType.JobOwnerAllocation);

    if (this.getAllocatedAmount() > 0.0001 && CommissionJobOwners.length === 0) {
      errors.push('There is an unallocated amount remaining.');
      retVal = false;
    }

    if (this.getAllocatedAmount() > this.inputFormGroup.controls.AdjustmentAmountNet.value) {
      errors.push('Allocated amount cannot be greater than adjustment amount.');
      retVal = false;
    }

    if (errors.length > 0) {

      let markup = '';
      for (let j = 0; j < errors.length; j++) {
        markup += errors[j] + '\r\n';
      }
      const title = 'Errors on commission adjustment creation';
      const message = markup;
      const buttons = [
        {
          Id: 1,
          SortOrder: 1,
          CheckValidation: true,
          Name: 'OK',
          Class: 'btn-primary'
        }
      ];
      this.createAndOpenDialog(title, message, buttons);
      retVal = false;
    }

    return retVal;
  }

  onSaveBackgroundCheck() {

    const currentAdjustmentDetails = cloneDeep(this.commissionAdjustment.CommissionAdjustmentDetails);
    let newAdjustmentDetails = [];

    const CommissionJobOwners = currentAdjustmentDetails.filter(i => i.CommissionAdjustmentDetailTypeId === PhxConstants.CommissionAdjustmentDetailType.JobOwnerAllocation);
    if (CommissionJobOwners.length > 0) {
      each(CommissionJobOwners, (jo) => {
        jo.AdjustmentAmount = this.getUnallocatedAmount();
      });
    }
    newAdjustmentDetails = CommissionJobOwners;

    let commissionWorkorders = [];
    const CommissionWorkOrders = currentAdjustmentDetails.filter(i => i.CommissionAdjustmentDetailTypeId === PhxConstants.CommissionAdjustmentDetailType.WorkorderAllocation);
    if (CommissionWorkOrders.length > 0) {
      commissionWorkorders = map(CommissionWorkOrders, function (wo) {
        return {
          WorkOrderVersionId: wo.WorkOrderVersionId,
          AdjustmentAmount: wo.AdjustmentAmount,
          CommissionAdjustmentDetailTypeId: wo.CommissionAdjustmentDetailTypeId
        };
      });

      newAdjustmentDetails = newAdjustmentDetails.concat(commissionWorkorders);
      this.commissionAdjustment.CommissionAdjustmentDetails = newAdjustmentDetails;
    }

    this.commissionService.saveCommissionTransaction(this.convertCommissionAdjustmentUiToApi(this.commissionAdjustment)).subscribe((response: any) => {
      if (response.IsValid) {
        this.commonService.logSuccess('Commission Adjustment has been saved successfully.');
        this.router.navigate(['/next', 'commission', 'adjustment']);
      }
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.validationMessages.push(element.Message);
        });
      }
    });
  }

  convertCommissionAdjustmentUiToApi(commissionHeaderUi) {
    const commissionHeader = cloneDeep(commissionHeaderUi);
    if (commissionHeader) {
      commissionHeader.AdjustmentAmountNet = commissionHeader.AdjustmentAmountNet * this.getMultiplierIsAdjustmentAmountAdd(commissionHeader.isAdjustmentAmountAdd);
      forEach(commissionHeader.CommissionAdjustmentDetails, (detail) => {
        detail.AdjustmentAmount = detail.AdjustmentAmount * this.getMultiplierIsAdjustmentAmountAdd(commissionHeader.isAdjustmentAmountAdd);
      });
      delete commissionHeader.isAdjustmentAmountAdd;
    }
    return commissionHeader;
  }

  getMultiplierIsAdjustmentAmountAdd(isAdjustmentAmountAdd) {
    return isAdjustmentAmountAdd ? 1 : -1;
  }

  getAllCommissionUsers() {
    const users = chain(this.CommissionUsers).filter(function (user) {
      return user.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleNoSupport ||
        user.CommissionRoleId === PhxConstants.CommissionRole.JobOwnerRoleWithSupport ||
        user.CommissionRoleId === PhxConstants.CommissionRole.SupportingJobOwner;
    }).groupBy('CommissionUserProfileId').map(function (roles, userId) {
      return {
        CommissionUserProfileId: +userId,
        Name: roles[0].CommissionUserProfileFirstName + ' ' + roles[0].CommissionUserProfileLastName,
        Roles: roles,
        CommissionUserProfileStatusId: roles[0].CommissionUserProfileStatusId
      };
    }).value();
    return users;
  }

  getCommissionType(id) {
    if (this.commissionUsersAll) {
      const commissionUsers = this.commissionUsersAll.find(i => i.CommissionUserProfileId === id);
      return commissionUsers ? commissionUsers.Roles : [];
    } else {
      return [];
    }
  }

  getCommissionUserProfileFormGroup() {
    return (<FormArray<ICommissionAdjustmentDetail>>this.inputFormGroup.controls.CommissionAdjustmentDetails).at(0);
  }

  getFormArrayBasedOnDetailType(controls, typeId) {
    return controls.filter(s => s.value.CommissionAdjustmentDetailTypeId === typeId);
  }

  createAndOpenDialog(title: string, message: string, buttons: Array<any>) {
    this.phxDialogComponentConfigModel = {
      HeaderTitle: title,
      BodyMessage: message,
      Buttons: buttons,
      ObjectDate: null,
      ObjectComment: null
    };
    this.phxDialogComponent.open();
  }

  onDiscard() {
    const title = 'Discard Commission Adjustment';
    const message = 'Are you sure you want to discard this Adjustment?';
    const buttons = [
      {
        Id: 1,
        SortOrder: 1,
        CheckValidation: true,
        Name: 'Yes',
        Class: 'btn-primary',
        ClickEvent: () => {
          this.onDiscardCallBack();
        }
      },
      {
        Id: 2,
        SortOrder: 2,
        CheckValidation: false,
        Name: 'No',
        Class: 'btn-default'
      }
    ];
    this.createAndOpenDialog(title, message, buttons);
  }

  onDiscardCallBack() {
    this.commissionDocuments.forEach(doc => {
      this.documentService.deleteDocumentByPublicId(doc.PublicId);
    });
    this.router.navigate(['/next', 'commission', 'adjustment']);
  }

  onClickBack() {
    this.router.navigate(['/next', 'commission', 'adjustment']);
  }

  onActivateRecurring() {
    const command = {
      CommandName: 'CommissionAdjustmentHeaderActivate',
      EntityTypeId: PhxConstants.EntityType.CommissionAdjustmentHeader,
      EntityIds: [this.commissionId]
    };
    this.clearValidationMessages();
    this.commissionService.activateRecurring(command).subscribe((response: any) => {
          if (response) {
            this.commonService.logSuccess('Recurring Commission Adjustment has been activated.');
            this.loadInitialCommissionHeader();
          }
        }, error => {
          const validationMessages = this.commonService.parseResponseError(error);
          if (validationMessages.length > 0) {
            validationMessages.forEach(element => {
              this.validationMessages.push(element.Message);
            });
          }
        });
  }

  onDeactivateRecurring() {
    const command = {
      CommandName: 'CommissionAdjustmentHeaderActivate',
      EntityTypeId: PhxConstants.EntityType.CommissionAdjustmentHeader,
      EntityIds: [this.commissionId]
    };
    this.clearValidationMessages();
    this.commissionService.deactivateRecurring(command).subscribe((response: any) => {
          if (response) {
            this.commonService.logSuccess('Recurring Commission Adjustment has been deactivated.');
            this.loadInitialCommissionHeader();
          }
        }, error => {
          const validationMessages = this.commonService.parseResponseError(error);
          if (validationMessages.length > 0) {
            validationMessages.forEach(element => {
              this.validationMessages.push(element.Message);
            });
          }
        });
  }

  addWorkOrder() {
    this.canShow = true;
    this.modalWorkOrderAdd.addClassToConfig('modal-lg garnishee-modal');
    this.modalWorkOrderAdd.show();
  }

  closeModalWorkOrderAdd() {
    this.canShow = false;
  }

  onChangeWorkOrderSelection(workOrders: Array<any>) {
    this.modalWorkOrderAdd.hide();
    this.canShow = false;
    const formArray = this.inputFormGroup.get('CommissionAdjustmentDetails') as FormArray<ICommissionAdjustmentDetail>;
    forEach(workOrders, (item: any) => {
      const isExist = find(formArray.value, (i) => { if (i.WorkOrderVersionId) { return i.WorkOrderVersionId === item.WorkOrderVersionId; } });
      if (!isExist) {
        const data = {
          WorkOrderVersionId: item.WorkOrderVersionId,
          AdjustmentAmount: null,
          CommissionAdjustmentDetailTypeId: PhxConstants.CommissionAdjustmentDetailType.WorkorderAllocation,
          WorkerName: item.WorkerName,
          WorkOrderFullNumber: item.WorkOrderFullNumber
        };
        formArray.push(this.getControls(data, this.formGroupSetup));
      }
    });
  }

  getAllocatedAmount() {
    const details = <Array<ICommissionAdjustmentDetail>>this.getFormArrayBasedOnDetailType((<FormArray<ICommissionAdjustmentDetail>>this.inputFormGroup.controls.CommissionAdjustmentDetails).controls, PhxConstants.CommissionAdjustmentDetailType.WorkorderAllocation)
      .map(i => i.value);
    let allocatedAmount = null;
    if (details.length > 0) {
      allocatedAmount = sumBy(details, (i) => { return +i.AdjustmentAmount; });
    }
    return allocatedAmount;
  }

  getUnallocatedAmount() {
    const unallocatedAmount = this.inputFormGroup.controls.AdjustmentAmountNet.value
      ? (this.inputFormGroup.controls.AdjustmentAmountNet.value - this.getAllocatedAmount())
      : null;
    return unallocatedAmount;
  }

  addJobOwner() {
    const formArray = this.inputFormGroup.get('CommissionAdjustmentDetails') as FormArray<ICommissionAdjustmentDetail>;
    const data = {
      CommissionUserProfileId: null,
      AdjustmentAmount: this.getUnallocatedAmount(),
      CommissionAdjustmentDetailTypeId: PhxConstants.CommissionAdjustmentDetailType.JobOwnerAllocation,
      CommissionRateHeaderId: null
    };
    formArray.push(this.getControls(data, this.formGroupSetup));
  }

  removeWorkorder(wo: any) {
    const formArray = this.inputFormGroup.get('CommissionAdjustmentDetails') as FormArray<ICommissionAdjustmentDetail>;
    const index = formArray.value.findIndex(i => {
      return (i.WorkOrderVersionId === wo.value.WorkOrderVersionId);
    });
    formArray.removeAt(index);
  }

  removeJobOwner(jo: any) {
    const formArray = this.inputFormGroup.get('CommissionAdjustmentDetails') as FormArray<ICommissionAdjustmentDetail>;
    const index = formArray.value.findIndex(i => {
      return (i.CommissionUserProfileId === jo.value.CommissionUserProfileId);
    });
    formArray.removeAt(index);
  }

  onCancelClick() {
    this.modalWorkOrderAdd.hide();
  }

  importCommissionAdjustmentFiles() {
    const title = 'Upload a supporting document to your commission adjustment';
    this.html.DocumentFileUploadConfiguration = this.generateFileUploadConfig(title);
    this.documentTypeList = this.codeValueService.getRelatedCodeValues(this.codeValueGroups.DocumentType, PhxConstants.EntityType.CommissionAdjustmentHeader, this.codeValueGroups.EntityType);
    this.fileUpload.showModal(this.html.fileUploaderOptions_DocumentMain);
  }

  generateFileUploadConfig(title: string):
    PhxDocumentFileUploadConfiguration {
    return new PhxDocumentFileUploadConfiguration({
      entityTypeId: PhxConstants.EntityType.CommissionAdjustmentHeader
      , entityId: this.commissionId
      , documentTypeId: PhxConstants.DocumentType.CommissionAdjustmentDocument
      , WorkflowPendingTaskId: -1
      , UploadTitle: title
      , SupportedFileExtensions: 'PNG, JPG, JPEG, BMP, PDF, TIF, DOC, DOCX | 20 MB file size limit'
      , customComment: null
      , description: null
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

  documentUploadCallbackOnDone() {
    this.commissionDocuments = [];
    this.getCommissionAdjustmentDocuments();
  }

  onDocumentUploadDone(event: PhxDocumentFileUploadFileItemActionEventArg) {
    if (event && event.response && event.response.publicId) {
      this.documentService.getDocumentById(event.response.publicId).then(() => {
      }, (error) => {
        this.onResponseError(error, 'Document upload has failed.');
      });
    }
  }

  onResponseError(responseError, errorMessage) {
    if (errorMessage && errorMessage.length > 0) {
      this.commonService.logError(errorMessage);
    }
    const errorMessages = this.commonService.parseResponseError(responseError);
    errorMessages.forEach(error => {
      this.commonService.logError(`${error.PropertyName}: ${error.Message}`);
    });
  }

  getPdfStreamByPublicId(publicId: string) {
    return this.documentService.createPdfDocumentLink(publicId);
  }

  documentDelete(document) {
    const title = 'Document Delete';
    const message = 'This document will be deleted. Continue ?';
    const buttons = [
      { Id: 1, SortOrder: 1, CheckValidation: false, Name: 'No', Class: 'btn-default' },
      {
        Id: 2,
        SortOrder: 2,
        CheckValidation: true,
        Name: 'Yes',
        Class: 'btn-primary',
        ClickEvent: () => {
          this.documentService.deleteDocumentByPublicId(document.PublicId).then(() => {
            this.commissionDocuments = filter(this.commissionDocuments, function (doc) { return doc.PublicId !== document.PublicId; });
          });
        }
      }
    ];
    this.createAndOpenDialog(title, message, buttons);
  }

  onAdjustmentAmountChange() {
    const details = (<FormArray<ICommissionAdjustmentDetail>>this.inputFormGroup.controls.CommissionAdjustmentDetails).controls;
    const JobOwners = this.getFormArrayBasedOnDetailType(details, PhxConstants.CommissionAdjustmentDetailType.JobOwnerAllocation);
    JobOwners.forEach(i => {
      i.controls.AdjustmentAmount.setValue(this.inputFormGroup.controls.AdjustmentAmountNet.value);
    });
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, adj: ICommissionAdjustment): FormGroup<ICommissionAdjustment> {
    const formGroup = formGroupSetup.hashModel.getFormGroup<ICommissionAdjustment>(formGroupSetup.toUseHashCode, 'ICommissionAdjustment', adj, 0, () =>
      formGroupSetup.formBuilder.group<ICommissionAdjustment>({
        Id: [adj.Id],
        AdjustmentAmountNet: [
          adj.AdjustmentAmountNet,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AdjustmentAmountNet', CustomFieldErrorType.required))
          ]
        ],
        AdjustmentDate: [
          adj.AdjustmentDate,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AdjustmentDate', CustomFieldErrorType.required))
          ]
        ],
        OrganizationIdInternal: [
          adj.OrganizationIdInternal,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdInternal', CustomFieldErrorType.required))
          ]
        ],
        ClientOrganizationId: [adj.ClientOrganizationId],
        CommissionAdjustmentHeaderTypeId: [
          adj.CommissionAdjustmentHeaderTypeId,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CommissionAdjustmentHeaderTypeId', CustomFieldErrorType.required))
          ]
        ],
        Description: [
          adj.Description,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))
          ]
        ],
        isAdjustmentAmountAdd: [
          adj.isAdjustmentAmountAdd,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('isAdjustmentAmountAdd', CustomFieldErrorType.required))
          ]
        ],
        CreatedByProfileFullName: [adj.CreatedByProfileFullName],
        CreatedDatetime: [adj.CreatedDatetime],
        CommissionRecurrency: [adj.CommissionRecurrency],
        CommissionAdjustmentHeaderStatusId: [adj.CommissionAdjustmentHeaderStatusId],
        WorkflowPendingTaskId: [adj.WorkflowPendingTaskId],
        CommissionAdjustmentDetails: this.formBuilderGroupSetupAdjustmentDetail(this.formGroupSetup, adj.CommissionAdjustmentDetails)
      })
    );
    return formGroup;
  }

  formBuilderGroupSetupAdjustmentDetail(formGroupSetup: IFormGroupSetup, details: Array<ICommissionAdjustmentDetail>): FormArray<ICommissionAdjustmentDetail> {
    const formGroup = formGroupSetup.formBuilder.array<ICommissionAdjustmentDetail>(
      details.map((detail: ICommissionAdjustmentDetail) => this.getControls(detail, formGroupSetup)
      )
    );
    return formGroup;
  }

  getControls(data, formGroupSetup: IFormGroupSetup) {
    const formGroup = formGroupSetup.formBuilder.group<any>({});
    forEach(Object.keys(data), key => {
      formGroup.addControl(key, new FormControl(data[key],
        (this.inputFormGroup && this.inputFormGroup.controls.CommissionAdjustmentHeaderTypeId.value &&
          this.inputFormGroup.controls.CommissionAdjustmentHeaderTypeId.value === PhxConstants.CommissionAdjustmentHeaderType.BackgroundCheck)
          ? [Validators.required]
          : null));
    });
    return formGroup;
  }

  clearValidationMessages() {
    this.validationMessages = [];
  }
}
