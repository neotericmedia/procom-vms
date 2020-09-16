(function () {
    'use strict';


    var controllerId = 'PaymentTransactionGarnisheeBatchGroupedDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PaymentTransactionGarnisheeBatchGroupedDialogController]);

    function PaymentTransactionGarnisheeBatchGroupedDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data.validationEventData;
        $scope.data.bankAccounts = data.bankAccounts;
        $scope.data.batchNo = _.find($scope.data.bankAccounts, function (bankAccount) {
            return bankAccount.id == $scope.data.BankId;
        }).batchNo;

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
                angular.forEach($scope.data.PaymentTransactionGarnisheesGroupedByGarnisheeList, function (item) {
                    if (item.IsValid) {
                        angular.forEach(item.TaskIds, function (taskId) {
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