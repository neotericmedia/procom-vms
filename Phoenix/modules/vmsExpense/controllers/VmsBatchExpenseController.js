(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchExpenseController', VmsBatchExpenseController);

    VmsBatchExpenseController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsExpenseProcessedRecordDetails'];//, 'resolveBillingTransactionDetails'];

    function VmsBatchExpenseController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsExpenseProcessedRecordDetails){//, resolveBillingTransactionDetails) {

        NavigationService.setTitle('VMS Expense Detail', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            processedRecordDetails : resolveVmsExpenseProcessedRecordDetails, 
            vmsFileStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsDocumentStatus, true),
            vmsRecordStatus: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            workOrderStatus: CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
            isTabLoaded: false
            //methods
        });
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsBatchExpenseController = {       
            resolveVmsExpenseProcessedRecordDetails: ['$q', '$stateParams', 'VmsApiService', function ($q, $stateParams, VmsApiService) {
                var result = $q.defer();
                VmsApiService.getVmsExpenseProcessedRecordById($stateParams.vmsExpenseProcessedRecordId).then(
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