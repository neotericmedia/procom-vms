(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsDiscountDocumentWorkflowController', VmsDiscountDocumentWorkflowController);

    VmsDiscountDocumentWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsDiscountDocumentWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS Discount Document Workflow', 'icon icon-transaction');

        var self = this;

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);