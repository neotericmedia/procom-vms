(function () {
    'use strict';


    var controllerId = 'PaymentBatchGroupedByPayeeDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PaymentBatchGroupedByPayeeDialogController]);

    function PaymentBatchGroupedByPayeeDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data.validationEventData;
        $scope.selectedGroups = $scope.data.GroupedPaymentTransactionsList ? _.filter($scope.data.GroupedPaymentTransactionsList, function (gr) { return gr.IsSelected; }) : [];
        $scope.data.bankAccounts = data.bankAccounts;
        var batch = _.find($scope.data.bankAccounts, function (bankAccount) {
            return bankAccount.id == $scope.data.BankId;
        });

        $scope.data.batchNo = batch && batch.batchNo;


        $scope.isNotifyEventsSet = data.isNotifyEventsSet;

        $scope.cancel = function () {
            if ($scope.isNotifyEventsSet) {
                $uibModalInstance.close({ action: "ok" });
            }
            else {
                $uibModalInstance.close({ action: "cancel" });
            }
        };

        $scope.create = function () {
            if ($scope.isNotifyEventsSet) {
                $uibModalInstance.close({ action: "ok" });
            }
            else {
                var taskIds = [];
                angular.forEach($scope.data.GroupedPaymentTransactionsList, function (groupedPaymentTransactions) {
                    if (groupedPaymentTransactions.IsSelected) {
                        angular.forEach(groupedPaymentTransactions.TaskIds, function (taskId) {
                            taskIds.push(taskId);
                        });
                    }
                });
                var result = { action: "create", taskIds: taskIds, bankId: $scope.data.BankId, date: $scope.data.DepositDate, batchNo: $scope.data.batchNo };
                $uibModalInstance.close(result);
            }
        };
    }
})();