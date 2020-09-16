(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchTimesheetWorkflowController', VmsBatchTimesheetWorkflowController);

    VmsBatchTimesheetWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchTimesheetWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Timesheet Workflow', 'icon icon-transaction');

        var self = this;
    }

})(angular, Phoenix.App);