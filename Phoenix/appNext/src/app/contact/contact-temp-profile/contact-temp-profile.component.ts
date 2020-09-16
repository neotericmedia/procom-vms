import { CustomFieldErrorType } from './../../common/model/custom-field-error-type';
import { ValidationExtensions } from './../../common/components/phx-form-control/validation.extensions';
import { Component, OnInit, Input } from '@angular/core';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { IFormGroupSetup, IProfile, ITempProfile, IPaymentMethod } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { AuthService } from '../../common/services/auth.service';
import { ContactProfilePaymentMethodsComponent } from '../contact-profile-payment-methods/contact-profile-payment-methods.component';
import { CodeValueService } from '../../common';
import { ContactProfileBenefitSetupComponent } from '../contact-profile-benefit-setup/contact-profile-benefit-setup.component';
import { ContactProfileWorkerEligibilityComponent } from '../contact-profile-worker-eligibility/contact-profile-worker-eligibility.component';
import { ContactPayrollSetupComponent } from '../contact-payroll-setup/contact-payroll-setup.component';
import { ActivatedRoute } from '@angular/router';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-temp-profile',
  templateUrl: './contact-temp-profile.component.html',
  styleUrls: ['./contact-temp-profile.component.less']
})
export class ContactTempProfileComponent extends ContactProfilesPresentationalBase<ITempProfile> implements OnInit {
  @Input() triggerComplianceDocumentRefresh: string;
  public getCodeValuelistsStatic() {}

  public businessRules(obj: IFormGroupValue): void {
    if (obj.name === 'TaxSubdivisionId') {
      ContactPayrollSetupComponent.taxSubdivisionChanged(this.inputFormGroup);
    }
  }

  constructor(private pos: ProfileObservableService,
    private auth: AuthService,
    private activatedRout: ActivatedRoute) {
    super('ContactTempProfileComponent', pos, auth, activatedRout);
  }

  ngOnInit() {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<ITempProfile> {
    let paymentMethodFormGroup: FormGroup<IPaymentMethod> = null;

    if (model.UserProfilePaymentMethods === null || model.UserProfilePaymentMethods === undefined) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else if (model.UserProfilePaymentMethods.length === 0) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, model, codeValueService, codeValueGroups);
    }

    const formGroup = formGroupSetup.formBuilder.group<ITempProfile>({
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      SIN: [model.SIN, [ValidationExtensions.minLength(9), ValidationExtensions.maxLength(9), ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SIN', CustomFieldErrorType.required))]],
      ...paymentMethodFormGroup.controls,
      DateOfBirth: [model.DateOfBirth, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DateOfBirth', CustomFieldErrorType.required))]],
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ...ContactProfileBenefitSetupComponent.formBuilderGroupSetup(formGroupSetup, model).controls,
      ...ContactProfileWorkerEligibilityComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactPayrollSetupComponent.formBuilderGroupSetup(formGroupSetup, model, model.AreComplianceFieldsEditable).controls,
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<ITempProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

  public get refLink() {
    return `#/next/contacts/${this.stateParams.contactId}/profile/${this.stateParams.profileType}/${this.stateParams.profileId}`;
  }

  onComplianceDocumentOutput($event) {}

  onOutputEvent() {
    this.outputEvent.emit();
  }

  datePickerCallback() {
    if (this.inputFormGroup.value.DateOfBirth && new Date(this.inputFormGroup.value.DateOfBirth).getFullYear() > 0) {
      const age = this.commonService.calculateAge(this.inputFormGroup.value.DateOfBirth, new Date().toDateString());

      if (age < 0) {
        this.commonService.logWarning('The chosen date is in the future');
      } else if (age < 16) {
        this.commonService.logWarning('The worker is younger than 16 years old');
      } else if (age > 65) {
        this.commonService.logWarning('The worker is older than 65 years old');
      }
    }
  }
}
