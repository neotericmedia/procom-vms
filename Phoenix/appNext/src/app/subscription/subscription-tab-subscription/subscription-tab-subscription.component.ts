import { Component, OnInit, Input, ViewChild, Output } from '@angular/core';
import { IFormGroupSetup, ISubscription, ITabSubscription, IReadOnlyStorage, IAccessSubscriptionRestriction } from '../state';
import { SubscriptionObservableService } from '../state/subscription.observable.service';
import { PhxConstants, ValidationExtensions } from '../../common';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionBaseComponentPresentational } from '../subscription-base-component-presentational';
import { filter } from 'lodash';
import { RestrictionDropdownComponent } from '../../restriction/restriction-dropdown/restriction-dropdown.component';
import { RestrictionItem, RestrictionSelectorType } from '../../restriction/share';
import { IFormGroupValue } from '../../common/utility/form-group';
import { HashModel } from '../../common/utility/hash-model';
import { CustomFieldErrorType } from '../../common/model';


export interface ResctrictionItem {
  id: number;
  text: string;
  type: RestrictionSelectorType;
  restrictionTypeId: PhxConstants.CommissionRateRestrictionType;
}

@Component({
  selector: 'app-subscription-tab-subscription',
  templateUrl: './subscription-tab-subscription.component.html',
  styleUrls: ['./subscription-tab-subscription.component.less']
})

export class SubscriptionTabSubscriptionComponent extends SubscriptionBaseComponentPresentational<ITabSubscription> implements OnInit {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @ViewChild('refDropDown') refDropDown: RestrictionDropdownComponent;
  @Output() isValidDate: boolean;

