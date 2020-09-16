(function (angular) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgRebatesAndFeesController', OrgRebatesAndFeesController);

    OrgRebatesAndFeesController.$inject = ['organizationTableParams', 'mixinsFactory', 'NavigationService', 'OrgApiService'];

    function OrgRebatesAndFeesController(organizationTableParams, mixinsFactory, NavigationService, OrgApiService) {

        var self = this;

        NavigationService.setTitle('vmsrebate-new');

        var rebateFeesDataParams = oreq.request().withSelect(['OrganizationId', 'OrganizationDisplayName', 'ActiveRebatesCount', 'ActiveFeesCount']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: OrgApiService.getListOrganizationsWithRabatesAndFees
        },
        organizationTableParams), rebateFeesDataParams).init(self);

        self.successfulRetrieval = function (items, tableState) {
            var x = items;
        };

        return self;
    }

})(angular);