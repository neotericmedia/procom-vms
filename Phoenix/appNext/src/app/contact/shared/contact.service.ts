import { WorkflowService } from './../../common/services/workflow.service';
import { Injectable } from '@angular/core';
import { ApiService, CodeValueService, CommonService } from '../../common';
import { Observable } from '../../../../node_modules/rxjs';
import { CollaboratorWO, OrganizationCollaborator, ContactCollaborator, BranchManaged, Reassign, RecruiterWO, ReassignRecruiter, RecruiterProfile, ProfileReassignFrom } from './model';
import { PhxConstants } from '../../common';
import { CommandResponse } from '../../common/model';
import { uniq, isArray, slice, indexOf, remove } from 'lodash';

@Injectable()
export class ContactService {
  constructor(private apiService: ApiService, private codeValueService: CodeValueService, private commonService: CommonService, private workflowService: WorkflowService) {}

  getWorkOrderVersionsAssociatedToCollaborator(assignedToUserProfileId: number): Observable<CollaboratorWO[]> {
    return Observable.fromPromise(this.apiService.query(`assignment/collaborator/${assignedToUserProfileId}`).then((res: any) => res.Items));
  }
  getOrganizationsByCollaborator(assignedToUserProfileId: number): Observable<OrganizationCollaborator[]> {
    return Observable.fromPromise(this.apiService.query(`org/collaborator/${assignedToUserProfileId}`).then((res: any) => res.Items));
  }
  getProfilesByCollaborator(assignedToUserProfileId: number): Observable<ContactCollaborator[]> {
    return Observable.fromPromise(this.apiService.query(`Contact/collaborator/${assignedToUserProfileId}`).then((res: any) => res.Items));
  }
  getActiveInternalUserProfileList() {
    const filter = oreq.filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.Active);
    const oDataParams = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'Contact/Id', 'Contact/FullName'])
      .withFilter(filter)
      .url();
    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')).then((res: any) => res.Items));
  }
  getBranchByManager(assignedToUserProfileId: number): Observable<BranchManaged[]> {
    return Observable.fromPromise(
      this.apiService.query(`branch/manager/${assignedToUserProfileId}`).then((res: any) => {
        const branchManagedList: BranchManaged[] = res.Items.map(branch => {
          const branchManaged = new BranchManaged();
          branchManaged.CodeInternalOrganizationDefinition1Id = branch.CodeInternalOrganizationDefinition1Id;
          branchManaged.ManagerId = branch.Id;
          return branchManaged;
        });
        return branchManagedList;
      })
    );
  }
  inactivateProfile(userProfileId: number, workflowPendingTaskId: number): Promise<CommandResponse> {
    const inactivateCommand = { WorkflowPendingTaskId: workflowPendingTaskId, UserProfileId: userProfileId };
    return this.apiService.command('UserProfileInactivate', inactivateCommand);
  }

  reassignProfile(reassign: Reassign): Promise<CommandResponse> {
    return this.apiService.command('Reassign', reassign);
  }

  reassignRecruiterProfile(reassignRecruiter: ReassignRecruiter): Promise<CommandResponse> {
    return this.apiService.command('WorkOrderVersionRecruiterReassign', reassignRecruiter);
  }
  getWorkOrdersByRecruiter(recruiterProfileId: number): Observable<RecruiterWO[]> {
    return Observable.fromPromise(this.apiService.query(`assignment/getWorkOrdersByRecruiter/${recruiterProfileId}`).then((res: any) => res.Items));
  }
  getActiveRecruiters(branchId: number = null): Observable<RecruiterProfile[]> {
    let filter = oreq
      .filter('UserProfileCommissions')
      .any(
        oreq
          .filter('x/CommissionRoleId')
          .eq(this.commonService.ApplicationConstants.CommissionRole.RecruiterRole)
          .and()
          .filter('x/CommissionRateHeaderStatusId')
          .eq(this.commonService.ApplicationConstants.CommissionRateHeaderStatus.Active)
      )
      .and()
      .filter('UserProfileFunctionalRoles')
      .any(oreq.filter('x/FunctionalRoleId').eq(this.commonService.ApplicationConstants.FunctionalRole.Recruiter))
      .and()
      .filter('ProfileStatusId')
      .eq(this.commonService.ApplicationConstants.ProfileStatus.Active);
    if (branchId) {
      filter = filter
        .and()
        .filter('InternalOrganizationDefinition1Id')
        .eq(branchId);
    }
    const oDataParams = oreq
      .request()
      .withExpand(['UserProfileCommissions', 'Contact'])
      .withSelect(['Id', 'Contact/FullName', 'InternalOrganizationDefinition1Id'])
      .withFilter(filter)
      .url();
    return Observable.fromPromise(
      this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')).then((res: any) =>
        res.Items.map(x => {
          const recruiterProfile = new RecruiterProfile();
          recruiterProfile.ProfileId = x.Id;
          recruiterProfile.FullName = x.Contact.FullName;
          recruiterProfile.BranchId = x.InternalOrganizationDefinition1Id;
          return recruiterProfile;
        })
      )
    );
  }
  getProfileReassignFrom(sourceProfileId: number): Observable<ProfileReassignFrom> {
    const filter = oreq.filter('Id').eq(sourceProfileId);
    const oDataParams = oreq
      .request()
      .withExpand(['Contact', 'UserProfileFunctionalRoles'])
      .withSelect(['Id', 'ChildId', 'ContactId', 'ChildContactId', 'Contact/FullName', 'UserProfileFunctionalRoles'])
      .withFilter(filter)
      .url();
    return Observable.fromPromise(
      this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')).then((res: any) => {
        const profileReassignFrom: ProfileReassignFrom = new ProfileReassignFrom();
        if (res.Items.length) {
          const profileInfo = res.Items[0];
          profileReassignFrom.latestProfileId = profileInfo.ChildId ? profileInfo.ChildId : profileInfo.Id;
          profileReassignFrom.latestContactId = profileInfo.ChildContactId ? profileInfo.ChildContactId : profileInfo.ContactId;
          profileReassignFrom.FullName = profileInfo.Contact.FullName;
          profileReassignFrom.UserProfileFunctionalRoles = profileInfo.UserProfileFunctionalRoles;
        }
        return profileReassignFrom;
      })
    );
  }

  public getLoginInfo(id): Observable<any> {
    return Observable.fromPromise(this.apiService.query('Contact/LoginInfo?loginUserId=' + id));
  }

  public getListUserProfileInternal(oDataParams = null) {
    const internalDataParams = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'ProfileStatusId', 'Contact/Id', 'Contact/FullName'])
      .url();
    oDataParams = oDataParams || internalDataParams;

    return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false));
  }

  getListOrganizationClientForWorkerProfile(userProfileIdWorker, oDataParams?: any) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationClientForWorkerProfile/' + userProfileIdWorker + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getAllOriginalAccessSubscriptions(tableState, oDataParams) {
    const tableStateParams = this.generateRequestObject(tableState).url();
    return Observable.fromPromise(this.apiService.query('AccessSubscription/getAllOriginalAccessSubscriptions' + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '') + tableStateParams));
  }

  generateRequestObject(tableState) {
    const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
    const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
    let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
    const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
    const isDisabled = tableState && tableState.pagination && tableState.pagination.isDisabled ? tableState.pagination.isDisabled : null;
    currentPage--;
    let oDataParams = oreq.request();
    if (Object.keys(searchObj).length > 0) {
      oDataParams = oDataParams.withFilter(oreq.filter().smartTableObjectConverter(searchObj));
    }
    if (sortObj) {
      oDataParams = oDataParams.withOrderby(sortObj);
    }
    if (!(tableState && tableState.pagination && tableState.pagination.isDisabled === true)) {
      oDataParams = oDataParams
        .withTop(pageSize)
        .withSkip(currentPage * pageSize)
        .withInlineCount();
    } else {
      oDataParams = oDataParams.withInlineCount();
    }
    return oDataParams;
  }

  public getUserProfileGarnisheeDetail(profileId, garnisheeId) {
    return Observable.fromPromise(this.apiService.query('UserProfile/getUserProfileGarnisheeDetail/profile/' + profileId + '/garnishee/' + garnisheeId, false));
  }

  public garnisheeNewSave(command) {
    return Observable.fromPromise(this.apiService.command('GarnisheeNew', command));
  }

  public garnisheeSubmit(command) {
    return Observable.fromPromise(this.apiService.command('GarnisheeSubmit', command));
  }

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(oDataParams = null): Observable<any> {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code', 'IsTest'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : ''), false));
  }

  public getListGarnisheePayToGroup() {
    return Observable.fromPromise(this.apiService.query('org/getListGarnisheePayToGroup', false));
  }

  public getUserProfileAdvanceDetail(profileId, advanceId) {
    return Observable.fromPromise(this.apiService.query('UserProfile/getUserProfileAdvanceDetail/profile/' + profileId + '/advance/' + advanceId));
  }

  public contactAddProfile(command) {
    return Observable.fromPromise(
      new Promise<CommandResponse>((resolve, reject) => {
        this.apiService
          .command('ContactAddProfile', command)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      })
    );
  }

  public getListOriginalOrganizations(oDataQuery) {
    return Observable.fromPromise(this.apiService.query(`org/getListOriginalOrganizations?${oDataQuery}`));
  }

  public searchAllWorkerProfile(primaryEmail) {
    return Observable.fromPromise(this.apiService.query('UserProfile/getUserProfilesByPrimaryEmail?primaryEmail=' + primaryEmail + '&$orderby=Contact/FirstName,Contact/LastName,Contact/Id'));
  }

  public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole(oDataParams) {
    oDataParams =
      oDataParams ||
      oreq
        .request()
        .withSelect(['Id', 'DisplayName', 'Code'])
        .url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getContactProfiles(contactId) {
    return Observable.fromPromise(this.apiService.query('Contact/' + contactId + '/getContactProfiles'));
  }

  public searchProfiles(organizationId) {
    let oDataQuery: string;

    if (organizationId) {
      oDataQuery = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'OrganizationId', 'Contact/Id', 'Contact/FullName'])
      .withFilter(oreq.filter('OrganizationId').eq(organizationId))
      .withOrderby(['Contact/FullName'])
      .url();
    } else {
      oDataQuery = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'OrganizationId', 'Contact/Id', 'Contact/FullName'])
      .withOrderby(['Contact/FullName'])
      .url();
    }

    return Observable.fromPromise(this.apiService.query('UserProfile/' + 0 + `/getUserProfileTypes?${oDataQuery}`));
  }

  public searchProfiles2(organizationId: number, profileTypeId: number) {
    const oDataQuery = oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'Contact/Id', 'Contact/FullName'])
      .withFilter(oreq.filter('ProfileTypeId').eq(profileTypeId))
      .withOrderby(['Contact/FullName'])
      .url();

    return Observable.fromPromise(this.apiService.query(`UserProfile/getProfilesForOrganization/${organizationId || 0}?${oDataQuery}`));
  }

  public removeInactiveProfile(profiles, exceptionIds) {
    this.removeInactiveProfileWithConfig(null, profiles, exceptionIds);
  }

  public removeInactiveProfileWithConfig(config, profiles, exceptionIds) {
    const inactiveProfileStatusIds = [2, 9, 10];
    const settings = Object.assign({ profileStatusId: 'ProfileStatusId', id: 'Id' }, config);
    const exceptionProfileIds = uniq(isArray(exceptionIds) ? exceptionIds : slice(arguments, 2));
    remove(profiles, function(profile) {
      return indexOf(inactiveProfileStatusIds, profile[settings.profileStatusId]) > -1 && indexOf(exceptionProfileIds, profile[settings.id]) < 0;
    });
  }

  public getAdjustmentNew(workOrderVersionId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getAdjustmentNew/' + workOrderVersionId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getWorkflowAvailableActions(EntityTypeId: string, VersionId: number) {
    return Observable.fromPromise(this.apiService.query('task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/' + EntityTypeId + '/targetEntityId/' + VersionId));
  }

  // public transactionHeaderAdjustmentSubmit(command) {
  //   return Observable.fromPromise(this.apiService.command('TransactionHeaderAdjustmentSubmit', command).catch(ex => {
  //     return ex;
  //   }));
  // }

  public getSearchByUserProfileIdWorker(userProfileIdWOrker) {
    const path = 'getSearch';
    const oDataQuery = oreq
      .request()
      .withSelect([
        'WorkOrderFullNumber',
        'WorkerName',
        'WorkerProfileType',
        'WorkOrderStatus',
        'AssignmentId',
        'WorkOrderId',
        'WorkOrderStatusId',
        'WorkOrderVersionId',
        'InternalCompanyDisplayName',
        'OrganizationIdInternal',
        'UserProfileIdWorker'
      ])
      .withFilter(
        oreq
          .filter('UserProfileIdWorker')
          .eq(userProfileIdWOrker)
          .and()
          .filter('WorkOrderStatusId')
          .eq(PhxConstants.WorkOrderStatus.Active)
          .or()
          .filter('UserProfileIdWorker')
          .eq(userProfileIdWOrker)
          .and()
          .filter('WorkOrderStatusId')
          .eq(PhxConstants.WorkOrderStatus.Complete)
          .or()
          .filter('UserProfileIdWorker')
          .eq(userProfileIdWOrker)
          .and()
          .filter('WorkOrderStatusId')
          .eq(PhxConstants.WorkOrderStatus.Terminated)
          .or()
          .filter('UserProfileIdWorker')
          .eq(userProfileIdWOrker)
          .and()
          .filter('WorkOrderStatusId')
          .eq(PhxConstants.WorkOrderStatus.ChangeInProgress)
      )
      .url();

    return Observable.fromPromise(this.apiService.query('assignment/' + path + '?' + oDataQuery));
  }
}
