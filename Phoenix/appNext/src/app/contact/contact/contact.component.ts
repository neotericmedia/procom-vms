import { Component, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponentActionContainer } from '../../common/state/epics/base-component-action-container';
import { getRouterState, IRouterState } from '../../common/state/router/reducer';
import { Observable } from 'rxjs/Observable';
import { PhxConstants, NavigationService, CommonService, CodeValueService, CustomFieldService, SignalrService, DialogService } from '../../common';
import { ProfileObservableService } from '../state/profile.observable.service';
import { NavigationBarItem, CodeValue } from '../../common/model';
import { IProfile, ProfileAction } from '../state';
import { Router, ActivatedRoute } from '@angular/router';
import { IReadOnlyStorage, IRoot, IFormGroupSetup, ITabContact, ITabProfiles, IBenefitSetup, ITabContactDetail } from '../state/profile.interface';
import { FormGroup, FormBuilder } from '../../common/ngx-strongly-typed-forms/model';
import { ContactTabContactComponent } from '../contact-tab-contact/contact-tab-contact.component';
import { HashModel } from '../../common/utility/hash-model';
import { filter } from 'lodash';
import { ContactService } from '../shared/contact.service';
import { ContactProfilesComponent } from '../contact-profiles/contact-profiles.component';
import { PhxNoteHeaderComponent } from '../../common/components/phx-note-header/phx-note-header.component';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.less']
})

export class ContactComponent extends BaseComponentActionContainer implements OnInit, OnChanges {

  public routerParams: any;
  public routerState: any;
  public profile: IProfile;
  updateBreadcrumb = true;
  readOnlyStorage: IReadOnlyStorage;
  rootFormGroup: FormGroup<IRoot>;
  formGroupSetup: IFormGroupSetup;
  isNotProfilePage: boolean = true;
  html: {
    navigationBarContent: Array<NavigationBarItem>;
    codeValueGroups: any;
    phxConstants: any;
    validationMessages: any;
    profileTypeId: number;
    codeValueLists: {
      listProfileStatuses: Array<CodeValue>;
      listProfileTypes: Array<CodeValue>;
    };
    access: {};
  } = {
      navigationBarContent: null,
      codeValueGroups: null,
      phxConstants: PhxConstants,
      validationMessages: null,
      profileTypeId: null,
      codeValueLists: {
        listProfileStatuses: [],
        listProfileTypes: []
      },
      access: {}
    };

  userProfileTypes: Array<any> = [];
  @ViewChild(PhxNoteHeaderComponent) notesHeader: PhxNoteHeaderComponent;

  constructor(private navigationService: NavigationService,
    private profileObservableService: ProfileObservableService,
    private router: Router,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private customFieldService: CustomFieldService,
    private contactService: ContactService,
    private authService: AuthService,
    private signlrService: SignalrService,
    private dialogService: DialogService) {
    super();
    this.html.codeValueGroups = this.commonService.CodeValueGroups;
    this.html.codeValueLists.listProfileStatuses = this.codeValueService.getCodeValues(this.html.codeValueGroups.ProfileStatus, true);
    this.html.codeValueLists.listProfileTypes = this.codeValueService.getCodeValues(this.html.codeValueGroups.ProfileType, true);
    this.formGroupSetup = {
      hashModel: new HashModel(),
      toUseHashCode: true,
      formBuilder: this.formBuilder,
      customFieldService: this.customFieldService
    };

    for (const x in PhxConstants.UserProfileType) {
      if (typeof PhxConstants.UserProfileType[x] === 'number') {
        this.userProfileTypes.push({ id: PhxConstants.UserProfileType[x], text: x });
      }
    }
  }

