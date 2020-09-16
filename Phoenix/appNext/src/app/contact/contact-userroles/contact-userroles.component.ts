import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { PhxConstants, CustomFieldService } from '../../common';
import { IReadOnlyStorage, IUserProfileFunctionalRole, IFormGroupOnNew, IProfile, IInternalProfile } from '../state/profile.interface';
import { ContactUserroleComponent } from '../contact-userrole/contact-userrole.component';

@Component({
  selector: 'app-contact-userroles',
  templateUrl: './contact-userroles.component.html',
  styleUrls: ['./contact-userroles.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ContactUserrolesComponent implements OnInit {

  ngOnInit(): void {
    if (this.formArrayFunctionalRoles()) {
      if (this.formArrayFunctionalRoles().length === 0) {
        this.onClickAddFunctionalRole();
      }
    }
  }

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<IInternalProfile>;
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

  onClickAddFunctionalRole() {
    const formArrayFunctionalRoles: FormArray<IUserProfileFunctionalRole> = <FormArray<IUserProfileFunctionalRole>>this.inputFormGroup.controls.UserProfileFunctionalRoles;
    const formGroupOnNew: IFormGroupOnNew = { formBuilder: this.formBuilder, customFieldService: this.customFieldService };
    formArrayFunctionalRoles.push(ContactUserroleComponent.formBuilderGroupAddNew(formGroupOnNew, formArrayFunctionalRoles.value));
    this.outputEvent.emit();
  }

  formArrayFunctionalRoles(): FormArray<IUserProfileFunctionalRole> {
    return <FormArray<IUserProfileFunctionalRole>>this.inputFormGroup.controls.UserProfileFunctionalRoles;
  }

}
