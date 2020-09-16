(function (angular) {
    'use strict';

    angular.module('phoenix.transaction.controllers').controller('TransactionPaymentController', TransactionPaymentController);

    TransactionPaymentController.$inject = ['CodeValueService', 'mixinsFactory', 'TransactionApiService', 'transactionTableParams', '$stateParams'];

    function TransactionPaymentController(CodeValueService, mixinsFactory, TransactionApiService, transactionTableParams, $stateParams) {

        var self = this;

        angular.extend(self, {
            transactionId: $stateParams.transactionHeaderId,
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType),
            paymentTransactionStatuses: CodeValueService.getCodeValues(CodeValueGroups.PaymentTransactionStatus),
            currencies: _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) { return currency.id == ApplicationConstants.Currencies.CAD || currency.id == ApplicationConstants.Currencies.USD || currency.id == ApplicationConstants.Currencies.MXN; }),
            paymentStatuses: CodeValueService.getCodeValues(CodeValueGroups.PaymentStatus)
        });

        var transactionDataParams = oreq.request().withSelect(['Id', 'PaymentNumber', 'PaymentDate', 'PaymentMethodId', 'PaymentReference', 'CurrencyId', 'PaymentAmount', 'PaymentTransactionStatusId']).url();
        
        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: TransactionApiService.getTransactionHeaderPayments
        }, transactionTableParams), transactionDataParams, self.transactionId).init(self);
    }

})(angular);