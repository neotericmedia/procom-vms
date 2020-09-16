(function (angular, app) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactGarnisheeDetailsController', ContactGarnisheeDetailsController);

    ContactGarnisheeDetailsController.$inject = ['$state', 'GarnisheeHeader', 'common', 'CodeValueService', 'newTableState', 'contactService'];

    function ContactGarnisheeDetailsController($state, GarnisheeHeader, common, CodeValueService, newTableState, contactService) {

        var self = this;

        angular.extend(self, {
            GarnisheeHeader: GarnisheeHeader ? GarnisheeHeader : {},
            ValidationMessages: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.GarnisheeStatuses),
            subdivisions: [],
            currencies: [],
            paymentMethods: [],
            allowToSubmitGarnishee: false,

            init: init,
            close: close,
            garnisheeSubmit: garnisheeSubmit
        });

        function allowGarnisheeSubmit(accessActions) {

            if (accessActions) {
                if (common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileEditWorkerGarnishee)) {
                    self.allowToSubmitGarnishee = true;
                }
            }
        }

        function init(garnisheeController, profile) {
            self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.GarnisheeHeader.CountryId, CodeValueGroups.Country);
            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) { return currency.id == ApplicationConstants.Currencies.CAD || currency.id == ApplicationConstants.Currencies.USD || currency.id == ApplicationConstants.Currencies.MXN; });
            self.paymentMethods = CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType);

            if (garnisheeController.anyActive && garnisheeController.activeId !== self.GarnisheeHeader.Id) {
                self.statuses = _.filter(self.statuses, function (status) {
                    return status.id !== ApplicationConstants.GarnisheeStatus.Active;
                });
            }

            allowGarnisheeSubmit(profile.AccessActions);
        }

        function garnisheeSubmit(garnisheeController, refreshGarnisheesCount) {
            self.ValidationMessages = [];

            //var garnisheeSubmitCommand = { WorkflowPendingTaskId: self.GarnisheeHeader.WorkflowPendingTaskId, GarnisheeId: self.GarnisheeHeader.Id, Description: self.GarnisheeHeader.Description, ReferenceNumber: self.GarnisheeHeader.ReferenceNumber, GarnisheeStatusId: 
            var garnisheeSubmitCommand = { LastModifiedDatetime: self.GarnisheeHeader.LastModifiedDatetime, GarnisheeId: self.GarnisheeHeader.Id, Description: self.GarnisheeHeader.Description, ReferenceNumber: self.GarnisheeHeader.ReferenceNumber, GarnisheeStatusId: self.GarnisheeHeader.GarnisheeStatusId };

            contactService.garnisheeSubmit(garnisheeSubmitCommand).then(
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

            common.logSuccess("Garnishee submitted successfully");

            $state.go('^');
        }

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        function close() {
            $state.go('^');
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.ContactGarnisheeDetailsController = {
        GarnisheeHeader: ['$q', 'contactService', '$stateParams', function ($q, contactService, $stateParams) {
            var result = $q.defer();
            contactService.getUserProfileGarnisheeDetail($stateParams.profileId, $stateParams.garnisheeId).then(
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