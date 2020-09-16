(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchUnitedStatesSourceDeductionController', VmsBatchUnitedStatesSourceDeductionController);

    VmsBatchUnitedStatesSourceDeductionController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'VmsApiService', 'resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails'];

    function VmsBatchUnitedStatesSourceDeductionController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, VmsApiService, resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails) {

        NavigationService.setTitle('thirdpartyimport-manage-ussourcededuction');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails: resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails,
            transactionDetails: null,
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchUnitedStatesSourceDeductionController = {
            resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsUnitedStatesSourceDeductionProcessedRecordById($stateParams.vmsUnitedStatesSourceDeductionProcessedRecordId).then(
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