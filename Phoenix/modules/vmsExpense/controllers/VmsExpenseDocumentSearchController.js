(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsExpenseDocumentSearchController', VmsExpenseDocumentSearchController);

    /** @ngInject */
    VmsExpenseDocumentSearchController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'contactsTableParams', 'mixinsFactory', 'NavigationService'];

    function VmsExpenseDocumentSearchController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService) {

        var self = this;

        NavigationService.setTitle('Vms Expense Management', 'icon icon-transaction');

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            lists : {
                fileStatusList: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            }
        });

        var vmsExpenseDataParams = '';
        var args = [self.internalOrganizationId, -1];

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: VmsApiService.getVmsExpenseSummary
        }, vmsTableParams), vmsExpenseDataParams, args).init(self);
        
        return self;
    }
})();
