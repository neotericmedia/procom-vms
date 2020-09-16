import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../common';
import { SignalrService } from '../../common/services/signalr.service';
declare var oreq: any;
@Injectable()
export class TransactionService {

  constructor(
    private signalrSvc: SignalrService,
    private apiService: ApiService,
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

  vmsDiscountRevalidateRecords(command) {
      return this.apiService.command('VmsDiscountRevalidateRecords', command);
  }

  vmsExpenseRevalidateRecords(command) {
    return this.apiService.command('VmsExpenseRevalidateRecords', command);
  }

  vmsUnitedStatesSourceDeductionRevalidateRecords(command) {
    return this.apiService.command('VmsUnitedStatesSourceDeductionRevalidateRecords', command);
  }

  vmsProcessedRecordSetTypeToProcess(command) {
    return this.apiService.command('VmsProcessedRecordSetTypeToProcess', command);
  }
  vmsDiscountProcessedRecordSetTypeToProcess(command) {
    return this.apiService.command('VmsDiscountRecordSetToProcessType', command);
  }
  vmsUnitedStatesSourceDeductionProcessedRecordSetTypeToProcess(command) {
      return this.apiService.command('VmsUnitedStatesSourceDeductionRecordSetToProcessType', command);
  }
  vmsExpenseRecordSetToProcessType(command) {
    return this.apiService.command('VmsExpenseRecordSetToProcessType', command);
  }

  vmsCommissionRecordSetToProcessType(command) {
    return this.apiService.command('VmsCommissionRecordSetToProcessType', command);
  }

  vmsFixedPriceRecordSetToProcessType(command) {
    return this.apiService.command('VmsFixedPriceRecordSetToProcessType', command);
  }

  updateVmsTimesheetProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsTimesheetProcessedRecordUserNotesUpdate', command);
  }
  updateVmsDiscountProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsDiscountProcessedRecordUserNotesUpdate', command);
  }
  updateVmsExpenseProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsExpenseProcessedRecordUserNotesUpdate', command);
  }
  updateVmsCommissionProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsCommissionProcessedRecordUserNotesUpdate', command);
  }
  updateVmsFixedPriceProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsFixedPriceProcessedRecordUserNotesUpdate', command);
  }
  updateVmsUnitedStatesSourceDeductionProcessedRecordUserNotes(command) {
    return this.apiService.command('VmsUnitedStatesSourceDeductionProcessedRecordUserNotesUpdate', command);
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
      self.signalrSvc.onPrivate('TransactionHeaderManualCalculation', (event, data) => {
        resolve(data);
      });
    });
  }

//  move this method to timesheet service
  getTimesheetsAndWorkOrdersSummary(workOrderId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('timeSheet/getTimesheetsAndWorkOrdersSummary/' + workOrderId + (oDataParams ? '?' + oDataParams : '')));
  }

  getAdjustmentNew(workOrderVersionId, oDataParams) {
 return Observable.fromPromise(this.apiService.query('transactionHeader/getAdjustmentNew/' + workOrderVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }



}
