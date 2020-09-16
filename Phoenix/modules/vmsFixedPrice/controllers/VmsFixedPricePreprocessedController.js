﻿(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsFixedPricePreprocessedController', VmsFixedPricePreprocessedController);

    VmsFixedPricePreprocessedController.$inject = ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'dialogs', 'TransactionApiService', 'CodeValueService', '$stateParams', '$q', 'VmsApiService', 'WorkflowApiService', 'commonDataService'];

    function VmsFixedPricePreprocessedController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, dialogs, TransactionApiService, CodeValueService, $stateParams, $q, VmsApiService, WorkflowApiService, commonDataService) {

        $scope.$on('vmsPreprocessedDocumentChange', function (event, data) {
            if (data.entityTypeId == ApplicationConstants.EntityType.VmsFixedPriceImportedRecord) {
                $scope.documentPublicId = data.documentPublicId;
                $scope.lists = data.lists;
                $scope.callServer();
                getAvailableActions();
            }
        });

        getAvailableActions();

        function getVmsDocumentId() {
            var doc = _.filter($scope.lists.documentsList, function (i) {
                return i.Document.PublicId == $scope.documentPublicId;
            });
            return +(doc && doc.length && doc[0].VmsDocumentId);
        }

        function getAvailableActions() {
            $scope.availableActions = null;
            WorkflowApiService.getTasksAvailableActionsByTargetEntity(ApplicationConstants.EntityType.VmsDocument, getVmsDocumentId())
                .then(function (responseSucces) {
                    if (responseSucces instanceof Array && responseSucces.length > 0) {
                        var availableActions = responseSucces[0];
                        if (availableActions.WorkflowAvailableActions) {
                            var actionsPreprocess = _.filter(availableActions.WorkflowAvailableActions,
                                function (i) { return ApplicationConstants.TaskResult.VmsDocumentPreprocessFile == i.TaskResultId; });
                            var actionsDiscard = _.filter(availableActions.WorkflowAvailableActions,
                                function (i) { return ApplicationConstants.TaskResult.VmsDocumentDiscardFile == i.TaskResultId; });
                            if (actionsPreprocess.length > 0 && actionsDiscard.length > 0) {
                                $scope.availableActions = availableActions;
                            }
                        }
                    }
                },
                    function (err) {
                    });
        }

        function buildPromise(tableState, isTruncated) {
            if ($scope.documentPublicId) {
                var oDataParams = oreq.request().url();
                return VmsApiService.getVmsFixedPriceImportedRecordsTable($scope.documentPublicId, oDataParams, tableState);
            }
            else {
                return $q.reject();
            }
        }

        // Used for the loading bar
        $scope.loadItemsPromise = null;

        // Reloading data entry point
        $scope.callServer = function (tableState) {

            angular.element("table[data-st-table='items'] tbody").scrollTop(0);
            if (!tableState) {
                tableState = {};
            }
            if (!tableState.pagination) {
                tableState.pagination = {};
            }
            tableState.pagination.currentPage = $scope.currentPage;
            tableState.pagination.pageSize = $scope.pageSize;
            tableState.pagination.isDisabled = $scope.isDisabled;

            $scope.tableState = tableState;

            $scope.processing = true;
            var promise = buildPromise(tableState)
                .then(function (response) {
                    $scope.totalItemCount = response.Count;
                    $scope.items = response.Items;
                    calculateTotals(response.Items);
                }).finally(function () {
                    $scope.processing = false;
                });

        };

        $scope.markAsProcess = function (entity) {
            $scope.processing = true;
            VmsApiService.vmsFixedPriceImportRecordTypeUpdate({ LastModifiedDatetime: entity.LastModifiedDatetime, Id: entity.Id, VmsFixedPriceImportedRecordTypeIdFinal: ApplicationConstants.VmsFixedPriceImportedRecordType.ToProcess }).then(function (response) {
                var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                if (record) {
                    record.VmsFixedPriceImportedRecordTypeIdFinal = ApplicationConstants.VmsFixedPriceImportedRecordType.ToProcess;
                    updateRecords(record);
                }
            }, function (error) { }).finally(function () {
                $scope.processing = false;
            });
        };

        $scope.markAsConflict = function (entity) {
            var dlg = dialogs.create('/Phoenix/modules/vms/views/VmsConflictReason.html', 'VmsConflictReasonController',
                {
                    recordType: ApplicationConstants.VmsFixedPriceImportedRecordType.Conflict,
                }, {});

            dlg.result.then(function (reason) {
                $scope.processing = true;
                VmsApiService.vmsFixedPriceImportRecordTypeUpdate(
                    {
                        Id: entity.Id,
                        LastModifiedDatetime: entity.LastModifiedDatetime,
                        VmsFixedPriceImportedRecordTypeIdFinal: ApplicationConstants.VmsFixedPriceImportedRecordType.Conflict,
                        UserNotes: reason
                    }
                )
                    .then(function (response) {
                        var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                        if (record) {
                            record.VmsFixedPriceImportedRecordTypeIdFinal = ApplicationConstants.VmsFixedPriceImportedRecordType.Conflict;
                            record.Reason = reason;
                            updateRecords(record);
                        }
                    }, function (error) { }).finally(function () {
                        $scope.processing = false;
                    });
            }, function () {
            });
        };

        $scope.markAsDiscarded = function (entity) {
            var dlg = dialogs.create('/Phoenix/modules/vms/views/VmsConflictReason.html', 'VmsConflictReasonController', {
                recordType: ApplicationConstants.VmsFixedPriceImportedRecordType.Discarded,
            }, {});

            dlg.result.then(function (reason) {

                $scope.processing = true;
                VmsApiService.vmsFixedPriceImportRecordTypeUpdate(
                    {
                        Id: entity.Id,
                        LastModifiedDatetime: entity.LastModifiedDatetime,
                        VmsFixedPriceImportedRecordTypeIdFinal: ApplicationConstants.VmsFixedPriceImportedRecordType.Discarded,
                        UserNotes: reason
                    }
                )
                    .then(function (response) {
                        var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                        if (record) {
                            record.VmsFixedPriceImportedRecordTypeIdFinal = ApplicationConstants.VmsFixedPriceImportedRecordType.Discarded;
                            record.Reason = reason;
                            updateRecords(record);
                        }
                    }, function (error) { }).finally(function () {
                        $scope.processing = false;
                    });

            }, function () {
            });
        };

        var updateRecords = function (record) {
            var remove = false;
            if ($scope.tableState.search && $scope.tableState.search.predicateObject) {
                if (!remove && $scope.tableState.search.predicateObject.VmsFixedPriceImportedRecordTypeIdFinal) {
                    if ($scope.tableState.search.predicateObject.VmsFixedPriceImportedRecordTypeIdFinal.indexOf(record.VmsFixedPriceImportedRecordTypeIdFinal) == -1) {
                        remove = true;
                    }
                }
                if (!remove && $scope.tableState.search.predicateObject.Reason) {
                    if (record.Reason.indexOf($scope.tableState.search.predicateObject.Reason) == -1) {
                        remove = true;
                    }
                }
            }
            if (remove) {
                $scope.items.splice($scope.items.map(function (x) { return x.Id; }).indexOf(record.Id), 1);
                $scope.totalItemCount--;
            }
            else {
                VmsApiService.getVmsFixedPriceImportedRecord(record.Id).then(
                    function (response) {
                        record.LastModifiedDatetime = response.Queryable[0].LastModifiedDatetime;
                    },
                    function (error) {
                    });
            }

            calculateTotals($scope.items);
        };

        $scope.processFile = function (documentPublicId) {
            if (+$scope.totalPending + $scope.totalConflict != 0) {
                if ($scope.availableActions) {
                    $scope.processing = true;
                    var vmsDocumentId = getVmsDocumentId();
                    var actions = _.filter($scope.availableActions.WorkflowAvailableActions,
                        function (i) { return ApplicationConstants.TaskResult.VmsDocumentPreprocessFile == i.TaskResultId; });
                    var action = (actions.length > 0 && actions[0]) || {};
                    WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.VmsDocument, vmsDocumentId)
                        .then(
                            function (responseSucces) {
                                removeDocument(documentPublicId);
                            },
                            function (responseError) {
                                $scope.processing = false;
                            });
                }
            }
            else if ($scope.totalDiscarded != 0) {
                dialogs.notify('File cannot be pre-processed', 'The file cannot be pre-processed because all the records are discarded.', { keyboard: false, backdrop: 'static' });
            }
        };

        $scope.rejectFile = function (documentPublicId) {
            dialogs.confirm('Reject File', 'Are you sure you want to reject this file?').result.then(function () {
                if ($scope.availableActions) {
                    $scope.processing = true;
                    var actions = _.filter($scope.availableActions.WorkflowAvailableActions,
                        function (i) { return ApplicationConstants.TaskResult.VmsDocumentDiscardFile == i.TaskResultId; });
                    var action = (actions.length > 0 && actions[0]) || {};
                    WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.VmsDocument, getVmsDocumentId())
                        .then(
                            function (responseSucces) {
                                removeDocument(documentPublicId);
                            },
                            function (responseError) {
                                $scope.processing = false;
                            });
                }

            }, function () {
                $scope.processing = false;
            });

        };

        var removeDocument = function (documentPublicId) {
            var vmsDocumentId = getVmsDocumentId();
            $scope.documentPublicId = undefined;
            $scope.items = [];
            $scope.totalItemCount = 0;
            $scope.tableState.pagination.start = 0;
            $scope.processing = false;

            $rootScope.$broadcast('vmsPreprocessedDocumentRemove', {
                documentPublicId: documentPublicId,
                entityType: ApplicationConstants.EntityType.VmsDocument,
                vmsDocumentId: vmsDocumentId,
            });
        };

        var calculateTotals = function (items) {
            var oDataParams = oreq.request()
                .withSelect(['VmsDocumentId', 'DocumentPublicId', 'TotalPending', 'TotalConflict', 'TotalDiscarded'])
                .withFilter(oreq.filter("DocumentPublicId").eq("guid'" + $scope.documentPublicId + "'"))
                .url();
            TransactionApiService.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(
                $stateParams.organizationIdInternal, $stateParams.organizationIdClient, oDataParams)
                .then(
                    function (response) {
                        if (response.Items && response.Items.length) {
                            var item = response.Items[0];
                            $scope.totalPending = item.TotalPending;
                            $scope.totalConflict = item.TotalConflict;
                            $scope.totalDiscarded = item.TotalDiscarded;
                        } else {
                        }
                    },
                    function (responseError) {
                    });
        };

    }

})(angular);