  ngOnInit() {
    this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerStateResult: IRouterState) => {
        const profileTypeParam = routerStateResult.params.profileType;
        if (profileTypeParam) {
          const profileType = (Object.keys(PhxConstants.ProfileType)).find(i => i.toLowerCase() === profileTypeParam.toLowerCase());
          this.html.profileTypeId = PhxConstants.ProfileType[profileType];
        } else {
          this.html.profileTypeId = null;
        }

        if (routerStateResult.location.includes(PhxConstants.ContactNavigationName.workorders)) {
          this.setRouterState(routerStateResult, PhxConstants.ContactNavigationName.workorders);
        } else if (routerStateResult.location.includes(PhxConstants.ContactNavigationName.notes)) {
          this.setRouterState(routerStateResult, PhxConstants.ContactNavigationName.notes);
        } else if (routerStateResult.location.includes(PhxConstants.ContactNavigationName.history)) {
          this.setRouterState(routerStateResult, PhxConstants.ContactNavigationName.history);
        } else {
          this.setRouterState(routerStateResult, PhxConstants.ContactNavigationName.contact);
          if (this.isNotProfilePage) {
            this.isNotProfilePage = false;
          }
        }
        this.routerParams = routerStateResult.params;
        return (routerStateResult.params.profileId && this.html.profileTypeId) ? this.profileObservableService.profile$(this, routerStateResult.params.profileId, this.html.profileTypeId) : Observable.of(null);
      })
      .takeUntil(this.isDestroyed$)
      .subscribe((profile: IProfile) => {
        if (profile) {
          this.profile = profile;

          this.setBreadcrumb();
          this.onInitContact(profile);

          if (profile.ContactValidationErrors !== null) {
            const validationMessages = this.commonService.parseResponseError(profile.ContactValidationErrors);
            if (validationMessages && validationMessages.length > 0) {
              this.html.validationMessages = [];
              validationMessages.forEach(element => {
                this.html.validationMessages.push(element.Message);
              });
            }
          }
        }
      });
    this.handleSignalrEvents();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.updateBreadcrumb && !changes.updateBreadcrumb.isFirstChange()) {
      this.setBreadcrumb();
    }
  }

  setBreadcrumb() {
    if (this.updateBreadcrumb) {
      if (this.profile.Contact && this.profile.Contact.FirstName && this.profile.Contact.LastName
        && (this.profile.Contact.FirstName !== '' || this.profile.Contact.LastName !== '')) {
        this.navigationService.setTitle('contact-viewedit', [this.profile.Contact.FirstName + ' ' + this.profile.Contact.LastName]);
      } else {
        this.navigationService.setTitle('contact-viewedit', ['New']);
      }
      this.updateBreadcrumb = false;
    }
  }

  onReload() {
    this.profileObservableService.profile$(this, this.profile.Id, this.profile.ProfileTypeId, false)
    .takeUntil(this.isDestroyed$)
    .subscribe(profile => {
      if (profile) {
        this.profile = profile;
        this.onOutputEvent();
      }
    });
  }

  onUpdateBreadcrumb() {
    this.updateBreadcrumb = true;
  }

  canAddProfile(profileTypeId: number) {
    if (profileTypeId === PhxConstants.ProfileType.Internal
      && !this.authService.hasFunctionalOperation(PhxConstants.FunctionalOperation.ContactCreateProfileTypeInternal)) {
      return false;
    }
    return this.canAddANewProfile(profileTypeId);
  }

  canAddANewProfile(profileTypeId: number): boolean {
    switch (profileTypeId) {
      case PhxConstants.ProfileType.Internal:
      case PhxConstants.ProfileType.WorkerTemp:
      case PhxConstants.ProfileType.WorkerCanadianSP:
      case PhxConstants.ProfileType.WorkerUnitedStatesW2:
        return !this.checkProfileTypeExists(profileTypeId);
      default:
        return true;
    }
  }

  checkProfileTypeExists(profileTypeId: number): boolean {
    return filter(this.profile.ContactProfileTypes, function (item) { return item === profileTypeId; }).length > 0;
  }

  createAdditionalProfile(contacteId: number, profileTypeId: number) {
    const profileType = this.codeValueService.getCodeValue(profileTypeId, this.html.codeValueGroups.ProfileType).code.toLowerCase();
    this.contactService.contactAddProfile({
      ContactId: contacteId,
      ProfileTypeId: profileTypeId,
      PrimaryEmail: this.profile.PrimaryEmail,
      organization: null
    })
    .takeUntil(this.isDestroyed$)
    .subscribe((response: any) => {
      this.router.navigate(['/next', 'contact', response.EntityIdRedirect, 'profile', profileType, response.EntityId]);
    }, error => {
      const validationMessages = this.commonService.parseResponseError(error);
      if (validationMessages.length > 0) {
        validationMessages.forEach(element => {
          this.html.validationMessages.push(element.Message);
        });
      }
    });
  }

  setRouterState(routerStateResult: IRouterState, ProfileNavigationName: string) {
    this.routerState = {
      Id: routerStateResult.params.profileId,
      routerPath: ProfileNavigationName,
      url: routerStateResult.location
    };
  }

  onInitContact(profile: IProfile) {
    setTimeout(() => (this.html.navigationBarContent = this.navigationBarContentSetup()));
    this.readOnlyStorage = profile.ReadOnlyStorage;

    this.formBuilderGroupSetup(this.formGroupSetup, profile);
  }

  formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, profile: IProfile) {
    this.rootFormGroup = formGroupSetup.formBuilder.group<IRoot>({
      ProfileId: profile.Id,
      TabContact: ContactTabContactComponent.formBuilderGroupSetup(formGroupSetup, profile, this.codeValueService, this.html.codeValueGroups),
    });
  }

  onOutputEvent() {
    const profile = this.profile;
    this.profile = ContactTabContactComponent.formGroupToPartial(profile, <FormGroup<ITabContact>>this.rootFormGroup.controls.TabContact);
    const profiles = ContactProfilesComponent.formGroupToPartial(profile, <FormGroup<ITabProfiles>>this.rootFormGroup.controls.TabContact.get('TabProfiles'));

    const fixTempW2ProfileModel = (setup: IBenefitSetup): IBenefitSetup => {
      if (setup.UserProfileWorkerBenefits) {
        setup.UserProfileWorkerBenefits.forEach(x => {
          if (x.IsNew) {
            x.Id = 0;
            delete x.UId;
          }
          x.EffectiveDate = <any>(new Date(x.EffectiveDate)).toISOString().split('T')[0];
        });
      }
      return setup;
    };

    switch (this.profile.ProfileTypeId) {
      case PhxConstants.ProfileType.Organizational:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.OrganizationalProfile
          })
        );
        break;
      case PhxConstants.ProfileType.Internal:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.InternalProfile
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerCanadianInc:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.CanadianIncProfile
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerCanadianSP:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.CanadianSPProfile
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerSubVendor:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.CanadianEngagementSubVendorProfile
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerTemp:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...fixTempW2ProfileModel(profiles.TempProfile)
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerUnitedStatesLLC:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...profiles.LLCWorkerProfile
          })
        );
        break;
      case PhxConstants.ProfileType.WorkerUnitedStatesW2:
        this.stateService.dispatchOnAction(
          new ProfileAction.ProfileUpdate({
            ...this.profile,
            ...fixTempW2ProfileModel(profiles.W2WorkerProfile)
          })
        );
        break;
      default:
        break;
    }
  }

  navigationBarContentSetup(): Array<NavigationBarItem> {
    const path = `/next/contact/${this.routerParams.contactId}/profile/${this.routerParams.profileType}/${this.routerParams.profileId}`;
    const isHidden = !(this.profile.Id > 0 && this.profile.Contact.Id > 0 && !this.profile.SourceId);
    return [
      {
        Id: 1,
        IsDefault: true,
        IsHidden: false,
        Valid: true,
        Name: PhxConstants.ContactNavigationName.contact,
        Path: path,
        DisplayText: 'Contact'
      },
      {
        Id: 2,
        IsDefault: false,
        IsHidden: isHidden,
        Valid: true,
        Name: PhxConstants.ContactNavigationName.workorders,
        Path: path + '/' + PhxConstants.ContactNavigationName.workorders,
        DisplayText: 'Work Orders'
      },
      {
        Id: 3,
        IsDefault: false,
        IsHidden: isHidden,
        Valid: true,
        Name: PhxConstants.ContactNavigationName.notes,
        Path: path + '/' + PhxConstants.ContactNavigationName.notes,
        DisplayText: 'Notes'
      },
      {
        Id: 4,
        IsDefault: false,
        IsHidden: isHidden,
        Valid: true,
        Name: PhxConstants.ContactNavigationName.history,
        Path: path + '/' + PhxConstants.ContactNavigationName.history,
        DisplayText: 'History'
      }
    ];
  }

  navigateToContactNotes() {
    this.router.navigateByUrl('/next/contact/' + this.routerParams.contactId + '/profile/' + this.routerParams.profileType + '/' + this.routerParams.profileId + '/' + PhxConstants.ContactNavigationName.notes);
  }

  onVersionClick(profile: IProfile, isOriginal: boolean) {

    this.isNotProfilePage = false;
    this.routerParams.contactId = profile.ContactId;
    this.routerParams.profileId = profile.Id;
    this.routerParams.profileType = this.codeValueService.getCodeValue(profile.ProfileTypeId, this.html.codeValueGroups.ProfileType).code.toLowerCase();

    if (isOriginal && profile.SourceId) {
      this.routerParams.profileId = profile.SourceId;
      this.routerParams.contactId = profile.SourceContactId;
    }
    if (!isOriginal && profile.ChildId) {
      this.routerParams.profileId = profile.ChildId;
      this.routerParams.contactId = profile.ChildContactId;
    }

    this.stateService.dispatchOnAction(new ProfileAction.ClearProfile()); // must clear profile to prevent bug #501 missing ChildId issue
    this.router.navigateByUrl('/next/contact/' + this.routerParams.contactId + '/profile/' + this.routerParams.profileType + '/' + this.routerParams.profileId);
  }

  onRefreshNotesCount() {
    this.notesHeader.getComments();
  }

  onNotesHeaderClicked($event) {
    const navigatePath = `/next/contact/${this.routerParams.contactId}/profile/${this.routerParams.profileType}/${this.routerParams.profileId}/${this.html.phxConstants.ContactNavigationName.notes}`;
    this.router.navigate([navigatePath], { relativeTo: this.activatedRoute.parent });
  }

  async handleSignalrEvents() {
    await this.signlrService.onPublic('NonWorkflowEvent', (event, data) => {
      // check if the event received is for the current profile
      if (!data.IsOwner && data.EntityTypeId === PhxConstants.EntityType.UserProfile &&
        (data.EntityId === this.profile.Id || data.CustomId === this.profile.Id)) {
          // check if the current profile has been deleted by another user
        if (data.ReferenceCommandName === 'UserProfileDiscard' || data.ReferenceCommandName === 'UserProfileDelete') {
          // show the message that current profile has been deleted by another user and redirect to list page
          this.dialogService.notify('Profile update information', data.Message, { backdrop: 'static' }).then(() => {
            this.router.navigate(['/next/contact/search']);
          });
        }

        // Following should go on the people list page
        // if (
        //   // $rootScope.$state.includes('ContactCreate.Search') &&
        //   data.EntityTypeId === PhxConstants.EntityType.UserProfile
        // ) {
        //   if (data.ReferenceCommandName === 'UserProfileDiscard' && data.ParentEntityId === 0) {
        //     // this.dialogSvc.notify('Profile update information', data.Message, { backdrop: 'static' }).then((btn) => {
        //     //   // unregisterList();
        //     //   // $rootScope.$state.transitionTo('ContactCreate.Search', {}, { reload: true, inherit: true, notify: true });
        //     //   this.router.navigate(['ContactCreate.Search', { reload: true, inherit: true, notify: true }]);
        //     // });
        //   }



        // Following should be added if further checks are required, this is missing after angular 2 migration
        // if (data.ReferenceCommandName === "UserProfileStatusToActiveFromPendingChange") {
        //    dialogs.notify('Profile update information', data.Message, { backdrop: 'static' }).then(function (btn) {
        //        unregisterList();
        //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.CustomId }, { reload: true, inherit: true, notify: true });
        //    });
        // }
        // if (data.ReferenceCommandName === "UserProfileDuplicateToGetOriginal") {
        //    dialogs.notify('Profile update information', data.Message, { backdrop: 'static' }).then(function (btn) {
        //        unregisterList();
        //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
        //    });
        // }
        // if (data.ReferenceCommandName === "UserProfileStatusToDraft" || data.ReferenceCommandName === "UserProfileStatusToActive") {
        //    dialogs.notify('Profile update information', data.Message, { backdrop: 'static' }).then(function (btn) {
        //        unregisterList();
        //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
        //    });
        // }
        // if (data.ReferenceCommandName === "UserProfileSave" || data.ReferenceCommandName === "UserProfileSubmit") {
        //    dialogs.notify('Profile update information', data.Message, { backdrop: 'static' }).then(function (btn) {
        //        unregisterList();
        //        $rootScope.$state.transitionTo($rootScope.$state.current.name, { contactId: data.ParentEntityId, profileId: data.EntityId }, { reload: true, inherit: true, notify: true });
        //    });
        // }
      }
    }, true, this.isDestroyed$);
  }
}
