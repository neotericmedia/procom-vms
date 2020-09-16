(function (angular) {
    'use strict';

    var controllerId = 'PaymentPendingGroupController';
    angular.module('phoenix.payment.controllers')
        // todo - this needs to be done properly, but for now, and to avoid explicit hard-coding and extra code in the view... (see the todo below for details)
        .constant('addedPaymentTransactionTypes', [
            {
                code: 'ReadyToRelease',
                groupName: 'arbitrary',
                id: ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease,
                parentGroup: null,
                parentId: null,
                text: 'Ready to release'
            },
            {
                code: 'PlannedForRelease',
                groupName: 'arbitrary',
                id: ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.PlannedForRelease,
                parentGroup: null,
                parentId: null,
                text: 'Planned for release'
            },
            {
                code: 'Stopped',
                groupName: 'arbitrary',
                id: ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped,
                parentGroup: null,
                parentId: null,
                text: 'Stopped'
            }
        ])
        .constant('paymentPendingGroupings', {
            companies: {
                apply: function (key, data) {
                    return {
                        companyId: key,
                        open: false
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'OrganizationIdInternal');
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
                    return _.groupBy(data, 'CurrencyId');
                },
                next: {
                    property: 'paymentMethods',
                    target: 'paymentMethods'
                }
            },
            paymentMethods: {
                apply: function (key, data) {
                    return {
                        methodId: key,
                        methods: data.length
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'PaymentMethodId');
                },
                template: {
                    1: [],
                    2: [],
                    3: [],
                    5: [],
                    6: []
                },
                next: {
                    property: 'transactions',
                    target: 'transactions'
                }
            },
            transactions: {
                apply: function (key, data, context) {
                    var item = {
                        transactionType: key,
                        count: data.length
                    };

                    // special case for wire transfers - they don't have types ApplicationConstants.PaymentTransactionStatus.PendingRelease or ApplicationConstants.PaymentTransactionStatus.OnHold
                    // todo this needs to be done in a better way, but for now, and to avoid cluttering up the view with display logic, this is what the aggregateSummarizer pattern is for
                    if (context === ApplicationConstants.PaymentTransactionStatus.PendingReview && (key === ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing || key === ApplicationConstants.PaymentTransactionStatus.OnHold)) {
                        item.transactionType = 'N/A';
                    }

                    if (data.length > 0) {
                        item.OrganizationIdInternal = data[0].OrganizationIdInternal;
                        item.CurrencyId = data[0].CurrencyId;
                        item.PaymentMethodId = data[0].PaymentMethodId;
                        item.PaymentTransactionStatusId = data[0].PaymentTransactionStatusId;
                    }

                    return item;
                },
                action: function (data) {
                    var originalGrouping = _.groupBy(data, 'PaymentTransactionStatusId');

                    var stopped = [];

                    if (ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing in originalGrouping) {
                        var ready = [];
                        var pending = [];

                        angular.forEach(originalGrouping[ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing], function (item) {
                            if (item.IsPaymentStopped) {
                                stopped.push(item);
                            }
                            else {
                                var extraDays = item.PaymentMethodId === ApplicationConstants.PaymentMethodType.ADP ? 4 : 2;
                                // Give AP more time to process ready payments. If Thursday or Friday then we make it 2 business days.
                                extraDays = (moment().day() === 4 || moment().day() === 5) ? extraDays + 2 : extraDays;

                                if (item.PlannedReleaseDate !== null && moment(item.PlannedReleaseDate).isSameOrBefore(moment().startOf('day').add(extraDays, 'days'))) {
                                    ready.push(item);
                                } else {
                                    pending.push(item);
                                }                        
                            }
                        });

                        // this is true if we've found any that are 'ready'
                        //if (ready.length > 0) {
                        // todo - this is arbitrary - it needs to have a proper code table lookup, but for now, it's ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease and ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.PlannedForRelease, which represent 'Ready to release' and 'Planned for release' respectively
                        // todo remove the ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing grouping
                        originalGrouping = _.omit(originalGrouping, ApplicationConstants.PaymentTransactionStatus.PendingPaymentProcessing);
                        originalGrouping[ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease] = ready;
                        originalGrouping[ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.PlannedForRelease] = pending;
                        //}
                    }

                    if (ApplicationConstants.PaymentTransactionStatus.OnHold in originalGrouping) {
                        var onHold = [];

                        angular.forEach(originalGrouping[ApplicationConstants.PaymentTransactionStatus.OnHold], function (item) {
                            if (item.IsPaymentStopped) {
                                stopped.push(item);
                            }
                            else {
                                onHold.push(item);                     
                            }
                        });

                        originalGrouping[ApplicationConstants.PaymentTransactionStatus.OnHold] = onHold;
                    }

                    originalGrouping[ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped] = stopped;

                    return originalGrouping;
                },
                template: {
                    3: [],
                    6: [],
                    51: [],
                    52: [],
                    53: []
                }
            }
        })
        .controller(controllerId, ['$scope', 'phoenixauth', 'NavigationService', 'CodeValueService', 'PaymentApiService', 'commonDataService', 'addedPaymentTransactionTypes', 'aggregateSummarizer', 'paymentPendingGroupings', PaymentPendingGroupController]);

    /** @ngInject **/
    function PaymentPendingGroupController($scope, phoenixauth, NavigationService, CodeValueService, PaymentApiService, commonDataService, addedPaymentTransactionTypes, aggregateSummarizer, paymentPendingGroupings) {
         NavigationService.setTitle('payments-pending');
        phoenixauth.getCurrentProfile().then(function (user) {
            $scope.currentUser = user;
        });

        $scope.loadItemsPromise = null;
        $scope.lists = {
            paymentMethodList: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType, true),
            currencyList: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            paymentTransactionStatus: getPaymentTransactionStatuses(CodeValueService.getCodeValues(CodeValueGroups.PaymentTransactionStatus, true)),
            listOrganizationInternal: [],
        };
        function getListOrganizationInternal() {
            commonDataService.getListOrganizationInternal().then(
                 function (response) {
                     angular.forEach(response, function (org) {
                         $scope.lists.listOrganizationInternal.push({ id: org.Id, text: org.DisplayName });
                     });
                 }).then(function () {
                     $scope.getListPendingPaymentTransaction();
                 });
        }
        getListOrganizationInternal();

        $scope.getPaymentListUrl = function(transaction){
            if(parseInt(transaction.transactionType) === ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.Stopped){
                return { p:'payment/organization/' + transaction.OrganizationIdInternal + '/currency/' + transaction.CurrencyId + '/method/' + transaction.PaymentMethodId + '/due/' + (transaction.transactionType == ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease ? 1 : 0) + '/stopped'};
            }else{
                return { p:'payment/organization/' + transaction.OrganizationIdInternal + '/currency/' + transaction.CurrencyId + '/method/' + transaction.PaymentMethodId + '/status/' + transaction.PaymentTransactionStatusId + '/due/' + (transaction.transactionType == ApplicationConstants.PaymentTransactionStatus.PendingReleaseVirtual.ReadyToRelease ? 1 : 0)};
            }
        }

        $scope.getListPendingPaymentTransaction = function () {
            var promise = PaymentApiService.getListPendingPaymentTransaction()
                .then(function (success) {
                    if (success.Items && success.Items.length > 0) {
                        var items = _.filter(success.Items, function (item) { return item.CurrencyId > 0; });
                        var companies = aggregateSummarizer.aggregateGroups(paymentPendingGroupings, 'companies', items);
                        companies.forEach(function (c) {
                            if (c.companyId == $scope.currentUser.OrganizationId) {
                                c.open = true;
                                c.currencies[0].open = true;
                            }
                            var item = $scope.lists.listOrganizationInternal.find(function (x) { return x.id == c.companyId });
                            c.companyName = item ? item.text : null;
                        });
                        $scope.companies = companies.sort(function (a, b) {
                            if (a.companyId == $scope.currentUser.OrganizationId && b.companyId != $scope.currentUser.OrganizationId) {
                                return -1;
                            } else if (a.companyId != $scope.currentUser.OrganizationId && b.companyId == $scope.currentUser.OrganizationId) {
                                return 1;
                            } else {
                                return a.companyName < b.companyName ? -1 : b.companyName < a.companyName ? 1 : 0;
                            }
                        });//_.sortBy(companies, function (o) { return o.companyId; });
                    }
                    else {
                        $scope.companies = [];
                    }
                }, function (responseError) {
                    // todo - add an error message - how is this done elsewhere?
                });
            $scope.loadItemsPromise = promise;
        }




        function getPaymentTransactionStatuses(codeValues) {
            return codeValues.concat(addedPaymentTransactionTypes);
        }

        $scope.accordionStatus = {
            isFirstOpen: true
        };
    }
})(angular);