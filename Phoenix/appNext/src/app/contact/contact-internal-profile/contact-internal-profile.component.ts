import { Component, OnInit } from '@angular/core';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { IInternalProfile, IFormGroupSetup, IProfile } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactOrganizationInfoComponent } from '../contact-organization-info/contact-organization-info.component';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { ContactProfileInternalCommissionComponent } from '../contact-profile-internal-commission/contact-profile-internal-commission.component';
import { ContactUserroleComponent } from '../contact-userrole/contact-userrole.component';
import { AuthService } from '../../common/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-internal-profile',
  templateUrl: './contact-internal-profile.component.html',
  styleUrls: ['./contact-internal-profile.component.less']
})
export class ContactInternalProfileComponent extends ContactProfilesPresentationalBase<IInternalProfile> implements OnInit {

  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {

  }

  constructor(private pos: ProfileObservableService,
    private auth: AuthService,
    private activatedRout: ActivatedRoute) {
    super('ContactInternalProfileComponent', pos, auth, activatedRout);
  }

  ngOnInit() {
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): FormGroup<IInternalProfile> {

    const formGroup = formGroupSetup.formBuilder.group<IInternalProfile>({
      ...ContactOrganizationInfoComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactProfileInternalCommissionComponent.formBuilderGroupSetup(formGroupSetup, model).controls,
      UserProfileFunctionalRoles: ContactUserroleComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileFunctionalRoles),
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IInternalProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }
}
