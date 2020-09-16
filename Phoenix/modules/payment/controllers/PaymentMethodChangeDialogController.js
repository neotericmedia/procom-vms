(function () {
    'use strict';


    var controllerId = 'PaymentMethodChangeDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', 'CodeValueService', '$uibModalInstance', 'common', 'data', PaymentMethodChangeDialogController]);

    function PaymentMethodChangeDialogController($scope, CodeValueService, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;
        $scope.data.paymentMethodId = null;
        $scope.paymentMethods = CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType);

        $scope.paymentMethods = _.filter($scope.paymentMethods, function (pm) {
            return pm.id !== data.methodId && pm.id !== ApplicationConstants.PaymentMethodType.FromPayeeProfile;
        });

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.submit = function () {
            var result = { action: "create", taskIds: $scope.data.taskIds, paymentMethodId: $scope.data.paymentMethodId };
            $uibModalInstance.close(result);
        };
    }

})();