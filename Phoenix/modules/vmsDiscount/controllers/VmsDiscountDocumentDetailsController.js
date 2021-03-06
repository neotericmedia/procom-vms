(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsDiscountDocumentDetailsController', VmsDiscountDocumentDetailsController);

    /** @ngInject */
    VmsDiscountDocumentDetailsController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'vmsTableParams', 'mixinsFactory', 'NavigationService', 'dialogs', 'WorkflowApiService', 'phoenixsocket', 'common', 'vmsNewTableState', '$scope'];

    function VmsDiscountDocumentDetailsController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService, dialogs, WorkflowApiService, phoenixsocket, common, vmsNewTableState, $scope) {

        var self = this;

        NavigationService.setTitle('thirdpartyimport-manage-discount');

        angular.extend(self, {
            documentId: parseInt($state.params.documentId, 10),
            internalOrganizationId: parseInt($state.params.internalOrganizationId, 10),
            vmsTypes: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            selectedAction: null,
            conflictRecords: [],
            skippedRecords: [],
            skippedRecordsAfterProcess : [],
            recordsToProcess: [],
            notifyParent: false,
            document: document,
            lists: {
                actionList: [],
            }
        });

        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = false;
            var canDiscardAllConflictRecords = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.VMSDiscardAllConflictRecords);
            if (canDiscardAllConflictRecords) {
                self.lists.actionList.push({ Id: 1, Text: 'Discard All Conflict Records', CommandName: 'DiscardRecords' });
            }   
        };

        self.onActionChange = function (action) {
            if (action.CommandName == 'DiscardRecords') {
                var dialogHeader = 'Are you sure you want to discard all conflict records?';
                var successMessage = 'Discarded Conflict Records';
                
                dialogs.confirm('Discard Records', dialogHeader).result.then(function (btn) {
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsDiscountRecordToDiscardedType', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsDiscountRecordToDiscardedType' }
                        );

                }, function (btn) {
                    self.selectedAction = null;
                });
            }
        };        

        function getTaskIdsToBatch() {
            var taskIdsToBatch = [];
            _.chain(self.conflictRecords).map("WorkflowAvailableActions").each(function (item) {
                taskIdsToBatch.push(item[0].WorkflowPendingTaskId);
            }).value();
            return taskIdsToBatch;
        }

        function executeBatch(commandBatchPreExecutionJsonBody, commandBatchThreadExecutionJsonBody) {
            self.viewLoading = true;
            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                TaskIdsToBatch: getTaskIdsToBatch(),
                TaskResultId: ApplicationConstants.TaskResult.Complete,
                NotifyName_BatchOperation_OnBatchMarkered: "VmsDiscountManagementConflictsBatchMark",
                NotifyName_BatchOperation_OnReleased: "VmsDiscountManagementConflictsProcessCompleted",
                CommandBatchPreExecutionJsonBody: commandBatchPreExecutionJsonBody, CommandBatchThreadExecutionJsonBody: commandBatchThreadExecutionJsonBody
            }).then(
                function (success) {
                    // Clean up table.
                    //alert('executeBatch Success Function');
                },
                function (error) {                    
                    onErrorResponse(error, 'VMS Record object is not valid');
                });
        }

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.conflictRecords = [];
            self.viewLoading = false;
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        var unregisterFunctionList = [];
        $scope.$on("$destroy", function () {
            if (unregisterFunctionList && unregisterFunctionList.length) {
                for (var i = 0; i < unregisterFunctionList.length; i++) {
                    if (typeof unregisterFunctionList[i] === "function") {
                        unregisterFunctionList[i]();
                    }
                }
            }
        });

        phoenixsocket.onPrivate("VmsDiscountManagementConflictsBatchMark", function (event, data) {
            common.logSuccess("Discard Conflict Records. Batch operation started.");

            self.selectedAction = null;
            self.conflictRecords = [];

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        phoenixsocket.onPrivate("VmsDiscountManagementConflictsProcessCompleted", function (event, data) {
            common.logSuccess("Discard Conflict Records. Batch operation completed.");

            //Refresh table
            self.callServer(vmsNewTableState, '', self.documentId);
            self.notifyParent = true;            

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: VmsApiService.getDiscountProcessedRecordsByDocument
        }, vmsTableParams), "", self.documentId).init(self);

        self.successfulRetrieval = function (items) {
            self.recordsToProcess = items;
            self.skippedRecordsAfterProcess =
            _.filter(items, function (item) {
                return item.VmsDiscountImportedRecordTypeId == ApplicationConstants.VmsDiscountImportedRecordType.Discarded;
                });

            self.conflictRecords =
            _.filter(items, function (item) {
                return item.VmsDiscountImportedRecordTypeId == ApplicationConstants.VmsDiscountImportedRecordType.Conflict;
            });

            if (self.notifyParent) {
                self.notifyParent = false;
                $scope.$emit('onVmsDiscountManagementSkippedRecordsUpdate', self.recordsToProcess.length - self.skippedRecordsAfterProcess.length);

                $state.reload();
            }
        };

        self.loadSkippedPromise = VmsApiService.getVmsDiscountSummaryDocument(self.documentId).then(
            function (response) {
                if (response.VmsDiscountImportedRecords) {
                    self.skippedRecords = _.filter(response.VmsDiscountImportedRecords, function (item) {
                        return item.VmsDiscountImportedRecordTypeId == ApplicationConstants.VmsDiscountImportedRecordType.Discarded;
                    });
                }
                self.document.isTabLoaded = true;
            },
            function (error) {
                self.document.isTabLoaded = true;
            }
        );

        return self;
    }
})();
