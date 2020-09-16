(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchFixedPriceController', VmsBatchFixedPriceController);

    VmsBatchFixedPriceController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsFixedPriceProcessedRecordDetails'];

    function VmsBatchFixedPriceController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsFixedPriceProcessedRecordDetails){

        NavigationService.setTitle('VMS Fixed Price Detail', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails : resolveVmsFixedPriceProcessedRecordDetails, 
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            workOrderStatus: CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchFixedPriceController = {       
            resolveVmsFixedPriceProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsFixedPriceProcessedRecordById($stateParams.vmsFixedPriceProcessedRecordId).then(
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