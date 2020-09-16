(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsUnitedStatesSourceDeductionDocumentSearchController', VmsUnitedStatesSourceDeductionDocumentSearchController);

    /** @ngInject */
    VmsUnitedStatesSourceDeductionDocumentSearchController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'contactsTableParams', 'mixinsFactory', 'NavigationService'];

    function VmsUnitedStatesSourceDeductionDocumentSearchController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService) {

        var self = this;

        NavigationService.setTitle('Vms United States Source Deduction Management', 'icon icon-transaction');

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            lists : {
                fileStatusList: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            }
        });

        var vmsUnitedStatesSourceDeductionDataParams = '';
        var args = [self.internalOrganizationId, -1];

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: VmsApiService.getVmsUnitedStatesSourceDeductionSummary
        }, vmsTableParams), vmsUnitedStatesSourceDeductionDataParams, args).init(self);
        
        return self;
    }
})();
