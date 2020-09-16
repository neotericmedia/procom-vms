/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';


    var controllerId = 'WorkOrderUpdateDialogController';

    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'CodeValueService', 'data', WorkOrderUpdateDialogController]);

    function WorkOrderUpdateDialogController($scope, $uibModalInstance, common, CodeValueService, data) {

        common.setControllerName(controllerId);

        $scope.data = data;
        $scope.data.isDatePickerRequired = data.isDatePickerRequired || false;
        $scope.data.terminationReasons = CodeValueService.getCodeValues(CodeValueGroups.TerminationReason);

        $scope.model = {};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.save = function () {
            $uibModalInstance.close($scope.model);
        };

        $scope.hitEnter = function (evt) {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.model.comment, null) || angular.equals($scope.model.comment, '')))
                $scope.save();
        };

    }

})(Phoenix.App);