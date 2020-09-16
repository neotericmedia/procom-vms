(function (angular, app) {
    'use strict';

    var controllerId = 'ComplianceDocumentRuleEditControllerExtendEventsForWorkflow';

    angular
        .module('phoenix.compliancedocumentrule.controllers')
        .controller(controllerId,
        ['self', '$state', 'common', 'dialogs', 'WorkflowApiService', 'ComplianceDocumentRuleApiService', 'commonDataService', ComplianceDocumentRuleEditControllerExtendEventsForWorkflow]);

    function ComplianceDocumentRuleEditControllerExtendEventsForWorkflow(self, $state, common, dialogs, WorkflowApiService, ComplianceDocumentRuleApiService,  commonDataService) {

        self.workflow = {};
        angular.extend(self.workflow, extendByWorkflow(self));
        function extendByWorkflow(selfCommon) {

            var workflowConfig = {
                groupingEntityTypeId: ApplicationConstants.EntityType.ComplianceDocumentRule,
                targetEntityTypeId: ApplicationConstants.EntityType.ComplianceDocumentRule,
                stateIncludesFilter: 'compliancedocument.documentrule.edit',
                commandNameOnEntityDiscard: 'ComplianceDocumentRuleUserActionDiscard',
                stateParams: function (entityId) {
                    return { complianceDocumentRuleId: entityId };
                },
            };

            function onResponseSuccesWatchWorkflowEvent(responseSuccess, successMessage) {
                self.loadItemsPromise = null;
                self.validationMessages = [];
                if (successMessage && successMessage.length > 0) {
                    common.logSuccess(successMessage);
                }

                if (responseSuccess.TaskResultId == ApplicationConstants.TaskResult.Complete && responseSuccess.EntityTypeIdRedirect == ApplicationConstants.EntityType.ComplianceDocumentRule && responseSuccess.EntityIdRedirect > 0) {
                    commonDataService.setWatchConfigOnWorkflowEvent(
                        $state.current.name,//stateNameGo
                        workflowConfig.stateIncludesFilter,
                        workflowConfig.groupingEntityTypeId,
                        workflowConfig.targetEntityTypeId,
                        responseSuccess.EntityId,//targetEntityId
                        workflowConfig.stateParams(responseSuccess.EntityIdRedirect)
                        );
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

            return {
                WorkflowAvailableActions: [],
                SelectedActionId: null,
                getActions: function (version) { WorkflowApiService.getWorkflowAvailableActions(this, version, ApplicationConstants.EntityType.ComplianceDocumentRule); },
                actionButtonOnClick: function (action) {
                    if (action.CommandName == 'ComplianceDocumentRuleUserActionSave') {
                        self.validationMessages = [];
                        ComplianceDocumentRuleApiService.complianceDocumentRuleUserActionSave(self.entity).then(
                           function (responseSuccess) {
                               onResponseSuccesWatchWorkflowEvent(responseSuccess, 'Document Rule Saved');
                           },
                           function (responseError) {
                               onResponseError(responseError, 'Document Rule was NOT saved');
                           });
                        this.WorkflowAvailableActions = [];
                    }
                    else if (action.CommandName == 'ComplianceDocumentRuleUserActionSubmit') {
                        if (!self.validator.tabDetailsIsValid) {
                            common.logError('The ComplianceDocumentRule tabs "Details" and "Roles" are NOT valid');
                            self.workflow.SelectedActionId = null;
                        }
                        else if (!self.validator.tabRulesIsValid) {
                            common.logError('The ComplianceDocumentRule tab "Rules" is NOT valid');
                            self.workflow.SelectedActionId = null;
                        }
                        else {
                            self.validationMessages = [];
                            ComplianceDocumentRuleApiService.complianceDocumentRuleUserActionSubmit(self.entity).then(
                               function (responseSuccess) {
                                   onResponseSuccesWatchWorkflowEvent(responseSuccess, 'Document Rule Submitted');
                               },
                               function (responseError) {
                                   onResponseError(responseError, 'Document Rule is NOT valid');
                               });
                            this.WorkflowAvailableActions = [];
                        }
                    }
                    else {
                        var dialogHeader = 'Are you sure you want to ' + action.Name + ' this Document Rule?';
                        var successMessage = action.Name;
                        if (action.CommandName == 'ComplianceDocumentRuleUserActionOriginalCorrect') {
                            dialogHeader = 'Are you sure you want to make a correction to this Document Rule?';
                            successMessage = 'Document Rule Correction';
                        }
                        else if (action.CommandName == 'ComplianceDocumentRuleUserActionApprovalRecall') {
                            dialogHeader = 'Are you sure you want to recall this Document Rule?';
                            successMessage = 'Document Rule Recalled';
                        }
                        else if (action.CommandName == 'ComplianceDocumentRuleUserActionApprovalApprove') {
                            dialogHeader = 'Are you sure you want to approve this Document Rule?';
                            successMessage = 'Document Rule Approved';
                        }
                        else if (action.CommandName == 'ComplianceDocumentRuleUserActionDiscard') {
                            dialogHeader = 'Are you sure you want to Discard this Document Rule?';
                            successMessage = 'Document Rule Discarded';
                        }
                        else if (action.CommandName == 'ComplianceDocumentRuleUserActionApprovalDecline') {
                            dialogHeader = 'Are you sure you want to Decline this Document Rule?';
                            successMessage = 'Document Rule Declined';
                        }
                        dialogs.confirm('Document Rule Action', dialogHeader).result.then(function (btn) {
                            self.workflow.SelectedActionId = null;
                            self.workflow.WorkflowIsRunning = true;
                            self.validationMessages = null;

                            selfCommon.loadItemsPromise = WorkflowApiService.executeAction(action, ApplicationConstants.EntityType.ComplianceDocumentRule, $state.params.complianceDocumentRuleId).then(
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