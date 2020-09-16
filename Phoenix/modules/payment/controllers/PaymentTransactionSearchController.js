(function (app) {
    'use strict';

    var controllerId = 'PaymentTransactionSearchController';
    app.controller(controllerId, ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'CodeValueService', 'PaymentApiService', 'WorkflowApiService', '$stateParams', PaymentTransactionSearchController]);
    function PaymentTransactionSearchController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, CodeValueService, PaymentApiService, WorkflowApiService, $stateParams) {

        NavigationService.setTitle('Payment Transactions', 'icon icon-payment');

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
            paymentTransactionStatuses: CodeValueService.getCodeValues(CodeValueGroups.PaymentTransactionStatus, true)
        };


        // Reloading data entry point
        $scope.callServer = function (tableState) {
            $scope.tableState = tableState;
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

            var paymentParams = oreq.request()
                .withSelect([
                    'Id',
                    'PaymentTransactionNumber',
                    'PaymentTransactionPayeeName',
                    'PaymentSubtotal', 'PaymentSalesTax',
                    'PayeeName',
                    'PayeeOrganizationIdSupplier',
                    'PayeeUserProfileWorkerId',
                    'WorkerName',
                    'WorkerProfileTypeId',
                    'StartDate',
                    'EndDate',
                    'Units',
                    'PaymentTransactionStatusId',
                    'RateUnitId',
                    'CurrencyId'
                ]).url();

            var promise = PaymentApiService.getAllPaymentTransactions(tableState, paymentParams)
               .then(function (response) {
                   angular.forEach(response.Items, function (item) {
                       if (item.CurrencyId) {
                           item.CurrencyCode = CodeValueService.getCodeValue(item.CurrencyId, CodeValueGroups.Currency).code;
                       } else {
                           item.CurrencyCode = '';
                       }

                       if (item.WorkerProfileTypeId) {
                           item.WorkerProfileType = CodeValueService.getCodeValue(item.WorkerProfileTypeId, CodeValueGroups.ProfileType).text;
                       } else {
                           item.WorkerProfileType = '';
                       }
                       if (item.RateUnitId) {
                           item.RateUnit = (item.RateUnitId == 2) ? ' Days' : ' Hours';
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
            if (!$state.is('payment.method.report')) {
                $state.go('.report', { paymentDocumentId: p.Id });
            }
            event.stopPropagation();
        };
    }

})(Phoenix.App);