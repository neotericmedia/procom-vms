import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IInternalCommission, IFormGroupSetup, IProfile, IUserProfileWorkerSPTaxNumber } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup, ControlsConfig, FormArray } from '../../common/ngx-strongly-typed-forms/model';
import { ContactSalesTaxComponent } from '../contact-sales-tax/contact-sales-tax.component';
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-profile-internal-commission',
  templateUrl: './contact-profile-internal-commission.component.html',
  styleUrls: ['./contact-profile-internal-commission.component.less']
})
export class ContactProfileInternalCommissionComponent extends ContactBaseComponentPresentational<IInternalCommission> implements OnInit {

  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {
    const value = {};
    switch (obj.name) {
      case 'IsIncorporated':
        break;
      default:
        break;
    }
  }

  constructor() {
    super('ContactProfileInternalCommissionComponent');
    this.getCodeValuelistsStatic();
  }

  ngOnInit() {
  }

  public get salesTaxNumbersFormArray() {
    return <FormArray<IUserProfileWorkerSPTaxNumber>>this.inputFormGroup.controls.UserProfileInternalTaxNumbers;
  }

  onNotIncorporated($event) {
    if (this.salesTaxNumbersFormArray) {
      const count = this.salesTaxNumbersFormArray.length;
      for (let index = 0; index < count; index++) {
        this.salesTaxNumbersFormArray.removeAt(index);
      }

      this.inputFormGroup.controls.SelectedType.setValue([]);
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): FormGroup<IInternalCommission> {

    const formGroup = formGroupSetup.formBuilder.group<IInternalCommission>({
      IsCommissionEligible: [model.IsCommissionEligible, [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsCommissionEligible', CustomFieldErrorType.required))
      ]],
      PayeeName: [model.PayeeName, [Validators.maxLength(64)]],
      CommissionStructureTypeId: [model.CommissionStructureTypeId],
      IsIncorporated: [model.IsIncorporated, model.IsCommissionEligible ? [
        ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsIncorporated', CustomFieldErrorType.required))
        ] : null],
      UserProfileInternalTaxNumbers: ContactSalesTaxComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileInternalTaxNumbers ?
        model.UserProfileInternalTaxNumbers : [], model.ProfileTypeId),
      SelectedType: [model.SelectedType ? model.SelectedType : []]
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IInternalCommission>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }


}
