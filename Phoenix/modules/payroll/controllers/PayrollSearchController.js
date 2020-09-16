(function (angular) {
    'use strict';

    angular.module('phoenix.payroll.controllers').controller('PayrollSearchController', PayrollSearchController);

    /** @ngInject */
    PayrollSearchController.$inject = ['$state', 'CodeValueService', 'payrollTableParams', 'mixinsFactory', 'NavigationService', 'PayrollApiService'];
   
    function PayrollSearchController($state, CodeValueService, payrollTableParams, mixinsFactory, NavigationService, PayrollApiService) {

        var self = this;

        self.routeChangeString = "";

        NavigationService.setTitle('payroll-taxes');

        var payrollDataParams = oreq.request().withSelect(['Id', 'VersionId', 'TaxType', 'Country', 'Province', 'EffectiveDate']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: PayrollApiService.getAllPayrolls
        }, payrollTableParams), payrollDataParams).init(self);

        self.rowClicked = function (item) {
            if (item.TaxType === "Federal") {
                $state.go('payroll.federalTax', { federalTaxHeaderId: item.Id, federalTaxVersionId: item.VersionId });
            }
            if (item.TaxType === "Provincial") {
                $state.go('payroll.provincialTax', { provincialTaxHeaderId: item.Id, provincialTaxVersionId: item.VersionId });
            }
        };

        return self;
    }

})(angular);