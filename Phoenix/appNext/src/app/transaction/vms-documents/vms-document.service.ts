import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../../common';

@Injectable()
export class VmsDocumentService {

  constructor(
    private apiService: ApiService,
  ) { }



  public service = {
    //  queries:
    getVmsAllItems: this.getVmsAllItems,

    getVmsExpenseSummary: this.getVmsExpenseSummary,
    getVmsTimesheetDocument: this.getVmsTimesheetDocument,
    getVmsExpenseDocument: this.getVmsExpenseDocument,
    getVmsCommissionDocument: this.getVmsCommissionDocument,
    getVmsFixedPriceDocument: this.getVmsFixedPriceDocument,
    getVmsExpenseProcessedRecordsByDocument: this.getVmsExpenseProcessedRecordsByDocument,
    getVmsCommissionProcessedRecordsByDocument: this.getVmsCommissionProcessedRecordsByDocument,
    getVmsFixedPriceProcessedRecordsByDocument: this.getVmsFixedPriceProcessedRecordsByDocument,
    getVmsExpenseDocumentDetails: this.getVmsExpenseDocumentDetails,
    getVmsCommissionDocumentDetails: this.getVmsCommissionDocumentDetails,
    getVmsFixedPriceDocumentDetails: this.getVmsFixedPriceDocumentDetails,

    getExpenseProcessedRecords: this.getExpenseProcessedRecords,
    getVmsTimesheetProcessedRecordsByDocument: this.getVmsTimesheetProcessedRecordsByDocument,
    getVmsTimesheetDocumentDetails: this.getVmsTimesheetDocumentDetails,

    csvStreamForAllConflictingVmsTimesheetRecords: this.csvStreamForAllConflictingVmsTimesheetRecords,
    csvStreamForAllConflictingVmsExpenseRecords: this.csvStreamForAllConflictingVmsExpenseRecords,

    getVmsExpenseProcessedRecordById: this.getVmsExpenseProcessedRecordById,
    getVmsCommissionProcessedRecordById: this.getVmsCommissionProcessedRecordById,
    getVmsFixedPriceProcessedRecordById: this.getVmsFixedPriceProcessedRecordById,
    getVmsDocumentPendingTaskId: this.getVmsDocumentPendingTaskId,
    getVmsTimesheetProcessedRecordById: this.getVmsTimesheetProcessedRecordById,
    getVmsBatchSummary: this.getVmsBatchSummary,

    getVmsTimesheetImportedRecord: this.getVmsTimesheetImportedRecord,
    getVmsExpenseImportedRecordsTable: this.getVmsExpenseImportedRecordsTable,
    getVmsExpenseImportedRecord: this.getVmsExpenseImportedRecord,
    getVmsCommissionImportedRecordsTable: this.getVmsCommissionImportedRecordsTable,
    getVmsFixedPriceImportedRecordsTable: this.getVmsFixedPriceImportedRecordsTable,
    getVmsCommissionImportedRecord: this.getVmsCommissionImportedRecord,
    getVmsFixedPriceImportedRecord: this.getVmsFixedPriceImportedRecord,


    getVmsDiscountSummary: this.getVmsDiscountSummary,
    getDiscountProcessedRecordsByDocument: this.getDiscountProcessedRecordsByDocument,
    getVmsDiscountSummaryDocument: this.getVmsDiscountSummaryDocument,
    getDiscountProcessedRecords: this.getDiscountProcessedRecords,
    csvStreamForAllConflictingVmsDiscountRecords: this.csvStreamForAllConflictingVmsDiscountRecords,
    getVmsDiscountProcessedRecordById: this.getVmsDiscountProcessedRecordById,
    VmsDiscountRecordSetConflictType: this.VmsDiscountRecordSetConflictType,
    getVmsDiscountImportedRecord: this.getVmsDiscountImportedRecord,
    batchThreadExecutionOnVmsDiscountRecordToBillingTransaction: this.batchThreadExecutionOnVmsDiscountRecordToBillingTransaction,


    getVmsUnitedStatesSourceDeductionSummary: this.getVmsUnitedStatesSourceDeductionSummary,
    getUnitedStatesSourceDeductionProcessedRecordsByDocument: this.getUnitedStatesSourceDeductionProcessedRecordsByDocument,
    getVmsUnitedStatesSourceDeductionSummaryDocument: this.getVmsUnitedStatesSourceDeductionSummaryDocument,
    getUnitedStatesSourceDeductionProcessedRecords: this.getUnitedStatesSourceDeductionProcessedRecords,
    csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords: this.csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords,
    getVmsUnitedStatesSourceDeductionProcessedRecordById: this.getVmsUnitedStatesSourceDeductionProcessedRecordById,
    getVmsUnitedStatesSourceDeductionImportedRecord: this.getVmsUnitedStatesSourceDeductionImportedRecord,
    VmsUnitedStatesSourceDeductionRecordSetConflictType: this.VmsUnitedStatesSourceDeductionRecordSetConflictType,
    batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction: this.batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction,
    getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization: this.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization,

    //  commands:
    vmsTimesheetImportRecordTypeUpdate: this.vmsTimesheetImportRecordTypeUpdate,
    vmsTimesheetRevalidateRecords: this.vmsTimesheetRevalidateRecords,
    vmsExpenseImportRecordTypeUpdate: this.vmsExpenseImportRecordTypeUpdate,
    vmsExpenseRecordSetToProcessType: this.vmsExpenseRecordSetToProcessType,
    vmsExpenseRecordSetConflictType: this.vmsExpenseRecordSetConflictType,
    vmsProcessedRecordSetTypeConflict: this.vmsProcessedRecordSetTypeConflict,
    vmsCommissionImportRecordTypeUpdate: this.vmsCommissionImportRecordTypeUpdate,
    vmsFixedPriceImportRecordTypeUpdate: this.vmsFixedPriceImportRecordTypeUpdate,
    vmsCommissionRecordSetConflictType: this.vmsCommissionRecordSetConflictType,
    vmsFixedPriceRecordSetConflictType: this.vmsFixedPriceRecordSetConflictType,
    vmsDiscountImportRecordTypeUpdate: this.vmsDiscountImportRecordTypeUpdate,
    vmsUnitedStatesSourceDeductionImportRecordTypeUpdate: this.vmsUnitedStatesSourceDeductionImportRecordTypeUpdate,
    vmsCommissionRevalidateRecords: this.vmsCommissionRevalidateRecords,
    vmsFixedPriceRevalidateRecords: this.vmsFixedPriceRevalidateRecords,

  };



