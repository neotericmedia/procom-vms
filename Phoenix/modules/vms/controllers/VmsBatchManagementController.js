(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsBatchManagementController', VmsBatchManagementController);

    VmsBatchManagementController.$inject = ['$scope', '$state', 'phoenixauth', 'common', 'phoenixsocket', 'UtilityService', 'CodeValueService', 'NavigationService', 'TransactionApiService', 'resolveListOrganizationInternal'];

    function VmsBatchManagementController($scope, $state, phoenixauth, common, phoenixsocket, UtilityService, CodeValueService, NavigationService, TransactionApiService, resolveListOrganizationInternal) {

        NavigationService.setTitle('thirdpartybatch-manage');

        var self = this;

        angular.extend(self, {
            //properties
            internalOrganizations: resolveListOrganizationInternal,
            //methods
            showRecords: showRecords,
        });
        console.log(self.internalOrganizations);
        phoenixauth.getCurrentProfile().then(function (user) {
            $scope.currentUser = user;
            angular.forEach(self.internalOrganizations, function (company) {
                if (company.OrganizationIdInternal == $scope.currentUser.OrganizationId) {
                    company.isOpen = true;
                }
            });
            self.internalOrganizations = self.internalOrganizations.sort(function (a, b) {
                if (a.OrganizationIdInternal == $scope.currentUser.OrganizationId && b.OrganizationIdInternal != $scope.currentUser.OrganizationId) {
                    return -1;
                } else if (a.OrganizationIdInternal != $scope.currentUser.OrganizationId && b.OrganizationIdInternal == $scope.currentUser.OrganizationId) {
                    return 1;
                } else {
                    return a.InternalOrgDisplayName < b.InternalOrgDisplayName ? -1 : b.InternalOrgDisplayName < a.InternalOrgDisplayName ? 1 : 0;
                }
            });
        });
        function showRecords(org) {
            var isOpen = org.isOpen;
            angular.forEach(self.internalOrganizations, function (org) {
                org.isOpen = false;
            });
            org.isOpen = !isOpen;
        }
    }

})(angular);