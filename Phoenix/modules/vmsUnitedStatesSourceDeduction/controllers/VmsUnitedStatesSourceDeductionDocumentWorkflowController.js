(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsUnitedStatesSourceDeductionDocumentWorkflowController', VmsUnitedStatesSourceDeductionDocumentWorkflowController);

    VmsUnitedStatesSourceDeductionDocumentWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsUnitedStatesSourceDeductionDocumentWorkflowController($state, NavigationService) {

        NavigationService.setTitle('VMS United States Source Deduction Document Workflow', 'icon icon-transaction');

        var self = this;

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);