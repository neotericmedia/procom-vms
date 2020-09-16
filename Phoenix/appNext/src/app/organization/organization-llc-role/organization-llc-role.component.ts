import { Input, Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { AccessAction, CustomFieldErrorType } from '../../common/model';
import { OrganizationBaseComponentPresentational } from '../organization-base-component-presentational';
import { IFormGroupValue } from '../../common/utility/form-group';
import { IFormGroupSetup, IOrganization, INotificationEmail, IFormGroupOnNew, IOrganizationLimitedLiabilityCompanyRole, IRoleWithNotificationEmail } from '../state';
import { FormGroup, FormArray, AbstractControl, FormControl, ControlConfig } from '../../common/ngx-strongly-typed-forms/model';
import { ValidationExtensions } from '../../common';
import { Validators } from '../../../../node_modules/@angular/forms';
import { groupBy, forEach } from 'lodash';
import { PhxConstants } from './../../common/model/phx-constants';

@Component({
  selector: 'app-organization-llc-role',
  templateUrl: './organization-llc-role.component.html',
  styleUrls: ['./organization-llc-role.component.less']
})
export class OrganizationLlcRoleComponent extends OrganizationBaseComponentPresentational<IOrganizationLimitedLiabilityCompanyRole>
  implements OnDestroy, OnInit {

  ngOnInit(): void {
    // this.inputFormGroup.valueChanges.subscribe(x => {
    //   this.outputEvent.emit();
    // });
  }

  @Input() isQuickAdd = false;

  constructor() {
    super('OrganizationRoleDetailComponent');
  }

  trackByFn(index: number) {
    return index;
  }

  getCodeValuelistsStatic() { }

  businessRules(obj: IFormGroupValue): void {
  }

  recalcLocalProperties(organizationFormGroup: FormGroup<IOrganizationLimitedLiabilityCompanyRole>) {
  }

  recalcAccessActions(isEditable: boolean, accessActions: Array<AccessAction>) {
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  formArrayNotificationEmails(): FormArray<INotificationEmail> {
    return <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
  }

  get formArrayNotificationEmailControls(): FormGroup<INotificationEmail>[] {
    return (<FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails).controls as FormGroup<INotificationEmail>[];
  }

  onClickAddNotificationEmail() {
    const formArrayNotificationEmails: FormArray<INotificationEmail> = <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayNotificationEmails.push(OrganizationLlcRoleComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayNotificationEmails));
    this.outputEvent.emit();
  }

  onClickDeleteNotificationEmail(index: number) {
    const formArrayNotificationEmails: FormArray<INotificationEmail> = <FormArray<INotificationEmail>>this.inputFormGroup.controls.NotificationEmails;
    formArrayNotificationEmails.removeAt(index);
    this.outputEvent.emit();
  }

  private static validateEmailArray (control: AbstractControl<Array<INotificationEmail>>) {
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

  public static formBuilderGroupAddNew(formGroupOnNew: IFormGroupOnNew, formArrayNotificationEmails: FormArray<INotificationEmail>): FormGroup<INotificationEmail> {
    return formGroupOnNew.formBuilder.group<INotificationEmail>({
      Email: [null,
        [
          Validators.required,
          OrganizationLlcRoleComponent.validateEmail
        ]
      ]
    });
  }

  public static formBuilderGroupSetupEmailsOnly(
    formGroupSetup: IFormGroupSetup,
    role: IOrganizationLimitedLiabilityCompanyRole
  ): any {

    const formGroup: FormGroup<Partial<IRoleWithNotificationEmail>> = formGroupSetup.formBuilder.group<Partial<IRoleWithNotificationEmail>>({
      NotificationEmail: [role.NotificationEmail],
      NotificationEmails: OrganizationLlcRoleComponent.formGroupNotificationEmail(formGroupSetup,
        role.NotificationEmails ? role.NotificationEmails :
          role.NotificationEmail ? role.NotificationEmail
            .split(';').map<INotificationEmail>(em => { return { Email: em }; }) : [{ Email: '' }])
    });

    const emailArray: FormArray<INotificationEmail> = formGroup.get('NotificationEmails') as FormArray<INotificationEmail>;
    emailArray.setValidators(OrganizationLlcRoleComponent.validateEmailArray);

    return formGroup;
  }


  public static formBuilderGroupSetup(
    formGroupSetup: IFormGroupSetup,
    organizationLLCRole: IOrganizationLimitedLiabilityCompanyRole
  ): FormGroup<IOrganizationLimitedLiabilityCompanyRole> {

    const formGroup = formGroupSetup.hashModel.getFormGroup<IOrganizationLimitedLiabilityCompanyRole>(formGroupSetup.toUseHashCode, 'IOrganizationLimitedLiabilityCompanyRole', organizationLLCRole, 0, () =>
      formGroupSetup.formBuilder.group<IOrganizationLimitedLiabilityCompanyRole>({
        Id: [organizationLLCRole.Id ? organizationLLCRole.Id : 0],
        IdOriginal: [organizationLLCRole.IdOriginal ? organizationLLCRole.IdOriginal : null],
        IsNonResident: [
          organizationLLCRole.IsNonResident,
          [
            ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('IsNonResident', CustomFieldErrorType.required))
          ]
        ],
        EmployerIdentificationNumber: [
          organizationLLCRole.EmployerIdentificationNumber,
          [
            ValidationExtensions.maxLength(32)
          ]
        ],
        NotificationEmail: [organizationLLCRole.NotificationEmail],
        OrganizationRoleStatusId: [organizationLLCRole.OrganizationRoleStatusId],
        OrganizationRoleTypeId: [organizationLLCRole.OrganizationRoleTypeId],
        PaymentMethods: [organizationLLCRole.PaymentMethods],
        NotificationEmails: OrganizationLlcRoleComponent.formGroupNotificationEmail(formGroupSetup,
          organizationLLCRole.NotificationEmails ? organizationLLCRole.NotificationEmails :
            organizationLLCRole.NotificationEmail ? organizationLLCRole.NotificationEmail.split(';')
            .map<INotificationEmail>(em => { return { Email: em }; }) : [ { Email : '' } ])
      })
    );

    const emailArray: FormArray<INotificationEmail> = formGroup.get('NotificationEmails') as FormArray<INotificationEmail>;
    emailArray.setValidators(OrganizationLlcRoleComponent.validateEmailArray);
    return formGroup;
  }

  public static validateEmail(control: AbstractControl<string>): any {
    if (control && Object.keys(control).length > 0) {
      let isError = false;
      if (control.value != null && control.parent) {
        const result = groupBy(control.parent.parent.controls, (c:any) => c.controls.Email.value ? c.controls.Email.value.toLowerCase() : c.controls.Email.value);
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
    return formGroupSetup.formBuilder.array<INotificationEmail>(
      notificationEmails.map((email: INotificationEmail, index) =>
        formGroupSetup.hashModel.getFormGroup<INotificationEmail>(formGroupSetup.toUseHashCode, 'INotificationEmail', email, index, () =>
          formGroupSetup.formBuilder.group<INotificationEmail>({
            Email: [
              email.Email,
              [
                ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('NotificationEmail', CustomFieldErrorType.required)),
                OrganizationLlcRoleComponent.validateEmail
              ]
            ]
          })
        )
      )
    );
  }

  public static formGroupToPartial(formGroupContact: FormGroup<IOrganizationLimitedLiabilityCompanyRole>): Partial<IOrganization> {
    const formGroupDetails: FormGroup<IOrganizationLimitedLiabilityCompanyRole> = formGroupContact;
    const roleDetails: IOrganizationLimitedLiabilityCompanyRole = formGroupDetails.value;
    return {
      OrganizationLimitedLiabilityCompanyRoles: [roleDetails]
    };
  }

}
