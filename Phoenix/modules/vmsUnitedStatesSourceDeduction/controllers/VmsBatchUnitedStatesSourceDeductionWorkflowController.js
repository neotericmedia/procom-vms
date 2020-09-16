(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchUnitedStatesSourceDeductionWorkflowController', VmsBatchUnitedStatesSourceDeductionWorkflowController);

    VmsBatchUnitedStatesSourceDeductionWorkflowController.$inject = ['$state', 'NavigationService'];

    function VmsBatchUnitedStatesSourceDeductionWorkflowController($state, NavigationService) {

        NavigationService.setTitle('thirdpartyimport-manage-ussourcededuction');

        var self = this;
    }

})(angular, Phoenix.App);