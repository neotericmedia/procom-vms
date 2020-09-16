import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { CodeValue, CustomFieldErrorType, AccessAction } from '../../common/model';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ValidationExtensions } from '../../common';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IUserProfilePhone, IFormGroupOnNew, IFormGroupSetup, IContactInfo, IProfile } from '../state/profile.interface';

@Component({
  selector: 'app-contact-phonenumber',
  templateUrl: './contact-phonenumber.component.html',
  styleUrls: ['./contact-phonenumber.component.less']
})
export class ContactPhonenumberComponent extends ContactBaseComponentPresentational<IUserProfilePhone> {
  @Input() addressIndex: number;
  @Input() isQuickAdd: boolean;
  mask: any;
  html: {
    codeValueGroups: any;
    codeValueLists: {
      listProfilePhoneType: Array<CodeValue>;
    };
    commonLists: {};
  } = {
    codeValueGroups: null,
    codeValueLists: {
      listProfilePhoneType: []
    },
    commonLists: {}
  };

  constructor() {
    super('ContactPhonenumberComponent');
    this.getCodeValuelistsStatic();
  }

  businessRules(obj: IFormGroupValue): void {
    let value: Partial<IUserProfilePhone> = null;
    switch (obj.name) {
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
    this.html.codeValueLists.listProfilePhoneType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.ProfilePhoneType, true);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, contactPhonenumbers: Array<IUserProfilePhone>): FormArray<IUserProfilePhone> {
    const ex = formGroupSetup.formBuilder.array<IUserProfilePhone>(
      contactPhonenumbers.map((PhoneNo: IUserProfilePhone, index) =>
        formGroupSetup.formBuilder.group<IUserProfilePhone>({
          Id: [PhoneNo.Id],
          SourceId: [PhoneNo.SourceId],
          UserProfileId: [PhoneNo.UserProfileId],
          ProfilePhoneTypeId: [PhoneNo.ProfilePhoneTypeId, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('ProfilePhoneTypeId', CustomFieldErrorType.required))]],
          Phone: [PhoneNo.Phone, [ValidationExtensions.minLength(3), ValidationExtensions.maxLength(128), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Phone', CustomFieldErrorType.required))]],
          Extension: [PhoneNo.Extension, [ValidationExtensions.maxLength(9)]],
          IsDraft: [PhoneNo.IsDraft],
          CreatedByProfileId: [PhoneNo.CreatedByProfileId],
          CreatedDatetime: [PhoneNo.CreatedDatetime],
          LastModifiedByProfileId: [PhoneNo.LastModifiedByProfileId],
          LastModifiedDatetime: [PhoneNo.LastModifiedDatetime]
        })
      )
    );
    return ex;
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew): FormGroup<IUserProfilePhone> {
    return formGroupOnNew.formBuilder.group<IUserProfilePhone>({
      Id: [0],
      ProfilePhoneTypeId: [null, [ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('ProfilePhoneTypeId', CustomFieldErrorType.required))]],
      Phone: [
        null,
        [
          ValidationExtensions.required(formGroupOnNew.customFieldService.formatErrorMessage('Phone', CustomFieldErrorType.required))
          // ValidationExtensions.pattern('[0-9]{0-10}')
        ]
      ],
      Extension: [null],
      CreatedByProfileId: [0],
      CreatedDatetime: [null],
      IsDraft: [true],
      LastModifiedByProfileId: [0],
      LastModifiedDatetime: [null],
      SourceId: [0],
      UserProfileId: [0]
    });
  }

  onClickDeletePhoneNumber() {
    const formArrayPhonenumbers: FormArray<IUserProfilePhone> = <FormArray<IUserProfilePhone>>this.inputFormGroup.parent;
    formArrayPhonenumbers.removeAt(this.addressIndex);
    this.outputEvent.emit();
  }

  public static formGroupToPartial(formGroupUserProfilePhones: FormGroup<IContactInfo>): Partial<IProfile> {
    const userProfilePhones: Array<IUserProfilePhone> = formGroupUserProfilePhones.controls.UserProfilePhones.value;
    return { UserProfilePhones: userProfilePhones };
  }

  checkPhone(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
