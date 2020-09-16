(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsUnitedStatesSourceDeductionDocumentController', VmsUnitedStatesSourceDeductionDocumentController);

    /** @ngInject */
    VmsUnitedStatesSourceDeductionDocumentController.$inject = ['$scope', '$state', 'CodeValueService', 'VmsApiService', 'NavigationService', 'unitedstatessourcedeductionDocument'];

    function VmsUnitedStatesSourceDeductionDocumentController($scope, $state, CodeValueService, VmsApiService, NavigationService, unitedstatessourcedeductionDocument) {

        var self = this;

        $scope.$on('onVmsUnitedStatesSourceDeductionManagementSkippedRecordsUpdate', function (event, data) {
            self.unitedstatessourcedeductionDocument.TotalOutstandingRecords = data;
        });

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            documentId: parseInt($state.params.documentId, 10),
            unitedstatessourcedeductionDocument: unitedstatessourcedeductionDocument,
            docStatuses: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            isTabLoaded: false
        });        

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsUnitedStatesSourceDeductionDocumentController = {
        unitedstatessourcedeductionDocument: ['$q', 'VmsApiService', '$stateParams', function ($q, VmsApiService, $stateParams) {
            var result = $q.defer();
            var documentId = parseInt($stateParams.documentId, 10);
            var internalOrgId = parseInt($stateParams.internalOrganizationId, 10);

            var vmsUnitedStatesSourceDeductionDataParams = oreq.request()
                .withSelect([
                    'VmsDocumentId',
                    'VmsDocumentStatus',
                    'FileName',
                    'ClientOrganizationName',
                    'TotalOutstandingRecords',
                    'ImportDate',
                    'TotalPending',
                    'TotalConflict',
                    'TotalDiscarded',
                    'TotalCompleted',
                ]).url();

            var args = [internalOrgId, documentId];

            VmsApiService.getVmsUnitedStatesSourceDeductionSummary('', vmsUnitedStatesSourceDeductionDataParams, args).then(
                function (response) {
                    result.resolve(response.Items[0]);
                },
                function (error) {
                    result.reject(error);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);