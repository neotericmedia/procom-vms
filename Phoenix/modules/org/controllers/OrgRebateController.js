(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgRebateController', OrgRebateController);

    /** @ngInject */
    OrgRebateController.$inject = ['$state', 'CodeValueService', 'common', 'commonDataService', 'NavigationService', 'OrgApiService', 'WorkflowApiService', 'clientOrganizations', 'rebateHeader', 'rebateCodeValueList'];

    function OrgRebateController($state, CodeValueService, common, commonDataService, NavigationService, OrgApiService, WorkflowApiService, clientOrganizations, rebateHeader, rebateCodeValueList) {

        NavigationService.setTitle('vmsrebate-new');

        var self = this;

        angular.extend(self, {
            rebateHeader: rebateHeader,
            rebateCodeValueList: rebateCodeValueList,
            clientOrganizations: clientOrganizations,
            currentVersion: {},
            validationMessages: [],
            selectedActionId: null,
            isWorflowRunning: false,
            ptFieldViewConfigOnChangeStatusId: {},
            orgId: parseInt($state.params.orgId, 10),

            init: init,
            rebateChanged: rebateChanged,
            actionChanged: actionChanged,
            setVersion: setVersion,
            onVersionClick: onVersionClick,
            fieldViewEditModeInit: fieldViewEditModeInit,
            getAvailableActions: getAvailableActions,
            rebateButtonsHandler: rebateButtonsHandler
        });

        self.init();

        function init() {

            var versionId = $state.params.rebateVersionId;

            self.currentVersion = angular.copy(_.find(self.rebateHeader.RebateVersions, function (version) {
                return version.Id == versionId;
            }));

            if (!self.currentVersion && rebateHeader && rebateHeader.RebateVersions) {
                self.currentVersion = rebateHeader.RebateVersions[0];
            }

            if (self.currentVersion) {
                getAvailableActions(self.currentVersion);
            }

            if (parseInt($state.params.rebateHeaderId, 10) === 0 && parseInt($state.params.rebateVersionId, 10) === 0 && self.orgId > 0) {
                self.rebateHeader.OrganizationId = parseInt($state.params.orgId);
                self.rebateHeader.OrganizationDisplayName = _.find(self.clientOrganizations, function (org) {
                    return org.Id === self.rebateHeader.OrganizationId;
                }).DisplayName;
            }

            self.fieldViewEditModeInit();
        }

        function rebateChanged(rebateTypeId) {
            self.currentVersion.Rate = null;
        }

        function getAvailableActions(version) {
            WorkflowApiService.getWorkflowAvailableActions(version, version, ApplicationConstants.EntityType.RebateVersion);
        }

        function rebateButtonsHandler(action, version, organizationId, description, headerStatusId) {
            switch (action) {
                case 'Created':
                    actionExecute('RebateHeaderNew', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Corrected':
                    actionExecute('RebateVersionCorrect', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Schedule Changed':
                    actionExecute('RebateVersionScheduleChange', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Cancelled':
                    //self.setVersion(parseInt($state.params.rebateVersionId));
                    $state.reload();//we need to reload to support page updates by other user
                    break;
                default:
                    //$state.go('org.rebatesandfees');
                    $state.go('ngtwo.m', { p: 'organization/rebatesandfees' });
            }
        }

        function actionExecute(commandName, version, organizationId, description, headerStatusId, action) {
            self.isWorkflowRunning = true;
            self.validationMessages = [];
            self.rebateActionId = null;
            WorkflowApiService.executeCommand({ WorkflowPendingTaskId: (commandName === 'RebateHeaderNew') ? -1 : version.WorkflowPendingTaskId, CommandName: commandName, RebateVersion: version, Id: self.rebateHeader.Id, OrganizationId: organizationId, Description: description, RebateHeaderStatusId: headerStatusId }).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, organizationId, $state.current.name, 'Organization Rebate ' + action);
                },
                function (error) {
                    onResponseError(error);
                }
            );
        }

        function actionChanged(action, version) {
            if (action && action.CommandName && version) {
                version.WorkflowAvailableActions = [];
                switch (action.CommandName) {
                    case 'RebateVersionCorrect':
                        self.selectedActionId = self.rebateCodeValueList.actionStatusType.ToCorrect;
                        break;
                    case 'RebateVersionScheduleChange':
                        version.EffectiveDate = null;
                        self.selectedActionId = self.rebateCodeValueList.actionStatusType.ToScheduleChange;
                        break;
                    default: self.selectedActionId = null;
                }
            }
        }

        function onWorkflowEventSuccess(rebateVersionId, orgId, stateNameGo, message) {
            self.validationMessages = [];
            if (message && message.length > 0) {
                common.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'org.rebate', ApplicationConstants.EntityType.RebateHeader, ApplicationConstants.EntityType.RebateVersion, rebateVersionId, { rebateHeaderId: 0, rebateVersionId: rebateVersionId, orgId: orgId });
        }

        function onResponseError(responseError) {
            self.isWorkflowRunning = false;
            self.validationMessages = common.responseErrorMessages(responseError);
        }

        function onVersionClick(version) {
            if (self.currentVersion.RebateVersionStatusId === ApplicationConstants.RebateVersionStatus.New || self.selectedActionId === self.rebateCodeValueList.actionStatusType.ToCorrect || self.selectedActionId === self.rebateCodeValueList.actionStatusType.ToScheduleChange) {
                common.logWarning('Option to change version is disabled in "Edit" mode');
            }
            else {
                $state.go('org.rebate', { rebateHeaderId: $state.params.rebateHeaderId, rebateVersionId: version.Id, orgId: self.orgId }, { notify: false });
                self.setVersion(version.Id);
            }
        }

        function setVersion(versionId) {
            if (versionId) {
                self.currentVersion = angular.copy(_.find(self.rebateHeader.RebateVersions, function (version) {
                    return version.Id == versionId;
                }));
                self.selectedActionId = null;
                self.rebateActionId = null;
                self.validationMessages = [];
                self.getAvailableActions(self.currentVersion);
            }
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                watchChangeEvent: '[currentVersion.RebateVersionStatusId, rebate.selectedActionId]',

                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if ($state.params.rebateVersionId === 0 || $state.params.rebateVersionId === '0') {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else if (self.isWorkflowRunning) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (self.selectedActionId === self.rebateCodeValueList.actionStatusType.ToCorrect) {

                        if (modelPrefix == 'rebate.rebateHeader' && fieldName == 'OrgId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'rebate.currentVersion' && fieldName == 'LineOfBusinessId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'rebate.currentVersion' && fieldName == 'EffectiveDate') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        else {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                    }
                    else if (self.selectedActionId === self.rebateCodeValueList.actionStatusType.ToScheduleChange) {

                        if (modelPrefix == 'rebate.rebateHeader' && fieldName == 'OrgId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'rebate.currentVersion' && fieldName == 'LineOfBusinessId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                },

                funcToPassMessages: function (message) {
                    common.logWarning(message);
                }
            };

            self.ptFieldViewConfigOnChangeStatusId = viewEditModeConfig;
        }

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.OrgRebateController = {

        rebateHeader: ['$q', '$stateParams', 'OrgApiService', function ($q, $stateParams, OrgApiService) {
            var result = $q.defer();

            if ($stateParams.rebateHeaderId && $stateParams.rebateHeaderId > 0 && $stateParams.rebateVersionId && $stateParams.rebateVersionId > 0) {

                OrgApiService.getSingleRebateHeaderByVersion($stateParams.rebateVersionId).then(
                    function (success) {
                        result.resolve(success);
                    },
                    function (error) {
                        result.reject(error);
                    }
                );
            }
            else {
                result.resolve({
                    Id: 0,
                    RebateHeaderId: null,
                    OrganizationId: null,
                    Description: '',
                    RebateHeaderStatusId: 1,
                    RebateVersions: [{
                        Id: 0,
                        LineOfBusinessId: null,
                        RebateTypeId: null,
                        Rate: null,
                        RebateVersionStatusId: 1,
                        EffectiveDate: new Date(),
                        SourceId: null
                    }]
                });
            }

            return result.promise;
        }],

        rebateCodeValueList: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var list = {};

            list.rebateVersionStatuses = CodeValueService.getCodeValues(CodeValueGroups.RebateVersionStatus);
            list.rebateTypes = CodeValueService.getCodeValues(CodeValueGroups.RebateType, true);
            list.lineOfBusiness = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness, true);
            list.actionStatusType = { ToCorrect: 1, ToScheduleChange: 2 };
            list.actionStatuses = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];

            result.resolve(list);

            return result.promise;
        }],

        clientOrganizations: ['OrgApiService', '$q', function (OrgApiService, $q) {
            var deferred = $q.defer();
            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole().then(
                function (success) {
                    //success.Items = _.filter(success.Items, function (item) { return item.DisplayName !== null; });
                    deferred.resolve(success.Items);
                },
                function (error) { deferred.resolve([]); }
                );
            return deferred.promise;
        }]
    };

})(angular, Phoenix.App);