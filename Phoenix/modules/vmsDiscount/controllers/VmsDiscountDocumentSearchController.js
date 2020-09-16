(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsDiscountDocumentSearchController', VmsDiscountDocumentSearchController);

    /** @ngInject */
    VmsDiscountDocumentSearchController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'contactsTableParams', 'mixinsFactory', 'NavigationService'];

    function VmsDiscountDocumentSearchController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService) {

        var self = this;

        NavigationService.setTitle('Vms Discount Management', 'icon icon-transaction');

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            lists : {
                fileStatusList: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            }
        });

        var vmsDiscountDataParams = '';
        var args = [self.internalOrganizationId, -1];

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: VmsApiService.getVmsDiscountSummary
        }, vmsTableParams), vmsDiscountDataParams, args).init(self);
        
        return self;
    }
})();
