// angular
import { Component, OnInit, ViewChild, SimpleChanges, Input } from '@angular/core';
import { groupBy, values } from 'lodash';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants } from '../../common';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { StateService } from '../../common/state/service/state.service';
import { CustomFieldErrorType, StateAction } from '../../common/model';
import { ValidationExtensions } from '../../common';
// commission rate
import { CommissionRateBaseComponentPresentational } from '../commission-rate-base-component-presentational';
import { ITabDetails, IFormGroupSetup, ICommissionRate, ICommissionRateRestriction, ICommissionRateVersion, IRestrictionItem } from '../state';
import { RestrictionItem, RestrictionSelectorType } from '../../restriction/share';
import { RestrictionDropdownComponent } from '../../restriction/restriction-dropdown/restriction-dropdown.component';
import { CommissionService } from '../commission.service';
import { CommissionRateObservableService } from '../state/commission-rate.observable.service';
import { HashModel } from '../../common/utility/hash-model';

@Component({
  selector: 'app-commission-rate-tab-details',
  templateUrl: './commission-rate-tab-details.component.html'
})
export class CommissionRateTabDetailsComponent extends CommissionRateBaseComponentPresentational<ITabDetails> implements OnInit {
  @ViewChild('refDropDown') refDropDown: RestrictionDropdownComponent;
  phxConstants: typeof PhxConstants = null;
  html: {
    items: Array<RestrictionItem>;
    clientItems: Array<RestrictionItem>;
    internalItems: Array<RestrictionItem>;
    listLineOfBusiness: Array<any>;
    listInternalOrganizationDefinition1: any[];
    selectedItems: number[];
    isClientLoadedOnce: boolean;
    restrictionItems: RestrictionItem[];
    lists: {
      scheduledChangeRateApplication: Array<any>;
      commissionRateRestrictionTypeList: Array<any>;
    };
  } = {
      listLineOfBusiness: [],
      listInternalOrganizationDefinition1: [],
      clientItems: [],
      internalItems: [],
      isClientLoadedOnce: false,
      items: [],
      selectedItems: [],
      restrictionItems: [],
      lists: {
        scheduledChangeRateApplication: [],
        commissionRateRestrictionTypeList: []
      }
    };
  formGroupSetup: IFormGroupSetup;
  customStatusId: number;
  routerParams: any;
  commmissionVersionId: number;
  filteredVersionDetails: Array<ICommissionRateVersion> = [];
  @Input() commissionRateHeaderId: number;
  @Input() commissionRateRestrictionsValidionMessage: string;
  @Input() stateAction: StateAction;
  commissionRate: ICommissionRate;
  unitsFilter: any = { from: 0, to: 100, decimalplaces: 4 };

  constructor(
    private commissionService: CommissionService,
    private stateService: StateService,
    private commissionObservable: CommissionRateObservableService
  ) {
    super('CommissionRateTabDetailsComponent');
    this.phxConstants = PhxConstants;
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
  }

