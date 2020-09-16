(function (app, angular) {
    'use strict';

    var controllerId = 'TimesheetExceptionController';

    angular.module('phoenix.timesheet.controllers').controller(controllerId,
        ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'TimesheetApiService', TimesheetExceptionController]);

    function TimesheetExceptionController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, TimesheetApiService) {

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;
        $scope.refreshTable = false;
        $scope.draftSearch = '6';
        $scope.routeChangeString = "";

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
            ]
        };

        NavigationService.setTitle('timesheet-exceptions');

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

            var promise = TimesheetApiService.getTimesheetExceptions(tableState).then(
                function (response) {
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

        $scope.viewExceptionComment = function (comment, exception) {
            if (comment && comment.ValidationCodeId) {
                switch (comment.ValidationCodeId) {
                    case ApplicationConstants.ValidationCodes.TimeSheetWorkOrderHasDailyPayRates:
                    case ApplicationConstants.ValidationCodes.TimeSheetWorkOrderHasFixedRates:
                        $scope.selectWorkOrder(exception);
                        break;
                    case ApplicationConstants.ValidationCodes.NotEnoughPurchaseOrderFunds:
                    case ApplicationConstants.ValidationCodes.TimeSheetOver50HoursInAWeek:
                    case ApplicationConstants.ValidationCodes.TimeSheetTransactionExistsForTheSameTimePeriod:
                    case ApplicationConstants.ValidationCodes.TimeSheetOver50kTransaction:
                        if (exception && exception.TimeSheetId && exception.WorkOrderId) {
                            $state.go('timesheet.details', { timesheetId: exception.TimeSheetId, workOrderId: exception.WorkOrderId, redirectOnComplete: 'timesheet.exceptions' });
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        $scope.selectWorkOrder = function (exception) {
            if (exception && exception.WorkOrderId) {
                $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: exception.WorkOrderId, workOrderVersionId: 0 });
            }
        };
    }

})(Phoenix.App, angular);