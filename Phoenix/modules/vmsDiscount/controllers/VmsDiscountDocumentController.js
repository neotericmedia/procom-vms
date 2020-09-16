(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsDiscountDocumentController', VmsDiscountDocumentController);

    /** @ngInject */
    VmsDiscountDocumentController.$inject = ['$scope', '$state', 'CodeValueService', 'VmsApiService', 'NavigationService', 'discountDocument'];

    function VmsDiscountDocumentController($scope, $state, CodeValueService, VmsApiService, NavigationService, discountDocument) {

        var self = this;

        $scope.$on('onVmsDiscountManagementSkippedRecordsUpdate', function (event, data) {
            self.discountDocument.TotalOutstandingRecords = data;
        });

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            documentId: parseInt($state.params.documentId, 10),
            discountDocument: discountDocument,
            docStatuses: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            isTabLoaded: false
        });        

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsDiscountDocumentController = {
        discountDocument: ['$q', 'VmsApiService', '$stateParams', function ($q, VmsApiService, $stateParams) {
            var result = $q.defer();
            var documentId = parseInt($stateParams.documentId, 10);
            var internalOrgId = parseInt($stateParams.internalOrganizationId, 10);

            var vmsDiscountDataParams = oreq.request()
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

            VmsApiService.getVmsDiscountSummary('', vmsDiscountDataParams, args).then(
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