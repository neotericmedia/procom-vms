/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';
    var controllerId = 'PurchaseOrderAssociatedWorkOrderController';
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId, PurchaseOrderAssociatedWorkOrderController);

    PurchaseOrderAssociatedWorkOrderController.$inject = ['$scope', 'common', 'purchaseOrder', 'PurchaseOrderApiService'];

    function PurchaseOrderAssociatedWorkOrderController($scope, common, purchaseOrder, PurchaseOrderApiService) {

        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];

        $scope.tableState = {};
        $scope.initTableState = {};
        $scope.loadItemsPromise = null;

        $scope.callServer = function (tableState, client) {
            $scope.tableState = tableState;
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            // pagination
            if (tableState.pagination.start >= $scope.pageSize) {
                $scope.currentPage++;
                isPaging = true;
            } else {
                $scope.currentPage = 1;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;

            var oDataParams = oreq.request().url();

            var promise = PurchaseOrderApiService.getWorkOrderPurchaseOrderLinesByPurchaseOrderId(purchaseOrder.Id, tableState, oDataParams)
               .then(function (response) {
                   var items = response.Items;

                   if (!client) {
                       $scope.initTableState = angular.copy(tableState);
                   }
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = items;
                   }
               });
            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

    }

    if (!app.resolve) app.resolve = {};

})(angular, Phoenix.App);