(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchDiscountController', VmsBatchDiscountController);

    VmsBatchDiscountController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'VmsApiService', 'resolveVmsDiscountProcessedRecordDetails'];

    function VmsBatchDiscountController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, VmsApiService, resolveVmsDiscountProcessedRecordDetails) {

        NavigationService.setTitle('thirdpartyimport-manage-discount');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails: resolveVmsDiscountProcessedRecordDetails,
            transactionDetails: null,
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchDiscountController = {
            resolveVmsDiscountProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsDiscountProcessedRecordById($stateParams.vmsDiscountProcessedRecordId).then(
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