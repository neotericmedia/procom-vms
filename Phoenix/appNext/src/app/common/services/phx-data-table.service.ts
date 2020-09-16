import { EntityList } from './../model/entity-list';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PhxDataTableState, PhxDataTableUserProfile } from '../model/index';
import * as moment from 'moment';


@Injectable()
export class PhxDataTableService {
  saveCommandName = 'UserProfileSearchStateSave';
  deleteCommandName = 'UserProfileSearchStateDelete';
  showLoader = false;
  constructor(private apiService: ApiService) { }

  public replaceSpecialCharacters(value: string): string {
    value = value.replace(/%/g, '%25');
    // replace the single quotes
    // tslint:disable-next-line:quotemark
    value = value.replace(/'/g, "''");
    value = value.replace(/\+/g, '%2B');
    value = value.replace(/\//g, '%2F');
    value = value.replace(/\?/g, '%3F');
    value = value.replace(/#/g, '%23');
    value = value.replace(/&/g, '%26');
    return value;
  }

  public saveState(phxDataTableUserProfile: PhxDataTableUserProfile) {
    const payload = this.transformUserProfileSave(phxDataTableUserProfile);
    return this.apiService.command(this.saveCommandName, payload, this.showLoader);
  }

  public removeState(selectedState) {
    return this.apiService.command(this.deleteCommandName, selectedState, this.showLoader);
  }

  public getState(componentName: string, stateName: string): Promise<EntityList<PhxDataTableUserProfile>> {
    return new Promise((resolve, reject) => {
      this.apiService.query(`userProfileSearchState?$filter=ComponentName eq '${componentName}' and StateName eq '${this.replaceSpecialCharacters(stateName)}'`, this.showLoader)
        .then((response: any) => {
          resolve(this.parseUserProfileResponse(response));
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  public getStates(componentName): Promise<EntityList<PhxDataTableUserProfile>> {
    return new Promise((resolve, reject) => {
      this.apiService.query(`userProfileSearchState/getByComponentName/${componentName}?$orderby=StateName`, this.showLoader)
        .then((response: any) => {
          resolve(this.parseUserProfileResponse(response));
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }

  private parseUserProfileResponse(userProfileResponse: EntityList<PhxDataTableUserProfile>): EntityList<PhxDataTableUserProfile> {
    for (const profile of userProfileResponse.Items) {
      profile.State = JSON.parse(profile.State as string) as PhxDataTableState;
      if (profile.State != null) {
        for (const column of profile.State.columns) {
          if (column.dataType === 'date' && column.filterValue) {
            if (typeof column.filterValue === 'string' || column.filterValue instanceof String) {
              column.filterValue = new Date(moment(column.filterValue.toString()).format());
            } else if (Array.isArray(column.filterValue)) {
              for (let i = 0; i < column.filterValue.length; i++) {
                column.filterValue[i] = new Date(moment(column.filterValue[i].toString()).format());
              }
            }
          }
        }
      }
    }
    return userProfileResponse;
  }

  private transformUserProfileSave(phxDataTableUserProfile: PhxDataTableUserProfile): any {
    const savePayload: PhxDataTableUserProfile = JSON.parse(JSON.stringify(phxDataTableUserProfile));
    let transformedSavePayload: any;

    if (!savePayload.LastModifiedDatetime) {
      delete savePayload.LastModifiedDatetime;
    }

    if (!savePayload.State) {
      console.error('PhxDataTableUserProfile.State is undefined', phxDataTableUserProfile, savePayload);
    } else {

      delete savePayload.State.selectedRowKeys;
      if (typeof savePayload.State === 'string') {
        savePayload.State = JSON.parse(savePayload.State);
      }

      for (const column of savePayload.State.columns) {
        if (column.dataType === 'date' && column.filterValue) {
          if (column.filterValue instanceof Date) {
            column.filterValue.toJSON = function () { return moment(this).format(); };
          } else if (Array.isArray(column.filterValue)) {
            for (let i = 0; i < column.filterValue.length; i++) {
              column.filterValue[i] = moment(column.filterValue[i]).format();
            }
          }
        }
      }
    }

    transformedSavePayload = {
      Id : savePayload.Id,
      LastModifiedDatetime : savePayload.LastModifiedDatetime,
      ComponentName: savePayload.ComponentName,
      StateName: savePayload.StateName,
      StateDescription: savePayload.StateDescription,
      State: savePayload.State ? JSON.stringify(savePayload.State) : null,
      UserProfileId: savePayload.UserProfileId
    };

    return transformedSavePayload;
  }

  public createEmptyPhxDataTableUserProfile(componentName: string): PhxDataTableUserProfile {
    return {
      Id: 0,
      LastModifiedDatetime: null,
      ComponentName: componentName,
      StateName: '',
      State: null,
      UserProfileId: null

    } as PhxDataTableUserProfile;
  }
}
