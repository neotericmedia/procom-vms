import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType, AccessAction, PhxConstants } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions } from '../../common';

import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';

import { IUserProfileAddress, IFormGroupOnNew, IFormGroupSetup, IProfile, IContact, IContactInfo, IOrganization } from '../state/profile.interface';

@Component({
  selector: 'app-contact-address',
  templateUrl: './contact-address.component.html',
  styleUrls: ['./contact-address.component.less']
})
export class ContactAddressComponent extends ContactBaseComponentPresentational<IUserProfileAddress> {

  @Input() addressIndex: number;
  @Input() isQuickAdd: boolean;

  static defaultCountry: number = PhxConstants.Country.CA;
  static defaultState: number = 600;
  mask: any;
  html: {
    codeValueGroups: any;
    codeValueLists: {
      listCountry: Array<CodeValue>;
      listSubdivision: Array<CodeValue>;
      listProfileAddressType: Array<CodeValue>;
    };
    commonLists: {};
  } = {
      codeValueGroups: null,
      codeValueLists: {
        listCountry: [],
        listSubdivision: [],
        listProfileAddressType: []
      },
      commonLists: {}
    };


  constructor() {
    super('ContactAddressComponent');
    this.getCodeValuelistsStatic();
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IUserProfileAddress> = null;
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

  onOutputEvent() {
    this.outputEvent.emit();
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listCountry = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.Country, true);
    this.html.codeValueLists.listProfileAddressType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.ProfileAddressType, true);
  }

  recalcLocalProperties(addressFormGroup: FormGroup<IUserProfileAddress>) {
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

  onClickDeleteAddress() {
    const formArrayOrganizationAddresses: FormArray<IUserProfileAddress> = <FormArray<IUserProfileAddress>>this.inputFormGroup.parent;
    formArrayOrganizationAddresses.removeAt(this.addressIndex);
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, contactAddresses: Array<IUserProfileAddress>): FormArray<IUserProfileAddress> {
    const ex = formGroupSetup.formBuilder.array<IUserProfileAddress>(
      contactAddresses.map((address: IUserProfileAddress, index) =>
        formGroupSetup.formBuilder.group<IUserProfileAddress>({
          Id: [address.Id],
          ProfileAddressTypeId: [
            address.ProfileAddressTypeId,
            [
              ValidationExtensions.minLength(3),
              ValidationExtensions.maxLength(128),
              ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ProfileAddressTypeId', CustomFieldErrorType.required))
            ]
          ],
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
          ],
          CreatedByProfileId: [address.CreatedByProfileId],
          CreatedDatetime: [address.CreatedDatetime],
          IsDraft: [address.IsDraft],
          LastModifiedByProfileId: [address.LastModifiedByProfileId],
          LastModifiedDatetime: [address.LastModifiedDatetime],
          SourceId: [address.SourceId],
          UserProfileId: [address.UserProfileId]
        })
      )
    );
    return ex;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, contactAddresses: Array<IUserProfileAddress>): FormGroup<IUserProfileAddress> {
    return formGroupOnNew.formBuilder.group<IUserProfileAddress>({
      Id: [0],
      ProfileAddressTypeId: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('AddressDescription', CustomFieldErrorType.required))
        ]
      ],
      AddressLine1: [
        null,
        [
          ValidationExtensions.minLength(3),
          ValidationExtensions.maxLength(50)
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
      CountryId: [this.defaultCountry, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('CountryId', CustomFieldErrorType.required))]],
      SubdivisionId: [this.defaultState, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('SubdivisionId', CustomFieldErrorType.required))]],
      PostalCode: [
        null,
        [
          ValidationExtensions.maxLength(128),
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('PostalCode', CustomFieldErrorType.required))
        ]
      ],
      CreatedByProfileId: [0],
      CreatedDatetime: [null],
      IsDraft: [true],
      LastModifiedByProfileId: [0],
      LastModifiedDatetime: [null],
      SourceId: [0],
      UserProfileId: [0]
    });
  }

  public static formGroupToPartial(formGroupUserProfileAddresses: FormGroup<IContactInfo>): Partial<IProfile> {
    const userProfileAddresses: Array<IUserProfileAddress> = formGroupUserProfileAddresses.controls.UserProfileAddresses.value;
    return { UserProfileAddresses: userProfileAddresses };
  }

}
