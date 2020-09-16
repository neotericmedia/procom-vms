(function (angular) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactAdvancesController', ContactAdvancesController);

    ContactAdvancesController.$inject = ['CodeValueService', 'mixinsFactory', 'contactService', 'contactsTableParams', '$state', '$rootScope'];

    function ContactAdvancesController(CodeValueService, mixinsFactory, contactService, contactsTableParams, $state, $rootScope) {

        var self = this;

        angular.extend(self, {
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AdvanceStatuses, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            profileId: $state.params.profileId,
            currentState: $state.current.name,
            advanceDetailsState: '',

            init: init
        });

        function init() {
            if (self.currentState.indexOf('EditWorkerTempProfile') === 0) {
                self.advanceDetailsState = 'EditWorkerTempProfile.AdvanceDetails';
            }
            else if (self.currentState.indexOf('EditWorkerCanadianSPProfile') === 0) {
                self.advanceDetailsState = 'EditWorkerCanadianSPProfile.AdvanceDetails';
            }
        }
        self.init();

        $rootScope.globalTableState = [];

        var advanceDataParams = oreq.request().withSelect(['Id', 'Description', 'AmountInitial', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'AdvanceStatusId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: contactService.getProfileAdvances
        }, contactsTableParams), advanceDataParams, self.profileId).init(self);

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