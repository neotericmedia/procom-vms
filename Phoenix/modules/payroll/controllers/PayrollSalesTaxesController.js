(function (angular) {
    'use strict';

    angular.module('phoenix.payroll.controllers').controller('PayrollSalesTaxesController', PayrollSalesTaxesController);

    /** @ngInject */
    PayrollSalesTaxesController.$inject = ['$state', 'CodeValueService', 'payrollTableParams', 'mixinsFactory', 'NavigationService', 'PayrollApiService'];
   
    function PayrollSalesTaxesController($state, CodeValueService, payrollTableParams, mixinsFactory, NavigationService, PayrollApiService) {

        var self = this;

        self.taxCodes = CodeValueService.getCodeValues(CodeValueGroups.SalesTax, true);
        self.countries = CodeValueService.getCodeValues(CodeValueGroups.Country, true);

        NavigationService.setTitle('payroll-sales-taxes');

        var salesTaxDataParams = oreq.request().withSelect(['Id', 'VersionId', 'TaxId', 'CountryId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: PayrollApiService.getAllSalesTaxes
        }, payrollTableParams), salesTaxDataParams).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.itemsLength = items.length;
            }
        };

        return self;
    }

})(angular);