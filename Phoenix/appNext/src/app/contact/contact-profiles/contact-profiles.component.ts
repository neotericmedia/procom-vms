import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { IProfile, IContact, IProfileHeader, ITabProfiles, IFormGroupSetup, ProfileAction } from '../state';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { ProfileService } from '../shared/profile.service';
import { CommonService, PhxConstants, LoadingSpinnerService, DialogService, CodeValueService } from '../../common';
import { Router, ActivatedRoute } from '@angular/router';
import { IFormGroupValue } from '../../common/utility/form-group';
import { PhxDialogComponentEventEmitterInterface, PhxDialogComponentConfigModel } from '../../common/components/phx-dialog/phx-dialog.component.model';
import { PhxDialogComponent } from '../../common/components/phx-dialog/phx-dialog.component';
import { WorkflowAction, StateAction, StateActionDisplayType, StateActionButtonStyle, StateActionButtonsOption } from '../../common/model';
import { filter } from 'lodash';
import { ProfileObservableService } from '../state/profile.observable.service';
import { PhxWorkflowButtonsComponent } from '../../common/components/phx-workflow-buttons/phx-workflow-buttons.component';
import { FormGroup } from '../../common/ngx-strongly-typed-forms/model';
import { ContactOrganizationalProfileComponent } from '../contact-organizational-profile/contact-organizational-profile.component';
import { ContactInternalProfileComponent } from '../contact-internal-profile/contact-internal-profile.component';
import { ContactTempProfileComponent } from '../contact-temp-profile/contact-temp-profile.component';
import { ContactCanadianSpProfileComponent } from '../contact-canadian-sp-profile/contact-canadian-sp-profile.component';
import { ContactCanadianIncProfileComponent } from '../contact-canadian-inc-profile/contact-canadian-inc-profile.component';
import { ContactCanadianEngagementSubVendorProfileComponent } from '../contact-canadian-engagement-sub-vendor-profile/contact-canadian-engagement-sub-vendor-profile.component';
import { ContactUnitedStatesW2ProfileComponent } from '../contact-united-states-w2-profile/contact-united-states-w2-profile.component';
import { ContactUnitedStatesLlcProfileComponent } from '../contact-united-states-llc-profile/contact-united-states-llc-profile.component';
import { IReadOnlyStorage } from '../../document-rule/state';
import { StateService } from '../../common/state/state.module';
import { AuthService } from '../../common/services/auth.service';
import * as uuid from 'uuid';

enum localProfileActtions {
  Submit = 1,
  Finalize = 2
}

const Command = PhxConstants.CommandNamesSupportedByUi.BaseContactsCommand;
const StateActionConst = PhxConstants.StateAction;
const EntityType = PhxConstants.EntityType;
const ProfileStatus = PhxConstants.ProfileStatus;
const ProfileType = PhxConstants.UserProfileType;
const FunctionalOperation = PhxConstants.FunctionalOperation;
const WorkPermitType = PhxConstants.WorkPermitType;

