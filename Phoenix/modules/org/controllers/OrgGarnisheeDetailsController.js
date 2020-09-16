(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgGarnisheeDetailsController', OrgGarnisheeDetailsController);

    OrgGarnisheeDetailsController.$inject = ['$state', 'GarnisheeHeader', 'common', 'CodeValueService', 'newTableState', 'OrgApiService'];

    function OrgGarnisheeDetailsController($state, GarnisheeHeader, common, CodeValueService, newTableState, OrgApiService) {

        var self = this;

        angular.extend(self, {
            GarnisheeHeader: GarnisheeHeader ? GarnisheeHeader : {},
            ValidationMessages: [],
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.GarnisheeStatuses),
            subdivisions: [],
            currencies: [],
            paymentMethods: [],

            init: init,
            close: close,
            garnisheeSubmit: garnisheeSubmit
        });

        function init(garnisheeController) {
            self.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.GarnisheeHeader.CountryId, CodeValueGroups.Country);
            self.currencies = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Currency), function (currency) { return currency.id == ApplicationConstants.Currencies.CAD || currency.id == ApplicationConstants.Currencies.USD || currency.id == ApplicationConstants.Currencies.MXN; });
            self.paymentMethods = CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType);

            if (garnisheeController.anyActive && garnisheeController.activeId !== self.GarnisheeHeader.Id) {
                self.statuses = _.filter(self.statuses, function (status) {
                    return status.id !== ApplicationConstants.GarnisheeStatus.Active;
                });
            }
        }

        function garnisheeSubmit(garnisheeController, refreshActiveAdvancesAndActiveGarnisheesCount) {
            self.ValidationMessages = [];

            //var garnisheeSubmitCommand = { WorkflowPendingTaskId: self.GarnisheeHeader.WorkflowPendingTaskId, GarnisheeId: self.GarnisheeHeader.Id, Description: self.GarnisheeHeader.Description, ReferenceNumber: self.GarnisheeHeader.ReferenceNumber, GarnisheeStatusId: self.GarnisheeHeader.GarnisheeStatusId };
            var garnisheeSubmitCommand = { LastModifiedDatetime: self.GarnisheeHeader.LastModifiedDatetime, GarnisheeId: self.GarnisheeHeader.Id, Description: self.GarnisheeHeader.Description, ReferenceNumber: self.GarnisheeHeader.ReferenceNumber, GarnisheeStatusId: self.GarnisheeHeader.GarnisheeStatusId };
            OrgApiService.garnisheeSubmit(garnisheeSubmitCommand).then(
                function (success) {
                    onSuccessResponse(garnisheeController);
                    refreshActiveAdvancesAndActiveGarnisheesCount();
                    $('#garnisheeDetailsModal').modal('hide');
                },
                function (error) {
                    onErrorResponse(error, 'Garnishee object is not valid');
                    $('#garnisheeDetailsModal').modal('hide');
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
            $('#garnisheeDetailsModal').modal('hide');
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.OrgGarnisheeDetailsController = {
        GarnisheeHeader: ['$q', 'OrgApiService', '$stateParams', function ($q, OrgApiService, $stateParams) {
            var result = $q.defer();
            OrgApiService.getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization($stateParams.organizationId, $stateParams.garnisheeId).then(
                function (response) {
                    //response.WorkflowPendingTaskId = -1;
                    //WorkflowApiService.getWorkflowAvailableActions(response, response, ApplicationConstants.EntityType.Garnishee).then(
                    //                    function (responseSuccess) {
                    result.resolve(response);
                    //                    },
                    //                    function (responseError) {
                    //                        result.reject(responseError);
                    //                    });
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);