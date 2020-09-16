(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgVmsFeeController', OrgVmsFeeController);

    /** @ngInject */
    OrgVmsFeeController.$inject = ['$state', 'CodeValueService', 'common', 'commonDataService', 'NavigationService', 'OrgApiService', 'WorkflowApiService', 'clientOrganizations', 'vmsFeeHeader', 'vmsFeeCodeValueList'];

    function OrgVmsFeeController($state, CodeValueService, common, commonDataService, NavigationService, OrgApiService, WorkflowApiService, clientOrganizations, vmsFeeHeader, vmsFeeCodeValueList) {

        NavigationService.setTitle('vmsfee-new');

        var self = this;

        angular.extend(self, {
            vmsFeeHeader: vmsFeeHeader,
            vmsFeeCodeValueList: vmsFeeCodeValueList,
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
            vmsFeeButtonsHandler: vmsFeeButtonsHandler
        });

        self.init();

        function init() {

            var versionId = $state.params.vmsFeeVersionId;

            self.currentVersion = angular.copy(_.find(self.vmsFeeHeader.VmsFeeVersions, function (version) {
                return version.Id == versionId;
            }));

            if (!self.currentVersion && vmsFeeHeader && vmsFeeHeader.VmsFeeVersions) {
                self.currentVersion = vmsFeeHeader.VmsFeeVersions[0];
            }

            if (self.currentVersion) {
                getAvailableActions(self.currentVersion);
            }

            if (parseInt($state.params.vmsFeeHeaderId, 10) === 0 && parseInt($state.params.vmsFeeVersionId, 10) === 0 && self.orgId > 0) {
                self.vmsFeeHeader.OrganizationId = parseInt($state.params.orgId);
                self.vmsFeeHeader.OrganizationDisplayName = _.find(self.clientOrganizations, function (org) {
                    return org.Id === self.vmsFeeHeader.OrganizationId;
                }).DisplayName;
            }

            self.fieldViewEditModeInit();
        }

        function rebateChanged(rebateTypeId) {
            self.currentVersion.Rate = null;
        }

        function getAvailableActions(version) {
            WorkflowApiService.getWorkflowAvailableActions(version, version, ApplicationConstants.EntityType.VmsFeeVersion);
        }

        function vmsFeeButtonsHandler(action, version, organizationId, description, headerStatusId) {
            switch (action) {
                case 'Created':
                    actionExecute('VmsFeeHeaderNew', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Corrected':
                    actionExecute('VmsFeeVersionCorrect', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Schedule Changed':
                    actionExecute('VmsFeeVersionScheduleChange', version, organizationId, description, headerStatusId, action);
                    break;
                case 'Cancelled':
                    //self.setVersion($state.params.vmsFeeVersionId);
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
            self.feeActionId = null;
            WorkflowApiService.executeCommand({ WorkflowPendingTaskId: (commandName === 'VmsFeeHeaderNew') ? -1 : version.WorkflowPendingTaskId, CommandName: commandName, VmsFeeVersion: version, Id: self.vmsFeeHeader.Id, OrganizationId: organizationId, Description: description, VmsFeeHeaderStatusId: headerStatusId }).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, organizationId, $state.current.name, 'Organization Vms Fee ' + action);
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
                    case 'VmsFeeVersionCorrect':
                        self.selectedActionId = self.vmsFeeCodeValueList.actionStatusType.ToCorrect;
                        break;
                    case 'VmsFeeVersionScheduleChange':
                        version.EffectiveDate = null;
                        self.selectedActionId = self.vmsFeeCodeValueList.actionStatusType.ToScheduleChange;
                        break;
                    default: self.selectedActionId = null;
                }
            }
        }

        function onWorkflowEventSuccess(vmsFeeVersionId, orgId, stateNameGo, message) {
            self.validationMessages = [];
            if (message && message.length > 0) {
                common.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'org.vmsfee', ApplicationConstants.EntityType.VmsFeeHeader, ApplicationConstants.EntityType.VmsFeeVersion, vmsFeeVersionId, { vmsFeeHeaderId: 0, vmsFeeVersionId: vmsFeeVersionId, orgId: orgId });
        }

        function onResponseError(responseError) {
            self.isWorkflowRunning = false;
            self.validationMessages = common.responseErrorMessages(responseError);
        }

        function onVersionClick(version) {
            if (self.currentVersion.VmsFeeVersionStatusId === ApplicationConstants.VmsFeeVersionStatus.New || self.selectedActionId === self.vmsFeeCodeValueList.actionStatusType.ToCorrect || self.selectedActionId === self.vmsFeeCodeValueList.actionStatusType.ToScheduleChange) {
                common.logWarning('Option to change version is disabled in "Edit" mode');
            }
            else {
                $state.go('org.vmsfee', { vmsFeeHeaderId: $state.params.vmsFeeHeaderId, vmsFeeVersionId: version.Id, orgId: self.orgId }, { notify: false });
                self.setVersion(version.Id);
            }
        }

        function setVersion(versionId) {
            if (versionId) {
                self.currentVersion = angular.copy(_.find(self.vmsFeeHeader.VmsFeeVersions, function (version) {
                    return version.Id == versionId;
                }));
                self.selectedActionId = null;
                self.feeActionId = null;
                self.validationMessages = [];
                self.getAvailableActions(self.currentVersion);
            }
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                watchChangeEvent: '[currentVersion.VmsFeeVersionStatusId, fee.selectedActionId]',

                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if ($state.params.vmsFeeVersionId === 0 || $state.params.vmsFeeVersionId === '0') {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else if (self.isWorkflowRunning) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (self.selectedActionId === self.vmsFeeCodeValueList.actionStatusType.ToCorrect) {

                        if (modelPrefix == 'fee.vmsFeeHeader' && fieldName == 'OrgId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'fee.currentVersion' && fieldName == 'LineOfBusinessId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'fee.currentVersion' && fieldName == 'EffectiveDate') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        else {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                    }
                    else if (self.selectedActionId === self.vmsFeeCodeValueList.actionStatusType.ToScheduleChange) {

                        if (modelPrefix == 'fee.vmsFeeHeader' && fieldName == 'OrgId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'fee.currentVersion' && fieldName == 'LineOfBusinessId') {
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

    app.resolve.OrgVmsFeeController = {

        vmsFeeHeader: ['$q', '$stateParams', 'OrgApiService', function ($q, $stateParams, OrgApiService) {
            var result = $q.defer();

            if ($stateParams.vmsFeeHeaderId && $stateParams.vmsFeeHeaderId > 0 && $stateParams.vmsFeeVersionId && $stateParams.vmsFeeVersionId > 0) {

                OrgApiService.getSingleVmsFeeHeaderByVersion($stateParams.vmsFeeVersionId).then(
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
                    VmsFeeHeaderId: null,
                    OrganizationId: null,
                    Description: '',
                    VmsFeeHeaderStatusId: 1,
                    VmsFeeVersions: [{
                        Id: 0,
                        LineOfBusinessId: null,
                        RebateTypeId: null,
                        Rate: null,
                        VmsFeeVersionStatusId: 1,
                        EffectiveDate: new Date(),
                        SourceId: null
                    }]
                });
            }

            return result.promise;
        }],

        vmsFeeCodeValueList: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var list = {};

            list.vmsFeeVersionStatuses = CodeValueService.getCodeValues(CodeValueGroups.VmsFeeVersionStatus);
            list.vmsFeeTypes = CodeValueService.getCodeValues(CodeValueGroups.RebateType, true);
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
                    success.Items = _.filter(success.Items, function (item) { return item.DisplayName !== null; });
                    deferred.resolve(success.Items);
                },
                function (error) { deferred.resolve([]); }
                );
            return deferred.promise;
        }]
    };

})(angular, Phoenix.App);