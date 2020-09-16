/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'PurchaseOrderEventHandlerController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,
        ['$scope', '$state', '$stateParams', 'dialogs', 'PurchaseOrderApiService', 'PurchaseOrderDataService', 'common', PurchaseOrderEventHandlerController]);

    function PurchaseOrderEventHandlerController($scope, $state, $stateParams, dialogs, PurchaseOrderApiService, PurchaseOrderDataService, common) {

        $scope.state = {
            create:
            {
                create: 'purchaseorder.create',
                details: 'purchaseorder.create.details',
                workorders: 'purchaseorder.create.workorders'
            },
            edit:
           {
               edit: 'purchaseorder.edit',
               details: 'purchaseorder.edit.details',
               workorders: 'purchaseorder.edit.workorders',
               changehistory: 'purchaseorder.edit.changehistory',
               documents: 'purchaseorder.edit.documents'
           }
        };

        $scope.tabNavigationGet = function (natTo, stateCurrentName) {
            var that = this;
            var stateToName = stateCurrentName;
            if (natTo == 'prev') {
                if (stateCurrentName == that.state.create.details || stateCurrentName == that.state.edit.details) { }

                else if (stateCurrentName == that.state.create.workorders) { stateToName = that.state.create.details; }
                else if (stateCurrentName == that.state.create.details) { stateToName = that.state.create.workorders; }

                else if (stateCurrentName == that.state.edit.documents) { stateToName = that.state.edit.changehistory; }
                else if (stateCurrentName == that.state.edit.changehistory) { stateToName = that.state.edit.workorders; }
                else if (stateCurrentName == that.state.edit.workorders) { stateToName = that.state.edit.details; }
                else if (stateCurrentName == that.state.edit.details) { stateToName = that.state.edit.documents; }

            } else if (natTo == 'next') {
                if (stateCurrentName == that.state.create.workorders || stateCurrentName == that.state.edit.documents) { }

                else if (stateCurrentName == that.state.create.details) { stateToName = that.state.create.workorders; }

                else if (stateCurrentName == that.state.edit.details) { stateToName = that.state.edit.workorders; }
                else if (stateCurrentName == that.state.edit.workorders) { stateToName = that.state.edit.changehistory; }
                else if (stateCurrentName == that.state.edit.changehistory) { stateToName = that.state.edit.documents; }
            }
            return stateToName;
        };

        $scope.tabNavigation = function (natTo) {
            $state.go($scope.tabNavigationGet(natTo, $state.current.name));
        };



        $scope.actionButton = {
            show: {
                save: false,
                submit: false,
                edit: false,
                discard: false,
                cancel: false,
                addLine: false,
                deleteLine: false,
            },
            showToRecalc: function () {
                var self = this;
                if ($scope.model.entity) {
                    self.show.save = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New;
                    self.show.submit = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.activeInEditMode;
                    self.show.edit = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Active && !$scope.model.activeInEditMode;
                    self.show.discard = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft;
                    self.show.cancel = $scope.model.activeInEditMode;
                    self.show.addLine = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.activeInEditMode;
                    self.show.deleteLine = $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.Draft || $scope.model.entity.StatusId == ApplicationConstants.PurchaseOrderStatus.New || $scope.model.activeInEditMode;
                } else {
                    self.show.save = false;
                    self.show.submit = false;
                    self.show.edit = false;
                    self.show.discard = false;
                    self.show.cancel = false;
                    self.show.addLine = false;
                    self.show.deleteLine = false;
                }
            },

            onClick: {
                edit: function () {
                    $scope.model.activeInEditMode = true;
                    $scope.actionButton.showToRecalc();
                },
                discard: function () {
                    var dlg = dialogs.confirm('Discard Purchase Order', 'This Purchase Order will be deleted. Continue?');
                    dlg.result.then(function (btn) {
                        var result = 'Confirmed';
                        $scope.model.ValidationMessages = [];
                        PurchaseOrderDataService.setValidationMessages([]);
                        var commandDiscard = { Id: $scope.model.entity.Id, LastModifiedDatetime: $scope.model.entity.getMaxLastModified(),  };
                        PurchaseOrderApiService.purchaseOrderDiscard(commandDiscard).then(
                            function (responseDiscard) {
                                common.logSuccess('Purchase Order Discarded', true);
                                $state.go('purchaseorder.search');
                            },
                            function (responseError) {
                                $scope.model.ValidationMessages = common.responseErrorMessages(responseError);
                                $scope.responseStateChange(responseError.data);
                            });
                    }, function (btn) {
                        var result = 'Not Confirmed';
                    });
                },
                cancel: function () {
                    var dlg = dialogs.confirm('Cancel Modifications', 'This Modifications will be Cancelled. Continue?');
                    dlg.result.then(function (btn) {
                        var result = 'Confirmed';
                        if ($scope.model.activeInEditMode) {
                            $scope.onLoad();
                            $state.transitionTo($state.current, angular.copy($stateParams), { reload: true, inherit: true, notify: true });
                        } else {
                            $scope.model.ValidationMessages = [];
                            PurchaseOrderDataService.setValidationMessages([]);
                            $state.go('purchaseorder.search');
                        }
                    }, function (btn) {
                        var result = 'Not Confirmed';
                    });
                }
            },

        };



        $scope.responseStateChange = function (response, purchaseOrderId) {
            if (response) {
                purchaseOrderId = purchaseOrderId || response.Id || 0;
            } else {
                purchaseOrderId = purchaseOrderId || 0;
            }
            if (response.ValidationMessages && response.ValidationMessages.length > 0) {
                $scope.model.ValidationMessages = response.ValidationMessages;
            }
            if (response.ValidationMessages && response.ValidationMessages.length > 0) {
                $scope.model.ValidationMessages = response.ValidationMessages;
            }

            if (response.ValidationMessages && response.ValidationMessages.length > 0) {
                PurchaseOrderDataService.setValidationMessages(response.ValidationMessages);
                $scope.model.ValidationMessages = response.ValidationMessages;
            }
            if (response.ValidationMessages && response.ValidationMessages.length > 0) {
                PurchaseOrderDataService.setValidationMessages(response.ValidationMessages);
                $scope.model.ValidationMessages = response.ValidationMessages;
            }

            if (purchaseOrderId > 0) {
                $state.go('purchaseorder.edit.details', { purchaseOrderId: purchaseOrderId });
                if ($stateParams.purchaseOrderId && $stateParams.purchaseOrderId == purchaseOrderId) {
                    $state.transitionTo($state.current, angular.copy($stateParams), { reload: true, inherit: true, notify: true });
                }
            } else {
                if (response) {
                    $scope.loadModel(response);
                }
            }
        };

    }

})(angular, Phoenix.App);