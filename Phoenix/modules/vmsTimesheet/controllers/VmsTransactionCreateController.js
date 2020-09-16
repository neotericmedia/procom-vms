(function (angular, app) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsTransactionCreateController', VmsTransactionCreateController);

    VmsTransactionCreateController.$inject = ['clientOrganizations', 'CodeValueService', 'common', 'dialogs', 'mixinsFactory', 'NavigationService', 'TransactionApiService', '$stateParams', 'vmsTableParams', 'vmsNewTableState', 'WorkflowApiService', 'phoenixsocket', '$scope'];

    function VmsTransactionCreateController(clientOrganizations, CodeValueService, common, dialogs, mixinsFactory, NavigationService, TransactionApiService, $stateParams, vmsTableParams, vmsNewTableState, WorkflowApiService, phoenixsocket, $scope) {

        NavigationService.setTitle('VMS Transaction Creation', 'icon icon-transaction');

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            rateTypes: CodeValueService.getCodeValues(CodeValueGroups.RateType, true),
            clientOrganizations: clientOrganizations,
            OrganizationIdClient: null,
            SelectedClient: null,
            OrganizationIdInternal: $stateParams.internalOrganizationId,
            viewLoading: false,
            vmsBatchArray: [],
            viewLoadingMixin: false,
            isUserSelected: false,

            //methods
            rowClicked: rowClicked,
            create: create,
            conflict: conflict
        });

        var onloadResizeEvent = true;
        var unregisterFunctionList = [];

        self.args = [self.OrganizationIdInternal, self.OrganizationIdClient];
        var vmsTrnDataParams = '';

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: TransactionApiService.getClientProcessingTransactions
        }, vmsTableParams), vmsTrnDataParams, self.args).init(self);

        self.successfulRetrieval = function (items, tableState) {
            if (tableState.search && (!tableState.search.predicateObject || Object.keys(tableState.search.predicateObject).length === 0)) {
                self.vmsTrnTableState = tableState;
            }
            self.vmsBatchArray = angular.copy(items);

            self.viewLoadingMixin = false;
        };

        function rowClicked(item) {
            if (angular.element('#' + item.Id).hasClass('st-selected')) {
                self.vmsBatchArray.push(item);
            }
            else {
                self.vmsBatchArray = _.filter(self.vmsBatchArray, function (vms) {
                    return vms.Id !== item.Id;
                });
            }
        }

        self.workflowBatchOperationOnTasks = {
            notifyName: {
                NotifyName_BatchOperation_OnBatchMarkered: 'VmsTransactionCreateBatchMark'
            },
        };

        function create() {
            self.viewLoading = true;
            var taskIds = _.chain(self.vmsBatchArray)
                            .flatMap('WorkflowAvailableActions')
                            .filter(['TaskResultId', ApplicationConstants.TaskResult.VmsProcessedRecordGenerateTransaction])
                            .map('WorkflowPendingTaskId')
                            .value();

            WorkflowApiService.workflowBatchOperationOnTasksSelected({
                TaskIdsToBatch: taskIds,
                NotifyName_BatchOperation_OnBatchMarkered: self.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered,
                CommandBatchPreExecutionJsonBody: { CommandName: 'BatchPreExecutionOnVMSProcessedRecordToVMSTransaction', WorkflowPendingTaskId: -1 }, CommandBatchThreadExecutionJsonBody: { CommandName: 'BatchThreadExecutionOnVMSProcessedRecordToVMSTransaction' },
            }).then(
                function (success) {
                    // Whatever you place here will be executed after the batch has been processed (maybe in two hours) and will screw up a user action at the moment.
                },
                function (error) {
                    onErrorResponse(error, 'Some of VMS transaction(s) does not valid.');
                    self.vmsBatchArray = [];
                    retrieveClients();
                    self.currentPage = 1;
                    self.callServer(self.vmsTrnTableState, vmsTrnDataParams, self.args);
                }
            );
        }

        function conflict(item, event) {

            var dlg = dialogs.create('/Phoenix/modules/vms/views/VmsConflictReason.html', 'VmsConflictReasonController', {
                recordType: ApplicationConstants.VmsImportedRecordType.Conflict,
            }, {});

            dlg.result.then(function (reason) {
                self.viewLoading = true;
                TransactionApiService.vmsProcessedRecordSetTypeConflict({ WorkflowPendingTaskId: item.WorkflowPendingTaskId, VmsProcessedRecordId: item.Id, ConflictReason: reason }).then(
                function (success) {
                    self.vmsBatchArray = [];
                    if (!self.vmsTrnTableState) {
                        self.vmsTrnTableState = angular.copy(vmsNewTableState);
                    }
                    else {
                        self.vmsTrnTableState.pagination = angular.copy(vmsNewTableState.pagination);
                    }

                    retrieveClients();

                    self.currentPage = 1;
                    self.callServer(self.vmsTrnTableState, vmsTrnDataParams, self.args);

                    common.logSuccess("Item changed status to Conflicted.");
                },
                function (error) {
                    self.vmsBatchArray = [];
                    if (!self.vmsConflictsTableState) {
                        self.vmsConflictsTableState = vmsNewTableState;
                    }
                    else {
                        self.vmsConflictsTableState.pagination = angular.copy(vmsNewTableState.pagination);
                    }

                    retrieveClients();

                    self.currentPage = 1;
                    self.callServer(self.vmsConflictsTableState, vmsTrnDataParams, self.args);

                    onErrorResponse(error, 'VMS transaction object is not valid.');
                });
            }, function () { });

            event.stopPropagation();
        }

        self.clientChanged = function (organizationClient) {

            var isItemSelected = angular.element('#vmsClientOrg' + organizationClient.OrganizationIdClient).hasClass('vms-client-selected');

            self.isUserSelected = true;

            if (isItemSelected) {
                self.args[1] = null;
                self.OrganizationIdClient = null;
            }
            else {
                self.args[1] = organizationClient.OrganizationIdClient;
                self.OrganizationIdClient = organizationClient.OrganizationIdClient;

                if (!self.vmsTrnTableState) {
                    self.vmsTrnTableState = angular.copy(vmsNewTableState);
                }

                self.currentPage = 1;
                self.callServer(self.vmsTrnTableState, vmsTrnDataParams, self.args);
            }
            // Need to trigger resize event to handle height of the newly found data, event of resize found within stRFixedHeader.js
            if (onloadResizeEvent) {
                $(window).trigger('resize');
                onloadResizeEvent = false;
            }

            self.vmsBatchArray = [];
        };

        self.restoreClient = function () {
            self.args[1] = null;
            self.OrganizationIdClient = null;
            self.SelectedClient = null;
            self.vmsBatchArray = [];
            self.isUserSelected = false;
        };

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.viewLoading = false;
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        function retrieveClients() {
            self.viewLoading = true;
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'PreparedCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.PreparedCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
                    });

                    self.clientOrganizations = items;

                    var currentClient = _.filter(self.clientOrganizations, function (co) {
                        return co.OrganizationIdClient == self.OrganizationIdClient;
                    });

                    if (!currentClient || currentClient.length === 0) {
                        self.args[1] = null;
                        self.OrganizationIdClient = null;
                    }
                    self.viewLoading = false;
                },
                function (error) {
                    onErrorResponse(error, "Error while receiving clients.");
                });
        }

        phoenixsocket.onPrivate(self.workflowBatchOperationOnTasks.notifyName.NotifyName_BatchOperation_OnBatchMarkered, function (event, data) {
            // For some reason we may receive duplicate notifications. Process only the first one.
            if (self.viewLoading) {
                // Do not wait until the batch got processed, release the screen as soon as the bach is marked for processing.
                self.viewLoading = false;
                common.logSuccess("Batch Processed");

                self.vmsBatchArray = [];
                if (!self.vmsTrnTableState) {
                    self.vmsTrnTableState = angular.copy(vmsNewTableState);
                }
                else {
                    self.vmsTrnTableState.pagination = angular.copy(vmsNewTableState.pagination);
                }

                self.currentPage = 1;
                self.callServer(self.vmsTrnTableState, vmsTrnDataParams, self.args);
                retrieveClients();
            }
        }).then(function (unregister) {
            if (unregister) {
                unregisterFunctionList.push(unregister);
            }
        });

        $scope.$watch("$destroy", function () {
            if (unregisterFunctionList && unregisterFunctionList.length) {
                for (var i = 0; i < unregisterFunctionList.length; i++) {
                    var obj = unregisterFunctionList[i];
                    if (typeof obj === "function") {
                        obj();
                    }
                }
            }
        });
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.VmsTransactionCreateController = {
        clientOrganizations: ['$q', 'TransactionApiService', '$stateParams', function ($q, TransactionApiService, $stateParams) {
            var result = $q.defer();
            var vmsDataParams = oreq.request().withSelect(['OrganizationIdInternal', 'OrganizationIdClient', 'ClientOrgDisplayName', 'PreparedCount']).url();
            TransactionApiService.getVmsAllItems(vmsDataParams).then(
                function (response) {
                    var items = _.filter(response.Items, function (item) {
                        return item.PreparedCount > 0 && item.OrganizationIdInternal == $stateParams.internalOrganizationId;
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