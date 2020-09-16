(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsFixedPriceDocumentController', VmsFixedPriceDocumentController);

    /** @ngInject */
    VmsFixedPriceDocumentController.$inject = ['$scope', '$state', 'CodeValueService', 'VmsApiService', 'NavigationService', 'fixedPriceDocument'];

    function VmsFixedPriceDocumentController($scope, $state, CodeValueService, VmsApiService, NavigationService, fixedPriceDocument) {

         var self = this;

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            documentId: parseInt($state.params.documentId, 10),
            fixedPriceDocument: fixedPriceDocument,
            docStatuses: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            isTabLoaded: false
        });        

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsFixedPriceDocumentController = {
        fixedPriceDocument: ['$q', 'VmsApiService', '$stateParams', function ($q, VmsApiService, $stateParams) {
            var result = $q.defer();
            var documentId = parseInt($stateParams.documentId, 10);
            var internalOrgId = parseInt($stateParams.internalOrganizationId, 10);

            var vmsFixedPriceDataParams = oreq.request()
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
                    'TotalCompleted'
                ]).url();

            var args = [internalOrgId, documentId];

            VmsApiService.getVmsFixedPriceDocument('', vmsFixedPriceDataParams, args).then(
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