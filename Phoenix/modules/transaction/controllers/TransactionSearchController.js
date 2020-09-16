(function (app) {
    'use strict';

    var controllerId = 'TransactionSearchController';
    app.controller(controllerId, ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'TransactionApiService', 'CodeValueService', TransactionSearchController]);
    function TransactionSearchController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, TransactionApiService, CodeValueService) {

        $scope.selectedCount = 0;
        $scope.totalItemCount = 0;

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.pageSize = 30;
        $scope.pageCount = 1;
        $scope.items = [];
        $scope.lists = {
            draftStatusList: [{ id: true, text: 'Draft' }, { id: false, text: 'Active' }],            
            transactionTypeList: CodeValueService.getCodeValues(CodeValueGroups.TransactionType, true),
        };

        NavigationService.setTitle('Transactions', 'icon icon-transaction');

        function buildPromise(tableState, isTruncated) {
            var oDataParams;

            if (isTruncated === true) {
                oDataParams = oreq.request().withSelect(['Id']).url();
            } else {
                oDataParams = oreq.request()
                    .withExpand([
                        'BillingTransactions/BillingTransactionLines'
                    ])
                    .withSelect([
                        'Id',
                        'TransactionNumber',
                        'TransactionTypeId',
                        'OrganizationIdInternal',
                        'OrganizationInternalCode',
                        'WorkerName',
                        'PayeeName',
                        'ClientCompany',
                        'FromDate',
                        'ToDate',
                        'Subtotal',
                        'Tax',
                        'Total',
                        'PaymentSubtotal',
                        'PaymentTax',
                        'PaymentDeductions',
                        'PaymentTotal',
                        'PONumber',
                        'IsDraft',
                        'BillingTransactions/CurrencyId',
                        //'BillingTransactions/BillingTransactionLines/Id',
                    ]).url();
            }

            return TransactionApiService.getSearchByTableState(tableState, oDataParams);
        }

        $scope.selectAllVirtual = function (tableState) {
            return buildPromise(tableState, true);
        };

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        // Reloading data entry point
        $scope.callServer = function (tableState) {
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

            if (tableState.search && tableState.search.predicateObject && tableState.search.predicateObject.TransactionNumber) {
                var txnValue = tableState.search.predicateObject.TransactionNumber;
                txnValue = txnValue.replace(/\s+/g, '');
                tableState.search.predicateObject.TransactionNumber = txnValue;
            }

            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;

            var promise = buildPromise(tableState)
               .then(function (response) {
                   angular.forEach(response.Items, function (item) {
                       if (angular.isArray(item.BillingTransactions) && item.BillingTransactions[0] && item.BillingTransactions[0].CurrencyId) {
                           item.CurrencyCode = CodeValueService.getCodeValue(item.BillingTransactions[0].CurrencyId, CodeValueGroups.Currency).code;
                       }
                       else {
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

        $scope.selectTransaction = function (transaction, isInternal) {
            var url;

            if (transaction.IsDraft && transaction.TransactionTypeId == ApplicationConstants.TransactionType.Manual) {
                if (!!isInternal) {
                    $state.go('transaction.manual.detail', {
                        transactionHeaderId: transaction.Id
                    });
                } else {
                    url = $state.href('transaction.manual.detail', {
                        transactionHeaderId: transaction.Id
                    });
                    window.open(url, '_blank');
                }
            }
            else {
                if (!!isInternal) {
                    $state.go('transaction.view.summary', {
                        transactionHeaderId: transaction.Id
                    });
                } else {
                    url = $state.href('transaction.view.summary', {
                        transactionHeaderId: transaction.Id
                    });
                    window.open(url, '_blank');
                }
            }
        };


        $scope.rowClick = function (e, item) {
            var button = e.which || e.button;
            if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey)) {
                $scope.selectTransaction(item, true);
                e.preventDefault();
            } else if (button === 1 && (e.ctrlKey || e.metaKey || e.shiftKey)) {
                $scope.selectTransaction(item, false);
                e.preventDefault();
            }
        };

        $scope.rowMouseDown = function (e, item) {
            var button = e.which || e.button;
            if (button === 2) {
                $scope.selectTransaction(item, false);
                e.preventDefault();
            }
        };
    }

})(Phoenix.App);