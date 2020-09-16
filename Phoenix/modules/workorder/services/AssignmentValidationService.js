/*global Phoenix: false, console: false*/
(function (services) {
    'use strict';

    angular.module('phoenix.workorder.services').factory('AssignmentValidationService', ['$rootScope', function ($rootScope) {

        function AssignmentValidationService() {
        }

        // collection of rules for edit mode
        AssignmentValidationService.prototype.edit =
            {
                edit: 'workorder.edit',
                core: 'workorder.edit.core',
                partiesAndRates: 'workorder.edit.parties',
                timeMaterialInvoice: 'workorder.edit.timematerialinvoice',
                expensemanagement: 'workorder.edit.expensemanagement',
                purchaseorder: 'workorder.edit.purchaseorder',
                earningsanddeductions: 'workorder.edit.earningsanddeductions',
                taxes: 'workorder.edit.taxes',
                activityHistory: 'workorder.edit.activity.history',
                activityTransaction: 'workorder.edit.activity.transaction',
                compliancedocuments: 'workorder.edit.compliancedocuments',
                clientspecificfields: 'workorder.edit.clientspecificfields',
            };

        AssignmentValidationService.prototype.stateValid =
            {
                all: false,
                core: false,
                partiesAndRates: false,
                timeMaterialInvoice: false,
                expensemanagement: false,
                purchaseorder: false,
                earningsanddeductions: false,
                taxes: false,
                compliancedocuments: false,
                clientspecificfields: false,
            };


        AssignmentValidationService.prototype.tabNavigation = function (natTo, stateCurrentName) {
            var that = this;
            var stateToName = stateCurrentName;
            if (natTo == 'prev') {
                if (stateCurrentName == that.edit.core) { }
                else if (stateCurrentName == that.edit.partiesAndRates) { stateToName = that.edit.core; }
                else if (stateCurrentName == that.edit.timeMaterialInvoice) { stateToName = that.edit.partiesAndRates; }
                else if (stateCurrentName == that.edit.expensemanagement) { stateToName = that.edit.timeMaterialInvoice; }
                else if (stateCurrentName == that.edit.purchaseorder) { stateToName = that.edit.expensemanagement; }
                else if (stateCurrentName == that.edit.earningsanddeductions) { stateToName = that.edit.purchaseorder; }
                else if (stateCurrentName == that.edit.taxes) { stateToName = that.edit.earningsanddeductions; }
                else if (stateCurrentName == that.edit.compliancedocuments) { stateToName = that.edit.taxes; }
                else if (stateCurrentName == that.edit.activityHistory || stateCurrentName == that.edit.activityTransaction) { stateToName = that.edit.taxes; }

            } else if (natTo == 'next') {
                if (stateCurrentName == that.edit.activityHistory || stateCurrentName == that.edit.activityTransaction) { }
                else if (stateCurrentName == that.edit.core) { stateToName = that.edit.partiesAndRates; }
                else if (stateCurrentName == that.edit.partiesAndRates) { stateToName = that.edit.timeMaterialInvoice; }
                else if (stateCurrentName == that.edit.timeMaterialInvoice) { stateToName = that.edit.expensemanagement; }
                else if (stateCurrentName == that.edit.expensemanagement) { stateToName = that.edit.purchaseorder; }
                else if (stateCurrentName == that.edit.purchaseorder) { stateToName = that.edit.earningsanddeductions; }
                else if (stateCurrentName == that.edit.earningsanddeductions) { stateToName = that.edit.taxes; }
                else if (stateCurrentName == that.edit.taxes) { stateToName = that.edit.compliancedocuments; }
                else if (stateCurrentName == that.edit.compliancedocuments) { stateToName = that.edit.activityHistory; }
            }
            return stateToName;
        };

        function addErrorMessage(entity, property, message) {

            entity.BrokenRules = entity.BrokenRules || {};
            entity.BrokenRules[property] = entity.BrokenRules[property] || [];
            entity.BrokenRules[property].push(message);

        }

        function validateDateRequired(value) {
            var dm = parseInt(moment(ApplicationConstants.formatDateMin).format(ApplicationConstants.formatDateInt));
            var dateValue = parseInt(moment(value).format(ApplicationConstants.formatDateInt));
            if (dateValue <= dm || value == []._) {
                return false;
            } else {
                return true;
            }
        }

        function validateStartDateRequire(entity, populateBrokenRules) {
            var returnValue = true;
            if (!validateDateRequired(entity.StartDate) && !validateDateRequired(entity.WorkOrderVersions[0].WorkOrderStartDateState)) {
                returnValue = false;
                if (populateBrokenRules) {
                    addErrorMessage(entity, 'StartDate', 'Start Date must be entered');
                }
            }
            return returnValue;
        }

        function validateEndDateRequired(entity, populateBrokenRules) {
            var returnValue = true;
            if (!validateDateRequired(entity.EndDate) && !validateDateRequired(entity.WorkOrderVersions[0].WorkOrderEndDateState)) {
                returnValue = false;
                if (populateBrokenRules) {
                    addErrorMessage(entity, 'EndDate', 'End Date must be entered');
                }

            }
            return returnValue;
        }

        AssignmentValidationService.prototype.validateRecruiterRequired = function validateRecruiterRequired(workOrderVersion) {
            return (workOrderVersion
                && workOrderVersion.Recruiters 
                && workOrderVersion.Recruiters.length > 0 
                && _.some(workOrderVersion.Recruiters, function (recruiter) { return !recruiter.UserProfileIdSales; }));
        }

        AssignmentValidationService.prototype.validateCore = function (workOrder, entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }


            //http://momentjs.com/docs/#/plugins/range/
            var dm = parseInt(moment(ApplicationConstants.formatDateMin).format(ApplicationConstants.formatDateInt));
            var dn = parseInt(moment(new Date()).format(ApplicationConstants.formatDateInt));
            var ds = parseInt(moment(workOrder.StartDate).format(ApplicationConstants.formatDateInt));
            var de = parseInt(moment(workOrder.EndDate).format(ApplicationConstants.formatDateInt));

            var validationRules = [validateStartDateRequire, validateEndDateRequired];

            for (var x = 0; x < validationRules.length; x++) {
                if (!validationRules[x](workOrder, populateBrokenRules)) {
                    vStatus = false;
                }
            }

            if (populateBrokenRules) { entity.BrokenRules.DatesCompare = []; }
            if (de < ds) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.DatesCompare.push('The end date must be greater than or equal to the start date'); }
            }

            if (populateBrokenRules) { entity.BrokenRules.LineOfBusinessId = []; }
            if (!entity.LineOfBusinessId || entity.LineOfBusinessId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.LineOfBusinessId.push('Line of business must be selected'); }
            }
            if (entity.LineOfBusinessId && entity.LineOfBusinessId === ApplicationConstants.LineOfBusiness.PermPlacement) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.LineOfBusinessId.push('Line of business must not be Permanent Placement'); }
            }

            if (populateBrokenRules) { entity.BrokenRules.InternalOrganizationDefinition1Id = []; }
            if (!entity.InternalOrganizationDefinition1Id || entity.InternalOrganizationDefinition1Id === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.InternalOrganizationDefinition1Id.push('Branch must be selected'); }
            }

            if (populateBrokenRules) { entity.BrokenRules.WorksiteId = []; }
            if (!entity.WorksiteId || entity.WorksiteId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.WorksiteId.push('Physical Work Location must be selected'); }
            }

            if (populateBrokenRules) { entity.BrokenRules.PositionTitleId = []; }
            if (!entity.PositionTitleId || entity.PositionTitleId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.PositionTitleId.push('Position title must be selected'); }
            }
            if (populateBrokenRules) { entity.BrokenRules.AssignedToUserProfileId = []; }
            if (!entity.AssignedToUserProfileId || entity.AssignedToUserProfileId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.AssignedToUserProfileId.push('Administrative contact must be selected'); }
            }
            if (populateBrokenRules) { entity.BrokenRules.JobOwner = []; }
            if (!entity.JobOwner || !entity.JobOwner.UserProfileIdSales || entity.UserProfileIdSales === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.JobOwner.push('Job Owner must be selected'); }
            }
            if (populateBrokenRules) { entity.BrokenRules.JobOwnerUsesSupport = []; }
            if (entity.JobOwnerUsesSupport === undefined || entity.JobOwnerUsesSupport === null) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.JobOwnerUsesSupport = ['"Job Owner Uses Support?" must be selected']; }
            }
            if (populateBrokenRules) { entity.BrokenRules.WorkOrderVersionCommissions = []; }
            if (entity.WorkOrderVersionCommissions && entity.WorkOrderVersionCommissions.length > 0 && _.some(entity.WorkOrderVersionCommissions, function (obj) { return (!obj.CommissionRateHeaderId || obj.CommissionRateHeaderId === 0) && (obj.CommissionRates && obj.CommissionRates.length > 0); })) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.WorkOrderVersionCommissions.push('Commission Rate must be selected'); }
            }
            if (populateBrokenRules) { entity.BrokenRules.Recruiters = []; }
            if (that.validateRecruiterRequired(entity)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Recruiters.push('Recruiters must be selected'); }
            }
            return vStatus;
        };

        AssignmentValidationService.prototype.validateBillingParty = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //OrganizationId
            if (populateBrokenRules) { entity.BrokenRules.OrganizationIdClient = []; }
            if (!entity.OrganizationIdClient || entity.OrganizationIdClient === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.OrganizationIdClient = ['At least 1 client must be selected for the work order']; }
            }

            //UserProfileId
            if (populateBrokenRules) { entity.BrokenRules.UserProfileIdClient = []; }
            if (!entity.UserProfileIdClient || entity.UserProfileIdClient === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.UserProfileIdClient = ['A Client Manager must be selected for the work order']; }
            }

            //Hours
            if (populateBrokenRules) { entity.BrokenRules.Hours = []; }
            //if (!entity.Hours || entity.Hours == 0) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be entered'];
            //}
            //else if (!entity.Hours || entity.Hours < 0) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be greater than 0 hours'];
            //}
            //else if (!entity.Hours || entity.Hours > 24) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be less than 24 hours'];
            //}


            if (entity.Hours === null || entity.Hours === undefined) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be entered']; }
            }
            else if (entity.Hours < 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be greater than 0 hours']; }
            }
            else if (entity.Hours > 24) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be less than 24 hours']; }
            }

            //CurrencyId
            if (populateBrokenRules) { entity.BrokenRules.CurrencyId = []; }
            if (!entity.CurrencyId || entity.CurrencyId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.CurrencyId = ['Currency must be selected']; }
            }

            //BillingRates
            angular.forEach(entity.BillingRates, function (billingRate) {
                billingRate.BrokenRules = billingRate.BrokenRules || {};
                if (!that.validatePartyRate(billingRate, populateBrokenRules)) {
                    vStatus = false;
                    that.stateValid.timeMaterialInvoice = false;
                }
            });

            return vStatus;
        };

        AssignmentValidationService.prototype.validatePaymentParty = function (entity, populateBrokenRules, workerProfileTypeId) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //OrganizationId
            if (populateBrokenRules) { entity.BrokenRules.OrganizationIdSupplier = []; }
            if (workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc && (!entity.OrganizationIdSupplier || entity.OrganizationIdSupplier === 0)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.OrganizationIdSupplier = ['The Worker should be assigned for IndependentContractor Organisation']; }
            }
            if (workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC && (!entity.OrganizationIdSupplier || entity.OrganizationIdSupplier === 0)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.OrganizationIdSupplier = ['The Worker should be assigned for LLC Organisation']; }
            }
            //UserProfileId
            if (populateBrokenRules) { entity.BrokenRules.UserProfileIdSupplier = []; }
            if (!entity.UserProfileIdSupplier || entity.UserProfileIdSupplier === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.UserProfileIdSupplier = ['A Primary Contact must be selected for the work order']; }
            }

            //Hours
            if (populateBrokenRules) { entity.BrokenRules.Hours = []; }
            //if (!entity.Hours || entity.Hours == 0) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be entered'];
            //}
            //else if (!entity.Hours || entity.Hours < 0) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be greater than 0 hours'];
            //}
            //else if (!entity.Hours || entity.Hours > 24) {
            //    vStatus = false;
            //    if (populateBrokenRules) entity.BrokenRules.Hours = ['Hours per day must be less than 24 hours'];
            //}


            if (entity.Hours === null || entity.Hours === undefined) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be entered']; }
            }
            else if (entity.Hours < 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be greater than 0 hours']; }
            }
            else if (entity.Hours > 24) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Hours = ['Hours per day must be less than 24 hours']; }
            }

            //CurrencyId
            if (populateBrokenRules) { entity.BrokenRules.CurrencyId = []; }
            if (!entity.CurrencyId || entity.CurrencyId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.CurrencyId = ['Currency must be selected']; }
            }

            //PaymentRates
            angular.forEach(entity.PaymentRates, function (paymentRate) {
                paymentRate.BrokenRules = paymentRate.BrokenRules || {};
                if (!that.validatePartyRate(paymentRate, populateBrokenRules)) {
                    vStatus = false;
                    that.stateValid.timeMaterialInvoice = false;
                }
            });

            return vStatus;
        };

        AssignmentValidationService.prototype.validateBillingInfo = function (entity, populateBrokenRules, validateCompliance, invoiceType, methodology, isUsesProject) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            angular.forEach(entity.BillingInvoices, function (billingInvoice) {
                billingInvoice.BrokenRules = billingInvoice.BrokenRules || {};
                if (!that.validateBillingInvoice(billingInvoice, populateBrokenRules, validateCompliance, invoiceType, methodology, isUsesProject)) {
                    vStatus = false;
                    switch (invoiceType) {
                        case 1: that.stateValid.timeMaterialInvoice = false; break;
                        case 2: that.stateValid.expensemanagement = false; break;
                    }
                }
            });

            return vStatus;
        };

        AssignmentValidationService.prototype.validatePaymentInfo = function (entity, populateBrokenRules, validateCompliance, invoiceType, methodology) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //PaymentContacts
            if (populateBrokenRules) { entity.BrokenRules.PaymentContacts = []; }
            angular.forEach(entity.PaymentContacts, function (generalContact) {
                if (!generalContact.UserProfileId || generalContact.UserProfileId === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.PaymentContacts = ['A General Contact must be selected']; }
                }
            });

            //PaymentInvoices
            angular.forEach(entity.PaymentInvoices, function (billingInvoice) {
                billingInvoice.BrokenRules = billingInvoice.BrokenRules || {};
                if (!that.validatePaymentInvoice(billingInvoice, populateBrokenRules, validateCompliance, invoiceType, methodology)) {
                    vStatus = false;
                    switch (invoiceType) {
                        case 1: that.stateValid.timeMaterialInvoice = false; break;
                        case 2: that.stateValid.expensemanagement = false; break;
                    }
                }
            });

            return vStatus;
        };

        AssignmentValidationService.prototype.validateRecipient = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //UserProfileId
            if (populateBrokenRules) { entity.BrokenRules.UserProfileId = []; }
            if (!entity.UserProfileId || entity.UserProfileId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.UserProfileId = ['Recipient must be selected']; }
            }

            //DeliveryMethodId
            if (populateBrokenRules) { entity.BrokenRules.DeliveryMethodId = []; }
            if (!entity.DeliveryMethodId || entity.DeliveryMethodId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.DeliveryMethodId = ['Delivery Method must be selected']; }
            }

            //RecipientTypeId
            if (populateBrokenRules) { entity.BrokenRules.RecipientTypeId = []; }
            if (!entity.RecipientTypeId || entity.RecipientTypeId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.RecipientTypeId = ['Recipient Type must be selected']; }
            }

            return vStatus;
        };

        AssignmentValidationService.prototype.validateBillingInvoice = function (entity, populateBrokenRules, validateCompliance, invoiceType, methodology, isUsesProject) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            // check for the same type
            if (invoiceType !== null && invoiceType !== undefined) {
                if (invoiceType !== entity.InvoiceTypeId) {
                    return true;
                }
            }

            //
            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //BillingFrequencyId
            if (populateBrokenRules) { entity.BrokenRules.BillingFrequencyId = []; }
            if (!entity.BillingFrequencyId || entity.BillingFrequencyId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.BillingFrequencyId = ['Billing Frequency must be selected']; }
            }

            if (validateCompliance) {
                //BillingInvoiceTemplateId
                if (populateBrokenRules) { entity.BrokenRules.BillingInvoiceTemplateId = []; }
                if (!entity.BillingInvoiceTemplateId || entity.BillingInvoiceTemplateId === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.BillingInvoiceTemplateId = ['Billing Invoice Template must be selected']; }
                }

                //BillingInvoiceTermsId
                if (populateBrokenRules) { entity.BrokenRules.BillingInvoiceTermsId = []; }
                if (!entity.BillingInvoiceTermsId || entity.BillingInvoiceTermsId === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.BillingInvoiceTermsId = ['Billing Terms must be selected']; }
                }

                //BillingInvoicePresentationStyleId
                if (populateBrokenRules) { entity.BrokenRules.BillingInvoicePresentationStyleId = []; }
                if (!entity.BillingInvoicePresentationStyleId || entity.BillingInvoicePresentationStyleId === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.BillingInvoicePresentationStyleId = ['Billing Invoicing Type must be selected']; }
                }

                if (entity.BillingInvoicePresentationStyleId == ApplicationConstants.BillingInvoicePresentationStyles.Consolidated) {
                    //BillingConsolidationTypeId
                    if (populateBrokenRules) { entity.BrokenRules.BillingConsolidationTypeId = []; }
                    if (!entity.BillingConsolidationTypeId || entity.BillingConsolidationTypeId === 0) {
                        vStatus = false;
                        if (populateBrokenRules) { entity.BrokenRules.BillingConsolidationTypeId = ['Billing Consolidation Type must be selected']; }
                    }
                }
            }

            //IsSalesTaxAppliedOnVmsImport
            if (populateBrokenRules) { entity.BrokenRules.IsSalesTaxAppliedOnVmsImport = []; }
            if (invoiceType == 2 && methodology === ApplicationConstants.ExpenseMethodology.ThirdPartyImport && !(entity.IsSalesTaxAppliedOnVmsImport === true || entity.IsSalesTaxAppliedOnVmsImport === false)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.IsSalesTaxAppliedOnVmsImport = ['"Add Bill Taxes for Expenses on Import" must be selected']; }
            }

            //BillingTransactionGenerationMethodId
            if (methodology === 1  /*Online*/ || methodology === 2 /*Offline*/) {

                if (populateBrokenRules) { entity.BrokenRules.BillingTransactionGenerationMethodId = []; }

                if (isUsesProject === true) {
                    if (!entity.BillingTransactionGenerationMethodId || entity.BillingTransactionGenerationMethodId === 0) {
                        vStatus = false;
                        if (populateBrokenRules) { entity.BrokenRules.BillingTransactionGenerationMethodId = ['"Timesheet Billing" must be selected']; }
                    }

                } else {

                    if (entity.BillingTransactionGenerationMethodId != null && entity.BillingTransactionGenerationMethodId !== 0) {
                        vStatus = false;
                        if (populateBrokenRules) { entity.BrokenRules.BillingTransactionGenerationMethodId = ['"Timesheet Billing" must be null']; }
                    }

                }

            }

            //BillingRecipients
            angular.forEach(entity.BillingRecipients, function (billingRecipient) {
                billingRecipient.BrokenRules = billingRecipient.BrokenRules || {};
                if (!that.validateRecipient(billingRecipient, populateBrokenRules)) {
                    vStatus = false;
                    switch (invoiceType) {
                        case 1: that.stateValid.timeMaterialInvoice = false; break;
                        case 2: that.stateValid.expensemanagement = false; break;
                    }

                }
            });


            return vStatus;
        };

        AssignmentValidationService.prototype.validatePaymentInvoice = function (entity, populateBrokenRules, validateCompliance, invoiceType, methodology) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            // check for the same type
            if (invoiceType !== null && invoiceType !== undefined) {
                if (invoiceType !== entity.InvoiceTypeId) {
                    return true;
                }
            }

            //
            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //PaymentInvoiceTermsId
            if (populateBrokenRules) { entity.BrokenRules.PaymentInvoiceTermsId = []; }
            if (!entity.PaymentInvoiceTermsId || entity.PaymentInvoiceTermsId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.PaymentInvoiceTermsId = ['Payment Terms must be selected']; }
            }

            //IsSalesTaxAppliedOnVmsImport
            if (populateBrokenRules) { entity.BrokenRules.IsSalesTaxAppliedOnVmsImport = []; }
            if (invoiceType == 2 && methodology === ApplicationConstants.ExpenseMethodology.ThirdPartyImport && !(entity.IsSalesTaxAppliedOnVmsImport === true || entity.IsSalesTaxAppliedOnVmsImport === false)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.IsSalesTaxAppliedOnVmsImport = ['Add Pay Taxes for Expenses on Import must be selected']; }
            }

            //PaymentReleaseScheduleId
            if (populateBrokenRules) { entity.BrokenRules.PaymentReleaseScheduleId = []; }
            if (
                !entity.PaymentInvoiceTermsId && entity.PaymentInvoiceTermsId == ApplicationConstants.PaymentInvoiceTerms.ScheduledTerms &&
                (!entity.PaymentReleaseScheduleId || entity.PaymentReleaseScheduleId === 0)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.PaymentReleaseScheduleId = ['Payment Release Schedule must be selected']; }
            }

            //PaymentFrequency
            if (populateBrokenRules) { entity.BrokenRules.PaymentFrequency = []; }
            if (
                !entity.PaymentInvoiceTermsId && entity.PaymentInvoiceTermsId == ApplicationConstants.PaymentInvoiceTerms.Term &&
                (!entity.PaymentFrequency || entity.PaymentFrequency === 0)) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.PaymentFrequency = ['Payment Frequency must be inserted']; }
            }

            //PaymentInvoiceTemplateId
            if (populateBrokenRules) { entity.BrokenRules.PaymentInvoiceTemplateId = []; }
            if (!entity.PaymentInvoiceTemplateId || entity.PaymentInvoiceTemplateId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.PaymentInvoiceTemplateId = ['Invoice Template must be selected']; }
            }

            //PaymentMethodId
            if (validateCompliance) {
                if (populateBrokenRules) { entity.BrokenRules.PaymentMethodId = []; }
                if (!entity.PaymentMethodId || entity.PaymentMethodId === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.PaymentMethodId = ['Payment Method must be selected']; }
                }
            }

            return vStatus;
        };

        AssignmentValidationService.prototype.validatePartyRate = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //RateTypeId
            if (populateBrokenRules) { entity.BrokenRules.RateTypeId = []; }
            if (!entity.RateTypeId || entity.RateTypeId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.RateTypeId = ['Rate Type must be selected']; }
            }

            //Rate
            if (populateBrokenRules) { entity.BrokenRules.Rate = []; }
            if (entity.Rate === undefined || entity.Rate === null) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.Rate = ['Rate must be inserted']; }
            }

            //RateUnitId
            if (populateBrokenRules) { entity.BrokenRules.RateUnitId = []; }
            if (!entity.RateUnitId || entity.RateUnitId === 0) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.RateUnitId = ['Rate Unit must be selected']; }
            }

            return vStatus;
        };

        AssignmentValidationService.prototype.validateSalesTax = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            return vStatus;
        };

        AssignmentValidationService.prototype.validatePaymentSourceDeductions = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //IsApplied
            if (populateBrokenRules) { entity.BrokenRules.IsApplied = []; }
            if (entity.IsApplied === null || typeof (entity.IsApplied) === 'undefined') {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.SubDivisionId = ['IsApplied must be selected']; }
            }

            //SourceDeductionTypeId
            if (populateBrokenRules) { entity.BrokenRules.SourceDeductionTypeId = []; }
            if (!entity.SourceDeductionTypeId || entity.SourceDeductionTypeId === null) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.SubDivisionId = ['SourceDeductionTypeId must be selected']; }
            }

            return vStatus;
        };

        AssignmentValidationService.prototype.validatePaymentOtherEarnings = function (entity, populateBrokenRules) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }

            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            //IsApplied
            if (populateBrokenRules) { entity.BrokenRules.IsApplied = []; }
            if (entity.IsApplied === null || typeof (entity.IsApplied) === 'undefined') {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.SubDivisionId = ['IsApplied must be selected']; }
            }

            //PaymentOtherEarningTypeId
            if (populateBrokenRules) { entity.BrokenRules.PaymentOtherEarningTypeId = []; }
            if (!entity.PaymentOtherEarningTypeId || entity.PaymentOtherEarningTypeId === null) {
                vStatus = false;
                if (populateBrokenRules) { entity.BrokenRules.SubDivisionId = ['PaymentOtherEarningTypeId must be selected']; }
            }

            return vStatus;
        };

        AssignmentValidationService.prototype.validate = function (organizationIdInternal, userProfileIdWorker, workerProfileTypeId, workOrder, entity, stateName, populateBrokenRules, lists) {
            var that = this;
            var vStatus = true;
            populateBrokenRules = (populateBrokenRules === undefined) ? true : populateBrokenRules;

            if (!entity) { return false; }
            if (!entity.BrokenRules) { entity.BrokenRules = {}; }

            entity.BrokenRules = entity.BrokenRules || {};

            var validateCompliance = entity.ValidateComplianceDraft;

            //BillingInvoice
            angular.forEach(entity.BillingInfoes, function (billingInfo) {
                billingInfo.BrokenRules = billingInfo.BrokenRules || {};
                angular.forEach(billingInfo.BillingInvoices, function (billingInvoice) {
                    billingInvoice.BrokenRules = billingInvoice.BrokenRules || {};
                });

            });

            //PaymentInvoice
            angular.forEach(entity.PaymentInfoes, function (paymentInfo) {
                paymentInfo.BrokenRules = paymentInfo.BrokenRules || {};
            });

            if (stateName == 'all' || stateName == that.edit.core) {
                that.stateValid.core = true;

                if (populateBrokenRules) { entity.BrokenRules.OrganizationId = []; }
                if (!organizationIdInternal || organizationIdInternal === 0) {
                    vStatus = false;
                    if (populateBrokenRules) { entity.BrokenRules.OrganizationId.push('Internal Company must be selected'); }
                }
                if (!that.validateCore(workOrder, entity, populateBrokenRules)) {
                    vStatus = false;
                    that.stateValid.core = false;
                }

            }
            if (stateName == 'all' || stateName == that.edit.partiesAndRates) {
                that.stateValid.partiesAndRates = true;

                //BillingParties
                angular.forEach(entity.BillingInfoes, function (billingInfo) {
                    billingInfo.BrokenRules = billingInfo.BrokenRules || {};
                    if (!that.validateBillingParty(billingInfo, populateBrokenRules)) {
                        vStatus = false;
                        that.stateValid.partiesAndRates = false;
                    }
                });

                //Assignment.UserProfileId
                if (populateBrokenRules) { entity.BrokenRules.AssignmentUserProfileId = []; }
                if (!userProfileIdWorker || userProfileIdWorker === 0) {
                    vStatus = false;
                    that.stateValid.partiesAndRates = false;
                    if (populateBrokenRules) { entity.BrokenRules.AssignmentUserProfileId = ['A worker must be selected for the work order']; }
                }

                //payParties
                angular.forEach(entity.PaymentInfoes, function (paymentInfo) {
                    paymentInfo.BrokenRules = paymentInfo.BrokenRules || {};
                    if (!that.validatePaymentParty(paymentInfo, populateBrokenRules, workerProfileTypeId)) {
                        vStatus = false;
                        that.stateValid.partiesAndRates = false;
                    }
                });

            }
            if (stateName == 'all' || stateName == that.edit.timeMaterialInvoice) {
                that.stateValid.timeMaterialInvoice = true;

                (function () {

                    //TimeSheetMethodologyId
                    if (populateBrokenRules) { entity.BrokenRules.TimeSheetMethodologyId = []; }
                    if (entity.TimeSheetMethodologyId === undefined || entity.TimeSheetMethodologyId === null) {
                        vStatus = false;
                        that.stateValid.timeMaterialInvoice = false;
                        if (populateBrokenRules) { entity.BrokenRules.TimeSheetMethodologyId = ['"Timecard Methodology" must be selected']; }
                    }

                    //TimeSheetCycleId
                    if (that.isPropertyValidForTimeSheetMethodology('TimeSheetCycleId', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.TimeSheetCycleId = []; }
                        if (!entity.TimeSheetCycleId || entity.TimeSheetCycleId === 0) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                            if (populateBrokenRules) { entity.BrokenRules.TimeSheetCycleId = ['"Timecard Cycle" must be selected']; }
                        }
                    }

                    //TimeSheetApprovalFlowId
                    if (that.isPropertyValidForTimeSheetMethodology('TimeSheetApprovalFlowId', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.TimeSheetApprovalFlowId = []; }
                        if (entity.TimeSheetApprovalFlowId === undefined || entity.TimeSheetApprovalFlowId === null) {
                            if (entity.TimeSheetApprovers > 1) { // allow null when TimeSheetApprovers.length < 2
                                vStatus = false;
                                that.stateValid.timeMaterialInvoice = false;
                                if (populateBrokenRules) { entity.BrokenRules.TimeSheetApprovalFlowId = ['"Timecard Approval Flow" must be selected']; }
                            }
                        }
                    }

                    //IsTimeSheetUsesProjects
                    if (that.isPropertyValidForTimeSheetMethodology('IsTimeSheetUsesProjects', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsTimeSheetUsesProjects = []; }
                        if (entity.IsTimeSheetUsesProjects === undefined || entity.IsTimeSheetUsesProjects === null) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsTimeSheetUsesProjects = ['"Timecard Uses Projects" must be selected']; }
                        }
                    }

                    //VmsWorkOrderReference
                    if (that.isPropertyValidForTimeSheetMethodology('VmsWorkOrderReference', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.VmsWorkOrderReference = []; }
                        if (entity.VmsWorkOrderReference === undefined || entity.VmsWorkOrderReference === null) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                            if (populateBrokenRules) { entity.BrokenRules.VmsWorkOrderReference = ['"Third Party Worker ID" must be entered']; }
                        }
                    }

                    //IsDisplayEstimatedInvoiceAmount
                    if (that.isPropertyValidForTimeSheetMethodology('IsDisplayEstimatedInvoiceAmount', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedInvoiceAmount = []; }
                        if (entity.IsDisplayEstimatedInvoiceAmount === undefined || entity.IsDisplayEstimatedInvoiceAmount === null) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedInvoiceAmount = ['"Display Estimated Invoice Amount" must be selected']; }
                        }
                    }

                    //IsDisplayEstimatedPaymentAmount
                    if (that.isPropertyValidForTimeSheetMethodology('IsDisplayEstimatedPaymentAmount', entity.TimeSheetMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedPaymentAmount = []; }
                        if (entity.IsDisplayEstimatedPaymentAmount === undefined || entity.IsDisplayEstimatedPaymentAmount === null) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedPaymentAmount = ['"Display Estimated Payment Amount" must be selected']; }
                        }
                    }

                    //BillingInvoice
                    angular.forEach(entity.BillingInfoes, function (billingInfo) {
                        billingInfo.BrokenRules = billingInfo.BrokenRules || {};
                        if (!that.validateBillingInfo(billingInfo, populateBrokenRules, validateCompliance, 1 /* invoice type: timesheet */, entity.TimeSheetMethodologyId, entity.IsTimeSheetUsesProjects)) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                        }
                    });

                    //PaymentInvoice
                    angular.forEach(entity.PaymentInfoes, function (paymentInfo) {
                        paymentInfo.BrokenRules = paymentInfo.BrokenRules || {};
                        if (!that.validatePaymentInfo(paymentInfo, populateBrokenRules, validateCompliance, 1 /* invoice type: timesheet */, entity.TimeSheetMethodologyId)) {
                            vStatus = false;
                            that.stateValid.timeMaterialInvoice = false;
                        }
                    });

                })();
            }


            if (stateName == 'all' || stateName == that.edit.expensemanagement) {
                that.stateValid.expensemanagement = true;
                (function () {

                    //ExpenseMethodologyId
                    if (populateBrokenRules) { entity.BrokenRules.ExpenseMethodologyId = []; }
                    if (entity.ExpenseMethodologyId === undefined || entity.ExpenseMethodologyId === null) {
                        vStatus = false;
                        that.stateValid.expensemanagement = false;
                        if (populateBrokenRules) { entity.BrokenRules.ExpenseMethodologyId = ['"Expense Methodology" must be selected']; }
                    }

                    //ExpenseApprovalFlowId
                    if (that.isPropertyValidForExpenseMethodology('ExpenseApprovalFlowId', entity.ExpenseMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.ExpenseApprovalFlowId = []; }
                        if (entity.ExpenseApprovalFlowId === undefined || entity.ExpenseApprovalFlowId === null) {
                            if (entity.ExpenseApprovers > 1) {
                                vStatus = false;
                                that.stateValid.expensemanagement = false;
                                if (populateBrokenRules) { entity.BrokenRules.ExpenseApprovalFlowId = ['"Expense Approval Flow" must be selected']; }
                            }
                        }

                        // if Online there must be one client approver
                        if (entity.ExpenseApprovalFlowId === 1) {

                            if (populateBrokenRules) { entity.BrokenRules.ExpenseApprovers = []; }
                            if (entity.ExpenseApprovers.length > 0) {

                                var hasClientApprver = false;

                                angular.forEach(entity.ExpenseApprovers, function (approver) {
                                    if (approver.ApproverTypeId == 1 && approver.ApproverTypeId && approver.UserProfile) {

                                        hasClientApprver = true;

                                    }
                                });
                                if (!hasClientApprver) {
                                    if (populateBrokenRules) { entity.BrokenRules.ExpenseApprovers = ['"Client Approver" is when Expense Methodology is Online']; }
                                }

                            }

                        }

                    }

                    //IsExpenseUsesProjects
                    if (that.isPropertyValidForTimeSheetMethodology('IsExpenseUsesProjects', entity.ExpenseMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsExpenseUsesProjects = []; }
                        if (entity.IsExpenseUsesProjects === undefined || entity.IsExpenseUsesProjects === null) {
                            vStatus = false;
                            that.stateValid.expensemanagement = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsExpenseUsesProjects = ['"Expense Uses Projects" must be selected']; }

                        }
                    }

                    //ExpenseThirdPartyWorkerReference
                    if (that.isPropertyValidForExpenseMethodology('ExpenseThirdPartyWorkerReference', entity.ExpenseMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.VmsWorkOrderReference = []; }
                        if (entity.ExpenseThirdPartyWorkerReference === undefined || entity.ExpenseThirdPartyWorkerReference === null) {
                            vStatus = false;
                            that.stateValid.expensemanagement = false;
                            if (populateBrokenRules) { entity.BrokenRules.ExpenseThirdPartyWorkerReference = ['"Third Party Worker ID" must be entered']; }
                        }
                    }

                    //IsDisplayEstimatedInvoiceAmount
                    if (that.isPropertyValidForExpenseMethodology('IsDisplayEstimatedInvoiceAmount', entity.ExpenseMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedInvoiceAmount = []; }
                        if (entity.IsDisplayEstimatedInvoiceAmount === undefined || entity.IsDisplayEstimatedInvoiceAmount === null) {
                            vStatus = false;
                            that.stateValid.expensemanagement = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedInvoiceAmount = ['"Display Estimated Invoice Amount" must be selected']; }
                        }
                    }

                    //IsDisplayEstimatedPaymentAmount
                    if (that.isPropertyValidForExpenseMethodology('IsDisplayEstimatedPaymentAmount', entity.ExpenseMethodologyId)) {
                        if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedPaymentAmount = []; }
                        if (entity.IsDisplayEstimatedPaymentAmount === undefined || entity.IsDisplayEstimatedPaymentAmount === null) {
                            vStatus = false;
                            that.stateValid.expensemanagement = false;
                            if (populateBrokenRules) { entity.BrokenRules.IsDisplayEstimatedPaymentAmount = ['"Display Estimated Payment Amount" must be selected']; }
                        }
                    }

                    //BillingInvoice
                    angular.forEach(entity.BillingInfoes, function (billingInfo) {
                        billingInfo.BrokenRules = billingInfo.BrokenRules || {};
                        // do not validate if expense methodology is "No Expense"
                        if (entity.ExpenseMethodologyId != 4) {
                            if (!that.validateBillingInfo(billingInfo, populateBrokenRules, validateCompliance, 2 /* invoice type: expense */, entity.ExpenseMethodologyId, entity.IsExpenseUsesProjects)) {
                                vStatus = false;
                                that.stateValid.expensemanagement = false;
                            }
                        }
                    });

                    //PaymentInvoice
                    angular.forEach(entity.PaymentInfoes, function (paymentInfo) {
                        paymentInfo.BrokenRules = paymentInfo.BrokenRules || {};
                        // do not validate if expense methodology is "No Expense"
                        if (entity.ExpenseMethodologyId != 4) {
                            if (!that.validatePaymentInfo(paymentInfo, populateBrokenRules, validateCompliance, 2 /* invoice type: expense */, entity.ExpenseMethodologyId)) {
                                vStatus = false;
                                that.stateValid.expensemanagement = false;
                            }
                        }
                    });



                })();

            }
            if (stateName == 'all' || stateName == that.edit.purchaseorder) {
                that.stateValid.purchaseorder = true;
            }
            if (stateName == 'all' || stateName == that.edit.earningsanddeductions) {
                that.stateValid.earningsanddeductions = true;

                if (validateCompliance) {
                    angular.forEach(entity.PaymentInfoes, function (paymentInfo) {
                        if (workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp || workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                            //SubdivisionIdSourceDeduction
                            if (populateBrokenRules) { entity.BrokenRules.SubdivisionIdSourceDeduction = []; }
                            if (paymentInfo.OrganizationIdSupplier === null && (!paymentInfo.SubdivisionIdSourceDeduction || paymentInfo.SubdivisionIdSourceDeduction === '0')) {
                                vStatus = false;
                                that.stateValid.earningsanddeductions = false;
                                if (populateBrokenRules) { entity.BrokenRules.SubdivisionIdSourceDeduction = ['SubdivisionIdSourceDeduction must be selected']; }
                            }
                        }
                        angular.forEach(paymentInfo.PaymentOtherEarnings, function (paymentOtherEarning) {
                            if (!that.validatePaymentOtherEarnings(paymentOtherEarning, populateBrokenRules)) {
                                vStatus = false;
                                that.stateValid.earningsanddeductions = false;
                            }
                        });
                    });

                    if (populateBrokenRules) {
                        entity.BrokenRules.WCBSubdivisionDetailId = [];
                    }
                    if ((lists && lists.wcbCodeList && lists.wcbCodeList.length > 0) && (entity.WorkerCompensationId === undefined || entity.WorkerCompensationId === null || entity.WorkerCompensationId === 0)) {
                        vStatus = false;
                        that.stateValid.earningsanddeductions = false;
                        if (populateBrokenRules) {
                            entity.BrokenRules.WCBSubdivisionDetailId = ['WCB Code must be selected'];
                        }
                    }

                    if (populateBrokenRules) {
                        entity.BrokenRules.WCBIsApplied = [];
                    }
                    if ((lists && lists.wcbCodeList && lists.wcbCodeList.length > 0) && (entity.WCBIsApplied === undefined || entity.WCBIsApplied === null)) {
                        vStatus = false;
                        that.stateValid.earningsanddeductions = false;
                        if (populateBrokenRules) {
                            entity.BrokenRules.WCBIsApplied = ['Is WCB Applied must be selected'];
                        }
                    }
                }
            }
            if (stateName == 'all' || stateName == that.edit.taxes) {
                that.stateValid.taxes = true;

                if (validateCompliance) {
                    //BillingInfo
                    angular.forEach(entity.BillingInfoes, function (billingInfo) {

                        //SubdivisionIdSalesTax
                        if (!billingInfo.SubdivisionIdSalesTax || billingInfo.SubdivisionIdSalesTax === 0) {
                            vStatus = false;
                            that.stateValid.taxes = false;
                            if (populateBrokenRules) { billingInfo.BrokenRules.SubdivisionIdSalesTax = ['SubdivisionIdSalesTax must be selected']; }
                        }

                        //BillingSalesTaxes
                        angular.forEach(billingInfo.BillingSalesTaxes, function (billingSalesTax) {
                            billingSalesTax.BrokenRules = billingSalesTax.BrokenRules || {};
                            if (!that.validateSalesTax(billingSalesTax, populateBrokenRules)) {
                                vStatus = false;
                                that.stateValid.taxes = false;
                            }
                        });
                    });

                    //PaymentInfo
                    angular.forEach(entity.PaymentInfoes, function (paymentInfo) {

                        //SubdivisionIdSalesTax
                        if ((paymentInfo.OrganizationIdSupplier > 0 || workerProfileTypeId != ApplicationConstants.UserProfileType.WorkerTemp) && (!paymentInfo.SubdivisionIdSalesTax || paymentInfo.SubdivisionIdSalesTax === 0)) {
                            if (workerProfileTypeId != ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 && workerProfileTypeId != ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
                                vStatus = false;
                                that.stateValid.taxes = false;
                                if (populateBrokenRules) { paymentInfo.BrokenRules.SubdivisionIdSalesTax = ['SubdivisionIdSalesTax must be selected']; }
                            }
                        }
                    });
                }
            }

            that.stateValid.all = that.stateValid.core && that.stateValid.partiesAndRates && that.stateValid.timeMaterialInvoice && that.stateValid.expensemanagement && that.stateValid.purchaseorder && that.stateValid.earningsanddeductions && that.stateValid.taxes;

            return vStatus;
        };

        AssignmentValidationService.prototype.stateIsValid = function (entity, stateName) {
            var that = this;
            if (stateName == that.edit.core) {
                that.validate(entity, stateName, false);
            }
            if (stateName == that.edit.partiesAndRates) {
                that.validate(entity, stateName, false);
            }
            if (stateName == that.edit.timeMaterialInvoice) {
                that.validate(entity, stateName, false);
            }
        };

        AssignmentValidationService.prototype.isPropertyValidForTimeSheetMethodology = function (property, timeSheetMethodologyId) {

            var methodology = {
                "OnlineApproval": 1,
                "OfflineApproval": 2,
                "ThirdPartyImport": 3,
                "NoTimecard": 4
            };

            switch (property) {

                // Time
                case 'TimeSheetCycleId': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval, methodology.ThirdPartyImport);
                case 'TimeSheetApprovalFlowId': return inMethodology(methodology.OnlineApproval);
                case 'TimeSheetApprovers': return inMethodology(methodology.OnlineApproval);
                case 'IsTimeSheetUsesProjects': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'BillingTransactionGenerationMethodId': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'VmsWorkOrderReference': return inMethodology(methodology.ThirdPartyImport);
                case 'IsDisplayEstimatedInvoiceAmount': return inMethodology(methodology.OnlineApproval);
                case 'IsDisplayEstimatedPaymentAmount': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval, methodology.ThirdPartyImport);
                case 'TimeSheetDescription': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);

            }

            function inMethodology() {
                return Array.prototype.slice.call(arguments).indexOf(timeSheetMethodologyId) > -1;
            }

        };

        AssignmentValidationService.prototype.isPropertyValidForExpenseMethodology = function (property, timeSheetMethodologyId) {

            var methodology = {
                "OnlineApproval": 1,
                "OfflineApproval": 2,
                "ThirdPartyImport": 3,
                "NoTimecard": 4
            };

            switch (property) {

                case 'ExpenseApprovalFlowId': return inMethodology(methodology.OnlineApproval);
                case 'ExpenseApprovers': return inMethodology(methodology.OnlineApproval);
                case 'IsExpenseUsesProjects': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'BillingTransactionGenerationMethodId': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'IsExpenseRequiresOriginal': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'ExpenseWorkOrderReference': return inMethodology(methodology.ThirdPartyImport);
                case 'ExpenseThirdPartyWorkerReference': return inMethodology(methodology.ThirdPartyImport);
                case 'TimeSheetDescription': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'ExpenseDescription': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval);
                case 'BillingInvoice': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval, methodology.ThirdPartyImport);
                case 'PaymentInvoice': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval, methodology.ThirdPartyImport);
                case 'configurationAndDescriptors': return inMethodology(methodology.OnlineApproval, methodology.OfflineApproval, methodology.ThirdPartyImport);

            }

            function inMethodology() {
                return Array.prototype.slice.call(arguments).indexOf(timeSheetMethodologyId) > -1;
            }

        };

        return new AssignmentValidationService();
    }]);
}(Phoenix.Services));