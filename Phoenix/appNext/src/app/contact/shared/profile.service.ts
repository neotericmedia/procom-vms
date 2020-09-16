import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, CodeValueService, CommonService, LoadingSpinnerService } from '../../common';
import { IProfile, IProfileHeader } from '../state';

@Injectable()
export class ProfileService {

  constructor(private apiService: ApiService,
    private codeValueService: CodeValueService,
    private commonService: CommonService,
    private loadingSpinnerService: LoadingSpinnerService
    ) { }

  private cache: any = {};

  private fetch<T>(profileid: number, callback: Function): Observable<T> {
    const key = `_${profileid}`;
    this.cache[key] = this.cache.hasOwnProperty(key) ? this.cache[key] : callback();
    const that = this;
    if (this.cache.hasOwnProperty(key)) {
      return Observable.from<T>(this.cache[key]);
    } else {
      return Observable.fromPromise(new Promise<T>((resolve, reject) => {
        callback().then((x: T) => {
          that.cache[key] = x;
          resolve(that.cache[key]);
        }).catch(x => reject(x));
      }));
    }
  }

  get(id) {
    const callback: Function = () => this.apiService.query('UserProfile/' + id);

    return this.fetch<IProfile>(id, callback);
  }

  public getContactProfiles(contactId) {
    return Observable.fromPromise<{ Items: IProfileHeader[]; }>(this.apiService.query(`Contact/${contactId}/getContactProfiles`));
  }

  discardProfile(command: { WorkflowPendingTaskId: number; UserProfileId: number }) {
    return this.apiService.command('UserProfileStatusToDiscard', command);
  }


  declineCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number, AdditionalNotes: string }) {
    return this.apiService.command('UserProfileDecline', command);
  }

  recallCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileRecall', command);
  }

  recallCurrentProfileToCompliance(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileRecallCompliance', command);
  }

  approveCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileApproval', command);
  }

  correctCurrentProfile(command: {
    WorkflowPendingTaskId: number;
    UserProfileId: number;
    ContactId: number;
    FirstName: string;
    LastName: string;
    PersonTitleId: number,
    PreferredPersonTitleId: number,
    PreferredFirstName: string,
    PreferredLastName: string,
    CultureId: number,
    AssignedToUserProfileId: number,
  }) {
    return this.apiService.command('UserProfileCorrect', command);
  }

  inactivateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileInactivate', command);
  }

  getContactsForOrganization(organizationId: number, oDataParams: string) {
    return this.apiService.query(`UserProfile/getProfilesForOrganization/${organizationId}?${oDataParams}`);
  }

  approveInactivateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileInactivateApprove', command);
  }

  declineInactivateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileInactivateDecline', command);
  }

  activateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileActivate', command);
  }

  approveActivateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileActivateApprove', command);
  }

  declineActivateCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileActivateDecline', command);
  }

  deleteCurrentProfile(command: { WorkflowPendingTaskId: number, UserProfileId: number }) {
    return this.apiService.command('UserProfileDelete', command);
  }

  getUserProfileWithDifferentSINInSameContact(id, SIN) {
    return this.apiService.query<any[]>(`UserProfile/${id}/getUserProfileWithDifferentSINInSameContact/${SIN}`);
  }

  isSINDuplicated(id, SIN) {
    return this.apiService.query<string[]>(`UserProfile/${id}/isSINDuplicated/${SIN}/`);
  }

  userProfileSetPrimary(contactId, profileId) {
    return this.apiService.command('UserProfileSetPrimary',
      { WorkflowPendingTaskId: -1, ContactId: contactId, ProfileId: profileId });
  }

  sendInvitation(primaryEmail: string, contactId: number, firstName: string, profileTypeId: number, profileId: number, cultureId: number) {
    const command = {
      EntityIds: [contactId],
      PrimaryEmail: primaryEmail,
      ProfileTypeId: profileTypeId,
      ProfileId: profileId,
      FirstName: firstName,
      CultureId: cultureId
    };

    return this.apiService.command('ContactInvite', command);
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



  public executeProfileCommand(commandName: string, workflowComments: string, payload: any, oDataParams = null) {
    if (workflowComments && workflowComments !== '') {
      payload.Comments = workflowComments;
    }

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then(r => {
          this.loadingSpinnerService.hideAll();
          if (!r.IsValid) {
            reject(r.ValidationMessages);
            return;
          } else {
            resolve(r);
          }


            // const query = `expenseClaim/${r.EntityId}${this.param(oDataParams)}`;
            // this.apiService.query(query)
            //   .then((response: ExpenseClaim) => {
            //     this.updateExpenseClaimState(response);
            //     this.loadingSpinnerService.hide();
            //     resolve(payload.EntityIds[0]);
            //   })
            //   .catch(ex => {
            //     console.error(query, ex);
            //     this.loadingSpinnerService.hideAll();
            //     reject(ex);
            //   });
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }

}
