/*global Phoenix: false, console: false*/
(function (app, angular) {
    // Controller name is handy for logging
    var controllerId = 'AssignmentViewTransactionsController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$state', '$stateParams', '$q', '$filter', 'TransactionApiService', 'TransactionViewService', 'CodeValueService', AssignmentViewTransactionsController]);

    function AssignmentViewTransactionsController($scope, $state, $stateParams, $q, $filter, TransactionApiService, TransactionViewService, CodeValueService) {

        var pageSize = 30;
        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;


        $scope.model = $scope.model || {};
        $scope.model.search = '';

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = pageSize;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.isLoading = true;

        $scope.loadItemsPromise = null;

        var sortAndFilter = function (items, tableState) {
            if (tableState.sort.predicate) {

                $scope.items = _.sortBy($scope.items, tableState.sort.predicate);

                if (tableState.sort.reverse) {
                    $scope.items = $scope.items.reverse();
                }
            }
            angular.forEach(tableState.search.predicateObject, function (val, key) {
                if (val.indexOf("_display'") > -1) {
                    $scope.items = _.filter($scope.items, function (item) {
                        return item[key] && item[key].indexOf(val) > -1;
                    });
                }
            });

        };

        $scope.callServer = function (tableState) {

            if (tableState.pagination.start >= $scope.pageSize) {
                $scope.pageSize = $scope.pageSize + pageSize;
            }
            tableState.pagination.pageSize = $scope.pageSize;

            var oDataParams = oreq.request()
                     .withExpand([
                         'BillingTransactions/BillingTransactionLines',
                         'PaymentTransactions/PaymentTransactionLines'
                     ])
                     .withSelect([
                         'Id',
                         'TransactionNumber',
                         'TransactionDate',
                         'StartDate',
                         'EndDate',
                         'Total',
                         'PaymentTotal',

                         'BillingTransactions/CurrencyId',
                         //'BillingTransactions/BillingTransactionLines/Rate',
                         //'BillingTransactions/BillingTransactionLines/Units',
                         //'BillingTransactions/BillingTransactionLines/Amount',
                         'BillingTransactions/TotalAmount',

                         'PaymentTransactions/CurrencyId',
                         //'PaymentTransactions/PaymentTransactionLines/Rate',
                         //'PaymentTransactions/PaymentTransactionLines/Units',
                         //'PaymentTransactions/PaymentTransactionLines/Amount',
                         'PaymentTransactions/TotalAmount',
                     ]).url();

            var simpleTableState = angular.extend({}, tableState);
            // We do custom sort by code in sortAndFilter().
            if (simpleTableState.sort) {
                delete simpleTableState.sort;
            }

            var promise = TransactionApiService.getAllByWorkOrderId($stateParams.workOrderId, oDataParams, simpleTableState).then(function (transactionHeaders) {
                $scope.items = [];

                angular.forEach(transactionHeaders.Items, function (transactionHeader, index) {

                    //transactionHeader.TransactionHeaderPeriod_display =
                    //    (transactionHeader.StartDate && transactionHeader.EndDate) ?
                    //    ($filter('date')(transactionHeader.StartDate, ApplicationConstants.formatDate) + ' - ' + $filter('date')(transactionHeader.EndDate, ApplicationConstants.formatDate)) :
                    //    '';
                    //transactionHeader = TransactionViewService.Calculate(transactionHeader);
                    //transactionHeader.TransactionHeaderDate_display = $filter('date')(transactionHeader.TransactionDate, ApplicationConstants.formatDate);
                    //transactionHeader.TotalBill_display = transactionHeader.billing.CurrencyCode + ' $' + $filter('currency')(transactionHeader.billing.Total, "");
                    //transactionHeader.TotalPay_display = transactionHeader.payment.CurrencyCode + ' $' + $filter('currency')(transactionHeader.payment.Total, "");

                    var totalBill = 0;
                    var billCurrencyCode = '';

                    transactionHeader.BillingTransactions.forEach(function (trn) {
                        totalBill += trn.TotalAmount;
                        billCurrencyCode = CodeValueService.getCodeValue(trn.CurrencyId, CodeValueGroups.Currency).code;
                    });

                    var totalPay = 0;
                    var payCurrencyCode = '';

                    transactionHeader.PaymentTransactions.forEach(function (trn) {
                        totalPay += trn.TotalAmount;
                        payCurrencyCode = CodeValueService.getCodeValue(trn.CurrencyId, CodeValueGroups.Currency).code;
                    });

                    transactionHeader.TransactionHeaderPeriod_display =
                        (transactionHeader.StartDate && transactionHeader.EndDate) ?
                        ($filter('date')(transactionHeader.StartDate, ApplicationConstants.formatDate) + ' - ' + $filter('date')(transactionHeader.EndDate, ApplicationConstants.formatDate)) :
                        '';
                    transactionHeader.TransactionHeaderDate_display = $filter('date')(transactionHeader.TransactionDate, ApplicationConstants.formatDate);
                    transactionHeader.TotalBill_display = billCurrencyCode + ' $' + $filter('currency')(totalBill, "");
                    transactionHeader.TotalPay_display = payCurrencyCode + ' $' + $filter('currency')(totalPay, "");
                    $scope.items.push(transactionHeader);
                });
                $scope.totalItemCount = $scope.items.length;

            });
            $scope.loadItemsPromise = promise;
            promise.then(function () {
                sortAndFilter($scope.items, tableState);
            });
        };
    }
}
)(Phoenix.App, angular);