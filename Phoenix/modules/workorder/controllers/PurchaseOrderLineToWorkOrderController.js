/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';

    var controllerId = 'PurchaseOrderLineToWorkOrderController';
    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$uibModalInstance', '$controller', '$filter', '$stateParams', 'common', 'data', 'PurchaseOrderApiService', '$rootScope', 'CodeValueService', 'PurchaseOrderModel', PurchaseOrderLineToWorkOrderController]);

    function PurchaseOrderLineToWorkOrderController($scope, $uibModalInstance, $controller, $filter, $stateParams, common, data, PurchaseOrderApiService, $rootScope, CodeValueService, PurchaseOrderModel) {

        common.setControllerName(controllerId);

        $scope.model = {};
        $scope.model.purchaseOrderSearchLines = data.purchaseOrderSearchLines;
        $scope.model.purchaseOrderEntity = {};
        $scope.model.purchaseOrderLineIndex = -1;

        $scope.model.entity = data.entity;
        $scope.model.WorkOrderIndex = data.WorkOrderIndex;
        $scope.model.WorkOrderVersionIndex = data.WorkOrderVersionIndex;

        $scope.lists = {
            purchaseOrderDepletedOptionList: data.purchaseOrderDepletedOptionList,
            purchaseOrderDepletedGroupList: data.purchaseOrderDepletedGroupList,
            purchaseOrderStatuses: data.purchaseOrderStatuses,
            currencyList: data.currencyList
        };

        $scope.getPurchaseOrderLineIndexById = function (purchaseOrderLines, purchaseOrderLineId) {
            var purchaseOrderLine = _.find(purchaseOrderLines, function (pol) {
                return pol.Id == purchaseOrderLineId;
            });
            var purchaseOrderLineIndex = _.indexOf(purchaseOrderLines, purchaseOrderLine);
            return purchaseOrderLineIndex;
        };


        $scope.getCurrentWorkOrderPurchaseOrderLine = function () {
            var currentWorkOrderPurchaseOrderLine = _.find($scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].WorkOrderPurchaseOrderLines, function (polLinkTable) {
                return polLinkTable.WorkOrderId == data.workOrderId;
            });
            //var currentWorkOrderPurchaseOrderLine = (currentWorkOrderPurchaseOrderLines && currentWorkOrderPurchaseOrderLines.length == 1) ? currentWorkOrderPurchaseOrderLines[0] : null;

            return currentWorkOrderPurchaseOrderLine;
        };

        $scope.amountAllowed = function (purchaseOrderLine) {
            var total = purchaseOrderLine.Amount;
            _.each(purchaseOrderLine.WorkOrderPurchaseOrderLines, function (link) {
                total -= parseFloat(link.AmountCommited);
            });
            return total;
        };

        $scope.getWorkOrderPurchaseOrderLines = function () {
            var polLinkedToWorkOrderExists = $scope.getCurrentWorkOrderPurchaseOrderLine();
            polLinkedToWorkOrderExists = !polLinkedToWorkOrderExists || polLinkedToWorkOrderExists.length === 0 ? false : true;

            if ($scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].WorkOrderPurchaseOrderLines.length === 0 || !polLinkedToWorkOrderExists) {
                var workOrderPurchaseOrderLineNew = data.defaults.workOrderPurchaseOrderLine;

                workOrderPurchaseOrderLineNew.AssignmentId = $scope.model.entity.Id;
                workOrderPurchaseOrderLineNew.WorkOrderId = $scope.CurrentWorkOrder.Id;
                workOrderPurchaseOrderLineNew.WorkOrderNumber = $scope.CurrentWorkOrder.WorkOrderNumber;
                workOrderPurchaseOrderLineNew.EffectiveDate = $scope.CurrentWorkOrderVersion.EffectiveDate;

                workOrderPurchaseOrderLineNew.PurchaseOrderLineId = $scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].Id;
                workOrderPurchaseOrderLineNew.PurchaseOrderLineNumber = $scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].PurchaseOrderLineNumber;
                workOrderPurchaseOrderLineNew.PurchaseOrderNumber = $scope.model.purchaseOrderEntity.PurchaseOrderNumber;
                workOrderPurchaseOrderLineNew.OrganizationId = $scope.model.purchaseOrderEntity.OrganizationId;
                workOrderPurchaseOrderLineNew.PurchaseOrderId = $scope.model.purchaseOrderEntity.Id;
                workOrderPurchaseOrderLineNew.AmountTotal = $scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].Amount;
                workOrderPurchaseOrderLineNew.AmountAllowed = $scope.amountAllowed($scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex]);

                $scope.model.purchaseOrderEntity.PurchaseOrderLines[$scope.model.purchaseOrderLineIndex].WorkOrderPurchaseOrderLines.push(workOrderPurchaseOrderLineNew);
            }
        };

        $scope.rowCallback = function (rowaction, purchaseOrderLineSelected) {
            if (rowaction == 'click') {
                $uibModalInstance.close(purchaseOrderLineSelected);
                /*if (purchaseOrderLineSelected.PurchaseOrderId > 0) {
                    if (common.isEmptyObject($scope.model.purchaseOrderEntity) || $scope.model.purchaseOrderEntity.Id != purchaseOrderLineSelected.PurchaseOrderId) {
                        PurchaseOrderApiService.getByPurchaseOrderId(purchaseOrderLineSelected.PurchaseOrderId).then(function (response) {
                            $scope.model.purchaseOrderEntity = response;
                            $scope.model.purchaseOrderLineIndex = $scope.getPurchaseOrderLineIndexById($scope.model.purchaseOrderEntity.PurchaseOrderLines, purchaseOrderLineSelected.Id);
                            if ($scope.model.purchaseOrderLineIndex < 0) {
                                $scope.model.purchaseOrderLineIndex = -1;
                            } else {
                                $scope.getWorkOrderPurchaseOrderLines();
                                $(".modal").addClass("overlay");
                            }
                        });
                    } else {
                        $scope.model.purchaseOrderLineIndex = $scope.getPurchaseOrderLineIndexById($scope.model.purchaseOrderEntity.PurchaseOrderLines, purchaseOrderLineSelected.Id);
                        if ($scope.model.purchaseOrderLineIndex < 0) {
                            $scope.model.purchaseOrderLineIndex = -1;
                        } else {
                            $scope.getWorkOrderPurchaseOrderLines();
                            $(".modal").addClass("overlay");
                        }
                    }
                }*/
            }
        };


        $scope.toShowHidePurchaseOrderLines = function () {
            $scope.model.purchaseOrderLineIndex = -1;
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancelled');
        };

        $scope.save = function () {
            var currentWorkOrderPurchaseOrderLine = $scope.getCurrentWorkOrderPurchaseOrderLine();
            if (currentWorkOrderPurchaseOrderLine.AmountAllowed < currentWorkOrderPurchaseOrderLine.AmountCommited) {
                common.logError('The Amount Committed is Over Limit');
            } else if (currentWorkOrderPurchaseOrderLine.AmountCommited > 0) {

                var commandSave = {
                    AmountCommited: currentWorkOrderPurchaseOrderLine.AmountCommited,
                    PurchaseOrderId: currentWorkOrderPurchaseOrderLine.PurchaseOrderId,
                    PurchaseOrderLineId: currentWorkOrderPurchaseOrderLine.PurchaseOrderLineId,
                    WorkOrderId: currentWorkOrderPurchaseOrderLine.WorkOrderId
                };

                PurchaseOrderApiService
                    .getByPurchaseOrderId(purchaseOrderLineSelected.PurchaseOrderId)
                    .then(function (response) {
                        $scope.model.purchaseOrderEntity = response;
                        PurchaseOrderModel.mixInto(response);
                        commandSave.LastModifiedDatetime = $scope.model.purchaseOrderEntity.getMaxLastModified();
                    })
                    .then(function(){
                        return PurchaseOrderApiService.workOrderPurchaseOrderLineSave(commandSave);
                    })
                    .then(
                        function (responseSave) {
                            if (responseSave.Data.IsValid !== true) {
                                common.logError("Purchase Order Association not saved");
                            } else {
                                common.logSuccess('Purchase Order Association is Saved', true);
                            }
                        },
                        function (responseSaveError) {
                            common.logError(responseSaveError.ValidationMessages);
                        }
                    );
                    
                

                PurchaseOrderApiService.getByWorkOrderId($scope.CurrentWorkOrder.Id,
                    oreq.request()
                    .withExpand(['PurchaseOrderLines/WorkOrderPurchaseOrderLines'])
                    .withSelect([
                        'PurchaseOrderLines/CurrencyId',
                        'PurchaseOrderLines/StatusId',
                        'PurchaseOrderLines/StartDate',
                        'PurchaseOrderLines/EndDate',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/Id',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderId',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderNumber',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/PurchaseOrderLineNumber',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/Amount',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/AmountCommited',
                        'PurchaseOrderLines/WorkOrderPurchaseOrderLines/AmountSpent']).url())
                    .then(
                    function (responseSuccess) {
                        var response = { Items: [] };
                        _.each(responseSuccess.Items, function (item) {
                            _.each(item.PurchaseOrderLines, function (pol) {
                                _.each(pol.WorkOrderPurchaseOrderLines, function (wopol) {
                                    response.Items.push({
                                        Id: wopol.Id,
                                        StartDate: pol.StartDate,
                                        EndDate: pol.EndDate,
                                        PurchaseOrderId: wopol.PurchaseOrderId,
                                        PurchaseOrderNumber: wopol.PurchaseOrderNumber,
                                        PurchaseOrderLineNumber: wopol.PurchaseOrderLineNumber,
                                        Amount: wopol.Amount,
                                        AmountCommited: wopol.AmountCommited,
                                        AmountSpent: wopol.AmountSpent,
                                        //CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id == pol.CurrencyId; }).code,
                                        //PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id == pol.StatusId; }).code
                                    });
                                });
                            });
                        });
                        $rootScope.$broadcast('updatePurchaseOrderLines', response.Items);
                    });

                $uibModalInstance.close(currentWorkOrderPurchaseOrderLine);

            } else {
                common.logError('The Amount Committed should be more then 0 and less than "Total Funds"');
            }
        };

        $scope.hitEnter = function (evt) {
            if (angular.equals(evt.keyCode, 13))
                $scope.save();
        };

        $controller('AssignmentFieldsAccessibilityController', {
            $scope: $scope
        });
    }

})(angular, Phoenix.App);

