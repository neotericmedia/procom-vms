
(function (app, angular) {
    'use strict';

    var controllerId = 'ComplianceDocumentRuleEditController';

    angular.module('phoenix.compliancedocumentrule.controllers').controller(controllerId, ['$state', '$controller', '$timeout', 'common', 'NavigationService', 'ComplianceDocumentRuleApiService', 'resolveListCodeValue', 'resolveObj', 'resolveListUserDefinedCodeComplianceDocumentType',
        function ComplianceDocumentRuleEditController($state, $controller, $timeout, common, NavigationService, ComplianceDocumentRuleApiService, resolveListCodeValue, resolveObj, resolveListUserDefinedCodeComplianceDocumentType) {
            common.setControllerName(controllerId);
            var self = this;

            angular.extend(self, {
                entity: resolveObj.entity,
                lists: resolveListCodeValue,
                listOrganizationClient: resolveObj.listOrganizationClient,
                listUserDefinedCodeComplianceDocumentType: resolveListUserDefinedCodeComplianceDocumentType,
                validationMessages: [],

                cultureId: 48,
                changeHistoryBlackList: [
                    { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
                    { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleRequiredSituation', ColumnName: 'ComplianceDocumentRuleRequiredSituationTypeId' },
                    { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleProfileVisibility', ColumnName: 'ComplianceDocumentRuleProfileVisibilityTypeId' },
                    { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleRestriction', ColumnName: 'ComplianceDocumentRuleRestrictionTypeId' },
                    { TableSchemaName: 'compliance', TableName: 'ComplianceDocumentRuleUserDefinedCodeComplianceDocumentType', ColumnName: 'UserDefinedCodeComplianceDocumentTypeId' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'ComplianceDocumentRuleId' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
                    { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
                ],

                tab: {
                    configList: [{ state: 'compliancedocument.documentrule.edit.details', stateName: 'Details', stateIcon: 'fontello-icon-doc-7' },
                    { state: 'compliancedocument.documentrule.edit.rules', stateName: 'Rules', stateIcon: 'fontello-icon-contacts' },
                    { state: 'compliancedocument.documentrule.edit.templates', stateName: 'Templates', stateIcon: 'fontello-icon-th-4' },
                    { state: 'compliancedocument.documentrule.edit.history', stateName: 'History', stateIcon: 'fontello-icon-th-4' }

                    ],

                    onClick: function (tab) {
                        var state = tab.state || tab;

                        if (state === "compliancedocument.documentrule.edit.details") {

                        }
                        else if (state === "compliancedocument.documentrule.edit.rules") {

                        }
                        else if (state === "compliancedocument.documentrule.edit.history") {
                        }

                    },

                    addonHtml: function (tab) {
                        return '';
                    },

                    valid: function (tab) {
                        self.validator.tabValid(tab);
                        if (tab.state === "compliancedocument.documentrule.edit.details") {
                            return self.validator.tabDetailsIsValid;
                        }
                        else if (tab.state === "compliancedocument.documentrule.edit.rules") {
                            return self.validator.tabRulesIsValid;
                        }
                        else {
                            return true;
                        }
                    },

                    show: function () {
                    }
                },

                recalcNavigationName: function () {
                    var ruleAreaType = _.find(self.lists.listComplianceDocumentRuleAreaType, ['id', self.entity.ComplianceDocumentRuleAreaTypeId]);

                    if (self.entity.ComplianceDocumentRuleAreaTypeId === ApplicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient && self.entity.OrganizationIdClient > 0) {
                        var OrganizationClient = _.find(self.listOrganizationClient, ['Id', self.entity.OrganizationIdClient]);

                        NavigationService.setTitle('document-rule-viewedit', [OrganizationClient.DisplayName]);
                    }
                    else {
                        NavigationService.setTitle('document-rule-viewedit', [ruleAreaType.text]);
                    }
                },

                ptFieldViewConfigOnChangeStatusId: {
                    funcToCheckViewStatus: function (modelPrefix, fieldName, modelValidation) {
                        if (fieldName == 'ComplianceDocumentRuleEntityTypeId' &&
                            (self.entity.ComplianceDocumentRuleAreaTypeId === ApplicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient ||
                                self.entity.ComplianceDocumentRuleAreaTypeId === ApplicationConstants.ComplianceDocumentRuleAreaType.Assignment)) {
                            return ApplicationConstants.viewStatuses.view;
                        }

                        if (!self.entity.IsOriginal && fieldName == 'ComplianceDocumentRuleEntityTypeId') {
                            return ApplicationConstants.viewStatuses.view;
                        }

                        if (self.entity.ComplianceDocumentRuleStatusId === ApplicationConstants.ComplianceDocumentRuleStatus.New ||
                            self.entity.ComplianceDocumentRuleStatusId === ApplicationConstants.ComplianceDocumentRuleStatus.Draft) {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                        else {
                            return ApplicationConstants.viewStatuses.view;
                        }
                    },
                    funcToPassMessages: function (message) {
                        common.logWarning(message);
                    },
                    watchChangeEvent: 'self.entity.ComplianceDocumentRuleStatusId',
                },

            });


            self.load = function () {
                $controller('ComplianceDocumentRuleEditControllerExtendEventsForScope', { self: self });
                if ($state.includes('compliancedocument.documentrule.edit')) {
                    $controller('ComplianceDocumentRuleEditControllerExtendEventsForWorkflow', { self: self });
                    $controller('ComplianceDocumentRuleEditControllerExtendTabValidator', { self: self });
                }
                self.actionScope.showToRecalc();
                self.tab.show();
                self.tab.onClick($state.current.name);
                self.recalcNavigationName();
            };

            self.load();

        }]);

    if (!app.resolve) app.resolve = {};
    app.resolve.ComplianceDocumentRuleEditController = {

        resolveObj: ['$q', '$stateParams', '$state', 'ComplianceDocumentRuleApiService', 'OrgApiService', function ($q, $stateParams, $state, ComplianceDocumentRuleApiService, OrgApiService) {
            var deferred = $q.defer();
            if ($stateParams.complianceDocumentRuleId > 0) {

                var result = { entity: {}, listOrganizationClient: [] };

                var oDataParams = oreq.request()
                    .withExpand([
                        'ComplianceDocumentRuleRequiredSituations',
                        'ComplianceDocumentRuleUserDefinedDocumentTypes',
                        'ComplianceDocumentRuleRestrictions',
                        'Versions',
                        'ComplianceDocumentRuleProfileVisibilities'
                    ])
                    .withSelect([
                        'IsOriginal',
                        'IsOriginalAndStatusIsAtiveOrPendingChange',
                        'Id',
                        'OriginalId',
                        'ComplianceDocumentRuleStatusId',
                        'ComplianceDocumentRuleAreaTypeId',
                        'OrganizationIdClient',
                        'ComplianceDocumentRuleEntityTypeId',
                        'ComplianceDocumentRuleRequiredTypeId',
                        'ComplianceDocumentRuleExpiryTypeId',
                        'IsRequiredReview',
                        'IsMultipleSubstitutionsAllowed',
                        'DisplayName',
                        'Description',

                        'ComplianceDocumentRuleProfileVisibilities/Id',
                        'ComplianceDocumentRuleProfileVisibilities/ComplianceDocumentRuleProfileVisibilityTypeId',
                        'ComplianceDocumentRuleProfileVisibilities/IsSelected',

                        'ComplianceDocumentRuleRequiredSituations/Id',
                        'ComplianceDocumentRuleRequiredSituations/ComplianceDocumentRuleRequiredSituationTypeId',
                        'ComplianceDocumentRuleRequiredSituations/IsSelected',

                        'ComplianceDocumentRuleUserDefinedDocumentTypes/Id',
                        'ComplianceDocumentRuleUserDefinedDocumentTypes/UserDefinedCodeComplianceDocumentTypeId',

                        'ComplianceDocumentRuleRestrictions/Id',
                        'ComplianceDocumentRuleRestrictions/ComplianceDocumentRuleRestrictionTypeId',
                        'ComplianceDocumentRuleRestrictions/IsInclusive',
                        'ComplianceDocumentRuleRestrictions/LineOfBusinessId',
                        'ComplianceDocumentRuleRestrictions/ClientOrganizationId',
                        'ComplianceDocumentRuleRestrictions/BranchId',
                        'ComplianceDocumentRuleRestrictions/ProfileTypeId',
                        'ComplianceDocumentRuleRestrictions/InternalOrganizationId',
                        'ComplianceDocumentRuleRestrictions/WorksiteId',
                        'ComplianceDocumentRuleRestrictions/OrganizationRoleTypeId',
                        'ComplianceDocumentRuleRestrictions/TaxSubdivisionId',
                        'ComplianceDocumentRuleRestrictions/WorkerEligibilityId',
                        'ComplianceDocumentRuleRestrictions/Name',

                        'Versions/Id',
                        'Versions/ComplianceDocumentRuleStatusId',
                        'Versions/IsOriginal',
                    ])
                    .url();

                ComplianceDocumentRuleApiService.getByComplianceDocumentRuleId($stateParams.complianceDocumentRuleId, oDataParams).then(
                    function (responseSucces) {
                        result.entity = responseSucces;

                        if (result.entity.ComplianceDocumentRuleAreaTypeId === ApplicationConstants.ComplianceDocumentRuleAreaType.OrganizationClient) {
                            var oDataParamsOrg = oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
                            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParamsOrg).then(
                                function (orgResponseSuccess) {
                                    result.listOrganizationClient = orgResponseSuccess.Items;
                                    deferred.resolve(result);
                                },
                                function (orgResponseError) {
                                    deferred.resolve(result);
                                });
                        }
                        else {
                            deferred.resolve(result);
                        }
                    },
                    function (responseError) {
                        $state.transitionTo('compliancedocument.ruleareatype.search', {}, { reload: true, inherit: true, notify: true });
                        deferred.reject(responseError);
                    });
            }
            else {
                deferred.resolve({});
            }
            return deferred.promise;
        }],

        resolveListCodeValue: ['$q', 'CodeValueService', 'OrgApiService', function ($q, CodeValueService, OrgApiService) {
            var deferred = $q.defer();
            var lists = {};

            lists.listLineOfBusiness = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness);
            lists.listInternalOrganizationDefinition1 = CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true);
            lists.listProfileType = CodeValueService.getRelatedCodeValues(CodeValueGroups.ProfileType, ApplicationConstants.UserProfileGroupWorker, CodeValueGroups.ProfileGroup);
            lists.listWorksite = CodeValueService.getCodeValues(CodeValueGroups.Worksite);
            lists.listTaxSubdivision = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryCanada, CodeValueGroups.Country);
            lists.listWorkerEligibility = CodeValueService.getCodeValues(CodeValueGroups.WorkerEligibilityType);

            lists.listOrganizationRoleType = _.filter(CodeValueService.getCodeValues(CodeValueGroups.OrganizationRoleType), function (item) {
                return item.id === ApplicationConstants.OrganizationRoleType.IndependentContractor ||
                    item.id === ApplicationConstants.OrganizationRoleType.SubVendor ||
                    item.id === ApplicationConstants.OrganizationRoleType.LimitedLiabilityCompany;
            });

            var oDataParamsOrg = oreq.request().withSelect(['Id', 'DisplayName', 'LegalName', 'Code', 'IsTest']).url();
            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParamsOrg).then(
                function (orgResponseSuccess) {
                    lists.listClient = orgResponseSuccess.Items;
                },
                function (orgResponseError) {
                    lists.listClient = [];
                });

            OrgApiService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(oDataParamsOrg).then(
                function (orgResponseSuccess) {
                    lists.listInternalOrganization = orgResponseSuccess.Items;
                },
                function (orgResponseError) {
                    lists.listInternalOrganization = [];
                });


            lists.listComplianceDocumentRuleAreaType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleAreaType);
            lists.listComplianceDocumentRuleEntityType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleEntityType);
            lists.listComplianceDocumentRuleExpiryType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleExpiryType);
            lists.listComplianceDocumentRuleRequiredSituationType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleRequiredSituationType);
            lists.listComplianceDocumentRuleRequiredType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleRequiredType);
            lists.listComplianceDocumentRuleRestrictionType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleRestrictionType);
            lists.listComplianceDocumentRuleStatus = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleStatus);
            lists.listUserDefinedCodeComplianceDocumentTypeStatus = CodeValueService.getCodeValues(CodeValueGroups.UserDefinedCodeComplianceDocumentTypeStatus);
            lists.listDocumentTypes = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, ApplicationConstants.EntityType.ComplianceDocumentRule, CodeValueGroups.EntityType);
            lists.listComplianceDocumentRuleProfileVisibilityType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleProfileVisibilityType);
            deferred.resolve(lists);
            return deferred.promise;
        }],


        resolveListUserDefinedCodeComplianceDocumentType: ['$q', 'ComplianceDocumentRuleApiService', function ($q, ComplianceDocumentRuleApiService) {
            var deferred = $q.defer();

            var oDataFilterArray = [];
            oDataFilterArray.push("StatusId eq " + ApplicationConstants.UserDefinedCodeComplianceDocumentTypeStatus.Active);
            oDataFilterArray.push("StatusId eq " + ApplicationConstants.UserDefinedCodeComplianceDocumentTypeStatus.Inactive);
            var oDataFilter = oDataFilterArray.join(" or ");
            var oDataParams = oreq.request()
                .withSelect([
                    'Id',
                    'StatusId',
                    'Name',
                    'Description',
                ])
                .withFilter(oDataFilter)
                .url();

            ComplianceDocumentRuleApiService.getListUserDefinedCodeComplianceDocumentTypes(oDataParams).then(
                function (responseSucces) {
                    deferred.resolve(responseSucces.Items);
                },
                function (responseError) {
                    deferred.reject(responseError);
                });

            return deferred.promise;
        }],


    };

})(Phoenix.App, angular);