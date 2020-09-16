import { Component, OnInit, Input } from '@angular/core';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { IFormGroupSetup, IProfile, ICanadianSPProfile, IPaymentMethod } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { AuthService } from '../../common/services/auth.service';
import { ContactProfilePaymentMethodsComponent } from '../contact-profile-payment-methods/contact-profile-payment-methods.component';
import { CodeValueService, ValidationExtensions } from '../../common';
import { ContactProfileWorkerEligibilityComponent } from '../contact-profile-worker-eligibility/contact-profile-worker-eligibility.component';
import { ContactPayrollSetupComponent } from '../contact-payroll-setup/contact-payroll-setup.component';
import { ActivatedRoute } from '@angular/router';
import { ContactSalesTaxComponent } from '../contact-sales-tax/contact-sales-tax.component';
import { ContactT4AFormEligibilityComponent } from '../contact-t4a-form-eligibility/contact-t4a-form-eligibility.component';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '@angular/forms';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-canadian-sp-profile',
  templateUrl: './contact-canadian-sp-profile.component.html',
  styleUrls: ['./contact-canadian-sp-profile.component.less']
})
export class ContactCanadianSpProfileComponent extends ContactProfilesPresentationalBase<ICanadianSPProfile> implements OnInit {
  @Input() triggerComplianceDocumentRefresh: string;


  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue) {
    if (obj.name === 'TaxSubdivisionId') {
      ContactPayrollSetupComponent.taxSubdivisionChanged(this.inputFormGroup);
    }
  }

  constructor(private pos: ProfileObservableService, private auth: AuthService, private activatedRout: ActivatedRoute) {
    super('ContactCanadianSpProfileComponent', pos, auth, activatedRout);
  }

  ngOnInit() {}

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<ICanadianSPProfile> {
    let paymentMethodFormGroup: FormGroup<IPaymentMethod> = null;

    if (model.UserProfilePaymentMethods === null || model.UserProfilePaymentMethods === undefined) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else if (model.UserProfilePaymentMethods.length === 0) {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupsNew(formGroupSetup, codeValueService, codeValueGroups, model);
    } else {
      paymentMethodFormGroup = ContactProfilePaymentMethodsComponent.paymentMethodsFormGroupSetup(formGroupSetup, model, codeValueService, codeValueGroups);
    }

    const formGroup = formGroupSetup.formBuilder.group<ICanadianSPProfile>({
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      SIN: [model.SIN, [Validators.minLength(9), Validators.maxLength(9), Validators.required]],
      CorporationName: [model.CorporationName, [Validators.maxLength(250)]],
      BusinessNumber: [model.BusinessNumber, [Validators.maxLength(250)]],
      DateOfBirth: [model.DateOfBirth, [Validators.required]],
      ...paymentMethodFormGroup.controls,
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ...ContactProfileWorkerEligibilityComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactPayrollSetupComponent.formBuilderGroupSetup(formGroupSetup, model, model.AreComplianceFieldsEditable).controls,
      UserProfileWorkerSPTaxNumbers: ContactSalesTaxComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileWorkerSPTaxNumbers ? model.UserProfileWorkerSPTaxNumbers : [], model.ProfileTypeId),
      SelectedType: [model.SelectedType ? model.SelectedType : []],
      IsApplyWorkerSPGovernmentRuling: [
        model.IsApplyWorkerSPGovernmentRuling,
        model.AreComplianceFieldsEditable ? [ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsApplyWorkerSPGovernmentRuling', CustomFieldErrorType.required))] : null
      ],
      UserProfileWorkerSPGovernmentRulings: ContactT4AFormEligibilityComponent.formBuilderGroupSetup(formGroupSetup, model),
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  onClickYesGovRulings($event) {}

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<ICanadianSPProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

  public get refLink() {
    return `#/next/contacts/${this.stateParams.contactId}/profile/${this.stateParams.profileType}/${this.stateParams.profileId}`;
  }

  onComplianceDocumentOutput($event) {}

  public get Foo() {
    return this.inputFormGroup.valid;
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
