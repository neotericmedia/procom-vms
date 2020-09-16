(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsFixedPriceDocumentWorkflowController', VmsFixedPriceDocumentWorkflowController);

    VmsFixedPriceDocumentWorkflowController.$inject = ['$state'];

    function VmsFixedPriceDocumentWorkflowController($state) {

        var self = this;

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = true;
        }
    }

})(angular, Phoenix.App);