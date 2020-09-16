(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsCommissionDocumentDetailsController', VmsCommissionDocumentDetailsController);

    /** @ngInject */
    VmsCommissionDocumentDetailsController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'vmsTableParams', 'mixinsFactory', 'NavigationService', 'dialogs', 'WorkflowApiService', 'phoenixsocket', 'common', 'vmsNewTableState', '$scope'];

    function VmsCommissionDocumentDetailsController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService, dialogs, WorkflowApiService, phoenixsocket, common, vmsNewTableState, $scope) {

        var self = this;

        NavigationService.setTitle('thirdpartyimport-manage-commission');

        angular.extend(self, {
            documentId: parseInt($state.params.documentId, 10),
            internalOrganizationId: parseInt($state.params.internalOrganizationId, 10),
            vmsTypes: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            selectedAction: null,
            conflictRecords: [],
            skippedRecords: [],
            skippedRecordsAfterProcess: [],
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

        var vmsCommissionDataParams = oreq.request()
                .withExpand(['WorkflowAvailableActions'])
                .withSelect([
                    'Id',
                    'WorkflowPendingTaskId',
                    'WorkflowAvailableActions',
                    'ImportDate',
                    'FirstName',
                    'LastName',
                    'StartDate',
                    'EndDate',
                    'BillAmount',
                    'PayAmount',
                    'VmsInvoiceReference',
                    'WorkOrderReference',
                    'VmsCommissionImportedRecordTypeId',
                    'Reason'
                ]).url();

        self.onActionChange = function (action) {
            if (action.CommandName == 'DiscardRecords') {
                var dialogHeader = 'Are you sure you want to discard all conflict records?';
                var successMessage = 'Discarded Conflict Records';

                dialogs.confirm('Discard Records', dialogHeader).result.then(function (btn) {
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsCommissionRecordToDiscardedType', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsCommissionRecordToDiscardedType' }
                        );

                }, function (btn) {
                    self.selectedAction = null;
                });
            }
        };

        function getTaskIdsToBatch() {
            var taskIdsToBatch = [];
            _.chain(self.conflictRecords).map("WorkflowPendingTaskId").each(function (WorkflowPendingTaskId) {
                taskIdsToBatch.push(WorkflowPendingTaskId);
            }).value();
            return taskIdsToBatch;
        }

        function executeBatch(commandBatchPreExecutionJsonBody, commandBatchThreadExecutionJsonBody) {
            self.viewLoading = true;
            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                TaskIdsToBatch: getTaskIdsToBatch(),
                TaskResultId: ApplicationConstants.TaskResult.Complete,
                NotifyName_BatchOperation_OnBatchMarkered: "VmsCommissionManagementConflictsBatchMark",
                NotifyName_BatchOperation_OnReleased: "VmsCommissionManagementConflictsProcessCompleted",
                CommandBatchPreExecutionJsonBody: commandBatchPreExecutionJsonBody,
                CommandBatchThreadExecutionJsonBody: commandBatchThreadExecutionJsonBody
            }).then(
                function (success) {
                    
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

        phoenixsocket.onPrivate("VmsCommissionManagementConflictsBatchMark", function (event, data) {
            common.logSuccess("Discard Conflict Records. Batch operation started.");

            self.selectedAction = null;
            self.conflictRecords = [];

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        phoenixsocket.onPrivate("VmsCommissionManagementConflictsProcessCompleted", function (event, data) {
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
            serviceMethod: VmsApiService.getVmsCommissionProcessedRecordsByDocument
        }, vmsTableParams), vmsCommissionDataParams, self.documentId).init(self);

        self.successfulRetrieval = function (items) {
            self.recordsToProcess = items;            
            self.skippedRecordsAfterProcess = _.filter(items, function (item) {
                return item.VmsCommissionImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
            });

            self.conflictRecords = _.filter(items, function (item) {
                return item.VmsCommissionImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Conflict;
            });

            if (self.notifyParent) {
                self.notifyParent = false;
                self.document.commissionDocument.TotalOutstandingRecords = self.recordsToProcess.length - self.skippedRecordsAfterProcess.length;
                self.document.commissionDocument.TotalConflict = self.conflictRecords ? self.conflictRecords.length : 0;
                self.document.commissionDocument.TotalDiscarded = self.skippedRecordsAfterProcess ? self.skippedRecordsAfterProcess.length : 0;
            }
        };

        self.loadSkippedPromise = VmsApiService.getVmsCommissionDocumentDetails(self.documentId).then(
            function (response) {
                if (response.VmsCommissionImportedRecords) {
                    self.skippedRecords = _.filter(response.VmsCommissionImportedRecords, function (item) {
                        return item.VmsCommissionImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
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
