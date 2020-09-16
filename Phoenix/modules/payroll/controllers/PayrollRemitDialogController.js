(function () {
    'use strict';


    var controllerId = 'PayrollRemitDialogController';

    angular.module('phoenix.payroll.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PayrollRemitDialogController]);

    function PayrollRemitDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.continueRemittance = function () {
            var result = { action: "continueRemittance" };
            $uibModalInstance.close(result);
        };

        $scope.download = function () {
            var result = { action: "download" };
            $uibModalInstance.close(result);
        };
        $scope.remittedBatch = function () {
            var result = { action: "remittedBatch" };
            $uibModalInstance.close(result);
        };
    }

})();