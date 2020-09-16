(function (angular) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgAdvanceController', OrgAdvanceController);

    OrgAdvanceController.$inject = ['CodeValueService', 'mixinsFactory', 'OrgApiService', 'organizationTableParams', '$stateParams'];

    function OrgAdvanceController(CodeValueService, mixinsFactory, OrgApiService, organizationTableParams, $stateParams) {

        var self = this;

        angular.extend(self, {
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AdvanceStatuses, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            organizationId: $stateParams.organizationId,
            anyActive: false,
            activeId: 0
        });

        var advanceDataParams = oreq.request().withSelect(['Id', 'Description', 'AmountInitial', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'AdvanceStatusId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({ serviceMethod: OrgApiService.getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization }, organizationTableParams), advanceDataParams, self.organizationId).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.advanceTableState = tableState;
            }

            var active = _.find(items, function (item) {
                return item.AdvanceStatusId === ApplicationConstants.AdvanceStatus.Active;
            });

            if (active) {
                self.anyActive = true;
                self.activeId = active.Id;
            }
            else {
                self.anyActive = false;
                self.activeId = 0;
            }
        };
    }

})(angular);