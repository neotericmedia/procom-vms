(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchCommissionWorkflowController', VmsBatchCommissionWorkflowController);

    VmsBatchCommissionWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchCommissionWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Commission Workflow', 'icon icon-transaction');

        var self = this;
    }

})(angular, Phoenix.App);