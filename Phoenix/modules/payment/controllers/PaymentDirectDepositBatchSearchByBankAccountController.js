/*global Phoenix: false, console: false*/

(function (app, angular) {
    'use strict';

    var controllerId = 'PaymentDirectDepositBatchSearchByBankAccountController';

    angular.module('phoenix.payment.controllers').controller(controllerId,
        ['$scope', '$state', '$stateParams', 'NavigationService', 'PaymentApiService', 'CodeValueService',
            PaymentDirectDepositBatchSearchByBankAccountController]);

    function PaymentDirectDepositBatchSearchByBankAccountController($scope, $state, $stateParams, NavigationService, PaymentApiService, CodeValueService) {

        if (typeof $scope.viewLoading == "undefined" || typeof $scope.stopSpinning == "undefined") {
            $scope.viewLoading = false;
        }
        else {
            $scope.stopSpinning();
        }

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

            var oDataParams = oreq.request()
                  .withSelect([
                      'Id',
                      'BatchNumber',
                      'DepositDate',
                      'Amount',
                      'CurrencyId',
                      'BatchStatusId',
                      'InternalOrganizationBankAccountBankName'
                  ])
                //.withFilter(oreq.filter("InternalOrganizationBankAccountId").eq($stateParams.bankAccountId))
                //.withFilter(oreq.filter("BatchStatusId").eq($stateParams.batchStatusId))
                .url(); 
            var promise = PaymentApiService.getPaymentDirectDepositBatchesByBankAccountAndBatchStatus($stateParams.bankAccountId, /*$stateParams.batchStatusId,*/ tableState, oDataParams)
               .then(function (response) {
                   NavigationService.setTitle(
                       (response.Items.length > 0 ? response.Items[0].InternalOrganizationBankAccountBankName + ' - ' : '') +
                       'Direct Deposit Batches', ['icon icon-payment']);

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

        $scope.lists = {
            paymentReleaseBatchStatusList: CodeValueService.getCodeValues(CodeValueGroups.PaymentReleaseBatchStatus),
            currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
        };

        $scope.onClick = function (item) {
            $state.go('payment.directdepositbatch.management', { batchId: item.Id });
        };

    }

})(Phoenix.App, angular);