(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchFixedPriceWorkflowController', VmsBatchFixedPriceWorkflowController);

    VmsBatchFixedPriceWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchFixedPriceWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Fixed Price Workflow', 'icon icon-transaction');

        var self = this;
    }

})(angular, Phoenix.App);