  // public getWorkorder(Id: number): Observable<any> {
  //   return Observable.fromPromise(this.apiService.query('PurchaseOrder/' + Id)));
  // }

  // public getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams?: any): Observable<any> {
  //   oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url());
  //   return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''))));
  // }

  // public purchaseOrderDiscard(command): Observable<any> {
  //   return Observable.fromPromise(this.apiService.command('PurchaseOrderDiscard', command)));
  // }



  public getVmsAllItems(oDataParams?: any): Observable<any> {
    return Observable.fromPromise(this.apiService.query('vms/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }


  // public getVmsAllItems(oDataParams) {
  //   return Observable.fromPromise(this.apiService.query('vms/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  // }

  public getVmsBatchSummary(oDataParams) {
    // return Observable.fromPromise(this.apiService.query('vms/getVmsBatchSummary' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }

  public getVmsTimesheetImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsTimesheetImportedRecord/' + id));
  }

  public getExpenseProcessedRecords(tableState, oDataParams, organizationArgs) {
    // let organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
    // let organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getExpenseProcessedRecords/internalOrganization/' + organizationIdInternal + 
    // '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsExpenseImportedRecordsTable(documentPublicId, oDataParams, tableState) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams));
  }

  public getVmsCommissionImportedRecordsTable(documentPublicId, oDataParams, tableState) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams));
  }

