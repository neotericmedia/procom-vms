(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsExpenseConflictsController', VmsExpenseConflictsController);

    angular.module('phoenix.vms.controllers').filter('vmsRate', VmsRateFilter);

    VmsExpenseConflictsController.$inject = ['AssignmentApiService', 'clientOrganizations', 'CodeValueService', 'common', 'dialogs', 'vmsNewTableState', 'JournalApiService', 'mixinsFactory', 'NavigationService', 'TransactionApiService', 'vmsTableParams', '$scope', '$stateParams', 'VmsApiService', 'WorkflowApiService', 'phoenixsocket'];

    function VmsExpenseConflictsController(AssignmentApiService, clientOrganizations, CodeValueService, common, dialogs, vmsNewTableState, JournalApiService, mixinsFactory, NavigationService, TransactionApiService, vmsTableParams, $scope, $stateParams, VmsApiService, WorkflowApiService, phoenixsocket) {

        NavigationService.setTitle('Expenses with conflicts', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],            
            clientOrganizations: clientOrganizations,
            internalOrganizations: [],
            actions: [{ Id: 1, CommandName: 'BatchThreadExecutionOnVmsExpenseRecordToChangeInternalOrg', DisplayName: 'Inter-Company Change' }, { Id: 2, CommandName: 'BatchThreadExecutionOnVmsExpenseRecordToDiscardedType', DisplayName: 'Discard' }],
            actionId: null,
            OrganizationClientName: null,
            OrganizationIdClient: null,
            SelectedClient: null,
            OrganizationIdInternal: $stateParams.internalOrganizationId,
            OrganizationIdInternalChange: null,
            selectedParentRow: {},
            workOrders: [],
            conflictingRow: null,            
            vmsBatchArray: [],
            searchObject: null,
            isLoaded: false,
            viewLoading: false,
            viewLoadingMixin: false,
            isUserSelected: false,

            //methods
            rowChecked: rowChecked,
            rowSelected: rowSelected,
            resolveConflict: resolveConflict,
            getExcelAll: getExcelAll,
            actionChanged: actionChanged,
            actionButtonsHandler: actionButtonsHandler
        });

        self.args = [self.OrganizationIdInternal, self.OrganizationIdClient];

        var vmsConflictsDataParams = '';

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: TransactionApiService.getVmsExpenseConflicts
        }, vmsTableParams), vmsConflictsDataParams, self.args).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.vmsConflictsTableState = angular.copy(tableState);
            }
            angular.forEach(items, function (item, idx) {
                item.StartDate = item.StartDate ? moment(item.StartDate).toDate() : null;
                item.EndDate = item.EndDate ? moment(item.EndDate).toDate() : null;
                item.ValidationMessages = item.ValidationMessages.replace(/(\r\n|\n|\r)/gm, " ");
            });

            if (self.isLoaded && tableState && tableState.search && tableState.search.predicateObject && Object.keys(tableState.search.predicateObject).length > 0 && !angular.equals(self.searchObject, tableState.search.predicateObject)) {
                self.workOrders = [];
                self.conflictingRow = null;                
                self.selectedParentRow = {};
                self.OrganizationIdInternalChange = null;
                self.searchObject = angular.copy(tableState.search.predicateObject);
                angular.element('#vms-expense-table-body tr').removeClass('vms-selected');
            }

            self.isLoaded = true;

            if (self.nextItemIdToSelect) {
                console.log('qwe2', self.nextItemIdToSelect);
                var nextItemToSelect = _.find(self.items, ['Id', self.nextItemIdToSelect]);
                self.nextItemIdToSelect = null;
                if (nextItemToSelect) {
                    window.setTimeout(function () {
                        self.rowSelected(nextItemToSelect);
                    }, 500);
                }
            }
            self.viewLoadingMixin = false;
        };

        self.clearClient = function () {
            self.args[1] = null;
            self.OrganizationIdClient = null;
            self.OrganizationClientName = null;
            self.SelectedClient = null;
            self.workOrders = [];
            self.conflictingRow = null;            
            self.selectedParentRow = {};
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            self.isUserSelected = false;
        };

        self.clientChanged = function (organizationClient) {

            var isItemSelected = angular.element('#vmsExpenseClientOrg' + organizationClient.OrganizationIdClient).hasClass('vms-client-selected');

            self.isUserSelected = true;

            if (isItemSelected) {
                self.args[1] = null;
                self.OrganizationIdClient = null;
                self.OrganizationClientName = null;
            }
            else {
                self.args[1] = organizationClient.OrganizationIdClient;
                self.OrganizationIdClient = organizationClient.OrganizationIdClient;
                self.OrganizationClientName = organizationClient.ClientOrgDisplayName;

                if (!self.vmsConflictsTableState) {
                    self.vmsConflictsTableState = angular.copy(vmsNewTableState);
                }
                else {
                    self.vmsConflictsTableState.pagination = angular.copy(vmsNewTableState.pagination);
                }

                self.currentPage = 1;
                self.callServer(self.vmsConflictsTableState, vmsConflictsDataParams, self.args);
            }

            self.workOrders = [];
            self.conflictingRow = null;            
            self.selectedParentRow = {};
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
        };

        self.restoreActions = function () {
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            angular.element('#vms-expense-table-body tr').removeClass('vms-action-selected');
        };

        function actionChanged(actionId) {
            self.workOrders = [];
            self.conflictingRow = null;            
            self.selectedParentRow = {};
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            angular.element('#vms-expense-table-body tr').removeClass('vms-selected');
            angular.element('#vms-expense-table-body tr').removeClass('vms-action-selected');
        }

        function rowSelected(item) {
            if (self.actionId > 0) {
                if (!angular.element('#' + item.Id).hasClass('vms-action-selected')) {
                    angular.element('#' + item.Id).addClass('vms-action-selected');
                    self.vmsBatchArray.push(item);
                }
                else {
                    angular.element('#' + item.Id).removeClass('vms-action-selected');
                    self.vmsBatchArray = _.filter(self.vmsBatchArray, function (vms) {
                        return vms.Id !== item.Id;
                    });
                }
            }
            else {
                var isItemSelected = angular.element('#' + item.Id).hasClass('vms-selected');
                angular.element('#vms-expense-table-body tr').removeClass('vms-selected');

                self.workOrders = [];
                self.conflictingRow = null;                
                self.selectedParentRow = {};
                self.OrganizationIdInternalChange = null;

                if (!isItemSelected) {
                    angular.element('#' + item.Id).addClass('vms-selected');
                    filterWorkorders(item);
                }
            }
        }

        function filterWorkorders(vmsItem) {

            self.selectedParentRow = angular.copy(vmsItem);

            self.workOrders = _.chain(self.selectedParentRow.VmsExpenseWorkOrders).filter(function (wo) {
                wo.StartDate = wo.StartDate ? moment(wo.StartDate).toDate() : null;
                wo.EndDate = wo.EndDate ? moment(wo.EndDate).toDate() : null;
                return wo.WorkOrderId > 0 && (wo.StartDate && wo.EndDate) &&
                       (self.selectedParentRow.StartDate && self.selectedParentRow.EndDate) &&
                       (wo.ExpenseMethodologyId && wo.ExpenseMethodologyId !== ApplicationConstants.ExpenseMethodology.NoExpense);
            }).value();
        }

        function rowChecked(wo, index) {
            self.conflictingRow = null;
            var isSelected = wo.IsSelected;
            angular.forEach(self.workOrders, function (w, idx) {
                w.IsSelected = false;
            });
            if (isSelected) {
                wo.IsSelected = true;
                self.conflictingRow = wo;
            }            
        }

        function actionButtonsHandler(commandName) {
            switch (commandName) {
                case "Change":
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsExpenseRecordToChangeInternalOrg', WorkflowPendingTaskId: -1, OrganizationIdInternal: self.OrganizationIdInternalChange },
                        { CommandName: 'BatchThreadExecutionOnVmsExpenseRecordToChangeInternalOrg', OrganizationIdInternal: self.OrganizationIdInternalChange }
                    );
                    break;
                case "Discard":
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsExpenseRecordToDiscardedType', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsExpenseRecordToDiscardedType' }
                    );
                    break;
                default: self.restoreActions();
            }
        }

        function getTaskIdsToBatch() {
            var taskIdsToBatch = [];
            _.chain(self.vmsBatchArray).map("WorkflowAvailableActions").each(function (item) {
                taskIdsToBatch.push(item[0].WorkflowPendingTaskId);
            }).value();
            return taskIdsToBatch;
        }

        function executeBatch(commandBatchPreExecutionJsonBody, commandBatchThreadExecutionJsonBody) {
            self.viewLoading = true;
            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                TaskIdsToBatch: getTaskIdsToBatch(),
                TaskResultId: ApplicationConstants.TaskResult.Complete,
                NotifyName_BatchOperation_OnBatchMarkered: "VmsExpenseConflictsBatchMark",
                CommandBatchPreExecutionJsonBody: commandBatchPreExecutionJsonBody, CommandBatchThreadExecutionJsonBody: commandBatchThreadExecutionJsonBody
            }).then(
                function (success) {
                    self.actionId = null;
                    self.OrganizationIdInternalChange = null;
                    self.vmsBatchArray = [];
                    retrieveClients();
                },
                function (error) {
                    self.actionId = null;
                    self.OrganizationIdInternalChange = null;
                    self.vmsBatchArray = [];
                    retrieveClients();
                    onErrorResponse(error, 'VMS Record object is not valid');
                });
        }

        function resolveConflict() {

            if (self.conflictingRow) {

                self.viewLoading = true;
                var mapedConflicts = [];
                var rowToResolve = angular.copy(self.conflictingRow);

                VmsApiService.vmsExpenseRecordSetToProcessType(
                    {
                        WorkflowPendingTaskId: self.selectedParentRow.WorkflowPendingTaskId,
                        VmsExpenseRecordId: self.selectedParentRow.Id,
                        WorkOrderId: rowToResolve.WorkOrderId
                    }
                    ).then(

                    function (success) {

                        for (var i = 0; i < self.items.length - 1; i++) {
                            if (self.items[i].Id === self.selectedParentRow.Id) {
                                self.nextItemIdToSelect = self.items[i + 1].Id;
                            }
                        }

                        common.logSuccess("Record resolved successfully");
                        self.actionId = null;
                        self.vmsBatchArray = [];
                        self.workOrders = [];
                        self.conflictingRow = null;                        
                        self.selectedParentRow = {};
                        self.OrganizationIdInternalChange = null;

                        if (!self.vmsConflictsTableState) {
                            self.vmsConflictsTableState = angular.copy(vmsNewTableState);
                        }
                        else {
                            self.vmsConflictsTableState.pagination = angular.copy(vmsNewTableState.pagination);
                        }

                        retrieveClients();

                        self.currentPage = 1;
                        self.callServer(self.vmsConflictsTableState, vmsConflictsDataParams, self.args);
                    },
                    function (error) {
                        retrieveClients();
                        onErrorResponse(error, 'VMS Record object is not valid');
                    });
            }
        }       

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.actionId = null;
            self.OrganizationIdInternalChange = null;
            self.vmsBatchArray = [];
            self.workOrders = [];
            self.conflictingRow = null;            
            self.selectedParentRow = {};
            self.viewLoading = false;
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        function getExcelAll() {
            var date = new Date();
            var month = date.getMonth() + 1 + "";
            var pad = "00";
            month = pad.substring(0, pad.length - month.length) + month;
            var dateString = "_" + month + date.getFullYear();

            var orgIdClient = self.OrganizationIdClient;
            var orgIdInternal = self.OrganizationIdInternal;

            VmsApiService.csvStreamForAllConflictingVmsExpenseRecords(orgIdInternal, orgIdClient).then(function (response) {
                var fileName = self.OrganizationClientName + "_" +  dateString + "_ExpenseConflicts.csv";
                saveTextAs(response, fileName);
            });           
        }

        AssignmentApiService.getListOrganizationInternal().then(
            function (response) {
                self.internalOrganizations = _.filter(response, function (org) {
                    return org.Id != self.OrganizationIdInternal;
                });
            },
            function (error) {
                common.logError("Error retrieving internal organizations.");
            }
        );

        function retrieveClients() {
            self.viewLoading = true;
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'ExpenseConflictCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.ExpenseConflictCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
                    });

                    self.clientOrganizations = items;

                    var currentClient = _.filter(self.clientOrganizations, function (co) {
                        return co.OrganizationIdClient == self.OrganizationIdClient;
                    });

                    if (!currentClient || currentClient.length === 0) {
                        self.args[1] = null;
                        self.OrganizationIdClient = null;
                        self.OrganizationClientName = null;
                    }
                    self.viewLoading = false;
                },
                function (error) {
                    onErrorResponse(error, "Error while receiving clients.");
                });
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

        phoenixsocket.onPrivate("VmsExpenseConflictsBatchMark", function (event, data) {

            var displayName = (_.find(self.actions, ['Id', self.actionId]) || {}).DisplayName;
            common.logSuccess(displayName + " batch operation started.");

            self.actionId = null;
            self.vmsBatchArray = [];
            self.workOrders = [];
            self.conflictingRow = null;            
            self.selectedParentRow = {};

            if (!self.vmsConflictsTableState) {
                self.vmsConflictsTableState = angular.copy(vmsNewTableState);
            }
            else {
                self.vmsConflictsTableState.pagination = angular.copy(vmsNewTableState.pagination);
            }

            self.currentPage = 1;
            self.callServer(self.vmsConflictsTableState, vmsConflictsDataParams, self.args);

        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });
    }

    function VmsRateFilter() {

        return function (input, comma) {

            if (isNaN(parseFloat(input))) return "";

            comma = (typeof comma === 'undefined') ? "." : ",";

            input = Math.round(parseFloat(input) * 100) / 100;

            var d = input.toString().split(".");
            if (d.length === 1) return input + comma + "00";
            if (d[1].length < 2) return input + "0";

            return input;
        };
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.VmsExpenseConflictsController = {
        clientOrganizations: ['$q', 'TransactionApiService', '$stateParams', function ($q, TransactionApiService, $stateParams) {
            var result = $q.defer();
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'ExpenseConflictCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.ExpenseConflictCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
                    });
                    result.resolve(items);
                },
                function (error) {
                    result.reject(error);
                });
            return result.promise;
        }]
    };

})(angular, Phoenix.App);