(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchCommissionDetailController', VmsBatchCommissionDetailController);

    VmsBatchCommissionDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService'];

    function VmsBatchCommissionDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService){

        NavigationService.setTitle('thirdpartyimport-manage-commissionbatchdetail');

        var self = this;

        self.initialize = function (vmsBatchCommission) {
            self.vmsBatchCommission = vmsBatchCommission;
            self.vmsBatchCommission.isTabLoaded = false;
        };
    }
})(angular, Phoenix.App);