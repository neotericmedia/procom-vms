(function () {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsExpenseDocumentDetailsController', VmsExpenseDocumentDetailsController);

    /** @ngInject */
    VmsExpenseDocumentDetailsController.$inject = ['$state', 'CodeValueService', 'VmsApiService', 'vmsTableParams', 'mixinsFactory', 'NavigationService', 'dialogs', 'WorkflowApiService', 'phoenixsocket', 'common', 'vmsNewTableState', '$scope'];

    function VmsExpenseDocumentDetailsController($state, CodeValueService, VmsApiService, vmsTableParams, mixinsFactory, NavigationService, dialogs, WorkflowApiService, phoenixsocket, common, vmsNewTableState, $scope) {

        var self = this;//{{item.PaymentSubtotal | currency: '$'}}{{item.CurrencyId | lookup: list.currencies:'id':'code'}}

        NavigationService.setTitle('thirdpartyimport-manage-expense');

        angular.extend(self, {
            documentId: parseInt($state.params.documentId, 10),
            internalOrganizationId: parseInt($state.params.internalOrganizationId, 10),
            vmsTypes: CodeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency, true),
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

        var vmsExpenseDataParams = oreq.request()
                .withExpand(['WorkflowAvailableActions'])
                .withSelect([
                    'Id',
                    'WorkflowPendingTaskId',
                    'WorkflowAvailableActions',
                    'ImportDate',
                    'ClaimReference',
                    'FirstName',
                    'LastName',
                    'StartDate',
                    'EndDate',
                    'AmountBillable',
                    'CurrencyId',
                    'InvoiceReference',
                    'WorkOrderReference',
                    'VmsExpenseImportedRecordTypeId',
                    'Reason'
                ]).url();

        self.onActionChange = function (action) {
            if (action.CommandName == 'DiscardRecords') {
                var dialogHeader = 'Are you sure you want to discard all conflict records?';
                var successMessage = 'Discarded Conflict Records';

                dialogs.confirm('Discard Records', dialogHeader).result.then(function (btn) {
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsExpenseRecordToDiscardedType', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsExpenseRecordToDiscardedType' }
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
                NotifyName_BatchOperation_OnBatchMarkered: "VmsExpenseManagementConflictsBatchMark",
                NotifyName_BatchOperation_OnReleased: "VmsExpenseManagementConflictsProcessCompleted",
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

        phoenixsocket.onPrivate("VmsExpenseManagementConflictsBatchMark", function (event, data) {
            common.logSuccess("Discard Conflict Records. Batch operation started.");

            self.selectedAction = null;
            self.conflictRecords = [];

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        phoenixsocket.onPrivate("VmsExpenseManagementConflictsProcessCompleted", function (event, data) {
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
            serviceMethod: VmsApiService.getVmsExpenseProcessedRecordsByDocument
        }, vmsTableParams), vmsExpenseDataParams, self.documentId).init(self);

        self.successfulRetrieval = function (items) {
            self.recordsToProcess = items;
            self.skippedRecordsAfterProcess = _.filter(items, function (item) {
                return item.VmsExpenseImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
            });

            self.conflictRecords = _.filter(items, function (item) {
                return item.VmsExpenseImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Conflict;
            });

            if (self.notifyParent) {
                self.notifyParent = false;
                self.document.expenseDocument.TotalOutstandingRecords = self.recordsToProcess.length - self.skippedRecordsAfterProcess.length;
                //$state.go('vms-expense.document.details', {}, { reload: true });
            }
        };

        self.loadSkippedPromise = VmsApiService.getVmsExpenseDocumentDetails(self.documentId).then(
            function (response) {
                if (response.VmsExpenseImportedRecords) {
                    self.skippedRecords = _.filter(response.VmsExpenseImportedRecords, function (item) {
                        return item.VmsExpenseImportedRecordTypeId == ApplicationConstants.VmsImportedRecordType.Discarded;
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
