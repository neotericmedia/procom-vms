(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchUnitedStatesSourceDeductionDetailController', VmsBatchUnitedStatesSourceDeductionDetailController);

    VmsBatchUnitedStatesSourceDeductionDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails'];

    function VmsBatchUnitedStatesSourceDeductionDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsUnitedStatesSourceDeductionProcessedRecordDetails) {

        NavigationService.setTitle('thirdpartyimport-manage-unitedstatessourcedeductionbatchdetail');

        var self = this;

        self.initialize = function (vmsBatchUnitedStatesSourceDeduction) {
            self.vmsBatchUnitedStatesSourceDeduction = vmsBatchUnitedStatesSourceDeduction;
            self.vmsBatchUnitedStatesSourceDeduction.isTabLoaded = false;
        }
    }

})(angular, Phoenix.App);