  html: {
    items: Array<ResctrictionItem>;
    clientOrganizations: Array<ResctrictionItem>;
    InternalUsers: Array<any>;
    listLineOfBusiness: Array<ResctrictionItem>;
    listInternalOrganizationDefinition1: ResctrictionItem[];
    organizationsListInternal: Array<ResctrictionItem>;
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
      clientOrganizations: [],
      organizationsListInternal: [],
      InternalUsers: [],
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

  subscribersList: Array<any> = [];
  subscriptionTypes: Array<any> = [];
  subRestrictionTypes: Array<any> = [];
  branches: Array<any> = [];
  IsDateValid: boolean = null;
  isEditMode: boolean;
  static commonService;
  subscriptionRestrictionsGroups: Array<any> = [];
  constructor(private subscriptionService: SubscriptionService) {
    super('SubscriptionTabSubscriptionComponent');
    this.getCodeValuelistsStatic();
    this.getInternalUsers();
    SubscriptionTabSubscriptionComponent.commonService = this.commonService;
  }

  getCodeValuelistsStatic() {
    this.subscriptionTypes = this.codeValueService.getCodeValues(this.codeValueGroups.AccessSubscriptionType, true);
    this.branches = this.codeValueService.getCodeValues(this.codeValueGroups.InternalOrganizationDefinition1, true);
    this.subRestrictionTypes = this.codeValueService.getCodeValues(this.codeValueGroups.AccessSubscriptionRestrictionType, true);
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<ITabSubscription> = null;
    switch (obj.name) {
      case 'AccessSubscriptionTypeId': {
        value = {
          OrganizationIdClient: null,
          InternalOrganizationDefinition1Id: null,
        };
        this.inputFormGroup.setControl('AccessSubscriptionRestrictions', SubscriptionTabSubscriptionComponent.formBuilderGroupSetupforSubRestrictions(this.formGroupSetup, []));
        this.getRestrictionItems();
      }
        break;
      case 'IsTimeRestricted': {
        if (!obj.val) {
          value = {
            StartDate: null,
            EndDate: null
          };
        }
      }
        break;
      default: {
        value = {
          [obj.name]: obj.val
        };
      }
        break;
    }
    if (value) {
      this.patchValue(this.inputFormGroup, value);
    }
  }

  recalcAccessActions() { }

  recalcLocalProperties() { }

  ngOnInit() {
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    this.isEditMode = this.inputFormGroup.controls.AccessSubscriptionStatusId.value === this.phxConstants.AccessSubscriptionStatus.Draft;
    this.getListOrganizationClient();
    this.getListOrganizationInternal();
    this.getRestrictionItems();
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
  }

  getRestrictionItems() {
    if (this.inputFormGroup.controls.AccessSubscriptionTypeId.value) {
      this.html.restrictionItems = [
        new RestrictionItem({
          id: PhxConstants.CommissionRateRestrictionType.InternalOrganization,
          name: 'Internal Company',
          restrcitionSelectorType: RestrictionSelectorType.Dropdown
        }),
      ];
      if (this.inputFormGroup.controls.AccessSubscriptionTypeId.value !== this.phxConstants.AccessSubscriptionType.Client) {
        const item = new RestrictionItem({
          id: PhxConstants.CommissionRateRestrictionType.ClientOrganization,
          name: 'Client Company',
          restrcitionSelectorType: RestrictionSelectorType.Dropdown
        });
        this.html.restrictionItems.push(item);
      }

      this.html.restrictionItems.push(
        new RestrictionItem({
          id: PhxConstants.CommissionRateRestrictionType.LineOfBusiness,
          name: 'Line Of Business',
          restrcitionSelectorType: RestrictionSelectorType.Checkbox
        }),
      );

      if (this.inputFormGroup.controls.AccessSubscriptionTypeId.value !== this.phxConstants.AccessSubscriptionType.Branch) {
        const item = new RestrictionItem({
          id: PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1,
          name: 'Branch',
          restrcitionSelectorType: RestrictionSelectorType.Checkbox
        });
        this.html.restrictionItems.push(item);
      }
    } else {
      this.html.restrictionItems = [];
    }
  }

  public get restrictionsControls() {
    return this.inputFormGroup.controls.AccessSubscriptionRestrictions as FormArray<IAccessSubscriptionRestriction>;
  }

  onClickRestrictionItem(item: RestrictionItem) {
    if (+item.id === PhxConstants.CommissionRateRestrictionType.ClientOrganization) {
      this.html.items = this.html.clientOrganizations;
    } else if (+item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganization) {
      this.html.items = this.html.organizationsListInternal;
    } else if (+item.id === PhxConstants.CommissionRateRestrictionType.LineOfBusiness) {
      this.html.items = this.html.listLineOfBusiness;
    } else if (+item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
      this.html.items = this.html.listInternalOrganizationDefinition1;
    }

    if (item.id === PhxConstants.CommissionRateRestrictionType.ClientOrganization) {
      this.html.selectedItems = this.inputFormGroup
        .get('AccessSubscriptionRestrictions')
        .value.filter(a => a.AccessSubscriptionRestrictionTypeId === +item.id)
        .map(a => +a.OrganizationIdClient);
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganization) {
      this.html.selectedItems = this.inputFormGroup
        .get('AccessSubscriptionRestrictions')
        .value.filter(a => a.AccessSubscriptionRestrictionTypeId === +item.id)
        .map(a => +a.OrganizationIdInternal);
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.LineOfBusiness) {
      this.html.selectedItems = this.inputFormGroup
        .get('AccessSubscriptionRestrictions')
        .value.filter(a => a.AccessSubscriptionRestrictionTypeId === +item.id)
        .map(a => +a.LineOfBusinessId);
    } else if (item.id === PhxConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
      this.html.selectedItems = this.inputFormGroup
        .get('AccessSubscriptionRestrictions')
        .value.filter(a => a.AccessSubscriptionRestrictionTypeId === +item.id)
        .map(a => +a.InternalOrganizationDefinition1Id);
    }
  }

  addRestriction($event) {
    const value = this.html.restrictionItems.find(i => i.id === $event.AccessSubscriptionRestrictionTypeId);
    this.onClickRestrictionItem(value);
    this.refDropDown.itemClick(value);
  }

  onItemsSelect($event) {
    this.syncRestrictions($event.selectedItems, $event.restirctionItem.id);
    this.outputEvent.emit();
  }

  syncRestrictions(selectedList: Array<ResctrictionItem>, type: number) {
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
    const existingList = this.inputFormGroup.get('AccessSubscriptionRestrictions').value.filter(a => a.AccessSubscriptionRestrictionTypeId !== type);
    const getSubscriptionRestrictionObject = (name, subscriptionRateRestrictionTypeId, restrictionTypePropertyValue) => {
      const restriction: Partial<IAccessSubscriptionRestriction> = {};
      restriction.Name = name;
      restriction.AccessSubscriptionRestrictionTypeId = subscriptionRateRestrictionTypeId;
      restriction[restrictionTypePropertyName] = restrictionTypePropertyValue;
      return restriction;
    };
    const subscriptionRestrictions = selectedList.map(a => {
      const restriction: Partial<IAccessSubscriptionRestriction> = getSubscriptionRestrictionObject(a.text, type, a.id);
      return restriction;
    });
    this.inputFormGroup.setControl('AccessSubscriptionRestrictions', SubscriptionTabSubscriptionComponent.formBuilderGroupSetupforSubRestrictions(this.formGroupSetup, [...existingList, ...subscriptionRestrictions]));
  }

  getRestrictionItemById(id: number) {
    if (!this.html.items) {
      return;
    }
    return this.html.items.find(x => x.id === id);
  }

  trackByFn(index: number) {
    return index;
  }

  getInternalUsers() {
    const internalDataParams = oreq.request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'ProfileStatusId', 'Contact/FullName']).url();
    this.subscriptionService.getListUserProfileInternal(internalDataParams).takeUntil(this.isDestroyed$).subscribe((response: any) => {
      if (response) {
        let items = response.Items;
        items = filter(items, item => item.ProfileStatusId === PhxConstants.ProfileStatus.Active ||
          item.ProfileStatusId === PhxConstants.ProfileStatus.PendingChange
        );
        this.html.InternalUsers = items;
      }
    });
  }

  subscriberChanged(subscriber: any) {
    if (this.subscribersList.length > 0) {
      this.html.InternalUsers.push(this.subscribersList[0]);
    }
    this.subscribersList = [];
    this.subscribersList.push(subscriber);
    const newVal = Number(subscriber.value);
    const name = this.html.InternalUsers.find(x => x.Id === newVal);
    if (name) {
      this.subscribersList.push(name);
    }
    this.inputFormGroup.controls.UserProfileSubscriber.setValue(name ? name.Contact.FullName : null);
  }

  getListInternalUsers() {
    return this.html.InternalUsers;
  }

  getListOrganizationClient() {
    this.subscriptionService.getListOrganizationClient(null).subscribe((result: any) => {
      this.html.clientOrganizations = result.Items;
      this.html.clientOrganizations = this.html.clientOrganizations.map((value: any) => {
        return {
          id: value.Id,
          text: value.DisplayName,
          type: RestrictionSelectorType.Dropdown,
          restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.ClientOrganization
        };
      });
      this.html.clientOrganizations = this.html.clientOrganizations.sort();
    });
  }

  getListOrganizationInternal() {
    this.subscriptionService.getListOrganizationInternal(null).subscribe((result: any) => {
      this.html.organizationsListInternal = result.Items;
      this.html.organizationsListInternal = this.html.organizationsListInternal.map((value: any) => {
        return {
          id: value.Id,
          text: value.DisplayName,
          type: RestrictionSelectorType.Dropdown,
          restrictionTypeId: this.phxConstants.CommissionRateRestrictionType.InternalOrganization
        };
      });
      this.html.organizationsListInternal = this.html.organizationsListInternal.sort();
      return this.html.organizationsListInternal;
    });
  }

  datePickerCallback() {
    if (this.inputFormGroup.controls.StartDate.value && this.inputFormGroup.controls.EndDate.value) {
      if (this.inputFormGroup.controls.EndDate.value < this.inputFormGroup.controls.StartDate.value) {
        this.commonService.logWarning('End Date must be greater than or equal to Start Date');
      }
    }
  }

  static validateDates(control) {
    let IsDateValid = null;
    if (control.controls.StartDate.value && control.controls.EndDate.value) {
      if (control.controls.EndDate.value < control.controls.StartDate.value) {
        IsDateValid = false;
      } else {
        IsDateValid = true;
      }
    }
    return IsDateValid;
  }


  fnAccessSubscriptionRestrictions(controls: any, value: any) {
    return controls.value.filter(i => i.AccessSubscriptionRestrictionTypeId === value);
  }

  filterGroupBySubscriptionRestrictionTypeId(restrictionArray: any) {
    this.subscriptionRestrictionsGroups = [];
    const data = restrictionArray.map((restriction) => {
      const isNew = this.subscriptionRestrictionsGroups.indexOf(restriction.AccessSubscriptionRestrictionTypeId) === -1;
      if (isNew) {
        this.subscriptionRestrictionsGroups.push(restriction.AccessSubscriptionRestrictionTypeId);
        return restriction;
      }
    });
    return data.filter(a => a);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup,
    subscription: ISubscription, profileObservableService: SubscriptionObservableService): FormGroup<ITabSubscription> {
    const dateValidator = (control) => {
      const valid = subscription.IsTimeRestricted ? this.validateDates(control) : null;
      if (!valid && valid != null) {
        control.get('EndDate').setErrors({
          message: 'End Date must be greater than or equal to Start Date'
        });
      } else {
        return null;
      }
    };
    const formGroup: FormGroup<ITabSubscription> = formGroupSetup.formBuilder.group<ITabSubscription>({
      Id: [subscription.Id],
      AccessSubscriptionStatusId: [subscription.AccessSubscriptionStatusId],
      AccessSubscriptionTypeId: [
        subscription.AccessSubscriptionTypeId,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AccessSubscriptionTypeId', CustomFieldErrorType.required))
        ]
      ],
      ChildAccessSubscriptionStatusId: [subscription.ChildAccessSubscriptionStatusId],
      StartDate: [
        subscription.StartDate,
        subscription.IsTimeRestricted ?
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('StartDate', CustomFieldErrorType.required))
          ] : null
      ],
      EndDate: [subscription.EndDate,
      subscription.IsTimeRestricted ?
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('EndDate', CustomFieldErrorType.required))
        ] : null
      ],
      UserProfileIdSubscriber: [
        subscription.UserProfileIdSubscriber,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('UserProfileIdSubscriber', CustomFieldErrorType.required))
        ]
      ],
      UserProfileSubscriber: [subscription.UserProfileSubscriber],
      IsTimeRestricted: [
        subscription.IsTimeRestricted,
        [
          ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsTimeRestricted', CustomFieldErrorType.required))
        ]
      ],
      OrganizationIdClient: [
        subscription.OrganizationIdClient,
        subscription.AccessSubscriptionTypeId === PhxConstants.AccessSubscriptionType.Client ?
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('OrganizationIdClient', CustomFieldErrorType.required))
          ] : null
      ],
      InternalOrganizationDefinition1Id: [
        subscription.InternalOrganizationDefinition1Id,
        subscription.AccessSubscriptionTypeId === PhxConstants.AccessSubscriptionType.Branch ?
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('InternalOrganizationDefinition1Id', CustomFieldErrorType.required))
          ] : null
      ],
      AccessSubscriptionRestrictions: SubscriptionTabSubscriptionComponent.formBuilderGroupSetupforSubRestrictions(formGroupSetup, subscription.AccessSubscriptionRestrictions),
    }, {
        validator: dateValidator
      });
    return formGroup;
  }

  public static formBuilderGroupSetupforSubRestrictions(formGroupSetup: IFormGroupSetup,
    subaccessRestrictions: Array<IAccessSubscriptionRestriction>): FormArray<IAccessSubscriptionRestriction> {
    if (!subaccessRestrictions) {
      return formGroupSetup.formBuilder.array<IAccessSubscriptionRestriction>([]);
    }
    const formArray = formGroupSetup.formBuilder.array<IAccessSubscriptionRestriction>(
      subaccessRestrictions.map((restriction: IAccessSubscriptionRestriction, index) => {
        return formGroupSetup.hashModel.getFormGroup<IAccessSubscriptionRestriction>(formGroupSetup.toUseHashCode, 'IAccessSubscriptionRestriction', restriction, index, () =>
          formGroupSetup.formBuilder.group<IAccessSubscriptionRestriction>({
            Id: [restriction.Id ? restriction.Id : 0],
            AccessSubscriptionId: [restriction.AccessSubscriptionId ? restriction.AccessSubscriptionId : 0],
            AccessSubscriptionRestrictionTypeId: [
              restriction.AccessSubscriptionRestrictionTypeId],
            CreatedByProfileId: [restriction.CreatedByProfileId],
            IsDraft: [restriction.IsDraft],
            LastModifiedByProfileId: [restriction.LastModifiedByProfileId],
            Name: [restriction.Name],
            OrganizationClient: [restriction.OrganizationClient],
            OrganizationIdClient: [restriction.OrganizationIdClient],
            OrganizationIdInternal: [restriction.OrganizationIdInternal],
            LineOfBusinessId: [restriction.LineOfBusinessId],
            InternalOrganizationDefinition1Id: [restriction.InternalOrganizationDefinition1Id]
          })
        );
      }
      )
    );
    return formArray;
  }

  public static formGroupToPartial(subscription: ISubscription, formGroupSubscription: FormGroup<ITabSubscription>): ISubscription {
    const subscriptionDetails: ITabSubscription = formGroupSubscription.value;
    subscription.Id = subscriptionDetails.Id;
    subscription.UserProfileIdSubscriber = subscriptionDetails.UserProfileIdSubscriber;
    subscription.UserProfileSubscriber = subscriptionDetails.UserProfileSubscriber;
    subscription.StartDate = subscriptionDetails.StartDate;
    subscription.EndDate = subscriptionDetails.EndDate;
    subscription.IsTimeRestricted = subscriptionDetails.IsTimeRestricted;
    subscription.AccessSubscriptionTypeId = subscriptionDetails.AccessSubscriptionTypeId;
    subscription.OrganizationIdClient = subscriptionDetails.OrganizationIdClient;
    subscription.InternalOrganizationDefinition1Id = subscriptionDetails.InternalOrganizationDefinition1Id;
    subscription.AccessSubscriptionRestrictions = subscriptionDetails.AccessSubscriptionRestrictions;
    return subscription;
  }
}
