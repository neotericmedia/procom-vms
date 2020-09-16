(function (services) {
    'use strict';

    var serviceId = 'AssignmentCommonFunctionalityService';
    
    const WORK_ORDER_STATUS = ApplicationConstants.WorkOrderStatus;

    services.factory(serviceId, ['$sce', '$q', 'common', 'dialogs', 'AssignmentApiService', 'OrgApiService', 'PayrollApiService', 'phoenixapi', AssignmentCommonFunctionalityService]);

    function AssignmentCommonFunctionalityService($sce, $q, common, dialogs, AssignmentApiService, OrgApiService, PayrollApiService, phoenixapi) {

        common.setControllerName(serviceId);

        var service = {
            getWorker: getWorker,
            onChangeWorkerId: onChangeWorkerId,
            getSubDivisionSourceDeductions: getSubDivisionSourceDeductions,
            getPaymentOtherEarnings: getPaymentOtherEarnings,
            onChangeOrganizationIdClient: onChangeOrganizationIdClient,
            getBillingSalesTaxes: getBillingSalesTaxes,
            getPaymentSalesTaxes: getPaymentSalesTaxes,
            getAssignmentWithTemplate: getAssignmentWithTemplate,
            removeInactiveProfile: removeInactiveProfile,
            downloadT4: downloadT4,
            downloadT4A: downloadT4A,
            getWorkOrderVersionEndDate: getWorkOrderVersionEndDate,
            getWorkOrderEndDate: getWorkOrderEndDate
        };

        return service;

        function getAssignmentWithTemplate(template) {
            var d = AssignmentApiService.defaultAssignment();
            var temp = _.defaultsDeep({}, template, d);
            return temp;
        }

        function getWorker(assignment, listUserProfileWorker) {

            var worker = null;
            if (assignment.UserProfileIdWorker > 0) {
                worker = _.find(listUserProfileWorker, function (w) {
                    return (w.Id == assignment.UserProfileIdWorker);
                });
                if (typeof worker !== 'undefined') {
                    assignment.workerProfileTypeId = worker.ProfileTypeId;
                    assignment.workerContactId = worker.ContactId;
                }
                else {
                    dialogs.notify('Wrong Worker User Profile', 'Worker User Profile with id "' + assignment.UserProfileIdWorker + '" is broken or does not exists', { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                    assignment.workerProfileTypeId = null;
                    worker = null;
                }
            }
            else {
                assignment.workerProfileTypeId = null;
                assignment.workerContactId = null;
            }
            return worker;
        }

        function getPaymentOtherEarnings(assignment, paymentInfo, userProfileWorkerOtherEarnings, listUserProfileWorker) {
            paymentInfo.PaymentOtherEarnings = [];
            if (paymentInfo.OrganizationIdSupplier !== null) {
                dialogs.notify('PaymentOtherEarnings must apply only for NULL OrganizationIdSupplier', message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                return;
            }

            if (!userProfileWorkerOtherEarnings) {
                var worker = getWorker(assignment, listUserProfileWorker);
                if (worker.OrganizationId === null && (assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp)) {
                    userProfileWorkerOtherEarnings = worker.UserProfileWorkerOtherEarnings;
                }
            }

            if (assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp && userProfileWorkerOtherEarnings && userProfileWorkerOtherEarnings.length > 0) {

                var userProfileWorkerPaymentOtherEarningTypeVacationPay = _.find(userProfileWorkerOtherEarnings, function (userProfileWorkerOtherEarning) {
                    return userProfileWorkerOtherEarning.PaymentOtherEarningTypeId == ApplicationConstants.PaymentOtherEarningType.VacationPay;
                });
                if (typeof userProfileWorkerPaymentOtherEarningTypeVacationPay !== 'undefined' && userProfileWorkerPaymentOtherEarningTypeVacationPay !== null && !common.isEmptyObject(userProfileWorkerPaymentOtherEarningTypeVacationPay)) {
                    var paymentOtherEarning = {
                        PaymentOtherEarningTypeId: userProfileWorkerPaymentOtherEarningTypeVacationPay.PaymentOtherEarningTypeId,
                        IsApplied: userProfileWorkerPaymentOtherEarningTypeVacationPay.IsApplied,
                        IsAccrued: userProfileWorkerPaymentOtherEarningTypeVacationPay.IsAccrued,
                        RatePercentage: userProfileWorkerPaymentOtherEarningTypeVacationPay.IsApplied ? userProfileWorkerPaymentOtherEarningTypeVacationPay.RatePercentage : null,
                    };
                    paymentInfo.PaymentOtherEarnings.push(paymentOtherEarning);
                }
            } else {
                paymentInfo.PaymentOtherEarnings = [];
            }
        }

        function onChangeWorkerId(assignment, paymentInfo, listUserProfileWorker, firstInstanceOfBillingInfoesHours) {
            var promises = [];
            if (assignment.UserProfileIdWorker && assignment.UserProfileIdWorker > 0) {
                var worker = getWorker(assignment, listUserProfileWorker);
                if (worker) {
                    if (worker.OrganizationId > 0) {
                        paymentInfo.OrganizationIdSupplier = worker.OrganizationId;
                        var oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'DefaultTaxSubdivisionId']).url();
                        promises.push(OrgApiService.getByOrganizationId(worker.OrganizationId, oDataParams).then(function (organizationSupplier) {
                            paymentInfo.OrganizationSupplierDisplayName = organizationSupplier.DisplayName;
                            paymentInfo.SubdivisionIdSalesTax = organizationSupplier.DefaultTaxSubdivisionId;
                        }));
                        paymentInfo.Hours = firstInstanceOfBillingInfoesHours;// $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours;

                        promises.push(AssignmentApiService.getListOrganizationSupplier({ id: paymentInfo.OrganizationIdSupplier }).then(function (responseItems) {
                            paymentInfo.Organization = {};
                            paymentInfo.Organization.OrganizationIndependentContractorRoles = [];
                            angular.forEach(responseItems, function (independentcontractorRole) {
                                paymentInfo.Organization.OrganizationIndependentContractorRoles.push(independentcontractorRole);
                            });
                        }));

                        promises.push(AssignmentApiService.getProfilesListByOrganizationId(paymentInfo.OrganizationIdSupplier).then(function (responseItems) {
                            paymentInfo.profilesListForPaymentOrganization = responseItems;
                            paymentInfo.UserProfileIdSupplier = paymentInfo.UserProfileIdSupplier || worker.UserProfileIdOrgRep;
                        }));
                    }
                    else if (worker.OrganizationId === null && (assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp || assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp || assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2)) {
                        paymentInfo.PaymentContacts = [];
                        paymentInfo.Organization = {};
                        paymentInfo.OrganizationIdSupplier = null;
                        paymentInfo.OrganizationSupplierDisplayName = worker.PayeeName;
                        paymentInfo.profilesListForPaymentOrganization = [worker];

                        if (worker.TaxSubdivisionId) {
                            paymentInfo.SubdivisionIdSourceDeduction = worker.TaxSubdivisionId;
                        }
                        else
                            //  Product Backlog Item 15517:Default source deduction on work order based on SP or Temp address
                            if (worker.UserProfileAddresses.length > 0) {
                                paymentInfo.SubdivisionIdSourceDeduction = worker.UserProfileAddresses[0].SubdivisionId;
                            }
                            else {
                                common.logError('Selected Worker SP or Temp or W2 MUST have Address');
                                paymentInfo.SubdivisionIdSourceDeduction = null;//Validation rules works on '= null' only.
                            }

                        paymentInfo.UserProfileIdSupplier = worker.Id;
                        paymentInfo.PaymentMethodId = worker.PaymentMethodId;
                        promises.push(getSubDivisionSourceDeductions(assignment, paymentInfo, worker.UserProfileWorkerSourceDeductions, listUserProfileWorker));

                        if (assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                            promises.push(getPaymentOtherEarnings(assignment, paymentInfo, worker.UserProfileWorkerOtherEarnings, listUserProfileWorker));
                            paymentInfo.SubdivisionIdSalesTax = null;
                        }
                    }
                }
            }
            return $q.all(promises);
        }

        function getSubDivisionSourceDeductions(assignment, paymentInfo, userProfileWorkerSourceDeductions, listUserProfileWorker) {

            if (paymentInfo.OrganizationIdSupplier !== null) {
                dialogs.notify('SubDivisionSourceDeductions must apply only for NULL OrganizationIdSupplier', message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
                return;
            }

            if (typeof paymentInfo.PaymentSourceDeductions === 'undefined') {
                paymentInfo.PaymentSourceDeductions = [];
            }

            var promises = [];
            if (!userProfileWorkerSourceDeductions) {
                var worker = getWorker(assignment, listUserProfileWorker);
                if (worker.OrganizationId === null && (assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp || assignment.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp)) {
                    userProfileWorkerSourceDeductions = worker.UserProfileWorkerSourceDeductions;
                }
            }

            if (!paymentInfo.IsUseUserProfileWorkerSourceDeduction && paymentInfo.SubdivisionIdSourceDeduction && paymentInfo.SubdivisionIdSourceDeduction > 0 && userProfileWorkerSourceDeductions && userProfileWorkerSourceDeductions.length > 0) {
                paymentInfo.PaymentSourceDeductions = [];
                var oDataParamsForFederalTax = oreq.request().withSelect(['Id', 'TaxVersionStatusId', 'EffectiveDate']).url();
                promises.push(PayrollApiService.getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId(paymentInfo.SubdivisionIdSourceDeduction, oDataParamsForFederalTax).then(
                    function (responseSucces) {
                        if (responseSucces !== null && responseSucces !== 'null') {
                            angular.forEach(userProfileWorkerSourceDeductions, function (userProfileWorkerSourceDeduction) {
                                if (userProfileWorkerSourceDeduction.SourceDeductionTypeId == ApplicationConstants.SourceDeductionType.FederalTax || userProfileWorkerSourceDeduction.SourceDeductionTypeId == ApplicationConstants.SourceDeductionType.AdditionalTax) {
                                    var paymentSourceDeduction = {
                                        SourceDeductionTypeId: userProfileWorkerSourceDeduction.SourceDeductionTypeId,
                                        IsApplied: userProfileWorkerSourceDeduction.IsApplied,
                                        IsOverWritable: userProfileWorkerSourceDeduction.SourceDeductionTypeId == ApplicationConstants.SourceDeductionType.AdditionalTax ? true : false,
                                        ToShow: true,
                                        RatePercentage: userProfileWorkerSourceDeduction.RatePercentage === 0 ? null : userProfileWorkerSourceDeduction.RatePercentage,
                                        RateAmount: userProfileWorkerSourceDeduction.RateAmount === 0 ? null : userProfileWorkerSourceDeduction.RateAmount
                                    };
                                    paymentInfo.PaymentSourceDeductions.push(paymentSourceDeduction);
                                }
                            });
                        }
                    },
                    function (responseError) {
                        common.responseErrorMessages(responseError);
                    }));

                //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=15297
                //  Deductions for the province set by the payroll taxes setup 
                //  if deduction set up is yes on the payroll deduction, and no on the profile, set to no 
                //  if deduction set up is yes on the payroll deduction, and yes on the profile, set to yes
                //  if deduction set up is no on the payroll deduction, and yes or no on the profile, set to no and lock from changing to yes
                var oDataParamsForProvincialTaxVersionTaxType = oreq.request().withSelect(['Id', 'ProvincialTaxHeaderId', 'ProvincialTaxHeaderSubdivisionId', 'ProvincialTaxVersionId', 'ProvincialTaxVersionEffectiveDate', 'SourceDeductionTypeId', 'IsEligible', 'EmployeeRatePercentage']).url();
                promises.push(PayrollApiService.getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(paymentInfo.SubdivisionIdSourceDeduction, oDataParamsForProvincialTaxVersionTaxType).then(
                    function (responseSucces) {
                        if (responseSucces !== null && responseSucces !== 'null' && responseSucces.Items !== null) {
                            angular.forEach(userProfileWorkerSourceDeductions, function (userProfileWorkerSourceDeduction) {
                                angular.forEach(responseSucces.Items, function (taxType) {
                                    if (userProfileWorkerSourceDeduction.SourceDeductionTypeId == taxType.SourceDeductionTypeId
                                        && (userProfileWorkerSourceDeduction.SourceDeductionTypeId != ApplicationConstants.SourceDeductionType.FederalTax
                                            || userProfileWorkerSourceDeduction.SourceDeductionTypeId != ApplicationConstants.SourceDeductionType.AdditionalTax)) {
                                        var paymentSourceDeduction = {
                                            SourceDeductionTypeId: userProfileWorkerSourceDeduction.SourceDeductionTypeId,
                                            IsApplied: taxType.IsEligible && userProfileWorkerSourceDeduction.IsApplied,
                                            IsOverWritable: taxType.IsEligible,
                                            ToShow: taxType.IsEligible,
                                            RatePercentage: userProfileWorkerSourceDeduction.RatePercentage === 0 ? null : userProfileWorkerSourceDeduction.RatePercentage,
                                            RateAmount: userProfileWorkerSourceDeduction.RateAmount === 0 ? null : userProfileWorkerSourceDeduction.RateAmount
                                        };
                                        paymentInfo.PaymentSourceDeductions.push(paymentSourceDeduction);
                                    }
                                });
                            });
                        }
                    },
                    function (responseError) {
                        common.responseErrorMessages(responseError);
                    }));
            } else {
                paymentInfo.PaymentSourceDeductions = [];
            }
            return $q.all(promises);
        }

        function onChangeOrganizationIdClient(assignment, billingInfo, listOrganizationClient) {
            var promises = [];
            if (billingInfo.OrganizationIdClient && billingInfo.OrganizationIdClient > 0) {
                var organizationClient = _.find(listOrganizationClient, function (organization) { return organization.Id == billingInfo.OrganizationIdClient; });
                if (organizationClient) {
                    billingInfo.OrganizationClientDisplayName = organizationClient.DisplayName;
                    billingInfo.OrganizationIdClient = parseInt(billingInfo.OrganizationIdClient);

                    //  http://tfs:8080/tfs/DefaultCollection/Development/_workitems#_a=edit&id=15523
                    if (!organizationClient.OrganizationClientRoles || organizationClient.OrganizationClientRoles.length != 1) {
                        return $q(function (resolve, reject) {
                            reject('Client Organization MUST have ONE OrganizationClientRole');
                        });
                    }

                    var currentWorkOrderVersion = assignment && assignment.WorkOrders && assignment.WorkOrders[0] && assignment.WorkOrders[0].WorkOrderVersions && assignment.WorkOrders[0].WorkOrderVersions[0];

                    //billingInfo.orgClientAB = _.map(organizationClient.OrganizationClientRoles[0].OrganizationClientRoleAlternateBills, function (a) { return { id: a.Id, text: a.AlternateBillCode, name: a.AlternateBillLegalName }; });

                    promises.push(OrgApiService.getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(billingInfo.OrganizationIdClient).then(function (data) {
                        var currentOrgClientRoles = data && data.Items;
                        billingInfo.orgClientAB = [];
                        if (currentOrgClientRoles && currentOrgClientRoles.length > 0) {
                            billingInfo.orgClientAB = _.map(currentOrgClientRoles[0].OrganizationClientRoleAlternateBills, function (a) { return { id: a.Id, text: a.AlternateBillCode, name: a.AlternateBillLegalName }; });
                        }
                    }));

                    if (organizationClient.OrganizationClientRoles[0].IsChargeSalesTax === true) {
                        if (organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId == ApplicationConstants.ClientSalesTaxDefault.HeadOffice) {
                            var organizationAddressPrimary = _.find(organizationClient.OrganizationAddresses, function (address) { return address.IsPrimary === true; });
                            if (organizationAddressPrimary !== null && typeof organizationAddressPrimary !== 'undefined') {
                                billingInfo.SubdivisionIdSalesTax = organizationAddressPrimary.SubdivisionId;
                            }
                            else {
                                common.logError('Client Organization MUST have Primary Address');
                                billingInfo.SubdivisionIdSalesTax = 0;
                            }
                        }
                        else if (organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId == ApplicationConstants.ClientSalesTaxDefault.WorkOrderWorksite) {
                            billingInfo.SubdivisionIdSalesTax = AssignmentApiService.getSubdivisionIdByWorksiteId(currentWorkOrderVersion.WorksiteId);
                        }
                        else {
                            common.logError('Client Organization ClientSalesTaxDefaultId "' + organizationClient.OrganizationClientRoles[0].ClientSalesTaxDefaultId + '" does NOT supported');
                        }
                    }
                    else {
                        billingInfo.SubdivisionIdSalesTax = AssignmentApiService.getSubdivisionIdByWorksiteId(currentWorkOrderVersion.WorksiteId);
                    }

                    if (organizationClient.OrganizationClientRoles[0].UsesThirdPartyImport) {
                        currentWorkOrderVersion.TimeSheetMethodologyId = ApplicationConstants.ExpenseMethodology.ThirdPartyImport;

                        if (billingInfo.BillingInvoices && billingInfo.BillingInvoices.length) {
                            for (var i = 0; i < billingInfo.BillingInvoices.length; i++) {
                                var bi = billingInfo.BillingInvoices[i];
                                if (bi.InvoiceTypeId === 2) {
                                    bi.IsSalesTaxAppliedOnVmsImport = organizationClient.OrganizationClientRoles[0].IsBillSalesTaxAppliedOnExpenseImport;
                                }
                            }
                        }
                        var paymentInfoes = currentWorkOrderVersion && currentWorkOrderVersion.PaymentInfoes;
                        if (paymentInfoes && paymentInfoes.length) {
                            var paymentInfo = paymentInfoes[0];
                            if (paymentInfo.PaymentInvoices && paymentInfo.PaymentInvoices.length /* && paymentInfo.paymentSalesTaxes && paymentInfo.paymentSalesTaxes.length */) {
                                for (var i = 0; i < paymentInfo.PaymentInvoices.length; i++) {
                                    var pi = paymentInfo.PaymentInvoices[i];
                                    if (pi.InvoiceTypeId === 2) {
                                        pi.IsSalesTaxAppliedOnVmsImport = organizationClient.OrganizationClientRoles[0].IsPaySalesTaxAppliedOnExpenseImport;
                                    }
                                }
                            }
                        }
                    }

                    promises.push(getBillingSalesTaxes(assignment, billingInfo));
                    promises.push(AssignmentApiService.getProfilesListOrganizational(billingInfo.OrganizationIdClient).then(function (responseItems) {
                        // console.log(responseItems);
                        billingInfo.profilesListForBillingOrganization = responseItems;
                        if (!currentWorkOrderVersion.profilesListForApproval) {
                            currentWorkOrderVersion.profilesListForApproval = {
                                Client: [],
                                Internal: [],
                                Supplier: []
                            };
                        }

                        currentWorkOrderVersion.profilesListForApproval.Client = responseItems;
                    }));
                }
            }
            return $q.all(promises);
        }

        function getBillingSalesTaxes(assignment, billingInfo) {
            var promises = [];
            //   for getSalesTaxVersionRatesBySubdivisionAndOrganization on billingInfo - must be OrganizationIdInternal
            billingInfo.BillingSalesTaxes = [];
            if (billingInfo.SubdivisionIdSalesTax && billingInfo.SubdivisionIdSalesTax > 0 && billingInfo.OrganizationIdClient && billingInfo.OrganizationIdClient > 0 && assignment.OrganizationIdInternal && assignment.OrganizationIdInternal > 0) {
                promises.push(AssignmentApiService.getSalesTaxVersionRatesBySubdivisionAndOrganization(billingInfo.SubdivisionIdSalesTax, assignment.OrganizationIdInternal,
                    oreq.request().withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'IsApplied', 'HasNumberAssigned']).url()).then(
                        function (responseSuccessSalesTaxVersionRates) {
                            promises.push(OrgApiService.getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(billingInfo.OrganizationIdClient).then(function (responseSuccessClientRoles) {
                                var isApplied = responseSuccessClientRoles.Items.length === 0 ? true : false;
                                angular.forEach(responseSuccessClientRoles.Items, function (item) {
                                    if (item.IsChargeSalesTax !== null && typeof item.IsChargeSalesTax !== 'undefined') {
                                        isApplied = isApplied || item.IsChargeSalesTax;
                                    }
                                });

                                var billingSalesTaxes = [];
                                angular.forEach(responseSuccessSalesTaxVersionRates, function (salesTaxVersionRate) {
                                    if (salesTaxVersionRate.IsApplied) {
                                        billingSalesTaxes.push({
                                            SalesTaxId: salesTaxVersionRate.SalesTaxId,
                                            IsApplied: isApplied && salesTaxVersionRate.HasNumberAssigned,
                                            ratePercentage: salesTaxVersionRate.RatePercentage,
                                            hasNumber: salesTaxVersionRate.HasNumberAssigned ? "Yes" : "No",
                                        });
                                    }
                                });
                                billingInfo.BillingSalesTaxes = billingSalesTaxes;
                            }, function (responseError) {
                                common.responseErrorMessages(responseError);
                            }));
                        },
                        function (responseError) {
                            common.responseErrorMessages(responseError);
                        }));
            }
            return $q.all(promises);
        }

        function getPaymentSalesTaxes(assignment, paymentInfo, callback) {
            function setPaymentSalesTaxes(paymentInfo, salesTaxVersionRates) {
                paymentInfo.PaymentSalesTaxes = [];
                angular.forEach(salesTaxVersionRates, function (salesTaxVersionRate) {
                    paymentInfo.PaymentSalesTaxes.push({
                        SalesTaxId: salesTaxVersionRate.SalesTaxId,
                        IsApplied: salesTaxVersionRate.HasNumberAssigned,
                        ratePercentage: salesTaxVersionRate.RatePercentage,
                        hasNumber: salesTaxVersionRate.HasNumberAssigned ? "Yes" : "No",
                    });
                });
            }

            if (paymentInfo.SubdivisionIdSalesTax && paymentInfo.SubdivisionIdSalesTax > 0) {
                if (paymentInfo.OrganizationIdSupplier && paymentInfo.OrganizationIdSupplier > 0) {
                    //   for getSalesTaxVersionRatesBySubdivisionAndOrganization on paymentInfo - must be OrganizationIdSupplier
                    AssignmentApiService.getSalesTaxVersionRatesBySubdivisionAndOrganization(paymentInfo.SubdivisionIdSalesTax, paymentInfo.OrganizationIdSupplier,
                        oreq.request().withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'HasNumberAssigned', 'IsApplied']).url()).then(
                            function (responseSuccessSalesTaxVersionRates) {
                                if (callback) {
                                    callback(paymentInfo, responseSuccessSalesTaxVersionRates);
                                }
                                else {
                                    setPaymentSalesTaxes(paymentInfo, responseSuccessSalesTaxVersionRates);
                                }
                            },
                            function (responseError) {
                                common.responseErrorMessages(responseError);
                            });
                }
                else if (assignment.UserProfileIdWorker) {
                    AssignmentApiService.getSalesTaxVersionRatesBySubdivisionAndUserProfileWorker(paymentInfo.SubdivisionIdSalesTax, assignment.UserProfileIdWorker,
                        oreq.request().withSelect(['Id', 'SalesTaxId', 'RatePercentage', 'HasNumberAssigned', 'IsApplied']).url()).then(
                            function (responseSuccessSalesTaxVersionRates) {
                                if (callback) {
                                    callback(paymentInfo, responseSuccessSalesTaxVersionRates.Items);
                                }
                                else {
                                    setPaymentSalesTaxes(paymentInfo, responseSuccessSalesTaxVersionRates.Items);
                                }
                            },
                            function (responseError) {
                                common.responseErrorMessages(responseError);
                            });
                }
            }
        };

        ///removeInactiveProfile(profileArray, 2,243,355);
        ///removeInactiveProfile(profileArray, [2,243,355]);
        function removeInactiveProfile(profiles, exceptionIds) {
            var inactiveProfileStatusIds = [2, 9, 10]; //Inactive, Pending Inactive, Pending Active

            var exceptionProfileIds = _.uniq(_.isArray(exceptionIds) ? exceptionIds : _.slice(arguments, 1));
            _.remove(profiles, function (profile) {
                return _.indexOf(inactiveProfileStatusIds, profile.ProfileStatusId) > -1 && _.indexOf(exceptionProfileIds, profile.Id) < 0;
            });
        }

        function downloadT4(workOrderVersionId, year) {
            return phoenixapi.url('report/getPdfStreamForT4Slip/' + workOrderVersionId + '/' + year) + '&wmode=transparent';
        }

        function downloadT4A(workOrderVersionId, year) {
            return phoenixapi.url('report/getPdfStreamForT4ASlip/' + workOrderVersionId + '/' + year) + '&wmode=transparent';
        }

        function getWorkOrderVersionEndDate(workOrder, workOrderVersion) {
            var excludedWovStatuses = [WORK_ORDER_STATUS.Replaced, WORK_ORDER_STATUS.Cancelled, WORK_ORDER_STATUS.Discarded];
            var activeWovStatuses = [WORK_ORDER_STATUS.Active, WORK_ORDER_STATUS.Terminated, WORK_ORDER_STATUS.Expired, WORK_ORDER_STATUS.PendingUnterminate];
            
            if (excludedWovStatuses.indexOf(workOrderVersion.StatusId) > -1) {
                return null;
            } 
            else {
                var nextWov = workOrder.WorkOrderVersions
                .filter(function (wov) { 
                    return wov.Id !== workOrderVersion.Id && activeWovStatuses.indexOf(wov.StatusId) > -1 && wov.EffectiveDate > workOrderVersion.EffectiveDate; 
                })
                .sort(function (a, b) {
                    return a.EffectiveDate - b.EffectiveDate;
                })[0];
    
                if (nextWov != null) {
                    return moment(nextWov.EffectiveDate, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD');
                }
                else {
                    return getWorkOrderEndDate(workOrder, workOrderVersion);
                }
            }
        }

        function getWorkOrderEndDate(workOrder, workOrderVersion) {
            if (workOrderVersion.StatusId == WORK_ORDER_STATUS.Terminated) {
                return workOrder.TerminationDate;
            }
            else {
                return workOrderVersion.WorkOrderEndDateState != null 
                ? workOrderVersion.WorkOrderEndDateState
                : workOrder.EndDate;
            }
        }
    }

}(Phoenix.Services));


