import { Input, Component, ChangeDetectionStrategy } from '@angular/core';
import { AccessAction, CustomFieldErrorType } from '../../common/model';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { IFormGroupSetup, IOrganization, IOrganizationIndependentContractorRole, INotificationEmail, IFormGroupOnNew, IRoleWithNotificationEmail } from '../state';
import { FormGroup, FormArray, AbstractControl, FormControl, ControlConfig } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions } from '../../common';
import { Validators } from '../../../../node_modules/@angular/forms';
import { groupBy, forEach } from 'lodash';
import { PhxConstants } from './../../common/model/phx-constants';

@Component({
  selector: 'app-organization-role-detail',
  templateUrl: './organization-role-detail.component.html',
  styleUrls: ['./organization-role-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationRoleDetailComponent extends OrganizationBaseComponentPresentational<IOrganizationIndependentContractorRole> {

  @Input() isQuickAdd = false;

  constructor() {
    super('OrganizationRoleDetailComponent');
  }

  trackByFn(index: number) {
    return index;
  }

  getCodeValuelistsStatic() { }

  businessRules(obj: IFormGroupValue): void { }

  recalcLocalProperties(organizationFormGroup: FormGroup<IOrganizationIndependentContractorRole>) { }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) { }

  formArrayNotificationEmails(): FormArray<INotificationEmail> {
    return <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
  }

  onClickAddNotificationEmail() {
    const formArrayNotificationEmails: FormArray<INotificationEmail> = <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayNotificationEmails.push(OrganizationRoleDetailComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayNotificationEmails));
  }

  onClickDeleteNotificationEmail(index: number) {
    const formArrayNotificationEmails: FormArray<INotificationEmail> = <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
    formArrayNotificationEmails.removeAt(index);
  }

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, formArrayNotificationEmails: FormArray<INotificationEmail>): FormGroup<INotificationEmail> {
    return formGroupOnNew.formBuilder.group<INotificationEmail>({
      Email: [null,
        [
          Validators.required,
          OrganizationRoleDetailComponent.validateEmail
        ]
      ]
    });
  }

  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    organizationIndependentContractorRole: IOrganizationIndependentContractorRole
  ): FormGroup<IOrganizationIndependentContractorRole> {

    const formGroup = formGroupSetup.hashModel.getFormGroup<IOrganizationIndependentContractorRole>(formGroupSetup.toUseHashCode, 'IOrganizationIndependentContractorRole', organizationIndependentContractorRole, 0, () =>
      formGroupSetup.formBuilder.group<IOrganizationIndependentContractorRole>({
        Id: [organizationIndependentContractorRole.Id ? organizationIndependentContractorRole.Id : 0],
        IdOriginal: [organizationIndependentContractorRole.IdOriginal ? organizationIndependentContractorRole.IdOriginal : null],
        IsNonResident: [
          organizationIndependentContractorRole.IsNonResident,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsNonResident', CustomFieldErrorType.required))
          ]
        ],
        BusinessNumber: [
          organizationIndependentContractorRole.BusinessNumber,
          [
            ValidationExtensions.maxLength(32),
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('BusinessNumber', CustomFieldErrorType.required))
          ]
        ],
        NotificationEmail: [organizationIndependentContractorRole.NotificationEmail],
        OrganizationRoleStatusId: [organizationIndependentContractorRole.OrganizationRoleStatusId],
        OrganizationRoleTypeId: [organizationIndependentContractorRole.OrganizationRoleTypeId],
        PaymentMethods: [organizationIndependentContractorRole.PaymentMethods],
        NotificationEmails: OrganizationRoleDetailComponent.formGroupNotificationEmail(formGroupSetup, organizationIndependentContractorRole.NotificationEmails)
      })
    );

    const emailArray: FormArray<INotificationEmail> = formGroup.get('NotificationEmails') as FormArray<INotificationEmail>;
    emailArray.setValidators(OrganizationRoleDetailComponent.validateEmailArray);
    return formGroup;
  }

  private static validateEmailArray(control: AbstractControl<Array<INotificationEmail>>) {
    if (control && Object.keys(control).length > 0) {
      const result = groupBy(control['controls'], c => c.value.Email ? c.value.Email.toLowerCase() : c.value.Email);
      for (const prop in result) {
        if (prop !== null) {
          if (result[prop].length > 1) {
            forEach(result[prop], (item: any, index: number) => {
              const emailFormArray = item as FormArray<INotificationEmail>;
              if (index !== 0) {
                emailFormArray.controls['Email'].setErrors({ errors: 'Duplicate Email!' });
              } else {
                emailFormArray.controls['Email'].setErrors(null);
              }
            });
          } else {
            const ex = result[prop][0]['controls']['Email'];
            const emailFormControl = <FormControl<INotificationEmail>>result[prop][0]['controls']['Email'];
            const exp = PhxConstants.Regex.Email;
            if (!emailFormControl.value) {
              result[prop][0]['_status'] = 'INVALID';
            } else if (emailFormControl.value && !exp.test(ex.value)) {
              emailFormControl.setErrors({ errors: 'Invalid Email!' });
            } else {
              emailFormControl.parent.parent.setErrors(null);
              emailFormControl.setErrors(null);
            }
          }
        } else {
          result[prop][0]['_status'] = 'INVALID';
        }
      }
      return null;
    }
  }

  public static formBuilderGroupSetupEmailsOnly(
    formGroupSetup: IFormGroupSetup,
    role: IOrganizationIndependentContractorRole
  ): any {

    const formGroup: FormGroup<Partial<IRoleWithNotificationEmail>> = formGroupSetup.formBuilder.group<Partial<IRoleWithNotificationEmail>>({
      NotificationEmail: [role.NotificationEmail],
      NotificationEmails: OrganizationRoleDetailComponent.formGroupNotificationEmail(formGroupSetup,
        role.NotificationEmails ? role.NotificationEmails :
          role.NotificationEmail ? role.NotificationEmail
            .split(';').map<INotificationEmail>(em => { return { Email: em }; }) : [{ Email: '' }])
    });

    const emailArray: FormArray<INotificationEmail> = formGroup.get('NotificationEmails') as FormArray<INotificationEmail>;
    emailArray.setValidators(OrganizationRoleDetailComponent.validateEmailArray);

    return formGroup;
  }


  public static validateEmail(control: AbstractControl<string>): any {
    if (control && Object.keys(control).length > 0) {
      let isError = false;
      if (control.value != null && control.parent) {
        const result = groupBy(control.parent.parent.controls, c => (<FormGroup<any>>c).controls.Email.value ? (<FormGroup<any>>c).controls.Email.value.toLowerCase() : (<FormGroup<any>>c).controls.Email.value);
        for (const prop in result) {
          if (result[prop].length > 1 && prop === control.value) {
            if (control['_errors'] !== null) {
              isError = true;
            }
          }
        }
      }
      if (isError) { return { 'duplicate': 'duplicate entries' }; } else { return null; }
    }
  }

  public static formGroupNotificationEmail(formGroupSetup: IFormGroupSetup, notificationEmails: Array<INotificationEmail>) {
    const ex = formGroupSetup.formBuilder.array<INotificationEmail>(
      notificationEmails.map((email: INotificationEmail, index) =>
        formGroupSetup.hashModel.getFormGroup<INotificationEmail>(formGroupSetup.toUseHashCode, 'INotificationEmail', email, index, () =>
          formGroupSetup.formBuilder.group<INotificationEmail>({
            Email: [
              email.Email,
              [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('NotificationEmail', CustomFieldErrorType.required)),
                OrganizationRoleDetailComponent.validateEmail
              ]
            ]
          })
        )
      )
    );
    return ex;
  }

  public static formGroupToPartial(formGroupContact: FormGroup<IOrganizationIndependentContractorRole>): Partial<IOrganization> {
    const formGroupDetails: FormGroup<IOrganizationIndependentContractorRole> = formGroupContact;
    if (formGroupDetails.value.NotificationEmails && formGroupDetails.value.NotificationEmails.length > 0) {
      formGroupDetails.controls.NotificationEmail.setValue(formGroupDetails.value.NotificationEmails.join(';'));
    }
    const roleDetails: IOrganizationIndependentContractorRole = {
      ...formGroupDetails.value
    };

    return {
      OrganizationIndependentContractorRoles: [roleDetails]
    };
  }
}
