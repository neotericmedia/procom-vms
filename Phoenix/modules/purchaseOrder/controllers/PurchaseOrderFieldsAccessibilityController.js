/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';
    var controllerId = 'PurchaseOrderFieldsAccessibilityController';
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,['$scope', '$state', PurchaseOrderFieldsAccessibilityController]);
    function PurchaseOrderFieldsAccessibilityController($scope, $state) {

        $scope.ptFieldViewMessages = function (message) {
            common.logWarning(message);
        };

        $scope.ptFieldViewEventOnChangeStatusId = function (modelPrefix, fieldName) {
            //return ApplicationConstants.viewStatuses.edit;
            if ($state.includes('assignment')) {
                if (modelPrefix == "workOrderPurchaseOrderLine" && fieldName == "AmountCommited")
                    return ApplicationConstants.viewStatuses.edit;
                else
                    return ApplicationConstants.viewStatuses.view;
            }
            else {
                if (modelPrefix == 'model.entity' && fieldName == 'OrganizationId') {
                    if ($scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft) {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                }
                //if (modelPrefix == 'model.polEntity') {}
                if ($scope.model.activeInEditMode || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft) {
                    return ApplicationConstants.viewStatuses.edit;
                }
                else {
                    return ApplicationConstants.viewStatuses.view;
                }
                return ApplicationConstants.viewStatuses.view;
            }
        };

        $scope.model.ptFieldViewConfigOnChangeStatusId = { funcToCheckViewStatus: 'ptFieldViewEventOnChangeStatusId', watchChangeEvent: '[model.entity.StatusId, model.activeInEditMode]', funcToPassMessages: 'ptFieldViewMessages' };

    }

})(angular, Phoenix.App);