import { Component, OnInit, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ComplianceTemplateService, ComplianceTemplate, ComplianceTemplateExtension } from '../shared/index';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DialogService, CodeValueService } from '../../common/index';
import { DialogResultType, CodeValue, PhxDocumentFileUploadConfiguration, PhxDocumentFileUploaderOptions, PhxDocumentFileUploadFileItemActionEventArg } from '../../common/model/index';
import { PhxConstants, uuid } from '../../common/PhoenixCommon.module';
import { RestrictionItem, RestrictionSelectorType } from '../../restriction/share/index';
import { CommonService } from '../../common/services/common.service';
import { Observable } from 'rxjs/Observable';
import { PhxDocumentFileUploadComponent } from '../../common/components/phx-document-file-upload/phx-document-file-upload.component';
import { RestrictionDropdownComponent } from '../../restriction/restriction-dropdown/restriction-dropdown.component';
import { OrganizationApiService } from '../../organization/organization.api.service';

@Component({
  selector: 'app-compliance-template-detail',
  templateUrl: './compliance-template-detail.component.html',
  styleUrls: ['./compliance-template-detail.component.less']
})
export class ComplianceTemplateDetailComponent implements OnInit, OnChanges {

  @ViewChild('templateFileUpload') templateFileUpload: PhxDocumentFileUploadComponent;
  @ViewChild('sampleFileUpload') sampleFileUpload: PhxDocumentFileUploadComponent;
  @ViewChild('restrictionDropDown') restrictionDropDown: RestrictionDropdownComponent;

  template: ComplianceTemplate;
  id: number;

  codeValueGroups: any;
  editable: boolean = false;
  isInEditMode: boolean = false;
  validationMessages: {};

  form: FormGroup;
  isAlive: boolean = true;

  restrictionDropDownItems: Array<RestrictionItem>;
  restirctionItemList: Array<{ id: number, text: string }>;
  restirctionSelectedItemsList: Array<number> = [];

  templateDocumentUploadConfiguration: PhxDocumentFileUploadConfiguration;
  sampleDocumentUploadConfiguration: PhxDocumentFileUploadConfiguration;
  templateFileUploadOptions: PhxDocumentFileUploaderOptions;
  sampleFileUploadOptions: PhxDocumentFileUploaderOptions;

