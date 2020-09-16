/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';
    var controllerId = 'PurchaseOrderLineEditController';
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId, ['$scope', 'common', '$uibModalInstance', '$controller', 'data', 'PurchaseOrderApiService', function ($scope, common, $uibModalInstance, $controller, data, PurchaseOrderApiService) {

        console.log("Can probably delete this");

    }]);
})(Phoenix.App);