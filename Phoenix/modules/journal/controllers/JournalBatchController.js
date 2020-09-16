(function (angular) {
    'use strict';

    var controllerId = 'JournalBatchController';
    angular.module('phoenix.journal.controllers').controller(controllerId, ['$scope', '$state', '$stateParams', 'common', 'NavigationService', 'CodeValueService', 'JournalApiService', JournalBatchController]);
    function JournalBatchController($scope, $state, $stateParams, common, NavigationService, CodeValueService, JournalApiService) {
                
        NavigationService.setTitle('Journal Batches', 'icon icon-journal');

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];

        $scope.loadItemsPromise = null;

        var organizationIdInternal = parseInt($stateParams.organizationId, 10);
        $scope.organizationIdInternal = organizationIdInternal;

        $scope.callServer = function (tableState) {
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;
            if (tableState.pagination.start === 0) {
                angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                $scope.currentPage = 1;
                isPaging = false;
            }
            else {
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;           
            
            var batchParams = oreq.request().withSelect(['Id', 'BatchNumber', 'BatchCount', 'ExportDate', 'OrganizationInternalLegalName', 'ShowAP', 'ShowAR']).url();
            var promise = JournalApiService.getJournalBatches(organizationIdInternal, tableState, batchParams)
               .then(function (response) {
                   if (isPaging === true) {
                       $scope.items = $scope.items.concat(response.Items);
                       $scope.totalItemCount = response.Count;
                   } else {
                       $scope.totalItemCount = response.Count;
                       $scope.items = response.Items;
                   }
                   if (response.Items.length > 0) {
                       var internalCompany = response.Items[0].OrganizationInternalLegalName;
                       NavigationService.setTitle('Journal Batches for ' + internalCompany, ['icon icon-journal']);
                   }
               });
            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        $scope.csvUrl = function (batchId) {
            return JournalApiService.csvStreamByBatchId(batchId);
        };

        $scope.arReportUrl = function (batchId) {
            return JournalApiService.arReportStreamByBatchId(batchId);
        };

        $scope.accpacUrl = function (batchId) {
            return JournalApiService.accpacStreamByBatchId(batchId);
        };

        $scope.accpacARUrl = function (batchId) {
            return JournalApiService.accpacARStreamByBatchId(batchId);
        };
    }

})(angular);