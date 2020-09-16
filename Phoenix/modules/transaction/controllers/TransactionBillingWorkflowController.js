(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('TransactionBillingWorkflowController', TransactionBillingWorkflowController);

    TransactionBillingWorkflowController.$inject = ['$state', 'VmsApiService', 'resolveTransactionHeader'];

    function TransactionBillingWorkflowController($state, VmsApiService, resolveTransactionHeader) {
        var self = this;

        var reversedTransactions = resolveTransactionHeader.BillingTransactions.filter(function (i) { return i.ReversedBillingTransactionId !== null; });
        var hasReversedTransaction = !!(reversedTransactions && reversedTransactions.length);

        angular.extend(self, {
            transactionHeader: resolveTransactionHeader,
            hasReversedTransaction: hasReversedTransaction,
        });

        var transactionReverseCommandNames = ['TransactionHeaderActionReverse', 'TransactionHeaderActionReverseTimeSheetUnsubmit', 'TransactionHeaderActionReverseTimeSheetReturnToException'];

        var importReverseCommandNames = ['VmsDiscountRecordReverseTransaction'];

        self.transactionWorkflowIterator = function (item) {
            processItems(item, transactionReverseCommandNames, false);
        };

        self.discountImportIterator = function (item) {
            processItems(item, importReverseCommandNames, false);
        };

        self.reversedTransactionWorkflowIterator = function (item) {
            processItems(item, transactionReverseCommandNames, true);
            if (item) {
                item.action = 'Transaction Reverse'; // Section caption
            }
        };

        self.reversedDiscountImportIterator = function (item) {
            processItems(item, importReverseCommandNames, true);
            if (item) {
                item.action = 'Discount Import Reverse'; // Section caption
            }
        };

        var processItems = function (item, reverseCommandNames, showReversed) {
            if (item) {
                var reversed = false;
                if (item.items && item.items.length) {
                    for (var i = 0; i < item.items.length; i++) {
                        var currentItem = item.items[i];
                        reversed = reversed || (reverseCommandNames.indexOf(currentItem.TaskTemplateCommandName) != -1);
                        currentItem.reversed = reversed;
                    }
                }

                item.items = item.items.filter(function (i) { return i.reversed === showReversed; });

                if (reversed && !showReversed) {
                    // Prevent the current task from being displayed in the header.
                    item.started = null;
                    item.completed = null;
                    item.approver = null;
                    item.task = null;
                }
            }
            console.log(item);
        };

    }

    if (!app.resolve) app.resolve = {};
    app.resolve.TransactionBillingWorkflowController = {
        resolveTransactionHeader: ['$q', '$stateParams', 'TransactionApiService', function ($q, $stateParams, TransactionApiService) {
                                    var result = $q.defer();
                                    TransactionApiService.getByTransactionHeaderId($stateParams.transactionHeaderId).then(
                                        function (response) {
                                            result.resolve(response);
                                        },
                                        function (responseError) {
                                            result.reject(responseError);
                                        });
                                    return result.promise;
                                }]
    }; 

})(angular, Phoenix.App);