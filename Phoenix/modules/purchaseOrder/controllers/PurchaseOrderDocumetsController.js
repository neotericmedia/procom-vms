(function (angular, app) {
    'use strict';

    var controllerId = 'PurchaseOrderDocumetsController';

    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,
        ['$scope', PurchaseOrderDocumetsController]);

    function PurchaseOrderDocumetsController($scope) {

        $scope.model.entity.documentsLength = 0;

        $scope.getDocumentsLength = function (documentsLength, entityTypeId, entityId) {
            $scope.model.entity.documentsLength = documentsLength;
        };

    }

})(angular, Phoenix.App);