  ComplianceTemplateRestrictionType = PhxConstants.ComplianceTemplateRestrictionType;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private complianceTemplateService: ComplianceTemplateService,
    private dialogService: DialogService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private organizationService: OrganizationApiService
  ) {
    this.codeValueGroups = commonService.CodeValueGroups;
  }

  ngOnInit() {

    this.form = this.fb.group({
      Name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(128)
      ]],
      Files: [null, this.atLeastOneRequiredValidation],
      TemplateDocumentId: [null],
      SampleDocumentId: [null],
    });

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        Object.assign(this.template, value);
        this.complianceTemplateService.updateState(this.template);
      });

    this.route.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadTemplate(this.id);
      });

    this.restrictionDropDownItems = this.getRestrictionTypes();
  }

  loadTemplate(id: number, force: boolean = false) {
    this.complianceTemplateService.getTemplateEditMode(id).subscribe((value) => {
      if (value != null) {
        this.isInEditMode = value;
      } else {
        this.isInEditMode = false;
      }
    });

    this.complianceTemplateService.getTemplateById(id, null, force)
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe((data) => {
        this.template = data;
        this.setEditableState();
        if (data) {
          this.form.patchValue(data, { emitEvent: false });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  setEditableState() {

    if (this.template.Name == null || this.template.Name === '') {
      this.isInEditMode = true;
    }

    this.editable = this.isInEditMode;
    this.complianceTemplateService.updateUiStateEditable(this.template.Id, this.editable);

  }

  confirmAndExecuteCommand(commandName: string, actionName: string, updateState: boolean) {
    return new Promise((resolve, reject) => {
      this.dialogService.confirm(actionName, `Are you sure you want to ${actionName} this document type?`)
        .then((button) => {
          if (button === DialogResultType.Yes) {
            this.executeCommand(commandName, updateState)
              .then(() => {
                this.validationMessages = {};
                resolve();
              })
              .catch((err) => {
                this.validationMessages = err;
                reject(err);
              });
          }
        });
    });
  }

  executeCommand(commandName: string, updateState: boolean) {
    return this.complianceTemplateService.executeCommand(commandName, this.template, null, updateState);
  }

  edit() {
    this.isInEditMode = true;
    this.complianceTemplateService.updateUiStateEditable(this.template.Id, true);
    this.setEditableState();
  }

  cancel() {
    this.isInEditMode = false;
    this.complianceTemplateService.updateUiStateEditable(this.template.Id, false);
    this.setEditableState();
    this.form.markAsUntouched();
    this.loadTemplate(this.id, true);
  }

  discard() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.ComplianceTemplateDiscard, 'discard', true)
      .then(() => {
        this.gotoSearchPage();
      })
      .catch(() => {
        this.gotoSearchPage();
      });
  }

  submit() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.ComplianceTemplateSubmit, 'submit', true)
      .then(() => {
        this.isInEditMode = false;
        this.complianceTemplateService.updateUiStateEditable(this.template.Id, false);
        this.setEditableState();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  confirmAndBacktoDocumentTypes() {
    this.dialogService.confirm('Back', `Are you sure you want go back to ${this.template.ComplianceDocumentTypeName}?`)
      .then((button) => {
        if (button === DialogResultType.Yes) {
          this.loadTemplate(this.id, true);
          this.gotoSearchPage();
        }
      });
  }

  gotoSearchPage() {
    this.complianceTemplateService.updateUiStateEditable(this.template.Id, false);
    if (this.template.ComplianceDocumentTypeId > 0) {
      this.router.navigateByUrl(`/next/compliance/document-type/${this.template.ComplianceDocumentTypeId}/templates`);
    } else {
      this.router.navigate([`search`], { relativeTo: this.route.parent });
    }
  }

  getRestrictionTypes(): Array<RestrictionItem> {
    return this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceTemplateRestrictionType, true)
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1;
        }
        if (a.text > b.text) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return new RestrictionItem({
          name: codeValue.text,
          id: codeValue.id,
          restrcitionSelectorType: [1, 2, 3, 5].includes(codeValue.id) ? RestrictionSelectorType.Checkbox : RestrictionSelectorType.Dropdown
        });
      });
  }

  getCodeValue(groupName: string): Array<{ id: number, text: string }> {
    return this.codeValueService.getCodeValues(groupName, true)
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          id: codeValue.id
        };
      });
  }

  getWorksiteList(): Array<{ id: number, text: string }> {
    return this.codeValueService.getCodeValues(this.codeValueGroups.Worksite, true)
      .sort((a, b) => {
        if (a.text < b.text) {
          return -1;
        }
        if (a.text > b.text) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          id: codeValue.id
        };
      });
  }


  getObservableList(list: Array<{ id: number, text: string }>): Observable<{ id: number, text: string }[]> {
    return new Observable(observer => {
      observer.next(list);
      observer.complete();
    });
  }

  getClientList(): Observable<{ id: number, text: string }[]> {
    return this.organizationService.getListClient(true)
      .map((orgList) => {
        const result: { id: number, text: string }[] = [];
        orgList.forEach(org => {
          result.push({ id: org.Id, text: org.LegalName });
        });
        return result.sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
      });
  }

  getIntenalOrganizations(): Observable<{ id: number, text: string }[]> {
    return this.organizationService.getListOrganizationInternal(true)
      .map((orgList) => {
        const result: { id: number, text: string }[] = [];
        orgList.forEach(org => {
          result.push({ id: org.Id, text: org.LegalName });
        });
        return result.sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
      });
  }


  loadRestictionItems(restriction: RestrictionItem) {

    const mapper: {
      [index: number]: {
        getItems: () => Observable<{ id: number, text: string }[]>,
      }
    } = {
      [PhxConstants.ComplianceTemplateRestrictionType.InternalOrganizationDefinition1]: {
        getItems: () => {
          return this.getObservableList(this.getCodeValue(this.codeValueGroups.InternalOrganizationDefinition1));
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.ClientOrganization]: {
        getItems: () => {
          return this.getClientList();
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.InternalOrganization]: {
        getItems: () => {
          return this.getIntenalOrganizations();
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.LineOfBusiness]: {
        getItems: () => {
          return this.getObservableList(this.getCodeValue(this.codeValueGroups.LineOfBusiness));
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.OrganizationRoleType]: {
        getItems: () => {
          return this.getObservableList(
            this.getCodeValue(this.codeValueGroups.OrganizationRoleType)
              .filter((item) => item.id !== PhxConstants.OrganizationRoleType.Internal && item.id !== PhxConstants.OrganizationRoleType.Client)
          );
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.Worksite]: {
        getItems: () => {
          return this.getObservableList(this.getWorksiteList());
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.WorkerType]: {
        getItems: () => {
          return this.getObservableList(
            this.getCodeValue(this.codeValueGroups.ProfileType)
              .filter((codeValue: CodeValue) => codeValue.id !== 99)
          );
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.TaxSubdivision]: {
        getItems: () => {
          return this.getObservableList(
            this.codeValueService.getRelatedCodeValues(this.codeValueGroups.Subdivision, PhxConstants.Country.CA, this.codeValueGroups.Country)
          );
        },
      },

      [PhxConstants.ComplianceTemplateRestrictionType.WorkerEligibility]: {
        getItems: () => {
          return this.getObservableList(
            this.getCodeValue(this.codeValueGroups.WorkerEligibilityType)
          );
        },
      },
    };

    mapper[restriction.id].getItems()
      .first()
      .subscribe((data) => {
        this.restirctionItemList = data;
        this.restirctionSelectedItemsList = ComplianceTemplateExtension.getRestrictions(this.template, restriction.id);
      });
  }

  restrictionItemsChanged(event: { restirctionItem: RestrictionItem, selectedItems: Array<{ id: number, text: string }> }) {

    ComplianceTemplateExtension.setRestrictions(this.template, event.restirctionItem.id, event.selectedItems);
    this.complianceTemplateService.updateState(this.template);
  }

  loadDocumentFromApi() {
    this.complianceTemplateService.getTemplateByIdFromApi(this.id)
      .then((res) => {
        Object.assign(this.template, {
          SampleDocumentId: res.SampleDocumentId,
          SampleDocumentName: res.SampleDocumentName,
          SampleDocumentPublicId: res.SampleDocumentPublicId,
          TemplateDocumentId: res.TemplateDocumentId,
          TemplateDocumentName: res.TemplateDocumentName,
          TemplateDocumentPublicId: res.TemplateDocumentPublicId,
          LastModifiedDatetime: res.LastModifiedDatetime,
        });
        this.complianceTemplateService.updateState(this.template);
        this.form.updateValueAndValidity();
      });
  }

  onUploadComplete() {
    this.loadDocumentFromApi();
  }

  onDeleteTemplateDocument(documentId: number) {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.ComplianceTemplateDeleteTemplateDocument, 'delete', false)
      .then(() => {
        this.loadDocumentFromApi();
      })
      .catch(() => {
        this.loadDocumentFromApi();
      });
  }

  onDeleteSampleDocument(documentId: number) {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.ComplianceTemplateDeleteSampleDocument, 'delete', false)
      .then(() => {
        this.loadDocumentFromApi();
      })
      .catch(() => {
        this.loadDocumentFromApi();
      });
  }

  onRestrictionLabelClick(restrictionType: PhxConstants.ComplianceTemplateRestrictionType) {
    this.restrictionDropDown.openRestrictionSelector(restrictionType);
  }

  initTemplateUploadConfig() {
    this.templateFileUploadOptions = {
      queueLimit: 1,
      maxFileSize: (20 * 1024 * 1024), // 20971520 == 20 MB
      allowedFileType: [
        'doc',
      ],
      allowedMimeType: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    this.templateDocumentUploadConfiguration = new PhxDocumentFileUploadConfiguration({
      UploadTitle: 'Upload a template document',
      WorkflowPendingTaskId: 0,
      entityTypeId: PhxConstants.EntityType.ComplianceTemplate,
      entityId: this.template.Id,
      customId1: 0,
      customId2: 0,
      customMethodata: null,
      description: '',
      documentTypeId: this.commonService.ApplicationConstants.DocumentType.ComplianceTemplateTemplate,
      SupportedFileExtensions: 'DOCX',
      isFinalDocument: true,
    });

  }

  initSampleUploadConfig() {
    this.sampleFileUploadOptions = {
      queueLimit: 1,
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

    this.sampleDocumentUploadConfiguration = new PhxDocumentFileUploadConfiguration({
      UploadTitle: 'Upload a sample document',
      WorkflowPendingTaskId: 0,
      entityTypeId: PhxConstants.EntityType.ComplianceTemplate,
      entityId: this.template.Id,
      customId1: 0,
      customId2: 0,
      customMethodata: null,
      description: '',
      documentTypeId: this.commonService.ApplicationConstants.DocumentType.ComplianceTemplateSample,
      SupportedFileExtensions: 'JPEG, JPG, PNG, PDF, TIF, DOC, DOCX, XLS, XLSX, RAR, 7Z, TXT',
      isFinalDocument: true,
    });

  }

  atLeastOneRequiredValidation(control: AbstractControl): { [key: string]: any } {
    const templateDocumentId = control.parent && control.parent.controls
      && control.parent.controls['TemplateDocumentId'] && control.parent.controls['TemplateDocumentId'].value;
    const sampleDocumentId = control.parent && control.parent.controls
      && control.parent.controls['SampleDocumentId'] && control.parent.controls['SampleDocumentId'].value;
    return (templateDocumentId || sampleDocumentId) ? null : { required: true };
  }
}
