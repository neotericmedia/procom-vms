(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsExpenseDocumentWorkflowController', VmsExpenseDocumentWorkflowController);

    VmsExpenseDocumentWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsExpenseDocumentWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Expense Document Workflow', 'icon icon-transaction');

        var self = this;

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);