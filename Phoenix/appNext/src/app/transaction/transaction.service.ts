import { Injectable, Inject } from '@angular/core';
import { ApiService } from './../common/services/api.service';
import { Observable } from 'rxjs/Observable';
import { SignalrService } from '../common/services/signalr.service';
import { CommandResponse } from '../common/model';
declare var oreq: any;
@Injectable()
export class TransactionService {

  constructor(
    private apiService: ApiService,
    private signalrService: SignalrService
  ) { }

  getVacationPayInfo(workorderVersionId: number) {
    return this.apiService.query('transactionHeader/getReleaseVacationPayNew/' + workorderVersionId);
  }

  payVacationAccruedAmount(command: any) {
    return this.apiService.command('TransactionHeaderReleaseVacationPaySubmit', command);
  }
  getTransactionsWithConflices(oDataParams: string, OrganizationIdInternal: string, OrganizationIdclient: string): Observable<any> {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getClientConflicts/internalOrganization/' + OrganizationIdInternal + '/clientOrganization/' + OrganizationIdclient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
  }
  getVmsDiscountConflicts(oDataParams: string, OrganizationIdInternal: string, OrganizationIdclient: string): Observable<any> {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsDiscountConflicts/internalOrganization/' + OrganizationIdInternal + '/clientOrganization/' + OrganizationIdclient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));

  }
  getVmsExpenseConflicts(oDataParams: string, OrganizationIdInternal: string, OrganizationIdclient: string): Observable<any> {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsExpenseConflicts/internalOrganization/' + OrganizationIdInternal + '/clientOrganization/' + OrganizationIdclient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));

  }

  public getOrganizationClients(oDataParams): Observable<any> {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsAllItems?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
  }

  getVmsBatchSummary(oDataParams) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsBatchSummary' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }

  getVmsAllItems(oDataParams) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }
  getListOrganizationClient(oDataParams?: any) {
    oDataParams = oDataParams || oreq.request().withExpand(['OrganizationAddresses, OrganizationClientRoles, OrganizationClientRoles/OrganizationClientRoleAlternateBills ']).
      withSelect(['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax', 'OrganizationClientRoles/ClientSalesTaxDefaultId',
        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/Id', 'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillCode',
        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillLegalName',
        'OrganizationClientRoles/UsesThirdPartyImport', 'OrganizationClientRoles/IsBillSalesTaxAppliedOnExpenseImport',
        'OrganizationClientRoles/IsPaySalesTaxAppliedOnExpenseImport']).url();
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams));
  }

  // need to move in profile api service
  getProfileWorker(id: number, oDataParams?: any) {
    return Observable.fromPromise(this.apiService.query('UserProfile/' + id + '?' + (oDataParams && oDataParams !== undefined ? oDataParams + '&' : '')));
  }

  transactionHeaderManualCalculation(command) {
    // SergeyM: NOT ok- must be migrated to assembler
    return this.apiService.command('TransactionHeaderManualCalculation', command);
  }

  getTransactionHeaderManualCalculation() {
    const self = this;
    return new Promise(resolve => {
      self.signalrService.onPrivate('TransactionHeaderManualCalculation', (event, data) => {
        resolve(data);
      });
    });
  }

  //  move this method to timesheet service
  getTimesheetsAndWorkOrdersSummary(workOrderId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('timeSheet/getTimesheetsAndWorkOrdersSummary/' + workOrderId + (oDataParams ? '?' + oDataParams : '')));
  }
  public executeStateCommand(commandName: string, payload: any) : any {
    return new Promise((resolve, reject) => {
      this.apiService.command(commandName, payload)
        .then((response: CommandResponse) => {
          if (!response.IsValid) {
            reject(response.ValidationMessages);
          } else {
            resolve(response);
          }
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }
}
