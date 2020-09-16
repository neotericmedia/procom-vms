import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService } from '../../common';
import { IReadOnlyStorage, IUserProfileAddress, IContactInfo, IFormGroupOnNew, IProfile } from '../state';
import { ContactAddressComponent } from '../contact-address/contact-address.component';

@Component({
  selector: 'app-contact-addresses',
  templateUrl: './contact-addresses.component.html',
  styleUrls: ['./contact-addresses.component.less']
})
export class ContactAddressesComponent implements OnInit {

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IContactInfo>;
  @Input() isQuickAdd = false;
  @Output() outputEvent = new EventEmitter();
  @Input() addDefaultAddress: boolean = false;

  html: { phxConstants: typeof PhxConstants } = { phxConstants: null };

  constructor(private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService) {
    this.html.phxConstants = PhxConstants;
  }

  ngOnInit() {
    if (this.inputFormGroup.controls.UserProfileAddresses.value.length === 0 && this.addDefaultAddress) {
      this.onClickAddAddress();
    }
  }

  addAddress() {
  }

  trackByFn(index: number) {
    return index;
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onClickAddAddress() {
    const formArrayUserProfileAddresses: FormArray<IUserProfileAddress> = <FormArray<IUserProfileAddress>>this.inputFormGroup.controls.UserProfileAddresses;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayUserProfileAddresses.push(ContactAddressComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayUserProfileAddresses.value));
    this.outputEvent.emit();
  }

  public get formArrayUserProfileAddresses(): FormArray<IUserProfileAddress> {
    return <FormArray<IUserProfileAddress>>this.inputFormGroup.controls.UserProfileAddresses;
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<IContactInfo>): Partial<IProfile> {
    const formGroupUserProfileAddresses: FormGroup<IContactInfo> = formGroupTabDetail;
    return { ...ContactAddressComponent.formGroupToPartial(formGroupUserProfileAddresses) };
  }
}
