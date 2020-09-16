import { Component, OnInit } from '@angular/core';
import { DocumentRulePresentationalBase } from '../document-rule-presentational-base';
import { IDocumentRuleDetails, IComplianceDocumentRuleUserDefinedDocumentType, IFormGroupSetup, IDocumentRule } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { DocumentRuleService } from '../shared/document-rule.service';
import { FormGroup, ControlsConfig, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { ActivatedRoute } from '@angular/router';
import { DocumentRuleObservableService } from '../state/document-rule.observable.service';
import { Validators } from '@angular/forms';
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';

declare var oreq: any;

@Component({
  selector: 'app-document-rule-details',
  templateUrl: './document-rule-details.component.html',
  styleUrls: ['./document-rule-details.component.less']
})
export class DocumentRuleDetailsComponent extends DocumentRulePresentationalBase<IDocumentRuleDetails> implements OnInit {
  html: {
    listDocumentList: IComplianceDocumentRuleUserDefinedDocumentType[];
    listOrgClients: any;
  } = {
      listOrgClients: [],
      listDocumentList: []
    };

  constructor(private docRuleService: DocumentRuleService, protected documentRuleService: DocumentRuleService, public activatedRoute: ActivatedRoute, documentRuleObservableService: DocumentRuleObservableService) {
    super('DocumentRuleDetailsComponent', documentRuleObservableService, activatedRoute, documentRuleService);
    this.getCodeValuelistsStatic();
  }

  public get documentTypesFormArray() {
    return this.inputFormGroup.controls.ComplianceDocumentRuleUserDefinedDocumentTypes as FormArray<IComplianceDocumentRuleUserDefinedDocumentType>;
  }

  ngOnInit() { }

  public getCodeValuelistsStatic() {
    this.loadDocumentTypeList();
    this.loadOrgClientsList();
  }

  public static formGroupToPartial(documentRule: IDocumentRule, formGroup: FormGroup<IDocumentRuleDetails>): IDocumentRuleDetails {
    return {
      ...formGroup.value
    };
  }

  public businessRules(obj: IFormGroupValue): void { }

  loadDocumentTypeList() {
    const oDataFilterArray = [];
    oDataFilterArray.push('StatusId eq ' + this.phxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Active);
    oDataFilterArray.push('StatusId eq ' + this.phxConstants.UserDefinedCodeComplianceDocumentTypeStatus.Inactive);
    const oDataFilter = oDataFilterArray.join(' or ');
    const oDataParams = oreq
      .request()
      .withSelect(['Id', 'StatusId', 'Name', 'Description'])
      .withFilter(oDataFilter)
      .url();

    this.documentRuleService.getListUserDefinedCodeComplianceDocumentTypes(oDataParams).subscribe((x: any) => {
      this.html.listDocumentList = x.Items;
    });
  }

  loadOrgClientsList() {
    const oDataParamsOrg = oreq
      .request()
      .withSelect(['Id', 'DisplayName', 'Code'])
      .url();
    this.docRuleService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParamsOrg).subscribe((result: any) => {
      this.html.listOrgClients = result.Items;
    });
  }

  documentTypeChanged($event) {
    const type = this.html.listDocumentList.find(x => x.Id === this.inputFormGroup.controls.DocumentType.value);

    if (type) {
      this.documentTypesFormArray.push(
        this.formBuilder.group<IComplianceDocumentRuleUserDefinedDocumentType>({
          Id: 0,
          UserDefinedCodeComplianceDocumentTypeId: type.Id
        })
      );

      this.inputFormGroup.patchValue({
        DisplayName: type.Name,
        Description: type.Name
      });
    }
  }

  removeDocumentType() {
    this.documentTypesFormArray.removeAt(0);
  }

  trackbyFn(index: number) {
    return index;
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, documentRuleDetails: IDocumentRuleDetails, isOrgInternal): any {
    return formGroupSetup.formBuilder.group<IDocumentRuleDetails>({
      OrganizationIdClient: [documentRuleDetails.OrganizationIdClient, isOrgInternal ? [Validators.required] : []],
      DisplayName: [documentRuleDetails.DisplayName, [
        ValidationExtensions.minLength(3),
        ValidationExtensions.maxLength(128),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DisplayName', CustomFieldErrorType.required))]],
      DocumentType: [
        documentRuleDetails.ComplianceDocumentRuleUserDefinedDocumentTypes
          ? documentRuleDetails.ComplianceDocumentRuleUserDefinedDocumentTypes.length > 0
            ? documentRuleDetails.ComplianceDocumentRuleUserDefinedDocumentTypes[0].UserDefinedCodeComplianceDocumentTypeId
            : null
          : null
        , [Validators.required]],
      Description: [documentRuleDetails.Description, [
        ValidationExtensions.minLength(3),
        ValidationExtensions.maxLength(225),
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
      ComplianceDocumentRuleUserDefinedDocumentTypes: formGroupSetup.formBuilder.array<IComplianceDocumentRuleUserDefinedDocumentType>(
        documentRuleDetails.ComplianceDocumentRuleUserDefinedDocumentTypes.map(x =>
          formGroupSetup.formBuilder.group<IComplianceDocumentRuleUserDefinedDocumentType>({
            Id: [x.Id],
            UserDefinedCodeComplianceDocumentTypeId: [x.UserDefinedCodeComplianceDocumentTypeId]
          })
        )
      )
    });
  }
}
