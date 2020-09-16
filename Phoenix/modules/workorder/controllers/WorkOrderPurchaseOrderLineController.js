/// <reference path="../../../libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/app.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
//https://github.com/m-e-conroy/angular-dialog-service

(function (app) {
    'use strict';

    var controllerId = 'WorkOrderPurchaseOrderLineController';
    angular.module('phoenix.workorder.controllers').controller('WorkOrderPurchaseOrderLineController',
        ['$scope', 'common', 'resolveAssignment', 'PurchaseOrderApiService', '$state', '$stateParams', 'dialogs', 'resolveCodeValueLists', 'PurchaseOrderModel', 'PurchaseOrderLineModel', 'CodeValueService', WorkOrderPurchaseOrderLineController]);

    function WorkOrderPurchaseOrderLineController($scope, common, resolveAssignment, PurchaseOrderApiService, $state, $stateParams, dialogs, resolveCodeValueLists, PurchaseOrderModel, PurchaseOrderLineModel, CodeValueService) {

        common.setControllerName(controllerId);

        $scope.floatApplyTwoDecimalPlaces = function (c) {
            return common.floatApplyTwoDecimalPlaces(c);
        };
        
        // Don't really need to dispose because we're attaching the veent to $scope.
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // check for child routes.
            if (toState && toState.name === 'workorder.edit.purchaseorder' &&
                fromState && fromState.name && fromState.name.match(/workorder\.edit\.purchaseorder\./)) {
                // update list if from child.
                load();
            }
        });

        // -- get billing rate
        var allRates = $scope.CurrentWorkOrderVersion.BillingInfoes[0].BillingRates;
        var billingRate = _.find(allRates, { RateTypeId: 1 });
        $scope.primaryFirstBillingRate = billingRate ? billingRate.Rate : 0;

        switch (billingRate ? billingRate.RateUnitId : 0) {
            case 1:
                $scope.primaryworkunit = "H";
                break;
            case 2:
                $scope.primaryworkunit = "D";
                break;
            case 3:
                $scope.primaryworkunit = "F";
                break;
            default:
                $scope.primaryworkunit = "?";
        }

        // -- end get billing rate

        function load() {
            PurchaseOrderApiService.getWorkOrderPurchaseOrderLinesByWorkOrderId($stateParams.workOrderId,
                oreq.request()
                .withSelect([
                    'PurchaseOrderLineCurrencyId',
                    'PurchaseOrderLineStatusId',
                    'PurchaseOrderDepletionGroupId',
                    'PurchaseOrderLineStartDate',
                    'PurchaseOrderLineEndDate',
                    'Id',
                    'PurchaseOrderId',
                    'PurchaseOrderNumber',
                    'PurchaseOrderLineNumber',
                    'PurchaseOrderLineId',
                    'StatusId',
                    'Amount',
                    'AmountCommited',
                    'AmountSpent',
                    'AmountReserved'
                ]).url()).then(
                function (responseSuccess) {
                    //var responseItems = [];
                    $scope.CurrentWorkOrderVersion.WorkOrderPurchaseOrderLines = [];
                    _.each(responseSuccess.Items, function (item) {
                        $scope.CurrentWorkOrderVersion.WorkOrderPurchaseOrderLines.push({
                            Id: item.Id,
                            PurchaseOrderDepletionGroupId: item.PurchaseOrderDepletionGroupId,
                            StartDate: item.PurchaseOrderLineStartDate,
                            EndDate: item.PurchaseOrderLineEndDate,
                            PurchaseOrderId: item.PurchaseOrderId,
                            PurchaseOrderLineId: item.PurchaseOrderLineId,
                            PurchaseOrderNumber: item.PurchaseOrderNumber,
                            PurchaseOrderLineNumber: item.PurchaseOrderLineNumber,
                            Amount: item.Amount,
                            AmountCommited: item.AmountCommited,
                            AmountSpent: item.AmountSpent,
                            AmountReserved: item.AmountReserved,
                            StatusId: item.StatusId
                            //CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id == pol.CurrencyId; }).code,
                            //PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id == pol.StatusId; }).code
                        });

                        //_.each(item.PurchaseOrderLines, function (pol) {
                        //    _.each(pol.WorkOrderPurchaseOrderLines, function (wopol) {

                        //    })
                        //})
                    });
                    //$scope.workOrderPurchaseOrderLines = responseItems;
                },
                function (responseError) {
                    common.responseErrorMessages(responseError);
                });
        }


        load();

        $scope.getCodeText = function (statusId) {
            var code = CodeValueService.getCodeValue(statusId, CodeValueGroups.WorkOrderPurchaseOrderLineStatus);

            if (code) {
                return code.text;
            }
            else {
                return null;
            }
        };

        //var unregisterEvent = $scope.$on('updatePurchaseOrderLines', function (event, data) {
        //    $scope.workOrderPurchaseOrderLines = data;
        //});

        //$scope.$on("$destroy", function () {
        //    unregisterEvent();
        //});

        $scope.removeWorkOrderPurchaseOrderLine = function (purchaseOrderId, purchaseOrderLine) {
            if (purchaseOrderId && purchaseOrderLine) {
            }
        };

        $scope.addPurchaseOrder = function () {
            $state.go('purchaseorder.search');
        };

        //function GetPurchaseOrderWorkOrderViewModel(workOrder) {
        //    return PurchaseOrderApiService.getByPurchaseOrderId(workOrder.PurchaseOrderId)
        //        .then(function (response) {
        //            var result = {};
        //            result.PurchaseOrderLine = _.find(response.PurchaseOrderLines, function (line) {
        //                return line.Id == workOrder.PurchaseOrderLineId;
        //            });
        //            return result.PurchaseOrderLine;
        //        });
        //}

        $scope.purchaseOrderLineActivate = function (pol, index) {
            PurchaseOrderApiService
                .getByPurchaseOrderId(pol.PurchaseOrderId)
                .then(function(response){                    
                    PurchaseOrderModel.mixInto(response);
                    return PurchaseOrderApiService.workOrderPurchaseOrderLineStatusToActivate({ 
                        WorkOrderPurchaseOrderLineId: pol.Id, 
                        LastModifiedDatetime: response.getMaxLastModified(),
                    });
                })
                .then(function (rsp) {
                    load();
                });
        };

        $scope.purchaseOrderLineOpen = function (pol, index, option) {
            $state.go('workorder.edit.purchaseorder.line', { purchaseOrderId: pol.PurchaseOrderId, purchaseOrderLineId: pol.PurchaseOrderLineId, workOderPurchaseOrderLineId: pol.Id });

            return;
            //GetPurchaseOrderWorkOrderViewModel(pol).then(function (model) {
            //    option = option || 'edit';
            //    var dialogConfig = {
            //        pol: model,
            //        purchaseOrderDepletedOptionList: $scope.lists.purchaseOrderDepletedOptionList,
            //        purchaseOrderNumber: pol.PurchaseOrderNumber,
            //        purchaseOrderStatuses: $scope.lists.purchaseOrderStatuses,
            //        currencyList: $scope.lists.currencyList,
            //        option: option,
            //        statusId: $scope.model.entity.StatusId,
            //        activeInEditMode: false,
            //    };
            //    //var dlg = dialogs.create('/Template/PurchaseOrder/Dialogs/PurchaseOrderLineEditDialog', 'PurchaseOrderLineEditController', dialogConfig, {
            //    //var dlg = dialogs.create('/Phoenix/modules/workorder/views/DialogPurchaseOrderLineEdit.html', 'PurchaseOrderLineEditController', dialogConfig, {
            //    var dlg = dialogs.create('/Phoenix/modules/purchaseOrder/views/DialogPurchaseOrderLineEdit.html', 'PurchaseOrderLineEditController', dialogConfig, {
            //        key: false,
            //        back: 'static',
            //        windowClass: 'overlay'
            //    });
            //    dlg.result.then(function (resultModel) {
            //        var workOrderPurchaseLine = _.find(resultModel.polEntity.WorkOrderPurchaseOrderLines, function (item) { return item.Id == pol.Id; });
            //        $scope.workOrderPurchaseOrderLines[index].AmountCommited = workOrderPurchaseLine.AmountCommited;
            //        $scope.workOrderPurchaseOrderLines[index].AllocationNote = workOrderPurchaseLine.AllocationNote;
            //        // need to issue command to save just the updated workOrderPurchaseLine
            //        // and then update the UI to reflect the new values
            //    }, function () {

            //    });
            //});

        };

        $scope.lists.purchaseOrderStatuses = resolveCodeValueLists.purchaseOrderStatuses;
        $scope.lists.purchaseOrderInvoiceRestrictionsList = resolveCodeValueLists.purchaseOrderInvoiceRestrictionsList;
        $scope.lists.purchaseOrderDepletedActionList = resolveCodeValueLists.purchaseOrderDepletedActionList;
        $scope.lists.purchaseOrderDepletedOptionList = resolveCodeValueLists.purchaseOrderDepletedOptionList;
        $scope.lists.purchaseOrderDepletedGroupList = resolveCodeValueLists.purchaseOrderDepletedGroupList;
        $scope.lists.currencyList = resolveCodeValueLists.currencyList;
        $scope.OrganizationId = resolveAssignment.WorkOrders[$scope.model.WorkOrderIndex].WorkOrderVersions[0].BillingInfoes[0].OrganizationIdClient;
        //$scope.purchaseOrderLines = resolveAssignment.WorkOrders[1].WorkOrderPurchaseOrderLines;
    }

})(angular, Phoenix.App);