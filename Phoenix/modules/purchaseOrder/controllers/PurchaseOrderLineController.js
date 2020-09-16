(function (app) {
    'use strict';
    var controllerId = 'PurchaseOrderLineController';
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,
    ['$rootScope', '$scope', '$q', '$state', 'dialogs', 'common', 'purchaseOrder', 'purchaseOrderLine', 'PurchaseOrderApiService', 'AssignmentApiService', 'AssignmentDataService', PurchaseOrderLineController]);

    function PurchaseOrderLineController($rootScope, $scope, $q, $state, dialogs, common, purchaseOrder, purchaseOrderLine, PurchaseOrderApiService, AssignmentApiService, AssignmentDataService) {

        common.setControllerName(controllerId);

        $scope.floatApplyTwoDecimalPlaces = function (c) {
            return common.floatApplyTwoDecimalPlaces(c);
        };

        $scope.hasPendingRequests = false;
        $scope.model = purchaseOrder;
        $scope.model.activeInEditMode = true;
        $scope.model.ValidationMessages = [];

        $scope.purchaseOrderEvents = [];
        var onPOStateChange = function (event, toState, toParams, fromState, fromParams) {
            if (angular.equals($scope.model.polEntity, $scope.initialPoLine))
                return;

            var dlg = dialogs.confirm('Warning', 'Moving away from this page will cause unsaved changes to be lost. Do you want to continue?');
            dlg.result.then(function (btn) {
                $scope.unbindPurchaseOrderEvents('statePOChangeWatchOff');
                $rootScope.activateGlobalSpinner = false;
                $state.transitionTo(toState.name, angular.copy(toParams), { reload: true, inherit: true, notify: true });
                return;
            }, function (btn) {
                $rootScope.activateGlobalSpinner = false;
                event.preventDefault();
                return;
            });
            event.preventDefault();
            return;
        };

        var statePOChangeWatchOff = $scope.$on('$stateChangeStart', onPOStateChange);
        $scope.purchaseOrderEvents.push({ name: 'statePOChangeWatchOff', event: statePOChangeWatchOff });
        $scope.unbindPurchaseOrderEvents = function (unbindPurchaseOrderEventName) {
            angular.forEach($scope.purchaseOrderEvents, function (e) {
                if (unbindPurchaseOrderEventName) {
                    if (unbindPurchaseOrderEventName == e.name) {
                        e.event();
                    }
                } else {
                    e.event();
                }
            });
        };
        $scope.$on("$destroy", function () {
            $scope.unbindPurchaseOrderEvents();
        });

        $scope.ptFieldViewEventOnChangeStatusId = function (modelPrefix, fieldName) {
            if ($state.includes('assignment')) {
                if (modelPrefix == "workOrderPurchaseOrderLine" && (fieldName == "AmountCommited" || fieldName == "AllocationNote"))
                    return ApplicationConstants.viewStatuses.edit;
                else
                    return ApplicationConstants.viewStatuses.view;
            } else {
                if (modelPrefix == 'model.entity' && fieldName == 'OrganizationId') {
                    if ($scope.model.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft) {
                        return ApplicationConstants.viewStatuses.edit;
                    } else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                }
                if ($scope.model.activeInEditMode || $scope.model.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft) {
                    return ApplicationConstants.viewStatuses.edit;
                } else {
                    return ApplicationConstants.viewStatuses.view;
                }
                return ApplicationConstants.viewStatuses.view;
            }
        };

        $scope.model.ptFieldViewConfigOnChangeStatusId = { funcToCheckViewStatus: 'ptFieldViewEventOnChangeStatusId', watchChangeEvent: '[model.StatusId, model.activeInEditMode]', funcToPassMessages: 'ptFieldViewMessages' };

        angular.forEach(purchaseOrderLine.WorkOrderPurchaseOrderLines, function (item) {

            AssignmentApiService.getByWorkOrderId(item.WorkOrderId,
                oreq.request()
                .withExpand(['WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates'])
                .withSelect([
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Id',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/Rate',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateTypeId',
                    'WorkOrders/WorkOrderVersions/BillingInfoes/BillingRates/RateUnitId'
                ]).url()).then(
                function (responseSuccess) {
                    item.rate = responseSuccess.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates[0].Rate;
                    switch (responseSuccess.WorkOrders[0].WorkOrderVersions[0].BillingInfoes[0].BillingRates[0].RateUnitId) {
                        case ApplicationConstants.RateUnit.Hour:
                            item.workunit = "H";
                            break;
                        case ApplicationConstants.RateUnit.Day:
                            item.workunit = "D";
                            break;
                        case ApplicationConstants.RateUnit.Fixed:
                            item.workunit = "F";
                            break;
                        default:
                            item.workunit = "?";
                    }
                },
                function (responseError) {
                    common.responseErrorMessages(responseError);
                });
        });

        $scope.model.polEntity = angular.copy(purchaseOrderLine);
        $scope.initialPoLine = angular.copy(purchaseOrderLine);        

        $scope.cancel = function (cancelledPo) {
            if (cancelledPo.Id < 0 && !cancelledPo.SavedOnce) {
                purchaseOrder.PurchaseOrderLines.pop();
            } else {
                cancelledPo.SavedOnce = true;
            }
            $scope.model.ValidationMessages.length = 0;
            $scope.model.polEntity = angular.copy(cancelledPo);
            $scope.initialPoLine = angular.copy(cancelledPo);
            $state.go('^');
        };

        function getUpdatedWorkOrderAssociations(submittedPoLine, initialPoLine) {
            var results = [];
            angular.forEach(submittedPoLine.WorkOrderPurchaseOrderLines, function (item) {
                var initial = _.find(initialPoLine.WorkOrderPurchaseOrderLines, function (i) { return i.WorkOrderId == item.WorkOrderId; });
                var update = {
                    AmountCommited: parseFloat(item.AmountCommited),
                    PurchaseOrderId: $scope.model.Id,
                    Id: item.Id,
                    AllocationNote: item.AllocationNote,
                    WorkOrderId: parseFloat(item.WorkOrderId)
                };
                results.push(update);
            });
            return results;
        }

        function savePurchaseOrderLine(savedPoLine) {
            if ($scope.model.IsDraft === false) {
                if (!savedPoLine.validate($scope.model.ValidationMessages)) {
                    return;
                }
                var updateCommand =
                {
                    PurchaseOrderId: $scope.model.Id,
                    Id: (savedPoLine.Id < 0) ? 0 : savedPoLine.Id,
                    StartDate: null,
                    EndDate: null,
                    IsTaxIncluded: savedPoLine.IsTaxIncluded,
                    Amount: savedPoLine.Amount,
                    CurrencyId: savedPoLine.CurrencyId,
                    PurchaseOrderLineNumber: savedPoLine.PurchaseOrderLineNumber,
                    Description: savedPoLine.Description,
                    PurchaseOrderLineReference: savedPoLine.PurchaseOrderLineReference,
                    DepletionOptionId: savedPoLine.DepletionOptionId,
                    DepletionGroupId: savedPoLine.DepletionGroupId,
                    WorkOrderPurchaseOrderLines: getUpdatedWorkOrderAssociations(savedPoLine, $scope.initialPoLine),
                    LastModifiedDatetime: $scope.model.getMaxLastModified(),
                };
                PurchaseOrderApiService.purchaseOrderLineSave(updateCommand).then(function (response) {
                    if (response.IsValid) {
                        return PurchaseOrderApiService.getByPurchaseOrderLineId(response.EntityId,
                            oreq.request()
                            .withExpand(['WorkOrderPurchaseOrderLines'])
                            .withSelect([
                                'Id',
                                'StatusId',
                                'PurchaseOrderId',
                                'PurchaseOrderLineNumber',
                                'PurchaseOrderLineReference',
                                'StartDate',
                                'EndDate',
                                'Amount',
                                'CurrencyId',
                                'IsTaxIncluded',
                                'DepletionOptionId',
                                'DepletionGroupId',
                                'Description',
                                'IsDraft',
                                'WorkOrderPurchaseOrderLines',
                                'LastModifiedDatetime',
                            ]).url()).then(
                            function (responseSuccess) {
                                var responsePo = {};
                                // Pull only the last result (should only be one).
                                _.each(responseSuccess.Items, function (pol) {
                                    responsePo = {
                                        Id: pol.Id,
                                        StartDate: pol.StartDate,
                                        StatusId: pol.StatusId,
                                        EndDate: pol.EndDate,
                                        PurchaseOrderId: pol.PurchaseOrderId,
                                        PurchaseOrderLineNumber: pol.PurchaseOrderLineNumber,
                                        PurchaseOrderLineReference: pol.PurchaseOrderLineReference,
                                        CurrencyId: pol.CurrencyId,
                                        IsTaxIncluded: pol.IsTaxIncluded,
                                        DepletionOptionId: pol.DepletionOptionId,
                                        DepletionGroupId: pol.DepletionGroupId,
                                        Description: pol.Description,
                                        IsDraft: pol.IsDraft,
                                        Amount: pol.Amount,
                                        WorkOrderPurchaseOrderLines: pol.WorkOrderPurchaseOrderLines,
                                        //CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id == pol.CurrencyId; }).code,
                                        //PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id == pol.StatusId; }).code
                                        LastModifiedDatetime: pol.LastModifiedDatetime,
                                    };
                                });

                                angular.extend(purchaseOrderLine, responsePo);
                                $scope.model.polEntity = angular.copy(purchaseOrderLine);
                                $scope.initialPoLine = angular.copy(purchaseOrderLine);

                                if ($scope.modelOriginal && $scope.modelOriginal.PurchaseOrderLines){
                                    for (var l = 0; l < $scope.modelOriginal.PurchaseOrderLines.length; l++)
                                    {
                                        if ($scope.modelOriginal.PurchaseOrderLines[l].Id == purchaseOrderLine.Id) {
                                            $scope.modelOriginal.PurchaseOrderLines[l] = angular.copy(purchaseOrderLine);
                                        }
                                    }
                                }

                                common.logSuccess('Purchase Order Line Saved');
                                $state.go('^');

                            },
                            function (responseError) {
                                common.responseErrorMessages(responseError);
                            });
                    } else {
                        angular.forEach(response.ValidationMessages, function (msg) {
                            $scope.model.ValidationMessages.push(msg);
                        });
                    }
                    return response;
                });
            } else {
                savedPoLine.SavedOnce = true;
                angular.extend(purchaseOrderLine, savedPoLine);
                $scope.model.polEntity = angular.copy(purchaseOrderLine);
                $scope.initialPoLine = angular.copy(purchaseOrderLine);                
                $state.go('^');
            }
            return;
        }


        function saveWorkOrderAssoications(savedPoLine) {
            if (!savedPoLine.validate($scope.model.ValidationMessages)) {
                return;
            }

            $scope.hasPendingRequests = true;
            var updateCommand =
                {
                    PurchaseOrderId: $scope.model.Id,
                    Id: (savedPoLine.Id < 0) ? 0 : savedPoLine.Id,
                    StartDate: null,
                    EndDate: null,
                    IsTaxIncluded: savedPoLine.IsTaxIncluded,
                    Amount: savedPoLine.Amount,
                    CurrencyId: savedPoLine.CurrencyId,
                    PurchaseOrderLineNumber: savedPoLine.PurchaseOrderLineNumber,
                    Description: savedPoLine.Description,
                    PurchaseOrderLineReference: savedPoLine.PurchaseOrderLineReference,
                    DepletionOptionId: savedPoLine.DepletionOptionId,
                    DepletionGroupId: savedPoLine.DepletionGroupId,
                    WorkOrderPurchaseOrderLines: getUpdatedWorkOrderAssociations(savedPoLine, $scope.initialPoLine),
                    LastModifiedDatetime: $scope.model.getMaxLastModified(), //savedPoLine.LastModifiedDatetime,
                };

            PurchaseOrderApiService.purchaseOrderLineSave(updateCommand).then(function (results) {
                PurchaseOrderApiService.getWorkOrderPurchaseOrderLinesByWorkOrderId($state.params.workOrderId,
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
                            'AmountReserved']
                        ).url())
                    .then(
                    function (responseSuccess) {
                        var response = { Items: [] };
                        _.each(responseSuccess.Items, function (item) {
                            response.Items.push({
                                Id: item.Id,
                                PurchaseOrderDepletionGroupId: item.PurchaseOrderDepletionGroupId,
                                StartDate: item.PurchaseOrderLineStartDate,
                                EndDate: item.PurchaseOrderLineEndDate,
                                PurchaseOrderId: item.PurchaseOrderId,
                                PurchaseOrderNumber: item.PurchaseOrderNumber,
                                PurchaseOrderLineId: item.PurchaseOrderLineId,
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


                        $scope.hasPendingRequests = false;
                        //$rootScope.$broadcast('updatePurchaseOrderLines', response.Items);
                        $scope.initialPoLine = angular.copy($scope.model.polEntity);

                        $state.go('^');
                        common.logSuccess('Purchase Order Work Order Association Updated');
                    }, function (error) {
                        console.log(error);
                    });
                /*
                 * ["catch"](function () { // IE8 problem
                        $scope.hasPendingRequests = false;
                    }
                 * 
                 */
            }, function (error) {
                console.log(error);
            });
        }

        $scope.save = function (savedPoLine) {
            $scope.model.ValidationMessages.length = 0;
            if ($state.includes('workorder')) {
                saveWorkOrderAssoications(savedPoLine);
            } else if ($state.includes('purchaseorder')) {
                savePurchaseOrderLine(savedPoLine);
            } else {
                console.log("PurchaseOrderLineController $scope.save does not support this $state");
            }

            if ($state.includes('workorder') || $state.includes('purchaseorder')) {
                var changeHistoryModel = AssignmentDataService.getChangeHistoryModel(ApplicationConstants.EntityType.PurchaseOrder);
                if (common.isEmptyObject(changeHistoryModel) || changeHistoryModel.entityId == savedPoLine.PurchaseOrderId) {
                    AssignmentDataService.setChangeHistoryModel(ApplicationConstants.EntityType.PurchaseOrder, {});
                }
            }
        };
    }

})(Phoenix.App);