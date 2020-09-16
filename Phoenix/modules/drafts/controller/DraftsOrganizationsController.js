/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    var controllerId = 'DraftsOrganizationsController';

    angular.module('phoenix.drafts.controllers')
        .controller(controllerId, ['$scope', 'DraftsApiService', DraftsOrganizationsController]);

    function DraftsOrganizationsController($scope, DraftsApiService) {

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;
            
        $scope.model = {};
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;

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

            var promise = DraftsApiService.getListDraftOrganizations(tableState)
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


        $scope.linksRenderCallback = function (propertyName, item) {
            var path = '';
            if (propertyName == 'OrganizationDisplayName') {
                path = '#/organization/' + item.Id;
            }
            return path;
        };

    }


})(angular, Phoenix.App);