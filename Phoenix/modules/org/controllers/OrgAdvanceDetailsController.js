(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgAdvanceDetailsController', OrgAdvanceDetailsController);

    OrgAdvanceDetailsController.$inject = ['$state', 'AdvanceHeader', 'common', 'CodeValueService', 'newTableState', 'OrgApiService'];

    function OrgAdvanceDetailsController($state, AdvanceHeader, common, CodeValueService, newTableState, OrgApiService) {

        var self = this;

        angular.extend(self, {
            AdvanceHeader: AdvanceHeader ? AdvanceHeader : {},
            ValidationMessages: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AdvanceStatuses),
            subdivisions: [],
            currencies: [],

            init: init,
            close: close,
            advanceSubmit: advanceSubmit
        });

        function init(advanceController){
            self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.AdvanceHeader.CountryId, CodeValueGroups.Country);
            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) { return currency.id == ApplicationConstants.Currencies.CAD || currency.id == ApplicationConstants.Currencies.USD || currency.id == ApplicationConstants.Currencies.MXN; });

            if (advanceController.anyActive && advanceController.activeId !== self.AdvanceHeader.Id) {
                self.statuses = _.filter(self.statuses, function (status) {
                    return status.id !== ApplicationConstants.AdvanceStatus.Active;
                });
            }
        }

        function advanceSubmit(advanceController, refreshActiveAdvancesAndActiveGarnisheesCount) {
            self.ValidationMessages = [];

            //var advanceSubmitCommand = { WorkflowPendingTaskId: self.AdvanceHeader.WorkflowPendingTaskId, AdvanceId: self.AdvanceHeader.Id, Description: self.AdvanceHeader.Description, AdvanceStatusId: self.AdvanceHeader.AdvanceStatusId };
            var advanceSubmitCommand = { LastModifiedDatetime: self.AdvanceHeader.LastModifiedDatetime, AdvanceId: self.AdvanceHeader.Id, Description: self.AdvanceHeader.Description, AdvanceStatusId: self.AdvanceHeader.AdvanceStatusId };

            OrgApiService.advanceSubmit(advanceSubmitCommand).then(
                function (success) {
                    onSuccessResponse(advanceController);
                    refreshActiveAdvancesAndActiveGarnisheesCount();
                    $('#advanceDetailsModal').modal('hide');
                },
                function (error) {
                    onErrorResponse(error, 'Advance object is not valid');
                    $('#advanceDetailsModal').modal('hide');
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

            common.logSuccess("Advance submitted successfully");

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
            $('#advanceDetailsModal').modal('hide');
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.OrgAdvanceDetailsController = {
        AdvanceHeader: ['$q', 'OrgApiService', '$stateParams', function ($q, OrgApiService, $stateParams) {
            var result = $q.defer();
            OrgApiService.getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization($stateParams.organizationId, $stateParams.advanceId).then(
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