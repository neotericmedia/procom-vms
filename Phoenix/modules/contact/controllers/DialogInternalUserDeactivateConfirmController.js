/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';


    var controllerId = 'DialogInternalUserDeactivateConfirmController';

    angular.module('phoenix.contact.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', DialogInternalUserDeactivateConfirmController]);

    function DialogInternalUserDeactivateConfirmController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;

        $scope.model = {};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.confirm = function () {
            $scope.model = { 'Action': 'Deactivate' };
            $uibModalInstance.close($scope.model);
        };

        $scope.confirmAndReassign = function () {
            $scope.model = { 'Action': 'DeactivateAndReassign' };
            $uibModalInstance.close($scope.model);
        };

    }

})(Phoenix.App);