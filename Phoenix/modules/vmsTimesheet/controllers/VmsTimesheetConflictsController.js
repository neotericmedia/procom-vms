(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTimesheetConflictsController', VmsTimesheetConflictsController);

    angular.module('phoenix.vms.controllers').filter('vmsRate', VmsRateFilter);

    VmsTimesheetConflictsController.$inject = ['AssignmentApiService', 'clientOrganizations', 'CodeValueService', 'common', 'dialogs', 'vmsNewTableState', 'JournalApiService', 'mixinsFactory', 'NavigationService', 'TransactionApiService', 'vmsTableParams', '$scope', '$stateParams', 'VmsApiService', 'WorkflowApiService', 'phoenixsocket'];

    function VmsTimesheetConflictsController(AssignmentApiService, clientOrganizations, CodeValueService, common, dialogs, vmsNewTableState, JournalApiService, mixinsFactory, NavigationService, TransactionApiService, vmsTableParams, $scope, $stateParams, VmsApiService, WorkflowApiService, phoenixsocket) {

        NavigationService.setTitle('Transactions with conflicts', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            workOrderStatuses: CodeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
            clientOrganizations: clientOrganizations,
            internalOrganizations: [],
            actions: [{ Id: 1, CommandName: 'BatchThreadExecutionOnVmsProcessedRecordTransferInternally', DisplayName: 'Inter-Company Change' }, { Id: 2, CommandName: 'BatchThreadExecutionOnVmsProcessedRecordSetStateDiscarded', DisplayName: 'Discard' }],
            actionId: null,
            OrganizationClientName: null,
            OrganizationIdClient: null,
            SelectedClient: null,
            OrganizationIdInternal: $stateParams.internalOrganizationId,
            OrganizationIdInternalChange: null,
            selectedParentRow: {},
            workOrderVersions: [],
            conflictedRows: [],
            versionsCopy: [],
            vmsBatchArray: [],
            searchObject: null,
            isLoaded: false,
            viewLoading: false,
            viewLoadingMixin: false,
            isUserSelected: false,

            //methods
            rowChecked: rowChecked,
            rowSelected: rowSelected,
            resolve: resolve,
            //getExcel: getExcel,
            getExcelAll: getExcelAll,
            actionChanged: actionChanged,
            actionButtonsHandler: actionButtonsHandler
        });

        self.args = [self.OrganizationIdInternal, self.OrganizationIdClient];

        var vmsConflictsDataParams = '';

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: TransactionApiService.getClientConflicts
        }, vmsTableParams), vmsConflictsDataParams, self.args).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.vmsConflictsTableState = angular.copy(tableState);
            }
            angular.forEach(items, function (item, idx) {
                item.StartDate = moment(item.StartDate).toDate();
                item.EndDate = moment(item.EndDate).toDate();
                item.ValidationMessages = item.ValidationMessages.replace(/(\r\n|\n|\r)/gm, " ");
            });

            if (self.isLoaded && tableState && tableState.search && tableState.search.predicateObject && Object.keys(tableState.search.predicateObject).length > 0 && !angular.equals(self.searchObject, tableState.search.predicateObject)) {
                self.workOrderVersions = [];
                self.conflictedRows = [];
                self.versionsCopy = [];
                self.selectedParentRow = {};
                self.OrganizationIdInternalChange = null;
                self.searchObject = angular.copy(tableState.search.predicateObject);
                angular.element('#vms-conflict-table-body tr').removeClass('vms-selected');
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

        self.restoreClient = function () {
            self.args[1] = null;
            self.OrganizationIdClient = null;
            self.OrganizationClientName = null;
            self.SelectedClient = null;
            self.workOrderVersions = [];
            self.conflictedRows = [];
            self.versionsCopy = [];
            self.selectedParentRow = {};
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            self.isUserSelected = false;
        };

        self.clientChanged = function (organizationClient) {

            var isItemSelected = angular.element('#vmsClientOrg' + organizationClient.OrganizationIdClient).hasClass('vms-client-selected');

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

            self.workOrderVersions = [];
            self.conflictedRows = [];
            self.versionsCopy = [];
            self.selectedParentRow = {};
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
        };

        self.restoreActions = function () {
            self.actionId = null;
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            angular.element('#vms-conflict-table-body tr').removeClass('vms-action-selected');
        };

        function actionChanged(actionId) {
            self.workOrderVersions = [];
            self.conflictedRows = [];
            self.versionsCopy = [];
            self.selectedParentRow = {};
            self.vmsBatchArray = [];
            self.OrganizationIdInternalChange = null;
            angular.element('#vms-conflict-table-body tr').removeClass('vms-selected');
            angular.element('#vms-conflict-table-body tr').removeClass('vms-action-selected');
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
                angular.element('#vms-conflict-table-body tr').removeClass('vms-selected');

                self.workOrderVersions = [];
                self.conflictedRows = [];
                self.versionsCopy = [];
                self.selectedParentRow = {};
                self.OrganizationIdInternalChange = null;

                if (!isItemSelected) {
                    angular.element('#' + item.Id).addClass('vms-selected');
                    filterVersions(item);
                }
            }
        }

        function filterVersions(vmsItem) {

            self.selectedParentRow = angular.copy(vmsItem);

            self.workOrderVersions = _.chain(self.selectedParentRow.VMSWorkOrderVersions).filter(function (wv) {
                wv.StartDate = moment(wv.StartDate).toDate();
                wv.EndDate = wv.EndDate ? moment(wv.EndDate).toDate() : null;
                if (wv.WorkOrderVersionIdLast != wv.WorkOrderVersionId && wv.EndDate && wv.WorkOrderVersionStatusId !== ApplicationConstants.WorkOrderStatus.Terminated && wv.WorkOrderVersionStatusId !== ApplicationConstants.WorkOrderStatus.PendingUnterminate) {
                    wv.EndDate.setDate(wv.EndDate.getDate() - 1);
                }
                return wv.WorkOrderVersionId > 0;
            }).uniqBy('WorkOrderVersionId').value();

            self.versionsCopy = angular.copy(self.workOrderVersions);

            angular.forEach(self.workOrderVersions, function (wv, idx) {
                wv.IsSelected = false;
                if (wv.V1RateTypeId === vmsItem.V1RateTypeId &&
                    wv.V1BillRate === vmsItem.V1BillRate &&
                    wv.StartDate <= vmsItem.StartDate &&
                    wv.EndDate >= vmsItem.EndDate) {
                    wv.IsSelected = true;
                    wv.TrnStartDate = angular.copy(vmsItem.StartDate);
                    wv.TrnEndDate = angular.copy(vmsItem.EndDate);
                    wv.V1BillUnits = vmsItem.V1BillUnits;
                    wv.V2BillUnits = vmsItem.V2BillUnits;
                }
            });

            var filterSelected = _.filter(self.workOrderVersions, function (wv) {
                return wv.IsSelected;
            });

            if (filterSelected && filterSelected.length > 1) {
                self.workOrderVersions = angular.copy(self.versionsCopy);
            }

            if (filterSelected && filterSelected.length === 1) {
                self.conflictedRows = filterSelected;
            }
        }

        function rowChecked(wov, index) {
            if (wov.IsSelected) {
                wov.TrnStartDate = angular.copy(self.selectedParentRow.StartDate);
                wov.TrnEndDate = angular.copy(self.selectedParentRow.EndDate);
                wov.V1BillUnits = self.selectedParentRow.V1BillUnits;
                wov.V2BillUnits = self.selectedParentRow.V2BillUnits;
                self.conflictedRows.push(wov);
            }
            else {
                self.conflictedRows = _.filter(self.conflictedRows, function (version) {
                    return version.WorkOrderVersionId !== wov.WorkOrderVersionId;
                });
                wov.TrnStartDate = null;
                wov.TrnEndDate = null;
                self.workOrderVersions[index] = angular.copy(self.versionsCopy[index]);
                self.workOrderVersions[index].IsSelected = false;
            }
        }

        function actionButtonsHandler(commandName) {
            switch (commandName) {
                case "Change":
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsProcessedRecordTransferInternally', WorkflowPendingTaskId: -1, OrganizationIdInternal: self.OrganizationIdInternalChange },
                        { CommandName: 'BatchThreadExecutionOnVmsProcessedRecordTransferInternally', OrganizationIdInternal: self.OrganizationIdInternalChange }
                        );
                    break;
                case "Discard":
                    executeBatch(
                        { CommandName: 'BatchPreExecutionOnVmsProcessedRecordSetStateDiscarded', WorkflowPendingTaskId: -1 },
                        { CommandName: 'BatchThreadExecutionOnVmsProcessedRecordSetStateDiscarded' }
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
                NotifyName_BatchOperation_OnBatchMarkered: "VmsConflictsBatchMark",
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

        function validateAndResolve() {

            if (self.conflictedRows.length > 0) {

                var errors = validateConflicts();

                if (errors.length > 0) {
                    var markup = "<ul>";
                    for (var j = 0; j < errors.length; j++) {
                        markup += "<li>" + errors[j] + "</li>";
                    }
                    markup += "</ul>";

                    dialogs.notify('Errors on resolving conflicts', markup, { keyboard: false, backdrop: 'static', windowClass: 'vms-conflict-dlg-errors' }).result.then(function () { });
                }

                else {
                    self.viewLoading = true;
                    var mapedConflicts = [];
                    var rowsToResolve = angular.copy(self.conflictedRows);

                    angular.forEach(rowsToResolve, function (value, key) {
                        var tempConflict = {
                            WorkOrderVersionId: value.WorkOrderVersionId,
                            V1RateTypeId: value.V1RateTypeId,
                            V1BillRate: value.V1BillRate,
                            V1BillUnits: value.V1BillUnits,
                            V2RateTypeId: value.V2RateTypeId,
                            V2BillRate: value.V2BillRate,
                            V2BillUnits: value.V2BillUnits,
                            TransactionStartDate: value.TrnStartDate,
                            TransactionEndDate: value.TrnEndDate
                        };
                        mapedConflicts.push(tempConflict);
                    });

                    TransactionApiService.vmsProcessedRecordSetTypeToProcess({ WorkflowPendingTaskId: self.selectedParentRow.WorkflowPendingTaskId, VmsProcessedRecordId: self.selectedParentRow.Id, VmsProcessResolvedRecords: mapedConflicts }).then(
                        function (success) {

                            for (var i = 0; i < self.items.length - 1; i++) {
                                if (self.items[i].Id === self.selectedParentRow.Id) {
                                    self.nextItemIdToSelect = self.items[i + 1].Id;
                                }
                            }

                            common.logSuccess("Record resolved successfully");
                            self.actionId = null;
                            self.vmsBatchArray = [];
                            self.workOrderVersions = [];
                            self.conflictedRows = [];
                            self.versionsCopy = [];
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
        }

        function validateConflicts() {

            var errors = [], tempItem = null;

            for (var j = 0; j < self.conflictedRows.length; j++) {
                tempItem = angular.copy(self.conflictedRows[j]);
                if (moment(tempItem.TrnStartDate) < tempItem.StartDate || moment(tempItem.TrnEndDate) > tempItem.EndDate) {
                    errors.push("Transaction dates should be within Work Order Version Effective dates.");
                    break;
                }
                if (moment(tempItem.TrnStartDate) > moment(tempItem.TrnEndDate)) {
                    errors.push("Transaction start date cannot be greater than end date.");
                    break;
                }
            }

            for (var k = 0; k < self.conflictedRows.length; k++) {
                tempItem = angular.copy(self.conflictedRows[k]);
                if ((self.selectedParentRow.V2RateTypeId > 0 && self.selectedParentRow.V2BillRate > 0 && !tempItem.V2RateTypeId) || (tempItem.V2RateTypeId && tempItem.V2RateTypeId != self.selectedParentRow.V2RateTypeId)) {
                    errors.push("VMS item rate type doesn't match to selected Work Order Version rate type.");
                    break;
                }
            }

            var aggregateV1RateUnits = 0, aggregateV2RateUnits = 0;

            angular.forEach(self.conflictedRows, function (value, key) {
                value.V1BillUnits = value && value.V1BillUnits ? parseFloat(value.V1BillUnits, 10).toFixed(2) : parseFloat(0, 10).toFixed(2);
                value.V2BillUnits = value && value.V2BillUnits ? parseFloat(value.V2BillUnits, 10).toFixed(2) : parseFloat(0, 10).toFixed(2);
                aggregateV1RateUnits += value.V1BillUnits / 1;
                aggregateV2RateUnits += value.V2BillUnits / 1;
            });

            if (aggregateV1RateUnits <= self.selectedParentRow.V1BillUnits) {
                if (self.selectedParentRow.V2BillUnits && self.selectedParentRow.V2BillUnits >= 0 && aggregateV2RateUnits > self.selectedParentRow.V2BillUnits) {
                    errors.push("Units aggregate cannot exceed VMS item Units.");
                }
                if (!self.selectedParentRow.V2BillUnits && aggregateV2RateUnits > 0) {
                    errors.push("Units aggregate cannot exceed VMS item Units.");
                }
            }
            else {
                errors.push("Units aggregate cannot exceed VMS item Units.");
            }

            return errors;
        }

        function validateNonCritical() {
            var errors = [], tempItem = null;

            for (var l = 0; l < self.conflictedRows.length; l++) {
                tempItem = angular.copy(self.conflictedRows[l]);
                if ((self.selectedParentRow.V1BillRate != tempItem.V1BillRate) || (tempItem.V2BillRate > 0 && self.selectedParentRow.V2BillRate > 0 && self.selectedParentRow.V2BillRate != tempItem.V2BillRate)) {
                    errors.push("VMS rate doesn't match selected Work Order Version rate.");
                    break;
                }
            }

            return errors;
        }

        function resolve() {
            var errors = validateNonCritical();

            if (errors.length > 0) {
                var items = errors.map(function (i) { return '<li>' + i + '</li>'; }).join('');
                var markup = '<ul>' + items + '</ul><br/><br/><h5>Do you want to proceed?<h5>';

                dialogs.confirm('Warning', markup, {
                    windowClass: 'vms-conflict-dlg-errors'
                })
                    .result
                    .then(function () {
                        validateAndResolve();
                    });
            }
            else {
                validateAndResolve();
            }
        }

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.actionId = null;
            self.OrganizationIdInternalChange = null;
            self.vmsBatchArray = [];
            self.workOrderVersions = [];
            self.conflictedRows = [];
            self.versionsCopy = [];
            self.selectedParentRow = {};
            self.viewLoading = false;
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        //function getExcel() {
        //    var excelData = JournalApiService.tableToExcel("vmsConflict");
        //    var exportString = excelData.exportString;
        //    var exportData = excelData.exportData;

        //    saveTextAs(exportString, self.OrganizationClientName + "Conflicts.csv");
        //}

        function getExcelAll() {
            var date = new Date();
            var month = date.getMonth() + 1 + "";
            var pad = "00";
            month = pad.substring(0, pad.length - month.length) + month;
            var dateString = "_" + month + date.getFullYear();

            var orgIdClient = self.OrganizationIdClient;
            var orgIdInternal = self.OrganizationIdInternal;

            VmsApiService.csvStreamForAllConflictingVmsTimesheetRecords(orgIdInternal, orgIdClient).then(function (response) {
                var fileName = self.OrganizationClientName + "_" + dateString + "_TimesheetConflicts.csv";
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
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'ConflictCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.ConflictCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
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

        phoenixsocket.onPrivate("VmsConflictsBatchMark", function (event, data) {

            var displayName = (_.find(self.actions, ['Id', self.actionId]) || {}).DisplayName;
            common.logSuccess(displayName + " batch operation started.");

            self.actionId = null;
            self.vmsBatchArray = [];
            self.workOrderVersions = [];
            self.conflictedRows = [];
            self.versionsCopy = [];
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

    app.resolve.VmsTimesheetConflictsController = {
        clientOrganizations: ['$q', 'TransactionApiService', '$stateParams', function ($q, TransactionApiService, $stateParams) {
            var result = $q.defer();
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'ConflictCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.ConflictCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
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