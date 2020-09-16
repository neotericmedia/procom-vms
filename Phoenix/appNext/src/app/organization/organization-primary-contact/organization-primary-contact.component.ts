import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CodeValue, AccessAction, CustomFieldErrorType } from '../../common/model';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { IPrimaryContact, IFormGroupSetup } from '../state';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions } from '../../common';
import { FloatBetweenInputDirective } from '../../common/directives/floatBetweenInput.directive';
import { Validators } from '../../../../node_modules/@angular/forms';

interface IHtml {
  codeValueLists: {
    listPhoneType: Array<CodeValue>;
    listPersonType: Array<CodeValue>;
  };
}

@Component({
  selector: 'app-organization-primary-contact',
  templateUrl: './organization-primary-contact.component.html',
  styleUrls: ['./organization-primary-contact.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationPrimaryContactComponent extends OrganizationBaseComponentPresentational<IPrimaryContact> {

  @ViewChild(FloatBetweenInputDirective) directive;
  html: IHtml = {
    codeValueLists: {
      listPhoneType: [],
      listPersonType: []
    }
  };

  constructor() {
    super('OrganizationPrimaryContactComponent');
    this.getCodeValuelistsStatic();
  }

  getCodeValuelistsStatic() {
    this.html.codeValueLists.listPhoneType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.ProfilePhoneType, true);
    this.html.codeValueLists.listPersonType = this.codeValueService.getCodeValues(this.commonService.CodeValueGroups.PersonTitle, true);
  }

  businessRules(obj: IFormGroupValue): void {
  }

  recalcLocalProperties(organizationFormGroup: FormGroup<IPrimaryContact>) {
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
  }

  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    organizationContact: IPrimaryContact
  ): FormGroup<IPrimaryContact> {

    return formGroupSetup.hashModel.getFormGroup<IPrimaryContact>(formGroupSetup.toUseHashCode, 'IPrimaryContact', organizationContact, 0, () =>
      formGroupSetup.formBuilder.group<IPrimaryContact>({
        ContactId: [organizationContact.ContactId ? organizationContact.ContactId : 0],
        Email: [
          organizationContact.Email,
          [
            Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('Email', CustomFieldErrorType.required))
          ]
        ],
        PersonTitleId: [organizationContact.PersonTitleId ? organizationContact.PersonTitleId : null],
        FirstName: [
          organizationContact.FirstName,
          [
            ValidationExtensions.maxLength(32),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('FirstName', CustomFieldErrorType.required))
          ]
        ],
        LastName: [
          organizationContact.LastName,
          [
            ValidationExtensions.maxLength(32),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('LastName', CustomFieldErrorType.required))
          ]
        ],
        PhoneTypeId: [
          organizationContact.PhoneTypeId ? organizationContact.PhoneTypeId : null,
          [
            Validators.required
          ]
        ],
        PhoneNumber: [
          organizationContact.PhoneNumber,
          [
            ValidationExtensions.minLength(10),
            ValidationExtensions.maxLength(20),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PhoneNumber', CustomFieldErrorType.required))
          ],
        ],
        PhoneExtension: [
          organizationContact.PhoneExtension,
          [
            ValidationExtensions.maxLength(3)
          ]
        ]
      })
    );
  }
}
