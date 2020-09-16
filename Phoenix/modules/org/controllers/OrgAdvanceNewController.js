(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgAdvanceNewController', OrgAdvanceNewController);

    OrgAdvanceNewController.$inject = ['$state', 'common', 'CodeValueService', 'internalOrgs', 'newTableState', 'OrgApiService'];

    function OrgAdvanceNewController($state, common, CodeValueService, internalOrgs, newTableState, OrgApiService) {

        var self = this;

        angular.extend(self, {
            AdvanceHeader: { WorkflowPendingTaskId: -1 },
            ValidationMessages: [],
            subdivisions: [],
            currencies: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType),
            internalOrgs: internalOrgs,
            isPaybackValid: false,

            init: init,
            initAddresses: initAddresses,
            close: close,
            advanceNew: advanceNew,
            countryChanged: countryChanged,
            subdivisionChanged: subdivisionChanged,
            restoreCountries: restoreCountries,
            restoreSubdivisions: restoreSubdivisions,
            paybackTypeChanged: paybackTypeChanged,
            amountChanged: amountChanged,
            submitIsRunning: false,
        });

        self.init();

        function init() {
            if (self.AdvanceHeader && self.AdvanceHeader.CountryId && self.AdvanceHeader.CountryId > 0) {
                self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.AdvanceHeader.CountryId, CodeValueGroups.Country);
            }

            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) {
                return currency.id == ApplicationConstants.Currencies.CAD ||
                       currency.id == ApplicationConstants.Currencies.USD ||
                       currency.id == ApplicationConstants.Currencies.MXN;
            });
            self.AdvanceHeader.PayeeOrganizationIdSupplier = $state.params.organizationId;
            self.AdvanceHeader.PaybackType = true;
        }

        function initAddresses(address) {

            self.AdvanceHeader.AddressLine1 = address.AddressLine1;
            self.AdvanceHeader.AddressLine2 = address.AddressLine2;
            self.AdvanceHeader.CityName = address.CityName;
            self.AdvanceHeader.CountryId = address.CountryId;
            if (address.CountryId && address.CountryId > 0) {
                self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
            }
            self.AdvanceHeader.SubdivisionId = address.SubdivisionId;
            self.AdvanceHeader.PostalCode = address.PostalCode;
        }

        function advanceNew(advanceController, refreshActiveAdvancesAndActiveGarnisheesCount) {

            self.ValidationMessages = [];
            self.submitIsRunning = true;
            var advanceNewCommand = self.AdvanceHeader;

            OrgApiService.advanceNew(advanceNewCommand).then(
                function (success) {
                    onSuccessResponse(advanceController);
                    refreshActiveAdvancesAndActiveGarnisheesCount();
                    $('#newAdvanceModal').modal('hide');
                },
                function (error) {
                    onErrorResponse(error, 'Advance object is not valid');
                    $('#newAdvanceModal').modal('hide');
                });
        }

        function onSuccessResponse(advanceController) {

            var advanceDataParams = oreq.request().withSelect(['Id', 'Description', 'AmountInitial', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'AdvanceStatusId']).url();

            var advanceTableState = advanceController.advanceTableState;

            if (advanceTableState) {
                advanceController.callServer(advanceTableState, advanceDataParams, $state.params.organizationId);
            }
            else {
                advanceController.callServer(newTableState, advanceDataParams, $state.params.organizationId);
            }

            common.logSuccess("New Advance submitted successfully");

            $state.go('^');
        }

        function onErrorResponse(error, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.ValidationMessages = common.responseErrorMessages(error);
            self.submitIsRunning = false;
        }

        function restoreCountries() {
            self.AdvanceHeader.CountryId = null;
            self.AdvanceHeader.SubdivisionId = null;
            self.AdvanceHeader.PostalCode = '';
            self.subdivisions = [];
        }

        function countryChanged(country) {
            self.subdivisions = [];
            self.AdvanceHeader.SubdivisionId = null;
            self.AdvanceHeader.PostalCode = '';
            if (country.id && country.id > 0) {
                self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, country.id, CodeValueGroups.Country);
            }
        }

        function subdivisionChanged(province) {
            if (!province.id || province.id === 0) {
                self.AdvanceHeader.PostalCode = '';
            }
        }

        function restoreSubdivisions() {
            self.AdvanceHeader.SubdivisionId = null;
            self.AdvanceHeader.PostalCode = '';
        }

        function amountChanged() {
            self.isPaybackValid = false;
            if (self.AdvanceHeader.AmountInitial && self.AdvanceHeader.PaybackAmount) {
                var amountInitial = parseFloat(self.AdvanceHeader.AmountInitial).toFixed(2) / 1;
                var amountPayback = parseFloat(self.AdvanceHeader.PaybackAmount).toFixed(2) / 1;
                if (amountPayback > amountInitial) {
                    common.logWarning("Payback Amount should be equal or less than Initial Amount");
                }
                else {
                    self.isPaybackValid = true;
                }
            }
        }

        function paybackTypeChanged() {
            if (self.AdvanceHeader.PaybackType) {
                self.AdvanceHeader.PaybackPercentage = null;
                self.isPaybackValid = false;
            }
            else {
                self.AdvanceHeader.PaybackAmount = null;
                self.isPaybackValid = true;
            }
        }

        function close() {
            $state.go('^');
            $('#newAdvanceModal').modal('hide');
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.OrgAdvanceNewController = {
        internalOrgs: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);