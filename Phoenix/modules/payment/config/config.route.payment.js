(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider
               .state("payment", {
                   url: '/payment',
                   'abstract': true,
                   template: '<div data-ui-view="" autoscroll="false"></div>'
               })
               .state("payment.search", {
                   url: '/search',
                   controller: 'PaymentSearchController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentSearch.html'
               })
               .state("payment.search.report", {
                   url: '/report/{paymentDocumentId:[0-9]{1,8}}',
                   views:
                   {
                       'reportView@payment.search':
                       {
                           controller: 'PaymentReportViewController',
                           templateUrl: '/Phoenix/modules/payment/views/PaymentReportView.html'
                       }
                   },
                   resolve: app.resolve.PaymentReportViewController
               })
               .state("payment.pending", {
                   url: '/pending',
                   controller: 'PaymentPendingGroupController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentPendingGroup.html'
               })
               .state("payment.method", {
                   url: '/organization/{organizationId:[0-9]{1,8}}/currency/{currencyId:[0-9]{1,8}}/method/{methodId:[0-9]{1,8}}/status/{statusId:[0-9]{1,8}}/due/{dueId:[0-9]{1,8}}',
                   controller: 'PaymentMethodController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentMethod.html'
               })
               .state("payment.directdepositbatch", {
                   url: '/directdepositbatch',
                   'abstract': true,
                   template: '<div data-ui-view="" autoscroll="false"></div>'
               })
               .state("payment.directdepositbatch.search", {
                   url: '/search',
                   controller: 'PaymentDirectDepositBatchSearchGroupController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentDirectDepositBatchSearchGroup.html'
                   //,
                   //resolve: {
                   //    data: ['PaymentApiService', function (PaymentApiService) {
                   //        return PaymentApiService.getPaymentDirectDepositBatchesGrouped(null);
                   //    }]
                   //}
               })
                .state("payment.wiretransferbatch", {
                   url: '/wiretransferbatch',
                   'abstract': true,
                   template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("payment.wiretransferbatch.search", {
                   url: '/search',
                   controller: 'PaymentWireTransferBatchSearchGroupController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentWireTransferBatchSearchGroup.html'
                   //,
                   //resolve: {
                   //    data: ['PaymentApiService', function (PaymentApiService) {
                   //        return PaymentApiService.getPaymentDirectDepositBatchesGrouped(null);
                   //    }]
                   //}
               })
                .state("payment.wiretransferbatch.searchbybankaccount", {
                   //url: '/searchbybankaccount/{bankAccountId:[0-9]{1,8}}/batchStatus/{batchStatusId:[0-9]{1,8}}',
                   url: '/searchbybankaccount/{bankAccountId:[0-9]{1,8}}',
                   controller: 'PaymentWireTransferBatchSearchByBankAccountController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentWireTransferBatchSearchByBankAccount.html'
               })
                 .state("payment.wiretransferbatch.management", {
                   url: '/management/{batchId:[0-9]{1,8}}',
                   controller: 'PaymentWireTransferBatchManagementController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentWireTransferBatchManagement.html',
                   resolve: app.resolve.PaymentWireTransferBatchManagementController
               })
                 //this is the old DD batch search controller - uncomment this to restore that functionality/page
                //.state("payment.directdepositbatch.search", {
                //    url: '/search',
                //    controller: 'PaymentDirectDepositBatchSearchController',
                //    templateUrl: '/Phoenix/modules/payment/views/PaymentDirectDepositBatchSearch.html'
                //})
               .state("payment.directdepositbatch.searchbybankaccount", {
                   //url: '/searchbybankaccount/{bankAccountId:[0-9]{1,8}}/batchStatus/{batchStatusId:[0-9]{1,8}}',
                   url: '/searchbybankaccount/{bankAccountId:[0-9]{1,8}}',
                   controller: 'PaymentDirectDepositBatchSearchByBankAccountController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentDirectDepositBatchSearchByBankAccount.html'
               })

               .state("payment.directdepositbatch.management", {
                   url: '/management/{batchId:[0-9]{1,8}}',
                   controller: 'PaymentDirectDepositBatchManagementController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentDirectDepositBatchManagement.html',
                   resolve: app.resolve.PaymentDirectDepositBatchManagementController
               })
               .state("payment.paymenttransactiongarnishee", {
                   url: '/paymenttransactiongarnishee',
                   'abstract': true,
                   template: '<div data-ui-view="" autoscroll="false"></div>'
               })
               .state("payment.paymenttransactiongarnishee.grouped", {
                   url: '/grouped',
                   controller: 'PaymentTransactionGarnisheeGroupedController',
                   templateUrl: '/Phoenix/modules/payment/views/PaymentTransactionGarnisheeGrouped.html'
               })
               //.state("payment.paymenttransactiongarnishee.release", {
               //    url: '/release/internalorganization/{organizationIdInternal:[0-9]{1,8}}/currency/{currencyId:[0-9]{1,8}}/readytorelease/{isReadyToRelease:[0-9]}',
               //    controller: 'PaymentTransactionGarnisheeController',
               //    templateUrl: '/Phoenix/modules/payment/views/PaymentTransactionGarnishee.html'
               //})
            ;
        }
    ]);
})();