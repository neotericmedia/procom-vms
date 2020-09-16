(function () {
    angular.module('phoenix.payment.controllers')
        .constant('directDepositBatchGroupings', {
            companies: {
                apply: function (key, data) {
                    return {
                        companyName: key,
                        companyId: data[0].OrganizationIdInternal,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'InternalOrganizationLegalName');
                },
                next: {
                    property: 'currencies',
                    target: 'currencies'
                }
            },
            currencies: {
                apply: function (key, data) {
                    return {
                        currencyCode: key,
                        count: data.length,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'InternalOrganizationBankAccountCurrencyId');
                },
                next: {
                    property: 'bankAccounts',
                    target: 'bankAccounts'
                }
            },
            bankAccounts: {
                apply: function (key, data) {
                    return {
                        bankAccountName: data[0].InternalOrganizationBankAccountBankNameWithDescription,
                        bankAccountId: data[0].InternalOrganizationBankAccountId,
                        count: data.length,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'InternalOrganizationBankAccountId');
                },
                next: {
                    property: 'statuses',
                    target: 'statuses'
                }
            },

            statuses: {
                apply: function (key, data) {
                    return {
                        statusId: key,
                        count: data.length > 0 ? data[0].Count : 0
                    };
                },
                action: function(data) {
                    var statuses = _.groupBy(data, 'BatchStatusId');
                    statuses = _.omit(statuses, ['2', '3', '4', '6']);
                    return statuses;
                },
                template: {
                    1: []
                }
            }
        })
        .controller('PaymentDirectDepositBatchSearchGroupController', ['$scope', 'phoenixauth', 'CodeValueService', 'NavigationService', 'PaymentApiService', 'commonDataService', 'aggregateSummarizer', 'directDepositBatchGroupings', PaymentDirectDepositBatchSearchGroupController]);

    /** @ngInject **/
    function PaymentDirectDepositBatchSearchGroupController($scope, phoenixauth,  CodeValueService, NavigationService, PaymentApiService, commonDataService, aggregateSummarizer, directDepositBatchGroupings) {
        NavigationService.setTitle('payments-managedd');
        $scope.loadItemsPromise = null;
        phoenixauth.getCurrentProfile().then(function (user) {
            $scope.currentUser = user;
        });
        function getListOrganizationInternal() {
            commonDataService.getListOrganizationInternal().then(
                 function (response) {
                     angular.forEach(response, function (org) {
                         $scope.lists.listOrganizationInternal.push({ id: org.Id, text: org.DisplayName });
                     });
                 }).then(function () {
                     $scope.getPaymentDirectDepositBatchesGrouped();
                 });
        }
        getListOrganizationInternal();
        $scope.getPaymentDirectDepositBatchesGrouped = function () {
            var promise = PaymentApiService.getPaymentDirectDepositBatchesGrouped(null)
            .then(function (data) {
                var groupedCompanies = aggregateSummarizer.aggregateGroups(directDepositBatchGroupings, 'companies', data.Items);

                // initialize the counts - the status rows are summary rows, not entity, so they have the count as done in the query server-side
                angular.forEach(groupedCompanies, function (company) {
                    angular.forEach(company.currencies, function (currency) {
                        currency.count = 0;
                        angular.forEach(currency.bankAccounts, function (account) {
                            let accountCount = 0;
                            angular.forEach(account.statuses, function (status) {
                                currency.count += status.count;
                                accountCount += status.count;
                            });
                            account.statuses.length = 1;
                            account.statuses[0].count = accountCount;
                        });
                    });
                    if (company.companyId == $scope.currentUser.OrganizationId) {
                        company.open = true;
                        company.currencies[0].open = true;
                    }
                });

                //$scope.companies = groupedCompanies;
                $scope.companies = groupedCompanies.sort(function (a, b) {
                    if (a.companyId == $scope.currentUser.OrganizationId && b.companyId != $scope.currentUser.OrganizationId) {
                        return -1;
                    } else if (a.companyId != $scope.currentUser.OrganizationId && b.companyId == $scope.currentUser.OrganizationId) {
                        return 1;
                    } else {
                        return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
                    }
                });
                
            }, function (err) {
                // todo error message here
            });
            $scope.loadItemsPromise = promise;
        }
        

        $scope.lists = {
            currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            paymentReleaseBatchStatusList: CodeValueService.getCodeValues(CodeValueGroups.PaymentReleaseBatchStatus),
            listOrganizationInternal: [],
        };
    }
})();