(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetDocumentWorkflowController', VmsTimesheetDocumentWorkflowController);

    VmsTimesheetDocumentWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsTimesheetDocumentWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Timesheet Workflow', 'icon icon-transaction');

        var self = this;
		NavigationService.setTitle('thirdpartyimport-manage-timesheet');
        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);