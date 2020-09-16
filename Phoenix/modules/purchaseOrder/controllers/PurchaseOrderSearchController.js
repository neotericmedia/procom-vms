/*global Phoenix: false, console: false*/

(function (app, angular) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'PurchaseOrderSearchController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,
        ['$scope', '$state', 'NavigationService', 'PurchaseOrderApiService', PurchaseOrderSearchController]);

    function PurchaseOrderSearchController
        ($scope, $state, NavigationService, PurchaseOrderApiService) {

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        NavigationService.setTitle('Search Purchase Order', 'icon icon-purchaseorder');

        $scope.model = {};
        $scope.model.search = '';

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        // Reloading data entry point
        $scope.callServer = function (tableState) {

            $scope.currentPage = $scope.currentPage || 1;

            var isPaging = false;

            // full refresh
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                $scope.currentPage = 1;
                isPaging = false;
            }
                // pagination
            else {
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;
            var oDataParams = oreq.request().withSelect([
                'Id',
                'PurchaseOrderNumber',
                'OrganizationDisplayName',
                'TotalAmount',
                'TotalAmountCommitted',
                'TotalAmountSpent',
                'PurchaseOrderStatusName'
            ])
                .url();
            var promise = PurchaseOrderApiService.getSearchByTableState(tableState, oDataParams)
               .then(function (response) {
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = response.Items;
                   }
               });

            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        $scope.addPurchaseOrder = function () {
            $state.go('purchaseorder.create');
        };
    }

})(Phoenix.App, angular);