import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, NavigationService, PhxConstants } from './../../common/index';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { IReadOnlyStorage, ITabDetailsDetail, IFormGroupSetup, ITabDetailsAddresses, IOrganizationCollaborators, IQuickAddOrgRoot, IQuickAddOrganization, IOrganizationTaxNumbers } from './../state/organization.interface';

import { OrganizationDetailsComponent } from '../organization-details/organization-details.component';
import { OrganizationObservableService } from '../state/organization.observable.service';
import { CustomFieldService } from '../../common';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { HashModel } from '../../common/utility/hash-model';
import { OrganizationAddressComponent } from '../organization-address/organization-address.component';
import { OrganizationPrimaryContactComponent } from '../organization-primary-contact/organization-primary-contact.component';
import { OrganizationCollaboratorsComponent } from '../organization-collaborators/organization-collaborators.component';
import { OrganizationRoleDetailComponent } from '../organization-role-detail/organization-role-detail.component';
import { OrganizationApiService } from './../organization.api.service';
import { OrganizationSalesTaxComponent } from '../organization-sales-tax/organization-sales-tax.component';

export interface IOrganizationQuickAddRouterState {
  organizationId: number;
}

@Component({
  selector: 'app-organization-quick-add',
  templateUrl: './organization-quick-add.component.html',
  styleUrls: ['./organization-quick-add.component.less']
})
export class OrganizationQuickAddComponent extends BaseComponentActionContainer implements OnInit {
  rootFormGroup: FormGroup<IQuickAddOrgRoot>;
  isQuickAdd: boolean = true;
  readOnlyStorage: IReadOnlyStorage = {
    IsEditable: true,
    IsComplianceDraftStatus: false,
    IsDebugMode: true,
    AccessActions: null
  };
  organization: any;
  formGroupSetup: IFormGroupSetup;
  validationMessages: Array<string> = [];

  constructor(
    private navigationService: NavigationService,
    private fb: FormBuilder,
    private customFieldService: CustomFieldService,
    private organizationObservableService: OrganizationObservableService,
    private router: Router,
    private organizationApiService: OrganizationApiService,
    private commonService: CommonService
  ) {
    super();
    this.formGroupSetup = { hashModel: new HashModel(), toUseHashCode: true, formBuilder: this.fb, customFieldService: this.customFieldService };
  }

  ngOnInit() {
    this.navigationService.setTitle('organization-quick-add');

    this.organization = {
      OrganizationStatusId: PhxConstants.OrganizationStatus.New,
      Code: '',
      LegalName: null,
      DisplayName: null,
      IndustryTypeId: null,
      SectorTypeId: null,
      CountryId: 124,
      DefaultTaxSubdivisionId: null,
      ParentOrganizationId: null,
      ParentOrganization: {
        Name: ''
      },
      CreatedByName: '',
      AssignedToUserProfileId: null,
      OrganizationAddresses: [
        {
          Id: 0,
          IsPrimary: true,
          AddressDescription: 'Head Office',
          CityName: '',
          AddressLine1: '',
          AddressLine2: '',
          CountryId: 124,
          SubdivisionId: null,
          PostalCode: ''
        }
      ],
      OrganizationIndependentContractorRoles: [
        {
          Id: 0,
          OrganizationRoleStatusId: PhxConstants.OrganizationRoleStatusType.Active,
          NotificationEmail: '',
          IsNonResident: null,
          PaymentMethods: [
            {
              PaymentMethodTypeId: PhxConstants.PaymentMethodType.Cheque,
              IsSelected: true,
              IsPreferred: true
            }
          ],
          NotificationEmails: [
            {
              NotificationEmail: ''
            }
          ]
        }
      ],
      OrganizationTaxNumbers: [
        {
          SalesTaxId: null,
          SalesTaxNumber: null,
          OrganizationId: 0,
          Id: 0
        }
      ],
      Contact: {
        ContactId: 0,
        Email: null,
        PersonTitleId: null,
        FirstName: null,
        LastName: null,
        PhoneTypeId: null,
        PhoneNumber: null,
        PhoneExtension: ''
      },
      IsDraftStatus: true,
      AreComplianceFieldsEditable: false,
      AreComplianceFieldsRequired: false,
      SubvendorPaymentMethodTypeId: 1,
      OrganizationIndependentContractorPaymentMethodTypeId: 1,
      OrganizationLimitedLiabilityPaymentMethodTypeId: 1,
      OrganizationInternalRoles: null,
      OrganizationClientRoles: null,
      SourceId: null,
      EditorUserProfileName: null
    };

    this.onInitOrganization(this.organization);
  }

