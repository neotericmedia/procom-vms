(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionAdjustmentController', CommissionAdjustmentController);

    CommissionAdjustmentController.$inject = ['CodeValueService', 'common', 'mixinsFactory', 'NavigationService', 'CommissionApiService', 'commissionRateSearchTableParams', 'commissionTableState'];

    function CommissionAdjustmentController(CodeValueService, common, mixinsFactory, NavigationService, CommissionApiService, commissionAdjustmentSearchTableParams, commissionTableState) {

        NavigationService.setTitle('Commission Adjustment', ['icon icon-commission']);

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            commissionAdjustmentHeaderTypes: CodeValueService.getCodeValues(CodeValueGroups.CommissionAdjustmentHeaderType, true),
            commissionAdjustmentHeaderStatuses: CodeValueService.getCodeValues(CodeValueGroups.CommissionAdjustmentHeaderStatus, true)
            //methods
        });

        var adjustmentDataParams = oreq.request().withSelect(['Id', 'ClientCompany', 'AdjustmentDate', 'AdjustmentAmountNet', 'Description', 'CommissionAdjustmentHeaderTypeId', 'CommissionAdjustmentHeaderStatusId', 'CommissionRecurrency']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({ serviceMethod: CommissionApiService.getAllAdjustments }, commissionAdjustmentSearchTableParams),
                                              adjustmentDataParams).init(self);

        self.successfulRetrieval = function (items, tableState) {
            
        };
    }
})(angular, Phoenix.App);