  ngOnInit() {
    this.stateService.selectOnAction(getRouterState).subscribe((routerStateResult: IRouterState) => {
      this.routerParams = routerStateResult.params;
      this.commmissionVersionId = this.routerParams.commissionRateVersionId;
    });
    this.commissionObservable.commissionRateOnRouteChange$(this).subscribe((Result: any) => {
      if (Result) {
        this.commissionRate = Result;
        this.filteredVersionDetails = this.commissionRate.CommissionRateVersions.filter(item => item.Id === +this.commmissionVersionId);
        this.customStatusId = this.filteredVersionDetails[0].customStatusId;
        if (this.filteredVersionDetails[0].customStatusId) {
        }
      }
    });
    this.html.lists.scheduledChangeRateApplication = this.codeValueService.getCodeValues(this.codeValueGroups.ScheduledChangeRateApplication, true);
    this.html.lists.commissionRateRestrictionTypeList = this.codeValueService.getCodeValues(this.codeValueGroups.CommissionRateRestrictionType, true);
    this.html.listLineOfBusiness = this.codeValueService.getCodeValues(this.codeValueGroups.LineOfBusiness, true).map((value: any) => {
      return {
        id: value.id,
        text: value.text,
        type: RestrictionSelectorType.Checkbox,
        restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.LineOfBusiness
      };
    });
    this.html.listInternalOrganizationDefinition1 = this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true).map((value: any) => {
      return {
        id: value.id,
        text: value.text,
        type: RestrictionSelectorType.Checkbox,
        restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1
      };
    });
    this.html.restrictionItems = [
      new RestrictionItem({
        id: PhxConstants.CommissionRateRestrictionType.ClientOrganization,
        name: 'Client Organization',
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: PhxConstants.CommissionRateRestrictionType.InternalOrganization,
        name: 'Internal Organization',
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      }),
      new RestrictionItem({
        id: PhxConstants.CommissionRateRestrictionType.LineOfBusiness,
        name: ' Line Of Business',
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      }),
      new RestrictionItem({
        id: PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1,
        name: 'Branch',
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      })
    ];
    this.getListOrganizationClient();
    this.getListOrganizationInternal();
  }

  additionalOnChanges(changes: SimpleChanges) {
    if (changes.commissionRateHeaderId && changes.commissionRateHeaderId.currentValue) {
      this.commissionRateHeaderId = Number(changes.commissionRateHeaderId.currentValue);
    }
    if (changes.commissionRateRestrictionsValidionMessage && changes.commissionRateRestrictionsValidionMessage.currentValue) {
      this.commissionRateRestrictionsValidionMessage = changes.commissionRateRestrictionsValidionMessage.currentValue;
    }
  }

  getGroupedRestrictions(commissionRateRestrictions: ICommissionRateRestriction) {
    const group = groupBy(commissionRateRestrictions, 'CommissionRateRestrictionTypeId');
    return values(group);
  }

  getListOrganizationClient() {
    this.commissionService
      .getListOrganizationClient1()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.html.clientItems = response.Items.map((value: any) => {
          return {
            id: value.Id,
            text: value.DisplayName,
            type: RestrictionSelectorType.Dropdown,
            restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.ClientOrganization
          };
        });
      });
  }

  getListOrganizationInternal() {
    this.commissionService
      .getListOrganizationInternal()
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        if (response && response.length) {
          this.html.internalItems = response.map((value: any) => {
            return {
              id: value.Id,
              text: value.DisplayName,
              type: RestrictionSelectorType.Dropdown,
              restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.InternalOrganization
            };
          });
        }
      });
  }

  businessRules(obj: any) { }

  onClickRestrictionItem(item: RestrictionItem) {
    if (item.id === PhxConstants.CommissionRateRestrictionType.ClientOrganization) {
      this.html.items = [...this.html.clientItems];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganization) {
      this.html.items = [...this.html.internalItems];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.LineOfBusiness) {
      this.html.items = [...this.html.listLineOfBusiness];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
      this.html.items = [...this.html.listInternalOrganizationDefinition1];
    }
    if (item.id === PhxConstants.CommissionRateRestrictionType.ClientOrganization) {
      this.html.selectedItems = [...this.inputFormGroup
        .get('CommissionRateRestrictions')
        .value.filter(a => a.CommissionRateRestrictionTypeId === +item.id)
        .map(a => +a.OrganizationIdClient)];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganization) {
      this.html.selectedItems = [...this.inputFormGroup
        .get('CommissionRateRestrictions')
        .value.filter(a => a.CommissionRateRestrictionTypeId === +item.id)
        .map(a => +a.OrganizationIdInternal)];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.LineOfBusiness) {
      this.html.selectedItems = [...this.inputFormGroup
        .get('CommissionRateRestrictions')
        .value.filter(a => a.CommissionRateRestrictionTypeId === +item.id)
        .map(a => +a.LineOfBusinessId)];
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
      this.html.selectedItems = [...this.inputFormGroup
        .get('CommissionRateRestrictions')
        .value.filter(a => a.CommissionRateRestrictionTypeId === +item.id)
        .map(a => +a.InternalOrganizationDefinition1Id)];
    }
  }

  onItemsSelect($event) {
    this.syncRestrictions($event.selectedItems, $event.restirctionItem.id);
    this.outputEvent.emit();
  }

  public get restrictionsControls() {
    return this.inputFormGroup.controls.CommissionRateRestrictions as FormArray<ICommissionRateRestriction>;
  }

  syncRestrictions(selectedList: Array<IRestrictionItem>, type: number) {
    let restrictionTypePropertyName: string;
    switch (type) {
      case this.phxConstants.CommissionRateRestrictionType.ClientOrganization:
        restrictionTypePropertyName = 'OrganizationIdClient';
        break;
      case this.phxConstants.CommissionRateRestrictionType.InternalOrganization:
        restrictionTypePropertyName = 'OrganizationIdInternal';
        break;
      case this.phxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1:
        restrictionTypePropertyName = 'InternalOrganizationDefinition1Id';
        break;
      case this.phxConstants.CommissionRateRestrictionType.LineOfBusiness:
        restrictionTypePropertyName = 'LineOfBusinessId';
        break;
      default:
        break;
    }
    const existingList = this.inputFormGroup.get('CommissionRateRestrictions').value.filter(a => a.CommissionRateRestrictionTypeId !== type);
    const getCommissionRestrictionObject = (name, commissionRateRestrictionTypeId, restrictionTypePropertyValue) => {
      const restriction: Partial<ICommissionRateRestriction> = {};
      restriction.Name = name;
      restriction.CommissionRateRestrictionTypeId = commissionRateRestrictionTypeId;
      restriction.CommissionRateHeaderId = this.commissionRate.Id;
      restriction[restrictionTypePropertyName] = restrictionTypePropertyValue;
      return restriction;
    };
    const commissionRestrictions = selectedList.map(a => {
      const restriction: Partial<ICommissionRateRestriction> = getCommissionRestrictionObject(a.text, type, a.id);
      return restriction;
    });
    this.inputFormGroup.setControl('CommissionRateRestrictions', CommissionRateTabDetailsComponent.getCommissionRestrictionFormArray(this.formGroupSetup, <Array<ICommissionRateRestriction>>[...existingList, ...commissionRestrictions]));
  }

  getRestrictionItemById(id: number) {
    if (!this.html.items) {
      return;
    }
    return this.html.items.find(x => x.id === id);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, commissionRate: ICommissionRate, versionId: number = 0): FormGroup<ITabDetails> {
    const currentVersion = commissionRate.CommissionRateVersions.find(a => a.Id === +versionId);
    const formGroup: FormGroup<ITabDetails> = formGroupSetup.formBuilder.group<ITabDetails>({
      EffectiveDate: [currentVersion.EffectiveDate,
        [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EffectiveDate', CustomFieldErrorType.required))]
      ],
      Description: [commissionRate.Description, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Description', CustomFieldErrorType.required))]],
      ScheduledChangeRateApplicationId: [currentVersion.ScheduledChangeRateApplicationId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ScheduledChangeRate', CustomFieldErrorType.required))]],
      Percentage: [currentVersion.Percentage, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Percentage', CustomFieldErrorType.required))]],
      CommissionRateRestrictions: this.getCommissionRestrictionFormArray(formGroupSetup, commissionRate.CommissionRateRestrictions)
    });
    return formGroup;
  }

  public static getCommissionRestrictionFormArray(formGroupSetup: IFormGroupSetup, commissionRateRestrictions: Array<ICommissionRateRestriction>) {
    const formArray = formGroupSetup.formBuilder.array<ICommissionRateRestriction>(commissionRateRestrictions.map(commissionRateRestriction => this.getComissionRestrictionFormGroup(formGroupSetup, commissionRateRestriction)));
    return formArray;
  }

  public static getComissionRestrictionFormGroup(formGroupSetup: IFormGroupSetup, commissionRateRestriction: ICommissionRateRestriction) {
    return formGroupSetup.formBuilder.group<ICommissionRateRestriction>({
      Id: [commissionRateRestriction.Id ? commissionRateRestriction.Id : 0],
      CommissionRateHeaderId: [commissionRateRestriction.CommissionRateHeaderId],
      CommissionRateRestrictionTypeId: [commissionRateRestriction.CommissionRateRestrictionTypeId],
      Name: [commissionRateRestriction.Name],
      OrganizationIdInternal: [commissionRateRestriction.OrganizationIdInternal],
      OrganizationIdClient: [commissionRateRestriction.OrganizationIdClient],
      LineOfBusinessId: [commissionRateRestriction.LineOfBusinessId],
      InternalOrganizationDefinition1Id: [commissionRateRestriction.InternalOrganizationDefinition1Id]
    });
  }

  public static formGroupToPartial(commissionRate: ICommissionRate, formGroupTabDetail: FormGroup<ITabDetails>, versionId: number): ICommissionRate {
    const details: ITabDetails = formGroupTabDetail.value;
    const index = commissionRate.CommissionRateVersions.findIndex(a => a.Id === Number(versionId));
    commissionRate.CommissionRateVersions[index].EffectiveDate = details.EffectiveDate;
    commissionRate.Description = details.Description;
    commissionRate.CommissionRateVersions[index].ScheduledChangeRateApplicationId = details.ScheduledChangeRateApplicationId;
    commissionRate.CommissionRateVersions[index].Percentage = details.Percentage;
    commissionRate.CommissionRateRestrictions = details.CommissionRateRestrictions;
    return commissionRate;
  }
}
