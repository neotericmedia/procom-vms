(function (angular, app) {
    'use strict';
    var controllerId = 'CommissionRateController';

    angular.module('phoenix.commission.controllers').controller(controllerId, ['$state', '$scope', 'dialogs', 'common', 'resolveModel', 'resolveCodeValueLists', 'resolveListOrganizationInternal', 'resolveListOrganizationClient', 'NavigationService', 'CodeValueService', 'WorkflowApiService', 'TemplateApiService', 'commonDataService', CommissionRateController]);

    function CommissionRateController($state, $scope, dialogs, common, resolveModel, resolveCodeValueLists, resolveListOrganizationInternal, resolveListOrganizationClient, NavigationService, CodeValueService, WorkflowApiService, TemplateApiService, commonDataService) {
        var self = this;
        common.setControllerName(controllerId);

        $scope.templateControl = {};

        function onLoad() {
            if ((typeof resolveModel === 'undefined' || resolveModel === null || common.isEmptyObject(resolveModel)) ||
                (typeof resolveModel.model === 'undefined' || resolveModel.model === null || common.isEmptyObject(resolveModel.model))) {
                return;
            }

            getMissedStateParams();

            angular.extend(self, {
                model: resolveModel.model,
                TemplateLastModifiedDateTime: resolveModel.TemplateLastModifiedDateTime,
                common: {
                    validationMessages: [],
                    workflow: {},
                    lists: resolveCodeValueLists,
                    currentVersion: resolveModel.model.CommissionRateVersions[0],
                    loadItemsPromise: null,
                    customStatusId: null,
                    customStatusType: {
                        TemplateEdit: 0,
                        ToCorrect: 1,
                        ToScheduleChange: 2,
                        ToManageRestrictions: 3
                    },
                    filterScheduledChangeRateApplication: filterScheduledChangeRateApplication
                },

                tab: {
                    configList: [
                        { state: 'commission.rate.details', name: 'details', displayText: 'Details', icon: null },
                        { state: 'commission.rate.workorders', name: 'workorders', displayText: 'Work Orders', icon: null },
                    ],
                    onClick: function (tab) {
                        $state.go(tab.state);
                    },
                    show: function() {
                        if ($state.includes('commission.ratecreate') || $state.includes('commission.templateedit')) {
                            self.tab.configList = [];
                        }
                    }
                },
            });

            if ($state.includes('commission.templateedit')) {
                self.common.customStatusId = self.common.customStatusType.TemplateEdit;
            }

            self.tab.show();
            
            // NavigationService.setTitle((self.common.customStatusId == self.common.customStatusType.TemplateEdit ? 'Template Edit for role: ' : '') + CodeValueService.getCodeValue(self.model.CommissionRoleId, CodeValueGroups.CommissionRole).text, 'icon icon-commission');
            var profileName = resolveModel.model.CommissionUserProfileFirstName + ' ' + resolveModel.model.CommissionUserProfileLastName;
            NavigationService.setTitle('commission-rate-viewedit', [profileName]);
            angular.extend(self.common.lists, {
                listOrganizationInternal: resolveListOrganizationInternal,
                listOrganizationClient: resolveListOrganizationClient
            });
            angular.extend(self.common, extendSelfByCommon(self.common));
            angular.extend(self.common.workflow, extendByWorkflow(self.common));
            angular.extend(self.common, extendByFilters(self.common));
            angular.extend(self.common, extendByValidators(self.common));
            self.common.currentVersionSet($state.params.commissionRateVersionId);
            angular.extend(self.common, extendByFieldViewConfig(self.common));

            self.common.commissionRateRestrictionsToValid();

            //if (self.common.currentVersion.CommissionRateVersionStatusId == ApplicationConstants.CommissionRateVersionStatus.New) {
            //    var listScheduledChangeRateApplicationTmp = [];
            //    angular.forEach(self.common.lists.listScheduledChangeRateApplication, function (item) {
            //        if (item.id === ApplicationConstants.ScheduledChangeRateApplication.AllWorkOrders) {
            //            listScheduledChangeRateApplicationTmp.push(item);
            //        }
            //    });
            //    self.common.lists.listScheduledChangeRateApplication = listScheduledChangeRateApplicationTmp;
            //}
        }

        onLoad();

        function filterScheduledChangeRateApplication() {
            return function (val, idx, arr) {
                if ((self.common.currentVersion.CommissionRateVersionStatusId == ApplicationConstants.CommissionRateVersionStatus.New) || (self.common.customStatusId == self.common.customStatusType.ToCorrect && moment(self.common.currentVersion.EffectiveDate).isSame(_.chain(self.model.CommissionRateVersions).map(function (val) {
                        return moment(val.EffectiveDate);
                    }).min().value(), 'day'))) {
                    return val.id === ApplicationConstants.ScheduledChangeRateApplication.AllWorkOrders;
                } else {
                    return true;
                }
            };
        }

        function onEvent() {
            self.common.workflow.SelectedActionId = null;
            self.common.workflow.WorkflowIsRunning = true;
            self.common.validationMessages = null;
        }

        function onResponseSuccesWatchWorkflowEvent(commissionRateVersionId, stateNameGo, successMessage) {
            self.common.loadItemsPromise = null;
            self.common.validationMessages = null;
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            var stateIncludesFilter = $state.includes('commission.ratecreate') ? 'commission.ratecreate' : 'commission.rate';
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, stateIncludesFilter, ApplicationConstants.EntityType.CommissionRateHeader, ApplicationConstants.EntityType.CommissionRateVersion, commissionRateVersionId, {
                commissionRateHeaderId: 0,
                commissionRateVersionId: commissionRateVersionId
            });
        }

        function onResponseSuccesStateGo(commissionRateVersionId, stateNameGo, successMessage) {
            self.common.loadItemsPromise = null;
            self.common.validationMessages = null;
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            $state.transitionTo('commission.rate.details', {
                commissionRateHeaderId: 0,
                commissionRateVersionId: commissionRateVersionId
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        }

        function onResponseError(responseError) {
            self.common.loadItemsPromise = null;
            self.common.workflow.WorkflowIsRunning = false;
            self.common.validationMessages = common.responseErrorMessages(responseError, 'Warning');
        }

        function getMissedStateParams() {

            function getHeaderIds(header, ids) {
                var headerId = ids.headerId;
                var versionId = ids.versionId;
                if (header) {
                    headerId = (!headerId && headerId > 0) ? headerId : header.Id;
                    if (!versionId || versionId < 1) {
                        var versionWithMaxId = _.max(header.CommissionRateVersions, function (version) {
                            return version.Id;
                        });
                        versionId = versionWithMaxId.Id;
                    }
                }
                ids.headerId = headerId;
                ids.versionId = versionId;
                return ids;
            }

            if ((($state.params.commissionUserProfileId === undefined || $state.params.commissionUserProfileId === null) && ($state.params.commissionRoleId === undefined || $state.params.commissionRoleId === null) && ($state.params.commissionRateTypeId === undefined || $state.params.commissionRateTypeId === null)) &&
                ($state.params.commissionRateHeaderId === null ||
                    typeof $state.params.commissionRateHeaderId === 'undefined' ||
                    $state.params.commissionRateHeaderId < 1 ||
                    $state.params.commissionRateVersionId === null ||
                    typeof $state.params.commissionRateVersionId == 'undefined' ||
                    $state.params.commissionRateVersionId < 1)) {
                var ids = {
                    headerId: $state.params.commissionRateHeaderId,
                    versionId: $state.params.commissionRateVersionId
                };
                getHeaderIds(resolveModel.model, ids);
                if ($state.params.commissionRateHeaderId != ids.headerId || $state.params.commissionRateVersionId != ids.versionId) {
                    $state.go('commission.rate.details', {
                        commissionRateHeaderId: ids.headerId,
                        commissionRateVersionId: ids.versionId
                    }, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }
        }

        function extendSelfByCommon(selfCommon) {
            return {
                floatApplySpecifiedNumberOfDecimalPlaces: function (c, n) {
                    return common.floatApplySpecifiedNumberOfDecimalPlaces(c, n);
                },
                datePickerCallbackOnDoneEffectiveDate: function () {
                    selfCommon.currentVersion.EffectiveDate = selfCommon.currentVersion.EffectiveDate > new Date() ? selfCommon.currentVersion.EffectiveDate : new Date();
                },
                currentVersionSet: function (versionId) {
                    if (versionId !== undefined && versionId > 0) {
                        selfCommon.currentVersion = null;
                        if (typeof versionId !== 'undefined') {
                            selfCommon.currentVersion = angular.copy(_.find(self.model.CommissionRateVersions, function (version) {
                                return version.Id == versionId;
                            }));
                            selfCommon.customStatusId = null;
                            selfCommon.validationMessages = [];
                            selfCommon.workflow.SelectedActionId = null;
                            selfCommon.workflow.getActions(selfCommon.currentVersion);
                        }
                    }
                },
                currentVersionGet: function () {
                    return selfCommon.currentVersion;
                },
                onVersionClick: function (version) {
                    if (selfCommon.currentVersion.CommissionRateVersionStatusId == ApplicationConstants.CommissionRateVersionStatus.New ||
                        selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect ||
                        selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange ||
                        selfCommon.customStatusId == selfCommon.customStatusType.ToManageRestrictions
                    ) {
                        common.logWarning('Option to change version is disabled in "Edit" mode');
                    } else {
                        $state.go('commission.rate.details', {
                            commissionRateHeaderId: $state.params.commissionRateHeaderId,
                            commissionRateVersionId: version.Id
                        }, {
                            notify: false
                        });
                        this.currentVersionSet(version.Id);
                    }
                },
            };
        }

        function extendByWorkflow(selfCommon) {
            function setActionNameToPast(actionName) {
                var result = actionName;
                var lastSymbol = actionName.slice(-1);
                if (lastSymbol == 'e') {
                    result += 'd';
                } else if (lastSymbol == 't') {
                    result += 'ted';
                } else {
                    result += 'ed';
                }
                return result;
            }

            function actionExecute(local, version, actionName, actionCommandName, actionCommandBody) {
                dialogs.confirm('Commission Rate Action', 'Are you sure you want to ' + actionName + ' this Commission Rate?').result.then(
                    function (btn) {
                        onEvent();
                        // actionCommandBody = actionCommandBody || {
                        //     EntityIds: [ $state.params.commissionRateHeaderId ],
                        //     EntityTypeId: ApplicationConstants.EntityType.CommissionRateHeader,
                        //     WorkflowPendingTaskId: (actionCommandName === 'CommissionRateHeaderNew') ? -1 : version.WorkflowPendingTaskId,
                        //     CommandName: actionCommandName,
                        //     Id: $state.params.commissionRateHeaderId,
                        //     CommissionRateVersion: version,
                        //     Description: self.model.Description,
                        //     CommissionRateRestrictions: self.model.CommissionRateRestrictions
                        // };
                        actionCommandBody = Object.assign({
                            EntityIds: [ $state.params.commissionRateHeaderId ],
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateHeader,
                            WorkflowPendingTaskId: (actionCommandName === 'CommissionRateHeaderNew') ? -1 : version.WorkflowPendingTaskId,
                            CommandName: actionCommandName,
                            Id: $state.params.commissionRateHeaderId,
                            CommissionRateVersion: version,
                            Description: self.model.Description,
                            CommissionRateRestrictions: self.model.CommissionRateRestrictions
                        }, actionCommandBody);
                        
                        executeCommand(local, actionName, actionCommandBody);
                    },
                    function (btn) {
                        local.SelectedActionId = null;
                    });
            }

            function executeCommand(local, actionName, actionCommandBody) {
                selfCommon.loadItemsPromise = WorkflowApiService.executeCommand(actionCommandBody).then(
                    function (responseSucces) {
                        if (responseSucces.TaskResultId == ApplicationConstants.TaskResult.CommissionRateDuplicateFound) {
                            dialogs.confirm('Duplicate Commission Rate Found', 'A different commission rate with the same settings and restrictions already exists for this person. Are you sure you want to ' + actionName + ' this Commission Rate?').result.then(
                                function (btn) {
                                    actionCommandBody.ForceCreation = true;
                                    executeCommand(local, actionName, actionCommandBody);
                                });
                        } else {
                            var stateNameGo = $state.includes('commission.ratecreate') ? 'commission.rate.details' : $state.current.name;
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, stateNameGo, 'Commission Rate ' + setActionNameToPast(actionName));
                        }
                    },
                    function (responseError) {
                        onResponseError(responseError);
                    });
            }

            return {
                WorkflowAvailableActions: [],
                SelectedActionId: null,
                getActions: function (version) {
                    WorkflowApiService.getWorkflowAvailableActions(this, version, ApplicationConstants.EntityType.CommissionRateVersion);
                },
                actionButtonOnClick: function (version, action) {
                    if (action.CommandName == 'CommissionRateVersionCorrect') {
                        selfCommon.customStatusId = selfCommon.customStatusType.ToCorrect;
                        this.WorkflowAvailableActions = [];
                    } else if (action.CommandName == 'CommissionRateVersionScheduleChange') {
                        selfCommon.customStatusId = selfCommon.customStatusType.ToScheduleChange;
                        version.EffectiveDate = null;
                        this.WorkflowAvailableActions = [];
                    } else if (action.CommandName == 'CommissionRateManageRestrictions') {
                        selfCommon.customStatusId = selfCommon.customStatusType.ToManageRestrictions;
                        this.WorkflowAvailableActions = [];
                    } else if (action.CommandName == 'CommissionRateDelete') {
                        this.customButtonOnClick(version, action.CommandName)
                    } else if (action.CommandName == 'SaveAsTemplate') {
                        var commissionTemplate = TemplateApiService.commissionToTemplate(self.model.CommissionRoleId, self.model.CommissionRateTypeId, self.model.Description, selfCommon.currentVersion.Percentage, self.model.CommissionRateRestrictions);
                        $scope.templateControl.openDialog(ApplicationConstants.EntityType.CommissionRateHeader, commissionTemplate).then(function (result) {
                            common.logSuccess('Commission Template Created');
                        });
                    } else if (action.CommandName == 'UpdateTemplate') {
                        var updateTemplateBody = {
                            TemplateId: $state.params.templateId,
                            LastModifiedDatetime: self.TemplateLastModifiedDateTime,
                            TemplateBody: TemplateApiService.commissionToTemplate(self.model.CommissionRoleId, self.model.CommissionRateTypeId, self.model.Description, selfCommon.currentVersion.Percentage, self.model.CommissionRateRestrictions)
                        };
                        TemplateApiService.updateTemplateBody(updateTemplateBody).then(function (response) {
                            common.logSuccess('Commission Template Updated');
                            $state.transitionTo('commission.templateedit.details', {
                                templateId: $state.params.templateId
                            }, {
                                reload: true,
                                inherit: true,
                                notify: true
                            });
                        });
                    } else if (action.CommandName == 'CancelUpdateTemplate') {
                        $state.go('ngtwo.m', {
                            p: 'commission/search-templates'
                        });
                    }
                },
                customButtonOnClick: function (version, action, actionCustomId) {
                    if (action == 'NewCreate') {
                        actionExecute(this, version, 'Create', 'CommissionRateHeaderNew', {
                            WorkflowPendingTaskId: -1,
                            CommandName: 'CommissionRateHeaderNew',
                            CommissionUserProfileId: self.model.CommissionUserProfileId,
                            CommissionRateTypeId: self.model.CommissionRateTypeId,
                            CommissionRoleId: self.model.CommissionRoleId,
                            CommissionRateHeaderStatusId: self.model.CommissionRateHeaderStatusId,
                            Description: self.model.Description,
                            CommissionRateVersion: selfCommon.currentVersion,
                            CommissionRateRestrictions: self.model.CommissionRateRestrictions,
                        });
                    } else if (action == 'NewCancel') {
                        $state.transitionTo('ngtwo.m', {
                            p: "commission/search"
                        });
                    } else if (action == 'ToCorrect') {
                        // actionExecute(this, version, 'Submit', 'CommissionRateVersionCorrect');
                        actionExecute(this, version, 'Submit', 'CommissionRateVersionEdit', {
                            EntityIds: [ $state.params.commissionRateVersionId ], 
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateVersion,
                        });
                    } else if (action == 'ToScheduleChange') {
                        // actionExecute(this, version, 'Schedule Change', 'CommissionRateVersionScheduleChange');
                        actionExecute(this, version, 'Schedule Change', 'CommissionRateVersionSchedule', {
                            EntityIds: [ $state.params.commissionRateVersionId ], 
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateVersion,
                        });
                    } else if (action == 'CommissionRateHeaderInactivate') {
                        actionExecute(this, version, 'Inactivate', 'CommissionRateHeaderInactivate', {
                            EntityIds: [ $state.params.commissionRateHeaderId ],
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateHeader,
                        });
                    } else if (action == 'ToManageRestrictions') {
                        actionExecute(this, version, 'Submit', 'CommissionRateHeaderManageRestriction', {
                            EntityIds: [ $state.params.commissionRateHeaderId ],
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateHeader,
                        });
                    } else if (action == 'CommissionRateDelete') {
                        actionExecute(this, version, 'Delete', 'CommissionRateHeaderDelete', {
                            EntityIds: [ $state.params.commissionRateHeaderId ],
                            EntityTypeId: ApplicationConstants.EntityType.CommissionRateHeader,
                        });
                    } else if (action == 'Cancel') {
                        //selfCommon.currentVersionSet($state.params.commissionRateVersionId);
                        $state.reload(); //we need to reload to support page updates by other user
                    } else if (action == 'AddRestriction') {
                        var commissionRateRestrictionAddDialogConfig = {
                            title: "Add/Edit Restriction",
                            commissionRateRestrictions: self.model.CommissionRateRestrictions,
                            commissionRateRestrictionTypeId: actionCustomId,
                            viewType: 'Checkbox'
                        };
                        if (actionCustomId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganization) {
                            commissionRateRestrictionAddDialogConfig.list = selfCommon.lists.listOrganizationInternal;
                            commissionRateRestrictionAddDialogConfig.viewType = 'DropDown';
                        } else if (actionCustomId == ApplicationConstants.CommissionRateRestrictionType.ClientOrganization) {
                            commissionRateRestrictionAddDialogConfig.list = selfCommon.lists.listOrganizationClient;
                            commissionRateRestrictionAddDialogConfig.viewType = 'DropDown';
                        } else if (actionCustomId == ApplicationConstants.CommissionRateRestrictionType.LineOfBusiness) {
                            commissionRateRestrictionAddDialogConfig.list = selfCommon.lists.listLineOfBusiness;
                            //commissionRateRestrictionAddDialogConfig.viewType = 'DropDown';
                        } else if (actionCustomId == ApplicationConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1) {
                            commissionRateRestrictionAddDialogConfig.list = selfCommon.lists.listInternalOrganizationDefinition1;
                            //commissionRateRestrictionAddDialogConfig.viewType = 'DropDown';
                        }
                        dialogs.create('/Phoenix/modules/commission/views/CommissionRateAddRestrictionDialog.html', 'CommissionRateAddRestrictionDialogController', commissionRateRestrictionAddDialogConfig, {
                            keyboard: false,
                            backdrop: 'static'
                        }).result.then(
                            function (result) {
                                if (result.action == 'create') {
                                    self.model.CommissionRateRestrictions = result.commissionRateRestrictions;
                                    self.common.commissionRateRestrictionsToValid();
                                }
                            },
                            function () {});
                    }
                },
            };
        }

        function extendByFieldViewConfig(selfCommon) {
            return {
                ptFieldViewConfigOnChangeStatusId: {
                    watchChangeEvent: '[currentVersion.CommissionRateVersionStatusId, selfScope.common.customStatusId]',
                    funcToCheckViewStatus: function (modelPrefix, fieldName) {

                        if (selfCommon.customStatusId == selfCommon.customStatusType.TemplateEdit) {
                            if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'EffectiveDate') {
                                return ApplicationConstants.viewStatuses.hideFormGroup;
                            } else {
                                return ApplicationConstants.viewStatuses.edit;
                            }
                        }

                        if (selfCommon.currentVersion.CommissionRateVersionStatusId == ApplicationConstants.CommissionRateVersionStatus.New) {
                            return ApplicationConstants.viewStatuses.edit;
                        } else if (selfCommon.workflow.WorkflowIsRunning) {
                            return ApplicationConstants.viewStatuses.view;
                        } else if (selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect) {
                            if (modelPrefix == 'selfScope.model' && fieldName == 'Description') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'Percentage') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'ScheduledChangeRateApplicationId') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        } else if (selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange) {
                            if (modelPrefix == 'selfScope.model' && fieldName == 'Description') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'Percentage') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'ScheduledChangeRateApplicationId') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else if (modelPrefix == 'selfScope.common.currentVersion' && fieldName == 'EffectiveDate') {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        } else if (selfCommon.customStatusId == selfCommon.customStatusType.ToManageRestrictions) {
                            return ApplicationConstants.viewStatuses.view;
                        } else {
                            return ApplicationConstants.viewStatuses.view;
                        }
                    },
                    funcToPassMessages: function (message) {
                        common.logWarning(message);
                    }
                }
            };
        }

        function extendByFilters(selfCommon) {
            return {
                commissionRateRestrictionsGroups: [],
                commissionRateRestrictionsGrouped: function () {
                    selfCommon.commissionRateRestrictionsGroups = [];
                    return self.model.CommissionRateRestrictions;
                },

                filterGroupByCommissionRateRestrictionTypeId: function (restriction) {
                    var isNew = selfCommon.commissionRateRestrictionsGroups.indexOf(restriction.CommissionRateRestrictionTypeId) == -1;
                    if (isNew) {
                        selfCommon.commissionRateRestrictionsGroups.push(restriction.CommissionRateRestrictionTypeId);
                    }
                    return isNew;
                },
            };
        }

        function extendByValidators(selfCommon) {

            function commissionRateRestrictionTypeExists(commissionRateRestrictionTypeId) {
                return _.some(self.model.CommissionRateRestrictions, function (restriction) {
                    return restriction.CommissionRateRestrictionTypeId == commissionRateRestrictionTypeId;
                });
            }

            return {
                commissionRateRestrictionsValidionMessage: '',
                commissionRateRestrictionsToValid: function () {
                    this.commissionRateRestrictionsValidionMessage = '';
                    if (self.model.CommissionRoleId == ApplicationConstants.CommissionRole.NationalAccountsRole) {
                        if (!commissionRateRestrictionTypeExists(ApplicationConstants.CommissionRateRestrictionType.ClientOrganization)) {
                            this.commissionRateRestrictionsValidionMessage = 'Client restriction must be selected for a "National Accounts Role"';
                        }
                    } else if (self.model.CommissionRoleId == ApplicationConstants.CommissionRole.BranchManagerRole) {
                        if (!commissionRateRestrictionTypeExists(ApplicationConstants.CommissionRateRestrictionType.InternalOrganizationDefinition1)) {
                            this.commissionRateRestrictionsValidionMessage = 'Branch restriction must be selected for a "Branch Manager Role"';
                        }
                    }
                }
            };
        }
    }



    if (!app.resolve) app.resolve = {};
    app.resolve.CommissionRateController = {

        resolveModel: ['$q', '$stateParams', 'CommissionApiService', 'TemplateApiService', 'CodeValueService', function ($q, $stateParams, CommissionApiService, TemplateApiService, CodeValueService) {
            var result = $q.defer();

            if ($stateParams.commissionRateVersionId > 0) {
                CommissionApiService.getCommissionRateHeaderByCommissionRateVersionId($stateParams.commissionRateVersionId).then(
                    function (responseSucces) {
                        result.resolve({
                            'model': responseSucces
                        });
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            } else if ($stateParams.commissionRateHeaderId > 0) {
                CommissionApiService.getCommissionRateHeaderByCommissionRateHeaderId($stateParams.commissionRateHeaderId).then(
                    function (responseSucces) {
                        result.resolve({
                            'model': responseSucces
                        });
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            } else if ($stateParams.templateId > 0) {
                TemplateApiService.get($stateParams.templateId).then(
                    function (responseSucces) {
                        var model = responseSucces.Entity;
                        model.CommissionRateVersions[0].EffectiveDate = new Date();
                        result.resolve({
                            'model': model,
                            'TemplateLastModifiedDateTime': responseSucces.LastModifiedDateTime
                        });
                    },
                    function (responseError) {
                        result.reject(responseError);
                    });
            } else if ($stateParams.commissionUserProfileId > 0 && $stateParams.commissionRoleId > 0 && $stateParams.commissionRateTypeId > 0) {
                var commissionDataParams = oreq.request()
                    .withSelect([
                        'CommissionUserProfileId',
                        'CommissionUserProfileFirstName',
                        'CommissionUserProfileLastName',
                        'CommissionUserProfileStatusName',
                    ]).url();
                CommissionApiService.getCommissionRateHeadersByCommissionUserProfile($stateParams.commissionUserProfileId, commissionDataParams).then(
                    function (responseSucces) {
                        if (responseSucces.Items !== null && responseSucces.Items.length == 1) {
                            var model = responseSucces.Items[0];
                            angular.extend(model, {
                                CommissionRateRestrictions: [],
                                CommissionRoleId: $stateParams.commissionRoleId,
                                CommissionRateTypeId: $stateParams.commissionRateTypeId,
                                CommissionRateHeaderStatusId: ApplicationConstants.CommissionRateHeaderStatus.New,
                                CommissionRateVersions: [{
                                    CommissionRateVersionStatusId: ApplicationConstants.CommissionRateVersionStatus.New,
                                    EffectiveDate: new Date(),
                                    ScheduledChangeRateApplicationId: ApplicationConstants.ScheduledChangeRateApplication.AllWorkOrders
                                }]
                            });
                            if ($stateParams.commissionTemplateId > 0) {
                                TemplateApiService.get($stateParams.commissionTemplateId).then(
                                    function (responseSuccesTemplate) {

                                        model.Description = responseSuccesTemplate.Entity.Description;

                                        model.CommissionRateRestrictions = responseSuccesTemplate.Entity.CommissionRateRestrictions;

                                        model.CommissionRateVersions[0].ScheduledChangeRateApplicationId = responseSuccesTemplate.Entity.CommissionRateVersions[0].ScheduledChangeRateApplicationId;
                                        model.CommissionRateVersions[0].Percentage = responseSuccesTemplate.Entity.CommissionRateVersions[0].Percentage;

                                        result.resolve({
                                            'model': model
                                        });
                                    },
                                    function (responseErrorTemplate) {
                                        result.reject(responseErrorTemplate);
                                    });
                            } else {
                                result.resolve({
                                    'model': model
                                });
                            }
                        } else {
                            result.reject(responseSucces);
                        }
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            } else {
                result.reject({});
            }
            return result.promise;
        }],

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var lists = {};

            lists.listCommissionRole = CodeValueService.getCodeValues(CodeValueGroups.CommissionRole, true);
            lists.listCommissionRateType = CodeValueService.getCodeValues(CodeValueGroups.CommissionRateType, true);
            lists.listScheduledChangeRateApplication = CodeValueService.getCodeValues(CodeValueGroups.ScheduledChangeRateApplication, true);
            lists.listCommissionRateVersionStatus = CodeValueService.getCodeValues(CodeValueGroups.CommissionRateVersionStatus, true);
            lists.listCommissionRateHeaderStatus = CodeValueService.getCodeValues(CodeValueGroups.CommissionRateHeaderStatus, true);
            lists.listCommissionRateRestrictionType = CodeValueService.getCodeValues(CodeValueGroups.CommissionRateRestrictionType, true);
            lists.listCommissionTemplate = [];
            lists.listLineOfBusiness = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness, true);
            lists.listInternalOrganizationDefinition1 = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true);
            lists.listCustomStatus = [{
                id: 1,
                code: 'ToCorrect',
                text: 'To Correct'
            }, {
                id: 2,
                code: 'ToScheduleChange',
                text: 'To Schedule Change'
            }, {
                id: 3,
                code: 'ToManageRestrictions',
                text: 'To Manage Restrictions'
            }];

            result.resolve(lists);
            return result.promise;
        }],

        resolveListOrganizationInternal: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
            var result = $q.defer();
            CommissionApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        resolveListOrganizationClient: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
            var result = $q.defer();
            CommissionApiService.getListOrganizationClient().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

    };

})(angular, Phoenix.App);