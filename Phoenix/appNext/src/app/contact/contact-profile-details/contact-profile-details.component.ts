import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactBaseComponentPresentational } from '../contact-base-component-presentational';
import { IFormGroupSetup, ITabContactDetail, IProfile, IProfileBasicDetails, ProfileAction } from '../state';
import { IFormGroupValue } from '../../common/utility/form-group';
import { FormGroup, ControlsConfig } from '../../common/ngx-strongly-typed-forms/model';
import { Validators } from '@angular/forms';
import { ValidationExtensions } from '../../common';
import { CustomFieldErrorType } from '../../common/model';
import { ProfileService } from '../shared/profile.service';
import { ProfileObservableService } from '../state/profile.observable.service';
import { utc } from 'moment';
import { StateService } from '../../common/state/state.module';
import { AuthService } from '../../common/services/auth.service';

@Component({
  selector: 'app-contact-profile-details',
  templateUrl: './contact-profile-details.component.html',
  styleUrls: ['./contact-profile-details.component.less']
})
export class ContactProfileDetailsComponent extends ContactBaseComponentPresentational<IProfileBasicDetails> implements OnInit {
  public getCodeValuelistsStatic() {}

  public businessRules(obj: IFormGroupValue): void {}

  constructor(private profileService: ProfileService, private authService: AuthService, private stateService: StateService, private router: Router, private $profileObservableService: ProfileObservableService) {
    super('ContactProfileDetailsComponent');
  }

  html: {
    isAlowedToInvite: boolean;
    isInvited: boolean;
    profile: IProfile;
    email: string;
    invitationTooltip: string;
    invitationDate: string;
    stateParams: {
      profileId: number;
      contactId: number;
      profileType: string;
    };
  } = {
    invitationTooltip: null,
    invitationDate: null,
    isAlowedToInvite: false,
    isInvited: false,
    profile: null,
    email: null,
    stateParams: {
      contactId: 0,
      profileId: 0,
      profileType: ''
    }
  };

  ngOnInit() {
    this.html.email = this.inputFormGroup.value.PrimaryEmail;
    this.$profileObservableService
      .profileOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: IProfile) => {
        if (response) {
          this.html.profile = response;

          this.html.stateParams.contactId = this.html.profile.ContactId;
          this.html.stateParams.profileId = this.html.profile.Id;
          this.canInviate();

          if (this.html.profile.Contact) {
            this.html.invitationTooltip = this.html.profile.Contact.InvitationSent != null ? 'Last invitation sent on:' : 'No invitation has been sent.';
            this.html.invitationDate = this.html.profile.Contact.InvitationSent != null ? utc(this.html.profile.Contact.InvitationSent).format('MMM DD YYYY HH:mm') : null;
          }
        }
      });
  }

  canInviate() {
    this.authService.getCurrentProfile()
      .takeUntil(this.isDestroyed$)
      .subscribe(r => {
        if (r) {
          // r.Id
          if (this.html.profile.IsDraft || this.html.profile.Contact.LoginUserId > 0) {
            this.html.isAlowedToInvite = false;
          } else {
            this.html.isAlowedToInvite =
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.Organizational && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeOrganizational)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.Internal && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeInternal)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianInc && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerSubVendor && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2 && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
              (this.html.profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesLLC && this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.UserProfileInviteTypeWorker));
          }
        }
      });
  }

  public static formBuilderGroupSetup(formGroupSetup: IFormGroupSetup, profileDetails: IProfileBasicDetails): any {
    const formGroup: ControlsConfig<IProfileBasicDetails> = {
      ProfileTypeId: [profileDetails.ProfileTypeId],
      IsPrimary: [profileDetails.IsPrimary],
      PrimaryEmail: [profileDetails.PrimaryEmail, [Validators.email, ValidationExtensions.required(formGroupSetup.customFieldService.formatErrorMessage('PrimaryEmail', CustomFieldErrorType.required)), Validators.maxLength(250)]]
    };

    return formGroup;
  }

  makePrimary($event) {
    this.profileService.userProfileSetPrimary(this.html.stateParams.contactId, this.html.stateParams.profileId).then(
      result => {
        this.inputFormGroup.controls.IsPrimary.setValue(true);
        this.stateService.dispatchOnAction(new ProfileAction.ClearProfile());
        this.router.navigate([`/next/contact/${this.html.stateParams.contactId}/profile/${this.html.stateParams.profileType}/${this.html.stateParams.profileId}`]);
        this.commonService.logSuccess('Primary profile updated to the current profile');
      },
      function(error) {
        this.commonService.logError(`Error Message: ${error.Message}. CommandName: ${error.CommandName}`);
      }
    );
  }

  invite($event) {
    if (this.html.email !== this.inputFormGroup.value.PrimaryEmail) {
      this.commonService.logError("You have changed the email. You'll need to submit the form before inviting the user!");
      return;
    }

    this.profileService.sendInvitation(this.html.profile.PrimaryEmail, this.html.profile.Contact.Id, this.html.profile.Contact.FirstName, this.html.profile.ProfileTypeId, this.html.profile.Id, this.html.profile.Contact.CultureId).then(
      data => {
        this.commonService.logSuccess(`Invitation sent to ${this.html.profile.PrimaryEmail}`, true);
        this.html.isInvited = true;
      },
      data => {
        let message = '';
        if (data.ValidationMessages && data.ValidationMessages.length > 0) {
          for (let i = 0; i < data.ValidationMessages.length; i++) {
            message += `${data.ValidationMessages[i].Message} `;
          }
        } else {
          message = data.Message;
        }

        this.commonService.logError(`Failed to invite the user! Reason: ${message}`);
      }
    );
  }

  public static formGroupToPartial(contact: IProfile, formGroup: FormGroup<IProfileBasicDetails>): Partial<IProfile> {
    return {
      ...formGroup.value
    };
  }
}
