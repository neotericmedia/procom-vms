(function (app, angular) {
    'use strict';

    var controllerId = 'OrgEditController';

    angular
        .module('phoenix.org.controllers')
        .controller(controllerId, [
            '$state', '$rootScope', '$controller', 'common', 'OrgApiService', 'NavigationService', 'ProfileApiService', 'CodeValueService', 'resolveEntity', 'resolveCodeValueLists', 'resolveParentOrganizationList', 'resolveUserProfileInternalList', 'resolveUserProfileAssignedToList', 'resolveListOrganizationInternal', 'resolveListOrganizationClient', '$timeout', 'NoteApiService', OrgEditController]);

    function OrgEditController(
        $state, $rootScope, $controller, common, OrgApiService, NavigationService, ProfileApiService, CodeValueService, resolveEntity, resolveCodeValueLists, resolveParentOrganizationList, resolveUserProfileInternalList, resolveUserProfileAssignedToList, resolveListOrganizationInternal, resolveListOrganizationClient, $timeout, NoteApiService) {

        if (resolveEntity && !resolveEntity.Id) {
            // Can't do this in resolver because ui-router resolve happens before phoenixauth.loadContext
            resolveEntity.AssignedToUserProfileId = $rootScope.CurrentProfile.Id;
            resolveEntity.CreatedByName = $rootScope.UserContext.User.FirstName + " " + $rootScope.UserContext.User.LastName;

        }

        var self = this;
        angular.extend(self, {
            entity: resolveEntity,
            lists: resolveCodeValueLists,
            userProfileInternalList: resolveUserProfileInternalList,
            userProfileAssignedToList: resolveUserProfileAssignedToList,
            parentOrganizations: resolveParentOrganizationList,
            internalOrganizations: resolveListOrganizationInternal,
            clientOrganizations: resolveListOrganizationClient,
            cultureId: 48,
            codeValueService: CodeValueService,
            changeHistoryBlackList: [
                { TableSchemaName: '', TableName: '', ColumnName: 'Id' },
                { TableSchemaName: '', TableName: '', ColumnName: 'Metadata' },
                { TableSchemaName: '', TableName: '', ColumnName: 'IsDraft' },
                { TableSchemaName: '', TableName: '', ColumnName: 'IsDeleted' },
                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'LastModifiedDatetime' },
                { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedByProfileId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'CreatedDatetime' },
                { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationClientRoleId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationInternalRoleId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationIndependentContractorRoleId' },
                { TableSchemaName: '', TableName: '', ColumnName: 'OrganizationLimitedLiabilityCompanyRoleId' },
                { TableSchemaName: 'org', TableName: 'OrganizationClientRoleLOB', ColumnName: 'LineOfBusinessId' },
                { TableSchemaName: 'payment', TableName: 'PaymentMethod', ColumnName: 'PaymentMethodTypeId' },
                { TableSchemaName: 'org', TableName: 'OrganizationAddress', ColumnName: 'IsPrimary' },
            ],

            tab: {
                configList: [{ state: 'org.edit.details', stateName: 'Details', stateIcon: 'fontello-icon-doc-7' },
                { state: 'org.edit.roles', stateName: 'Roles', stateIcon: 'fontello-icon-network' },
                { state: 'org.edit.contacts', stateName: 'Contacts', stateIcon: 'fontello-icon-contacts' },
                { state: 'org.edit.collaborators', stateName: 'Collaborators', stateIcon: 'fontello-icon-user' },
                { state: "org.edit.notes", stateName: 'Notes', stateIcon: "" },
                { state: 'org.edit.history', stateName: 'History', stateIcon: 'fontello-icon-th-4' },
                { state: 'org.edit.advances', stateName: 'Advances', stateIcon: 'fontello-icon-money' },
                { state: 'org.edit.garnishees', stateName: 'Garnishees', stateIcon: 'fontello-icon-hammer' }],
                onClick: function (stateName) {
                    if (stateName === "org.edit.roles") {
                        $timeout(function () {
                            if (typeof (self.entity.OrganizationClientRoles) != 'undefined' && self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.client', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationClientRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationIndependentContractorRoles) != 'undefined' && self.entity.OrganizationIndependentContractorRoles && self.entity.OrganizationIndependentContractorRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.independentcontractor', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationIndependentContractorRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationLimitedLiabilityCompanyRoles) != 'undefined' && self.entity.OrganizationLimitedLiabilityCompanyRoles && self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.limitedliabilitycompany', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationLimitedLiabilityCompanyRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationSubVendorRoles) != 'undefined' && self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.subvendor', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationSubVendorRoles[0].Id }, {
                                    reload: false, inherit: true, notify: true
                                });
                            }
                            else if (typeof (self.entity.OrganizationInternalRoles) != 'undefined' && self.entity.OrganizationInternalRoles && self.entity.OrganizationInternalRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.internal', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationInternalRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                        });
                    }
                    else if ($state.params.roleId === '0' && (stateName === "org.edit.roles.client" || stateName === "org.edit.roles.independentcontractor" || stateName === "org.edit.roles.limitedliabilitycompany" || stateName === "org.edit.roles.internal" || stateName === "org.edit.roles.subvendor")) {
                        $timeout(function () {
                            if (typeof (self.entity.OrganizationClientRoles) != 'undefined' && self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.client', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationClientRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationIndependentContractorRoles) != 'undefined' && self.entity.OrganizationIndependentContractorRoles && self.entity.OrganizationIndependentContractorRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.independentcontractor', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationIndependentContractorRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationLimitedLiabilityCompanyRoles) != 'undefined' && self.entity.OrganizationLimitedLiabilityCompanyRoles && self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.limitedliabilitycompany', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationLimitedLiabilityCompanyRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else if (typeof (self.entity.OrganizationSubVendorRoles) != 'undefined' && self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.subvendor', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationSubVendorRoles[0].Id }, {
                                    reload: false, inherit: true, notify: true
                                });
                            }
                            else if (typeof (self.entity.OrganizationInternalRoles) != 'undefined' && self.entity.OrganizationInternalRoles && self.entity.OrganizationInternalRoles.length > 0) {
                                $state.transitionTo('org.edit.roles.internal', { organizationId: $state.params.organizationId, roleId: self.entity.OrganizationInternalRoles[0].Id }, { reload: false, inherit: true, notify: true });
                            }
                            else {
                                $state.transitionTo('org.edit.roles', { organizationId: $state.params.organizationId }, { reload: false, inherit: true, notify: true });
                            }
                        });
                    }
                    else if (!self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && (stateName === "org.edit.advances" || stateName === "org.edit.garnishees")) {
                        $timeout(function () {
                            $state.transitionTo('org.edit.details', { organizationId: $state.params.organizationId }, { reload: false, inherit: true, notify: true });
                        });
                    }
                },

                addonHtml: function (tab) {
                    if (tab.stateName == 'Advances') {
                        return self.entity.ActiveAdvancesCount > 0 ? '<span class="badge badge-success" style="padding:1px 4px">' + self.entity.ActiveAdvancesCount + '</span>' : '';
                    }
                    else if (tab.stateName == 'Garnishees') {
                        return self.entity.ActiveGarnisheesCount > 0 ? '<span class="badge badge-success" style="padding:1px 4px">' + self.entity.ActiveGarnisheesCount + '</span>' : '';
                    }
                    else {
                        return '';
                    }
                },

                valid: function (tab) {
                    self.validator.tabValid(tab);
                    if (tab.stateName == 'Details') {
                        return self.validator.tabDetailsIsValid;
                    }
                    else if (tab.stateName == 'Roles') {
                        return self.validator.tabRolesIsValid;
                    }
                    else if (tab.stateName == 'Collaborators') {
                        return self.validator.tabCollaboratorsIsValid;
                    }
                    else {
                        return true;
                    }
                },

                show: function () {
                    if (!(self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && self.entity.IsOrganizationIndependentContractorRole)) {
                        self.tab.configList = _.filter(self.tab.configList, function (tab) {
                            return tab.stateName !== 'Garnishees';
                        });
                    }
                    if (!(self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && (self.entity.IsOrganizationIndependentContractorRole || self.entity.IsOrganizationSubVendorRole))) {
                        self.tab.configList = _.filter(self.tab.configList, function (tab) {
                            return tab.stateName !== 'Advances';
                        });
                    }
                    if (!(self.entity.IsOriginal)) {
                        self.tab.configList = _.filter(self.tab.configList, function (tab) {
                            return tab.stateName !== 'Notes';
                        });
                    }
                }
            },

            invite: function () {
                self.isInvited = true;
                $rootScope.activateGlobalSpinner = true;
                OrgApiService.organizationInviteClientConsultants({ Id: self.entity.Id }).then(
                    function (responseSuccess) {
                        self.isInvited = false;
                        $rootScope.activateGlobalSpinner = false;
                    },
                    function (responseError) {
                        self.isInvited = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            },

            recalcNavigationName: function () {
                if ($state.includes('org.quickadd')) {
                    NavigationService.setTitle('organization-quick-add');
                }
                else {
                    var displayName = this.entity && this.entity.DisplayName;
                    if (displayName) {
                        NavigationService.setTitle('organization-edit', [displayName]);
                    }
                    else {
                        NavigationService.setTitle('organization-new');
                    }
                }
            },

            ptFieldViewConfigOnChangeStatusId: {
                funcToCheckViewStatus: function (modelPrefix, fieldName, modelValidation) {
                    //  Attention developers: do NOT use "if" statement inside of "if" statement. You MUST to have "else" statement always 
                    if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.Cheque &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleAddPaymentMethodCheque)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.DirectDeposit &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodDirectDeposit)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.WireTransfer &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.ADP &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodAdp)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'PaymentMethodDirectDepositBankCode' || fieldName == 'PaymentMethodDirectDepositBankBranchCode' || fieldName == 'PaymentMethodDirectDepositBankAccountNumber') &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodDirectDeposit)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        (fieldName == 'PaymentMethodADP') &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditPaymentMethodAdp)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'ProfileNameBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'NameBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'AccountNumberBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address1Beneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address2Beneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CityBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'ProvinceOrStateBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CountryCodeBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'PostalorZipBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'PayCurrencyBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'WireTransferBankTypeIdBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'BankIDBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'ABANoBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'WireTransferBankTypeIdIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'BankNameIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'BankIdIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address1Intemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address2Intemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CityIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'ProvinceOrStateIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CountryCodeIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'PostalOrZipIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'WireTransferBankTypeIdReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'BankNameReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'BankIdReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address1Receivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'Address2Receivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CityReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'ProvinceOrStateReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'CountryCodeReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'PostalOrZipReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethodSubVendor' &&
                        fieldName == 'PaymentDetailNotes' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.Cheque &&
                        (!common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodCheque)
                            || !self.entity.AreComplianceFieldsEditable)
                    ) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.DirectDeposit &&
                        (!common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodDirectDeposit)
                            || !self.entity.AreComplianceFieldsEditable)
                    ) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.WireTransfer &&
                        (!common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)
                            || !self.entity.AreComplianceFieldsEditable)
                    ) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        (fieldName == 'OrganizationPaymentMethodIsSelected' || fieldName == 'OrganizationPaymentMethodIsPreferred') &&
                        modelValidation && modelValidation !== null && modelValidation === ApplicationConstants.PaymentMethodType.ADP &&
                        (!common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodAdp)
                            || !self.entity.AreComplianceFieldsEditable)
                    ) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethod' &&
                        (fieldName == 'PaymentMethodDirectDepositBankCode' || fieldName == 'PaymentMethodDirectDepositBankBranchCode' || fieldName == 'PaymentMethodDirectDepositBankAccountNumber') &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodDirectDeposit)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethod' && (fieldName == 'PaymentMethodADP') &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodAdp)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'ProfileNameBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'NameBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'AccountNumberBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address1Beneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address2Beneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CityBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'ProvinceOrStateBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CountryCodeBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'PostalorZipBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'PayCurrencyBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'WireTransferBankTypeIdBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'BankIDBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'ABANoBeneficiary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'WireTransferBankTypeIdIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'BankNameIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'BankIdIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address1Intemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address2Intemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CityIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'ProvinceOrStateIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CountryCodeIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'PostalOrZipIntemediary' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'WireTransferBankTypeIdReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'BankNameReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'BankIdReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address1Receivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'Address2Receivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CityReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'ProvinceOrStateReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'CountryCodeReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'PostalOrZipReceivers' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'paymentMethod' &&
                        fieldName == 'PaymentDetailNotes' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditPaymentMethodWireTransfer)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (fieldName == 'OrganizationRoleStatusId' && modelValidation && modelValidation !== null && modelValidation.Id > 0 && !self.entity.IsOriginal && self.entity.IsDraftStatus) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'nationalAccountManager' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationClientRoleEditNationalAccountManager)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'alternateBill' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationClientRoleEditNationalAccountManager)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'bankAccount' &&
                        !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationInternalRoleEditBankAccount)) {
                        return ApplicationConstants.viewStatuses.view;
                    } else if (modelPrefix == 'taxNumber' && typeof self.entity.AccessActions !== 'undefined' // is undefined in Quick Add
                        &&
                        (
                            (self.entity.OrganizationIndependentContractorRoles.length && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditTaxNumber)) ||
                            (self.entity.OrganizationInternalRoles.length && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationInternalRoleEditTaxNumber)) ||
                            (self.entity.OrganizationSubVendorRoles.length && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubVendorRoleEditTaxNumber))
                        )
                    ) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (!self.entity.AreComplianceFieldsEditable && isAccountingField(modelPrefix, fieldName)) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (self.entity.IsDraftStatus) {
                        return ApplicationConstants.viewStatuses.edit;
                    } else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                },
                funcToPassMessages: function (message) {
                    common.logWarning(message);
                },
                watchChangeEvent: 'self.entity.OrganizationStatusId',
            },

            residencyStatusOptions: ApplicationConstants.ResidencyStatusOptions,

            complianceDocument: {
                parentEntityHasNoApplicableComplianceDocuments: false,
                allComplianceDocumentsAreValidForSubmission: false,
                onComplianceDocumentOutput: function (complianceDocumentCallBackEmitterObj) {
                    self.complianceDocument.allComplianceDocumentsAreValidForSubmission = complianceDocumentCallBackEmitterObj.AllComplianceDocumentsAreValidForSubmission;
                    self.complianceDocument.parentEntityHasNoApplicableComplianceDocuments = complianceDocumentCallBackEmitterObj.ParentEntityHasNoApplicableComplianceDocuments;
                }
            },

        });

        function isAccountingField(modelPrefix, fieldName) {
            var result = false;
            if (modelPrefix === 'scopeOrg.entity.OrganizationClientRoles[0]') {
                if (fieldName === 'IsChargeSalesTax'
                    || fieldName === 'IsChargeableExpenseSalesTax'
                    || fieldName === 'ClientSalesTaxDefaultId'
                    || fieldName === 'AccrueMaxedOutCanadaPensionPlanforTemp'
                    || fieldName === 'AccrueMaxedOutCanadaPensionPlanforSP'
                    || fieldName === 'AccrueMaxedOutEmploymentInsuranceForTemp'
                    || fieldName === 'AccrueMaxedOutEmploymentInsuranceForSP'
                    || fieldName === 'AccrueMaxedOutQuebecParentalInsurancePlanForTemp'
                    || fieldName === 'AccrueMaxedOutQuebecParentalInsurancePlanForSP'
                ) {
                    result = true;
                }
            } else if (modelPrefix === 'scopeOrg.entity') {
                if (fieldName === 'OrganizationIndependentContractorPaymentMethodTypeId'
                    || fieldName === 'OrganizationLimitedLiabilityPaymentMethodTypeId'
                    || fieldName === 'SubvendorPaymentMethodTypeId'
                ) {
                    result = true;
                }
            } else if (modelPrefix === 'paymentMethod') {
                result = true;
            } else if (modelPrefix === 'bankAccount') {
                result = true;
            } else if (modelPrefix === 'paymentMethodSubVendor') {
                result = true;
            }
            return result;
        }

        function initAddressNavigation() {
            angular.forEach(self.entity.OrganizationAddresses, function (address, index) {
                self.entity.OrganizationAddresses[index].lists = { subdivisionList: [] };
                if (angular.isDefined(address.CountryId) && address.CountryId && address.CountryId > 0) {
                    self.entity.OrganizationAddresses[index].lists.subdivisionList = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
                } else {
                    self.entity.OrganizationAddresses[index].lists.subdivisionList = [];
                    self.entity.OrganizationAddresses[index].SubdivisionId = undefined;
                    self.entity.OrganizationAddresses[index].PostalCode = '';
                }
            });

            self.entity.OrganizationAddresses[0].IsPrimary = true;
            var addressDescription = self.entity.OrganizationAddresses[0].AddressDescription;
            self.entity.OrganizationAddresses[0].AddressDescription = addressDescription ? addressDescription : "Head Office";
        }

        function initListsDependancy() {
            if (angular.isDefined(self.entity.SectorTypeId) && self.entity.SectorTypeId && self.entity.SectorTypeId > 0) {
                self.lists.industryTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.IndustryType, self.entity.SectorTypeId, CodeValueGroups.SectorType);
            }
            if (angular.isDefined(self.entity.CountryId) && self.entity.CountryId && self.entity.CountryId > 0) {
                self.lists.taxSubdivisionList = resolveCodeValueLists.taxSubdivisionLists[self.entity.CountryId];
            }
        }
        function removeInactiveUserProfiles() {
            if (self.entity && self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles.length > 0 && self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers) {
                var nationalManagerUserProfileIds = [];
                self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers.map(function (manager) { nationalManagerUserProfileIds.push(manager.UserProfileInternalId) });
                ProfileApiService.removeInactiveProfile(self.userProfileInternalList, nationalManagerUserProfileIds);
            }

            ProfileApiService.removeInactiveProfile(self.userProfileAssignedToList, self.entity.AssignedToUserProfileId);
        }

        self.revalidatePaymentMethods = function () {
            if (self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) {
                resolveEntity.SubvendorPaymentMethodTypeId = (_.find(self.entity.OrganizationSubVendorRoles[0].PaymentMethods, { IsPreferred: true }) || {}).PaymentMethodTypeId;
                _.forEach(self.entity.OrganizationSubVendorRoles[0].PaymentMethods, function (paymentMethod) {
                    //paymentMethod.id = paymentMethod.PaymentMethodTypeId;
                    paymentMethod.text = CodeValueService.getCodeValueText(paymentMethod.PaymentMethodTypeId, CodeValueGroups.PaymentMethodType);
                });
            }

            if (self.entity.OrganizationIndependentContractorRoles && self.entity.OrganizationIndependentContractorRoles.length > 0) {
                resolveEntity.OrganizationIndependentContractorPaymentMethodTypeId = (_.find(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, { IsPreferred: true }) || {}).PaymentMethodTypeId;
                _.forEach(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, function (paymentMethod) {
                    //paymentMethod.id = paymentMethod.PaymentMethodTypeId;
                    paymentMethod.text = CodeValueService.getCodeValueText(paymentMethod.PaymentMethodTypeId, CodeValueGroups.PaymentMethodType);
                });
            }

            if (self.entity.OrganizationLimitedLiabilityCompanyRoles && self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0) {
                resolveEntity.OrganizationLimitedLiabilityPaymentMethodTypeId = (_.find(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, { IsPreferred: true }) || {}).PaymentMethodTypeId;
                _.forEach(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, function (paymentMethod) {
                    //paymentMethod.id = paymentMethod.PaymentMethodTypeId;
                    paymentMethod.text = CodeValueService.getCodeValueText(paymentMethod.PaymentMethodTypeId, CodeValueGroups.PaymentMethodType);
                });
            }


        };
        function currentProfileUnderComplianceRole() {
            return _.filter($rootScope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOffice
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Finance
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Controller
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOfficeARAP
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.AccountsReceivable
                );
            }).length > 0;
        }
        function isComplianceDraftStatus(statusId) {
            return statusId === ApplicationConstants.OrganizationStatus.ComplianceDraft
                || statusId === ApplicationConstants.OrganizationStatus.RecalledCompliance
                ;
        }
        function complianceFieldsEditable() {
            return currentProfileUnderComplianceRole() && isComplianceDraftStatus(self.entity.OrganizationStatusId);
        }
        function isDraftStatus(statusId) {
            return statusId === ApplicationConstants.OrganizationStatus.New
                || statusId === ApplicationConstants.OrganizationStatus.Draft
                || statusId === ApplicationConstants.OrganizationStatus.Declined
                || statusId === ApplicationConstants.OrganizationStatus.Recalled
                || (isComplianceDraftStatus(statusId) && currentProfileUnderComplianceRole()); // TODO: replace role check with WorkflowAvailableActions contains save action in ng2?
        }
        self.load = function () {
            self.entity.IsDraftStatus = isDraftStatus(self.entity.OrganizationStatusId);
            self.entity.AreComplianceFieldsEditable = complianceFieldsEditable();
            self.entity.AreComplianceFieldsRequired = !(self.entity.IsDraftStatus && !isComplianceDraftStatus(self.entity.OrganizationStatusId));
            self.revalidatePaymentMethods();
            initAddressNavigation();
            initListsDependancy();
            $controller('OrgEditControllerExtendEventsForScope', { self: self });
            angular.extend(self.lists, { listOrganizationInternal: resolveListOrganizationInternal, listOrganizationClient: resolveListOrganizationClient });
            if ($state.includes('org.edit')) {
                $controller('OrgEditControllerExtendEventsForWorkflow', { self: self });
                $controller('OrgEditControllerExtendTabValidator', { self: self });
            }
            else if ($state.includes('org.quickadd')) {
                $controller('OrgEditControllerExtendOnQuickAdd', { self: self });
            }
            self.actionScope.showToRecalc();
            self.tab.show();
            self.tab.onClick($state.current.name);
            self.recalcNavigationName();
            removeInactiveUserProfiles();
            setTimeout(function () {
                if (self.workflow && self.workflow.WorkflowAvailableActions) {
                    if (!self.workflow.WorkflowAvailableActions.length) {
                        self.workflow.getActions(self.entity);
                    }
                }
            }, 1000);

            self.isSendInviteVisible = _.filter($rootScope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                );
            }).length > 0;

            NoteApiService.getNotes(ApplicationConstants.EntityType.Organization, $state.params.organizationId).then(function success(responseSuccess) {
                self.updateNotesTotal(responseSuccess.Items);
            });
        };

        self.load();

        self.goToNotes = function () {
            $state.go('org.edit.notes');
        }

        self.updateNotesTotal = function (notes) {
            self.orgUnreadNotes = countUnreadNotes(notes);
            self.orgNotesTotal = notes.length;
        }

        function countUnreadNotes(notes) {
            return _.filter(notes, function (note) {
                return note.UnreadNote && !note.UnreadNote.IsRead;
            }).length;
        }
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.OrgEditController = {
        resolveEntity: ['$q', '$stateParams', 'OrgApiService', function ($q, $stateParams, OrgApiService) {
            var deferred = $q.defer();
            if ($stateParams.organizationId > 0) {
                var organizationId = parseInt($stateParams.organizationId, 10);
                var oDataParams = oreq.request()
                    .withExpand([
                        'AccessActions',
                        'Versions',
                        'ParentOrganization',
                        'OrganizationAddresses',
                        'OrganizationTaxNumbers',

                        'OrganizationClientRoles',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills',
                        'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers',

                        'OrganizationInternalRoles',
                        'OrganizationInternalRoles/BankAccounts',

                        'OrganizationIndependentContractorRoles',
                        'OrganizationIndependentContractorRoles/PaymentMethods',

                        'OrganizationLimitedLiabilityCompanyRoles',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods',

                        'OrganizationSubVendorRoles',
                        'OrganizationSubVendorRoles/PaymentMethods',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions',
                    ])
                    .withSelect([
                        'WorkflowPendingTaskId',
                        'AccessActions/AccessAction',

                        'Id',
                        'SourceId',
                        'IdOriginal',
                        'OrganizationStatusId',
                        'IsOriginal',
                        'IsOriginalAndStatusIsAtiveOrPendingChange',
                        'Code',
                        'LegalName',
                        'DisplayName',
                        'IsDraft',
                        'ModifiedBy',
                        'ParentOrganizationId',
                        'IndustryTypeId',
                        'SectorTypeId',
                        'CountryId',
                        'DefaultTaxSubdivisionId',
                        'AssignedToUserProfileId',
                        'CreatedByName',
                        'IsOrganizationClientRole',
                        'IsOrganizationInternalRole',
                        'IsOrganizationIndependentContractorRole',
                        'IsOrganizationLimitedLiabilityCompanyRole',
                        'IsOrganizationSubVendorRole',
                        'ActiveAdvancesCount',
                        'ActiveGarnisheesCount',
                        'IsWorkflowRunning',
                        'Title',

                        'Versions/Id',
                        'Versions/IsOriginal',
                        'Versions/OrganizationStatusId',

                        'ParentOrganization/Id',
                        'ParentOrganization/Name',
                        'ParentOrganization/IsDraft',
                        'ParentOrganization/LastModifiedDatetime',

                        'OrganizationAddresses/Id',
                        'OrganizationAddresses/OrganizationId',
                        'OrganizationAddresses/IsPrimary',
                        // 'OrganizationAddresses/AddressTypeId',
                        'OrganizationAddresses/AddressDescription',
                        'OrganizationAddresses/CountryId',
                        'OrganizationAddresses/CityName',
                        'OrganizationAddresses/AddressLine1',
                        'OrganizationAddresses/AddressLine2',
                        'OrganizationAddresses/SubdivisionId',
                        'OrganizationAddresses/PostalCode',
                        'OrganizationAddresses/IsDraft',

                        'OrganizationTaxNumbers/Id',
                        'OrganizationTaxNumbers/SalesTaxId',
                        'OrganizationTaxNumbers/SalesTaxNumber',
                        'OrganizationTaxNumbers/IsDraft',
                        'OrganizationTaxNumbers/OrganizationId',

                        'OrganizationClientRoles/Id',
                        'OrganizationClientRoles/IdOriginal',
                        'OrganizationClientRoles/OrganizationRoleTypeId',
                        'OrganizationClientRoles/OrganizationId',
                        'OrganizationClientRoles/OrganizationRoleStatusId',
                        'OrganizationClientRoles/IsChargeSalesTax',
                        'OrganizationClientRoles/IsChargeableExpenseSalesTax',
                        'OrganizationClientRoles/IsBypassZeroUnitTimeSheetApproval',
                        'OrganizationClientRoles/IsSuppressZeroAmountInvoiceRelease',
                        'OrganizationClientRoles/ClientSalesTaxDefaultId',
                        'OrganizationClientRoles/SalesTaxCountryId',
                        'OrganizationClientRoles/SalesTaxSubdivisionId',
                        'OrganizationClientRoles/StartDate',
                        'OrganizationClientRoles/ExpiryDate',
                        'OrganizationClientRoles/IsDraft',
                        'OrganizationClientRoles/IsAccrueMaxedOutCanadaPensionPlanForTemp',
                        'OrganizationClientRoles/IsAccrueMaxedOutCanadaPensionPlanForSP',
                        'OrganizationClientRoles/IsAccrueMaxedOutEmploymentInsuranceForTemp',
                        'OrganizationClientRoles/IsAccrueMaxedOutEmploymentInsuranceForSP',
                        'OrganizationClientRoles/IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp',
                        'OrganizationClientRoles/IsAccrueMaxedOutQuebecParentalInsurancePlanForSP',
                        'OrganizationClientRoles/IsAccrueMaxedOutQuebecPensionPlanForTemp',
                        'OrganizationClientRoles/IsAccrueMaxedOutQuebecPensionPlanForSP',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs/Id',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs/OrganizationClientRoleId',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs/LineOfBusinessId',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs/IsSelected',
                        'OrganizationClientRoles/OrganizationClientRoleLOBs/IsDraft',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/Id',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/OrganizationClientRoleId',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/OrganizationClientRoleAlternateBillStatusId',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillLegalName',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/AlternateBillCode',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsActive',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsSelected',
                        'OrganizationClientRoles/OrganizationClientRoleAlternateBills/IsDraft',
                        'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/Id',
                        'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/OrganizationClientRoleId',
                        'OrganizationClientRoles/OrganizationClientRoleNationalAccountManagers/UserProfileInternalId',

                        'OrganizationInternalRoles/Id',
                        'OrganizationInternalRoles/IdOriginal',
                        'OrganizationInternalRoles/OrganizationRoleTypeId',
                        'OrganizationInternalRoles/OrganizationRoleStatusId',
                        'OrganizationInternalRoles/OrganizationId',
                        'OrganizationInternalRoles/IsDraft',
                        'OrganizationInternalRoles/ApplicationDate',
                        'OrganizationInternalRoles/IsAccrueEmployerHealthTaxLiability',
                        'OrganizationInternalRoles/BankAccounts/Id',
                        'OrganizationInternalRoles/BankAccounts/OrganizationInternalRoleId',
                        'OrganizationInternalRoles/BankAccounts/BankName',
                        'OrganizationInternalRoles/BankAccounts/Description',
                        'OrganizationInternalRoles/BankAccounts/GLAccount',
                        'OrganizationInternalRoles/BankAccounts/Transit',
                        'OrganizationInternalRoles/BankAccounts/AccountNo',
                        'OrganizationInternalRoles/BankAccounts/AccountId',
                        'OrganizationInternalRoles/BankAccounts/CurrencyId',
                        'OrganizationInternalRoles/BankAccounts/OrganizationBankSignatureId',
                        'OrganizationInternalRoles/BankAccounts/OrganizationBankStatusId',
                        'OrganizationInternalRoles/BankAccounts/IsPrimary',
                        'OrganizationInternalRoles/BankAccounts/NextChequeNumber',
                        'OrganizationInternalRoles/BankAccounts/NextDirectDepositBatchNumber',
                        'OrganizationInternalRoles/BankAccounts/NextWireTransferBatchNumber',
                        'OrganizationInternalRoles/BankAccounts/IsDraft',

                        'OrganizationIndependentContractorRoles/Id',
                        'OrganizationIndependentContractorRoles/IdOriginal',
                        'OrganizationIndependentContractorRoles/OrganizationRoleTypeId',
                        'OrganizationIndependentContractorRoles/OrganizationRoleStatusId',
                        'OrganizationIndependentContractorRoles/OrganizationId',
                        'OrganizationIndependentContractorRoles/NotificationEmail',
                        'OrganizationIndependentContractorRoles/IsNonResident',
                        'OrganizationIndependentContractorRoles/BusinessNumber',
                        'OrganizationIndependentContractorRoles/IsDraft',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Id',
                        'OrganizationIndependentContractorRoles/PaymentMethods/OrganizationIndependentContractorRoleId',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PaymentMethodTypeId',
                        'OrganizationIndependentContractorRoles/PaymentMethods/IsSelected',
                        'OrganizationIndependentContractorRoles/PaymentMethods/IsPreferred',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankCode',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankBranchCode',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankAccountNumber',
                        'OrganizationIndependentContractorRoles/PaymentMethods/ProfileNameBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/NameBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/AccountNumberBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address1Beneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address2Beneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CityBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PostalorZipBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PayCurrencyBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankIDBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/ABANoBeneficiary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankNameIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankIdIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address1Intemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address2Intemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CityIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PostalOrZipIntemediary',
                        'OrganizationIndependentContractorRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankNameReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/BankIdReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address1Receivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/Address2Receivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CityReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/ProvinceOrStateReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/CountryCodeReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PostalOrZipReceivers',
                        'OrganizationIndependentContractorRoles/PaymentMethods/PaymentDetailNotes',
                        'OrganizationIndependentContractorRoles/PaymentMethods/EmployeeId',

                        'OrganizationLimitedLiabilityCompanyRoles/Id',
                        'OrganizationLimitedLiabilityCompanyRoles/IdOriginal',
                        'OrganizationLimitedLiabilityCompanyRoles/OrganizationRoleTypeId',
                        'OrganizationLimitedLiabilityCompanyRoles/OrganizationRoleStatusId',
                        'OrganizationLimitedLiabilityCompanyRoles/OrganizationId',
                        'OrganizationLimitedLiabilityCompanyRoles/NotificationEmail',
                        'OrganizationLimitedLiabilityCompanyRoles/IsNonResident',
                        'OrganizationLimitedLiabilityCompanyRoles/EmployerIdentificationNumber',
                        'OrganizationLimitedLiabilityCompanyRoles/IsDraft',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Id',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/OrganizationLimitedLiabilityCompanyRoleId',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PaymentMethodTypeId',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/IsSelected',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/IsPreferred',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankCode',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankBranchCode',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankAccountNumber',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProfileNameBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/NameBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/AccountNumberBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Beneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Beneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalorZipBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PayCurrencyBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIDBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ABANoBeneficiary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankNameIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIdIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Intemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Intemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalOrZipIntemediary',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankNameReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/BankIdReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address1Receivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/Address2Receivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CityReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/ProvinceOrStateReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/CountryCodeReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PostalOrZipReceivers',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/PaymentDetailNotes',
                        'OrganizationLimitedLiabilityCompanyRoles/PaymentMethods/EmployeeId',

                        'OrganizationSubVendorRoles/Id',
                        'OrganizationSubVendorRoles/IdOriginal',
                        'OrganizationSubVendorRoles/OrganizationRoleTypeId',
                        'OrganizationSubVendorRoles/OrganizationRoleStatusId',
                        'OrganizationSubVendorRoles/OrganizationId',
                        'OrganizationSubVendorRoles/IsDraft',
                        'OrganizationSubVendorRoles/NotificationEmail',
                        'OrganizationSubVendorRoles/IsNonResident',
                        'OrganizationSubVendorRoles/BusinessNumber',
                        'OrganizationSubVendorRoles/UseADifferentPayeeName',
                        'OrganizationSubVendorRoles/PayeeName',
                        'OrganizationSubVendorRoles/PaymentMethods/Id',
                        'OrganizationSubVendorRoles/PaymentMethods/OrganizationSubVendorRoleId',
                        'OrganizationSubVendorRoles/PaymentMethods/PaymentMethodTypeId',
                        'OrganizationSubVendorRoles/PaymentMethods/IsSelected',
                        'OrganizationSubVendorRoles/PaymentMethods/IsPreferred',
                        'OrganizationSubVendorRoles/PaymentMethods/BankCode',
                        'OrganizationSubVendorRoles/PaymentMethods/BankBranchCode',
                        'OrganizationSubVendorRoles/PaymentMethods/BankAccountNumber',
                        'OrganizationSubVendorRoles/PaymentMethods/ProfileNameBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/NameBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/AccountNumberBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/Address1Beneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/Address2Beneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/CityBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/CountryCodeBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/PostalorZipBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/PayCurrencyBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/BankIDBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/ABANoBeneficiary',
                        'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/BankNameIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/BankIdIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/Address1Intemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/Address2Intemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/CityIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/CountryCodeIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/PostalOrZipIntemediary',
                        'OrganizationSubVendorRoles/PaymentMethods/WireTransferBankTypeIdReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/BankNameReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/BankIdReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/Address1Receivers',
                        'OrganizationSubVendorRoles/PaymentMethods/Address2Receivers',
                        'OrganizationSubVendorRoles/PaymentMethods/CityReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/ProvinceOrStateReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/CountryCodeReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/PostalOrZipReceivers',
                        'OrganizationSubVendorRoles/PaymentMethods/PaymentDetailNotes',
                        'OrganizationSubVendorRoles/PaymentMethods/EmployeeId',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/Id',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationSubVendorRoleId',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationSubVendorRoleRestrictionTypeId',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationIdClient',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/OrganizationIdInternal',
                        'OrganizationSubVendorRoles/OrganizationSubVendorRoleRestrictions/Name',
                    ])
                    .url();
                oDataParams = null;
                OrgApiService.getByOrganizationId(organizationId, oDataParams).then(
                    function (response) {
                        var result = response;
                        deferred.resolve(result);
                    },
                    function (responseError) {
                        ;
                    });



                //var filter = oreq.filter('Id').eq(organizationId);
                // oDataParams = oreq.request()
                // //    .withSelect([
                // //         'Id',
                // //         'DisplayName',
                // //         'Code',
                // //         'LegalName',
                // //         'IsOrganizationClientRole',
                // //         'IsOrganizationIndependentContractorRole',
                // //         'IsOrganizationLimitedLiabilityCompanyRole',
                // //         'IsOrganizationInternalRole',
                // //         'IsOrganizationSubVendorRole',
                // //          'IsDraft',
                // //          'OrganizationStatusId'
                // //])
                // .withFilter(filter)
                // .url();

                // OrgApiService.getOrganizations(oDataParams).then(
                //     function (response) {
                //         var result = response.Items[0];
                //         deferred.resolve(result);
                //     },
                //     function (responseError) {
                //         var e = responseError;
                //     });

            }
            else {
                deferred.resolve({
                    WorkflowPendingTaskId: -1,
                    OrganizationStatusId: ApplicationConstants.OrganizationStatus.New,
                    Code: '',
                    LegalName: null,
                    DisplayName: null,
                    IndustryTypeId: null,
                    SectorTypeId: null,
                    CountryId: 124, //CountryCanada
                    DefaultTaxSubdivisionId: null,
                    AssignedToUserProfileId: null,
                    CreatedByName: null,
                    ParentOrganizationId: null,
                    ParentOrganization: {
                        Name: '',
                    },
                    OrganizationAddresses: [{
                        IsPrimary: true,
                        AddressDescription: '',
                        CityName: '',
                        AddressLine1: '',
                        AddressLine2: '',
                        CountryId: 124, //CountryCanada
                        SubdivisionId: null,
                        PostalCode: '',
                    }],
                    OrganizationIndependentContractorRoles: [{
                        OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                        NotificationEmail: '',
                        IsNonResident: null,
                        PaymentMethods: [{
                            PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                            IsSelected: true,
                            IsPreferred: true,
                        }],
                    }],
                    OrganizationLimitedLiabilityCompanyRoles: [{
                        OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                        NotificationEmail: '',
                        EmployerIdentificationNumber: null,
                        IsNonResident: null,
                        PaymentMethods: [{
                            PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                            IsSelected: true,
                            IsPreferred: true,
                        }],
                    }],
                    OrganizationSubVendorRoles: [{
                        OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                        NotificationEmail: '',
                        IsNonResident: null,
                        PaymentMethods: [{
                            PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                            IsSelected: true,
                            IsPreferred: true,
                        }],
                    }],
                    OrganizationTaxNumbers: [/*{
                        SalesTaxId: null,
                        SalesTaxNumber: null,
                    }*/],
                    Contact: {
                        ContactId: 0,
                        Email: null,
                        PersonTitleId: null,
                        FirstName: null,
                        LastName: null,
                        PhoneTypeId: null,
                        PhoneNumber: null,
                        PhoneExtension: ''
                    }
                });
            }
            return deferred.promise;
        }],
        resolveCodeValueLists: ['CodeValueService', '$q', function (CodeValueService, $q) {
            var result = $q.defer();
            var lists = {
            };
            lists.sectorTypeList = CodeValueService.getCodeValues(CodeValueGroups.SectorType);
            lists.organizationRoleStatusTypeList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationRoleStatusType);
            lists.countryList = CodeValueService.getCodeValues(CodeValueGroups.Country);
            lists.organizationRoleTypeList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationRoleType);
            lists.lineOfBusinessesList = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness);
            lists.currencyList = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
            lists.organizationBankSignatureList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationBankSignature);
            lists.organizationBankStatusList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationBankStatus);
            lists.rebateTypeList = CodeValueService.getCodeValues(CodeValueGroups.RebateType);
            lists.vmsTypeList = CodeValueService.getCodeValues(CodeValueGroups.VMSType);
            lists.clientSalesTaxDefaultList = CodeValueService.getCodeValues(CodeValueGroups.ClientSalesTaxDefault);
            lists.organizationStatusList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationStatus);
            lists.organizationClientRoleAlternateBillStatusList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationClientRoleAlternateBillStatus);
            lists.salesTaxList = CodeValueService.getCodeValues(CodeValueGroups.SalesTax);
            lists.paymentMethodList = CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType, true);
            lists.phoneTypeList = CodeValueService.getCodeValues(CodeValueGroups.ProfilePhoneType, true);
            lists.personTitleList = CodeValueService.getCodeValues(CodeValueGroups.PersonTitle, true);
            lists.taxSubdivisionLists = {
            };

            angular.forEach(lists.countryList, function (country) {
                //console.log(country);
                lists.taxSubdivisionLists[country.id] = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, country.id, CodeValueGroups.Country);
            });

            lists.listOrganizationSubVendorRoleRestrictionType = CodeValueService.getCodeValues(CodeValueGroups.OrganizationSubVendorRoleRestrictionType, true);
            lists.wiretransferBankTypes = CodeValueService.getCodeValues(CodeValueGroups.WireTransferBankType);
            result.resolve(lists);
            return result.promise;
        }],
        resolveListOrganizationInternal: ['AssignmentApiService', '$q', function (AssignmentApiService, $q) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationInternal().then(
                function (response) {
                    var responseItems = _.filter(response, function (item) { return item.DisplayName !== null; });
                    result.resolve(responseItems);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;

        }],
        resolveListOrganizationClient: ['AssignmentApiService', '$q', function (AssignmentApiService, $q) {
            var result = $q.defer();
            AssignmentApiService.getListOrganizationClient().then(
                function (response) {
                    var responseItems = _.filter(response, function (item) { return item.DisplayName !== null; });
                    result.resolve(responseItems);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        resolveParentOrganizationList: ['$q', 'OrgApiService', function ($q, OrgApiService) {
            var deferred = $q.defer();
            OrgApiService.getListParentOrganizations().then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    deferred.resolve([]);
                });
            return deferred.promise;
        }],

        resolveUserProfileInternalList: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var deferred = $q.defer();
            var filter = oreq.filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.Active)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingChange)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.InActive)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingInactive)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingActive)
                ;
            //var filter = oreq.filter('ProfileStatusId').anyOr([ApplicationConstants.ProfileStatus.Active, ApplicationConstants.ProfileStatus.PendingChange]);
            var oDataParams = oreq.request()
                .withExpand(['Contact'])
                .withSelect(['Id', 'ProfileStatusId', 'Contact/Id', 'Contact/FullName'])
                .withFilter(filter)
                .url();
            AssignmentApiService.getListUserProfileInternal(oDataParams).then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    deferred.resolve([]);
                });
            return deferred.promise;
        }],

        resolveUserProfileAssignedToList: ['$q', 'ProfileApiService', function ($q, ProfileApiService) {
            var deferred = $q.defer();
            ProfileApiService.getListUserProfileInternal().then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    deferred.resolve([]);
                });
            return deferred.promise;
        }],

    };

})(Phoenix.App, angular);