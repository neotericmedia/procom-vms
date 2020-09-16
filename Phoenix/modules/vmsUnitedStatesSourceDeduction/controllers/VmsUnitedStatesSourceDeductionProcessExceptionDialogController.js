(function () {
    'use strict';

    var controllerId = 'VmsUnitedStatesSourceDeductionProcessExceptionDialogController';

    angular.module('phoenix.vms.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', VmsUnitedStatesSourceDeductionProcessExceptionDialogController]);

    function VmsUnitedStatesSourceDeductionProcessExceptionDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.reason = data.validationEventData.Message;
        $scope.title = "The following records cannot be processed";
        $scope.cancel = function () {
            var result = { action: "ok" };
            $uibModalInstance.close(result);
        };
        $scope.unprocessedRecords = [];

        $scope.unprocessedRecords = _.filter(data.records, function (item) {
            return _.includes(data.validationEventData.ExceptionEntityIds, item.Id);
        });
    }
})();