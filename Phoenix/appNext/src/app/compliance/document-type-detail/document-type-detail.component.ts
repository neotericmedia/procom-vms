import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { DocumentTypeService, DocumentType } from '../shared/index';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService, CodeValueService, ValidationExtensions, DialogService } from '../../common/index';
import { PhxConstants } from '../../common/PhoenixCommon.module';
import { DialogResultType } from '../../common/model/index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-document-type-detail',
  templateUrl: './document-type-detail.component.html',
  styleUrls: ['./document-type-detail.component.less']
})
export class DocumentTypeDetailComponent implements OnInit, OnDestroy {

  documentType: DocumentType;
  id: number;
  isAlive: boolean = true;
  form: FormGroup;
  codeValueGroups: any;
  validationMessages: {};

  editable: boolean;
  isInEditMode: boolean = false;
  activeButtonEnable: boolean = false;
  deactiveButtonEnable: boolean = false;
  discardButtonEnable: boolean = false;
  saveButtonEnable: boolean = false;
  editButtonEnable: boolean = false;
  submitButtonEnable: boolean = false;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    private codeValueService: CodeValueService,
    private documentTypeService: DocumentTypeService,
    private dialogService: DialogService,
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.form = this.fb.group({
      Name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(127)
      ]],

      Description: ['', [
        Validators.maxLength(256)
      ]],
    });

    this.form.valueChanges
      .takeWhile(() => this.isAlive)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(value => {
        Object.assign(this.documentType, value);
        this.documentTypeService.updateState(this.documentType);
      });

    this.route.parent.params
      .takeWhile(() => this.isAlive)
      .subscribe((params) => {
        this.id = +params['Id'];
        this.loadDocumentType(this.id);
      });

  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  loadDocumentType(id: number, force: boolean = false) {
    this.documentTypeService.getDocumentTypeEditMode(id).subscribe((value) => {
      if (value != null) {
        this.isInEditMode = value;
      } else {
        this.isInEditMode = false;
      }
    });

    this.documentTypeService.getDocumentType(id)
      .takeWhile(() => this.isAlive)
      .distinctUntilChanged()
      .subscribe(value => {
        this.documentType = value;
        this.setButtonEnableStatus(this.documentType.StatusId);
        this.setEditableState();
        this.form.patchValue(value, { emitEvent: false });
      });
  }

  setButtonEnableStatus(status: PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus) {

    this.activeButtonEnable = status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Inactive;

    this.deactiveButtonEnable = status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Active;

    this.saveButtonEnable = this.discardButtonEnable =
      status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.New ||
      status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Draft;

    this.editButtonEnable = status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Active;

    this.submitButtonEnable =
      status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.New ||
      status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Draft ||
      status === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Active;

  }

  setEditableState() {

    this.editable = this.isInEditMode ||
      this.documentType.StatusId === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.New ||
      this.documentType.StatusId === PhxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Draft;

    this.documentTypeService.updateUiStateEditable(this.documentType.Id, this.editable);

  }


  confirmAndExecuteCommand(commandName: string, actionName: string) {
    return new Promise((resolve, reject) => {
      this.dialogService.confirm(actionName, `Are you sure you want to ${actionName} this document type?`)
        .then((button) => {
          if (button === DialogResultType.Yes) {
            this.executeCommand(commandName).then(() => {
              resolve();
            }).catch((err) => {
              reject(err);
            });
          }
        });
    });
  }

  executeCommand(commandName: string) {
    return this.documentTypeService.executeCommand(commandName, this.documentType)
      .then(() => {
        this.isInEditMode = false;
        this.documentTypeService.updateUiStateEditable(this.documentType.Id, false);
        this.validationMessages = {};
        this.setEditableState();
      })
      .catch((err) => {
        this.validationMessages = err;
      });
  }

  edit() {
    this.isInEditMode = true;
    this.documentTypeService.updateUiStateEditable(this.documentType.Id, true);
    this.setEditableState();
  }

  cancel() {
    this.isInEditMode = false;
    this.documentTypeService.updateUiStateEditable(this.documentType.Id, false);
    this.setEditableState();
    this.form.markAsUntouched();
    this.loadDocumentType(this.id, true);
  }

  discard() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeDiscard, 'discard')
      .then(() => {
        this.gotoSearchPage();
      })
      .catch(() => {
        this.gotoSearchPage();
      });
  }

  save() {
    this.executeCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeSave);
  }

  submit() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeSubmit, 'submit');
  }

  activate() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeActivate, 'activate');
  }

  deactivate() {
    this.confirmAndExecuteCommand(PhxConstants.CommandNamesSupportedByUi.UserDefinedCodeComplianceDocumentTypeInactivate, 'deactivate');
  }

  gotoSearchPage() {
    this.router.navigate([`next`, `compliance`, `document-type`, `search`]);
  }
}
