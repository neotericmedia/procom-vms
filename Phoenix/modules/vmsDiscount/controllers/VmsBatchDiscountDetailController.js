(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchDiscountDetailController', VmsBatchDiscountDetailController);

    VmsBatchDiscountDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService', 'resolveVmsDiscountProcessedRecordDetails'];

    function VmsBatchDiscountDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService, resolveVmsDiscountProcessedRecordDetails) {

        NavigationService.setTitle('thirdpartyimport-manage-discountbatchdetail');

        var self = this;

        self.initialize = function (vmsBatchDiscount) {
            self.vmsBatchDiscount = vmsBatchDiscount;
            self.vmsBatchDiscount.isTabLoaded = false;
        }
    }

})(angular, Phoenix.App);