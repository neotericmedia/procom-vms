import { Injectable, Output, EventEmitter, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, PhxConstants } from './../common/index';
import * as moment from 'moment';
import { forEach } from '@angular/router/src/utils/collection';
declare var oreq: any;

@Injectable()
export class PaymentService {
  constructor(private apiService: ApiService) { }

  public getOriginalOrganizationBankAccount(bankAccountId: number): Observable<any> {
    let oDataParams: any;
    const filter = `$filter=OrganizationInternalRoles/any(x: x/BankAccounts/any(y: y/Id eq ${bankAccountId == null ? 'null' : bankAccountId}))&`;
    oDataParams = `$expand=OrganizationInternalRoles/BankAccounts&${filter}$select=OrganizationInternalRoles/BankAccounts/Id,OrganizationInternalRoles/BankAccounts/BankName`;

    return Observable.fromPromise(this.apiService.query('org/getListOriginalOrganizations' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }
  public getPaymentDirectDepositBatch(batchId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentDirectDepositBatch/' + batchId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }



  //   function getListOrganizationInternal(oDataParams) {
  //   oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
  //   var deferred = $q.defer();
  //   if (common.isEmptyObject(data.organizationsListInternal)) {
  //     phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams).then(
  //       function (response) {
  //         data.organizationsListInternal = angular.copy(response.Items);
  //         deferred.resolve(data.organizationsListInternal);
  //       },
  //       function (responseError) {
  //         data.organizationsListInternal = [];
  //         deferred.reject(responseError);
  //       }
  //     );
  //   } else {
  //     deferred.resolve(data.organizationsListInternal);
  //   }
  //   return deferred.promise;
  // }



  // public getListOrganizationInternal() {
  //   return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole'));
  // }
  public getListOrganizationInternal() {
    return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole')
      .then((res: any) => res.Items));
  }

  // FROM VMS
  // get this working on frontend then try same with getPaymentWireTransferBatchesGrouped
  getVmsBatchSummary(oDataParams) {
    return Observable.fromPromise(this.apiService.query('vms/getVmsBatchSummary' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
  }
  // directdepositbatch/serach
  public getPaymentDirectDepositBatchesGrouped(oDataParams) {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentDirectDepositBatchesGrouped' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  // wiretransferbatch/serach

  public getPaymentWireTransferBatchesGrouped(tableState) {
    const params = this.getParams(tableState, null, '?');
    return Observable.fromPromise(this.apiService.query('payment/getPaymentWireTransferBatchesGrouped' + params));
  }

  getParams(tableState, oDataParams, concatenateSymbol) {
    let params = oDataParams && oDataParams !== undefined ? oDataParams : '';
    params = params + ((tableState && tableState !== undefined) ? (params.length > 0 ? '&' : '') + this.generateRequestObject(tableState).url() : '');
    params = (params.length > 0 ? (concatenateSymbol + params) : '');
    return params;
  }

  generateRequestObject(tableState) {
    const searchObj = tableState && tableState.search && tableState.search.predicateObject ? tableState.search.predicateObject : null;
    const sortObj = tableState && tableState.sort && tableState.sort.predicate ? tableState.sort.predicate + (tableState.sort.reverse ? ' desc ' : '') : null;
    let currentPage = tableState && tableState.pagination && tableState.pagination.currentPage ? tableState.pagination.currentPage : 1;
    const pageSize = tableState && tableState.pagination && tableState.pagination.pageSize ? tableState.pagination.pageSize : 30;
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

  // get list of pending payments
  public getListPendingPaymentTransaction(): Observable<any> {
    return Observable.fromPromise(this.apiService.query('payment/getListPendingPaymentTransaction'));
  }
  public getListPendingPaymentTransactionUpdated() {
    return Observable.fromPromise(this.apiService.query('payment/getListPendingPaymentTransaction')
      .then((res: any) => res.Items));
  }

  // directdepositbatch/serach
  public getPaymentDirectDepositBatches() {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentDirectDepositBatchesGrouped'));
  }
  public getPaymentDirectDepositBatchesUpdated() {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentDirectDepositBatchesGrouped')
      .then((res: any) => res.Items));
  }

  // wiretransferbatch/serach
  public getPaymentWireTransferBatches() {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentWireTransferBatchesGrouped'));
  }
  public getPaymentWireTransferBatch(batchId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentWireTransferBatch/' + batchId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getPaymentAdpBatch(batchId, oDataParams) {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentAdpBatch/' + batchId + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getPaymentAdpBatchesGrouped(oDataParams): Observable<any> {
    return Observable.fromPromise(this.apiService.query('payment/getPaymentAdpBatchesGrouped' + (oDataParams && oDataParams !== undefined ? '?' + oDataParams : '')));
  }

  public getPaymentAdpStream(batchId) {
    return this.apiService.url('payment/getPaymentAdpStream/' + batchId);
  }

  public getPaymentDDStream(batchId) {
    return this.apiService.url('payment/getPaymentDDStream/' + batchId);
  }

  public getPaymentWTStream(batchId) {
    return this.apiService.url('payment/getPaymentWireTransferStream/' + batchId);
  }

  public getYTDEarningInfo(userProfileId: number, startDate: Date, endDate: Date) {
    return Observable.fromPromise(
      this.apiService.query(
        'payment/getConsultantEarningsYtdPreLoad/' +
        userProfileId +
        '/' +
        encodeURI(moment(startDate).format('MM-DD-YYYY')) +
        '/' +
        encodeURI(
          moment(endDate)
            .endOf('month')
            .format('MM-DD-YYYY')
        )
      )
    );
  }

  public getYTDEarningInfoDetails(userProfileId: number, startDate: Date, endDate: Date, cols: string[]) {
    let selectCols = [
      'TransactionTypeId',
      'PaymentTransactionNumber',
      'OrganizationIdInternal',
      'OrganizationInternalDisplayName',
      'OrganizationClientDisplayName',
      'PaymentReleaseDate',
      'PaymentTransactionStartDate',
      'PaymentTransactionEndDate',
      'CurrencyId',
      'AmountGross',
      'AmountNet',
      'IsOpeningBalance',
      'AmountVacationAccured'
    ];

    selectCols = selectCols.concat(cols);
    const expandTables = ['PaymentTransactionLines'];
    const expandCols = ['PaymentTransactionLines/RateUnitId', 'PaymentTransactionLines/RateTypeId', 'PaymentTransactionLines/Rate', 'PaymentTransactionLines/Units'];
    selectCols = selectCols.concat(expandCols);
    const oDataParams = oreq
      .request()
      .withExpand(expandTables)
      .withSelect(selectCols)
      .url();
    return Observable.fromPromise(
      this.apiService.query(
        `Payment/getConsultantEarningsReport/${userProfileId}/${encodeURI(moment(startDate).format('MM-DD-YYYY'))}/${encodeURI(
          moment(endDate)
            .endOf('month')
            .format('MM-DD-YYYY')
        )}?` + oDataParams
      )
    );
  }

  public getYTDEarningMaximumInfo(userProfileId: number, startDate: Date, endDate: Date) {
    return Observable.fromPromise(
      this.apiService.query(
        'payment/getConsultantEarningsMaximumDeductions/' +
        userProfileId +
        '/' +
        encodeURI(moment(startDate).format('MM-DD-YYYY')) +
        '/' +
        encodeURI(
          moment(endDate)
            .endOf('month')
            .format('MM-DD-YYYY')
        )
      )
    );
  }

  public getPaymentDirectDepositBatchesByBankAccountAndBatchStatus(bankAccountId: number, batchStatusId: number): Promise<any> {
    return this.apiService.query(`payment/getPaymentDirectDepositBatchesByBankAccountAndBatchStatus/bankAccount/${bankAccountId}/batchStatus/${batchStatusId}`);
  }

  public getPaymentDirectDepositDraftBatchesByBankAccount(bankAccountId: number): Promise<any> {
    return this.getPaymentDirectDepositBatchesByBankAccountAndBatchStatus(bankAccountId, PhxConstants.PaymentReleaseBatchStatus.Draft);
  }

  public getPaymentWireTransferBatchesByBankAccountAndBatchStatus(bankAccountId: number, batchStatusId: number): Promise<any> {
    return this.apiService.query(`payment/getPaymentWireTransferBatchesByBankAccountAndBatchStatus/bankAccount/${bankAccountId}/batchStatus/${batchStatusId}`);
  }

  public getPaymentWireTransferDraftBatchesByBankAccount(bankAccountId: number): Promise<any> {
    return this.getPaymentWireTransferBatchesByBankAccountAndBatchStatus(bankAccountId, PhxConstants.PaymentReleaseBatchStatus.Draft);
  }

  public getPaymentDraftBatchesByBankAccountAndBatchStatus(bankAccountId: number, batchStatusId: number): Promise<any> {
    return this.apiService.query(`payment/getPaymentDirectDepositBatchesByBankAccountAndBatchStatus/bankAccount/${bankAccountId}/batchStatus/${batchStatusId}`);
  }

  public getPaymentDraftBatchesByBankAccount(bankAccountId: number): Promise<any> {
    return this.getPaymentDraftBatchesByBankAccountAndBatchStatus(bankAccountId, PhxConstants.PaymentReleaseBatchStatus.Draft);
  }

  public getPaymentADPDraftBatchesByBatchStatus(batchStatusId: number): Promise<any> {
    return this.apiService.query(`payment/getPaymentADPBatchesByBatchStatus/batchStatus/${batchStatusId}`);
  }

  public getPaymentADPDraftBatches(): Promise<any> {
    return this.getPaymentADPDraftBatchesByBatchStatus(PhxConstants.PaymentReleaseBatchStatus.Draft);
  }

  removePaymentTransaction(paymentTransactionId: number, paymentId: number, paymentReleaseBatchId: number, bankId: number): Promise<any> {
    const payload = {
      BatchId: paymentReleaseBatchId,
      PaymentId: paymentId,
      EntityIds: [paymentTransactionId],
      BankId: bankId,
    };

    return this.apiService.command('PaymentTransactionRemovePaymentTransaction', payload);
  }

  removePayment(paymentId: number, paymentReleaseBatchId: number, bankId: number): Promise<any> {
    const payload = {
      BatchId: paymentReleaseBatchId,
      EntityIds: [paymentId],
      BankId: bankId,
    };

    return this.apiService.command('PaymentRemovePayment', payload);
  }

  removeDraftBatchPayment(paymentReleaseBatchId: number, bankId: number): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
      BankId: bankId,
    };

    return this.apiService.command('PaymentReleaseBatchDiscard', payload);
  }

  recallBatchPayment(paymentReleaseBatchId: number): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
    };

    return this.apiService.command('PaymentReleaseBatchRecall', payload);
  }

  finalizeDraftBatchPayment(
    paymentReleaseBatchId: number,
    bankId: number,
    NotifyName_BatchFinalize_OnError: string,
    NotifyName_BatchFinalize_OnSuccess: string,
    NotifyName_BatchFinalize_OnProcessing: string,
  ): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
      BankId: bankId,
      NotifyName_BatchFinalize_OnError: NotifyName_BatchFinalize_OnError,
      NotifyName_BatchFinalize_OnSuccess: NotifyName_BatchFinalize_OnSuccess,
      NotifyName_BatchFinalize_OnProcessing: NotifyName_BatchFinalize_OnProcessing
    };

    return this.apiService.command('PaymentReleaseBatchFinalize', payload);
  }

