import { Component, OnInit, Input } from '@angular/core';
import { DocumentRuleBaseComponentPresentational } from '../document-rule-base-component-presentational';
import { DocumentRuleObservableService } from './../state/document-rule.observable.service';
import { map, groupBy, find, filter } from 'lodash';
import { RestrictionItem, RestrictionSelectorType } from '../../restriction/share';
import { IFormGroupSetup, IComplianceDocumentRuleRestriction, IRestrictions, IRules, IComplianceDocumentRuleRequiredSituation, IComplianceDocumentRuleProfileVisibility, IDocumentRule } from '../state';
import { FormGroup, ControlsConfig, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { DocumentRuleService } from './../shared/document-rule.service';
import { IRestrictionItem } from '../../commission/state';
import { HashModel } from '../../common/utility/hash-model';
import { DocumentRulePresentationalBase } from '../document-rule-presentational-base';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from '../../common/validators/CustomValidators';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-document-rule-tab-rules',
  templateUrl: './document-rule-tab-rules.component.html',
  styleUrls: ['./document-rule-tab-rules.component.less']
})
export class DocumentRuleTabRulesComponent extends DocumentRuleBaseComponentPresentational<IRules> implements OnInit {
  formGroupSetup: IFormGroupSetup;
  selectedComplianceDocumentRuleRestrictionTypeId: number;

  @Input() currentDocumentRule: IDocumentRule;

  html: {
    isInclusive: any;
    restrictionItems: Array<RestrictionItem>;
    selectedRestrictionList: Array<any>;
    workerTypeItems: Array<any>;
    taxSubdivisionItems: Array<any>;
    workerEligibilityList: Array<any>;
    lists: {
      selectedItems: Array<number>;
      items: Array<any>;
      listLineOfBusiness: Array<any>;
      listProfileType: Array<any>;
      listInternalOrganizationDefinition1: Array<any>;
      listWorksite: Array<any>;
      listTaxSubdivision: Array<any>;
      listWorkerEligibility: Array<any>;
      complianceDocumentRuleRestrictionType: Array<any>;
      listOrganizationRoleType: Array<any>;
      listClient: Array<any>;
      listInternalOrganization: Array<any>;
      listComplianceDocumentRuleEntityType: Array<any>
    };
  } = {
      isInclusive: true,
      restrictionItems: [],
      selectedRestrictionList: [],
      workerTypeItems: [],
      taxSubdivisionItems: [],
      workerEligibilityList: [],
      lists: {
        selectedItems: [],
        items: [],
        listLineOfBusiness: [],
        listProfileType: [],
        listInternalOrganizationDefinition1: [],
        listWorksite: [],
        listTaxSubdivision: [],
        listWorkerEligibility: [],
        listOrganizationRoleType: [],
        complianceDocumentRuleRestrictionType: [],
        listClient: [],
        listInternalOrganization: [],
        listComplianceDocumentRuleEntityType: []
      }
    };
  document: any;

  private restrictionItem: RestrictionItem[];

  constructor(private documentRuleObservableService: DocumentRuleObservableService, private documentRuleService: DocumentRuleService) {
    super('DocumentRuleTabRulesComponent');
    const mapResult = (items, type, restrictionTypeId) => {
      return items.map((value: any) => {
        return {
          id: value.id,
          text: value.text,
          type: type,
          restrictionTypeId: restrictionTypeId
        };
      });
    };

    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.html.lists.listLineOfBusiness = mapResult(this.codeValueService.getCodeValues(this.codeValueGroups.LineOfBusiness, true), RestrictionSelectorType.Checkbox, this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness);
    this.html.lists.listInternalOrganizationDefinition1 = mapResult(
      this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true),
      RestrictionSelectorType.Dropdown,
      this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1
    );
    this.html.lists.listProfileType = mapResult(
      this.codeValueService.getRelatedCodeValues(this.codeValueGroups.ProfileType, this.phxConstants.UserProfileGroups.UserProfileGroupWorker, this.codeValueGroups.ProfileGroup),
      RestrictionSelectorType.Checkbox,
      this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType
    );

