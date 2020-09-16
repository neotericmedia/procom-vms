(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchDiscountWorkflowController', VmsBatchDiscountWorkflowController);

    VmsBatchDiscountWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchDiscountWorkflowController($state, NavigationService) {

        NavigationService.setTitle('thirdpartyimport-manage-discount');

        var self = this;
    }

})(angular, Phoenix.App);