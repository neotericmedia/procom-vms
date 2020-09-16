import { Injectable } from '@angular/core';
import { ApiService, CodeValueService, CommonService } from '../../common/index';
import { PhxLocalizationService } from '../../common/services/phx-localization.service';
import { Observable } from 'rxjs/Observable';
import { ISearchStatus } from '../model';

@Injectable()
export class ActivityCentreService {
  saveCommandName = 'UserProfileSearchStateSave';
  deleteCommandName = 'UserProfileSearchStateDelete';
  showLoader = false;

  constructor(private apiService: ApiService, private codeValueService: CodeValueService, private commonService: CommonService, private localizationService: PhxLocalizationService) {
  }

  public replaceSpecialCharacters(value: string): string {
    value = value.replace(/%/g, '%25');
    value = value.replace(/'/g, '');
    value = value.replace(/\+/g, '%2B');
    value = value.replace(/\//g, '%2F');
    value = value.replace(/\?/g, '%3F');
    value = value.replace(/#/g, '%23');
    value = value.replace(/&/g, '%26');
    return value;
  }

  public saveState(searchStatus: ISearchStatus, showLoader: boolean = false) {
    const payload = this.transformUserProfileSave(searchStatus);
    return Observable.fromPromise(this.apiService.command(this.saveCommandName, payload, showLoader));
  }

  public getState(componentName: string, stateName: string) {
    return Observable.fromPromise(this.apiService.query(`userProfileSearchState?$filter=ComponentName eq '${componentName}' and StateName eq '${this.replaceSpecialCharacters(stateName)}'`, this.showLoader));
  }

  public getStates(componentName: string) {
    return Observable.fromPromise(this.apiService.query(`userProfileSearchState/getByComponentName/${componentName}?$orderby=StateName`, this.showLoader));
  }

  public removeState(selectedState) {
    return Observable.fromPromise(this.apiService.command(this.deleteCommandName, selectedState, this.showLoader));
  }

  private transformUserProfileSave(savePayload: ISearchStatus): any {
    let transformedSavePayload: any;

    if (!savePayload.LastModifiedDatetime) {
      delete savePayload.LastModifiedDatetime;
    }

    if (!savePayload.State) {
      console.error('searchStatus.State is undefined', savePayload);
    } else {

      if (typeof savePayload.State === 'string') {
        savePayload.State = JSON.parse(savePayload.State);
      }
    }

    transformedSavePayload = {
      Id : savePayload.Id,
      LastModifiedDatetime : savePayload.LastModifiedDatetime,
      ComponentName: savePayload.ComponentName,
      StateName: savePayload.StateName,
      StateDescription: savePayload.StateDescription,
      State: savePayload.State ? JSON.stringify(savePayload.State) : null,
    };

    return transformedSavePayload;
  }

  getStatusCount(t1Filter) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getStatusCount/' + t1Filter));
  }

  getCardList(filterData) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getCardList?cardListFilter=' + JSON.stringify(filterData), false));
  }

  getPaymentCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getPaymentCardDetails/' + entityId, false));
  }

  getComplianceDocumentCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getComplianceDocumentCardDetails/' + entityId, false));
  }

  getExpenseCardDetails(entityId: number) {
    return Observable.of(null);
  }

  getOrganizationCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getOrganizationCardDetails/' + entityId, false));
  }

  getProfileCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getProfileCardDetails/' + entityId, false));
  }

  getTimeSheetCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getTimeSheetCardDetails/' + entityId, false));
  }

  getWorkOrderCardDetails(entityId: number) {
    return Observable.fromPromise(this.apiService.query('activityCentre/getWorkOrderCardDetails/' + entityId, false));
  }

  timeSheetApprove(command) {
    return Observable.fromPromise(this.apiService.command('TimesheetApprove', command));
  }

  timeSheetDecline(command) {
    return Observable.fromPromise(this.apiService.command('TimesheetDecline', command));
  }

  public getClients() {
    return Observable.fromPromise(this.apiService.query('activityCentre/getClients'));
  }

  public getTaskOwners() {
    return Observable.fromPromise(this.apiService.query('activityCentre/getTaskOwners'));
  }
}