  public getVmsFixedPriceImportedRecordsTable(documentPublicId, oDataParams, tableState) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams));
  }

  //  commands:



  public csvStreamForAllConflictingVmsTimesheetRecords(orgIdInternal, orgIdClient) {
    return Observable.fromPromise(this.apiService.query('vms/csvStreamForAllConflictingVmsTimesheetRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient));
  }

  public csvStreamForAllConflictingVmsExpenseRecords(orgIdInternal, orgIdClient) {
    return Observable.fromPromise(this.apiService.query('vms/csvStreamForAllConflictingVmsExpenseRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient));
  }


  public getVmsExpenseSummary(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsExpenseProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseProcessedRecordById/' + id));
  }


  public getVmsTimesheetProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsTimesheetProcessedRecordById/' + id));
  }

  public getVmsCommissionProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionProcessedRecordById/' + id));
  }

  public getVmsFixedPriceProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceProcessedRecordById/' + id));
  }

  public getVmsDocumentPendingTaskId(documentPublicId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsDocumentPendingTaskId/' + documentPublicId));
  }

  public getVmsTimesheetDocument(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsTimesheetDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsTimesheetProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsTimesheetProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsTimesheetDocumentDetails(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsTimesheetDocumentDetails/' + documentId));
  }

  public vmsTimesheetImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsTimesheetImportRecordTypeUpdate', command));
  }

  public vmsTimesheetRevalidateRecords(command) {
    // return phoenixapi.command('VmsTimesheetRevalidateRecords', command));
  }

  public vmsExpenseImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsExpenseImportRecordTypeUpdate', command));
  }

  public getVmsExpenseImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseImportedRecord/' + id));
  }

  public getVmsExpenseDocument(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsCommissionDocument(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsFixedPriceDocument(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsExpenseDocumentDetails(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseDocumentDetails/' + documentId));
  }

  public getVmsCommissionDocumentDetails(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionDocumentDetails/' + documentId));
  }

  public getVmsFixedPriceDocumentDetails(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceDocumentDetails/' + documentId));
  }

  public getVmsDocumentDetailByDocumentTypeAndId(documentId: number, documentType: string) {
    return Observable.fromPromise(this.apiService.query(`vms/getVms${documentType}DocumentDetails/${documentId}`));
  }

  public getVmsExpenseProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsExpenseProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsCommissionProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public getVmsFixedPriceProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }

  public vmsExpenseRecordSetToProcessType(command) {
    // return phoenixapi.command('VmsExpenseRecordSetToProcessType', command));
  }

  public vmsExpenseRecordSetConflictType(command) {
    // return phoenixapi.command('VmsExpenseRecordSetConflictType', command));
  }

  public vmsProcessedRecordSetTypeConflict(command) {
    // return phoenixapi.command('VmsProcessedRecordSetTypeConflict', command));
  }

  public vmsCommissionImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsCommissionImportRecordTypeUpdate', command));
  }

  public vmsFixedPriceImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsFixedPriceImportRecordTypeUpdate', command));
  }

  public getVmsCommissionImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsCommissionImportedRecord/' + id));
  }

  public getVmsFixedPriceImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsFixedPriceImportedRecord/' + id));
  }

  public vmsCommissionRecordSetConflictType(command) {
    // return phoenixapi.command('VmsCommissionRecordSetConflictType', command));
  }

  public vmsFixedPriceRecordSetConflictType(command) {
    // return phoenixapi.command('VmsFixedPriceRecordSetConflictType', command));
  }

  public vmsCommissionRevalidateRecords(command) {
    // return phoenixapi.command('VmsCommissionRevalidateRecords', command));
  }

  public vmsFixedPriceRevalidateRecords(command) {
    // return phoenixapi.command('VmsFixedPriceRevalidateRecords', command));
  }


  //  VmsDiscount
  public getVmsDiscountSummary(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsDiscountSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public getDiscountProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getDiscountProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public getVmsDiscountSummaryDocument(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsDiscountSummaryDocument/' + documentId));
  }
  public getDiscountProcessedRecords(tableState, oDataParams, organizationArgs) {
    // let organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
    // let organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getDiscountProcessedRecords/internalOrganization/' + organizationIdInternal + 
    // '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public csvStreamForAllConflictingVmsDiscountRecords(orgIdInternal, orgIdClient) {
    return Observable.fromPromise(this.apiService.query('vms/csvStreamForAllConflictingVmsDiscountRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient));
  }
  public getVmsDiscountProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsDiscountProcessedRecordById/' + id));
  }
  public VmsDiscountRecordSetConflictType(command) {
    // return phoenixapi.command('VmsDiscountRecordSetConflictType', command));
  }

  public vmsDiscountImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsDiscountImportRecordTypeUpdate', command));
  }

  public batchThreadExecutionOnVmsDiscountRecordToBillingTransaction(command) {
    // return phoenixapi.command('BatchThreadExecutionOnVmsDiscountRecordToBillingTransaction', command));
  }


  //  VmsUnitedStatesSourceDeduction
  public getVmsUnitedStatesSourceDeductionSummary(tableState, oDataParams, args) {
    // let orgIdInternal = (args && args[0]) ? args[0] : -1;
    // let documentId = (args && args[1]) ? args[1] : -1;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getVmsUnitedStatesSourceDeductionSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public getUnitedStatesSourceDeductionProcessedRecordsByDocument(tableState, oDataParams, documentId) {
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getUnitedStatesSourceDeductionProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public getVmsUnitedStatesSourceDeductionSummaryDocument(documentId) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsUnitedStatesSourceDeductionSummaryDocument/' + documentId));
  }
  public getUnitedStatesSourceDeductionProcessedRecords(tableState, oDataParams, organizationArgs) {
    // let organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
    // let organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
    // let tableStateParams = SmartTableService.generateRequestObject(tableState).url());
    // return Observable.fromPromise(this.apiService.query('vms/getUnitedStatesSourceDeductionProcessedRecords/internalOrganization/' + 
    // organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams));
  }
  public csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords(orgIdInternal, orgIdClient) {
    return Observable.fromPromise(this.apiService.query('vms/csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient));
  }
  public getVmsUnitedStatesSourceDeductionProcessedRecordById(id) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsUnitedStatesSourceDeductionProcessedRecordById/' + id));
  }

  public getVmsUnitedStatesSourceDeductionImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecord/' + id));
  }

  public VmsUnitedStatesSourceDeductionRecordSetConflictType(command) {
    // return phoenixapi.command('VmsUnitedStatesSourceDeductionRecordSetConflictType', command));
  }

  public batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction(command) {
    // return phoenixapi.command('BatchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction', command));
  }

  public getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(organizationIdInternal, organizationIdClient, oDataParams) {
    // return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization/' + 
    // organizationIdInternal + '/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '')));
  }

  public getVmsDiscountImportedRecord(id) {
    return Observable.fromPromise(this.apiService.query('transactionHeader/getVmsDiscountImportedRecord/' + id));
  }

  public vmsUnitedStatesSourceDeductionImportRecordTypeUpdate(command) {
    // return phoenixapi.command('VmsUnitedStatesSourceDeductionImportRecordTypeUpdate', command));
  }







}
