(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchTimesheetController', VmsBatchTimesheetController);

    VmsBatchTimesheetController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsTimesheetProcessedRecordDetails'];//, 'resolveBillingTransactionDetails'];

    function VmsBatchTimesheetController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsTimesheetProcessedRecordDetails){//, resolveBillingTransactionDetails) {

        // NavigationService.setTitle('VMS Timesheet Detail', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails : resolveVmsTimesheetProcessedRecordDetails, 
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            workOrderStatus: CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchTimesheetController = {       
            resolveVmsTimesheetProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsTimesheetProcessedRecordById($stateParams.vmsTimesheetProcessedRecordId).then(
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