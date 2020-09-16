(function (angular) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('BranchSearchController', BranchSearchController);

    BranchSearchController.$inject = ['$scope', 'common', 'NavigationService', 'CodeValueService', 'BranchApiService'];

    function BranchSearchController($scope, common, NavigationService, CodeValueService, BranchApiService) {

        var self = this;

        NavigationService.setTitle('branch-manage');

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];

        $scope.model = {};
        $scope.tableState = {};
        $scope.initTableState = {};
        $scope.loadItemsPromise = null;

        BranchApiService.canCreate.then(
            function (canCreate) {
                $scope.canCreate = canCreate;
            });

        // Reloading data entry point
        $scope.callServer = function (tableState, client) {
            $scope.tableState = tableState;
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            // full refresh
            //if (tableState.pagination.start === 0) {
            //    //angular.element("table[data-st-table='items'] tbody").scrollTop(0);
            //    isPaging = false;
            //}
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

            var promise = BranchApiService.getBranches(tableState, oDataParams)
               .then(function (response) {
                   if (!client) {
                       $scope.initTableState = angular.copy(tableState);
                   }
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


    }

})(angular);