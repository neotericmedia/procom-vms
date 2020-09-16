import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IFormGroupSetup, IProfile, ITabContact, ITabContactDetail, IReadOnlyStorage } from '../state/profile.interface';
import { ProfileObservableService } from '../state/profile.observable.service';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { PhxConstants, CommonService, CodeValueService } from '../../common';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { ContactService } from '../shared/contact.service';
import { CodeValue } from '../../common/model';
import { Router } from '@angular/router';
import { ContactProfilesComponent } from '../contact-profiles/contact-profiles.component';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-contact-tab-contact',
  templateUrl: './contact-tab-contact.component.html',
  styleUrls: ['./contact-tab-contact.component.less']
})

export class ContactTabContactComponent extends BaseComponentOnDestroy implements OnInit {

  @Input() inputFormGroup: FormGroup<ITabContact>;
  @Input() readOnlyStorage: IReadOnlyStorage;
  @Output() outputEvent = new EventEmitter();
  @Output() reload = new EventEmitter();
  @Output() updateBreadcrumb: EventEmitter<boolean> = new EventEmitter();
  phxConstants: any;
  isBlockVisible: boolean;
  profile: IProfile;
  showAdvance: boolean;
  showGarnishee: boolean;
  isGarnishees: boolean = false;
  isAdvances: boolean = false;
  isWorkerProfile: boolean = false;
  isDocuments: boolean = false;
  isProfiles: boolean = true;
  subscriptions: Array<any> = [];
  listSubscriptionType: Array<CodeValue>;
  listSubscriptionStatuses: Array<CodeValue>;
  codeValueGroups: any;

  constructor(private profileObservableService: ProfileObservableService,
    private commonService: CommonService,
    private authService: AuthService,
    private contactService: ContactService,
    private codeValueService: CodeValueService,
    private router: Router) {
    super();
    this.getProfile();
  }

  getProfile() {
    this.profileObservableService.profileOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: IProfile) => {
        this.profile = response;
        if (this.profile) {
          this.isBlockVisible = (this.profile.ProfileTypeId === PhxConstants.ProfileType.WorkerTemp ||
            this.profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesW2 ||
            this.profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianSP);
          this.showGarnisheesAndAdvances(this.profile);
          this.isProfileWorkerProfile(this.profile);
          if (this.profile.ProfileTypeId === PhxConstants.ProfileType.Internal
            && this.profile.ProfileStatusId === PhxConstants.ProfileStatus.Active) {
            this.getInternalSubscriptions();
          }
        }
      });
  }

  onOutputResponse() {
    this.reload.emit();
  }

  ngOnInit() {
    this.phxConstants = PhxConstants;
    this.codeValueGroups = this.commonService.CodeValueGroups;
    this.listSubscriptionType = this.codeValueService.getCodeValues(this.codeValueGroups.AccessSubscriptionType, true);
    this.listSubscriptionStatuses = this.codeValueService.getCodeValues(this.codeValueGroups.AccessSubscriptionStatus, true);
  }

  onOutputEvent() {
    this.outputEvent.emit();
  }

  onUpdateBreadcrumb() {
    this.updateBreadcrumb.emit();
  }

  showGarnisheesAndAdvances(profile: IProfile) {
    if (profile.Id > 0 && (profile.ProfileTypeId === PhxConstants.ProfileType.WorkerTemp || profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianSP)) {
      if (this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.UserProfileViewWorkerAdvance)) {
        this.showAdvance = true;
      }
      if (this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.UserProfileViewWorkerGarnishee)) {
        this.showGarnishee = true;
      }
    }
  }

  isProfileWorkerProfile(profile: IProfile) {
    this.isWorkerProfile =
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerTemp ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianSP ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianInc ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerSubVendor ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesW2 ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesLLC;
  }

  getInternalSubscriptions() {
    const state = {
      search: {
        predicateObject: {
          UserProfileIdSubscriber: [this.profile.Id],
        },
      },
    };

    this.contactService.getAllOriginalAccessSubscriptions(state, null)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: any) => {
        this.subscriptions = response.Items;
      });
  }

  onClickSubscription(id: number) {
    alert('To be implemented');
    // this.router.navigateByUrl('/subscription/edit/' + id);
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup,
    profile: IProfile,
    codeValueService: CodeValueService,
    codeValueGroups: any): FormGroup<ITabContact> {

    const contact = profile.Contact;

    if (contact) {
      const contactDetail: ITabContactDetail = {
        PersonTitleId: contact.PersonTitleId,
        PreferredPersonTitleId: contact.PreferredPersonTitleId,
        FirstName: contact.FirstName,
        PreferredFirstName: contact.PreferredFirstName,
        LastName: contact.LastName,
        PreferredLastName: contact.PreferredLastName,
        CultureId: contact.CultureId,
        CreatedByName: contact.CreatedByName,
        AssignedToUserProfileId: contact.AssignedToUserProfileId,
        LoginUserId: contact.LoginUserId
      };

      const formGroup: FormGroup<ITabContact> = formGroupSetup.formBuilder.group<ITabContact>({
        TabContactDetail: ContactDetailsComponent.formBuilderGroupSetup(formGroupSetup, contactDetail),
        TabProfiles: ContactProfilesComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups)
      });

      return formGroup;

    } else {
      return null;
    }
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<ITabContact>): IProfile {
    contact = ContactDetailsComponent.formGroupToPartial(contact,
      <FormGroup<ITabContactDetail>>formGroup.controls.TabContactDetail);
    return contact;
  }

}
