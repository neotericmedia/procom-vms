(function () {
    'use strict';


    var controllerId = 'BenefitAddDialogController';

    angular.module('phoenix.contact.controllers').controller(controllerId, ['$scope', 'CodeValueService', '$uibModalInstance', 'common', 'data', BenefitAddDialogController]);

    function BenefitAddDialogController($scope, CodeValueService, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        $scope.data = data;
        $scope.data.benefit = $scope.data.benefit || {};
        $scope.data.errors = [];

        $scope.cancel = function () {
            var result = { action: "cancel" };
            $uibModalInstance.close(result);
        };
        $scope.datePickerChange = function () {
            $scope.validate();
        };
        $scope.validate = function () {
            if (data.validate) {
                var valResult = data.validate();

                data.errors = valResult.errors;

                return valResult.isValid;
            }
        };
        $scope.submit = function () {
            if ($scope.validate()) {
                var result = { action: "create", benefit: $scope.data.benefit };
                $uibModalInstance.close(result);
            }

        };
        $scope.getPattern = function () {
            if (data.benefit.EmployeeAmount > 0 || data.benefit.EmployerAmount > 0) {
                return;
            }
            return ApplicationConstants.Regex.CurrencyGreaterThanZero;
        };

        $scope.ptFieldViewStatus = {

            funcToCheckViewStatus: function (modelPrefix, fieldName) {
                if (data.currentProfile.IsDraftStatus && modelPrefix != undefined && fieldName != undefined) {
                    if (modelPrefix == 'data.benefit' && [
                        'EmployerAmount',
                        'EmployeeAmount',
                        'EffectiveDate',
                        'BenefitTypeId',
                        'OrganizationIdInternal',
                        'IsActive'
                    ].indexOf(fieldName) > -1
                    ) {
                        if (data.currentProfile.AreComplianceFieldsEditable) {
                            return ApplicationConstants.viewStatuses.edit;
                        } else {
                            return ApplicationConstants.viewStatuses.view;
                        }
                    }
                } else {
                    return ApplicationConstants.viewStatuses.view;
                }
            },
            funcToPassMessages: function (message) {
                common.logWarning(message);
            }
        };

        $scope.canSubmit = false;

        if (data.currentProfile.AreComplianceFieldsEditable) {
            $scope.canSubmit = true;
        }
    }

})();