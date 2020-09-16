(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchExpenseDetailController', VmsBatchExpenseDetailController);

    VmsBatchExpenseDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService'];

    function VmsBatchExpenseDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService){

        NavigationService.setTitle('thirdpartyimport-manage-expensebatchdetail');

        var self = this;

        self.initialize = function (vmsBatchExpense) {
            self.vmsBatchExpense = vmsBatchExpense;
            self.vmsBatchExpense.isTabLoaded = false;
        };
    }
})(angular, Phoenix.App);