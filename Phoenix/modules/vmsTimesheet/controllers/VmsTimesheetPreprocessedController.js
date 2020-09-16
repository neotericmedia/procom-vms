(function (angular) {
    'use strict';

    var controllerId = 'VmsTimesheetPreprocessedController';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetPreprocessedController', VmsTimesheetPreprocessedController);

    VmsTimesheetPreprocessedController.$inject = ['$rootScope', '$scope', '$sce', '$state', 'common', 'config', '$filter', '$timeout', 'NavigationService', 'dialogs', 'TransactionApiService', 'CodeValueService', '$stateParams', '$q', 'WorkflowApiService', 'commonDataService'];

    function VmsTimesheetPreprocessedController($rootScope, $scope, $sce, $state, common, config, $filter, $timeout, NavigationService, dialogs, TransactionApiService, CodeValueService, $stateParams, $q, WorkflowApiService, commonDataService) {

        $scope.$on('vmsPreprocessedDocumentChange', function (event, data) {
            if (data.entityTypeId == ApplicationConstants.EntityType.VmsImportedRecord) {
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
                var oDataParams = oreq.request()
                    .withSelect([
                        'Id',
                        'WorkOrderReference',
                        'FirstName',
                        'LastName',
                        'V1RateTypeId',
                        'V1BillRate',
                        'V1BillUnits',
                        'V2RateTypeId',
                        'V2BillRate',
                        'V2BillUnits',
                        'StartDate',
                        'EndDate',
                        'InvoiceReference',
                        'VmsImportedRecordTypeIdInitial',
                        'VmsImportedRecordTypeIdFinal',
                        'Reason',
                        'UploadedDatetime',
                        'LastModifiedDatetime'
                    ]).url();
                return TransactionApiService.getVmsTimesheetImportedRecordsTable($scope.documentPublicId, oDataParams, tableState);

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
            TransactionApiService.vmsTimesheetImportRecordTypeUpdate({ LastModifiedDatetime: entity.LastModifiedDatetime, Id: entity.Id, VmsImportedRecordTypeIdFinal: ApplicationConstants.VmsImportedRecordType.ToProcess }).then(function (response) {
                var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                if (record) {
                    record.VmsImportedRecordTypeIdFinal = ApplicationConstants.VmsImportedRecordType.ToProcess;
                    updateRecords(record);
                }
            }, function (error) { }).finally(function () {
                $scope.processing = false;
            });
        };

        $scope.markAsConflict = function (entity) {
            var dlg = dialogs.create('/Phoenix/modules/vms/views/VmsConflictReason.html', 'VmsConflictReasonController', {
                recordType: ApplicationConstants.VmsImportedRecordType.Conflict,
            }, {});

            dlg.result.then(function (reason) {
                $scope.processing = true;
                TransactionApiService.vmsTimesheetImportRecordTypeUpdate(
                    {
                        Id: entity.Id,
                        LastModifiedDatetime: entity.LastModifiedDatetime,
                        VmsImportedRecordTypeIdFinal: ApplicationConstants.VmsImportedRecordType.Conflict,
                        UserNotes: reason
                    })
                    .then(function (response) {
                        var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                        if (record) {
                            record.VmsImportedRecordTypeIdFinal = ApplicationConstants.VmsImportedRecordType.Conflict;
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
                recordType: ApplicationConstants.VmsImportedRecordType.Discarded,
            }, {});

            dlg.result.then(
                function (reason) {
                    $scope.processing = true;
                    TransactionApiService.vmsTimesheetImportRecordTypeUpdate(
                        {
                            Id: entity.Id,
                            LastModifiedDatetime: entity.LastModifiedDatetime,
                            VmsImportedRecordTypeIdFinal: ApplicationConstants.VmsImportedRecordType.Discarded,
                            UserNotes: reason
                        }).then(function (response) {
                            var record = $scope.items[$scope.items.map(function (x) { return x.Id; }).indexOf(entity.Id)];
                            if (record) {
                                record.VmsImportedRecordTypeIdFinal = ApplicationConstants.VmsImportedRecordType.Discarded;
                                record.Reason = reason;
                                updateRecords(record);
                            }
                        },
                            function (error) { })
                        .finally(function () {
                            $scope.processing = false;
                        });
                },
                function () {
                }
            );
        };

        var updateRecords = function (record) {
            var remove = false;
            if ($scope.tableState.search && $scope.tableState.search.predicateObject) {
                if (!remove && $scope.tableState.search.predicateObject.VmsImportedRecordTypeIdFinal) {
                    if ($scope.tableState.search.predicateObject.VmsImportedRecordTypeIdFinal.indexOf(record.VmsImportedRecordTypeIdFinal) == -1) {
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
                TransactionApiService.getVmsTimesheetImportedRecord(record.Id).then(
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
                    var actions = _.filter($scope.availableActions.WorkflowAvailableActions,
                        function (i) { return ApplicationConstants.TaskResult.VmsDocumentPreprocessFile == i.TaskResultId; });
                    var action = (actions.length > 0 && actions[0]) || {};
                    var command = {
                        CommandName: action.CommandName,
                        WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        VmsDocumentId: getVmsDocumentId(),
                    };
                    WorkflowApiService.executeCommand(command)
                        .then(
                            function (responseSucces) {
                                removeDocument(documentPublicId);
                            },
                            function (responseError) {
                                $scope.processing = false;
                                onResponseError(responseError);
                            });
                }
            }
            else if ($scope.totalDiscarded != 0) {
                dialogs.notify('File cannot be pre-processed', 'The file cannot be pre-processed because all the records are discarded.', { keyboard: false, backdrop: 'static' });
            }
        };

        $scope.rejectFile = function (documentPublicId) {
            dialogs.confirm('Reject File', 'Are you sure you want to reject this file?').result
                .then(function () {
                    if ($scope.availableActions) {
                        $scope.processing = true;
                        var actions = _.filter($scope.availableActions.WorkflowAvailableActions,
                            function (i) { return ApplicationConstants.TaskResult.VmsDocumentDiscardFile == i.TaskResultId; });
                        var action = (actions.length > 0 && actions[0]) || {};
                        var command = {
                            CommandName: action.CommandName,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                            VmsDocumentId: getVmsDocumentId(),
                        };
                        WorkflowApiService.executeCommand(command)
                            .then(
                                function (responseSucces) {
                                    removeDocument(documentPublicId);
                                },
                                function (responseError) {
                                    $scope.processing = false;
                                    onResponseError(responseError);
                                });
                    }
                },
                    function () {
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

        function onResponseError(responseError, errorMessage) {
            if (errorMessage && errorMessage.length) {
                common.logError(errorMessage);
            }
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

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