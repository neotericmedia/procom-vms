(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsExpenseDocumentController', VmsExpenseDocumentController);

    /** @ngInject */
    VmsExpenseDocumentController.$inject = ['$scope', '$state', 'CodeValueService', 'VmsApiService', 'NavigationService', 'expenseDocument'];

    function VmsExpenseDocumentController($scope, $state, CodeValueService, VmsApiService, NavigationService, expenseDocument) {

         var self = this;

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            documentId: parseInt($state.params.documentId, 10),
            expenseDocument: expenseDocument,
            docStatuses: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            isTabLoaded: false
        });        

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsExpenseDocumentController = {
        expenseDocument: ['$q', 'VmsApiService', '$stateParams', function ($q, VmsApiService, $stateParams) {
            var result = $q.defer();
            var documentId = parseInt($stateParams.documentId, 10);
            var internalOrgId = parseInt($stateParams.internalOrganizationId, 10);

            var vmsExpenseDataParams = oreq.request()
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

            VmsApiService.getVmsExpenseDocument('', vmsExpenseDataParams, args).then(
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