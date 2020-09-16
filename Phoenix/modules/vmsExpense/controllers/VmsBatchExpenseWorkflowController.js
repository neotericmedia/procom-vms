(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchExpenseWorkflowController', VmsBatchExpenseWorkflowController);

    VmsBatchExpenseWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchExpenseWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Expense Workflow', 'icon icon-transaction');

        var self = this;
    }

})(angular, Phoenix.App);