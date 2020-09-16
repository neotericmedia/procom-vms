(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetPreprocessingController', VmsTimesheetPreprocessingController);

    VmsTimesheetPreprocessingController.$inject = ['$scope', '$state', 'common', 'NavigationService', 'resolveListOrganizationInternal', 'resolveListOrganizationClient'];

    function VmsTimesheetPreprocessingController($scope, $state, common, NavigationService, resolveListOrganizationInternal, resolveListOrganizationClient) {

        NavigationService.setTitle('VMS Pre-Processing', 'icon icon-transaction');

        $scope.lists = {
            listOrganizationInternal: resolveListOrganizationInternal,
            listOrganizationClient: resolveListOrganizationClient
        };

        $scope.model = {
            OrganizationIdInternal: null,
            OrganizationIdClient: null,
        };

        $scope.selectClient = function () {
            if ($scope.model.OrganizationIdInternal !== null && $scope.model.OrganizationIdInternal > 0 && $scope.model.OrganizationIdClient !== null && $scope.model.OrganizationIdClient > 0) {
                $state.go('vms.preprocessed', { organizationIdInternal: $scope.model.OrganizationIdInternal, organizationIdClient: $scope.model.OrganizationIdClient });
            }
        };

    }
})(angular);