(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionAddWorkOrderDialogController', CommissionAddWorkOrderDialogController);

    CommissionAddWorkOrderDialogController.$inject = ['AssignmentApiService', 'CodeValueService', 'common', 'data', 'NavigationService', 'CommissionApiService', '$uibModalInstance', '$scope'];

    function CommissionAddWorkOrderDialogController(AssignmentApiService, CodeValueService, common, data, NavigationService, CommissionApiService, $uibModalInstance, $scope) {

        NavigationService.setTitle('commission-adjustment-viewedit');

        $scope.SelectedWorkorders = data && data.SelectedWorkorders ? data.SelectedWorkorders : [];
        $scope.SelectedOrganizationIdInternal = data.SelectedOrganizationIdInternal;
        $scope.SelectedClientOrganizationId = data.SelectedClientOrganizationId;

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.select = function () {
            var result = { action: "select", SelectedWorkorders: $scope.SelectedWorkorders };
            $uibModalInstance.close(result);
        };

        $scope.onWorkorderSelectionChanged = function ($event) {
            $scope.SelectedWorkorders = $event;
        };

    }

})(angular, Phoenix.App);