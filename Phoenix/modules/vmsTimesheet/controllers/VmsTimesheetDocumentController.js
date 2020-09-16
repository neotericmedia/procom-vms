(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetDocumentController', VmsTimesheetDocumentController);

    /** @ngInject */
    VmsTimesheetDocumentController.$inject = ['$scope', '$state', 'CodeValueService', 'VmsApiService', 'NavigationService', 'timesheetDocument'];

    function VmsTimesheetDocumentController($scope, $state, CodeValueService, VmsApiService, NavigationService, timesheetDocument) {

         var self = this;

        angular.extend(self, {
            internalOrganizationId: $state.params.internalOrganizationId,
            documentId: parseInt($state.params.documentId, 10),
            timesheetDocument: timesheetDocument,
            docStatuses: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            isTabLoaded: false
        });        

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsTimesheetDocumentController = {
        timesheetDocument: ['$q', 'VmsApiService', '$stateParams', function ($q, VmsApiService, $stateParams) {
            var result = $q.defer();
            var documentId = parseInt($stateParams.documentId, 10);
            var internalOrgId = parseInt($stateParams.internalOrganizationId, 10);

            var vmsTimesheetDataParams = oreq.request()
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

            VmsApiService.getVmsTimesheetDocument('', vmsTimesheetDataParams, args).then(
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