import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService } from '../../common';
import { IReadOnlyStorage, IUserProfilePhone, IContactInfo, IFormGroupOnNew, IProfile } from '../state/profile.interface';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';

@Component({
  selector: 'app-contact-phonenumbers',
  templateUrl: './contact-phonenumbers.component.html',
  styleUrls: ['./contact-phonenumbers.component.less']
})
export class ContactPhonenumbersComponent {

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IContactInfo>;
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

  onClickAddPhone() {
    const formArrayUserProfilePhones: FormArray<IUserProfilePhone> = <FormArray<IUserProfilePhone>>this.inputFormGroup.controls.UserProfilePhones;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayUserProfilePhones.push(ContactPhonenumberComponent.formBuilderGroupAddNew(formGroupOnNew));
    this.outputEvent.emit();
  }

  public get formArrayUserProfilePhones(): FormArray<IUserProfilePhone> {
    return <FormArray<IUserProfilePhone>>this.inputFormGroup.controls.UserProfilePhones;
  }

  public static formGroupToPartial(formGroupTabDetail: FormGroup<IContactInfo>): Partial<IProfile> {
    const formGroupUserProfilePhones: FormGroup<IContactInfo> = formGroupTabDetail;
    return { ...ContactPhonenumberComponent.formGroupToPartial(formGroupUserProfilePhones) };
  }
}
