// angular
import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
// common
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService } from '../../common';
// organization
import { IReadOnlyStorage, IOrganizationAddress, ITabDetailsAddresses, IFormGroupOnNew, IOrganization } from './../state/organization.interface';
import { OrganizationAddressComponent } from '../organization-address/organization-address.component';

@Component({
  selector: 'app-organization-addresses',
  templateUrl: './organization-addresses.component.html',
  styleUrls: ['./organization-addresses.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationAddressesComponent {
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ITabDetailsAddresses>;
  @Input() isQuickAdd = false;
  @Output() outputEvent = new EventEmitter();

  html: { phxConstants: typeof PhxConstants } = { phxConstants: null };

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService) {
    this.html.phxConstants = PhxConstants;
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onClickAddAddress() {
    const formArrayOrganizationAddresses: FormArray<IOrganizationAddress> = <FormArray<IOrganizationAddress>>this.inputFormGroup.controls.OrganizationAddresses;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayOrganizationAddresses.push(OrganizationAddressComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayOrganizationAddresses.value));
    this.outputEvent.emit();
  }

  formArrayOrganizationAddresses(): FormArray<IOrganizationAddress> {
    return <FormArray<IOrganizationAddress>>this.inputFormGroup.controls.OrganizationAddresses;
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<ITabDetailsAddresses>): Partial<IOrganization> {
    const formGroupOrganizationAddresses: FormGroup<ITabDetailsAddresses> = formGroupTabDetail;
    return { ...OrganizationAddressComponent.formGroupToPartial(formGroupOrganizationAddresses) };
  }

}
