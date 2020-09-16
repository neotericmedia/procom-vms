(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetDocumentDetailsController', VmsTimesheetDocumentDetailsController);

    /** @ngInject */
    VmsTimesheetDocumentDetailsController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'vmsTableParams', 'mixinsFactory', 'NavigationService', 'dialogs', 'WorkflowApiService', 'phoenixsocket', 'common', 'vmsNewTableState', '$scope'];

    function VmsTimesheetDocumentDetailsController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService, dialogs, WorkflowApiService, phoenixsocket, common, vmsNewTableState, $scope) {

        var self = this;

        NavigationService.setTitle('thirdpartyimport-manage-timesheet');

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
                actionList: []
            }
        });
        self.initialize = function (document) {
            self.document = document;
            self.document.isTabLoaded = false;
            var canDiscardAllConflictRecords = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.VMSDiscardAllConflictRecords);
            if (canDiscardAllConflictRecords) {
                self.lists.actionList.push({ Id: 1, Text: 'Discard All Conflict Records', CommandName: 'DiscardRecords' });
            }
            self.filteredRateTypes = filterRateTypes(self.rateTypes);
        };

        var vmsTimehseetDataParams = oreq.request()
            .withExpand(['ImportedRecord', 'WorkflowAvailableActions'])
                .withSelect([
                    'Id',
                    'WorkflowPendingTaskId',
                    'WorkflowAvailableActions',
                    'VmsWorkOrderReference',
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
                    'VmsImportedRecordTypeId',
                    'Reason',
                    'ImportedRecord'                    
                ]).url();

        self.onActionChange = function (action) {
            if (action.CommandName == 'DiscardRecords') {
                var dialogHeader = 'Are you sure you want to discard all conflict records?';
                var successMessage = 'Discarded Conflict Records';

                dialogs.confirm('Discard Records', dialogHeader).result.then(function (btn) {
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsProcessedRecordSetStateDiscarded', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsProcessedRecordSetStateDiscarded' }
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
                NotifyName_BatchOperation_OnBatchMarkered: "VmsTimesheetManagementConflictsBatchMark",
                NotifyName_BatchOperation_OnReleased: "VmsTimesheetManagementConflictsProcessCompleted",
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

        phoenixsocket.onPrivate("VmsTimesheetManagementConflictsBatchMark", function (event, data) {
            common.logSuccess("Discard Conflict Records. Batch operation started.");

            self.selectedAction = null;
            self.conflictRecords = [];

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        phoenixsocket.onPrivate("VmsTimesheetManagementConflictsProcessCompleted", function (event, data) {
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
            serviceMethod: VmsApiService.getVmsTimesheetProcessedRecordsByDocument
        }, vmsTableParams), vmsTimehseetDataParams, self.documentId).init(self);

        self.successfulRetrieval = function (items) {
            self.recordsToProcess = items;
            self.skippedRecordsAfterProcess = _.filter(items, function (item) {
                return item.VmsImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
            });

            self.conflictRecords = _.filter(items, function (item) {
                return item.VmsImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Conflict;
            });

            if (self.notifyParent) {
                self.notifyParent = false;
                //self.document.timesheetDocument.TotalOutstandingRecords = self.recordsToProcess.length - self.skippedRecordsAfterProcess.length;
                $state.go('vms.timesheet.document.details', {}, { reload: true });
            }
        };

        self.loadSkippedPromise = VmsApiService.getVmsTimesheetDocumentDetails(self.documentId).then(
            function (response) {
                if (response.VmsTimesheetImportedRecords) {
                    self.skippedRecords = _.filter(response.VmsTimesheetImportedRecords, function (item) {
                        return item.VmsImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
                    });
                }
                self.document.isTabLoaded = true;
            },
            function (error) {
                self.document.isTabLoaded = true;
            }
        );

        function filterRateTypes(rateTypes) {
            return rateTypes.filter(function(rateType){
                return !(rateType.id === ApplicationConstants.RateType.Stat
                    || rateType.id === ApplicationConstants.RateType.DoubleTime
                    || rateType.id === ApplicationConstants.RateType.TravelTime
                    || rateType.id === ApplicationConstants.RateType.Session);
            });
        }

        return self;
    }
})();
