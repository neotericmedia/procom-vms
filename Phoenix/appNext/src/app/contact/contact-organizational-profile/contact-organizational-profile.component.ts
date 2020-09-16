import { Component, OnInit } from '@angular/core';
import { IOrganizationalProfile, IFormGroupSetup, IProfile } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ProfileObservableService } from '../state/profile.observable.service';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { ContactOrganizationInfoComponent } from '../contact-organization-info/contact-organization-info.component';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { AuthService } from '../../common/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-organizational-profile',
  templateUrl: './contact-organizational-profile.component.html',
  styleUrls: ['./contact-organizational-profile.component.less']
})
export class ContactOrganizationalProfileComponent extends ContactProfilesPresentationalBase<IOrganizationalProfile> implements OnInit {

  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {

  }

  constructor(private pos: ProfileObservableService,
    private auth: AuthService,
    private activatedRout: ActivatedRoute) {
    super('ContactOrganizationalProfileComponent', pos, auth, activatedRout);
  }

  ngOnInit() {

  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile): FormGroup<IOrganizationalProfile> {

    const formGroup = formGroupSetup.formBuilder.group<IOrganizationalProfile>({
      ...ContactOrganizationInfoComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IOrganizationalProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

}
