(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchCommissionController', VmsBatchCommissionController);

    VmsBatchCommissionController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsCommissionProcessedRecordDetails'];

    function VmsBatchCommissionController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsCommissionProcessedRecordDetails){

        NavigationService.setTitle('VMS Commission Detail', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails : resolveVmsCommissionProcessedRecordDetails, 
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            workOrderStatus: CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchCommissionController = {       
            resolveVmsCommissionProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsCommissionProcessedRecordById($stateParams.vmsCommissionProcessedRecordId).then(
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