(function (app) {
    'use strict';


    var controllerId = 'ComplianceDocumentSetExpiryDateAndOrCommentDialogController';

    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', ComplianceDocumentSetExpiryDateAndOrCommentDialogController]);

    function ComplianceDocumentSetExpiryDateAndOrCommentDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);
        $scope.data = angular.copy(data);

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.submit = function () {
            var result = { action: "submit", model: $scope.data };
            $uibModalInstance.close(result);
        };
    }

})(Phoenix.App);