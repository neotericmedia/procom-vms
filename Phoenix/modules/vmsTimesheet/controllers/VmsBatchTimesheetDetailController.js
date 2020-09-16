(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchTimesheetDetailController', VmsBatchTimesheetDetailController);

    VmsBatchTimesheetDetailController.$inject = ['$state', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'contactService', 'VmsApiService'];

    function VmsBatchTimesheetDetailController($state, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, ContactApiService, VmsApiService){

        NavigationService.setTitle('thirdpartyimport-manage-timesheetbatchdetail');

        var self = this;

        self.initialize = function (vmsBatchTimesheet) {
            self.vmsBatchTimesheet = vmsBatchTimesheet;
            self.vmsBatchTimesheet.isTabLoaded = false;
        };
    }

})(angular, Phoenix.App);