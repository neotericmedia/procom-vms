(function(app, angular) {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$state', 'NavigationService', 'common', 'dialogs', 'CodeValueService', 'contactService', 'profile', 'smallBusinesses', 'ProfileApiService', 'profiles', 'phxLocalizationService', 'UtilityService', 'resolveListOrganizationInternal', 'resolveListOrganizationClientForWorkerProfile'];
    function ProfileController($state, NavigationService, common, dialogs, CodeValueService, contactService, profile, smallBusinesses, ProfileApiService, profiles, phxLocalizationService, UtilityService, resolveListOrganizationInternal, resolveListOrganizationClientForWorkerProfile) {
        var self = this;
        self.parseFloat = parseFloat;
        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            getContactsForOrganization: ProfileApiService.getContactsForOrganization,
            getOrganizationsForContact: ProfileApiService.getOrganizationsForContact,
            currentProfile: contactService.getCurrentProfile(),
            subdivisions: CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryCanada, CodeValueGroups.Country),
            benefits: CodeValueService.getCodeValues(CodeValueGroups.ProfileWorkerBenefitType),
            internalOrganizations: resolveListOrganizationInternal,
            workerClientOrganizations: resolveListOrganizationClientForWorkerProfile,
            countries: CodeValueService.getCodeValues(CodeValueGroups.Country),
            paymentMethods: CodeValueService.getCodeValues(CodeValueGroups.PaymentMethodType),
            bankCodeBranchCodeAccountNumberRequired: bankCodeBranchCodeAccountNumberRequired,
            datePickerCallback: datePickerCallback,
            addressTypes: CodeValueService.getCodeValues(CodeValueGroups.ProfileAddressType),
            addAddress: addAddress,
            removeAddress: removeAddress,
            profileType: null,
            phoneTypes: CodeValueService.getCodeValues(CodeValueGroups.ProfilePhoneType),
            hasMethod: false,
            hasPreference: false,
            addPhone: addPhone,
            removePhone: removePhone,
            isPhoneDetailRequired: true,
            isAddressDetailRequired: true,
            smallBusinesses: smallBusinesses,
            orgUserProfiles: [],
            taxNumbers: CodeValueService.getCodeValues(CodeValueGroups.SalesTax),
            addSalesTax: addSalesTax,
            removeSalesTax: removeSalesTax,
            restoreUserProfileWorkerOtherEarning: restoreUserProfileWorkerOtherEarning,
            addressCountryChanged: addressCountryChanged,
            addressSubdivisionChanged: addressSubdivisionChanged,
            changePaymentMethod: changePaymentMethod,
            changePaymentPreference: changePaymentPreference,
            validateTD1X: validateTD1X,
            restoreAdditionalTaxAmount: restoreAdditionalTaxAmount,
            onIsAppyWorkerSPGovernmentRulingChange: onIsAppyWorkerSPGovernmentRulingChange,
            addWorkerSPGovernmentRuling: addWorkerSPGovernmentRuling,
            removeWorkerSPGovernmentRuling: removeWorkerSPGovernmentRuling,
            onGovernmentRulingEffectiveYearChange: onGovernmentRulingEffectiveYearChange,

            defaultWorkerSourceDeductions: [],
            UserProfileWorkerSourceDeductions: [],
            defaultWorkerOtherEarnings: [],
            UserProfileWorkerOtherEarnings: [],
            defaultMethods: [],
            currentProfiles: profiles ? profiles.Items : profiles,
            currencies: CodeValueService.getCodeValues(CodeValueGroups.Currency),
            wiretransferBankTypes: CodeValueService.getCodeValues(CodeValueGroups.WireTransferBankType),
            setIsAccrued: setIsAccrued,
            defaultWorkerTempIsBasicSetup: true,
            restoreIsBasicSetup: restoreIsBasicSetup,
            benefitSetupClicked: benefitSetupClicked,
            workerEligibilityChanged: workerEligibilityChanged,
            temporaryForeignPermitTypeChanged: temporaryForeignPermitTypeChanged,
            workPermitTypeChanged: workPermitTypeChanged,
            isWorkerOnImpliedStatusChanged: isWorkerOnImpliedStatusChanged,
            workerEligibilityTypes: CodeValueService.getCodeValues(CodeValueGroups.WorkerEligibilityType),
            temporaryForeignPermitTypes: CodeValueService.getCodeValues(CodeValueGroups.TemporaryForeignPermitType),
            IECCategoryStudentTypes: CodeValueService.getCodeValues(CodeValueGroups.IECCategoryStudentType),
            eligibilityForWorkPermitTypes: CodeValueService.getCodeValues(CodeValueGroups.EligibilityForWorkPermitType),
            workPermitTypes: CodeValueService.getCodeValues(CodeValueGroups.WorkPermitType),
            taxSubdivisionChanged: taxSubdivisionChanged
        });

        // TODO: future access required for internal profiles?

        if ((self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) &&
            self.currentProfile.UserProfileAddresses.length === 0) {
            self.addAddress();
        }
        if (self.currentProfile.Contact.PreferredFirstName && self.currentProfile.Contact.PreferredFirstName != '') {
            NavigationService.setTitle('contact-viewedit', [self.currentProfile.Contact.PreferredFirstName + " " + self.currentProfile.Contact.PreferredLastName]);
        } else {
            NavigationService.setTitle('contact-viewedit', [phxLocalizationService.translate('common.generic.new')]);
        }


        self.canChangePaymentMethods = common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.ContactCreateProfilePaymentMethodsChange);

        self.sourceDeductionTypeList = CodeValueService.getCodeValues(CodeValueGroups.SourceDeductionType, true);
        self.paymentOtherEarningTypeList = CodeValueService.getCodeValues(CodeValueGroups.PaymentOtherEarningType, true);

        if (self.taxExempt) {
            self.defaultWorkerSourceDeductions = ApplicationConstants.getWorkerSourceDeductionsCommon();
        }
        if (self.taxExempt && self.fullTaxExempt) {
            self.defaultWorkerSourceDeductions = self.defaultWorkerSourceDeductions.concat(ApplicationConstants.getWorkerTempSourceDeductions());
            self.defaultWorkerOtherEarnings = ApplicationConstants.WorkerTempOtherEarnings;
        }
        if (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp) {
            if (self.currentProfile.IsBasicSetup == null) {
                self.currentProfile.IsBasicSetup = self.defaultWorkerTempIsBasicSetup;
            }
        }

        common.ArrayExtend(self.UserProfileWorkerSourceDeductions, self.defaultWorkerSourceDeductions, self.currentProfile.UserProfileWorkerSourceDeductions, 'SourceDeductionTypeId');
        //angular.extend(self.UserProfileWorkerSourceDeductions, self.defaultWorkerSourceDeductions, self.currentProfile.UserProfileWorkerSourceDeductions);
        common.ArrayExtend(self.UserProfileWorkerOtherEarnings, self.defaultWorkerOtherEarnings, self.currentProfile.UserProfileWorkerOtherEarnings, 'PaymentOtherEarningTypeId');
        // angular.extend(self.UserProfileWorkerOtherEarnings, self.defaultWorkerOtherEarnings, self.currentProfile.UserProfileWorkerOtherEarnings);

        if (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Organizational ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Internal ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianInc ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerSubVendor ||
            self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
            self.currentProfile.UserProfilePaymentMethods = null;
        }
        else {
            if (self.currentProfile.UserProfilePaymentMethods) {
                self.defaultMethods = angular.copy(ApplicationConstants.DefaultPaymentMethods);
                if (self.currentProfile.UserProfilePaymentMethods.length > 0) {
                    var selectedMethod = _.find(self.currentProfile.UserProfilePaymentMethods, function(mtd) { return mtd.IsSelected === true; });
                    if (selectedMethod) {
                        self.hasMethod = true;
                    }
                    var preferredMethod = _.find(self.currentProfile.UserProfilePaymentMethods, function(mtd) { return mtd.IsPreferred === true; });
                    if (preferredMethod) {
                        self.hasPreference = true;
                    }
                }
                angular.forEach(self.defaultMethods, function(def) {
                    var temp = _.find(self.currentProfile.UserProfilePaymentMethods, function(method) {
                        return method.PaymentMethodTypeId === def.PaymentMethodTypeId;
                    });
                    if (!temp) {
                        self.currentProfile.UserProfilePaymentMethods.push(def);
                    }
                });
                self.currentProfile.UserProfilePaymentMethods = _.orderBy(self.currentProfile.UserProfilePaymentMethods, function(method) { return method.PaymentMethodTypeId; });
            }
        }
        self.currentProfile.UserProfileWorkerSourceDeductions = self.UserProfileWorkerSourceDeductions;
        self.currentProfile.UserProfileWorkerOtherEarnings = self.UserProfileWorkerOtherEarnings;
        self.residencyStatusOptions = ApplicationConstants.ResidencyStatusOptions;

        self.profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

        function taxSubdivisionChanged() {
            if(profile.TaxSubdivisionId == 602) //Quebec
            {
                if (profile.UserProfileWorkerSourceDeductions[0]) {
                    profile.UserProfileWorkerSourceDeductions[0].IsApplied = false; //CPPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[3]) {
                    profile.UserProfileWorkerSourceDeductions[3].IsApplied = true; // QPPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[2]) {
                    profile.UserProfileWorkerSourceDeductions[2].IsApplied = true; // PIPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[7]) {
                    profile.UserProfileWorkerSourceDeductions[7].IsApplied = true; // QuebecTrainingFee
                }
                if (profile.UserProfileWorkerOtherEarnings && profile.UserProfileWorkerOtherEarnings.length > 0) {
                    profile.UserProfileWorkerOtherEarnings[0].IsAccrued = true;
                }
               
               
            }
            else
            { 
                if (profile.UserProfileWorkerSourceDeductions[0]) {
                    profile.UserProfileWorkerSourceDeductions[0].IsApplied = true; //CPPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[3]) {
                    profile.UserProfileWorkerSourceDeductions[3].IsApplied = false; // QPPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[2]) {
                    profile.UserProfileWorkerSourceDeductions[2].IsApplied = false; // PIPExempt
                }
                if (profile.UserProfileWorkerSourceDeductions[7]) {
                    profile.UserProfileWorkerSourceDeductions[7].IsApplied = false; // QuebecTrainingFee
                }
                if (profile.UserProfileWorkerOtherEarnings && profile.UserProfileWorkerOtherEarnings.length > 0) {
                    profile.UserProfileWorkerOtherEarnings[0].IsAccrued = false;
                }
            }
        }

        function changePaymentMethod(method) {

            var hasMethod = false;

            if (!method.IsSelected) {
                if (method.IsPreferred) {
                    method.IsPreferred = false;
                    self.hasPreference = false;
                }
                if (method.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.WireTransfer) {
                    method.ProfileNameBeneficiary = null;
                    method.NameBeneficiary = null;
                    method.AccountNumberBeneficiary = null;
                    method.Address1Beneficiary = null;
                    method.Address2Beneficiary = null;
                    method.CityBeneficiary = null;
                    method.ProvinceOrStateBeneficiary = null;
                    method.CountryCodeBeneficiary = null;
                    method.PostalorZipBeneficiary = null;
                    method.PayCurrencyBeneficiary = null;
                    method.WireTransferBankTypeIdBeneficiary = null;
                    method.BankIDBeneficiary = null;
                    method.ABANoBeneficiary = null;
                    method.WireTransferBankTypeIdIntemediary = null;
                    method.BankNameIntemediary = null;
                    method.BankIdIntemediary = null;
                    method.Address1Intemediary = null;
                    method.Address2Intemediary = null;
                    method.CityIntemediary = null;
                    method.ProvinceOrStateIntemediary = null;
                    method.CountryCodeIntemediary = null;
                    method.PostalOrZipIntemediary = null;
                    method.WireTransferBankTypeIdReceivers = null;
                    method.BankNameReceivers = null;
                    method.BankIdReceivers = null;
                    method.Address1Receivers = null;
                    method.Address2Receivers = null;
                    method.CityReceivers = null;
                    method.ProvinceOrStateReceivers = null;
                    method.CountryCodeReceivers = null;
                    method.PostalOrZipReceivers = null;
                    method.PaymentDetailNotes = null;

                }
                if (method.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.DirectDeposit) {
                    method.BankCode = null;
                    method.BankBranchCode = null;
                    method.BankAccountNumber = null;
                }
                if (method.PaymentMethodTypeId == ApplicationConstants.PaymentMethodType.ADP) {
                    method.EmployeeId = null;
                }
            }

            angular.forEach(self.currentProfile.UserProfilePaymentMethods, function(paymentMethod) {
                hasMethod = hasMethod || !!paymentMethod.IsSelected;
            });

            self.hasMethod = hasMethod;
        }

        function changePaymentPreference(method) {

            var hasPreference = false;
            var IsPreferred = method.IsPreferred;
            angular.forEach(self.currentProfile.UserProfilePaymentMethods, function(paymentMethod) {
                paymentMethod.IsPreferred = false;
            });

            if (method.IsSelected && IsPreferred) {
                method.IsPreferred = IsPreferred;
            }

            angular.forEach(self.currentProfile.UserProfilePaymentMethods, function(paymentMethod) {
                hasPreference = hasPreference || !!paymentMethod.IsPreferred;
            });

            self.hasPreference = hasPreference;
        }

        function bankCodeBranchCodeAccountNumberRequired() {
            if (!self.currentProfile) {
                return false;
            }

            return (self.currentProfile.PaymentMethodTypeId === ApplicationConstants.PaymentMethodType.DirectDeposit ||
                self.currentProfile.PaymentMethodTypeId === ApplicationConstants.PaymentMethodType.WireTransfer);
        }

        function datePickerCallback() {
            if (self.currentProfile.DateOfBirth && new Date(self.currentProfile.DateOfBirth).getFullYear() > 0) {
                var age = common.calculateAge(self.currentProfile.DateOfBirth, new Date().toDateString());

                if (age < 0)
                    contactService.logWarning("The chosen date is in the future");
                else if (age < 16)
                    contactService.logWarning("The worker is younger than 16 years old");
                else if (age > 65)
                    contactService.logWarning("The worker is older than 65 years old");
            }
        }

        function validateTD1X() {

            var totalRemuneration;
            var commissionExpenses;

            if (!self.currentProfile.TD1XTotalRemuneration || self.currentProfile.TD1XTotalRemuneration === '')
                totalRemuneration = 0;
            else
                totalRemuneration = parseFloat(self.currentProfile.TD1XTotalRemuneration);

            if (!self.currentProfile.TD1XCommissionExpenses || self.currentProfile.TD1XCommissionExpenses === '')
                commissionExpenses = 0;
            else
                commissionExpenses = parseFloat(self.currentProfile.TD1XCommissionExpenses);

            if (totalRemuneration === 0 && commissionExpenses > 0)
                contactService.logWarning("Please ensure the Total Remuneration is greater than zero when Commission Expenses are greater than zero");
            else if (totalRemuneration > 0 && commissionExpenses === 0)
                contactService.logWarning("Please ensure the Commission Expenses are greater than zero");
            else if (totalRemuneration < commissionExpenses)
                contactService.logWarning("Total Remuneration is less than the Commission Expenses");

            return false;
        }

        function addAddress() {
            var address = angular.copy(contactService.defaultAddress(self.currentProfile.Id));
            address.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
            self.currentProfile.UserProfileAddresses.push(address);
        }

        function removeAddress(address) {
            var index = self.currentProfile.UserProfileAddresses.indexOf(address);
            if (index >= 0) {
                self.currentProfile.UserProfileAddresses.splice(index, 1);
            }
        }

        function addPhone() {
            self.isPhoneDetailRequired = true;
            self.currentProfile.UserProfilePhones.push(angular.copy(contactService.defaultPhone(self.currentProfile.Id)));
        }

        function removePhone(phone) {
            var index = self.currentProfile.UserProfilePhones.indexOf(phone);

            if (index >= 0) {
                self.currentProfile.UserProfilePhones.splice(index, 1);
            }
        }

        function addSalesTax() {
            self.currentProfile.UserProfileWorkerSPTaxNumbers.push(angular.copy(contactService.defaultTaxNumber(self.currentProfile.Id, self.currentProfile.ProfileTypeId)));
        }

        function removeSalesTax(salesTax) {
            var index = self.currentProfile.UserProfileWorkerSPTaxNumbers.indexOf(salesTax);

            if (index >= 0) {
                self.currentProfile.UserProfileWorkerSPTaxNumbers.splice(index, 1);
            }
        }

        function onIsAppyWorkerSPGovernmentRulingChange(value) {
            if (value && (self.currentProfile.UserProfileWorkerSPGovernmentRulings || !self.currentProfile.UserProfileWorkerSPGovernmentRulings.length)) {
                self.currentProfile.UserProfileWorkerSPGovernmentRulings = [];
                self.addWorkerSPGovernmentRuling();
            }
        }

        function addWorkerSPGovernmentRuling() {
            self.currentProfile.UserProfileWorkerSPGovernmentRulings.push(angular.copy(contactService.defaultWorkerSPGovernmentRuling(self.currentProfile.Id)));
        }

        function removeWorkerSPGovernmentRuling(ruling) {
            var index = self.currentProfile.UserProfileWorkerSPGovernmentRulings.indexOf(ruling);

            if (index >= 0) {
                self.currentProfile.UserProfileWorkerSPGovernmentRulings.splice(index, 1);
            }
        }

        function onGovernmentRulingEffectiveYearChange(ruling, $event) {
            if (typeof ruling.EffectiveDate === 'string') {
                ruling.EffectiveYear = moment(ruling.EffectiveDate, 'YYYY-MM-DD').year();
            }
            else if (typeof ruling.EffectiveDate === 'Date') {
                ruling.EffectiveYear = ruling.EffectiveDate.getFullYear();
            }
            else {
                ruling.EffectiveYear = null;
            }
        }

        function setIsAccrued(userProfileWorkerOtherEarning) {
            if (userProfileWorkerOtherEarning.PaymentOtherEarningTypeId == ApplicationConstants.PaymentOtherEarningType.VacationPay) {
                userProfileWorkerOtherEarning.IsAccrued = userProfileWorkerOtherEarning.IsApplied ? true : null;
            }
        }

        function restoreAdditionalTaxAmount(userProfileWorkerSourceDeduction) {
            userProfileWorkerSourceDeduction.RateAmount = null;
        }

        function restoreIsBasicSetup() {
            self.currentProfile.FederalTD1 = null;
            self.currentProfile.ProvincialTD1 = null;
            self.currentProfile.TD1XTotalRemuneration = null;
            self.currentProfile.TD1XCommissionExpenses = null;
        }

        function benefitSetupClicked($event) {
            if (self.currentProfile.IsApplyBenefit && self.currentProfile.UserProfileWorkerBenefits.length === 0) {
                self.addBenefits();
            }
        }

        function workerEligibilityChanged() {
            self.currentProfile.TemporaryForeignPermitTypeId = null;
            self.currentProfile.IsWorkerOnImpliedStatus = null;
            self.currentProfile.ImpliedStatusEffectiveDate = null;
            self.currentProfile.IECCategoryStudentTypeId = null;
            self.currentProfile.EligibilityForWorkPermitId = null;
            self.currentProfile.WorkPermitNumber = null;
            self.currentProfile.WorkPermitTypeId = null;
            self.currentProfile.ClosedWorkPermitCompany = null;
            self.currentProfile.WorkPermitRestrictions = null;
            self.currentProfile.WorkPermitExpiryDate = null;
        }

        function isWorkerOnImpliedStatusChanged() {
            self.currentProfile.ImpliedStatusEffectiveDate = null;
        }

        function temporaryForeignPermitTypeChanged() {
            self.currentProfile.IECCategoryStudentTypeId = null;
        }

        function workPermitTypeChanged() {
            self.currentProfile.ClosedWorkPermitCompany = null;
        }

        function restoreUserProfileWorkerOtherEarning(userProfileWorkerOtherEarning) {
            setIsAccrued(userProfileWorkerOtherEarning);
            userProfileWorkerOtherEarning.RatePercentage = null;
            if (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp) {
                if (userProfileWorkerOtherEarning.PaymentOtherEarningTypeId == ApplicationConstants.PaymentOtherEarningType.VacationPay) {
                    userProfileWorkerOtherEarning.RatePercentage = userProfileWorkerOtherEarning.IsApplied ? ApplicationConstants.PaymentOtherEarningTypeVacationPayRatePercentageDefault : null;
                }
            }
        }

        angular.forEach(self.currentProfile.UserProfileAddresses, function(address) {
            if (angular.isDefined(address.CountryId) && address.CountryId && address.CountryId > 0) {
                address.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
            } else {
                address.subdivisions = [];
            }
        });

        function addressCountryChanged(address) {
            address.subdivisions = [];
            address.SubdivisionId = undefined;
            address.PostalCode = '';
            if (angular.isDefined(address.CountryId) && address.CountryId && address.CountryId > 0) {
                address.subdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, address.CountryId, CodeValueGroups.Country);
            }
        }

        function addressSubdivisionChanged(address) {
            if (!address.SubdivisionId || address.SubdivisionId === 0) {
                address.PostalCode = '';
            }
        }

        self.getOrgReps = function(orgid, isRemoveInactiveProfile) {

            if (!orgid || orgid === 0 || self.currentProfile.ProfileTypeId != ApplicationConstants.UserProfileType.WorkerSubVendor) { return; }
            var odataquery = '$filter=ProfileTypeId eq ' + ApplicationConstants.UserProfileType.Organizational;

            var promise = self.getContactsForOrganization(orgid, odataquery)
                .then(function(subvendorOrgs) {

                    self.orgUserProfiles = [];
                    angular.forEach(subvendorOrgs.Items, function(obj) {
                        obj.FullName = obj.Contact.FullName;
                        self.orgUserProfiles.push(obj);
                    });
                    if (isRemoveInactiveProfile) {
                        ProfileApiService.removeInactiveProfile(self.orgUserProfiles, self.currentProfile.UserProfileIdOrgRep);
                    }

                });
        };
        self.getOrgRepsOnChange = function(orgid) {
            if (!orgid || orgid === 0 || self.currentProfile.ProfileTypeId != ApplicationConstants.UserProfileType.WorkerSubVendor) { return; }
            self.currentProfile.UserProfileIdOrgRep = null;
            self.getOrgReps(orgid);
        };

        self.showAddBenefitsButton = function() {
            var isHidden = self.benefits && self.benefits.length > 0 &&
                _.some(self.currentProfile.UserProfileWorkerBenefits, { 'IsActive': true });
            return !isHidden;

        }

        self.addBenefits = function(benefit) {

            var dialogConfig = {
                title: "Consultant Benefits",
                internalOrganizations: self.internalOrganizations,
                benefits: self.benefits,
                // benefit: angular.copy(benefit),
                benefit: benefit,
                currentProfile: self.currentProfile,
                validate: function() {
                    var retVal = { isValid: true, errors: [] };
                    if (this.benefit.IsActive && !moment(this.benefit.EffectiveDate).isSameOrAfter(new Date(), 'day')) {
                        retVal.isValid = false;
                        retVal.errors.push({ message: 'Effective date cannot be less than today date.' })
                    }
                    return retVal;
                }
            };
            var that = self;
            dialogs.create('/Phoenix/modules/contact/views/BenefitAddDialog.html', 'BenefitAddDialogController', dialogConfig, { keyboard: false, backdrop: 'static', windowClass: "paymentBatchWindow" }).result.then(
                function(result) {
                    var action = result.action;
                    if (action == "create") {
                        var updateBenefit = function(eBenefit, resultBenefit) {
                            eBenefit.IsActive = resultBenefit.IsActive;
                            eBenefit.EffectiveDate = resultBenefit.EffectiveDate;
                            eBenefit.EmployerAmount = resultBenefit.EmployerAmount;
                            eBenefit.EmployeeAmount = resultBenefit.EmployeeAmount;
                            eBenefit.TotalAmount = (parseFloat(eBenefit.EmployeeAmount) + parseFloat(eBenefit.EmployerAmount));
                            eBenefit.BenefitTypeId = resultBenefit.BenefitTypeId;
                            eBenefit.OrganizationIdInternal = resultBenefit.OrganizationIdInternal;
                        }
                        var createBenefit = function(resultBenefit) {
                            resultBenefit.Id = undefined;
                            resultBenefit.uuid = UtilityService.createUuid();
                            resultBenefit.TotalAmount = (parseFloat(resultBenefit.EmployeeAmount) + parseFloat(resultBenefit.EmployerAmount));
                            self.currentProfile.UserProfileWorkerBenefits.push(resultBenefit);
                        }
                        var existingBenefitWithId = _.find(self.currentProfile.UserProfileWorkerBenefits,
                            function(b) {
                                return (b.Id == (result.benefit.Id || -1)) || (b.uuid == (result.benefit.uuid || -1));
                            })
                        if (existingBenefitWithId) {
                            if ((!existingBenefitWithId.IsActive && !result.benefit.IsActive) || (existingBenefitWithId.IsActive && !result.benefit.IsActive)) {
                                updateBenefit(existingBenefitWithId, result.benefit);
                            }
                            else {
                                var existingBenefit = _.find(self.currentProfile.UserProfileWorkerBenefits,
                                    function(b) {
                                        return b.IsActive && (b.EffectiveDate == result.benefit.EffectiveDate) && (b.BenefitTypeId == result.benefit.BenefitTypeId);
                                    })
                                if (existingBenefit) {
                                    updateBenefit(existingBenefit, result.benefit);
                                }
                                else {
                                    createBenefit(result.benefit);
                                }
                            }
                        }
                        else {
                            createBenefit(result.benefit);
                        }
                    }
                    else if (action == "cancel") {
                        if (self.currentProfile.UserProfileWorkerBenefits.length === 0) {
                            self.currentProfile.IsApplyBenefit = false;
                        }
                    }
                },
                function(result) {

                });
        }

        if (self.currentProfile.IsDraftStatus) {
            //Get Selected Organizations and Profile types and restrict the user from selecting the same org and profile type more than once.
            self.getOrganizationsForContact(self.currentProfile.SourceContactId || self.currentProfile.ContactId).then(function(profileTypeByOrgId) {
                if (Array.isArray(profileTypeByOrgId)) {
                    var newlist = [];
                    angular.forEach(profileTypeByOrgId, function(item) {
                        if (item.ProfileTypeId == self.currentProfile.ProfileTypeId) {
                            angular.forEach(self.smallBusinesses, function(sb) {
                                if (item.OrganizationId == sb.Id) {
                                    sb.OrgProfileTypeDuplicate = true;
                                }
                            });
                        }
                    });
                    angular.forEach(self.smallBusinesses, function(sb) {
                        if (!sb.OrgProfileTypeDuplicate) {
                            newlist.push(sb);
                        }
                    });

                    self.smallBusinesses = angular.copy(newlist);

                    _.each(self.currentProfiles, function(p) {
                        if ((p.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc || p.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) && p.OrganizationId)
                            self.smallBusinesses = _.reject(self.smallBusinesses, function(o) { return p.OrganizationId == o.Id; });
                    });

                    var result = self.smallBusinesses;
                }
            });
        }

        console.log('profile is loading');
    }
})(Phoenix.App, angular);