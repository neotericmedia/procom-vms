(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchFixedPriceDetailController', VmsBatchFixedPriceDetailController);

    VmsBatchFixedPriceDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService'];

    function VmsBatchFixedPriceDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService){

        NavigationService.setTitle('thirdpartyimport-manage-fixedpricebatchdetail');

        var self = this;

        self.initialize = function (vmsBatchFixedPrice) {
            self.vmsBatchFixedPrice = vmsBatchFixedPrice;
            self.vmsBatchFixedPrice.isTabLoaded = false;
        };
    }
})(angular, Phoenix.App);