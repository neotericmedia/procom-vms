(function (app) {
    'use strict';


    var controllerId = 'PaymentChangeReleaseDateDialogController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', PaymentChangeReleaseDateDialogController]);

    function PaymentChangeReleaseDateDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);
        $scope.data = angular.copy(data);
        $scope.data.releaseDate = null;
        $scope.data.changeDateChk = true;
        $scope.data.putOnHoldChk = false;

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.changeReleaseDate = function (ids, changeOrHold, date) {
            var result = { action: "change", ids: ids, changeOrHold: changeOrHold, date: date };
            $uibModalInstance.close(result);
        };

        $scope.changeChkChanged = function () {
            $scope.data.changeDateChk = true;
            $scope.data.putOnHoldChk = false;
        };

        $scope.onHoldChkChanged = function () {
            $scope.data.changeDateChk = false;
            $scope.data.putOnHoldChk = true;
            $scope.data.releaseDate = null;
        };

        $scope.$watch('data.changeDateChk', function(newVal, oldVal) { 
           if(oldVal && !$scope.data.putOnHoldChk)
                $scope.data.changeDateChk = true;
        });

        $scope.$watch('data.putOnHoldChk', function(newVal, oldVal) { 
           if(oldVal && !$scope.data.changeDateChk)
                $scope.data.putOnHoldChk = true;
        });
    }

})(Phoenix.App);