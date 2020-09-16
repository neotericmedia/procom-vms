import { URLSearchParams } from '@angular/http';
import { IT4PrintWorker, IT4PrintRequestPayload } from './share/t4-printing.interface';
import { Injectable, Inject } from '@angular/core';
import { ApiService, LoadingSpinnerService } from '../common';
import { CommandResponse, EntityList, PhxConstants } from '../common/model';
import { CommonDataService } from '../common/services/commonData.service';

@Injectable()
export class T4Service {

  constructor(
    private apiService: ApiService,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonDataService: CommonDataService
  ) { }

  getListOrganizationInternal(): Promise<{Id: number, DisplayName: string, Code: string, IsTest: boolean}[]> {
    // ng2? return Observable.fromPromise(this.commonDataService.getListOrganizationInternal());
    return this.commonDataService.getListOrganizationInternal();
  }

  getT4WorkerList(): Promise<IT4PrintWorker[]> {

    const oDataParams = oreq
      .request()
      .withOrderby(['LastName', 'FirstName', 'ContactId'])
      .url();
    const query = 'T4/T4Slip/Workers?' + oDataParams;
    return new Promise((resolve, reject) => {
      this.apiService
        .query(query, false)
        .then((response: EntityList<any>) => {
          if (response && response.Items && response.Items.length > 0) {
            const result = response.Items
            .map((item, index) => {
              const fullName = item.LastName && item.FirstName
                ? `${item.LastName ? item.LastName : ''}, ${item.FirstName ? item.FirstName : ''}`
                : null;

              const displayName = item.ContactId + ' - ' + fullName + ' - ' + item.Email;

              return {
                Id: item.ContactId,
                DisplayName: displayName,
                Index: index
              };
            });
            resolve(result);
          } else {
            resolve([]);
          }
        })
        .catch(err => reject(err));
    });
  }

  getT4PrintHistoryDataSourceDetails(payload: IT4PrintRequestPayload): { url: string, params: string } {
    const dataSourceUrl = `T4/T4SlipPrintHistory/organizationIdInternal/${payload.OrganizationIdInternal}/reportYear/${payload.Year}/t4Types/${payload.T4SlipTypes.toString()}`;

    const params = new URLSearchParams();
    params.append('$orderby', 'EmployeeLastName,EmployeeFirstName,EmployeeContactId');

    params.append('excludeInactive', this.getBooleanQueryParamValue(payload.ExcludeInactive));
    params.append('excludePrinted', this.getBooleanQueryParamValue(payload.ExcludePrinted));

    if (payload.ContactIdWorkerRangeStart != null) {
      params.append('contactIdWorkerRangeStart', payload.ContactIdWorkerRangeStart.toString());
    }
    if (payload.ContactIdWorkerRangeEnd != null) {
      params.append('contactIdWorkerRangeEnd', payload.ContactIdWorkerRangeEnd.toString());
    }

    return { url: dataSourceUrl, params: params.toString()};
  }

  getBooleanQueryParamValue(value: boolean): string {
    return value ? 'True' : 'False';
  }

  executeCommand(commandName: string, payload: any, comments: string = null): Promise<CommandResponse> {
    if (comments != null && comments !== '') {
      payload.Comments = comments;
    }

    // show extra spinner to prevent flickering between executing action and query
    this.loadingSpinnerService.show();

    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then(r => {

          if (!r.IsValid) {
            this.loadingSpinnerService.hideAll();
            reject(r.ValidationMessages);
            return;
          }

          this.loadingSpinnerService.hide();
          resolve(r);
        })
        .catch(ex => {
          this.loadingSpinnerService.hideAll();
          console.error(commandName, payload, ex);
          reject(ex);
        });

    });
  }
}
