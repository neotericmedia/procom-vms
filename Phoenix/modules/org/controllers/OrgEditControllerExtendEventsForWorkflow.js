(function (angular, app) {
    'use strict';

    var controllerId = 'OrgEditControllerExtendEventsForWorkflow';

    angular
        .module('phoenix.org.controllers')
        .controller(controllerId,
            ['self', '$state', 'common', 'dialogs', 'WorkflowApiService', 'OrgApiService', 'AssignmentDataService', 'commonDataService', OrgEditControllerExtendEventsForWorkflow]);

    function OrgEditControllerExtendEventsForWorkflow(self, $state, common, dialogs, WorkflowApiService, OrgApiService, AssignmentDataService, commonDataService) {

        self.workflow = {
            isSubmitted: false
        };

        angular.extend(self.workflow, extendByWorkflow(self));
        function extendByWorkflow(selfCommon) {

            var workflowConfig = {
                groupingEntityTypeId: ApplicationConstants.EntityType.Organization,
                targetEntityTypeId: ApplicationConstants.EntityType.Organization,
                stateIncludesFilter: 'org.edit',
                commandNameOnEntityDiscard: 'OrganizationDiscard',
                stateParams: function (entityId) {
                    return { organizationId: entityId };
                },
            };

            function validateCommand(commandName) {
                if (commandName == 'OrganizationSubmit' || commandName == 'OrganizationFinalize' || commandName == 'OrganizationApprovalApprove') {

                    var tabsInvalid = [];
                    if (!self.validator.tabDetailsIsValid) {
                        tabsInvalid.push("Details");
                    }
                    if (!self.validator.tabRolesIsValid) {
                        tabsInvalid.push("Roles");
                    }
                    if (!self.validator.tabCollaboratorsIsValid) {
                        tabsInvalid.push("Collaborators")
                    }

                    if (tabsInvalid.length > 0) {
                        if (tabsInvalid.length > 1) {
                            common.logError('The following Organization tabs are NOT valid: ' + tabsInvalid.join(', '));
                        } else {
                            common.logError('The Organization tab "' + tabsInvalid[0] + '" is NOT valid');
                        }

                        return false;
                    }
                }

                return true;
            }

            function onResponseSuccesWatchWorkflowEvent(responseSuccess, successMessage) {
                self.loadItemsPromise = null;
                self.validationMessages = null;
                if (successMessage && successMessage.length > 0) {
                    common.logSuccess(successMessage);
                }

                if (responseSuccess.TaskResultId == ApplicationConstants.TaskResult.Complete && responseSuccess.EntityTypeIdRedirect == ApplicationConstants.EntityType.Organization && responseSuccess.EntityIdRedirect > 0) {
                    commonDataService.setWatchConfigOnWorkflowEvent(
                        $state.current.name,//stateNameGo
                        workflowConfig.stateIncludesFilter,
                        workflowConfig.groupingEntityTypeId,
                        workflowConfig.targetEntityTypeId,
                        responseSuccess.EntityId,//targetEntityId
                        workflowConfig.stateParams(responseSuccess.EntityIdRedirect)
                    );
                }
                else if (responseSuccess.TaskResultId == ApplicationConstants.TaskResult.Complete && responseSuccess.CommandName == workflowConfig.commandNameOnEntityDiscard) {
                    //  implemented under: 
                    //  1. OrganizationDeleteHandler.cs:   this.Notify(new Procom.Phoenix.CQL.Events.NonWorkflowEvent
                    //  2. RootController.js:              phoenixsocket.onPublic('NonWorkflowEvent', function (event, data):   if ($rootScope.$state.includes('org.edit')
                }
                else {
                    commonDataService.setWatchConfigOnWorkflowEvent(
                        $state.current.name,//stateNameGo
                        workflowConfig.stateIncludesFilter,
                        workflowConfig.groupingEntityTypeId,
                        workflowConfig.targetEntityTypeId,
                        responseSuccess.EntityId,//targetEntityId
                        workflowConfig.stateParams(responseSuccess.EntityId)
                    );
                }
            }
            function onResponseError(responseError, errorMessage) {
                self.loadItemsPromise = null;
                self.validationMessages = common.responseErrorMessages(responseError);
                self.workflow.SelectedActionId = null;
                self.workflow.WorkflowIsRunning = false;
                self.workflow.getActions(self.entity);
                if (errorMessage && errorMessage.length > 0) {
                    common.logError(errorMessage);
                }
            }

            function copyCppToQpp(entity){
                if(entity.OrganizationClientRoles.length > 0){
                    entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecPensionPlanForSP = entity.OrganizationClientRoles[0].IsAccrueMaxedOutCanadaPensionPlanForSP;
                    entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecPensionPlanForTemp = entity.OrganizationClientRoles[0].IsAccrueMaxedOutCanadaPensionPlanForTemp;
                }
            }

            return {
                WorkflowAvailableActions: [],
                SelectedActionId: null,
                getActions: function (version) { 
                    WorkflowApiService.getWorkflowAvailableActions(this, version, ApplicationConstants.EntityType.Organization).then(
                        function (responseSuccess) {
                            var cancelButtonAdded = false;
                            angular.forEach(self.workflow.WorkflowAvailableActions, function (action) {
                                if (action.CommandName == 'OrganizationSave' && !cancelButtonAdded &&
                                    (version.OrganizationStatusId == ApplicationConstants.OrganizationStatus.Draft ||
                                     version.OrganizationStatusId == ApplicationConstants.OrganizationStatus.Recalled ||
                                     version.OrganizationStatusId == ApplicationConstants.OrganizationStatus.Declined ||
                                     version.OrganizationStatusId == ApplicationConstants.OrganizationStatus.ComplianceDraft ||
                                     version.OrganizationStatusId == ApplicationConstants.OrganizationStatus.RecalledCompliance)
                                    ) 
                                {
                                    self.workflow.WorkflowAvailableActions.push({Name: 'Cancel', CommandName: 'OrganizationDiscardChanges', IsActionButton: true, DisplayButtonOrder: 0});
                                    cancelButtonAdded = true;
                                }
                            });
                        },
                        function (responseError) {
                        }

                    );
                },
                actionButtonOnClick: function (action) {
                    copyCppToQpp(self.entity);
                    if (!validateCommand(action.CommandName)) {
                        self.workflow.SelectedActionId = null;
                        return;
                    }

                    if (action.CommandName == 'OrganizationSave') {
                        self.validationMessages = [];
                        OrgApiService.organizationSave(self.entity).then(
                            function (responseSuccess) {
                                onResponseSuccesWatchWorkflowEvent(responseSuccess, 'Organization Saved');
                            },
                            function (responseError) {
                                onResponseError(responseError, 'Organization was NOT saved');
                            });
                        this.WorkflowAvailableActions = [];
                    }
                    else if (action.CommandName == 'OrganizationSubmit') {
                        self.workflow.isSubmitted = true;
                        self.validationMessages = [];
                        OrgApiService.organizationSubmit(self.entity).then(
                            function (responseSuccess) {
                                AssignmentDataService.delListOrganizationClient();
                                AssignmentDataService.delListOrganizationSupplier();
                                onResponseSuccesWatchWorkflowEvent(responseSuccess, 'Organization Submitted');
                            },
                            function (responseError) {
                                var validationMessages = common.responseErrorMessages(responseError);
                                if (validationMessages && validationMessages.length > 0) {
                                    angular.forEach(validationMessages, function (validationMessage) {
                                        common.logError(validationMessage.Message);
                                    });
                                }
                                // need to refresh to get created ids for org roles
                                $state.transitionTo('org.edit.details', { organizationId: $state.params.organizationId }, { reload: true, inherit: true, notify: true });
                            }).finally(function () {
                                self.workflow.isSubmitted = false;
                            });
                        this.WorkflowAvailableActions = [];
                    }
                    else if (action.CommandName == 'OrganizationFinalize') {
                        self.workflow.isSubmitted = true;
                        self.validationMessages = [];
                        OrgApiService.organizationFinalize(self.entity).then(
                            function (responseSuccess) {
                                AssignmentDataService.delListOrganizationClient();
                                AssignmentDataService.delListOrganizationSupplier();
                                onResponseSuccesWatchWorkflowEvent(responseSuccess, 'Organization Finalized');
                            },
                            function (responseError) {
                                var validationMessages = common.responseErrorMessages(responseError);
                                if (validationMessages && validationMessages.length > 0) {
                                    angular.forEach(validationMessages, function (validationMessage) {
                                        common.logError(validationMessage.Message);
                                    });
                                }
                                // need to refresh to get created ids for org roles
                                $state.transitionTo('org.edit.details', { organizationId: $state.params.organizationId }, { reload: true, inherit: true, notify: true });
                            }).finally(function () {
                                self.workflow.isSubmitted = false;
                            });
                        this.WorkflowAvailableActions = [];
                    }
                    else if (action.CommandName == 'OrganizationDiscardChanges') {
                        $state.reload();
                    }
                    else {
                        var dialogHeader = 'Are you sure you want to make a ' + action.Name + ' to this Organization?';
                        var successMessage = action.Name;
                        if (action.CommandName == 'OrganizationOriginalCorrect') {
                            dialogHeader = 'Are you sure you want to make a correction to this Organization?';
                            successMessage = 'Organization Correction';
                        }
                        else if (action.CommandName == 'OrganizationApprovalRecall') {
                            dialogHeader = 'Are you sure you want to recall this Organization to Draft?';
                            successMessage = 'Organization Recalled to Draft';
                        }
                        else if (action.CommandName == 'OrganizationApprovalRecallCompliance') {
                            dialogHeader = 'Are you sure you want to recall this Organization to Compliance?';
                            successMessage = 'Organization Recalled to Compliance';
                        }
                        else if (action.CommandName == 'OrganizationApprovalApprove') {
                            dialogHeader = 'Are you sure you want to approve this Organization?';
                            successMessage = 'Organization Approved';
                        }
                        dialogs.confirm('Organization Action', dialogHeader).result.then(function (btn) {
                            self.workflow.SelectedActionId = null;
                            self.workflow.WorkflowIsRunning = true;
                            self.validationMessages = null;

                            commonDataService.setWatchConfigOnWorkflowEvent(
                                $state.current.name,//stateNameGo
                                workflowConfig.stateIncludesFilter,
                                workflowConfig.groupingEntityTypeId,
                                workflowConfig.targetEntityTypeId,
                                self.entity.Id,//targetEntityId
                                workflowConfig.stateParams(self.entity.Id)
                            );

                            selfCommon.loadItemsPromise = WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.Organization, $state.params.organizationId).then(
                                function (responseSuccess) {
                                    onResponseSuccesWatchWorkflowEvent(responseSuccess, successMessage);
                                },
                                function (responseError) {
                                    onResponseError(responseError);
                                });

                        }, function (btn) {
                            self.workflow.SelectedActionId = null;
                        });

                    }
                },
            };
        }
        self.workflow.getActions(self.entity);
    }

})(angular, Phoenix.App);