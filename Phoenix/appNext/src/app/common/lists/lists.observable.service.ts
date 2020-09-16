// angular
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// common
import { CommonService } from '../services/common.service';
import { StateService } from '../state/service/state.service';
import { PhxConstants } from '../model/phx-constants';
import { ApiService } from '../services/api.service';
import { EntityList } from '../model/entity-list';
// local
import { ICommonListsAction } from './lists.interface';
import { CommonListsObservables } from './lists.observables';

declare var oreq: any;

const getUserProfileByType = (profileType: PhxConstants.ProfileType): ICommonListsAction => {
  const commonListsAction: ICommonListsAction = {
    ListName: profileType.toString(),
    ApiQueryPath: `UserProfile/${profileType}/getUserProfileTypes`,
    oDataParams: oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'Contact/FullName'])
      .withFilter(
        oreq
          .filter('ProfileStatusId')
          .eq(PhxConstants.ProfileStatus.Active)
          .or()
          .filter('ProfileStatusId')
          .eq(PhxConstants.ProfileStatus.PendingChange)
      )
      .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      const resultList = responseSuccess.Items.map(item => {
        return {
          Id: item.Id,
          DisplayText: item.Contact.FullName
        };
      });
      return resultList;
    }
  };
  return commonListsAction;
};

@Injectable()
export class CommonListsObservableService {
  constructor(private apiService: ApiService, private stateService: StateService, public commonService: CommonService) {
    console.log('CommonListsObservableService.constructor');
  }

  private UserProfileInternal: ICommonListsAction = {
    ListName: PhxConstants.CommonListsNames.UserProfileInternal,
    ApiQueryPath: 'UserProfile/getListUserProfileInternal',
    oDataParams: oreq
      .request()
      .withExpand(['Contact'])
      .withSelect(['Id', 'Contact/FullName', 'Contact/Id'])
      .withFilter(
        oreq
          .filter('ProfileStatusId')
          .eq(PhxConstants.ProfileStatus.Active)
          .or()
          .filter('ProfileStatusId')
          .eq(PhxConstants.ProfileStatus.PendingChange)
      )
      .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      const resultList = responseSuccess.Items.map(item => {
        return {
          Id: item.Id,
          DisplayText: item.Contact.FullName + ' - ' + item.Contact.Id
        };
      });
      return resultList;
    }
  };

  private Organizations: ICommonListsAction = {
    ListName: PhxConstants.CommonListsNames.Organizations,
    ApiQueryPath: 'org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole',
    oDataParams: oreq
    .request()
    .withSelect(['Id', 'DisplayName', 'Code'])
    .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      return responseSuccess.Items.map(item => item);
    }
  };

  private OrganizationSuppliers: ICommonListsAction = {
    ListName: PhxConstants.CommonListsNames.OrganizationSuppliers,
    ApiQueryPath: 'org/getListSupplierOrganizationsOriginal',
    oDataParams:  oreq
    .request()
    .withSelect(['Id', 'DisplayName'])
    .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      return responseSuccess.Items.map(item => item);
    }
  };

  private UserProfileWorker: ICommonListsAction = {
    ListName: PhxConstants.CommonListsNames.UserProfileWorker,
    ApiQueryPath: 'UserProfile/GetListUserProfileWorker',
    oDataParams: oreq
    .request()
    .withExpand(['Contact'])
    .withSelect(['Id', 'ProfileTypeId', 'ContactId', 'Contact/Id', 'Contact/FullName', 'OrganizationId', 'UserProfileIdOrgRep'])
    .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      return responseSuccess.Items.map(item => item);
    }
  };

  private UserProfileOrganizational: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.Organizational);
  private UserProfileWorkerTemp: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerTemp);
  private UserProfileWorkerCanadianSP: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerCanadianSP);
  private UserProfileWorkerCanadianInc: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerCanadianInc);
  private UserProfileWorkerSubVendor: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerSubVendor);
  private UserProfileWorkerUnitedStatesW2: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerUnitedStatesW2);
  private UserProfileWorkerUnitedStatesLLC: ICommonListsAction = getUserProfileByType(PhxConstants.ProfileType.WorkerUnitedStatesLLC);

  private ParentOrganization: ICommonListsAction = {
    ListName: 'ParentOrganization',
    ApiQueryPath: 'org/getListParentOrganizations',
    oDataParams: oreq
      .request()
      .withSelect(['Id', 'Name', 'IsDraft'])
      .url(),
    MappingFunction: (responseSuccess: EntityList<any>) => {
      const resultList = responseSuccess.Items.map(item => {
        return {
          Id: item.Id,
          DisplayText: item.Name,
          Data: { IsDraft: item.IsDraft }
        };
      });
      return resultList;
    }
  };

  // public listByCommonListsAction$ = (commonListsAction: ICommonListsAction, showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, commonListsAction, false);
  public listUserProfileInternal$ = (showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, this.UserProfileInternal, false);
  public listParentOrganization$ = (showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, this.ParentOrganization, false);
  public listOrganizations$ = (showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, this.Organizations, false);
  public listOrganizationSuppliers$ = (showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, this.OrganizationSuppliers);
  public listUserProfileWorkers$ = (showLoader: boolean = true) => CommonListsObservables.listByCommonListsAction$(this.apiService, this.stateService, this.UserProfileWorker);
}
