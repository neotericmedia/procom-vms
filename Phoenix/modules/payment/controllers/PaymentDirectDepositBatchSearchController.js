/*global Phoenix: false, console: false*/

(function (app, angular) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'PaymentDirectDepositBatchSearchController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.payment.controllers').controller(controllerId,
        ['$scope', '$state', '$rootScope', '$location', '$filter', 'NavigationService', 'PaymentApiService', 'CodeValueService', PaymentDirectDepositBatchSearchController]);

    function PaymentDirectDepositBatchSearchController($scope, $state, $rootScope, $location, $filter, NavigationService, PaymentApiService, CodeValueService) {

        if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined")
            $scope.viewLoading = false;
        else
            $scope.stopSpinning();

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        NavigationService.setTitle('Direct Deposit Batch Management-Bank Accounts', ['icon icon-payment']);

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

            var promise = PaymentApiService.getPaymentDirectDepositBatchesGrouped(tableState)
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

        $scope.toggleCollapse = function (item) {
            var itemState = item.IsExpanded;
            collapseAllItems($scope.items);
            item.IsExpanded = !itemState;
        };

        var collapseAllItems = function (items) {
            for (var i = 0; i < items.length; i++) {
                items[i].IsExpanded = false;
            }
        };

        $scope.lists = {
            paymentReleaseBatchStatusList: CodeValueService.getCodeValues(CodeValueGroups.PaymentReleaseBatchStatus),
            currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true)
        };

    }

})(Phoenix.App, angular);