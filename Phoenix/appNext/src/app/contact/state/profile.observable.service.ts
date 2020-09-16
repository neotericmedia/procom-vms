// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { getRouterState } from '../../common/state/router/reducer';
import { PhxConstants, CommonService } from '../../common';
import { ApiService } from '../../common/services/api.service';
import { StateService } from '../../common/state/service/state.service';
import { BaseComponentOnDestroy } from '../../common/state/epics/base-component-on-destroy';
import { IRouterState } from './../../common/state/router/reducer';
// organization
import { IProfile, IReadOnlyStorage } from './profile.interface';
import { ProfileAction } from './profile.action';
import { ProfileState } from './profile.state';
import { filter } from 'lodash';
import { AuthService } from '../../common/services/auth.service';
import { UserProfile, FunctionalRole } from '../../common/model';

const isDebugMode: boolean = true;
const StateAction = PhxConstants.StateAction;
const UserProfileType = PhxConstants.UserProfileType;
const FunctionalOperation = PhxConstants.FunctionalOperation;

@Injectable()
export class ProfileObservableService {
  currentProfile: UserProfile;
  private functionalRoles: FunctionalRole[];
  static isLoading: { [Id: number]: boolean } = {};

  constructor(private apiService: ApiService, private stateService: StateService, public commonService: CommonService, public authService: AuthService) {}

  private muteFirst = <T, R>(first$: Observable<T>, second$: Observable<R>) => Observable.combineLatest(first$, second$, (a, b) => b).distinctUntilChanged();

  private getObservableProfile_from_Server$ = (profileTypeId: number, profileId: number, showLoader: boolean,component: BaseComponentOnDestroy, oDataParams?: any ): Observable<IProfile> =>
    Observable.create(observer => {
      Promise.all([
        this.apiService.query('UserProfile/' + profileTypeId + '/getUserProfileType/' + profileId, showLoader),
        new Promise(resolve => {
          this.authService.getCurrentProfile().takeUntil(component.isDestroyed$).subscribe((response: UserProfile) => {
            resolve(response);
          });
        })
      ])
        .then((result: Array<any>) => {
          const profile: IProfile = result[0];
          this.currentProfile = result[1];
          this.functionalRoles = this.currentProfile.FunctionalRoles;
          const readOnlyStorage: Readonly<IReadOnlyStorage> = {
            IsDebugMode: isDebugMode,
            IsEditable:
              profile.AvailableStateActions &&
              profile.AvailableStateActions.some(action => +action === StateAction.UserProfileSave) &&
              !(this.IsInternalProfile(profile) && !this.authService.hasFunctionalOperation(FunctionalOperation.UserProfileEditTypeInternal)),
            AccessActions: profile.AccessActions
          };

          this.setEditability(profile);
          this.setProfileTypeFlags(profile);
          this.stateService.dispatchOnAction(new ProfileAction.ProfileAdd(profileId, { ...profile, ReadOnlyStorage: readOnlyStorage }));
          ProfileObservableService.isLoading[profileId] = false;

          observer.next({ ...profile, ReadOnlyStorage: readOnlyStorage });
          observer.complete();
        })
        .catch(responseError => {
          ProfileObservableService.isLoading[profileId] = false;
          observer.next(responseError);
          observer.complete();
        });
    });

  public IsInternalProfile(profile: IProfile) {
    return profile && profile.Id > 0 && profile.ProfileTypeId === UserProfileType.Internal;
  }

  public setEditability(profile: IProfile) {
    const isProfileStatusComplianceDraft = this.isComplianceDraftStatus(profile.ProfileStatusId);
    const iscurrentProfileUnderComplianceRole = this.currentProfileUnderComplianceRole();

    const isDraftStatus =
      profile.ProfileStatusId === PhxConstants.ProfileStatus.New ||
      profile.ProfileStatusId === PhxConstants.ProfileStatus.Draft ||
      profile.ProfileStatusId === PhxConstants.ProfileStatus.Declined ||
      profile.ProfileStatusId === PhxConstants.ProfileStatus.Recalled ||
      (isProfileStatusComplianceDraft && iscurrentProfileUnderComplianceRole);

    profile.IsDraftStatus = isDraftStatus;
    profile.ValidateComplianceDraft = !(profile.IsDraftStatus && !isProfileStatusComplianceDraft);
    profile.AreComplianceFieldsEditable = iscurrentProfileUnderComplianceRole && isProfileStatusComplianceDraft;
  }

  private isComplianceDraftStatus(statusId) {
    return statusId === PhxConstants.ProfileStatus.ComplianceDraft || statusId === PhxConstants.ProfileStatus.RecalledCompliance;
  }

  private currentProfileUnderComplianceRole() {
    return (
      filter(this.functionalRoles, item => {
        return (
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOffice ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Finance ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.Controller ||
          item.FunctionalRoleId === PhxConstants.FunctionalRole.BackOfficeARAP
        );
      }).length > 0
    );
  }

  private setProfileTypeFlags(profile: IProfile) {
    profile.isProfileW2OrTempOrSP =
      profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesW2 || profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerTemp || profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp;
    profile.isProfileW2OrTemp = profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerUnitedStatesW2 || profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerTemp;
    profile.isProfileTempOrSP = profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerTemp || profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp;
    profile.isProfileSP = profile.ProfileTypeId === PhxConstants.UserProfileType.WorkerCanadianSp;
  }

  private getIsLoading_from_store = (Id: number): boolean => {
    const isLoading = ProfileObservableService.isLoading[Id];
    if (!isLoading) {
      ProfileObservableService.isLoading[Id] = true;
    }
    return isLoading;
  };

  private getObservableProfileFromStore = (profileId: number): string => ProfileState.reduxProfile.getProfileByProfileId(profileId).profileInstance;

  private getObservableProfile$ = (profileId: number, profileTypeId: number, showLoader: boolean, component: BaseComponentOnDestroy): Observable<IProfile> => 
    this.stateService
      .select(this.getObservableProfileFromStore(profileId))
      .filter(profile => !profile && !this.getIsLoading_from_store(profileId))
      .switchMap(() => this.getObservableProfile_from_Server$(profileTypeId, profileId, showLoader, component))
      .share();

  public profile$ = (component: BaseComponentOnDestroy, profileId: number, profileTypeId: number, showLoader: boolean = true): Observable<IProfile> => {
    return this.muteFirst(this.getObservableProfile$(profileId, profileTypeId, showLoader, component).startWith(null), this.stateService.select(this.getObservableProfileFromStore(profileId))).takeUntil(component.isDestroyed$);
  };

  public profileOnRouteChange$ = (component: BaseComponentOnDestroy, showLoader: boolean = true): Observable<IProfile> => {
    return this.stateService
      .selectOnAction(getRouterState)
      .switchMap((routerState: IRouterState) => {
        const profileId: number = routerState.params.profileId;
        let profileType = null, profileTypeId = null;
        if (routerState.params.profileType) {
          profileType = Object.keys(PhxConstants.ProfileType).find(i =>  i.toLowerCase() === routerState.params.profileType.toLowerCase());
          profileTypeId = PhxConstants.ProfileType[profileType];
        }
        return profileId && profileTypeId ? this.profile$(component, profileId, profileTypeId, showLoader) : Observable.of(null);
      })
      .takeUntil(component.isDestroyed$);
  };
}
