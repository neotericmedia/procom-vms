(function () {
    'use strict';


    var controllerId = 'PaymentMethodBatchGroupedByPayeeDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', 'CodeValueService', '$uibModalInstance', 'common', 'data', PaymentMethodBatchGroupedByPayeeDialogController]);

    function PaymentMethodBatchGroupedByPayeeDialogController($scope, CodeValueService, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data.validationEventData;
        $scope.paymentMethod = CodeValueService.getCodeValue(data.paymentMethodId, CodeValueGroups.PaymentMethodType).text;

        $scope.cancel = function () {
            $uibModalInstance.close({ action: "ok" });
        };
    }
})();