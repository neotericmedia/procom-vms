import { CodeValueService } from './../../common/services/code-value.service';
import { PhxButton } from './../../common/model/phx-button';
import { PhxModalComponent } from './../../common/components/phx-modal/phx-modal.component';
import { IComplianceDocumentEntityGroup, IComplianceDocumentHeader, IApplicableComplianceTemplate } from './../shared/compliance-document.model';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PhxConstants, CommonService } from '../../common/index';
import { ComplianceDocumentService } from '../shared/compliance-document.service';
import { FormArray, FormBuilder, FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { StateAction } from '../../common/model';

interface ITemplateSelectionForm {
  selectAll: boolean;
  templateIds: IFormTemplateIds;
}

interface IFormTemplateIds {
  [templateId: number]: IFormTemplate;
}

interface IFormTemplate {
  complianceDocumentId: number;
  templateId: number;
  checked: boolean;
}

@Component({
  selector: 'app-compliance-document-dialog-compliance-template',
  templateUrl: './compliance-document-dialog-compliance-template.component.html',
  styleUrls: ['./compliance-document-dialog-compliance-template.component.less']
})
export class ComplianceDocumentDialogComplianceTemplateComponent {
  @ViewChild(PhxModalComponent) modal: PhxModalComponent;
  @Output() complianceDocumentDialogComplianceTemplateOnClickEvent = new EventEmitter<number>();

  stateAction: PhxConstants.StateAction;
  complianceTemplateDocumentTypeId: PhxConstants.ComplianceTemplateDocumentType;
  documentEntityGroups: IComplianceDocumentEntityGroup[] = [];
  countAll: number = 0;
  countSelected: number = 0;
  codeValueGroups: any;

  form: FormGroup<ITemplateSelectionForm>;
  templateIdsControl: FormGroup<IFormTemplateIds>;

  selectAll: boolean = false;

  title: string;

  buttons: PhxButton[] = [
    {
      icon: null,
      btnType: 'primary',
      tooltip: 'Generate',
      disabled: () => !this.countSelected,
      action: () => this.onClickGenerate(),
    },
    {
      icon: null,
      btnType: 'default',
      tooltip: 'Cancel',
      action: () => this.onClickCancel(),
    }
  ];

  constructor(
    private commonService: CommonService,
    private complianceDocumentService: ComplianceDocumentService,
    private codeValueService: CodeValueService,
    private fb: FormBuilder
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }
  onInit(
    stateAction: PhxConstants.StateAction,
    documentEntityGroups: IComplianceDocumentEntityGroup[]
  ) {
    this.stateAction = stateAction;
    this.complianceTemplateDocumentTypeId = this.getTemplateType(stateAction);
    this.documentEntityGroups = documentEntityGroups;
    this.title = `Document ${this.complianceTemplateDocumentTypeId === PhxConstants.ComplianceTemplateDocumentType.Sample ? 'Samples' : 'Templates'}`;
    this.buildForm();
    this.onTemplateIdsChange();
  }

  getTemplateType(stateAction: PhxConstants.StateAction) {
    switch (stateAction) {
      case PhxConstants.StateAction.ComplianceDocumentViewSample:
        return PhxConstants.ComplianceTemplateDocumentType.Sample;
      case PhxConstants.StateAction.ComplianceDocumentGenerateDocument:
      default:
        return PhxConstants.ComplianceTemplateDocumentType.Template;
    }
  }

  getSelectedTemplates() {
    return Object.keys(this.templateIdsControl.value).reduce<IFormTemplate[]>((result, key) => {
      const id = +key; // string to number
      const template = this.templateIdsControl.value[id];
      if (template.checked) {
        result.push(template);
      }
      return result;
    }, []);
  }

  updateCounts() {
    this.countAll = Object.keys(this.form.value.templateIds).length;
    this.countSelected = this.getSelectedTemplates().length;
  }

  onTemplateIdsChange() {
    this.updateCounts();
    this.selectAll = this.countSelected === this.countAll;
    this.form.controls.selectAll.setValue(this.selectAll);
  }

  onSelectAllChange(checked: boolean) {
    if (this.selectAll !== checked) {
      Object.keys(this.templateIdsControl.controls).forEach(key => {
        const id = +key;
        const control = this.templateIdsControl.controls[id] as FormGroup<IFormTemplate>;
        control.controls.checked.setValue(checked, { emitEvent: false });
      });
      this.selectAll = checked;
      this.updateCounts();
    }
  }

  buildTemplateIdsControl() {
    const formValues = this.complianceDocumentService.getHeadersFromEntityGroups(this.documentEntityGroups)
      .reduce<IFormTemplate[]>((result, header) => {
        const templates = header.ApplicableTemplateDocuments.filter(x => x.TemplateType === this.complianceTemplateDocumentTypeId)
          .map<IFormTemplate>(template => {
            return {
              templateId: template.Id,
              complianceDocumentId: header.ComplianceDocumentCurrent.Id,
              checked: false
            };
          });
        return result.concat(templates);
      }, []);

    return this.fb.group<IFormTemplateIds>(formValues.reduce((config, value) => {
      config[value.templateId] = this.fb.group<IFormTemplate>(value);
      return config;
    }, {}));
  }

  buildForm() {
    this.templateIdsControl = this.buildTemplateIdsControl();

    const form = this.fb.group<ITemplateSelectionForm>({
      selectAll: false,
      templateIds: this.templateIdsControl
    });

    this.form = form;

    this.form.controls.selectAll.valueChanges
    .distinctUntilChanged()
    .subscribe(value => {
      this.onSelectAllChange(value);
    });

    this.form.controls.templateIds.valueChanges
    .distinctUntilChanged()
    .subscribe(value => {
      this.onTemplateIdsChange();
    });
  }

  onClickCancel() {
    this.complianceDocumentDialogComplianceTemplateOnClickEvent.emit();
  }

  onClickGenerate() {
    // tslint:disable-next-line:prefer-const
    const applicableComplianceTemplates = this.getSelectedTemplates()
    .reduce<{ComplianceDocumentId: number, ComplianceTemplateIds: number[]}[]>((items, template) => {
      let document = items.find(x => x.ComplianceDocumentId === template.complianceDocumentId);
      if (!document) {
        document = {
          ComplianceDocumentId: template.complianceDocumentId,
          ComplianceTemplateIds: [],
        };
      }
      document.ComplianceTemplateIds.push(template.templateId);
      items.push(document);
      return items;
    }, []);

    const commandBody = {
      ComplianceTemplateDocumentTypeId: this.complianceTemplateDocumentTypeId,
      ApplicableComplianceTemplates: applicableComplianceTemplates
    };

    const commandName = this.codeValueService.getCodeValueCode(this.stateAction, this.codeValueGroups.StateAction);

    this.complianceDocumentService.executeStateCommand(commandName, commandBody)
      .then(id => {
        this.complianceDocumentDialogComplianceTemplateOnClickEvent.emit();
      })
      .catch(err => {
        console.log(err); this.complianceDocumentDialogComplianceTemplateOnClickEvent.emit();
      });
    this.modal.hide();
  }

}
