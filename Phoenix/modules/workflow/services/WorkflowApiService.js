(function (services) {
    'use strict';

    var serviceId = 'WorkflowApiService';
    angular.module('phoenix.workflow.services').factory(serviceId, ['$rootScope', 'phoenixapi', 'common', 'commonDataService', 'dialogs', WorkflowApiService]);

    function WorkflowApiService($rootScope, phoenixapi, common, commonDataService, dialogs) {

        common.setControllerName(serviceId);
        var $q = common.$q;

        var service = {
            //  ==============  queryes:    ==============
            getWorkflowEventsHistory: getWorkflowEventsHistory,                                 //used for: WorkflowEventsHistoryDirective.js
            getTasksAvailableActionsByTargetEntity: getTasksAvailableActionsByTargetEntity,     //used for: AssignmentEventHandlerController.js, TransactionViewController.js(198)
            getWorkflowAvailableActions: getWorkflowAvailableActions,
            //  ==============  commands:    ==============
            executeCommand: executeCommand,
            executeAction: executeAction,
            workflowBatchOperationOnTasksSelected: workflowBatchOperationOnTasksSelected,
        };

        //  ==============  queryes:    ==============
        function getWorkflowEventsHistory(entityTypeId, entityId) {
            return phoenixapi.query('task/getWorkflowEventsHistory/entityType/' + entityTypeId + '/entity/' + entityId);
        }
        function getTasksAvailableActionsByTargetEntity(targetEntityTypeId, targetEntityId) {
            var deferred = $q.defer();
            phoenixapi.query('task/getTasksAvailableActionsByTargetEntity/targetEntityTypeId/' + targetEntityTypeId + '/targetEntityId/' + targetEntityId).then(
                function (responseSucces) { deferred.resolve(responseSucces.Items); },
                function (responseError) { deferred.reject(responseError); });
            return deferred.promise;
        }
        function getWorkflowAvailableActions(workflow, version, targetEntityType) {
            var deferred = $q.defer();
            workflow.WorkflowAvailableActions = [];
            version.WorkflowPendingTaskId = -1;
            if (version.WorkflowAvailableActions instanceof Array && version.WorkflowAvailableActions.length > 0) {
                var actions = [];
                angular.forEach(version.WorkflowAvailableActions, function (routing) {
                    actions.push(routing);
                });
                workflow.WorkflowAvailableActions = actions;
            }
            else if (version.Id > 0) {
                getTasksAvailableActionsByTargetEntity(targetEntityType, version.Id).then(
                    function (responseSuccess) {
                        if (responseSuccess instanceof Array && responseSuccess.length > 0) {
                            version.WorkflowPendingTaskId = responseSuccess[0].WorkflowPendingTaskId;
                            var actions = [];
                            angular.forEach(responseSuccess, function (workflowTask) {
                                angular.forEach(workflowTask.WorkflowAvailableActions, function (action) {
                                    actions.push(action);
                                });
                            });
                            workflow.WorkflowAvailableActions = actions;
                            deferred.resolve(responseSuccess);
                        }
                        else {
                            deferred.resolve(responseSuccess);
                        }
                    },
                    function (responseError) {
                        deferred.reject(version);
                    });
            }
            else {
                deferred.reject();
            }
            return deferred.promise;
        }
        //  ==============  commands:    ==============
        function executeCommand(command) {
            return phoenixapi.command(command);
        }
        function executeAction(action, entityTypeId, entityId) {
            var deferred = $q.defer();

            function completeActionSuccessDialog(action) {
                // custom success messages per entity
                if (entityTypeId == ApplicationConstants.EntityType.TimeSheet) {
                    switch (action.TaskResultId) {
                        case ApplicationConstants.TaskResult.Decline:
                            common.logSuccess("Timesheet Declined");
                            break;
                        case ApplicationConstants.TaskResult.Approve:
                            common.logSuccess("Timesheet Approved Successfully");
                            break;
                        default:
                            common.logSuccess('Request processed');
                    }
                }
                else if (entityTypeId == ApplicationConstants.EntityType.WorkOrderVersion) {
                    switch (action.TaskResultId) {
                        case ApplicationConstants.TaskResult.Decline:
                            common.logSuccess("WorkOrder Declined");
                            break;
                        case ApplicationConstants.TaskResult.Approve:
                            common.logSuccess("WorkOrder Approved Successfully");
                            break;
                        default:
                            common.logSuccess('Request processed');
                    }
                }
                else {
                    common.logSuccess('Request processed');
                }
            }

            function actionToCommand(action, entityTypeId, entityId) {
                var deferred = $q.defer();
                if (typeof entityTypeId !== 'undefined' && entityTypeId > 0 && typeof entityId !== 'undefined' && entityId > 0) {
                    var command = {};
                    if (entityTypeId == ApplicationConstants.EntityType.Organization) {
                        command = {
                            CommandName: action.CommandName,
                            OrganizationId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.WorkOrderVersion) {
                        command = {
                            CommandName: action.CommandName,
                            WorkOrderVersionId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.TimeSheet) {
                        command = {
                            CommandName: action.CommandName,
                            TimeSheetId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.Payment) {
                        command = {
                            CommandName: action.CommandName,
                            PaymentId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.PaymentReleaseBatch) {
                        command = {
                            CommandName: action.CommandName,
                            PaymentReleaseBatchId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.AccessSubscription) {
                        command = {
                            CommandName: action.CommandName,
                            AccessSubscriptionId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.ComplianceDocumentRule) {
                        command = {
                            CommandName: action.CommandName,
                            ComplianceDocumentRuleId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.ComplianceDocument) {
                        command = {
                            CommandName: action.CommandName,
                            ComplianceDocumentId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else if (entityTypeId == ApplicationConstants.EntityType.VmsDocument) {
                        command = {
                            CommandName: action.CommandName,
                            VmsDocumentId: entityId,
                            WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        };
                    }
                    else {
                        alert('Developer notification: Update required FROM "WorkflowApiService.executeAction(action);" TO "WorkflowApiService.executeAction(action, entityTypeId, entityId);"');
                        //command = {
                        //    CommandName: action.CommandName,
                        //    EntityTypeId: entityTypeId,
                        //    EntityId: entityId,
                        //    WorkflowPendingTaskId: action.WorkflowPendingTaskId,
                        //};
                    }

                    if (typeof action.Comments !== 'undefined' && action.Comments !== null) {
                        command.Comments = action.Comments;
                    }

                    phoenixapi.command(command).then(
                        function (responseSucces) {
                            deferred.resolve(responseSucces);
                            completeActionSuccessDialog(action);
                            if (typeof action.stopLoading === 'function') {
                                action.stopLoading();
                            }
                        }, function (responseError) {
                            deferred.reject(responseError);
                            if (typeof action.stopLoading === 'function') {
                                action.stopLoading();
                            }
                        });
                }
                else {
                    phoenixapi.command(action.PendingCommandName, action).then(
                        function (responseSucces) {
                            deferred.resolve(responseSucces);
                            completeActionSuccessDialog(action);
                            if (typeof action.stopLoading === 'function') {
                                action.stopLoading();
                            }
                        }, function (responseError) {
                            deferred.reject(responseError);
                            if (typeof action.stopLoading === 'function') {
                                action.stopLoading();
                            }
                        });
                }
                return deferred.promise;
            }

            if (action.TaskRoutingDialogTypeId == ApplicationConstants.TaskRoutingDialogType.Decline) {
                var dialogConfig = (action.TaskResultId == ApplicationConstants.TaskResult.Decline ||
                    action.TaskResultId == ApplicationConstants.TaskResult.ComplianceDocumentRuleActionApprovalDecline ||
                    action.TaskResultId == ApplicationConstants.TaskResult.DeclineTimeSheet) ?
                    {
                        title: 'Decline',
                        inputname: 'Enter the decline reason:',
                        helpblock: 'Reason for declining must be entered',
                        saveButtonText: 'Decline',
                        cancelButtonText: 'Cancel',
                        maxlength: action.TaskResultId == ApplicationConstants.TaskResult.ComplianceDocumentRuleActionApprovalDecline ? 4000 : 32000,
                    }
                    : {};
                var dlg = dialogs.create('/dialogs/dialogCommentTemplate.html', 'dialogCommentController', dialogConfig, { keyboard: false, backdrop: 'static' });
                dlg.result.then(
                    function (comments) {
                        if (typeof action.startLoading === 'function') {
                            action.startLoading();
                        }
                        action.Comments = comments;
                        actionToCommand(action, entityTypeId, entityId).then(
                            function (responseSucces) {
                                deferred.resolve(responseSucces);
                            },
                            function (responseError) {
                                deferred.reject(responseError);
                            });

                    },
                    function () {
                        action.Comments = '';
                        var watchConfigOnWorkflowEvent = commonDataService.getWatchConfigOnWorkflowEvent();
                        if (watchConfigOnWorkflowEvent !== null &&
                            angular.isString(watchConfigOnWorkflowEvent.stateNameGo) &&
                            watchConfigOnWorkflowEvent.stateNameGo.length > 0 &&
                            watchConfigOnWorkflowEvent.stateParamMapping !== null) {
                            $rootScope.$state.transitionTo(watchConfigOnWorkflowEvent.stateNameGo, watchConfigOnWorkflowEvent.stateParamMapping, { reload: true, inherit: true, notify: true });
                        }
                    });
            }
            else {
                if (typeof action.startLoading === 'function') {
                    action.startLoading();
                }
                actionToCommand(action, entityTypeId, entityId).then(
                    function (responseSucces) {
                        deferred.resolve(responseSucces);
                    },
                    function (responseError) {
                        deferred.reject(responseError);
                    });
            }

            return deferred.promise;
        }
        function workflowBatchOperationOnTasksSelected(command) {
            //if (typeof command.WorkflowPendingTaskId === 'undefined' || command.WorkflowPendingTaskId === null) {
            //    jQuery.extend(command, { WorkflowPendingTaskId: -1 });
            //}

            if (typeof command.CommandBatchPreExecutionJsonBody !== 'string') {
                command.CommandBatchPreExecutionJsonBody = JSON.stringify(command.CommandBatchPreExecutionJsonBody);
            }

            if (command.CommandBatchPreExecutionManipulationJsonBody && typeof command.CommandBatchPreExecutionManipulationJsonBody !== 'string') {
                command.CommandBatchPreExecutionManipulationJsonBody = JSON.stringify(command.CommandBatchPreExecutionManipulationJsonBody);
            }

            if (typeof command.CommandBatchThreadExecutionJsonBody !== 'string') {
                command.CommandBatchThreadExecutionJsonBody = JSON.stringify(command.CommandBatchThreadExecutionJsonBody);
            }
            return phoenixapi.command('WorkflowBatchOperationOnTasksSelected', command);
        }
        return service;
    }
}(Phoenix.Services));