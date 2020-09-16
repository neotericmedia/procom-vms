(function (angular) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactGarnisheesController', ContactGarnisheesController);

    ContactGarnisheesController.$inject = ['CodeValueService', 'mixinsFactory', 'contactService', 'contactsTableParams', '$state', '$rootScope'];

    function ContactGarnisheesController(CodeValueService, mixinsFactory, contactService, contactsTableParams, $state, $rootScope) {

        var self = this;

        angular.extend(self, {
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AdvanceStatuses, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            profileId: $state.params.profileId,
            currentState: $state.current.name,
            garnisheeDetailsState: '',
            showTable: true,
            init: init
        });

        function init() {
            if (self.currentState.indexOf('EditWorkerTempProfile') === 0) {
                self.garnisheeDetailsState = 'EditWorkerTempProfile.GarnisheeDetails';
            }
            else if (self.currentState.indexOf('EditWorkerCanadianSPProfile') === 0) {
                self.garnisheeDetailsState = 'EditWorkerCanadianSPProfile.GarnisheeDetails';
            }
        }
        self.init();

        $rootScope.globalTableState = [];

        var garnisheeDataParams = oreq.request().withSelect(['Id', 'Description', 'PayAmountMaximum', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'GarnisheeStatusId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: contactService.getProfileGarnishees
        }, contactsTableParams), garnisheeDataParams, self.profileId).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.garnisheeTableState = tableState;
            }

            var active = _.find(items, function (item) {
                return item.GarnisheeStatusId === ApplicationConstants.GarnisheeStatus.Active;
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

        self.refreshTable = function () {
            self.showTable = false;
            setTimeout(function () {
                self.showTable = true;
            }, 0);
        }
    }

})(angular);