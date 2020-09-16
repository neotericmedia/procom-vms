(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('SalesPatternController', SalesPatternController);

    SalesPatternController.$inject = ['CodeValueService', 'common', 'mixinsFactory', 'NavigationService', 'CommissionApiService', 'commissionRateSearchTableParams', 'commissionTableState'];

    function SalesPatternController(CodeValueService, common, mixinsFactory, NavigationService, CommissionApiService, commissionRateSearchTableParams, commissionTableState) {

        NavigationService.setTitle('Sales Pattern', ['icon icon-commission']);

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            patternStatuses: CodeValueService.getCodeValues(CodeValueGroups.CommissionRateHeaderStatus, true),
            //methods
        });

        var salesPatternDataParams = oreq.request().withSelect(['Id', 'Description', 'SalesPatternStatusId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({ serviceMethod: CommissionApiService.getAllSalesPatterns }, commissionRateSearchTableParams),
                                              salesPatternDataParams).init(self);

        self.successfulRetrieval = function (items, tableState) {
           
        };


    }
})(angular, Phoenix.App);