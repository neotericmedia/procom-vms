(function(angular, app) {
  'use strict';

  var controllerId = 'OrgEditControllerExtendEventsForScope';

  angular.module('phoenix.org.controllers').controller(controllerId, ['self', '$state', '$rootScope', 'common', 'CodeValueService', 'OrgApiService', 'dialogs', 'DocumentApiService', OrgEditControllerExtendEventsForScope]);

  function OrgEditControllerExtendEventsForScope(self, $state, $rootScope, common, CodeValueService, OrgApiService, dialogs, DocumentApiService) {
    function checkLegalName(el, value, organizationId) {
      if (self.lastLegalNameRequest != value) {
        self.lastLegalNameRequest = value;
        OrgApiService.isExistsOrganizationLegalName(value, organizationId).then(
          function(result) {
            if (result === false || (result && result === 'false')) {
              // Valid Name
              el.$setValidity('existingOrganizationLegalName', true);
            } else {
              // Invalid Name
              el.$setValidity('existingOrganizationLegalName', false);
            }
          },
          function(error) {
            // ServerError
            el.$setValidity('existingOrganizationLegalName', false);
          }
        );
      }
    }

    function checkOrgCode(el, value, id) {
      if (self.lastOrgCodeRequest != value) {
        self.lastOrgCodeRequest = value;
        OrgApiService.isExistsOrganizationCode(value, id).then(
          function(result) {
            if (result === false || (result && result === 'false')) {
              // Valid Name
              el.$setValidity('existingOrganizationCode', true);
            } else {
              // Invalid Name
              el.$setValidity('existingOrganizationCode', false);
            }
          },
          function(error) {
            // ServerError
            el.$setValidity('existingOrganizationCode', false);
          }
        );
      }
    }

    angular.extend(self, {
      getOrganizationEntityRoleNames: function() {
        var roleNames = [];
        if (self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles[0]) {
          roleNames.push('ClientRole');
        }
        if (self.entity.OrganizationInternalRoles && self.entity.OrganizationInternalRoles[0]) {
          roleNames.push('InternalRole');
        }
        if (self.entity.OrganizationIndependentContractorRoles && self.entity.OrganizationIndependentContractorRoles[0]) {
          roleNames.push('IndependentContractorRole');
        }
        if (self.entity.OrganizationLimitedLiabilityCompanyRoles && self.entity.OrganizationLimitedLiabilityCompanyRoles[0]) {
          roleNames.push('LimitedLiabilityCompanyRole');
        }
        if (self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles[0]) {
          roleNames.push('SubVendorRoles');
        }

        return roleNames;
      },

      actionScope: {
        show: {
          modifyAddress: false,
          modifyBankAccount: false,
          modifyParentOrganization: false,

          addClientRole: false,
          addIndependentContractorRole: false,
          addLimitedLiabilityCompanyRole: false,
          addInternalRole: false,
          addSubVendorRole: false,

          viewClientRole: false,
          viewIndependentContractorRole: false,
          viewLimitedLiabilityCompanyRole: false,
          viewInternalRole: false,
          viewSubVendorRole: false,

          goToProfile: false,
          addProfile: false,

          parentOrganizationNameFromList: false,

          editPaymentMethod: false,
          editTaxNumber: false,
          organizationIndependentContractorRoleGarnisheeView: false,
          organizationIndependentContractorRoleGarnisheeNew: false,
          organizationIndependentContractorRoleGarnisheeSubmit: false,

          organizationIndependentContractorRoleAdvanceView: false,
          organizationIndependentContractorRoleAdvanceNew: false,
          organizationIndependentContractorRoleAdvanceSubmit: false,

          organizationSubvendorRoleAdvanceView: false,
          organizationSubvendorRoleAdvanceNew: false,
          organizationSubvendorRoleAdvanceSubmit: false,

          organizationClientRoleEditNationalAccountManager: false,

          showAddModifyRestrictionType: true,
          OrganizationInternalRoleRollOver: false,

          workflowActionSubmit: false,
          workflowActionDiscard: false
        },

        showToRecalc: function() {
          var orgRoleNames = self.getOrganizationEntityRoleNames();

          self.actionScope.show.notesList = self.entity.IsOriginal;
          self.actionScope.show.notesView = self.entity.IsOriginal;

          self.actionScope.show.modifyAddress = self.entity.IsDraftStatus;

          self.actionScope.show.modifyBankAccount = self.entity.IsDraftStatus && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationInternalRoleAddBankAccount);

          self.actionScope.show.modifyParentOrganization = self.entity.IsDraftStatus;

          self.actionScope.show.parentOrganizationNameFromList = self.entity.ParentOrganizationId !== null && self.entity.ParentOrganizationId > 0;

          self.actionScope.show.addClientRole =
            self.entity.IsDraftStatus &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddClientRole) &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0 &&
            self.entity.OrganizationClientRoles &&
            self.entity.OrganizationClientRoles.length === 0;

          self.actionScope.show.addIndependentContractorRole =
            self.entity.IsDraftStatus &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddIndependentContractorRole) &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0 &&
            self.entity.OrganizationSubVendorRoles &&
            self.entity.OrganizationSubVendorRoles.length === 0 &&
            self.entity.OrganizationIndependentContractorRoles &&
            self.entity.OrganizationIndependentContractorRoles.length === 0 &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0;

          self.actionScope.show.addLimitedLiabilityCompanyRole =
            self.entity.IsDraftStatus &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddLimitedLiabilityCompanyRole) &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0 &&
            self.entity.OrganizationSubVendorRoles &&
            self.entity.OrganizationSubVendorRoles.length === 0 &&
            self.entity.OrganizationIndependentContractorRoles &&
            self.entity.OrganizationIndependentContractorRoles.length === 0 &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0;

          self.actionScope.show.addInternalRole =
            self.entity.IsDraftStatus &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddInternalRole) &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0 &&
            self.entity.OrganizationIndependentContractorRoles &&
            self.entity.OrganizationIndependentContractorRoles.length === 0 &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
            self.entity.OrganizationSubVendorRoles &&
            self.entity.OrganizationSubVendorRoles.length === 0 &&
            self.entity.OrganizationClientRoles &&
            self.entity.OrganizationClientRoles.length === 0;

          self.actionScope.show.addSubVendorRole =
            self.entity.IsDraftStatus &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddSubVendorRole) &&
            self.entity.OrganizationSubVendorRoles &&
            self.entity.OrganizationSubVendorRoles.length === 0 &&
            self.entity.OrganizationIndependentContractorRoles &&
            self.entity.OrganizationIndependentContractorRoles.length === 0 &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles &&
            self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0;

          self.actionScope.show.addProfile =
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationAddContact) &&
            self.entity.OrganizationInternalRoles &&
            self.entity.OrganizationInternalRoles.length === 0 &&
            ((self.entity.OrganizationIndependentContractorRoles && self.entity.OrganizationIndependentContractorRoles.length > 0) ||
              (self.entity.OrganizationClientRoles && self.entity.OrganizationClientRoles.length > 0) ||
              (self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) ||
              (self.entity.OrganizationLimitedLiabilityCompanyRoles && self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0));

          self.actionScope.show.addEditDeleteHeaderFooterImage = self.entity.IsDraftStatus;
          self.actionScope.show.viewClientRole = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationViewClientRole);
          self.actionScope.show.viewIndependentContractorRole = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationViewIndependentContractorRole);
          self.actionScope.show.viewLimitedLiabilityCompanyRole = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationViewLimitedLiabilityCompanyRole);
          self.actionScope.show.viewInternalRole = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationViewInternalRole);
          self.actionScope.show.viewSubVendorRole = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationViewSubVendorRole);

                    self.actionScope.show.editTaxNumber = self.entity.IsDraftStatus &&
                        (typeof self.entity.AccessActions === 'undefined' || common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleEditTaxNumber));

                    var editTaxNumber = self.entity.IsDraftStatus;
                    if (editTaxNumber && typeof self.entity.AccessActions !== 'undefined') { // is undefined in Quick Add

                        for (var i = 0; i < orgRoleNames.length; i++) {
                            var actionId = ApplicationConstants.FunctionalOperation['Organization' + orgRoleNames[i] + 'EditTaxNumber']
                            if (actionId != null) {
                                editTaxNumber = common.hasFunctionalOperation(actionId);

                  if (!editTaxNumber) {
                    break;
                  }
                }
              }
              self.actionScope.show.editTaxNumber = editTaxNumber;
            }          

          self.actionScope.show.editPaymentMethod = self.entity.IsDraftStatus && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleAddPaymentMethodDirectDeposit);

          self.actionScope.show.organizationIndependentContractorRoleGarnisheeView =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeView);

          self.actionScope.show.organizationIndependentContractorRoleGarnisheeNew =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeNew);

          self.actionScope.show.organizationIndependentContractorRoleGarnisheeSubmit =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleGarnisheeSubmit);

          self.actionScope.show.organizationIndependentContractorRoleAdvanceView =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceView);

          self.actionScope.show.organizationIndependentContractorRoleAdvanceNew =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceNew);

          self.actionScope.show.organizationIndependentContractorRoleAdvanceSubmit =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange &&
            self.entity.IsOrganizationIndependentContractorRole &&
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationIndependentContractorRoleAdvanceSubmit);

          self.actionScope.show.organizationSubvendorRoleAdvanceView =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && self.entity.IsOrganizationSubVendorRole && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubvendorRoleAdvanceView);

          self.actionScope.show.organizationSubvendorRoleAdvanceNew =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && self.entity.IsOrganizationSubVendorRole && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubvendorRoleAdvanceNew);

          self.actionScope.show.organizationSubvendorRoleAdvanceSubmit =
            self.entity.IsOriginalAndStatusIsAtiveOrPendingChange && self.entity.IsOrganizationSubVendorRole && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationSubvendorRoleAdvanceSubmit);

          self.actionScope.show.organizationClientRoleEditNationalAccountManager = self.entity.IsDraftStatus && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationClientRoleEditNationalAccountManager);

          self.actionScope.show.organizationClientRoleEditAlternateBill = self.entity.IsDraftStatus && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationClientRoleEditAlternateBill);

          self.actionScope.show.showAddModifyRestrictionType = self.entity.IsDraftStatus;
          self.actionScope.show.OrganizationInternalRoleRollOver = self.entity.OrganizationStatusId == ApplicationConstants.OrganizationStatus.Active && 
            common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.OrganizationInternalRoleRollOver);

          var workflowActionSubmit = true;
          for (var i = 0; i < orgRoleNames.length; i++) {
            var actionId = ApplicationConstants.FunctionalOperation['OrganizationSubmit' + orgRoleNames[i]];
            if (actionId != null) {
              workflowActionSubmit = common.hasFunctionalOperation(actionId);

              if (!workflowActionSubmit) {
                break;
              }
            }
          }
          self.actionScope.show.workflowActionSubmit = workflowActionSubmit;

          var workflowActionDiscard = true;
          for (var i = 0; i < orgRoleNames.length; i++) {
            var actionId = ApplicationConstants.FunctionalOperation['OrganizationDelete' + orgRoleNames[i]];
            if (actionId != null) {
              workflowActionDiscard = common.hasFunctionalOperation(actionId);

              if (!workflowActionDiscard) {
                break;
              }
            }
          }
          self.actionScope.show.workflowActionDiscard = workflowActionDiscard;
        },

        lastLegalNameRequest: '',
        lastOrgCodeRequest: '',

        event: {
          refreshActiveAdvancesAndActiveGarnisheesCount: function() {
            OrgApiService.getByOrganizationId(
              $state.params.organizationId,
              oreq
                .request()
                .withSelect(['ActiveAdvancesCount', 'ActiveGarnisheesCount'])
                .url()
            ).then(function(response) {
              self.entity.ActiveAdvancesCount = response.ActiveAdvancesCount;
              self.entity.ActiveGarnisheesCount = response.ActiveGarnisheesCount;
            });
          },

          onVersionClick: function(version) {
            $state.transitionTo($state.includes('org.edit.roles') ? 'org.edit.roles' : $state.current.name, { organizationId: version.Id }, { reload: false, inherit: true, notify: true });
          },

          onBlurCheckLegalNameAndOrgCode: function(form) {
            checkLegalName(form.LegalName, self.entity.LegalName, self.entity.Id);
            checkOrgCode(form.Code, self.entity.Code, self.entity.Id);
          },

          onChangeLegalName: function() {
            self.entity.Code = self.constructOrganizationCode(self.entity.LegalName);
            self.entity.DisplayName = (self.entity.LegalName || '').substring(0, 128);
            if (self.entity.ParentOrganization === null) {
              self.entity.ParentOrganization = {};
            }
            if (self.entity.LegalName) {
              var parentOrganization = _.find(self.parentOrganizations, function(item) {
                return item.Name.toLowerCase() == self.entity.LegalName.toLowerCase();
              });
              if (parentOrganization) {
                self.entity.ParentOrganization.Id = parentOrganization.Id;
                self.entity.ParentOrganization.Name = parentOrganization.Name;
              }

              if (self.actionScope.show.parentOrganizationNameFromList) {
                if (parentOrganization) {
                  self.entity.ParentOrganization.Name = parentOrganization.Name;
                }
              } else {
                if (!parentOrganization) {
                  self.entity.ParentOrganization.Id = undefined;
                }
                self.entity.ParentOrganization.Name = (self.entity.LegalName || '').substring(0, 128);
              }
            }
          },

          onChangeDetailsCountry: function() {
            self.entity.DefaultTaxSubdivisionId = undefined;
            var countryId = self.entity.CountryId;
            if (!!countryId) {
              self.lists.taxSubdivisionList = self.lists.taxSubdivisionLists[countryId];
            }
          },

          role: {
            client: {
              add: function() {
                var isValidToAddRole = self.entity.OrganizationInternalRoles.length === 0 && self.entity.OrganizationClientRoles.length === 0;
                if (!isValidToAddRole) {
                  common.logError("A 'Client' role can't be added to an organization with an 'Internal' or 'Client' roles");
                } else {
                  self.entity.OrganizationClientRoles.push({
                    Id: 0,
                    OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                    IsChargeSalesTax: true,
                    IsChargeableExpenseSalesTax: false,
                    IsBypassZeroUnitTimeSheetApproval: true,
                    IsSuppressZeroAmountInvoiceRelease: false,
                    ClientSalesTaxDefaultId: null,
                    ExpiryDate: null,
                    OrganizationClientRoleLOBs: [],
                    UsesThirdPartyImport: false,
                    IsAccrueMaxedOutCanadaPensionPlanForTemp: true,
                    IsAccrueMaxedOutCanadaPensionPlanForSP: true,
                    IsAccrueMaxedOutEmploymentInsuranceForTemp: true,
                    IsAccrueMaxedOutEmploymentInsuranceForSP: true,
                    IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp: true,
                    IsAccrueMaxedOutQuebecParentalInsurancePlanForSP: true,
                    IsAccrueMaxedOutQuebecPensionPlanForTemp: true,
                    IsAccrueMaxedOutQuebecPensionPlanForSP: true
                  });
                  angular.forEach(self.lists.lineOfBusinessesList, function(dictionaryLineOfBusiness) {
                    var lineOfBusinessExists = _.some(self.entity.OrganizationClientRoles[0].OrganizationClientRoleLOBs, function(organizationClientRoleLOB) {
                      return organizationClientRoleLOB.LineOfBusinessId == dictionaryLineOfBusiness.id;
                    });
                    if (!lineOfBusinessExists) {
                      self.entity.OrganizationClientRoles[0].OrganizationClientRoleLOBs.push({
                        LineOfBusinessId: dictionaryLineOfBusiness.id,
                        IsSelected: false
                      });
                    }
                  });
                  $state.go('org.edit.roles.client', { organizationId: $state.params.organizationId, roleId: 0 });
                }
              },
              remove: function() {
                if (self.entity.OrganizationClientRoles[0].Id !== 0) {
                  common.logError("An existing 'Client' role can't be removed");
                } else {
                  self.entity.OrganizationClientRoles = [];
                  $state.transitionTo('org.edit.roles', { organizationId: $state.params.organizationId }, { reload: false, inherit: true, notify: true });
                  self.tab.onClick('org.edit.roles');
                }
              },
              hasOrganizationClientRoleLOB: false,
              onChangeOrganizationClientRoleLOBs: function() {
                self.actionScope.event.role.client.hasOrganizationClientRoleLOB = false;
                if (
                  typeof self.entity.OrganizationClientRoles !== 'undefined' &&
                  self.entity.OrganizationClientRoles[0] &&
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleLOBs &&
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleLOBs.length > 0
                ) {
                  self.actionScope.event.role.client.hasOrganizationClientRoleLOB = _.some(self.entity.OrganizationClientRoles[0].OrganizationClientRoleLOBs, function(lob) {
                    return lob.IsSelected === true;
                  });
                }
              },
              addNationalAccountManager: function() {
                if (!self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers) {
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers = [];
                }
                self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers.push(angular.copy({}));
              },
              clearNationalAccountManager: function(nationalAccountManager) {
                nationalAccountManager.UserProfileInternalId = undefined;
              },
              removeNationalAccountManager: function(nationalAccountManager) {
                var index = self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers.indexOf(nationalAccountManager);

                if (index >= 0) {
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers.splice(index, 1);
                }
              },
              addAlternateBill: function() {
                if (!self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills) {
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills = [];
                }
                self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills.push(angular.copy({ OrganizationClientRoleAlternateBillStatusId: ApplicationConstants.OrganizationClientRoleAlternateBillStatus.Active }));
              },
              removeAlternateBill: function(alternateBill) {
                var index = self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills.indexOf(alternateBill);

                if (index >= 0) {
                  self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills.splice(index, 1);
                }
              }
            },
            independentContractor: {
              add: function() {
                var isValidToAddRole =
                  self.entity.OrganizationInternalRoles.length === 0 &&
                  self.entity.OrganizationIndependentContractorRoles.length === 0 &&
                  self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
                  self.entity.OrganizationSubVendorRoles.length === 0;
                if (!isValidToAddRole) {
                  common.logError("An 'Independent Contractor' role can't be added to an organization with an 'Internal' or 'Independent Contractor' or 'Limited Liability Company' or 'Sub Vendor' roles");
                } else {
                  self.entity.OrganizationIndependentContractorRoles.push({
                    Id: 0,
                    OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                    NotificationEmail: '',
                    IsNonResident: null,
                    PaymentMethods: []
                  });
                  self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                    IsSelected: true,
                    IsPreferred: true,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.DirectDeposit,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: '',
                    BankBranchCode: '',
                    BankAccountNumber: '',
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.WireTransfer,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ADP,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ManualWire,
                    IsSelected: false,
                    IsPreferred: false
                  });
                  self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentMethod();
                  self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentReference();
                  self.actionScope.event.organizationTaxNumber.add();
                  self.revalidatePaymentMethods();
                  $state.transitionTo('org.edit.roles.independentcontractor', { organizationId: $state.params.organizationId, roleId: 0 }, { reload: false, inherit: true, notify: true });
                }
              },
              remove: function() {
                if (self.entity.OrganizationIndependentContractorRoles[0].Id !== 0) {
                  common.logError("An existing 'OrganizationIndependentContractorRole' role can't be removed");
                } else {
                  self.entity.OrganizationIndependentContractorRoles = [];
                  self.entity.OrganizationTaxNumbers = [];
                  $state.transitionTo(
                    'org.edit.roles',
                    {
                      organizationId: $state.params.organizationId
                    },
                    {
                      reload: false,
                      inherit: true,
                      notify: true
                    }
                  );
                  self.tab.onClick('org.edit.roles');
                }
              },
              hasOrganizationIndependentContractorRolePaymentMethod: false,

              calcHasOrganizationRolePaymentMethod: function() {
                if (self.entity.OrganizationIndependentContractorRoles.length > 0) {
                  self.actionScope.event.role.independentContractor.hasOrganizationIndependentContractorRolePaymentMethod = _.some(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, function(lob) {
                    return lob.IsSelected === true;
                  });
                }
              },

              onChangePaymentMethod: function(paymentMethod) {
                if (paymentMethod && !paymentMethod.IsSelected) {
                  if (paymentMethod.IsPreferred) {
                    paymentMethod.IsPreferred = false;
                    paymentMethod.hasPreference = false;
                    self.entity.OrganizationIndependentContractorPaymentMethodTypeId = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                    paymentMethod.ProfileNameBeneficiary = null;
                    paymentMethod.NameBeneficiary = null;
                    paymentMethod.AccountNumberBeneficiary = null;
                    paymentMethod.Address1Beneficiary = null;
                    paymentMethod.Address2Beneficiary = null;
                    paymentMethod.CityBeneficiary = null;
                    paymentMethod.ProvinceOrStateBeneficiary = null;
                    paymentMethod.CountryCodeBeneficiary = null;
                    paymentMethod.PostalorZipBeneficiary = null;
                    paymentMethod.PayCurrencyBeneficiary = null;
                    paymentMethod.WireTransferBankTypeIdBeneficiary = null;
                    paymentMethod.BankIDBeneficiary = null;
                    paymentMethod.ABANoBeneficiary = null;

                    paymentMethod.WireTransferBankTypeIdIntemediary = null;
                    paymentMethod.BankNameIntemediary = null;
                    paymentMethod.BankIdIntemediary = null;
                    paymentMethod.Address1Intemediary = null;
                    paymentMethod.Address2Intemediary = null;
                    paymentMethod.CityIntemediary = null;
                    paymentMethod.ProvinceOrStateIntemediary = null;
                    paymentMethod.CountryCodeIntemediary = null;
                    paymentMethod.PostalOrZipIntemediary = null;

                    paymentMethod.WireTransferBankTypeIdReceivers = null;
                    paymentMethod.BankNameReceivers = null;
                    paymentMethod.BankIdReceivers = null;
                    paymentMethod.Address1Receivers = null;
                    paymentMethod.Address2Receivers = null;
                    paymentMethod.CityReceivers = null;
                    paymentMethod.ProvinceOrStateReceivers = null;
                    paymentMethod.CountryCodeReceivers = null;
                    paymentMethod.PostalOrZipReceivers = null;

                    paymentMethod.PaymentDetailNotes = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                    paymentMethod.BankCode = null;
                    paymentMethod.BankBranchCode = null;
                    paymentMethod.BankAccountNumber = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                    paymentMethod.EmployeeId = null;
                  }
                }
                self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentMethod();
                self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentReference();
              },
              hasOrganizationRolePaymentReference: false,
              calcHasOrganizationRolePaymentReference: function() {
                if (self.entity.OrganizationIndependentContractorRoles.length > 0) {
                  self.actionScope.event.role.independentContractor.hasOrganizationRolePaymentReference = _.some(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, function(lob) {
                    return lob.IsPreferred === true;
                  });
                }
              },
              onChangePaymentPreference: function(paymentMethod) {
                var isPreferred = paymentMethod.IsPreferred;
                angular.forEach(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, function(method) {
                  method.IsPreferred = false;
                });

                if (paymentMethod.IsSelected && isPreferred) {
                  paymentMethod.IsPreferred = isPreferred;
                }
                self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentReference();
              }
            },
            limitedLiabilityCompany: {
              add: function() {
                var isValidToAddRole =
                  self.entity.OrganizationInternalRoles.length === 0 &&
                  self.entity.OrganizationIndependentContractorRoles.length === 0 &&
                  self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
                  self.entity.OrganizationSubVendorRoles.length === 0;
                if (!isValidToAddRole) {
                  common.logError("An 'LimitedLiabilityCompany' role can't be added to an organization with an 'Internal' or 'IndependentContractor' or 'Limited Liability Company' or 'Sub Vendor' roles");
                } else {
                  self.entity.OrganizationLimitedLiabilityCompanyRoles.push({
                    Id: 0,
                    OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                    NotificationEmail: '',
                    IsNonResident: null,
                    PaymentMethods: []
                  });
                  self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                    IsSelected: true,
                    IsPreferred: true,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.DirectDeposit,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: '',
                    BankBranchCode: '',
                    BankAccountNumber: '',
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.WireTransfer,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ADP,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ManualWire,
                    IsSelected: false,
                    IsPreferred: false
                  });
                  self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentMethod();
                  self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentReference();
                  self.revalidatePaymentMethods();
                  $state.transitionTo('org.edit.roles.limitedliabilitycompany', { organizationId: $state.params.organizationId, roleId: 0 }, { reload: false, inherit: true, notify: true });
                }
              },
              remove: function() {
                if (self.entity.OrganizationLimitedLiabilityCompanyRoles[0].Id !== 0) {
                  common.logError("An existing 'OrganizationLimitedLiabilityCompanyRole' role can't be removed");
                } else {
                  self.entity.OrganizationLimitedLiabilityCompanyRoles = [];
                  self.entity.OrganizationTaxNumbers = [];
                  $state.transitionTo(
                    'org.edit.roles',
                    {
                      organizationId: $state.params.organizationId
                    },
                    {
                      reload: false,
                      inherit: true,
                      notify: true
                    }
                  );
                  self.tab.onClick('org.edit.roles');
                }
              },
              hasOrganizationLimitedLiabilityCompanyRolePaymentMethod: false,

              calcHasOrganizationRolePaymentMethod: function() {
                if (self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0) {
                  self.actionScope.event.role.limitedLiabilityCompany.hasOrganizationLimitedLiabilityCompanyRolePaymentMethod = _.some(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, function(lob) {
                    return lob.IsSelected === true;
                  });
                }
              },

              onChangePaymentMethod: function(paymentMethod) {
                if (paymentMethod && !paymentMethod.IsSelected) {
                  if (paymentMethod.IsPreferred) {
                    paymentMethod.IsPreferred = false;
                    paymentMethod.hasPreference = false;
                    self.entity.OrganizationLimitedLiabilityPaymentMethodTypeId = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                    paymentMethod.ProfileNameBeneficiary = null;
                    paymentMethod.NameBeneficiary = null;
                    paymentMethod.AccountNumberBeneficiary = null;
                    paymentMethod.Address1Beneficiary = null;
                    paymentMethod.Address2Beneficiary = null;
                    paymentMethod.CityBeneficiary = null;
                    paymentMethod.ProvinceOrStateBeneficiary = null;
                    paymentMethod.CountryCodeBeneficiary = null;
                    paymentMethod.PostalorZipBeneficiary = null;
                    paymentMethod.PayCurrencyBeneficiary = null;
                    paymentMethod.WireTransferBankTypeIdBeneficiary = null;
                    paymentMethod.BankIDBeneficiary = null;
                    paymentMethod.ABANoBeneficiary = null;

                    paymentMethod.WireTransferBankTypeIdIntemediary = null;
                    paymentMethod.BankNameIntemediary = null;
                    paymentMethod.BankIdIntemediary = null;
                    paymentMethod.Address1Intemediary = null;
                    paymentMethod.Address2Intemediary = null;
                    paymentMethod.CityIntemediary = null;
                    paymentMethod.ProvinceOrStateIntemediary = null;
                    paymentMethod.CountryCodeIntemediary = null;
                    paymentMethod.PostalOrZipIntemediary = null;

                    paymentMethod.WireTransferBankTypeIdReceivers = null;
                    paymentMethod.BankNameReceivers = null;
                    paymentMethod.BankIdReceivers = null;
                    paymentMethod.Address1Receivers = null;
                    paymentMethod.Address2Receivers = null;
                    paymentMethod.CityReceivers = null;
                    paymentMethod.ProvinceOrStateReceivers = null;
                    paymentMethod.CountryCodeReceivers = null;
                    paymentMethod.PostalOrZipReceivers = null;

                    paymentMethod.PaymentDetailNotes = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                    paymentMethod.BankCode = null;
                    paymentMethod.BankBranchCode = null;
                    paymentMethod.BankAccountNumber = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                    paymentMethod.EmployeeId = null;
                  }
                }
                self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentMethod();
                self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentReference();
              },
              hasOrganizationRolePaymentReference: false,
              calcHasOrganizationRolePaymentReference: function() {
                if (self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0) {
                  self.actionScope.event.role.limitedLiabilityCompany.hasOrganizationRolePaymentReference = _.some(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, function(lob) {
                    return lob.IsPreferred === true;
                  });
                }
              },
              onChangePaymentPreference: function(paymentMethod) {
                var isPreferred = paymentMethod.IsPreferred;
                angular.forEach(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, function(method) {
                  method.IsPreferred = false;
                });

                if (paymentMethod.IsSelected && isPreferred) {
                  paymentMethod.IsPreferred = isPreferred;
                }
                //self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentReference();
              }
            },
            subVendor: {
              add: function() {
                var isValidToAddRole =
                  self.entity.OrganizationInternalRoles.length === 0 &&
                  self.entity.OrganizationIndependentContractorRoles.length === 0 &&
                  self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
                  self.entity.OrganizationSubVendorRoles.length === 0;
                if (!isValidToAddRole) {
                  common.logError('Only 1 supplier type can be added (independent contractor OR Subvendor)');
                } else {
                  self.entity.OrganizationSubVendorRoles.push({
                    Id: 0,
                    OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                    NotificationEmail: '',
                    UseADifferentPayeeName: false,
                    PaymentMethods: [],
                    IsNonResident: null,
                    OrganizationSubVendorRoles: []
                  });
                  self.entity.OrganizationSubVendorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.Cheque,
                    IsSelected: true,
                    IsPreferred: true,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationSubVendorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.DirectDeposit,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: '',
                    BankBranchCode: '',
                    BankAccountNumber: '',
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationSubVendorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.WireTransfer,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationSubVendorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ADP,
                    IsSelected: false,
                    IsPreferred: false,
                    BankCode: null,
                    BankBranchCode: null,
                    BankAccountNumber: null,
                    ProfileNameBeneficiary: null,
                    NameBeneficiary: null,
                    AccountNumberBeneficiary: null,
                    Address1Beneficiary: null,
                    Address2Beneficiary: null,
                    CityBeneficiary: null,
                    ProvinceOrStateBeneficiary: null,
                    CountryCodeBeneficiary: null,
                    PostalorZipBeneficiary: null,
                    PayCurrencyBeneficiary: null,
                    WireTransferBankTypeIdBeneficiary: null,
                    BankIDBeneficiary: null,
                    ABANoBeneficiary: null,

                    WireTransferBankTypeIdIntemediary: null,
                    BankNameIntemediary: null,
                    BankIdIntemediary: null,
                    Address1Intemediary: null,
                    Address2Intemediary: null,
                    CityIntemediary: null,
                    ProvinceOrStateIntemediary: null,
                    CountryCodeIntemediary: null,
                    PostalOrZipIntemediary: null,

                    WireTransferBankTypeIdReceivers: null,
                    BankNameReceivers: null,
                    BankIdReceivers: null,
                    Address1Receivers: null,
                    Address2Receivers: null,
                    CityReceivers: null,
                    ProvinceOrStateReceivers: null,
                    CountryCodeReceivers: null,
                    PostalOrZipReceivers: null,

                    PaymentDetailNotes: null,
                    EmployeeId: null
                  });
                  self.entity.OrganizationSubVendorRoles[0].PaymentMethods.push({
                    PaymentMethodTypeId: ApplicationConstants.PaymentMethodType.ManualWire,
                    IsSelected: false,
                    IsPreferred: false
                  });
                  self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentMethod();
                  self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentReference();
                  self.actionScope.event.organizationTaxNumber.add();
                  self.revalidatePaymentMethods();
                  $state.transitionTo('org.edit.roles.subvendor', { organizationId: $state.params.organizationId, roleId: 0 }, { reload: false, inherit: true, notify: true });
                }
              },
              remove: function() {
                if (self.entity.OrganizationSubVendorRoles[0].Id !== 0) {
                  common.logError("An existing 'OrganizationSubVendorRole' role can't be removed");
                } else {
                  self.entity.OrganizationSubVendorRoles = [];
                  self.entity.OrganizationTaxNumbers = [];
                  $state.transitionTo(
                    'org.edit.roles',
                    {
                      organizationId: $state.params.organizationId
                    },
                    {
                      reload: false,
                      inherit: true,
                      notify: true
                    }
                  );
                  self.tab.onClick('org.edit.roles');
                }
              },
              hasOrganizationSubVendorRolePaymentMethod: false,

              calcHasOrganizationSubVendorRolePaymentMethod: function() {
                if (typeof self.entity.OrganizationSubVendorRoles != 'undefined' && self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) {
                  self.actionScope.event.role.subVendor.hasOrganizationSubVendorRolePaymentMethod = _.some(self.entity.OrganizationSubVendorRoles[0].PaymentMethods, function(lob) {
                    return lob.IsSelected === true;
                  });
                }
              },

              onChangePaymentMethod: function(paymentMethod) {
                if (paymentMethod && !paymentMethod.IsSelected) {
                  if (paymentMethod.IsPreferred) {
                    paymentMethod.IsPreferred = false;
                    paymentMethod.hasPreference = false;
                    self.entity.SubvendorPaymentMethodTypeId = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                    paymentMethod.ProfileNameBeneficiary = null;
                    paymentMethod.NameBeneficiary = null;
                    paymentMethod.AccountNumberBeneficiary = null;
                    paymentMethod.Address1Beneficiary = null;
                    paymentMethod.Address2Beneficiary = null;
                    paymentMethod.CityBeneficiary = null;
                    paymentMethod.ProvinceOrStateBeneficiary = null;
                    paymentMethod.CountryCodeBeneficiary = null;
                    paymentMethod.PostalorZipBeneficiary = null;
                    paymentMethod.PayCurrencyBeneficiary = null;
                    paymentMethod.WireTransferBankTypeIdBeneficiary = null;
                    paymentMethod.BankIDBeneficiary = null;
                    paymentMethod.ABANoBeneficiary = null;

                    paymentMethod.WireTransferBankTypeIdIntemediary = null;
                    paymentMethod.BankNameIntemediary = null;
                    paymentMethod.BankIdIntemediary = null;
                    paymentMethod.Address1Intemediary = null;
                    paymentMethod.Address2Intemediary = null;
                    paymentMethod.CityIntemediary = null;
                    paymentMethod.ProvinceOrStateIntemediary = null;
                    paymentMethod.CountryCodeIntemediary = null;
                    paymentMethod.PostalOrZipIntemediary = null;

                    paymentMethod.WireTransferBankTypeIdReceivers = null;
                    paymentMethod.BankNameReceivers = null;
                    paymentMethod.BankIdReceivers = null;
                    paymentMethod.Address1Receivers = null;
                    paymentMethod.Address2Receivers = null;
                    paymentMethod.CityReceivers = null;
                    paymentMethod.ProvinceOrStateReceivers = null;
                    paymentMethod.CountryCodeReceivers = null;
                    paymentMethod.PostalOrZipReceivers = null;

                    paymentMethod.PaymentDetailNotes = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                    paymentMethod.BankCode = null;
                    paymentMethod.BankBranchCode = null;
                    paymentMethod.BankAccountNumber = null;
                  }
                  if (paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                    paymentMethod.EmployeeId = null;
                  }
                }
                self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentMethod();
                self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentReference();
              },
              hasOrganizationSubVendorRolePaymentReference: false,
              calcHasOrganizationSubVendorRolePaymentReference: function() {
                if (typeof self.entity.OrganizationSubVendorRoles != 'undefined' && self.entity.OrganizationSubVendorRoles && self.entity.OrganizationSubVendorRoles.length > 0) {
                  self.actionScope.event.role.subVendor.hasOrganizationSubVendorRolePaymentReference = _.some(self.entity.OrganizationSubVendorRoles[0].PaymentMethods, function(lob) {
                    return lob.IsPreferred === true;
                  });
                }
              },
              onChangePaymentPreference: function(method) {
                var IsPreferred = method.IsPreferred;
                angular.forEach(self.entity.OrganizationSubVendorRoles[0].PaymentMethods, function(paymentMethod) {
                  paymentMethod.IsPreferred = false;
                });

                if (method.IsSelected && IsPreferred) {
                  method.IsPreferred = IsPreferred;
                }
                self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentReference();
              },
              restriction: {
                update: function(restrictionTypeId) {
                  var restrictionDialogConfig = {
                    title: 'Add/Edit Restriction - ' + CodeValueService.getCodeValue(restrictionTypeId, CodeValueGroups.OrganizationSubVendorRoleRestrictionType).text,
                    entityRestriction_List: self.entity.OrganizationSubVendorRoles[0].OrganizationSubVendorRoleRestrictions,
                    entityRestriction_FieldName_RestrictionTypeId: 'OrganizationSubVendorRoleRestrictionTypeId',
                    restrictionTypeId: restrictionTypeId,
                    restrictionTypeName: CodeValueService.getCodeValue(restrictionTypeId, CodeValueGroups.OrganizationSubVendorRoleRestrictionType).text
                  };

                  switch (restrictionTypeId) {
                    case ApplicationConstants.OrganizationSubVendorRoleRestrictionType.InternalOrganization:
                      restrictionDialogConfig.viewType = 'Checkbox';
                      restrictionDialogConfig.idColumnNameByRestrictionType = 'OrganizationIdInternal';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'Id';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'DisplayName';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listOrganizationInternal;
                      break;
                    case ApplicationConstants.OrganizationSubVendorRoleRestrictionType.ClientOrganization:
                      restrictionDialogConfig.viewType = 'DropDown';
                      restrictionDialogConfig.idColumnNameByRestrictionType = 'OrganizationIdClient';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Id = 'Id';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_FieldName_Display = 'DisplayName';
                      restrictionDialogConfig.optionsOfRestrictionTypeList_Content = self.lists.listOrganizationClient;
                      break;
                  }

                  dialogs
                    .create('/Phoenix/app/directive/restrictionAddDialog/RestrictionAddDialog.html', 'RestrictionAddDialogController', restrictionDialogConfig, {
                      keyboard: false,
                      backdrop: 'static',
                      windowClass: 'restrictionTypeWindow'
                    })
                    .result.then(
                      function(result) {
                        if (result.action == 'create') {
                          self.entity.OrganizationSubVendorRoles[0].OrganizationSubVendorRoleRestrictions = angular.copy(result.entityRestriction_List);
                          self.actionScope.showToRecalc();
                        }
                      },
                      function() {
                        self.actionScope.showToRecalc();
                      }
                    );
                },

                subscriptionRestrictionsGrouped: function() {
                  if (self.entity.OrganizationSubVendorRoles.length === 0) {
                    return null;
                  }
                  self.subscriptionRestrictionsGroups = [];
                  return self.entity.OrganizationSubVendorRoles[0].OrganizationSubVendorRoleRestrictions;
                },

                filterGroupByOrganizationSubVendorRoleRestrictionTypeId: function(restriction) {
                  var isNew = self.subscriptionRestrictionsGroups.indexOf(restriction.OrganizationSubVendorRoleRestrictionTypeId) == -1;
                  if (isNew) {
                    self.subscriptionRestrictionsGroups.push(restriction.OrganizationSubVendorRoleRestrictionTypeId);
                  }
                  return isNew;
                }
              }
            },
            internal: {
              rolloverConfirmation: function() {
                var dialogHeader = 'Confirm';
                var dialogMessage = 'Are you sure you want to rollover Application Date to the next month?';

                dialogs.confirm(dialogHeader, dialogMessage).result.then(function(btn) {
                  OrgApiService.organizationInternalRoleDateRollOver(self.entity.OrganizationInternalRoles[0]).then(
                    function(responseSuccess) {
                      if (responseSuccess.TaskResultId == ApplicationConstants.TaskResult.Complete) {
                        self.entity.OrganizationInternalRoles[0].ApplicationDate = moment(self.entity.OrganizationInternalRoles[0].ApplicationDate)
                          .add(1, 'months')
                          .endOf('month')
                          .toDate();
                        common.logSuccess('Application Date Rolled Over');
                      }
                    },
                    function(responseError) {
                      var validationMessages = common.responseErrorMessages(responseError);
                      if (validationMessages && validationMessages.length > 0) {
                        angular.forEach(validationMessages, function(validationMessage) {
                          common.logError(validationMessage.Message);
                        });
                      }
                    }
                  );
                });
              },
              add: function() {
                var isValidToAddRole =
                  self.entity.OrganizationInternalRoles.length === 0 &&
                  self.entity.OrganizationIndependentContractorRoles.length === 0 &&
                  self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 &&
                  self.entity.OrganizationSubVendorRoles.length === 0 &&
                  self.entity.OrganizationClientRoles.length === 0;
                if (!isValidToAddRole) {
                  common.logError("An 'Internal' role can't be added to an organization with any existing role");
                } else {
                  self.entity.OrganizationInternalRoles.push({
                    Id: 0,
                    OrganizationRoleStatusId: ApplicationConstants.OrganizationRoleStatus.Active,
                    BankAccounts: [],
                    ApplicationDate: moment()
                      .endOf('month')
                      .format('YYYY-MM-DD'),
                    IsAccrueEmployerHealthTaxLiability: true
                  });
                  $state.go('org.edit.roles.internal', {
                    organizationId: $state.params.organizationId,
                    roleId: 0
                  });
                }
              },
              remove: function() {
                if (self.entity.OrganizationInternalRoles[0].Id !== 0) {
                  common.logError("An existing 'OrganizationInternalRole' role can't be removed");
                } else {
                  self.entity.OrganizationInternalRoles = [];
                  self.entity.OrganizationTaxNumbers = [];
                  $state.transitionTo(
                    'org.edit.roles',
                    {
                      organizationId: $state.params.organizationId
                    },
                    {
                      reload: false,
                      inherit: true,
                      notify: true
                    }
                  );
                  self.tab.onClick('org.edit.roles');
                }
              },
              bankAccountAdd: function() {
                if (!self.entity.OrganizationInternalRoles[0].BankAccounts) {
                  self.entity.OrganizationInternalRoles[0].BankAccounts = [];
                }

                self.entity.OrganizationInternalRoles[0].BankAccounts.push({
                  AccountId: null,
                  AccountNo: '',
                  BankName: '',
                  OrganizationBankStatusId: null,
                  OrganizationBankSignatureId: null,
                  CurrencyId: null,
                  Description: '',
                  GLAccount: '',
                  IsPrimary: self.entity.OrganizationInternalRoles[0].BankAccounts.length === 0,
                  NextChequeNumber: null,
                  NextDirectDepositBatchNumber: null,
                  NextWireTransferBatchNumber: null,
                  Transit: ''
                });
              },
              bankAccountRemove: function(bankAccount) {
                var index = self.entity.OrganizationInternalRoles[0].BankAccounts.indexOf(bankAccount);
                if (index >= 0) self.entity.OrganizationInternalRoles[0].BankAccounts.splice(index, 1);

                var isPrimaryExists = _.some(self.entity.OrganizationInternalRoles[0].BankAccounts, function(bankAccountLoop) {
                  return bankAccountLoop.IsPrimary === true;
                });

                if (!isPrimaryExists) {
                  if (self.entity.OrganizationInternalRoles[0].BankAccounts.length > 0) {
                    self.entity.OrganizationInternalRoles[0].BankAccounts[0].IsPrimary = true;
                  }
                }
              },
              bankAccountMakePrimary: function(bankAccount) {
                angular.forEach(self.entity.OrganizationInternalRoles[0].BankAccounts, function(loopBankAccount) {
                  loopBankAccount.IsPrimary = loopBankAccount == bankAccount;
                });
              },
              headerFooterImage: {
                docTypeId: null,
                dataHeaderText: '',
                contentText1: 'Accepted file types: PNG, JPG, JPEG, BMP',
                acceptFileTypes: /(\.|\/)(jpe?g|png|bmp)$/i,
                uploadDocument: function(docTypeId) {
                  self.actionScope.event.role.internal.headerFooterImage.docTypeId = docTypeId;

                  if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationPortraitHeader) {
                    self.actionScope.event.role.internal.headerFooterImage.dataHeaderText = 'Upload a portrait header image';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationPortraitFooter) {
                    self.actionScope.event.role.internal.headerFooterImage.dataHeaderText = 'Upload a portrait footer image';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationLandscapeHeader) {
                    self.actionScope.event.role.internal.headerFooterImage.dataHeaderText = 'Upload a landscape header image';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationLandscapeFooter) {
                    self.actionScope.event.role.internal.headerFooterImage.dataHeaderText = 'Upload a landscape footer image';
                  }
                },

                documentUploadCallbackOnDone: function(document) {
                  self.actionScope.event.role.internal.headerFooterImage.docTypeId = null;
                  self.actionScope.event.role.internal.headerFooterImage.reloadHeaderFooterImagesData();
                },

                funcOnDocumentDeleteException: function(documentsUploadedException, entityTypeId, entityId) {
                  common.logError('Concurrency exception on delete document. The documents list will be refreshed');
                },

                createDocumentLink: function(publicId) {
                  return DocumentApiService.getStreamByPublicId(publicId);
                },

                deleteImage: function(id, docTypeId) {
                  var dialogMessage = '';
                  var dialogHeader = 'Confirm';
                  if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationPortraitHeader) {
                    dialogMessage = 'Are you sure you want to delete portrait header image?';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationPortraitFooter) {
                    dialogMessage = 'Are you sure you want to delete portrait footer image?';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationLandscapeHeader) {
                    dialogMessage = 'Are you sure you want to delete landscape header image?';
                  } else if (docTypeId === ApplicationConstants.DocumentTypes.InternalOrganizationLandscapeFooter) {
                    dialogMessage = 'Are you sure you want to delete landscape footer image?';
                  }

                  dialogs.confirm(dialogHeader, dialogMessage).result.then(function(btn) {
                    OrgApiService.deleteInternalOrganizationImage({
                      Id: id,
                      ImageType: docTypeId
                    }).then(function() {
                      self.actionScope.event.role.internal.headerFooterImage.reloadHeaderFooterImagesData();
                    });
                  });
                },

                reloadHeaderFooterImagesData: function() {
                  $rootScope.activateGlobalSpinner = true;
                  OrgApiService.getByOrganizationId(
                    self.entity.Id,
                    oreq
                      .request()
                      .withExpand(['OrganizationInternalRoles'])
                      .withSelect([
                        'OrganizationInternalRoles/DocumentIdHeader',
                        'OrganizationInternalRoles/DocumentHeaderName',
                        'OrganizationInternalRoles/DocumentHeaderPublicId',
                        'OrganizationInternalRoles/DocumentIdFooter',
                        'OrganizationInternalRoles/DocumentFooterName',
                        'OrganizationInternalRoles/DocumentFooterPublicId',
                        'OrganizationInternalRoles/DocumentIdLandscapeHeader',
                        'OrganizationInternalRoles/DocumentLandscapeHeaderName',
                        'OrganizationInternalRoles/DocumentLandscapeHeaderPublicId',
                        'OrganizationInternalRoles/DocumentIdLandscapeFooter',
                        'OrganizationInternalRoles/DocumentLandscapeFooterName',
                        'OrganizationInternalRoles/DocumentLandscapeFooterPublicId'
                      ])
                      .url()
                  ).then(
                    function(response) {
                      if (response && response.OrganizationInternalRoles && response.OrganizationInternalRoles.length > 0) {
                        angular.extend(self.entity.OrganizationInternalRoles[0], response.OrganizationInternalRoles[0]);
                      }
                      $rootScope.activateGlobalSpinner = false;
                    },
                    function(err) {
                      $rootScope.activateGlobalSpinner = false;
                      console.error(err);
                      common.logError('Error reloading file data, please refresh your page');
                    }
                  );
                }
              }
            }
          },
          organizationTaxNumber: {
            add: function() {
              self.entity.OrganizationTaxNumbers.push({ Id: 0, SalesTaxNumber: '', SalesTaxId: null });
            },
            remove: function(taxNumber) {
              var index = self.entity.OrganizationTaxNumbers.indexOf(taxNumber);
              if (index >= 0) {
                self.entity.OrganizationTaxNumbers.splice(index, 1);
              }
            }
          },
          address: {
            add: function() {
              self.entity.OrganizationAddresses.push({});
              //self.scopeApply();
            },
            remove: function(address) {
              var index = self.entity.OrganizationAddresses.indexOf(address);
              if (index >= 0) self.entity.OrganizationAddresses.splice(index, 1);
              //self.scopeApply();
            },
            countryChanged: function(address) {
              address.lists = {
                subdivisionList: []
              };
              address.SubdivisionId = undefined;
              address.PostalCode = '';
              if (angular.isDefined(address.CountryId) && address.CountryId && address.CountryId > 0) {
                address.lists.subdivisionList = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
              }
            },
            onRemoveAddressCountryId: function(address) {
              address.CountryId = undefined;
              address.lists = {
                subdivisionList: []
              };
              address.SubdivisionId = undefined;
              address.PostalCode = '';
            },
            onSubdivisionChanged: function(address) {
              if (!address.SubdivisionId || address.SubdivisionId === 0) {
                address.PostalCode = '';
              }
            },
            isSubdivisionRequired: function(address) {
              if (!address) return false;
              return address.CountryId == ApplicationConstants.CountryCanada || address.CountryId == ApplicationConstants.CountryUSA || (address.lists && address.lists.subdivisionList && address.lists.subdivisionList.length > 1);
            },
            isZipPostalRequired: function(countryId) {
              if (!countryId) return false;
              return countryId == ApplicationConstants.CountryCanada || countryId == ApplicationConstants.CountryUSA;
            }
          },

          onRemoveSectorTypeId: function() {
            self.entity.SectorTypeId = undefined;
            self.lists.industryTypeList = [];
            self.entity.IndustryTypeId = undefined;
          },
          onChangeSectorTypeId: function() {
            self.lists.industryTypeList = [];
            self.entity.IndustryTypeId = undefined;

            if (angular.isDefined(self.entity.SectorTypeId) && self.entity.SectorTypeId && self.entity.SectorTypeId > 0) {
              self.lists.industryTypeList = CodeValueService.getRelatedCodeValues(CodeValueGroups.IndustryType, self.entity.SectorTypeId, CodeValueGroups.SectorType);
            }
          },
          parentOrganizationNameFromListSwitch: function() {
            self.actionScope.show.parentOrganizationNameFromList = !self.actionScope.show.parentOrganizationNameFromList;
            if (!self.actionScope.show.parentOrganizationNameFromList) {
              self.entity.ParentOrganization.Id = undefined;
            } else {
              self.entity.ParentOrganization = {};
            }
          },

          goToProfile: function(item, internal) {
            var to = 'Contact.Edit.Profile.';
            if (item.ProfileTypeId == ApplicationConstants.UserProfileType.Organizational) {
              to += 'Organizational';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.Internal) {
              to += 'Internal';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
              to += 'WorkerTemp';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
              to += 'WorkerCanadianSP';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc) {
              to += 'WorkerCanadianInc';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
              to += 'WorkerUnitedStatesW2';
            } else if (item.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
              to += 'WorkerUnitedStatesLLC';
            } else {
              return;
            }

            if (!!internal) {
              $state.go(to, { contactId: item.ContactId, profileId: item.Id });
            } else {
              var url = $state.href(to, { contactId: item.ContactId, profileId: item.Id });
              window.open(url, '_blank');
            }
          },
          addProfile: function() {
            if (self.entity.OrganizationInternalRoles.length > 0) {
              common.logWarning('Contacts can not be created from the organization view');
            } else {
              $state.go('WizardOrganizationalProfile', {
                organizationId: $state.params.organizationId
              });
            }
          }
        }
      },
      constructOrganizationCode: function(legalName) {
        var result = '';
        if (legalName) {
          legalName = legalName.trim();
          legalName = legalName.toUpperCase();
          var words = legalName.split(' ');
          angular.forEach(words, function(word, index) {
            words[index] = word.trim();
            words[index] = word.replace(/[^A-Z0-9]/gi, '');
          });
          angular.forEach(words, function(word, index) {
            if (word == 'THE' || word == 'AND') {
              words[index] = '';
            }
          });
          words = _.filter(words, function(x) {
            return x.length > 0;
          });

          var totalLength = 0;
          angular.forEach(words, function(word, index) {
            totalLength += word.length;
          });
          if (totalLength <= 6 || words.length == 1) {
            angular.forEach(words, function(word, index) {
              result += word;
            });
          } else {
            angular.forEach(words, function(word, index) {
              if (index > 0) {
                //  not first word
                var lengthOfWord = word.length >= 3 ? 3 : word.length;
                result += word.substring(0, lengthOfWord);
              }
            });
            if (words[0].length >= 3) {
              result = words[0].substring(0, 3) + result;
            } else {
              result = words[0] + result;
            }
          }
          result = result.substring(0, 6);
        }

        return result;
      }
    });

    self.actionScope.event.role.client.onChangeOrganizationClientRoleLOBs();
    self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentMethod();
    self.actionScope.event.role.independentContractor.calcHasOrganizationRolePaymentReference();
    self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentMethod();
    self.actionScope.event.role.limitedLiabilityCompany.calcHasOrganizationRolePaymentReference();
    self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentMethod();
    self.actionScope.event.role.subVendor.calcHasOrganizationSubVendorRolePaymentReference();
  }
})(angular, Phoenix.App);
