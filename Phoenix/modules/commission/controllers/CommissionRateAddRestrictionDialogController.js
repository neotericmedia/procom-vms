(function () {
    'use strict';

    var controllerId = 'CommissionRateAddRestrictionDialogController';

    angular.module('phoenix.commission.controllers').controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', 'CodeValueService', CommissionRateAddRestrictionDialogController]);

    function CommissionRateAddRestrictionDialogController($scope, $uibModalInstance, common, data, CodeValueService) {

        common.setControllerName(controllerId);
        $scope.data = data;
        $scope.data.commissionRateRestrictionTypeName = CodeValueService.getCodeValue($scope.data.commissionRateRestrictionTypeId, CodeValueGroups.CommissionRateRestrictionType).text;

        var ratesByCurrentType = _.filter($scope.data.commissionRateRestrictions, function (rate) {
            return rate.CommissionRateRestrictionTypeId === $scope.data.commissionRateRestrictionTypeId;
        });

        angular.forEach($scope.data.list, function (item) {
            if (ratesByCurrentType.length > 0) {
                var isApplied = false;
                if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganization) {
                    angular.forEach(ratesByCurrentType, function (rateByCurrentType) { if (rateByCurrentType.OrganizationIdInternal === item.Id) { isApplied = true; } });
                }
                else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.ClientOrganization) {
                    angular.forEach(ratesByCurrentType, function (rateByCurrentType) { if (rateByCurrentType.OrganizationIdClient === item.Id) { isApplied = true; } });
                }
                else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.LineOfBusiness) {
                    angular.forEach(ratesByCurrentType, function (rateByCurrentType) { if (rateByCurrentType.LineOfBusinessId === item.id) { isApplied = true; } });
                }
                else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
                    angular.forEach(ratesByCurrentType, function (rateByCurrentType) { if (rateByCurrentType.InternalOrganizationDefinition1Id === item.id) { isApplied = true; } });
                }
                item.isApplied = isApplied;
            }
            else {
                item.isApplied = false;
            }
        });

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };

        $scope.create = function () {
            var resultCommissionRateRestrictions = [];
            angular.forEach($scope.data.commissionRateRestrictions, function (commissionRateRestriction) {
                if (commissionRateRestriction.CommissionRateRestrictionTypeId != $scope.data.commissionRateRestrictionTypeId) {
                    resultCommissionRateRestrictions.push(commissionRateRestriction);
                }
            });
            angular.forEach($scope.data.list, function (item) {
                if (item.isApplied) {
                    if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganization) {
                        resultCommissionRateRestrictions.push(
                        {
                            CommissionRateRestrictionTypeId: $scope.data.commissionRateRestrictionTypeId,
                            OrganizationIdInternal: item.Id,
                            Name: item.DisplayName,
                        });
                    }
                    else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.ClientOrganization) {
                        resultCommissionRateRestrictions.push(
                        {
                            CommissionRateRestrictionTypeId: $scope.data.commissionRateRestrictionTypeId,
                            OrganizationIdClient: item.Id,
                            Name: item.DisplayName,
                        });
                    }
                    else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.LineOfBusiness) {
                        resultCommissionRateRestrictions.push(
                        {
                            CommissionRateRestrictionTypeId: $scope.data.commissionRateRestrictionTypeId,
                            LineOfBusinessId: item.id,
                            Name: item.text,
                        });
                    }
                    else if ($scope.data.commissionRateRestrictionTypeId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
                        resultCommissionRateRestrictions.push(
                        {
                            CommissionRateRestrictionTypeId: $scope.data.commissionRateRestrictionTypeId,
                            InternalOrganizationDefinition1Id: item.id,
                            Name: item.text,
                        });
                    }
                }
            });
            var result = {
                action: "create",
                commissionRateRestrictionTypeId: $scope.data.commissionRateRestrictionTypeId,
                commissionRateRestrictions: resultCommissionRateRestrictions
            };
            $uibModalInstance.close(result);
        };

        $scope.addCommissionRateRestriction = function (commissionRateRestriction) {
            commissionRateRestriction.isApplied = true;
        };

        $scope.removeCommissionRateRestriction = function (commissionRateRestriction) {
            commissionRateRestriction.isApplied = false;
        };
    }
})();