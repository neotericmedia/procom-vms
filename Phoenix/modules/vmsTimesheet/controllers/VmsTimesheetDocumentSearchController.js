(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetDocumentSearchController', VmsTimesheetDocumentSearchController);

    /** @ngInject */
    VmsTimesheetDocumentSearchController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'contactsTableParams', 'mixinsFactory', 'NavigationService'];

    function VmsTimesheetDocumentSearchController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService) {

        var self = this;

        NavigationService.setTitle('Vms Timesheet Management', 'icon icon-transaction');

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            lists : {
                fileStatusList: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            }
        });

        var vmsTimesheetDataParams = '';
        var args = [self.internalOrganizationId, -1];

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: VmsApiService.getVmsTimesheetDocument
        }, vmsTableParams), vmsTimesheetDataParams, args).init(self);
        
        return self;
    }
})();
