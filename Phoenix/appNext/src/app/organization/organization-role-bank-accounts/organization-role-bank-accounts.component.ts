import { Component, EventEmitter, Input, Output } from '@angular/core';
// common
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService, CodeValueService } from '../../common';
// organization
import { IReadOnlyStorage, IOrganizationAddress, ITabDetailsAddresses, IFormGroupOnNew, ITabDetails, IOrganization, IRoleBankAccounts, IBankAccount } from './../state/organization.interface';
import { OrganizationAddressComponent } from '../organization-address/organization-address.component';
import { OrganizationRoleBankAccountComponent } from '../organization-role-bank-account/organization-role-bank-account.component';

@Component({
  selector: 'app-organization-role-bank-accounts',
  templateUrl: './organization-role-bank-accounts.component.html',
  styleUrls: ['./organization-role-bank-accounts.component.less']
})
export class OrganizationRoleBankAccountsComponent {

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IRoleBankAccounts>;
  @Output() outputEvent = new EventEmitter();
  @Input() isEditable = false;
  @Input() canPrimaryAccountButtonEnabled = false;

  html: { phxConstants: typeof PhxConstants } = { phxConstants: null };

  public get bankAccountsFormArray(): FormArray<IBankAccount> {
    return this.inputFormGroup.controls.BankAccounts as FormArray<IBankAccount>;
  }

  constructor(private formBuilder: FormBuilder, private customFieldService: CustomFieldService, private codeValueService: CodeValueService) {
    this.html.phxConstants = PhxConstants;
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onClickAddAccount() {
    const formArrayOrganizationAccounts: FormArray<IBankAccount> = <FormArray<IBankAccount>>this.inputFormGroup.controls.BankAccounts;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    const freshInternalRole = OrganizationRoleBankAccountComponent.formBuilderGroupAddNew(formGroupOnNew, this.formArrayInternalRoleBankAccount.value);
    if (formArrayOrganizationAccounts.length === 0) {
      freshInternalRole.controls.IsPrimary.setValue(true);
    }
    formArrayOrganizationAccounts.push(freshInternalRole);
    this.outputEvent.emit();
  }

  public get formArrayInternalRoleBankAccount(): FormArray<IBankAccount> {
    return <FormArray<IBankAccount>>this.inputFormGroup.controls.BankAccounts;
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<ITabDetails>): Partial<IOrganization> {
    const formGroupOrganizationAddresses: FormGroup<ITabDetailsAddresses> = <FormGroup<ITabDetailsAddresses>>formGroupTabDetail.controls.TabDetailsAddresses;
    return { ...OrganizationAddressComponent.formGroupToPartial(formGroupOrganizationAddresses) };
  }

}
