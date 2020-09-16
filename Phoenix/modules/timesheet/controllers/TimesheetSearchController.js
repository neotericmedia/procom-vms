(function (app, angular) {
    'use strict';

    var controllerId = 'TimesheetSearchController';

    angular.module('phoenix.timesheet.controllers').controller(controllerId, ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'CodeValueService', 'TimesheetApiService', 'SmartTableService', 'JournalApiService', TimesheetSearchController]);

    function TimesheetSearchController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, CodeValueService, TimesheetApiService, SmartTableService, JournalApiService) {

        common.setControllerName(controllerId);

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;
        $scope.refreshTable = false;
        $scope.firstCallServer = true;
        $scope.draftSearch = '6';
        $scope.IsLoaded = false;

        $rootScope.$on('broadcastEvent:WorkflowProcess', function (event, data) {
            $scope.refreshTable = true;
            $timeout(function () {
                $scope.refreshTable = false;
            }, 0);
        });
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;
        $scope.lists = {
            timesheetStatusList: [
                { id: 1, text: 'New' },
                { id: 2, text: 'Draft' },
                { id: 3, text: 'Pending Review' },
                { id: 4, text: 'Approved' },
                { id: 5, text: 'Declined' },
                { id: 6, text: 'Pending Documents' },
                { id: 7, text: 'Withdrawn' }
            ],
        };

        NavigationService.setTitle('Timesheets', 'icon icon-timesheet');

        // Used for the loading bar
        $scope.loadItemsPromise = null;
        var promise;

        // Reloading data entry point
        $scope.callServer = function (tableState) {
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;

            if ($scope.firstCallServer === true) {
                // Set Intial Filtering
                if (!tableState.isLoadedFromPreviousState) {
                    tableState.search.predicateObject = {};
                    tableState.search.predicateObject.TimeSheetStatusId = 3;
                }
                $scope.firstCallServer = false;
            }

            // full refresh
            if (tableState.pagination.start === 0) {
                $scope.currentPage = 1;
                isPaging = false;
            }
                // pagination
            else {
                // (tableState.pagination.start >= $scope.pageSize)
                $scope.currentPage++;
                isPaging = true;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;

            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            $scope.tableState = tableState;
            var oDataParams = oreq.request()
                .withSelect([
                    'Id',
                    'WorkerName',
                    'ClientName',
                    'StartDate',
                    'EndDate',
                    'TotalUnits',
                    'TimeSheetStatusId',
                    'CurrentApprovers',
                    'PORateUnitId',
                    'POUnitsRemaining',
                    'PONumber',
                ])
                //.withFilter(oreq.filter("TimeSheetStatusId").eq(ApplicationConstants.TimeSheetStatus.PendingReview))
                .url();

            var params = oDataParams + '&' + tableStateParams;

            promise = TimesheetApiService.getTimesheetsAndWorkOrdersByPendingTask(params).then(
                function (responseSucces) {
                    if (isPaging === true) {
                        $scope.items = $scope.items.concat(responseSucces.Items);
                        $scope.totalItemCount = responseSucces.Count;
                    } else {
                        $scope.totalItemCount = responseSucces.Count;
                        $scope.items = responseSucces.Items;
                    }
                    $scope.IsLoaded = true;
                },
                function (responseError) {
                    common.responseErrorMessages(responseError);
                });

            if (isPaging !== true) {
                $scope.loadItemsPromise = promise;
            }
        };

        $scope.getExcel = function () {
            var columnsCount = 11;
            var excelData = JournalApiService.tableToExcel("timesheet", columnsCount);
            var exportString = excelData.exportString;
            var exportData = excelData.exportData;

            saveTextAs(exportString, "sample.csv");
        };
    }

})(Phoenix.App, angular);