  onInitOrganization(organization: IQuickAddOrganization) {
    this.formBuilderGroupSetup(this.formGroupSetup, organization, this.organizationObservableService);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organization: IQuickAddOrganization, organizationObservableService: OrganizationObservableService) {
    this.rootFormGroup = this.formGroupDetail(formGroupSetup, organization, organizationObservableService);
  }

  formGroupDetail(formGroupSetup: IFormGroupSetup, organization: IQuickAddOrganization, organizationObservableService: OrganizationObservableService) {
    const organizationDetails: ITabDetailsDetail = {
      isFromParentOrgList: true,
      OrganizationId: organization.Id,
      LegalName: organization.LegalName,
      Code: organization.Code,
      DisplayName: organization.DisplayName,
      IndustryTypeId: organization.IndustryTypeId,
      SectorTypeId: organization.SectorTypeId,
      CountryId: organization.CountryId,
      DefaultTaxSubdivisionId: organization.DefaultTaxSubdivisionId,
      ParentOrganizationId: organization.ParentOrganizationId ? organization.ParentOrganizationId : 0,
      ParentOrganization: organization.ParentOrganization !== null && organization.ParentOrganization.Id === null && organization.ParentOrganization.Name === null ? null : organization.ParentOrganization,
      parentOrganizationName: organization.ParentOrganization.Name ? organization.ParentOrganization.Name : null
    };

    const organizationCollaborators: IOrganizationCollaborators = {
      AssignedToUserProfileId: organization.AssignedToUserProfileId,
      CreatedByName: organization.CreatedByName,
      SourceId: organization.SourceId,
      EditorUserProfileName: organization.EditorUserProfileName
    };

    const formGroup: FormGroup<IQuickAddOrgRoot> = formGroupSetup.formBuilder.group<IQuickAddOrgRoot>({
      OrgDetails: OrganizationDetailsComponent.formBuilderGroupSetup(formGroupSetup, organizationDetails, organizationObservableService),
      OrganizationAddressesDetails: formGroupSetup.formBuilder.group<ITabDetailsAddresses>({
        OrganizationAddresses: OrganizationAddressComponent.formBuilderGroupSetup(formGroupSetup, organization.OrganizationAddresses)
      }),
      OrganizationContact: OrganizationPrimaryContactComponent.formBuilderGroupSetup(formGroupSetup, organization.Contact),
      OrganizationCollaborators: OrganizationCollaboratorsComponent.formBuilderGroupSetup(formGroupSetup, organizationCollaborators),
      OrganizationRole: OrganizationRoleDetailComponent.formBuilderGroupSetup(formGroupSetup, organization.OrganizationIndependentContractorRoles[0]),
      OrganizationTaxNumbers: formGroupSetup.formBuilder.group<IOrganizationTaxNumbers>({
        SalesTax: OrganizationSalesTaxComponent.formBuilderGroupSetup(formGroupSetup, organization.OrganizationTaxNumbers),
        SelectedType: [organization.OrganizationTaxNumbers]
      })
    });

    return formGroup;
  }

  onClickCancel() {
    this.router.navigate(['/next', 'organization', 'search']);
  }

  onClickSave() {
    this.updateModelFromRootFormGroup(this.rootFormGroup);
    this.organizationApiService.organizationNewOnQuickAdd(this.organization).subscribe(
      response => {
        if (response.EntityId) {
          this.commonService.logSuccess('Organization Created');
          this.router.navigate(['/next', 'organization', response.EntityId, 'details']);
        }
      },
      error => {
        const validationMessages = this.commonService.parseResponseError(error);
        if (validationMessages.length > 0) {
          validationMessages.forEach(element => {
            this.validationMessages.push(element.Message);
          });
        }
      }
    );
  }

  updateModelFromRootFormGroup(formGroup: FormGroup<IQuickAddOrgRoot>) {
    Object.assign(this.organization, {
      ...formGroup.value.OrgDetails,
      ...formGroup.value.OrganizationAddressesDetails,
      Contact: { ...formGroup.value.OrganizationContact },
      ...formGroup.value.OrganizationCollaborators,
      OrganizationIndependentContractorRoles: [
        {
          ...formGroup.value.OrganizationRole,
          NotificationEmail: formGroup.value.OrganizationRole.NotificationEmails.map(i => i.Email).join(';')
        }
      ],
      OrganizationTaxNumbers: [...formGroup.value.OrganizationTaxNumbers.SalesTax]
    });
  }

  onOutputEvent(event) {}
}
