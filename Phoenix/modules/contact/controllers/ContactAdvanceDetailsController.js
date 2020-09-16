(function (angular, app) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactAdvanceDetailsController', ContactAdvanceDetailsController);

    ContactAdvanceDetailsController.$inject = ['$state', 'common', 'AdvanceHeader', 'CodeValueService', 'newTableState', 'contactService'];

    function ContactAdvanceDetailsController($state, common, AdvanceHeader, CodeValueService, newTableState, contactService) {

        var self = this;

        angular.extend(self, {
            AdvanceHeader: AdvanceHeader ? AdvanceHeader : {},
            ValidationMessages: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AdvanceStatuses),
            subdivisions: [],
            currencies: [],
            allowToSubmitAdvance: false,

            init: init,
            close: close,
            advanceSubmit: advanceSubmit
        });

        function allowAdvanceSubmit(accessActions) {

            if (accessActions) {
                if (common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileEditWorkerAdvance)) {
                    self.allowToSubmitAdvance = true;
                }
            }
        }

        function init(advanceController, profile){
            self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.AdvanceHeader.CountryId, CodeValueGroups.Country);
            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) { return currency.id == ApplicationConstants.Currencies.CAD || currency.id == ApplicationConstants.Currencies.USD || currency.id == ApplicationConstants.Currencies.MXN; });

            if (advanceController.anyActive && advanceController.activeId !== self.AdvanceHeader.Id) {
                self.statuses = _.filter(self.statuses, function (status) {
                    return status.id !== ApplicationConstants.AdvanceStatus.Active;
                });
            }

            allowAdvanceSubmit(profile.AccessActions);
        }

        function advanceSubmit(advanceController, refreshAdvancesCount) {
            self.ValidationMessages = [];

            //var advanceSubmitCommand = { WorkflowPendingTaskId: self.AdvanceHeader.WorkflowPendingTaskId, AdvanceId: self.AdvanceHeader.Id, Description: self.AdvanceHeader.Description, AdvanceStatusId: self.AdvanceHeader.AdvanceStatusId };
            var advanceSubmitCommand = { LastModifiedDatetime: self.AdvanceHeader.LastModifiedDatetime, AdvanceId: self.AdvanceHeader.Id, Description: self.AdvanceHeader.Description, AdvanceStatusId: self.AdvanceHeader.AdvanceStatusId };

            contactService.advanceSubmit(advanceSubmitCommand).then(
                function (success) {
                    onSuccessResponse(advanceController);
                    refreshAdvancesCount();
                },
                function (error) {
                    onErrorResponse(error, 'Advance object is not valid');
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

            contactService.logSuccess("Advance submitted successfully");

            $state.go('^');
        }

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                contactService.logError(message);
            }
            self.ValidationMessages = contactService.responseErrorMessages(responseError);
        }

        function close() {
            $state.go('^');
        }


    }

    if (!app.resolve) app.resolve = {};

    app.resolve.ContactAdvanceDetailsController = {
        AdvanceHeader: ['$q', 'contactService', '$stateParams', function ($q, contactService, $stateParams) {
            var result = $q.defer();
            contactService.getUserProfileAdvanceDetail($stateParams.profileId, $stateParams.advanceId).then(
                function (response) {
                    //response.WorkflowPendingTaskId = -1;
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);