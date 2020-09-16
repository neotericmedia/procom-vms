(function (app) {
    'use strict';

    var controllerId = 'PaymentSearchController';
    app.controller(controllerId, ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'CodeValueService', 'PaymentApiService', 'WorkflowApiService', '$stateParams', PaymentSearchController]);
    function PaymentSearchController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, CodeValueService, PaymentApiService, WorkflowApiService, $stateParams) {

        NavigationService.setTitle('Payments', 'icon icon-payment');

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

        $scope.list = {
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType, true),
            workOrderWorkLocations: CodeValueService.getCodeValues(CodeValueGroups.Worksite, true),
            currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
        };


        // Reloading data entry point
        $scope.callServer = function (tableState) {
            $scope.tableState = tableState;
            $scope.currentPage = $scope.currentPage || 1;
            var isPaging = false;

            // Set intial filtering
            if (!tableState.isLoadedFromPreviousState && tableState.search && !tableState.search.predicateObject) {
                tableState.search.predicateObject = {};
            }

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

            var paymentParams = oreq.request()
                .withExpand(['PaymentTransactions'])
                .withSelect([
                    'Id',
                    'PaymentNumber',
                    'PaymentDate',
                    'PaymentMethodId',
                    'CurrencyId',
                    'PaymentTotal',
                    'PayeeName',
                    'PayeeTypeId',
                    'TransactionsCount',
                    'WorkerName',

                    'PaymentTransactions/Id',
                    'PaymentTransactions/PaymentTransactionNumber',
                    'PaymentTransactions/PaymentTransactionPayeeName',
                    'PaymentTransactions/WorkerName',
                    'PaymentTransactions/WorksiteId',
                    'PaymentTransactions/PaymentDate',
                    'PaymentTransactions/StartDate',
                    'PaymentTransactions/EndDate',
                    'PaymentTransactions/Amount',
                    'PaymentTransactions/CurrencyId',
                ])
                .url();

            var promise = PaymentApiService.getPayments(tableState, paymentParams)
               .then(function (response) {
                   angular.forEach(response.Items, function (item) {
                       if (item.CurrencyId) {
                           item.CurrencyCode = CodeValueService.getCodeValue(item.CurrencyId, CodeValueGroups.Currency).code;
                       } else {
                           item.CurrencyCode = '';
                       }

                       if (item.PaymentMethodId) {
                           item.PaymentMethodType = CodeValueService.getCodeValue(item.PaymentMethodId, CodeValueGroups.PaymentMethodType).code;
                       } else {
                           item.CurrencyCode = '';
                       }
                   });

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

        $scope.showReport = function (p) {
            if (!$state.is('payment.search.report')) {
                $state.go('.report', { paymentDocumentId: p.Id });
            }
        };
    }

})(Phoenix.App);