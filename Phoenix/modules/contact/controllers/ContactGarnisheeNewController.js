(function (angular, app) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactGarnisheeNewController', ContactGarnisheeNewController);

    ContactGarnisheeNewController.$inject = ['$state', 'common', 'CodeValueService', 'internalOrgs', 'newTableState', 'contactService', 'payToList'];

    function ContactGarnisheeNewController($state, common, CodeValueService, internalOrgs, newTableState, contactService, payToList) {

        var self = this;

        angular.extend(self, {
            GarnisheeHeader: { WorkflowPendingTaskId: -1, Payee: { PayToId: null, PayeeDetails: {} } },
            ValidationMessages: [],
            subdivisions: [],
            currencies: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            internalOrgs: internalOrgs,
            payToListItems: payToList ? payToList.Items : [],
            IsNew: false,
            allowToCreateGarnishee: false,
            submitIsRunning: false,

            init: init,
            close: close,
            garnisheeNew: garnisheeNew,
            countryChanged: countryChanged,
            subdivisionChanged: subdivisionChanged,
            restoreCountries: restoreCountries,
            restoreSubdivisions: restoreSubdivisions,
            paybackTypeChanged: paybackTypeChanged,
            payMaxChanged: payMaxChanged,
            payToChanged: payToChanged,
            newPayee: newPayee
        });

        function allowGarnisheeSubmit(accessActions) {

            if (accessActions) {
                if (common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileNewWorkerGarnishee)) {
                    self.allowToCreateGarnishee = true;
                }
            }
        }

        function init(profile) {
            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) {
                return currency.id == ApplicationConstants.Currencies.CAD ||
                    currency.id == ApplicationConstants.Currencies.USD ||
                    currency.id == ApplicationConstants.Currencies.MXN;
            });
            self.GarnisheeHeader.GarnisheeUserProfileWorkerId = $state.params.profileId;
            self.GarnisheeHeader.PayTypeIsAmount = true;
            self.GarnisheeHeader.PayAmountIsMaximum = true;

            allowGarnisheeSubmit(profile.AccessActions);
        }

        function garnisheeNew(garnisheeController, refreshGarnisheesCount) {

            self.ValidationMessages = [];
            self.submitIsRunning = true;
            var garnisheeNewCommand = self.GarnisheeHeader;

            contactService.garnisheeNew(garnisheeNewCommand).then(
                function (success) {
                    onSuccessResponse(garnisheeController);
                    refreshGarnisheesCount();
                },
                function (error) {
                    onErrorResponse(error, 'Garnishee object is not valid');
                });
        }

        function onSuccessResponse(garnisheeController) {

            var garnisheeDataParams = oreq.request().withSelect(['Id', 'Description', 'PayAmountMaximum', 'PaidAmount', 'PaybackRemainder', 'CurrencyId', 'GarnisheeStatusId']).url();

            var garnisheeTableState = garnisheeController.garnisheeTableState;

            if (garnisheeTableState) {
                garnisheeController.callServer(garnisheeTableState, garnisheeDataParams, $state.params.organizationId);
            }
            else {
                garnisheeController.callServer(newTableState, garnisheeDataParams, $state.params.organizationId);
            }

            common.logSuccess("New Garnishee submitted successfully");
            garnisheeController.refreshTable();

            $state.go('^');
        }

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.ValidationMessages = common.responseErrorMessages(responseError);
            self.submitIsRunning = false;
        }

        function newPayee() {
            self.IsNew = !self.IsNew;
            self.GarnisheeHeader.Payee = { PayToId: null, PayeeDetails: {} };
        }

        function payToChanged(payToId) {
            var payee = _.find(self.payToListItems, function (detail) { return detail.PayToId === payToId; });
            if (payee && payee.PayToDetails) {
                self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, payee.PayToDetails.CountryId, CodeValueGroups.Country);
                self.GarnisheeHeader.Payee.PayeeDetails = payee.PayToDetails;
            }
        }

        function restoreCountries() {
            self.GarnisheeHeader.CountryId = null;
            self.GarnisheeHeader.SubdivisionId = null;
            self.GarnisheeHeader.PostalCode = '';
            self.subdivisions = [];
        }

        function countryChanged(country) {
            self.subdivisions = [];
            self.GarnisheeHeader.SubdivisionId = null;
            self.GarnisheeHeader.PostalCode = '';
            if (country.id && country.id > 0) {
                self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, country.id, CodeValueGroups.Country);
            }
        }

        function subdivisionChanged(province) {
            if (!province.id || province.id === 0) {
                self.GarnisheeHeader.PostalCode = '';
            }
        }

        function restoreSubdivisions() {
            self.GarnisheeHeader.SubdivisionId = null;
            self.GarnisheeHeader.PostalCode = '';
        }

        function paybackTypeChanged() {
            if (self.GarnisheeHeader.PayTypeIsAmount) {
                self.GarnisheeHeader.PaybackPercentage = null;
            }
            else {
                self.GarnisheeHeader.PaybackAmount = null;
            }
        }

        function payMaxChanged() {
            if (!self.GarnisheeHeader.PayAmountIsMaximum) {
                self.GarnisheeHeader.PayAmountMaximum = null;
            }
        }

        function close() {
            $state.go('^');
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.ContactGarnisheeNewController = {
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
        }],
        payToList: ['$q', 'OrgApiService', function ($q, OrgApiService) {
            var result = $q.defer();
            OrgApiService.getListGarnisheePayToGroup().then(
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