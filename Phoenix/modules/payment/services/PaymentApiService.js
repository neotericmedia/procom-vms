(function (angular) {
    'use strict';

    var serviceId = 'PaymentApiService';

    angular.module('phoenix.payment.services').factory(serviceId, ['$q', 'common', '$http', '$cookies', 'phoenixapi', 'SmartTableService', PaymentApiService]);

    function PaymentApiService($q, common, $http, $cookies, phoenixapi, SmartTableService) {
        common.setControllerName(serviceId);

        var service = {
            
            getListPendingPaymentTransaction: getListPendingPaymentTransaction,
            getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId: getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId,
            getAllPaymentTransactions: getAllPaymentTransactions,
            getPayments: getPayments,
            getPaymentById: getPaymentById,
            getPaymentDirectDepositBatchesByBankAccountAndBatchStatus: getPaymentDirectDepositBatchesByBankAccountAndBatchStatus,
            getPaymentWireTransferBatchesByBankAccountAndBatchStatus: getPaymentWireTransferBatchesByBankAccountAndBatchStatus,
            getPaymentDirectDepositBatchesGrouped: getPaymentDirectDepositBatchesGrouped,
            getPaymentWireTransferBatchesGrouped: getPaymentWireTransferBatchesGrouped,
            getPaymentWireTransferBatch:getPaymentWireTransferBatch,
            getPaymentDirectDepositBatch: getPaymentDirectDepositBatch,
            getPaymentJoinedToTask: getPaymentJoinedToTask,
            ddStreamByBatchId: ddStreamByBatchId,
            wireTransferCSVById: wireTransferCSVById,
            getPaymentTransactionGarnishees: getPaymentTransactionGarnishees,
            getListPendingPaymentTransactionForWidget:getListPendingPaymentTransactionForWidget
        };

        return service;

        function getParams(tableState, oDataParams, concatenateSymbol) {
            var params = oDataParams && oDataParams !== undefined ? oDataParams : '';
            params = params + ((tableState && tableState !== undefined) ? (params.length > 0 ? '&' : '') + SmartTableService.generateRequestObject(tableState).url() : '');
            params = (params.length > 0 ? (concatenateSymbol + params) : '');
            return params;
        }

        function getListPendingPaymentTransaction() {
            return phoenixapi.query('payment/getListPendingPaymentTransaction');
        }

        function getListPendingPaymentTransactionForWidget(oDataParams) {  
           return phoenixapi.query('payment/getListPendingPaymentTransaction' + oDataParams);
          
        }

        function getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId(organizationId, currencyId, methodId, statusId, dueId, tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('payment/getListPendingPaymentTransactionByInternalOrganizationIdCurrencyIdPaymentMethodId/organization/' + organizationId + '/currency/' + currencyId + '/method/' + methodId + '/status/' + statusId + '/due/' + dueId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getAllPaymentTransactions(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('payment/allpaymenttransactions?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getPayments(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('payment/getPayments?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getPaymentDirectDepositBatchesByBankAccountAndBatchStatus(bankAccountId/*, batchStatusId*/, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentDirectDepositBatchesByBankAccountAndBatchStatus/bankAccount/' + bankAccountId /*+ '/batchStatus/' + batchStatusId*/ + params);
        }

        function getPaymentWireTransferBatchesByBankAccountAndBatchStatus(bankAccountId/*, batchStatusId*/, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentWireTransferBatchesByBankAccountAndBatchStatus/bankAccount/' + bankAccountId /*+ '/batchStatus/' + batchStatusId*/ + params);
        }

        function getPaymentDirectDepositBatchesGrouped(tableState) {
            var params = getParams(tableState, null, '?');
            return phoenixapi.query('payment/getPaymentDirectDepositBatchesGrouped' + params);
        }

        function getPaymentWireTransferBatchesGrouped(tableState) {
            var params = getParams(tableState, null, '?');
            return phoenixapi.query('payment/getPaymentWireTransferBatchesGrouped' + params);
        }

        function getPaymentWireTransferBatch(batchId, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentWireTransferBatch/' + batchId + params);
        }

        function getPaymentDirectDepositBatch(batchId, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentDirectDepositBatch/' + batchId + params);
        }

        function getPaymentJoinedToTask(batchId, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentJoinedToTask/' + batchId + params);
        }

        function getPaymentById(Id) {
            return phoenixapi.query('payment/' + Id);
        }

        function ddStreamByBatchId(batchId) {
            return phoenixapi.url('payment/getPaymentDDStream/' + batchId);
        }
        
        function wireTransferCSVById(batchId){
            return phoenixapi.url('payment/getPaymentWireTransferStream/' + batchId);
        }
        
        function getPaymentTransactionGarnishees(organizationIdInternal, currencyId, isReadyToRelease, tableState, oDataParams) {
            var params = getParams(tableState, oDataParams, '?');
            return phoenixapi.query('payment/getPaymentTransactionGarnishees/internalorganization/' + organizationIdInternal + '/currency/' + currencyId + '/readytorelease/' + isReadyToRelease + params);
        }
    }

}(angular));