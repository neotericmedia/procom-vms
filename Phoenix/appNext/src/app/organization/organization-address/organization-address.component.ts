// angular
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// common
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType, AccessAction } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions } from '../../common';
// organization
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IOrganizationAddress, IFormGroupOnNew, IFormGroupSetup, IRoot, IOrganization, ITabDetailsAddresses } from '../state/organization.interface';

@Component({
  selector: 'app-organization-address',
  templateUrl: './organization-address.component.html',
  styleUrls: ['./organization-address.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationAddressComponent extends OrganizationBaseComponentPresentational<IOrganizationAddress> {
  @Input() addressIndex: number;
  @Input() isQuickAdd: boolean;
  mask: any;
  html: {
    codeValueGroups: any;
    parentOrganizationNameFromList: boolean;
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listSubdivision: Array<CodeValue>;
    };
    commonLists: {};
  } = {
      codeValueGroups: null,
      parentOrganizationNameFromList: false,
      codeValueLists: {
        listCountry: [],
        listSubdivision: []
      },
      commonLists: {}
    };

  constructor() {
    super('OrganizationAddressComponent');
    this.getCodeValuelistsStatic();
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IOrganizationAddress> = null;
    switch (obj.name) {
      case 'CountryId':
        {
          value = {
            CountryId: obj.val,
            SubdivisionId: null,
            PostalCode: null
          };
        }
        break;
      default:
        {
          value = {
            [obj.name]: obj.val
          };
        }
        break;
    }
    this.patchValue(this.inputFormGroup, value);
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
  }

  recalcLocalProperties(addressFormGroup: FormGroup<IOrganizationAddress>) {
    const getListSubdivision = (countryId: number) => {
      if (countryId > 0) {
        return this.codeValueService.getRelatedCodeValues(this.commonService.CodeValueGroups.Subdivision, countryId, this.commonService.CodeValueGroups.Country).sort((a, b) => {
          if (a.text < b.text) {
            return -1;
          }
          if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
      } else {
        return [];
      }
    };

    if (addressFormGroup.value && addressFormGroup.controls.CountryId.value > 0) {
      this.html.codeValueLists.listSubdivision = getListSubdivision(addressFormGroup.value && addressFormGroup.controls.CountryId.value);
    }
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
    // this.html.access.organizationClientRoleEditNationalAccountManager = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationClientRoleEditNationalAccountManager);
    // this.html.access.organizationClientRoleEditAlternateBill = isEditable && this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.OrganizationClientRoleEditAlternateBill);
  }

  onClickDeleteAddress() {
    const formArrayOrganizationAddresses: FormArray<IOrganizationAddress> = <FormArray<IOrganizationAddress>>this.inputFormGroup.parent;
    formArrayOrganizationAddresses.removeAt(this.addressIndex);
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, organizationAddresses: Array<IOrganizationAddress>): FormArray<IOrganizationAddress> {
    const ex = formGroupSetup.formBuilder.array<IOrganizationAddress>(
      organizationAddresses.map((address: IOrganizationAddress, index) =>
        formGroupSetup.hashModel.getFormGroup<IOrganizationAddress>(formGroupSetup.toUseHashCode, 'IOrganizationAddress', address, index, () =>
          formGroupSetup.formBuilder.group<IOrganizationAddress>({
            Id: [address.Id],
            AddressDescription: [
              address.AddressDescription,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(128),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AddressDescription', CustomFieldErrorType.required))
              ]
            ],
            IsPrimary: [index === 0, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsPrimary', CustomFieldErrorType.required))]],
            AddressLine1: [
              address.AddressLine1,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(50),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('AddressLine1', CustomFieldErrorType.required))
              ]
            ],
            AddressLine2: [
              address.AddressLine2,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(128)
              ]
            ],
            CityName: [
              address.CityName,
              [
                ValidationExtensions.minLength(3),
                ValidationExtensions.maxLength(128),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CityName', CustomFieldErrorType.required))
              ]
            ],
            CountryId: [address.CountryId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))]],
            SubdivisionId: [address.SubdivisionId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SubdivisionId', CustomFieldErrorType.required))]],
            PostalCode: [
              address.PostalCode,
              [
                ValidationExtensions.minLength(5),
                ValidationExtensions.maxLength(128),
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PostalCode', CustomFieldErrorType.required))
              ]
            ]
          })
        )
      )
    );

    const adressFg = ex.at(0) as FormGroup<IOrganizationAddress>;
    if (adressFg.value.AddressDescription !== 'Head Office') {
      adressFg.controls.AddressDescription.setValue('Head Office');
    }

    return ex;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, organizationAddresses: Array<IOrganizationAddress>): FormGroup<IOrganizationAddress> {
    return formGroupOnNew.formBuilder.group<IOrganizationAddress>({
      Id: [0],
      AddressDescription: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('AddressDescription', CustomFieldErrorType.required))
        ]
      ],
      IsPrimary: [organizationAddresses.length === 0, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('IsPrimary', CustomFieldErrorType.required))]],
      AddressLine1: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(50),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('AddressLine1', CustomFieldErrorType.required))
        ]
      ],
      AddressLine2: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('AddressLine2', CustomFieldErrorType.required))
        ]
      ],
      CityName: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('CityName', CustomFieldErrorType.required))
        ]
      ],
      CountryId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))]],
      SubdivisionId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('SubdivisionId', CustomFieldErrorType.required))]],
      PostalCode: [
        null,
        [
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('PostalCode', CustomFieldErrorType.required))
        ]
      ]
    });
  }

  public static formGroupToPartial(formGroupOrganizationAddresses: FormGroup<ITabDetailsAddresses>): Partial<IOrganization> {
    const organizationAddresses: Array<IOrganizationAddress> = formGroupOrganizationAddresses.controls.OrganizationAddresses.value;
    return { OrganizationAddresses: organizationAddresses };
  }
}
