(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $stateProvider
                .state("payroll", {
                    url: '/payroll',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("payroll.search", {
                    url: '/search',
                    controller: 'PayrollSearchController',
                    templateUrl: '/Phoenix/modules/payroll/views/PayrollSearch.html',
                    controllerAs: 'search',
                })
                .state("payroll.federalTax", {
                    //  http://localhost:50004/#/payroll/federalTax/0/0
                    url: '/federalTax/{federalTaxHeaderId:[0-9]{1,8}}/{federalTaxVersionId:[0-9]{1,8}}',
                    controller: 'PayrollFederalTaxController',
                    controllerAs: 'header',
                    templateUrl: '/Phoenix/modules/payroll/views/PayrollFederalTax/Root.html',
                    resolve: app.resolve.PayrollFederalTaxController,
                })
                .state("payroll.provincialTax", {
                    //  http://localhost:50004/#/payroll/provincialTax/0/0
                    url: '/provincialTax/{provincialTaxHeaderId:[0-9]{1,8}}/{provincialTaxVersionId:[0-9]{1,8}}',
                    controller: 'PayrollProvincialTaxController',
                    controllerAs: 'header',
                    templateUrl: '/Phoenix/modules/payroll/views/PayrollProvincialTax/Root.html',
                    resolve: app.resolve.PayrollProvincialTaxController,
                })
                .state("payroll.salesTaxes", {
                    url: '/taxes',
                    controller: 'PayrollSalesTaxesController',
                    templateUrl: '/Phoenix/modules/payroll/views/PayrollSalesTaxes.html',
                    controllerAs: 'taxes',
                })
                .state("payroll.workerCompensationCodeSetup", {//need to change with Angular2
                    url: '/compensationcodesetup',
                    controller: 'PayrollSalesTaxesController',
                    templateUrl: '/Phoenix/modules/payroll/views/PayrollSalesTaxes.html',
                    controllerAs: 'compensationcodesetup',
                })
            .state("payroll.salesTaxDetails", {
                //  http://localhost:50004/#/payroll/salesTaxDetails/salesTaxHeader/0/salesTaxVersion/0
                url: '/salesTaxDetails/salesTax/{salesTaxHeaderId:[0-9]{1,8}}/salesTaxVersion/{salesTaxVersionId:[0-9]{1,8}}',
                controller: 'PayrollSalesTaxDetailsController',
                controllerAs: 'tax',
                templateUrl: '/Phoenix/modules/payroll/views/PayrollSalesTaxDetails/PayrollSalesTaxDetails.html',
                resolve: app.resolve.PayrollSalesTaxDetailsController,
            })
            ;
        }
    ]);
})();