  removeAffectedPayments(
    paymentReleaseBatchId: number,
    bankId: number,
    NotifyName_BatchRemoveAffectedPayments_OnError: string,
    NotifyName_BatchRemoveAffectedPayments_OnSuccess: string,
    NotifyName_BatchRemoveAffectPayment_OnProcessing: string
  ): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
      BankId: bankId,
      NotifyName_BatchFinalize_OnError: NotifyName_BatchRemoveAffectedPayments_OnError,
      NotifyName_BatchFinalize_OnSuccess: NotifyName_BatchRemoveAffectedPayments_OnSuccess,
      NotifyName_PaymentReleaseBatchRemoveAffectPayment_OnProcessing: NotifyName_BatchRemoveAffectPayment_OnProcessing
    };

    return this.apiService.command('PaymentReleaseBatchRemoveAffectedPayments', payload);
  }

  changeBatchDetails(paymentReleaseBatchId: number, data: any): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
      BankId: data.bankId,
      DepositDate: data.depositDate,
      GarnisheeBankAccountId: data.garnisheeBankAccountId
    };

    return this.apiService.command('PaymentReleaseBatchChangeDetails', payload);
  }

  transferBatch(paymentReleaseBatchId: number): Promise<any> {
    const payload = {
      EntityIds: [paymentReleaseBatchId],
    };

    return this.apiService.command('PaymentReleaseBatchTransferToBank', payload);
  }

  processEPPPending(paymentIds: number[]) {
    const payload = {
      PaymentIds: paymentIds
    };

    return this.apiService.command('EPPChequeBatchCreate', payload);
  }

  getPaymentEPPChequeStream(batchId: number): any {
    window.location.assign(this.apiService.url(`payment/getPaymentEPPChequeStream/${batchId}`));
  }

  recallPayment(paymentId: number): Promise<any> {
    const payload = {
      EntityIds: [paymentId],
    };

    return this.apiService.command('PaymentRecall', payload);
  }
}
