// angular
import { ISubscription } from 'rxjs/Subscription';
import { OnChanges, SimpleChanges, Input, OnInit } from '@angular/core';
// common
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '../common/ngx-strongly-typed-forms/model';
import { CommonService, PhxConstants, CodeValueService, CustomFieldService } from '../common';
import { AccessAction } from '../common/model/access-action';
import { BaseComponentOnDestroy } from '../common/state/epics/base-component-on-destroy';
import { CommonListsObservableService } from '../common/lists/lists.observable.service';
import { formGroupOnValueChange$, IFormGroupValue } from '../common/utility/form-group';
// organization
import { IReadOnlyStorage, IProfile } from './state/profile.interface';
import { ContactApiServiceLocator } from './contact.api.service.locator';
import { ContactBaseComponentPresentational } from './contact-base-component-presentational';
import { ProfileObservableService } from './state/profile.observable.service';
import { filter } from 'lodash';
import { AuthService } from '../common/services/auth.service';
import { FunctionalRole } from '../common/model';
import { ActivatedRoute } from '@angular/router';

export abstract class ContactProfilesPresentationalBase<T> extends ContactBaseComponentPresentational<T> {
  private functionalRoles: FunctionalRole[];

  private _currentProfile: IProfile;

  protected validateComplianceDraft: boolean;
  protected areComplianceFieldsEditable: boolean;
  protected isProfileW2OrTempOrSP: boolean;
  protected isProfileW2OrTemp: boolean;
  protected isProfileTempOrSP: boolean;
  protected isProfileSP: boolean;

  protected stateParams: {
    profileId: number;
    contactId: number;
    profileType: string;
  } = {
    contactId: 0,
    profileId: 0,
    profileType: ''
  };

  public get currentProfile(): IProfile {
    return this._currentProfile;
  }

  protected isDraftStatus: boolean;

  constructor(componentName: string, private profileObservableService: ProfileObservableService, private authService: AuthService, private activatedRoute: ActivatedRoute) {
    super(componentName);
    this.profileObservableService.profileOnRouteChange$(this, false)
      .takeUntil(this.isDestroyed$)
      .subscribe((response: IProfile) => {
        if (response) {
          this._currentProfile = response;

          this.authService.getCurrentProfile().subscribe(data => {
            this.functionalRoles = data.FunctionalRoles;
            this.setEditability(this.currentProfile);
            this.setProfileTypeFlags(this.currentProfile);
          });
        }
      });

    this.activatedRoute.params
      .takeUntil(this.isDestroyed$)
      .subscribe(params => {
        this.stateParams.contactId = params.contactId;
        this.stateParams.profileId = params.profileId;
        this.stateParams.profileType = params.profileType;
      });
  }

  private setEditability(profile: IProfile) {
    this.profileObservableService.setEditability(profile);
    this.validateComplianceDraft = profile.ValidateComplianceDraft;
    this.areComplianceFieldsEditable = profile.AreComplianceFieldsEditable;
  }

  private isComplianceDraftStatus(statusId) {
    return statusId === this.phxConstants.ProfileStatus.ComplianceDraft || statusId === this.phxConstants.ProfileStatus.RecalledCompliance;
  }

  private currentProfileUnderComplianceRole() {
    return (
      filter(this.functionalRoles, item => {
        return (
          item.FunctionalRoleId === this.phxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === this.phxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === this.phxConstants.FunctionalRole.SystemAdministrator ||
          item.FunctionalRoleId === this.phxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === this.phxConstants.FunctionalRole.BackOfficeARAP
        );
      }).length > 0
    );
  }

  private setProfileTypeFlags(profile: IProfile) {
    this.isProfileW2OrTempOrSP =
      profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2 ||
      profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp ||
      profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
    this.isProfileW2OrTemp = profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerUnitedStatesW2 || profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp;
    this.isProfileTempOrSP = profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerTemp || profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
    this.isProfileSP = profile.ProfileTypeId === this.phxConstants.UserProfileType.WorkerCanadianSp;
  }
}
