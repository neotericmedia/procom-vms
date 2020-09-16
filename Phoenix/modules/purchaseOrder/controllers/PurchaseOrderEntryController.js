/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';
    var controllerId = 'PurchaseOrderEntryController';
    angular.module('phoenix.purchaseOrder.controllers').controller(controllerId,
        ['$scope', '$rootScope' ,'$q', '$state', '$stateParams', '$timeout', '$filter', 'dialogs', '$controller', 'NavigationService', 'common', 'purchaseOrder', 'purchaseOrderLists', 'listOrganizationClient', 'PurchaseOrderApiService', 'AssignmentApiService', 'AssignmentDataService', 'phxLocalizationService', PurchaseOrderEntryController]);

    function PurchaseOrderEntryController($scope, $rootScope ,$q, $state, $stateParams, $timeout, $filter, dialogs, $controller, NavigationService, common, purchaseOrder, purchaseOrderLists, listOrganizationClient, PurchaseOrderApiService, AssignmentApiService, AssignmentDataService, phxLocalizationService) {

        common.setControllerName(controllerId);

        $scope.model = {
            entity: purchaseOrder,
            activeInEditMode: false,
            cultureId: 48,
            changeHistoryBlackList: [
                { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
                { TableSchemaName: '', TableName: '', ColumnName: 'WorkOrderId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'PurchaseOrderId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'PurchaseOrderLineId' },

                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },

                { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
                { TableSchemaName: '', TableName: '', ColumnName: 'StatusId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
                { TableSchemaName: 'po', TableName: 'PurchaseOrderLine', ColumnName: 'StartDate' },
                { TableSchemaName: 'po', TableName: 'PurchaseOrderLine', ColumnName: 'EndDate' },
                { TableSchemaName: 'workorder', TableName: 'WorkOrder', ColumnName: 'WorkOrderVersion' }]
        };
        $scope.model.ValidationMessages = [];

        // track changes
        $scope.purchaseOrderEvents = [];
        $scope.modelOriginal = angular.copy(purchaseOrder);

        $scope.purchaseOrderEvents.push({ name: 'stateChangeWatchOff', event: $scope.$on('$stateChangeStart', onStateChange) });

        if ($state.includes('purchaseorder.edit')) {
            NavigationService.setTitle('purchaseorder-viewedit', [purchaseOrder.PurchaseOrderNumber]);
        } else if ($state.includes('purchaseorder.create')) {
            NavigationService.setTitle('purchaseorder-viewedit', [phxLocalizationService.translate('common.generic.new')]);
        }

        $controller('PurchaseOrderEventHandlerController', { $scope: $scope });
        $scope.actionButton.showToRecalc();

        //// initialize lists
        $scope.lists = purchaseOrderLists;
        $scope.lists.listOrganizationClient = listOrganizationClient;

        $scope.purchaseOrderLineOpen = function (pol, option) {
            if (!$state.includes('purchaseorder.edit.details.line') && !$state.includes('purchaseorder.create.details.line')) {
                if (pol && pol.Id && pol.Id > 0) {
                    $state.go('.line', { purchaseOrderLineId: pol.Id });
                }
            }
        };

        $scope.addLine = function (purchaseOrder) {
            if (!$state.includes('purchaseorder.edit.details.line') && !$state.includes('purchaseorder.create.details.line')) {
                var newLine = purchaseOrder.addLine();
                $state.go('.line', { purchaseOrderLineId: newLine.Id });
            }
        };

        function savePo(po) {
            var commandSave = po;

            // use max modified date for concurrency
            commandSave.LastModifiedDatetime = po.getMaxLastModified();

            return PurchaseOrderApiService.purchaseOrderSave(commandSave).then(function (response) {
                if (response.IsValid) {
                    var changeHistoryModel = AssignmentDataService.getChangeHistoryModel(ApplicationConstants.EntityType.PurchaseOrder);
                    if (common.isEmptyObject(changeHistoryModel) || changeHistoryModel.entityId == po.Id) {
                        AssignmentDataService.setChangeHistoryModel(ApplicationConstants.EntityType.PurchaseOrder, {});
                    }
                    return response;
                } else {
                    return $q.reject(response);
                }

            })["catch"](function (r) { // IE8 problem
                console.log("If I catch R here, does it go there?", r);
                return $q.reject(r);
            });
        }

        $scope.save = function (po) {
            return savePo(po).then(function successCb(response) {
                if (response.IsValid) {
                    common.logSuccess('Purchase Order Saved');
                    $state.transitionTo('purchaseorder.edit.details', { purchaseOrderId: response.EntityId }, { reload: true });
                } else {
                    $q.reject(response);
                }
            })["catch"](function (r) { // IE8 problem
                var messages = (r.data && r.data.ValidationMessages) ? r.data.ValidationMessages : r.ValidationMessages;
                $scope.model.ValidationMessages.length = 0;
                angular.forEach(messages, function (msg) {
                    $scope.model.ValidationMessages.push(msg);
                });
            });
        };

        $scope.submit = function (po) {
            savePo(po).then(function (response) {
                // retrieve updated purchase order
                return PurchaseOrderApiService.getByPurchaseOrderId(response.EntityId);
            }).then(function(response){
                po.LastModifiedDatetime = response.LastModifiedDatetime;
                var submitCommand = { Id: response.Id, LastModifiedDatetime: po.getMaxLastModified() };
                return PurchaseOrderApiService.purchaseOrderSubmit(submitCommand);
            }).then(function (response) {
                if (response.IsValid) {
                    common.logSuccess('Purchase Order Submitted');
                    $state.transitionTo('purchaseorder.edit.details', { purchaseOrderId: response.EntityId }, { reload: true });
                } else {

                }
            })["catch"](function (r) { // IE8 problem
                var messages = (r.ValidationMessages);
                $scope.model.ValidationMessages.length = 0;
                angular.forEach(messages, function (msg) {
                    $scope.model.ValidationMessages.push(msg);
                });
            });

        };

        $scope.onLoad = function () {
            console.log("What do I need to load?");
        };


        $scope.removeLine = function (pol) {
            var dlg = dialogs.confirm('Delete Line', 'This Line will be Deleted. Continue?');
            dlg.result.then(function (btn) {
                var result = 'Confirmed';
                var index = $scope.model.entity.PurchaseOrderLines.indexOf(pol);
                if (index >= 0) $scope.model.entity.PurchaseOrderLines.splice(index, 1);
                if (!$scope.model.entity.__deletedPurchaseOrderLines){
                    $scope.model.entity.__deletedPurchaseOrderLines = [];
                }
                $scope.model.entity.__deletedPurchaseOrderLines.push(pol.LastModifiedDatetime);
            }, function (btn) {
                var result = 'Not Confirmed';
            });
        };

        $controller('PurchaseOrderFieldsAccessibilityController', { $scope: $scope });
        $controller('PurchaseOrderDocumetsController', { $scope: $scope });

        // <warn on changes>
        function onStateChange(event, toState, toParams, fromState, fromParams) {
            if (fromState.name.indexOf("purchaseorder") > -1 &&
                toState.name.indexOf('purchaseorder') > -1 &&
                toState.name.indexOf('purchaseorder.search') == -1) return;
            var stateParamsDifferences = common.findDiff(fromParams, toParams, []);
            if (stateParamsDifferences.length === 0) {
                return;
            } else {
                var entityDifferences = common.findDiff($scope.modelOriginal, $scope.model.entity,
                    [{ name: 'ExcludeMe' }, { name: 'ExcludeMeToo' }]
                    );
                if (entityDifferences.length === 0) {
                    return;
                }
            }

            $rootScope.$broadcast('broadcastEvent:hideloading');

            var dlg = dialogs.confirm('Warning', 'Moving away from this page will cause unsaved changes to be lost. Do you want to continue?');
            dlg.result.then(function (btn) {
                //  Confirmed
                $rootScope.activateGlobalSpinner = false;
                $scope.unbindPurchaseOrderEvents('stateChangeWatchOff');
                $state.transitionTo(toState.name, angular.copy(toParams));
                return;
            }, function (btn) {
                //  Not Confirmed
                $rootScope.activateGlobalSpinner = false;
                event.preventDefault();
                return;
            });
            event.preventDefault();
            return;
        }

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

        $scope.scopeApply = function () {
            setTimeout(function () {
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    common.scopeApply($scope);
                }
            });
        };

        $scope.formValid = {
            poDetails: false
        };
        $scope.$watch('entityForm.formPurchaseOrderDetails.$valid', function () {
            if ($scope.entityForm.formPurchaseOrderDetails) {
                $scope.formValid.poDetails = $scope.entityForm.formPurchaseOrderDetails.$valid;
            }
        });
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.PurchaseOrderEntryController = {

        purchaseOrder: ['$q', '$stateParams', 'PurchaseOrderApiService', 'AssignmentApiService', 'PurchaseOrderLineModel', 'PurchaseOrderModel', function ($q, $stateParams, PurchaseOrderApiService, AssignmentApiService, PurchaseOrderLineModel, PurchaseOrderModel) {
            var poLineDefaults = AssignmentApiService.getDefaultWorkOrderPurchaseOrderLine()
                .then(function (poLineDefaults) {
                    return poLineDefaults;
                });

            var po = PurchaseOrderApiService.getByPurchaseOrderId($stateParams.purchaseOrderId)
                .then(function (po) {
                    return po;
                });

            return $q.all([po, poLineDefaults]).then(function (results) {
                var purchaseOrder = results[0];
                PurchaseOrderModel.mixInto(purchaseOrder);
                angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                    PurchaseOrderLineModel.mixInto(line);
                });
                purchaseOrder.purchaseOrderLineDefaults = results[1];
                PurchaseOrderLineModel.mixInto(purchaseOrder.purchaseOrderLineDefaults);
                return purchaseOrder;

            });
        }],
        listOrganizationClient: ['OrgApiService', '$q', function (OrgApiService, $q) {
            var deferred = $q.defer();
            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) { deferred.resolve([]); }
                );
            return deferred.promise;
        }],
    };



    app.resolve.PurchaseOrderCreateController = {
        purchaseOrder: ['$stateParams', 'PurchaseOrderApiService', 'AssignmentApiService', 'PurchaseOrderModel', 'PurchaseOrderLineModel', '$q', function ($stateParams, PurchaseOrderApiService, AssignmentApiService, PurchaseOrderModel, PurchaseOrderLineModel, $q) {
            var poLineDefaults = AssignmentApiService.getDefaultWorkOrderPurchaseOrderLine()
                .then(function (poLineDefaults) {
                    return poLineDefaults;
                });
            var poDefault = PurchaseOrderApiService.getDefault().then(function (response) {
                response.PurchaseOrderLines = [];
                return response;
            });

            return $q.all([poDefault, poLineDefaults]).then(function (results) {
                var purchaseOrder = results[0];
                PurchaseOrderModel.mixInto(purchaseOrder);
                angular.forEach(purchaseOrder.PurchaseOrderLines, function (line) {
                    PurchaseOrderLineModel.mixInto(line);
                });
                purchaseOrder.purchaseOrderLineDefaults = results[1];
                PurchaseOrderLineModel.mixInto(purchaseOrder.purchaseOrderLineDefaults);
                return purchaseOrder;
            });

        }],
        listOrganizationClient: ['OrgApiService', function (OrgApiService) {
            return OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().then(
                function (responseSuccess) {
                    return responseSuccess && responseSuccess.Items ? responseSuccess.Items : [];
                });
        }],
    };





})(angular, Phoenix.App);