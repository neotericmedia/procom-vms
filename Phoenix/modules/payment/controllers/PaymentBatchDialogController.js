(function () {
    'use strict';


    var controllerId = 'PaymentBatchDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PaymentBatchDialogController]);

    function PaymentBatchDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        data.depositDate = new Date();
        $scope.data = data;
        $scope.emptyMessageToShow = false;
        $scope.data.directDepositBatchNo = 0;
        $scope.data.wireTransferBatchNo = 0;
        $scope.data.chequeNo = 0;
        $scope.data.bankAccounts = addFullBankNameToAllBankAccounts($scope.data.bankAccounts);

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.create = function () {
            var result = {
                action: "create", taskIds: $scope.data.taskIds,
                bankId: $scope.data.bankId,
                date: $scope.data.depositDate,
                garnisheeBankAccountId: $scope.data.garnisheeBankAccountId
            };
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

        $scope.garnisheeBankChanged = function (garnisheeBankAccountId) {
            $scope.data.garnisheeBankAccountId = garnisheeBankAccountId;
        };

        var bankAccount = _.find(data.bankAccounts, function (bankAccount) {
            return bankAccount.isPrimary === true;
        });
        if (bankAccount) {
            data.bankId = bankAccount.id;
            $scope.bankChanged(bankAccount.id);
        }

        var garnisheeBankAccount = _.find(data.bankAccounts, function (bankAccount) {
            return bankAccount.isPrimary === true;
        });
        if (garnisheeBankAccount) {
            data.garnisheeBankAccountId = garnisheeBankAccount.id;
            $scope.garnisheeBankChanged(garnisheeBankAccount.id);
        }
    }

    function addFullBankNameToAllBankAccounts(bankAccounts){
        return _.map(bankAccounts, function(bankAccount){
            bankAccount.fullName = bankAccount.text + ' - ' + bankAccount.description;
            return bankAccount;
        });
    }

})();