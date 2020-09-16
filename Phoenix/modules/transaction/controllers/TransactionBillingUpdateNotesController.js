/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';


    var controllerId = 'TransactionBillingUpdateNotesController';

    angular.module('phoenix.transaction.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', TransactionBillingUpdateNotesController]);

    function TransactionBillingUpdateNotesController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.model = data;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.save = function () {
            $uibModalInstance.close($scope.model);
        };
      
    }

})(Phoenix.App);