// angular
import { Component, OnInit, OnDestroy, ViewChild, Input, ViewEncapsulation } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants } from '../../common/index';
import { AccessAction } from './../../common/model/access-action';
import { FunctionalRole } from '../../common/model/index';
import { IFormGroupValue } from '../../common/utility/form-group';
import { filter } from 'lodash';
// organization
import { IOrganization, IOrganizationSubVendorRole, IOrganizationSubVendorRoleRestriction } from './../state/organization.interface';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { OrganizationApiService } from '../organization.api.service';
import { RestrictionItem, RestrictionSelectorType } from '../../restriction/share';
import { RestrictionDropdownComponent } from '../../restriction/restriction-dropdown/restriction-dropdown.component';
import { concat, difference } from 'lodash';
import { organizationReducer } from '../state';

@Component({
  selector: 'app-organization-role-restrictions',
  templateUrl: './organization-role-restrictions.component.html',
  styleUrls: ['./organization-role-restrictions.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class OrganizationRoleRestrictionsComponent extends OrganizationBaseComponentPresentational<IOrganizationSubVendorRole> implements OnInit, OnDestroy {
  roleType: PhxConstants.OrganizationRoleType = PhxConstants.OrganizationRoleType.SubVendor;
  @ViewChild('refDropDown') refDropDown: RestrictionDropdownComponent;
  @Input() rootModel: IOrganization;

  html: {
    codeValueGroups: any;
    isAlive: boolean;
    isClientLoadedOnce: boolean;
    isClientLoadComplete: boolean;
    isInternalLoadComplete: boolean;
    functionalRoles: FunctionalRole[];
    phxConstants: typeof PhxConstants;
    roleDisplayName: string;
    showAddModifyRestrictionType: boolean;
    internalCompanyRestrictionsList: Array<number>;
    clientCompanyRestrictionsList: Array<number>;
    items: Array<{ id: number; text: string; type: RestrictionSelectorType }>;
    restrictionItems: Array<RestrictionItem>;
    selectedItems: Array<number>;
  } = {
    isAlive: true,
    isClientLoadedOnce: false,
    isClientLoadComplete: false,
    isInternalLoadComplete: false,
    functionalRoles: [],
    internalCompanyRestrictionsList: [],
    clientCompanyRestrictionsList: [],
    codeValueGroups: null,
    phxConstants: null,
    roleDisplayName: null,
    showAddModifyRestrictionType: false,
    items: [],
    restrictionItems: [],
    selectedItems: []
  };

  public get canUpdateItemsName() {
    return this.html.isClientLoadComplete && this.html.isInternalLoadComplete;
  }

  public get internalCompanyRestrictions() {
    return (<FormArray<IOrganizationSubVendorRoleRestriction>>this.inputFormGroup.controls.OrganizationSubVendorRoleRestrictions).value.filter(
      x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization
    );
  }

  public get clientCompanyRestrictions() {
    return (<FormArray<IOrganizationSubVendorRoleRestriction>>this.inputFormGroup.controls.OrganizationSubVendorRoleRestrictions).value.filter(
      x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization
    );
  }

  constructor(private orgService: OrganizationApiService) {
    super('OrganizationRoleRestrictionsComponent');
    this.html.isAlive = true;
    this.html.roleDisplayName = this.codeValueService.getCodeValueText(this.roleType, this.commonService.CodeValueGroups.OrganizationRoleType);
    this.getCodeValuelistsStatic();
    this.html.isClientLoadComplete = false;
    this.html.isInternalLoadComplete = false;
  }

  public get restrictionsControls() {
    return this.inputFormGroup.controls.OrganizationSubVendorRoleRestrictions as FormArray<IOrganizationSubVendorRoleRestriction>;
  }

  ngOnInit() {
    this.html.showAddModifyRestrictionType = this.readOnlyStorage.IsEditable;
    this.html.isClientLoadedOnce = false;

    this.html.restrictionItems = [
      new RestrictionItem({
        id: 0,
        name: 'Client Organization',
        restrcitionSelectorType: RestrictionSelectorType.Checkbox
      }),
      new RestrictionItem({
        id: 1,
        name: 'Internal Organization',
        restrcitionSelectorType: RestrictionSelectorType.Dropdown
      })
    ];

    this.html.clientCompanyRestrictionsList = this.inputFormGroup.value.OrganizationSubVendorRoleRestrictions.filter(
      x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization
    ).map(x => x.OrganizationIdClient);

    this.html.internalCompanyRestrictionsList = this.inputFormGroup.value.OrganizationSubVendorRoleRestrictions.filter(
      x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization
    ).map(x => x.OrganizationIdInternal);

    setInterval(() => {
      if (this.canUpdateItemsName) {
        for (let index = 0; index < this.restrictionsControls.length; index++) {
          let item: { id: number; text: string; type: RestrictionSelectorType };

          if (this.restrictionsControls.at(index).get('OrganizationSubVendorRoleRestrictionTypeId').value === this.phxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization) {
            item = this.getRestrictionItemById(this.restrictionsControls.at(index).get('OrganizationIdClient').value);
          } else {
            item = this.getRestrictionItemById(this.restrictionsControls.at(index).get('OrganizationIdInternal').value);
          }

          this.restrictionsControls
            .at(index)
            .get('Name')
            .setValue(item ? item.text : '');
        }

        this.html.isClientLoadComplete = false;
        this.html.isInternalLoadComplete = false;
      }
    }, 1000);
  }

  getListOrganizationClient() {
    if (this.html.isClientLoadedOnce) {
      return;
    }
    this.orgService
      .getListOrganizationClient1()
      .takeWhile(() => this.html.isAlive)
      .subscribe((response: any) => {
        if (response.Items.length > 0) {
          this.html.items = concat(
            response.Items.map((value: any) => {
              return {
                id: value.Id,
                text: value.DisplayName,
                type: RestrictionSelectorType.Checkbox
              };
            }),
            this.html.items
          );
          this.html.isClientLoadedOnce = true;
          this.html.isClientLoadComplete = true;
        }
      });
  }

  public get areComplianceFieldsRequired() {
    return this.rootModel.ReadOnlyStorage.IsComplianceDraftStatus;
  }

  getInternalOrganization() {
    this.orgService
      .getListOrganizationInternal()
      .takeWhile(() => this.html.isAlive)
      .subscribe((response: any) => {
        if (response.length > 0) {
          this.html.items = concat(
            response.map((value: any) => {
              return {
                id: value.Id,
                text: value.DisplayName,
                type: RestrictionSelectorType.Dropdown
              };
            })
          );
          this.html.isInternalLoadComplete = true;
        }
      });
  }

  public getCodeValuelistsStatic() {
    this.getListOrganizationClient();
    this.getInternalOrganization();
  }

  public recalcAccessActions(isEditable: boolean, accessActions: AccessAction[]) {}

  public recalcLocalProperties(inputFormGroup: FormGroup<IOrganizationSubVendorRole>) {}

  public businessRules(obj: IFormGroupValue): void {}

  onClickLinkRestrictionItem(item: number) {
    if (item === RestrictionSelectorType.Checkbox) {
      this.html.selectedItems = this.html.internalCompanyRestrictionsList;
    } else {
      this.html.selectedItems = this.html.clientCompanyRestrictionsList;
    }

    this.refDropDown.openRestrictionSelector(item);
  }

  onClickRestrictionItem(item: RestrictionItem) {
    if (item.restrcitionSelectorType === RestrictionSelectorType.Checkbox) {
      this.html.selectedItems = this.html.clientCompanyRestrictionsList;
    } else {
      this.html.selectedItems = this.html.internalCompanyRestrictionsList;
    }
  }

  onItemsSelect($event) {
    if ($event.restirctionItem.id === 0) {
      this.html.clientCompanyRestrictionsList = $event.selectedItems.map(x => x.id);
      this.syncClientCompanyRestrictions();
    } else {
      this.html.internalCompanyRestrictionsList = $event.selectedItems.map(x => x.id);
      this.syncInternalCompanyRestrictions();
    }

    this.outputEvent.emit();
  }

  syncClientCompanyRestrictions() {
    const selClients = this.inputFormGroup.controls.OrganizationSubVendorRoleRestrictions.value.filter(x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization);

    const newClients = difference(this.html.clientCompanyRestrictionsList, selClients.map(x => x.Id));

    const len = this.restrictionsControls.length;

    for (let i = 0; i < len; i++) {
      if (!this.restrictionsControls.at(i)) {
        continue;
      }

      if (
        !this.html.clientCompanyRestrictionsList.includes(this.restrictionsControls.at(i).value.Id) &&
        this.restrictionsControls.at(i).value.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization
      ) {
        this.restrictionsControls.removeAt(i);
      }
    }

    newClients.forEach(resClient => {
      const res = this.getRestrictionItemById(resClient);
      this.restrictionsControls.push(
        this.formBuilder.group<IOrganizationSubVendorRoleRestriction>({
          Id: [res.id],
          Name: [res.text],
          OrganizationSubVendorRoleRestrictionTypeId: [PhxConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization],
          disabled: [false],
          OrganizationIdClient: [res.id],
          OrganizationIdInternal: [null],
          OrganizationSubVendorRoleId: [this.inputFormGroup.value.Id]
        })
      );
    });
  }

  syncInternalCompanyRestrictions() {
    const selInternal = this.inputFormGroup.controls.OrganizationSubVendorRoleRestrictions.value.filter(x => x.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization);

    const newInternal = difference(this.html.internalCompanyRestrictionsList, selInternal.map(x => x.Id));

    const len = this.restrictionsControls.length;

    for (let i = 0; i < len; i++) {
      if (!this.restrictionsControls.at(i)) {
        continue;
      }

      if (
        !this.html.internalCompanyRestrictionsList.includes(this.restrictionsControls.at(i).value.Id) &&
        this.restrictionsControls.at(i).value.OrganizationSubVendorRoleRestrictionTypeId === PhxConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization
      ) {
        this.restrictionsControls.removeAt(i);
      }
    }

    newInternal.forEach(resInternal => {
      const res = this.getRestrictionItemById(resInternal);
      this.restrictionsControls.push(
        this.formBuilder.group<IOrganizationSubVendorRoleRestriction>({
          Id: [res.id],
          Name: [res.text],
          OrganizationSubVendorRoleRestrictionTypeId: [PhxConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization],
          disabled: [false],
          OrganizationIdClient: [null],
          OrganizationIdInternal: [res.id],
          OrganizationSubVendorRoleId: [this.inputFormGroup.value.Id]
        })
      );
    });
  }

  getRestrictionItemById(id: number) {
    if (!this.html.items) {
      return;
    }

    return this.html.items.find(x => x.id === id);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }
}
