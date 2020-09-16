import { Component, OnInit, Input } from '@angular/core';
import { ContactProfilesPresentationalBase } from '../contact-profiles-presentational-base';
import { IFormGroupSetup, IProfile, ICanadianIncProfile } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactAddressComponent } from '../contact-address/contact-address.component';
import { ContactPhonenumberComponent } from '../contact-phonenumber/contact-phonenumber.component';
import { AuthService } from '../../common/services/auth.service';
import { CodeValueService } from '../../common';
import { ContactProfileWorkerEligibilityComponent } from '../contact-profile-worker-eligibility/contact-profile-worker-eligibility.component';
import { ActivatedRoute } from '@angular/router';
import { ContactService } from '../shared/contact.service';
import { ContactProfileDetailsComponent } from '../contact-profile-details/contact-profile-details.component';
import { ContactOrganizationInfoComponent } from '../contact-organization-info/contact-organization-info.component';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'app-contact-canadian-inc-profile',
  templateUrl: './contact-canadian-inc-profile.component.html',
  styleUrls: ['./contact-canadian-inc-profile.component.less']
})
export class ContactCanadianIncProfileComponent extends ContactProfilesPresentationalBase<ICanadianIncProfile> implements OnInit {

  @Input() triggerComplianceDocumentRefresh: string;
  dataParams: string = null;


  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {

  }

  constructor(private pos: ProfileObservableService,
    private auth: AuthService,
    private activatedRout: ActivatedRoute,
    private contactService: ContactService) {
    super('ContactCanadianIncProfileComponent', pos, auth, activatedRout);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  ngOnInit() {
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, model: IProfile, codeValueService: CodeValueService,
    codeValueGroups: any): FormGroup<ICanadianIncProfile> {

    const formGroup = formGroupSetup.formBuilder.group<ICanadianIncProfile>({
      ...ContactOrganizationInfoComponent.formBuilderGroupSetup(formGroupSetup, model),
      ...ContactProfileDetailsComponent.formBuilderGroupSetup(formGroupSetup, model),
      UserProfileAddresses: ContactAddressComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfileAddresses),
      UserProfilePhones: ContactPhonenumberComponent.formBuilderGroupSetup(formGroupSetup, model.UserProfilePhones),
      ...ContactProfileWorkerEligibilityComponent.formBuilderGroupSetup(formGroupSetup, model),
      ContactDetails: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, model.Contact)
    });

    return formGroup;
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<ICanadianIncProfile>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }

  public get refLink() {
    return `#/next/contacts/${this.stateParams.contactId}/profile/${this.stateParams.profileType}/${this.stateParams.profileId}`;
  }

  onComplianceDocumentOutput($event) {
  }
}


