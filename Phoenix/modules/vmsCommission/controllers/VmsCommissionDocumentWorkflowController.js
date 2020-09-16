(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsCommissionDocumentWorkflowController', VmsCommissionDocumentWorkflowController);

    VmsCommissionDocumentWorkflowController.$inject = ['$state'];

    function VmsCommissionDocumentWorkflowController($state) {

        var self = this;

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);