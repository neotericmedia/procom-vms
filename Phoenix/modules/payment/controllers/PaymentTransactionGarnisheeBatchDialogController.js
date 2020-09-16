(function () {
    'use strict';


    var controllerId = 'PaymentTransactionGarnisheeBatchDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PaymentTransactionGarnisheeBatchDialogController]);

    function PaymentTransactionGarnisheeBatchDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;
        $scope.emptyMessageToShow = false;
        $scope.data.batchNo = 0;
        $scope.data.chequeNo = 0;

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.create = function () {
            var result = { action: "create", taskIds: $scope.data.taskIds, bankId: $scope.data.bankId};
            $uibModalInstance.close(result);
        };

        $scope.bankChanged = function (bankId) {
            var bankAccount = _.find(data.bankAccounts, function (bankAccount) {
                return bankAccount.id == bankId;
            });
            if (bankAccount) {
                $scope.data.directDepositBatchNo = bankAccount.directDepositBatchNo;
                $scope.data.wireTransferBatchNo = bankAccount.wireTransferBatchNo;
                $scope.data.chequeNo = bankAccount.chequeNo;
            }
            else {
                $scope.data.directDepositBatchNo = 0;
                $scope.data.wireTransferBatchNo = 0;
                $scope.data.chequeNo = 0;
            }
        };

        if (data.bankAccounts.length > 0) {
            var bankAccount = _.find(data.bankAccounts, function (bankAccount) {
                return bankAccount.isPrimary === true;
            });
            if (bankAccount) {
                data.bankId = bankAccount.id;
                $scope.bankChanged(bankAccount.id);
            }
        }

    }

})();