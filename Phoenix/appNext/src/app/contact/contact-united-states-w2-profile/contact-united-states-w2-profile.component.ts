import { Component, OnInit, Input } from '@angular/core';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { IFormGroupSetup, IProfile, IW2WorkerProfile, IPaymentMethod } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { AuthService } from '../../common/services/auth.service';
import { ContactProfilePaymentMethodsComponent } from '../contact-profile-payment-methods/contact-profile-payment-methods.component';
import { CodeValueService, ValidationExtensions } from '../../common';
import { ContactProfileBenefitSetupComponent } from '../contact-profile-benefit-setup/contact-profile-benefit-setup.component';
import { ActivatedRoute } from '@angular/router';
import { ContactProfileWorkerEligibilityComponent } from '../contact-profile-worker-eligibility/contact-profile-worker-eligibility.component';
import { CustomFieldErrorType } from '../../common/model';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-united-states-w2-profile',
  templateUrl: './contact-united-states-w2-profile.component.html',
  styleUrls: ['./contact-united-states-w2-profile.component.less']
})
export class ContactUnitedStatesW2ProfileComponent extends ContactProfilesPresentationalBase<IW2WorkerProfile> implements OnInit {
  @Input() triggerComplianceDocumentRefresh: string;

  public getCodeValuelistsStatic() {}

  public businessRules(obj: IFormGroupValue): void {}

  constructor(private pos: ProfileObservableService, private auth: AuthService, private activatedRout: ActivatedRoute) {
    super('ContactUnitedStatesW2ProfileComponent', pos, auth, activatedRout);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  ngOnInit() {}

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<IW2WorkerProfile> {
    let paymentMethodFormGroup: FormGroup<IPaymentMethod> = null;

    if (model.UserProfilePaymentMethods === null || model.UserProfilePaymentMethods === undefined) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else if (model.UserProfilePaymentMethods.length === 0) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, model, codeValueService, codeValueGroups);
    }

    const formGroup = formGroupSetup.formBuilder.group<IW2WorkerProfile>({
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      SSN: [model.SSN, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('SSN', CustomFieldErrorType.required))]],
      DateOfBirth: [model.DateOfBirth, [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('DateOfBirth', CustomFieldErrorType.required))]],
      ...ContactProfileWorkerEligibilityComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...paymentMethodFormGroup.controls,
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ...ContactProfileBenefitSetupComponent.formBuilderGroupSetup(formGroupSetup, model).controls,
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IW2WorkerProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

  public get refLink() {
    return `#/next/contacts/${this.stateParams.contactId}/profile/${this.stateParams.profileType}/${this.stateParams.profileId}`;
  }

  onComplianceDocumentOutput($event) {}

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