    this.html.lists.listWorksite = mapResult(this.codeValueService.getCodeValues(this.codeValueGroups.Worksite, true), RestrictionSelectorType.Dropdown, this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite);

    this.html.lists.listTaxSubdivision = mapResult(
      this.codeValueService.getRelatedCodeValues(this.codeValueGroups.Subdivision, this.phxConstants.CountryCanada, this.codeValueGroups.Country),
      RestrictionSelectorType.Dropdown,
      this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision
    );

    this.html.lists.listWorkerEligibility = mapResult(
      this.codeValueService.getCodeValues(this.codeValueGroups.WorkerEligibilityType, true),
      RestrictionSelectorType.Checkbox,
      this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility
    );

    this.html.lists.listOrganizationRoleType = mapResult(
      filter(this.codeValueService.getCodeValues(this.codeValueGroups.OrganizationRoleType, true), item => {
        return item.id === this.phxConstants.OrganizationRoleType.IndependentContractor || item.id === this.phxConstants.OrganizationRoleType.SubVendor || item.id === this.phxConstants.OrganizationRoleType.LimitedLiabilityCompany;
      }),
      RestrictionSelectorType.Checkbox,
      this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType
    );
  }

  ngOnInit() {
    this.html.lists.complianceDocumentRuleRestrictionType = this.codeValueService.getCodeValues(this.codeValueGroups.ComplianceDocumentRuleRestrictionType, true);
    // lists.listComplianceDocumentRuleRestrictionType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleRestrictionType);
    this.documentRuleObservableService
      .profileOnRouteChange$(this)
      .takeUntil(this.isDestroyed$)
      .subscribe(document => {
        this.document = document;
        this.getSelectedRestrictionList();
      });
    this.restrictionItem = [
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization).text,
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization).text,
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness).text,
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1).text,
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),

      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType).text,
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType).text,
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite).text,
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision).text,
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility,
        name: this.html.lists.complianceDocumentRuleRestrictionType.find(a => a.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility).text,
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      })
    ];
    this.html.restrictionItems = this.restrictionItem.filter(a => this.filterRestrictionTypes(a, this.currentDocumentRule.ComplianceDocumentRuleEntityTypeId));
    this.getListOrganizationClient();
    this.getListOrganizationInternal();
  }

  updateRestrictionItems(documentForId: number, reset: boolean) {
    this.html.restrictionItems = reset ? [] : this.restrictionItem.filter(a => this.filterRestrictionTypes(a, documentForId));
  }

  businessRules(obj: any) {

    switch (obj.name) {
      case `ComplianceDocumentRuleEntityTypeId`:
        this.updateRestrictionItems(+obj.val, !obj.val ? true : false)
        break;
      default:
        break;
    }

  }

  getCodeValuelistsStatic() { }

  public get requiredSituationsFormArray() {
    return this.inputFormGroup.controls.ComplianceDocumentRuleRequiredSituations as FormArray<IComplianceDocumentRuleRequiredSituation>;
  }

  public get profileVisibilitiesFormArray() {
    return this.inputFormGroup.controls.ComplianceDocumentRuleProfileVisibilities as FormArray<IComplianceDocumentRuleProfileVisibility>;
  }

  tranckByFn(index: number) {
    return index;
  }

  public static formGroupToPartial(documentRule: IDocumentRule, formGroup: FormGroup<IRules>): IRules {
    return {
      ...formGroup.value
    };
  }

  filterRestrictionTypes(restrictionType, documentForId: number) {
    if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType) {
      return (
        documentForId !== null &&
        (documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.Worker || documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder)
      );
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType) {
      return (
        documentForId !== null &&
        (documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.Organization ||
          documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder)
      );
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision) {
      return documentForId !== null && documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.Worker;
    } else if (restrictionType.id === this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility) {
      return (
        documentForId !== null &&
        (documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.Worker || documentForId === this.phxConstants.ComplianceDocumentRuleEntityType.WorkOrder)
      );
    } else {
      return false;
      // common.logError('The Restriction Type '  restrictionType.id  ' is not supported');
    }
  }

  getSelectedRestrictionList() {
    this.html.selectedRestrictionList = map(groupBy(this.inputFormGroup.get('ComplianceDocumentRuleRestrictions').value,
      'ComplianceDocumentRuleRestrictionTypeId'), (value, key) => {
        const id = parseInt(key, 10);
        const codeValue = find(this.html.lists.complianceDocumentRuleRestrictionType, item => {
          return item.id === id;
        });
        return {
          RestrictionTypeId: codeValue.id,
          RestrictionTypeName: codeValue.text,
          RestrictionTypeCode: codeValue.code,
          IsInclusive: value[0].IsInclusive,
          SelectedRestrictions: value
        };
      });
  }
  getListOrganizationClient() {
    const oDataParams = null;
    this.documentRuleService
      .getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.html.lists.listClient = response.Items.map((value: any) => {
          return {
            id: value.Id,
            text: value.DisplayName,
            type: RestrictionSelectorType.Dropdown,
            restrictionTypeId: this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization
          };
        });
      });
  }

  getListOrganizationInternal() {
    this.documentRuleService
      .getListOrganizationInternal()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.html.lists.listInternalOrganization = response.Items.map((value: any) => {
          return {
            id: value.Id,
            text: value.DisplayName,
            type: RestrictionSelectorType.Dropdown,
            restrictionTypeId: this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization
          };
        });
      });
  }

  onClickRestrictionItem(item: RestrictionItem) {
    this.selectedComplianceDocumentRuleRestrictionTypeId = item.id;
    const values = this.inputFormGroup.get('ComplianceDocumentRuleRestrictions').value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id);
    if (values.length) {
      this.html.isInclusive = values[0].IsInclusive;
    } else {
      this.html.isInclusive = true;
    }
    switch (item.id) {
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1: // Branch
        this.html.lists.items = [...this.html.lists.listInternalOrganizationDefinition1];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.BranchId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness:
        this.html.lists.items = [...this.html.lists.listLineOfBusiness];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.LineOfBusinessId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType:
        this.html.lists.items = [...this.html.lists.listProfileType];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.ProfileTypeId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType:
        this.html.lists.items = [...this.html.lists.listOrganizationRoleType];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.OrganizationRoleTypeId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite:
        this.html.lists.items = [...this.html.lists.listWorksite];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.WorksiteId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization:
        this.html.lists.items = [...this.html.lists.listClient];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.ClientOrganizationId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization:
        this.html.lists.items = [...this.html.lists.listInternalOrganization];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.InternalOrganizationId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision:
        this.html.lists.items = [...this.html.lists.listTaxSubdivision];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.TaxSubdivisionId)
        ];
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility:
        this.html.lists.items = [...this.html.lists.listWorkerEligibility];
        this.html.lists.selectedItems = [
          ...this.inputFormGroup
            .get('ComplianceDocumentRuleRestrictions')
            .value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId === item.id)
            .map(a => a.WorkerEligibilityId)
        ];
        break;
    }
  }

  onItemsSelect($event) {
    this.syncRestrictions($event.selectedItems, $event.restirctionItem.id);
    this.outputEvent.emit();
  }

  onCheckBoxValueChange($event) {
    this.outputEvent.emit();
  }

  public get isDocumentForEditable() {

    if ((this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId === this.phxConstants.ComplianceDocumentRuleAreaType.OrganizationClient ||
      this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId === this.phxConstants.ComplianceDocumentRuleAreaType.Assignment) && this.readOnlyStorage.IsEditable) {
      return false;
    } else if (this.currentDocumentRule.IsOriginal && this.readOnlyStorage.IsEditable &&
      this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId === this.phxConstants.ComplianceDocumentRuleAreaType.OrganizationInternal
    ) {
      return true;
    } else if (this.currentDocumentRule.IsOriginal && this.readOnlyStorage.IsEditable) {
      return false;
    } else {
      return this.readOnlyStorage.IsEditable && this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId
        !== this.phxConstants.ComplianceDocumentRuleAreaType.OrganizationInternal;
    }

    // return (((this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId === this.phxConstants.ComplianceDocumentRuleAreaType.OrganizationClient ||
    //   this.currentDocumentRule.ComplianceDocumentRuleAreaTypeId === this.phxConstants.ComplianceDocumentRuleAreaType.Assignment) && this.readOnlyStorage.IsEditable) ||
    //   (this.currentDocumentRule.IsOriginal && this.readOnlyStorage.IsEditable)) ? false : true;
  }

  syncRestrictions(selectedList: Array<IRestrictionItem>, type: number) {
    let restrictionTypePropertyName: string;
    switch (type) {
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganizationDefinition1:
        restrictionTypePropertyName = 'BranchId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.LineOfBusiness:
        restrictionTypePropertyName = 'LineOfBusinessId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerType:
        restrictionTypePropertyName = 'ProfileTypeId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.OrganizationRoleType:
        restrictionTypePropertyName = 'OrganizationRoleTypeId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.Worksite:
        restrictionTypePropertyName = 'WorksiteId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.ClientOrganization:
        restrictionTypePropertyName = 'ClientOrganizationId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.InternalOrganization:
        restrictionTypePropertyName = 'InternalOrganizationId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.TaxSubdivision:
        restrictionTypePropertyName = 'TaxSubdivisionId';
        break;
      case this.phxConstants.ComplianceDocumentRuleRestrictionType.WorkerEligibility:
        restrictionTypePropertyName = 'WorkerEligibilityId';
        break;
      default:
        break;
    }
    const existingList = this.inputFormGroup.get('ComplianceDocumentRuleRestrictions').value.filter(a => a.ComplianceDocumentRuleRestrictionTypeId !== type);
    const getCommissionRestrictionObject = (name, complianceRestrictionTypeId, restrictionTypePropertyValue) => {
      const restriction: Partial<IComplianceDocumentRuleRestriction> = {};
      restriction.Name = name;
      restriction.IsInclusive = this.html.isInclusive;
      restriction.ComplianceDocumentRuleRestrictionTypeId = complianceRestrictionTypeId;
      restriction[restrictionTypePropertyName] = restrictionTypePropertyValue;
      return restriction;
    };
    const complianceRestrictions = selectedList.map(a => {
      const restriction: Partial<IComplianceDocumentRuleRestriction> = getCommissionRestrictionObject(a.text, type, a.id);
      return restriction;
    });
    this.inputFormGroup.setControl('ComplianceDocumentRuleRestrictions', DocumentRuleTabRulesComponent.getFormArray(this.formGroupSetup, <Array<IComplianceDocumentRuleRestriction>>[...existingList, ...complianceRestrictions]));
    this.getSelectedRestrictionList();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, rules: IRules, isWorkorder: boolean): any {
    return formGroupSetup.formBuilder.group({
      ComplianceDocumentRuleEntityTypeId: [rules.ComplianceDocumentRuleEntityTypeId, [Validators.required]],
      ComplianceDocumentRuleRequiredTypeId: [rules.ComplianceDocumentRuleRequiredTypeId, [Validators.required]],
      ComplianceDocumentRuleExpiryTypeId: [rules.ComplianceDocumentRuleExpiryTypeId, [Validators.required]],
      IsRequiredReview: [rules.IsRequiredReview, [Validators.required]],
      ComplianceDocumentRuleRequiredSituations: DocumentRuleTabRulesComponent.getRequiredSituationsFormArray(formGroupSetup,
        rules.ComplianceDocumentRuleRequiredSituations, isWorkorder),
      ComplianceDocumentRuleProfileVisibilities: DocumentRuleTabRulesComponent.getProfileVisibilitiesFormArray(formGroupSetup,
        rules.ComplianceDocumentRuleProfileVisibilities),
      ComplianceDocumentRuleRestrictions: DocumentRuleTabRulesComponent.getFormArray(formGroupSetup, rules.ComplianceDocumentRuleRestrictions)
    });
  }

  public static getRequiredSituationsFormArray(formGroupSetup: IFormGroupSetup,
    requiredSituations: IComplianceDocumentRuleRequiredSituation[], isWorkorder: boolean) {
    if (isWorkorder) {
      return formGroupSetup.formBuilder.array<IComplianceDocumentRuleRequiredSituation>(
        requiredSituations.map((x: IComplianceDocumentRuleRequiredSituation) =>
          formGroupSetup.formBuilder.group<IComplianceDocumentRuleRequiredSituation>({
            Id: [x.Id ? x.Id : 0],
            ComplianceDocumentRuleRequiredSituationTypeId: [x.ComplianceDocumentRuleRequiredSituationTypeId],
            IsSelected: [x.IsSelected]
          })
        ),
        CustomValidators.requiredAtLeastOne('IsSelected',
          formGroupSetup.customFieldService.formatErrorMessage('ComplianceDocumentRuleRequiredSituations', CustomFieldErrorType.required))
      );
    } else {
      return formGroupSetup.formBuilder.array<IComplianceDocumentRuleRequiredSituation>(
        requiredSituations.map((x: IComplianceDocumentRuleRequiredSituation) =>
          formGroupSetup.formBuilder.group<IComplianceDocumentRuleRequiredSituation>({
            Id: [x.Id ? x.Id : 0],
            ComplianceDocumentRuleRequiredSituationTypeId: [x.ComplianceDocumentRuleRequiredSituationTypeId],
            IsSelected: [x.IsSelected]
          })
        )
      );
    }
  }

  public static getProfileVisibilitiesFormArray(formGroupSetup: IFormGroupSetup, profileVisibilities: IComplianceDocumentRuleProfileVisibility[]) {
    return formGroupSetup.formBuilder.array<IComplianceDocumentRuleProfileVisibility>(
      profileVisibilities.map((x: IComplianceDocumentRuleProfileVisibility) =>
        formGroupSetup.formBuilder.group<IComplianceDocumentRuleProfileVisibility>({
          Id: [x.Id ? x.Id : 0],
          ComplianceDocumentRuleProfileVisibilityTypeId: [x.ComplianceDocumentRuleProfileVisibilityTypeId],
          IsSelected: [x.IsSelected]
        })
      )
    );
  }

  public static getFormArray(formGroupSetup: IFormGroupSetup, complianceDocumentRuleRestrictions: IComplianceDocumentRuleRestriction[]) {
    return formGroupSetup.formBuilder.array<IComplianceDocumentRuleRestriction>(
      complianceDocumentRuleRestrictions.map((x: IComplianceDocumentRuleRestriction) =>
        formGroupSetup.formBuilder.group<IComplianceDocumentRuleRestriction>({
          Id: [x.Id ? x.Id : 0],
          Name: [x.Name],
          WorkerEligibilityId: [x.WorkerEligibilityId],
          TaxSubdivisionId: [x.TaxSubdivisionId],
          OrganizationRoleTypeId: [x.OrganizationRoleTypeId],
          WorksiteId: [x.WorksiteId],
          InternalOrganizationId: [x.InternalOrganizationId],
          ProfileTypeId: [x.ProfileTypeId],
          BranchId: [x.BranchId],
          ClientOrganizationId: [x.ClientOrganizationId],
          LineOfBusinessId: [x.LineOfBusinessId],
          IsInclusive: [x.IsInclusive],
          ComplianceDocumentRuleRestrictionTypeId: [x.ComplianceDocumentRuleRestrictionTypeId]
        })
      )
    );
  }

  updateRestriction($event) {
    // this.outputEvent.emit();
  }
}
