(function (angular) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgGarnisheeController', OrgGarnisheeController);

    OrgGarnisheeController.$inject = ['CodeValueService', 'mixinsFactory', 'OrgApiService', 'organizationTableParams', '$stateParams'];

    function OrgGarnisheeController(CodeValueService, mixinsFactory, OrgApiService, organizationTableParams, $stateParams) {

        var self = this;

        angular.extend(self, {
            statuses: CodeValueService.getCodeValues(CodeValueGroups.GarnisheeStatuses, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
            organizationId: $stateParams.organizationId,
            anyActive: false,
            activeId: 0,
            maxValue: "9999999999999999.99M200"
        });

        var garnisheeDataParams = oreq.request().withSelect(['Id', 'Description', 'PayAmountMaximum', 'PayAmountIsMaximum', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'GarnisheeStatusId']).url();

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: OrgApiService.getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization
        }, organizationTableParams), garnisheeDataParams, self.organizationId).init(self);

        (function () {

            var oldCallServer = self.callServer;

            self.callServer = function () {
                if (self.garnisheeTableState && self.garnisheeTableState.search && self.garnisheeTableState.search.predicateObject && Object.keys(self.garnisheeTableState.search.predicateObject).length > 0) {
                    var searchObj = self.garnisheeTableState.search.predicateObject;
                    var searchNames = this.getSearchNames();

                    var searchMax = _.filter(searchNames, function (n) {
                        if (n.property == "PayAmountMaximum" && n.value.trim().length > 0) {
                            n.value = n.value.trim().toLowerCase();
                            if(isNumeric(n.value)){
                                n.isNumeric = true;
                                n.error = false;
                            }
                            else {                                
                                if ("unlimited".indexOf(n.value) == 0) {
                                    n.isNumeric = false;
                                    n.error = false;
                                }
                                else {
                                    n.isNumeric = false;
                                    n.error = true;
                                }
                            }
                            return true;
                        }
                        return false;
                    });
                    var searchBack = _.filter(searchNames, function (n) {
                        if (n.property == "PaybackRemainder" && n.value.trim().length > 0) {
                            n.value = n.value.trim().toLowerCase();
                            if (isNumeric(n.value)) {
                                n.isNumeric = true;
                                n.error = false;
                            }
                            else {
                                if ("n/a".indexOf(n.value) == 0) {
                                    n.isNumeric = false;
                                    n.error = false;
                                }
                                else {
                                    n.isNumeric = false;
                                    n.error = true;
                                }
                            }
                            return true;
                        }
                        return false;
                    });

                    if ((searchMax.length > 0 && !searchMax[0].isNumeric && !searchMax[0].error) || (searchBack.length > 0 && !searchBack[0].isNumeric && !searchBack[0].error)) {
                        searchObj.PayAmountIsMaximum = false;
                        delete searchObj.PayAmountMaximum;
                        delete searchObj.PaybackRemainder;
                    } else if ((searchMax.length > 0 && !searchMax[0].isNumeric && searchMax[0].error) || (searchBack.length > 0 && !searchBack[0].isNumeric && searchBack[0].error)) {
                        searchObj.PayAmountMaximum = self.maxValue;
                        delete searchObj.PaybackRemainder;
                    }
                    else {
                        delete searchObj.PayAmountIsMaximum;                        
                    }
                }
                var result = oldCallServer.apply(this, arguments);
            }

        })();

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

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    }

})(angular);