(function (app, angular) {
    'use strict';
    var controllerId = 'PaymentReleaseScheduleController';

    angular.module('phoenix.workorder.controllers').controller(controllerId,
        ['$scope', '$state', '$stateParams', '$filter', 'AssignmentApiService', 'SmartTableService', PaymentReleaseScheduleController]);

    function PaymentReleaseScheduleController($scope, $state, $stateParams, $filter, AssignmentApiService, SmartTableService) {

        if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
            $scope.viewLoading = false;
        else
            $scope.stopSpinning();

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

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

        $scope.close = function () { $state.go('^'); };

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
            var fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 3); // display up to 3 months prior
            tableState.search = { predicateObject: { ODATAEXP_TimesheetEndDate: "TimesheetEndDate ge datetime'" + $filter('date')(fromDate, "yyyy-MM-dd") + "'" } };

            var oDataParams = SmartTableService.generateRequestObject(tableState).url();

            var promise = AssignmentApiService.getPaymentReleaseScheduleDetail($stateParams.paymentReleaseScheduleId, oDataParams)
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

        $scope.addWorkOrder = function () {
            $state.go('workorder.createsetup');
        };
    }

})(Phoenix.App, angular);