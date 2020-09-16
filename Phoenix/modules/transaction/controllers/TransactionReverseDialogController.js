/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';


    var controllerId = 'TransactionReverseDialogController';

    angular.module('phoenix.transaction.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', TransactionReverseDialogController]);

    function TransactionReverseDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;

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