@Component({
  selector: 'app-contact-profiles',
  templateUrl: './contact-profiles.component.html',
  styleUrls: ['./contact-profiles.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ContactProfilesComponent extends BaseComponentOnDestroy implements OnInit {

  public phxDialogComponentConfigModel: PhxDialogComponentConfigModel = null;

  @Input() readOnlyStorage: IReadOnlyStorage;
  @Input() inputFormGroup: FormGroup<ITabProfiles>;
  @Output() updateBreadcrumb: EventEmitter<boolean> = new EventEmitter();
  codeValueGroups: any;
  triggerComplianceDocumentRefresh: String;

  public getCodeValuelistsStatic() {

  }

  public businessRules(obj: IFormGroupValue): void {

  }

  public hasWorkflowButtons() {
    const html = this.html;
    return (html.currentProfile.ProfileStatusId === html.phxConstants.ProfileStatus.Active ||
      html.currentProfile.ProfileStatusId === html.phxConstants.ProfileStatus.Draft || html.currentProfile.ProfileStatusId ===
      html.phxConstants.ProfileStatus.Recalled || html.currentProfile.ProfileStatusId === html.phxConstants.ProfileStatus.Declined ||
      html.currentProfile.ProfileStatusId === html.phxConstants.ProfileStatus.ComplianceDraft || html.currentProfile.ProfileStatusId ===
      html.phxConstants.ProfileStatus.RecalledCompliance);
  }


  onOutputEvent() {
    this.outputEvent.emit();
  }

  onUpdateBreadcrumb() {
    this.updateBreadcrumb.emit();
  }

  @ViewChild(PhxDialogComponent) phxDialogComponent: PhxDialogComponent;
  @ViewChildren(PhxWorkflowButtonsComponent) buttonActionButtons: QueryList<PhxWorkflowButtonsComponent>;

  @Input() contact: IContact;

  stateActions: StateAction[];
  availableStateActions: StateAction[];
  ActionDisplayType = StateActionDisplayType;

  private COMMON_ERROR_MSG = 'Action execution failed';
  loggedInProfile: any;
  html: {
    ValidationMessages: {
      PropertyName: string,
      Message: string
    }[],
    currentProfiles: Array<IProfileHeader>;
    currentProfile: IProfile;
    phxConstants: typeof PhxConstants;
    stateParams: {
      profileId: number;
      contactId: number;
      profileType: string;
    }
  } = {
      ValidationMessages: [],
      currentProfile: null,
      phxConstants: PhxConstants,
      currentProfiles: [],
      stateParams: {
        contactId: 0,
        profileId: 0,
        profileType: ''
      }
    };

  constructor(
    private profileService: ProfileService,
    private spinner: LoadingSpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogs: DialogService,
    private $profileObservableService: ProfileObservableService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private stateService: StateService,
    private authService: AuthService
  ) {
    super();
  }

  private get currentProfileTypeCode() {
    return this.html.currentProfile ? this.codeValueService.getCodeValue(this.html.currentProfile.ProfileTypeId, this.codeValueGroups.ProfileType).code :
      '';
  }

  private get currentProfileTypeText() {
    return this.html.currentProfile ? this.codeValueService.getCodeValue(this.html.currentProfile.ProfileTypeId, this.codeValueGroups.ProfileType).text :
      '';
  }

  ngOnInit() {
    this.codeValueGroups = this.commonService.CodeValueGroups;

    this.activatedRoute.params
      .takeUntil(this.isDestroyed$)
      .subscribe(params => {
        this.html.stateParams.contactId = params.contactId;
        this.html.stateParams.profileId = params.profileId;
        this.html.stateParams.profileType = params.profileType;
      });

    this.reload();
  }

  getProfileFromForm() {
    const profile = ContactProfilesComponent.formGroupToPartial(this.html.currentProfile, this.inputFormGroup);
    const profileTypeId = this.html.currentProfile.ProfileTypeId;

    if (profileTypeId === PhxConstants.ProfileType.Organizational) {
      return profile.OrganizationalProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.Internal) {
      return profile.InternalProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerTemp) {
      return profile.TempProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerCanadianSP) {
      return profile.CanadianSPProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerCanadianInc) {
      return profile.CanadianIncProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerSubVendor) {
      return profile.CanadianEngagementSubVendorProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesW2) {
      return profile.W2WorkerProfile;
    } else if (profileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesLLC) {
      return profile.LLCWorkerProfile;
    } else {
      return null;
    }
  }

  reload() {
    this.profileService.getContactProfiles(this.html.stateParams.contactId)
      .takeUntil(this.isDestroyed$)
      .subscribe(profiles => {
        this.html.currentProfiles = (profiles.Items);
      });

    console.log('User Profile: [' + new Date().toISOString().slice(11, -5) + '] - contact-profile reload() start');

    this.$profileObservableService.profileOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: IProfile) => {
        if (response) {
          this.html.currentProfile = response;
          this.html.currentProfile.ProfileTypeCode = this.currentProfileTypeText;

          if (this.buttonActionButtons && this.buttonActionButtons.last) {
            this.buttonActionButtons.last.repaintActionButtons();
          }

          this.loggedInProfile = this.$profileObservableService.currentProfile;

          this._initStateActions(response);
        }
      });
  }

  isProfileActive(profile: IProfile) {
    return profile && profile.Id === this.html.currentProfile.Id;
  }

  _initStateActions(profile: IProfile) {
    const self = this;
    self.availableStateActions = profile.AvailableStateActions;
    self.stateActions = [
      {
        actionId: StateActionConst.UserProfileEdit,
        onClick: function (action, componentOption, actionOption) {
          const payload = { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile };
          self.doEdit(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileDeactivate,
        onClick: function (action, componentOption, actionOption) {
          const payload = { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile };
          self.deactivateProfile(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileActivate,
        onClick: function (action, componentOption, actionOption) {
          const payload = { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile };
          self.activateProfile(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileDiscard,
        onClick: function (action, componentOption, actionOption) {
          const payload = { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile };
          self.discardProfile(action.commandName, profile, payload);
        },
        hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => componentOption.displayType !== StateActionDisplayType.DROPDOWN
      },
      {
        actionId: StateActionConst.UserProfileSubmit,
        style: StateActionButtonStyle.PRIMARY,
        onClick: function (action, componentOption, actionOption) {
          const p = self.getProfileFromForm();
          const payload = Object.assign(p, { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.confirmSubmit(profile).then(confirmed => {
            if (confirmed) {
              self.onUpdateBreadcrumb();
              self.doSubmit(action.commandName, profile, payload);
            }
          });
        },
        disabledFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.inputFormGroup.valid
      },
      {
        actionId: StateActionConst.UserProfileFinalize,
        style: StateActionButtonStyle.PRIMARY,
        onClick: function (action, componentOption, actionOption) {
          const p = self.getProfileFromForm();
          const payload = Object.assign(p, { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.confirmSubmit(profile).then(confirmed => {
            if (confirmed) {
              self.onUpdateBreadcrumb();
              self.doFinalize(action.commandName, profile, payload);
            }
          });
        },
        disabledFn: (action: StateAction, componentOption: StateActionButtonsOption) => !this.inputFormGroup.valid
      },
      {
        actionId: StateActionConst.UserProfileSave,
        sortOrder: 2,
        onClick: function (action, componentOption, actionOption) {
          const p = self.getProfileFromForm();
          const payload = Object.assign(p, { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.confirmSubmit(profile).then(confirmed => {
            if (confirmed) {
              self.onUpdateBreadcrumb();
              self.profileSaveConfirmed(action.commandName, profile, payload);
            }
          });
        }
      },
      {
        actionId: StateActionConst.UserProfileDecline,
        sortOrder: 1,
        onClick: function (action, componentOption, actionOption) {
          const payload = Object.assign(self.clearPaymentMethods(profile), { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.declineProfile(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileRecall,
        sortOrder: 4,
        onClick: function (action, componentOption, actionOption) {
          const payload = Object.assign(self.clearPaymentMethods(profile), { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.doRecall(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileRecallToCompliance,
        sortOrder: 3,
        onClick: function (action, componentOption, actionOption) {
          const payload = Object.assign(self.clearPaymentMethods(profile), { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.doRecallToCompliance(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileApprove,
        style: StateActionButtonStyle.PRIMARY,
        onClick: function (action, componentOption, actionOption) {
          const payload = Object.assign(self.clearPaymentMethods(profile), { EntityIds: [profile.Id], EntityTypeId: EntityType.UserProfile });
          self.doApprove(action.commandName, profile, payload);
        }
      },
      {
        actionId: StateActionConst.UserProfileCreateAdjustment,
        hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
          return !(profile.ProfileStatusId === ProfileStatus.Active &&
            (profile.ProfileTypeId === ProfileType.WorkerTemp || profile.ProfileTypeId === ProfileType.WorkerCanadianSp));
        },
        onClick: function (action, componentOption, actionOption) {
          self.toCreateAdjustmentPage(profile);
        }
      },
      {
        actionId: StateActionConst.UserProfileReassign,
        onClick: function (action, componentOption, actionOption) {
          self.toInternalUserReassign();
        },
        hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
          return profile.ProfileTypeId !== ProfileType.Internal;
        }
      },
      {
        displayText: 'Cancel', // non state action
        commandName: Command.UserProfileCancel,
        onClick: (action, componentOption, actionOption) => {
          this.spinner.show();
          this.stateService.dispatchOnAction(new ProfileAction.ProfileRefresh(profile.Id));
          this.spinner.hide();
        },
        hiddenFn: (action: StateAction, componentOption: StateActionButtonsOption) => {
          return !profile.ReadOnlyStorage.IsEditable;
        }
      },
    ];
  }

  private combineProfileData(profile: IProfile, payload: any) {
    profile = Object.assign(this.clearPaymentMethods(profile), payload);

    if (profile.IsDraft) {
      const userProfileFunctionalRoles = filter(this.html.currentProfile.UserProfileFunctionalRoles, function (role) {
        return role.FunctionalRoleId > 0;
      });

      profile.UserProfileFunctionalRoles = userProfileFunctionalRoles;
    }

    profile.UserProfileId = this.html.currentProfile.Id;

    if (!profile.IsWorkerOnImpliedStatus) {
      profile.ImpliedStatusEffectiveDate = null;
    }

    if (profile.WorkPermitTypeId === WorkPermitType.OpenRestricted || profile.WorkPermitTypeId === WorkPermitType.OpenUnrestricted) {
      profile.ClosedWorkPermitCompany = null;
    }

    // If worker is not a foreign worker, all related fields should be emptied
    if (profile.WorkerEligibilityId !== PhxConstants.WorkerEligibility.ForeignWorker) {
      profile.TemporaryForeignPermitTypeId = null;
      profile.IsWorkerOnImpliedStatus = null;
      profile.ImpliedStatusEffectiveDate = null;
      profile.IECCategoryStudentTypeId = null;
      profile.EligibilityForWorkPermitId = null;
      profile.WorkPermitNumber = null;
      profile.WorkPermitTypeId = null;
      profile.ClosedWorkPermitCompany = null;
      profile.WorkPermitRestrictions = null;
      profile.WorkPermitExpiryDate = null;
    }
    return profile;
  }

  profileSaveConfirmed(commandName: string, profile: IProfile, payload: any) {
    const that = this;
    that.html.ValidationMessages = [];
    that.spinner.show();

    profile = this.combineProfileData(profile, payload);

    this.profileService.executeProfileCommand(commandName, null, profile).then(
      function (rsp) {
        that.onWorkflowEventSuccess(rsp, profile, 'Profile saved successfully');
        that.spinner.hide();
      },
      function (error) {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  doSubmit(commandName: string, profile: IProfile, payload: any) {
    this.html.ValidationMessages = [];
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);

    if (profile.WorkPermitTypeId !== WorkPermitType.Closed && profile.WorkPermitTypeId !== WorkPermitType.Other) {
      profile.ClosedWorkPermitCompany = null;
    }

    this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile submitted successfully');
        this.spinner.hide();
      },
      (error) => {
        this.triggerComplianceDocumentRefresh = uuid.v4(); // bug 467 validation failed should refresh the doc section
        this.onResponseError(error, this.COMMON_ERROR_MSG);
        this.spinner.hide();
      });
  }

  doFinalize(commandName: string, profile: IProfile, payload) {
    this.html.ValidationMessages = [];
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);

    this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile finalized successfully');
        this.spinner.hide();
      },
      (error) => {
        this.onResponseError(error, this.COMMON_ERROR_MSG);
        this.triggerComplianceDocumentRefresh = uuid.v4();
        this.spinner.hide();
      });
  }


  doDeactivate(commandName: string, profile: IProfile, payload: any) {
    const that = this;
    that.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Your deactivation request has been submitted for approval.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  deactivateProfile(commandName: string, profile: IProfile, payload) {
    const that = this;
    if (profile.ProfileTypeId === PhxConstants.UserProfileType.Internal && that.isCurrentProfileUnderReassignRole) {
      const dialogConfig = { contactName: that.contact.FirstName + ' ' + that.contact.LastName };
      const msgBody = `Your deactivation request for ${dialogConfig.contactName} will be submitted for approval.`;
      this.phxDialogComponentConfigModel = {
        HeaderTitle: 'Deactivate User',
        BodyMessage: msgBody,
        Buttons: [
          {
            Id: 1,
            SortOrder: 3,
            CheckValidation: true,
            Name: 'OK',
            Class: 'btn-primary',
            ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
              that.doDeactivate(commandName, profile, payload);
            }
          },
          {
            Id: 2,
            SortOrder: 2,
            CheckValidation: false,
            Name: 'Cancel',
            Class: 'btn-default',
            ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
              that.spinner.hide();
            }
          },
          {
            Id: 3,
            SortOrder: 1,
            CheckValidation: true,
            Name: 'Yes & Reassign',
            Class: 'btn-default',
            ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
              that.doDeactivate(commandName, profile, payload).then(function (res) {
                setTimeout(() => {
                  that.spinner.show();
                  that.toInternalUserReassign();
                  that.spinner.hide();
                }, 3000);
              });
            }
          }
        ],
        ObjectDate: null,
        ObjectComment: null
      };

      this.phxDialogComponent.open();
    } else {

      const dlg = this.dialogs.confirm('Deactivate User Profile', 'This profile will be deactivated. Continue?');

      dlg.then((btn) => {
        that.doDeactivate(commandName, profile, payload);
      }, (btn) => {

      });
    }
  }


  doDecline(commandName: string, profile: IProfile, payload) {
    const that = this;

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, this.phxDialogComponentConfigModel.ObjectComment.Value, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile declined successfully.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  declineProfile(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.phxDialogComponentConfigModel = {
      HeaderTitle: 'Enter Reason',
      BodyMessage: '',
      Buttons: [
        {
          Id: 1,
          SortOrder: 2,
          CheckValidation: true,
          Name: 'OK',
          Class: 'btn-primary',
          ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
            that.doDecline(commandName, profile, payload);
          }
        },
        {
          Id: 2,
          SortOrder: 1,
          CheckValidation: false,
          Name: 'Cancel',
          Class: 'btn-default',
          ClickEvent: (result: PhxDialogComponentEventEmitterInterface) => {
            that.spinner.hide();
          }
        }
      ],
      ObjectDate: null,
      ObjectComment: {
        HelpBlock: 'Reason must be entered',
        IsRequared: true,
        LengthMin: 0,
        LengthMax: 32000,
        Label: 'Reason'
      }
    };

    this.phxDialogComponent.open();
  }

  doRecall(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile recalled successfully.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  doRecallToCompliance(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile recalled successfully.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  doApprove(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Profile approved successfully.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  doEdit(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.spinner.show();
    const d = {
      UserProfileId: profile.Id,
      ContactId: profile.ContactId,
      FirstName: this.contact.FirstName,
      LastName: this.contact.LastName,
      PersonTitleId: this.contact.PersonTitleId,
      PreferredPersonTitleId: this.contact.PreferredPersonTitleId,
      PreferredFirstName: this.contact.PreferredFirstName,
      PreferredLastName: this.contact.PreferredLastName,
      CultureId: this.contact.CultureId,
      AssignedToUserProfileId: this.contact.AssignedToUserProfileId,
    };

    profile = this.combineProfileData(profile, Object.assign(d, payload));
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Editing profile created successfully.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  discardProfile(commandName: string, profile: IProfile, payload: any) {
    const that = this;
    this.phxDialogComponentConfigModel = this.createConfirmDialog({
      title: 'Discard User Profile',
      message: 'Are you sure you want to discard this User Profile?',
      onYes: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
        if (that.html.currentProfile.Id > 0) {
          that.doDiscard(commandName, profile, payload);
        } else {
          that.commonService.logSuccess('Profile deleted successfully');
          that.navigateToSearch();
        }
      },
      onNo: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
        that.spinner.hide();
      }
    });

    this.phxDialogComponent.open();
  }

  doDiscard(commandName: string, profile: IProfile, payload) {
    const that = this;
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        const sourceId = that.html.currentProfile.SourceId;
        if (sourceId) {
          this.onWorkflowEventSuccess(rsp, profile, 'Profile deleted successfully.');
          this.spinner.hide();
        } else {
          that.navigateToSearch();
          that.commonService.logSuccess('Profile deleted successfully');
        }
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  activateProfile(commandName: string, profile: IProfile, payload: any) {
    const that = this;
    this.phxDialogComponentConfigModel = this.createConfirmDialog({
      title: 'Activate User Profile',
      message: 'This profile will be Activated. Continue?',
      onYes: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
        that.doActivate(commandName, profile, payload);
      },
      onNo: (callBackObj: PhxDialogComponentEventEmitterInterface) => {
        that.spinner.hide();
      }
    });

    this.phxDialogComponent.open();
  }


  doActivate(commandName: string, profile: IProfile, payload: any) {
    const that = this;
    this.spinner.show();

    profile = this.combineProfileData(profile, payload);
    return this.profileService.executeProfileCommand(commandName, null, profile).then(
      (rsp) => {
        this.onWorkflowEventSuccess(rsp, profile, 'Your activation request has been submitted for approval.');
        this.spinner.hide();
      },
      (error) => {
        that.onResponseError(error, that.COMMON_ERROR_MSG);
        that.spinner.hide();
      });
  }

  toCreateAdjustmentPage(profile: IProfile) {
    if (profile.ProfileStatusId === ProfileStatus.Active &&
      (profile.ProfileTypeId === ProfileType.WorkerTemp || profile.ProfileTypeId === ProfileType.WorkerCanadianSp)) {
      this.router.navigate(['next', 'contact', 'transaction', 'adjustment', profile.Id, 0]);
    }
  }


  navigateTo(profileTypeCode: string, profileId: number, contactId: number) {
    this.router.navigate(['/next', 'contact', contactId, 'profile', profileTypeCode, profileId]);
  }

  createConfirmDialog(config: {
    title: string;
    message: string;
    yesButtonText?: string;
    noButtonText?: string;
    onYes: (PhxDialogComponentEventEmitterInterface) => void;
    onNo: (PhxDialogComponentEventEmitterInterface) => void;
  }): PhxDialogComponentConfigModel {
    return {
      HeaderTitle: config.title,
      BodyMessage: config.message,
      Buttons: [
        {
          Id: 1,
          SortOrder: 2,
          CheckValidation: true,
          Name: config.yesButtonText ? config.yesButtonText : 'Yes',
          Class: 'btn-primary',
          ClickEvent: config.onYes
        },
        {
          Id: 2,
          SortOrder: 1,
          CheckValidation: false,
          Name: config.noButtonText ? config.noButtonText : 'No',
          Class: 'btn-default',
          ClickEvent: config.onNo
        }
      ],
      ObjectDate: null,
      ObjectComment: null
    };
  }

  toInternalUserReassign() {
    const that = this;
    let contactId = that.html.currentProfile.SourceContactId;
    let sourceProfileId = that.html.currentProfile.SourceId;
    if (!sourceProfileId) {
      contactId = that.html.currentProfile.ContactId;
      sourceProfileId = that.html.currentProfile.Id;
    }
    const url = `next/contact/internal-user-reassign/contact/${contactId}/profile/${sourceProfileId}`;
    that.router.navigate([url]).catch(err => {
      that.commonService.logError('Navigation failed');
    });
  }

  navigateToSearch = () => {
    this.router.navigate([`search`], { relativeTo: this.activatedRoute.parent.parent }).catch(err => {
      console.error(`app-contact: error navigating to next/contact/search`, err);
    });
    this.spinner.hideAll();
  };



  confirmSubmit(profile: IProfile) {

    return new Promise((resolve, reject) => {

      const messageBody = [];

      if (profile.DateOfBirth && new Date(profile.DateOfBirth).getFullYear() > 0) {
        const age = this.commonService.calculateAge(profile.DateOfBirth, new Date().toDateString());

        if (age < 16) {
          messageBody.push('The worker is under 16 years old');
        }
        if (age > 65) {
          messageBody.push('The worker is over 65 years old');
        }
      }

      const differentSINSameContactMessages = this.profileService.getUserProfileWithDifferentSINInSameContact(profile.Id,
        profile.SIN).then((result) => {
          if (result && result.length > 0) {
            messageBody.push(
              (messageBody.length > 0 ? 'the ' : 'The ') +
              'SIN entered in the ' +
              profile.ProfileTypeCode +
              ' profile is different from other profiles within this contact'
            );
          }
        });

      let differentSINMessages: Promise<void>;
      if ((<any>window).allowDuplicateSIN && profile.SIN) {
        differentSINMessages = this.profileService.isSINDuplicated(profile.Id,
          profile.SIN).then(function (result) {
            if (result) {
              messageBody.push('The SIN number already exists');
            }
          });
      } else {
        differentSINMessages = Promise.resolve();
      }

      Promise.all([differentSINSameContactMessages, differentSINMessages]).then((results) => {
        if (messageBody.length > 0) {
          const title = 'Confirm';
          const message = messageBody.join('.<br> </br> ') + '. Do you want to continue?';
          this.dialogs.confirm(title, message).then((btn) => {
            resolve(true);
          }, function (btn) {
            resolve(false);
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  clearPaymentMethods(profile: IProfile) {
    if (profile.ProfileTypeId === PhxConstants.ProfileType.Organizational ||
      profile.ProfileTypeId === PhxConstants.ProfileType.Internal ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesLLC ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerSubVendor ||
      profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianInc) {
      profile.UserProfilePaymentMethods = null;
    }
    return profile;
  }

  private get isCurrentProfileUnderReassignRole() {
    const fRoles = filter(this.loggedInProfile.FunctionalRoles, function (role) {
      return role.FunctionalRoleId > 0;
    });

    return filter(fRoles, function (item) {
      return (
        item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice
        || item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance
        || item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator
        || item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller
        || item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP
        || item.FunctionalRoleId === PhxConstants.FunctionalRole.AccountsReceivable
      );
    }).length > 0;
  }

  // rsp --- object return from this.Notify(new NonWorkflowEvent())
  public onWorkflowEventSuccess(rsp: any, profile: IProfile, message: string) {
    this.html.ValidationMessages = [];
    const stateIncludesFilter: string = '/next/';
    const groupingEntityTypeId: number = PhxConstants.EntityType.UserProfile;
    const targetEntityTypeId: number = PhxConstants.EntityType.UserProfile;

    if (message && message.length > 0) {
      this.commonService.logSuccess(message);
    }

    this.spinner.hide();
    console.log('User Profile: [' + new Date().toISOString().slice(11, -5) + '] - ' + rsp.CommandName + ' onWorkflowEventSuccess start');
    if (rsp.CommandName === Command.UserProfileDelete) {
      this.navigateToSearch();
    } else if (rsp.CommandName === Command.UserProfileEdit || rsp.CommandName === Command.UserProfileFinalize || rsp.CommandName === Command.UserProfileSubmit) {
      this.$profileObservableService.profile$(this, rsp.EntityId, profile.ProfileTypeId)
        .takeUntil(this.isDestroyed$)
        .subscribe((p: IProfile) => {
          if (p) {
            this.stateService.dispatchOnAction(new ProfileAction.ProfileRefresh(p.Id));
            this.router.navigateByUrl('/next/contact/' + p.ContactId + '/profile/' + this.currentProfileTypeCode + '/' + p.Id);
          }
        });
    } else if (rsp.CommandName === Command.UserProfileApprove || rsp.CommandName === Command.UserProfileDiscard) {
      if (profile.SourceId) {
        this.stateService.dispatchOnAction(new ProfileAction.ProfileRefresh(profile.SourceId));
        this.router.navigate(['/next/contact/' + profile.SourceContactId + '/profile/' + this.currentProfileTypeCode + '/' + profile.SourceId]);
      } else {
        this.stateService.dispatchOnAction(new ProfileAction.ProfileRefresh(profile.Id));
      }
    } else {
      this.stateService.dispatchOnAction(new ProfileAction.ProfileRefresh(profile.Id));
    }
  }

  onResponseError(responseError, errorMessage = null) {
    if (errorMessage && errorMessage.length > 0) {
      this.commonService.logError(errorMessage);
    }

    this.html.ValidationMessages = this.commonService.parseResponseError(responseError);
  }

  buttonClass(command: WorkflowAction) {
    if (command.CommandName.indexOf('Approve') > -1) {
      return 'primary';
    }
    switch (command.CommandName) {
      case 'UserProfileSubmit':
      case 'UserProfileFinalize':
      case 'UserProfileApproval':
        return 'primary';
      default:
        return 'default';
    }
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, profile: IProfile, codeValueService: CodeValueService, codeValueGroups: any): FormGroup<ITabProfiles> {
    const formGroup = formGroupSetup.formBuilder.group<ITabProfiles>({
      OrganizationalProfile: profile.ProfileTypeId === PhxConstants.ProfileType.Organizational
        ? ContactOrganizationalProfileComponent.formBuilderGroupSetup(formGroupSetup, profile) : null,
      InternalProfile: profile.ProfileTypeId === PhxConstants.ProfileType.Internal
        ? ContactInternalProfileComponent.formBuilderGroupSetup(formGroupSetup, profile) : null,
      TempProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerTemp
        ? ContactTempProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null,
      CanadianSPProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianSP
        ? ContactCanadianSpProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null,
      CanadianIncProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerCanadianInc
        ? ContactCanadianIncProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null,
      CanadianEngagementSubVendorProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerSubVendor
        ? ContactCanadianEngagementSubVendorProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null,
      W2WorkerProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesW2
        ? ContactUnitedStatesW2ProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null,
      LLCWorkerProfile: profile.ProfileTypeId === PhxConstants.ProfileType.WorkerUnitedStatesLLC
        ? ContactUnitedStatesLlcProfileComponent.formBuilderGroupSetup(formGroupSetup, profile, codeValueService, codeValueGroups) : null
    });

    return formGroup;
  }

  public static formGroupToPartial(profile: IProfile, formGroup: FormGroup<ITabProfiles>): ITabProfiles {
    return {
      ...formGroup.value
    };
  }

  private showActions(profile: IProfile) {
    return profile && profile.AvailableStateActions && profile.AvailableStateActions.length > 0 &&
      !(this.$profileObservableService.IsInternalProfile(profile) && !this.authService.hasFunctionalOperation(FunctionalOperation.UserProfileEditTypeInternal));
  }
}
