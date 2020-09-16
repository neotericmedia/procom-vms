(function (angular, app) {
    'use strict';

    var controllerId = 'OrgEditControllerExtendTabValidator';

    angular.module('phoenix.org.controllers').controller(controllerId, ['self', 'common', OrgEditControllerExtendTabValidator]);

    function OrgEditControllerExtendTabValidator(self, common) {
        angular.extend(self, {
            validator: {
                tabDetailsIsValid: false,
                tabRolesIsValid: false,
                tabCollaboratorsIsValid: false,
                tabValid: function (tab) {
                    if (tab.stateName == 'Details') {
                        common.validator.result.isValid = true;
                        common.validator.onValidatorResultIsValidToValidate__String(self.entity.LegalName, 3, 128);
                        common.validator.onValidatorResultIsValidToValidate__String(self.entity.Code, 3, 50);
                        common.validator.onValidatorResultIsValidToValidate__String(self.entity.DisplayName, 3, 128);
                        common.validator.onValidatorResultIsValidToValidate______Id(self.entity.DefaultTaxSubdivisionId);
                        common.validator.onValidatorResultIsValidToValidate___Array(self.entity.OrganizationAddresses);
                        if (self.entity.ParentOrganization === null || (!common.validator.ValidatorOnString(self.entity.ParentOrganization.Name) && !common.validator.ValidatorOnId(self.entity.ParentOrganization.Id))) {
                            common.validator.result.isValid = false;
                        }
                        angular.forEach(self.entity.OrganizationAddresses, function (address) {
                            common.validator.onValidatorResultIsValidToValidate__String(address.AddressDescription, 3, 256);
                            common.validator.onValidatorResultIsValidToValidate__String(address.AddressLine1, 3, 64);
                            common.validator.onValidatorResultIsValidToValidate__String(address.CityName, 3, 64);
                            common.validator.onValidatorResultIsValidToValidate______Id(address.CountryId);
                            common.validator.onValidatorResultIsValidToValidate______Id(address.SubdivisionId);
                            common.validator.onValidatorResultIsValidToValidate_ZipCode(address.PostalCode);
                        });

                        self.validator.tabDetailsIsValid = common.validator.result.isValid;
                    }
                    else if (tab.stateName == 'Roles') {
                        common.validator.result.isValid = true;

                        if (self.entity.OrganizationClientRoles.length === 0 && self.entity.OrganizationIndependentContractorRoles.length === 0 && self.entity.OrganizationLimitedLiabilityCompanyRoles.length === 0 && self.entity.OrganizationInternalRoles.length === 0 && self.entity.OrganizationSubVendorRoles.length === 0) {
                            common.validator.result.isValid = false;
                        }

                        if (self.entity.OrganizationClientRoles !== null && self.entity.OrganizationClientRoles.length > 0 && self.entity.OrganizationClientRoles[0] !== null) {
                            common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationClientRoles[0].OrganizationRoleStatusId);
                            common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsBypassZeroUnitTimeSheetApproval);
                            common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsSuppressZeroAmountInvoiceRelease);
                            if (!self.actionScope.event.role.client.hasOrganizationClientRoleLOB) {
                                common.validator.result.isValid = false;
                            }
                            if (_.isArray(self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers) && self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers.length > 0 && _.some(self.entity.OrganizationClientRoles[0].OrganizationClientRoleNationalAccountManagers, function (nam) { return !nam.UserProfileInternalId; })) {
                                common.validator.result.isValid = false;
                            }
                            if (_.isArray(self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills) && self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills.length > 0 && _.some(self.entity.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills, function (ab) { return !ab.AlternateBillLegalName || !ab.AlternateBillCode || common.validator.onValidatorResultIsValidToValidate__String(ab.AlternateBillCode, 3, 6); })) {
                                common.validator.result.isValid = false;
                            }
                            if (self.entity.AreComplianceFieldsRequired) {
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsChargeSalesTax);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsChargeableExpenseSalesTax);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutCanadaPensionPlanForTemp);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutCanadaPensionPlanForSP);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutEmploymentInsuranceForTemp);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutEmploymentInsuranceForSP);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecParentalInsurancePlanForTemp);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecParentalInsurancePlanForSP);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecPensionPlanForTemp);
                                common.validator.onValidatorResultIsValidToValidate_Boolean(self.entity.OrganizationClientRoles[0].IsAccrueMaxedOutQuebecPensionPlanForSP);
                                if (self.entity.OrganizationClientRoles[0].IsChargeSalesTax) {
                                    common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationClientRoles[0].ClientSalesTaxDefaultId);
                                }
                            }
                        }
                        if (self.entity.OrganizationIndependentContractorRoles !== null && self.entity.OrganizationIndependentContractorRoles.length > 0 && self.entity.OrganizationIndependentContractorRoles[0] !== null) {
                            common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationIndependentContractorRoles[0].OrganizationRoleStatusId);

                            if (self.entity.OrganizationIndependentContractorRoles[0].NotificationEmail === null || typeof self.entity.OrganizationIndependentContractorRoles[0].NotificationEmail === 'undefined') {
                                common.validator.result.isValid = false;
                            }
                            else {
                                var emailsLength = 0;
                                angular.forEach(self.entity.OrganizationIndependentContractorRoles[0].NotificationEmail.split(';'), function (notificationEmail) {
                                    common.validator.onValidatorResultIsValidToValidate___Email(notificationEmail.trim());
                                    emailsLength += notificationEmail.trim().length;
                                });
                                if (emailsLength > 512) {
                                    common.validator.result.isValid = false;
                                }
                            }

                            if (self.entity.OrganizationIndependentContractorRoles[0].IsNonResident === null) {
                                common.validator.result.isValid = false;
                            }

                            angular.forEach(self.entity.OrganizationTaxNumbers, function (taxNumber) {
                                common.validator.onValidatorResultIsValidToValidate______Id(taxNumber.SalesTaxId);
                                common.validator.onValidatorResultIsValidToValidate__String(taxNumber.SalesTaxNumber, 1, 250);
                            });
                            if (self.entity.AreComplianceFieldsRequired) {
                                if (!self.actionScope.event.role.independentContractor.hasOrganizationIndependentContractorRolePaymentMethod) {
                                    common.validator.result.isValid = false;
                                }
                                if (!self.actionScope.event.role.independentContractor.hasOrganizationRolePaymentReference) {
                                    common.validator.result.isValid = false;
                                }
                                angular.forEach(self.entity.OrganizationIndependentContractorRoles[0].PaymentMethods, function (paymentMethod) {
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankCode, 3, 30);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankBranchCode, 3, 30);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankAccountNumber, 3, 30);
                                    }
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.ProfileNameBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.NameBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.AccountNumberBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.Address1Beneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankIDBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.CountryCodeBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.PayCurrencyBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.WireTransferBankTypeIdBeneficiary);
                                    }
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.EmployeeId);
                                    }
                                });
                            }
                        }

                        if (self.entity.OrganizationLimitedLiabilityCompanyRoles !== null && self.entity.OrganizationLimitedLiabilityCompanyRoles.length > 0 && self.entity.OrganizationLimitedLiabilityCompanyRoles[0] !== null) {
                            common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].OrganizationRoleStatusId);

                            if (self.entity.OrganizationLimitedLiabilityCompanyRoles[0].NotificationEmail === null || typeof self.entity.OrganizationLimitedLiabilityCompanyRoles[0].NotificationEmail === 'undefined') {
                                common.validator.result.isValid = false;
                            }
                            else {
                                var emailsLength = 0;
                                angular.forEach(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].NotificationEmail.split(';'), function (notificationEmail) {
                                    common.validator.onValidatorResultIsValidToValidate___Email(notificationEmail.trim());
                                    emailsLength += notificationEmail.trim().length;
                                });
                                if (emailsLength > 512) {
                                    common.validator.result.isValid = false;
                                }
                            }

                            //  7119-7120-fix bug (HIGH) LLC Organization Employer Identification Number is optional so you should be able to submit without fillling it out
                            //if (self.entity.OrganizationLimitedLiabilityCompanyRoles[0].EmployerIdentificationNumber === null || typeof self.entity.OrganizationLimitedLiabilityCompanyRoles[0].EmployerIdentificationNumber === 'undefined') {
                            //    common.validator.result.isValid = false;
                            //}
                            //common.validator.onValidatorResultIsValidToValidate__String(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].EmployerIdentificationNumber, 0, 32);

                            if (self.entity.OrganizationLimitedLiabilityCompanyRoles[0].IsNonResident === null) {
                                common.validator.result.isValid = false;
                            }

                            //angular.forEach(self.entity.OrganizationTaxNumbers, function (taxNumber) {
                            //    common.validator.onValidatorResultIsValidToValidate______Id(taxNumber.SalesTaxId);
                            //    common.validator.onValidatorResultIsValidToValidate__String(taxNumber.SalesTaxNumber, 1, 250);
                            //});
                            if (self.entity.AreComplianceFieldsRequired) {
                                if (!self.actionScope.event.role.limitedLiabilityCompany.hasOrganizationLimitedLiabilityCompanyRolePaymentMethod) {
                                    common.validator.result.isValid = false;
                                }
                                if (!self.actionScope.event.role.limitedLiabilityCompany.hasOrganizationRolePaymentReference) {
                                    common.validator.result.isValid = false;
                                }
                                angular.forEach(self.entity.OrganizationLimitedLiabilityCompanyRoles[0].PaymentMethods, function (paymentMethod) {
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankCode, 3, 30);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankBranchCode, 3, 30);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankAccountNumber, 3, 30);
                                    }
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.ProfileNameBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.NameBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.AccountNumberBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.Address1Beneficiary);
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankIDBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.CountryCodeBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.PayCurrencyBeneficiary);
                                        common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.WireTransferBankTypeIdBeneficiary);
                                    }
                                    if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                                        common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.EmployeeId);
                                    }
                                });
                            }
                        }

                        if (self.entity.OrganizationInternalRoles !== null && self.entity.OrganizationInternalRoles.length > 0 && self.entity.OrganizationInternalRoles[0] !== null) {
                            common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationInternalRoles[0].OrganizationRoleStatusId);

                            angular.forEach(self.entity.OrganizationTaxNumbers, function (taxNumber) {
                                common.validator.onValidatorResultIsValidToValidate______Id(taxNumber.SalesTaxId);
                                common.validator.onValidatorResultIsValidToValidate__String(taxNumber.SalesTaxNumber, 1, 250);
                            });
                            if (self.entity.AreComplianceFieldsRequired) {
                                angular.forEach(self.entity.OrganizationInternalRoles[0].BankAccounts, function (bankAccount) {
                                    common.validator.onValidatorResultIsValidToValidate__String(bankAccount.BankName, 3, 200);
                                    common.validator.onValidatorResultIsValidToValidate__String(bankAccount.GLAccount, 1, 100);
                                    common.validator.onValidatorResultIsValidToValidate______Id(bankAccount.CurrencyId);
                                    common.validator.onValidatorResultIsValidToValidate__String(bankAccount.Transit, 1, 50);
                                    common.validator.onValidatorResultIsValidToValidate__String(bankAccount.AccountNo, 1, 50);

                                    common.validator.onValidatorResultIsValidToValidate______Id(bankAccount.OrganizationBankStatusId);
                                    // Restore this code when CIMS goes offline
                                    /*                                
                                    common.validator.onValidatorResultIsValidToValidate__Number(bankAccount.NextChequeNumber);
                                    common.validator.onValidatorResultIsValidToValidate__Number(bankAccount.NextDirectDepositBatchNumber);
                                    common.validator.onValidatorResultIsValidToValidate__Number(bankAccount.NextWireTransferBatchNumber);
                                    */
                                    // End restore this code when CIMS goes offline
                                    common.validator.onValidatorResultIsValidToValidate__String(bankAccount.AccountId, 0, 50);
                                });
                            }
                        }
                        if (self.entity.OrganizationSubVendorRoles !== null && self.entity.OrganizationSubVendorRoles.length > 0 && self.entity.OrganizationSubVendorRoles[0] !== null) {
                            common.validator.onValidatorResultIsValidToValidate______Id(self.entity.OrganizationSubVendorRoles[0].OrganizationRoleStatusId);

                            if (self.entity.OrganizationSubVendorRoles[0].NotificationEmail === null || typeof self.entity.OrganizationSubVendorRoles[0].NotificationEmail === 'undefined') {
                                common.validator.result.isValid = false;
                            }
                            else {
                                var emailsLength = 0;
                                angular.forEach(self.entity.OrganizationSubVendorRoles[0].NotificationEmail.split(';'), function (notificationEmail) {
                                    common.validator.onValidatorResultIsValidToValidate___Email(notificationEmail.trim());
                                    emailsLength += notificationEmail.trim().length;
                                });
                                if (emailsLength > 512) {
                                    common.validator.result.isValid = false;
                                }
                            }

                            if (self.entity.OrganizationSubVendorRoles[0].IsNonResident === null) {
                                common.validator.result.isValid = false;
                            }
                            if (self.entity.AreComplianceFieldsRequired) {
                                if (!self.actionScope.event.role.subVendor.hasOrganizationSubVendorRolePaymentMethod) {
                                    common.validator.result.isValid = false;
                                }
                                if (!self.actionScope.event.role.subVendor.hasOrganizationSubVendorRolePaymentReference) {
                                    common.validator.result.isValid = false;
                                }

                                angular.forEach(self.entity.OrganizationSubVendorRoles, function (subvendorRole) {
                                    if (subvendorRole.UseADifferentPayeeName === true)
                                        common.validator.onValidatorResultIsValidToValidate__String(subvendorRole.PayeeName, 3, 512);

                                    angular.forEach(subvendorRole.PaymentMethods, function (paymentMethod) {
                                        if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankCode, 3, 30);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankBranchCode, 3, 30);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankAccountNumber, 3, 30);
                                        }
                                        if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.ProfileNameBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.NameBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.AccountNumberBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.Address1Beneficiary);
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.BankIDBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.CountryCodeBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.PayCurrencyBeneficiary);
                                            common.validator.onValidatorResultIsValidToValidate______Id(paymentMethod.WireTransferBankTypeIdBeneficiary);
                                        }
                                        if (paymentMethod.IsSelected && paymentMethod.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                                            common.validator.onValidatorResultIsValidToValidate__String(paymentMethod.EmployeeId);
                                        }
                                    });
                                });
                            }


                        }
                        self.validator.tabRolesIsValid = common.validator.result.isValid;
                    }
                    else if (tab.stateName == 'Collaborators') {
                        common.validator.result.isValid = true;

                        self.validator.tabCollaboratorsIsValid = common.validator.result.isValid;
                    }
                },
            }
        });
    }

})(angular, Phoenix.App);