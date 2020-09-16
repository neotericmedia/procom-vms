/*global Phoenix: false, console: false*/
(function (angular, app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AssignmentAddRemoveSubentitiesController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('phoenix.workorder.controllers').controller(controllerId,
        ['$scope', '$rootScope', '$state', '$stateParams', '$filter', 'dialogs', 'common', 'AssignmentApiService', 'OrgApiService', 'ProfileApiService', 'PurchaseOrderApiService', 'PayrollApiService', 'AssignmentValidationService', 'AssignmentCommonFunctionalityService', 'phoenixsocket', AssignmentAddRemoveSubentitiesController]);

    function AssignmentAddRemoveSubentitiesController($scope, $rootScope, $state, $stateParams, $filter, dialogs, common, AssignmentApiService, OrgApiService, ProfileApiService, PurchaseOrderApiService, PayrollApiService, AssignmentValidationService, AssignmentCommonFunctionalityService, phoenixsocket) {

        var $timeout = common.$timeout;
        common.setControllerName(controllerId);
        $scope.DeliveryMethod = ApplicationConstants.DeliveryMethod;

        $scope.tabValid = function (stateName) {

            //remove warning icons for workorder template as instructed by steven ng   
            if (stateName.substr(0, 8) === 'template') {
                return true;
            }

            if (false ||
                ((stateName == AssignmentValidationService.edit.core) && $scope.formValid.core) ||
                ((stateName == AssignmentValidationService.edit.partiesAndRates) && $scope.formValid.partiesAndRates) ||
                ((stateName == AssignmentValidationService.edit.timeMaterialInvoice) && $scope.formValid.timeMaterialInvoice) ||
                ((stateName == AssignmentValidationService.edit.expensemanagement) && $scope.formValid.expensemanagement) ||
                ((stateName == AssignmentValidationService.edit.purchaseorder) && $scope.formValid.purchaseorder) ||
                ((stateName == AssignmentValidationService.edit.earningsanddeductions) && $scope.formValid.earningsanddeductions) ||
                ((stateName == AssignmentValidationService.edit.taxes) && $scope.formValid.taxes) ||
                ((stateName == AssignmentValidationService.edit.compliancedocuments) && $scope.formValid.compliancedocuments) ||
                ((stateName == AssignmentValidationService.edit.clientspecificfields) && $scope.formValid.clientspecificfields)
            ) {
                return true;
            } else {
                return false;
            }
        };



        $scope.tabNavigation = function (natTo) {
            $state.go(AssignmentValidationService.tabNavigation(natTo, $state.current.name));
        };

        $scope.profileIsDraft = function (profileId) {
            return true;
        };

        $scope.$watch('entityForm.$valid', function () {
            if ($scope.entityForm) {
                $scope.formValid.entityForm = $scope.entityForm.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderCore.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderCore) {
                $scope.formValid.core = $scope.entityForm.formWorkOrderCore.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderPartiesAndRates.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderPartiesAndRates) {
                $scope.formValid.partiesAndRates = $scope.entityForm.formWorkOrderPartiesAndRates.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderTimeMaterialInvoice.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderTimeMaterialInvoice) {
                $scope.formValid.timeMaterialInvoice = $scope.entityForm.formWorkOrderTimeMaterialInvoice.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderExpensemanagement.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderExpensemanagement) {
                $scope.formValid.expensemanagement = $scope.entityForm.formWorkOrderExpensemanagement.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderPurchaseOrder.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderPurchaseOrder) {
                $scope.formValid.purchaseorder = $scope.entityForm.formWorkOrderPurchaseOrder.$valid;
            }
        });
        $scope.$watch('entityForm.formWorkOrderEarningsAndDeductions.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderEarningsAndDeductions) {
                $scope.formValid.earningsanddeductions = $scope.entityForm.formWorkOrderEarningsAndDeductions.$valid;
            }
        });

        $scope.$watch('entityForm.formWorkOrderTaxes.$valid', function () {
            if ($scope.entityForm && $scope.entityForm.formWorkOrderTaxes) {
                $scope.formValid.taxes = $scope.entityForm.formWorkOrderTaxes.$valid;
            }
        });
        $scope.$watch('CurrentWorkOrderVersion.BillingInfoes[0].Hours', function () {
            if ($scope.CurrentWorkOrderVersion.BillingInfoes.length > 0 && $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours) {
                var hours = $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours;
                angular.forEach($scope.CurrentWorkOrderVersion.BillingInfoes, function (bi) {
                    if ($scope.CurrentWorkOrderVersion.BillingInfoes[0] != bi) {
                        bi.Hours = hours;
                    }
                });
                angular.forEach($scope.CurrentWorkOrderVersion.PaymentInfoes, function (paymentInfo) {
                    paymentInfo.Hours = hours;
                });
            }
        });

        // $scope.$watch('CurrentWorkOrderVersion.TimeSheetRequired', function () {
        //     if (!$scope.CurrentWorkOrderVersion.TimeSheetRequired) {
        //         $scope.CurrentWorkOrderVersion.TimeSheetDescription = angular.copy($scope.model.defaults.workOrderVersion.TimeSheetDescription);
        //         //$scope.CurrentWorkOrderVersion.TimeSheetCycleId = angular.copy($scope.model.defaults.workOrderVersion.TimeSheetCycleId);
        //         $scope.CurrentWorkOrderVersion.TimeSheetPreviousApprovalRequired = angular.copy($scope.model.defaults.workOrderVersion.TimeSheetPreviousApprovalRequired);
        //         $scope.CurrentWorkOrderVersion.TimeSheetApproverProfileId = angular.copy($scope.model.defaults.workOrderVersion.TimeSheetApproverProfileId);
        //     } else {
        //         $scope.CurrentWorkOrderVersion.TimeSheetPreviousApprovalRequired = false;
        //         //$scope.CurrentWorkOrderVersion.TimeSheetApprovedOnline = false;
        //     }
        //     if ($scope.entityForm && $scope.entityForm.formWorkOrderTimeMaterialInvoice) {
        //         $scope.formValid.timeMaterialInvoice = $scope.entityForm.formWorkOrderTimeMaterialInvoice.$valid;
        //     }
        //     $scope.scopeApply();
        // });

        $scope.$watch('CurrentWorkOrderVersion.TimeSheetMethodologyId', function () {
            $scope.actionButton.onChange.timecardMethodology();
        });

        $scope.$watch('CurrentWorkOrderVersion.TimeSheetApprovers.length', function () {
            $scope.actionButton.onChange.timecardApprover();
        });


        // Expence listeners
        $scope.$watch('CurrentWorkOrderVersion.ExpenseMethodologyId', function () {
            $scope.actionButton.onChange.expenseMethodology();
        });

        $scope.$watch('CurrentWorkOrderVersion.ExpenseApprovers.length', function () {
            $scope.actionButton.onChange.expenseApprover();
        });

        $scope.onChangeWorkerId = function (paymentInfo) {
            if ($scope.model.entity.UserProfileIdWorker && $scope.model.entity.UserProfileIdWorker > 0) {
                var worker = AssignmentCommonFunctionalityService.getWorker($scope.model.entity, $scope.lists.listUserProfileWorker);
                if (worker) {
                    AssignmentCommonFunctionalityService.onChangeWorkerId($scope.model.entity, paymentInfo, $scope.lists.listUserProfileWorker, $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours)
                        .then(function (results) {
                            // console.log('onChangeWorkerId');
                            if (paymentInfo.OrganizationIdSupplier > 0 || $scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                                $scope.getPaymentSalesTaxes(paymentInfo);
                            }
                        });
                    $scope.getWCBIsAppliedDefault("Worker");
                }
                $scope.getStateValid(false);
            }

            $scope.reloadSupplierProfilesListForApproval();
            
            $scope.html.calculateVisibility();
        };

        $scope.downloadT4 = function (workOrderVersionId, year) {
            return AssignmentCommonFunctionalityService.downloadT4(workOrderVersionId, year);           
        };

        $scope.downloadT4A = function (workOrderVersionId, year) {
            return AssignmentCommonFunctionalityService.downloadT4A(workOrderVersionId, year);
        };

        $scope.filterOnPaymentSourceDeductionsByIncomeTaxes = function (item) {
            return item.SourceDeductionTypeId === ApplicationConstants.SourceDeductionType.FederalTax || item.SourceDeductionTypeId === ApplicationConstants.SourceDeductionType.ProvincialTax || item.SourceDeductionTypeId === ApplicationConstants.SourceDeductionType.AdditionalTax;
        };
        $scope.filterOnPaymentSourceDeductionsByPayrollTaxes = function (item) {
            return item.SourceDeductionTypeId !== ApplicationConstants.SourceDeductionType.FederalTax && item.SourceDeductionTypeId !== ApplicationConstants.SourceDeductionType.ProvincialTax && item.SourceDeductionTypeId !== ApplicationConstants.SourceDeductionType.AdditionalTax;
        };

        $scope.onClickIsUseUserProfileWorkerSourceDeduction = function (isUseUserProfileWorkerSourceDeduction) {
            $scope.$eval(function () {
                var paymentInfo = paymentInfo || $scope.CurrentWorkOrderVersion.PaymentInfoes[0];
                if (isUseUserProfileWorkerSourceDeduction) {
                    dialogs.confirm('Source Deduction', 'Are you sure you would like to take from Worker Profile? This will erase all current selections.').result.then(
                        function (btn) {
                            paymentInfo.IsUseUserProfileWorkerSourceDeduction = true;
                            paymentInfo.PaymentSourceDeductions = [];
                        },
                        function (btn) {
                            paymentInfo.IsUseUserProfileWorkerSourceDeduction = false;
                        });
                }
                else {
                    paymentInfo.PaymentSourceDeductions = [];
                    paymentInfo.IsUseUserProfileWorkerSourceDeduction = false;
                    $scope.getSubDivisionSourceDeductions(paymentInfo, null);
                }
            });
        };

        $scope.onChangeSourceDeductionSubdivision = function (paymentInfo) {
            if (paymentInfo.SubdivisionIdSourceDeduction === 600
                && $scope.model.entity.OrganizationIdInternal === 1
                && $scope.model.entity.workerProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp)
                $scope.CurrentWorkOrderVersion.AccrueEmployerHealthTaxLiability = true;
            else
                $scope.CurrentWorkOrderVersion.AccrueEmployerHealthTaxLiability = null;
        };

        $scope.onClickClearSubDivisionSourceDeductions = function (paymentInfo) {
            paymentInfo.SubdivisionIdSourceDeduction = undefined;
            $scope.CurrentWorkOrderVersion.AccrueEmployerHealthTaxLiability = null;
        };

        //$scope.onClickIsUseUserProfileWorkerSourceDeduction = function (paymentInfo, newValue, oldValue) {
        //    var oldIsUseUserProfileWorkerSourceDeduction = $scope.$eval(oldValue);
        //    var doOnClickIsUseUserProfileWorkerSourceDeduction = function (paymentInfo) {
        //        if (paymentInfo.IsUseUserProfileWorkerSourceDeduction) {
        //            dialogs.confirm('Source Deduction', 'Are you sure you would like to Take from Worker Profile? This will erase all current selections.').result.then(
        //                function (btn) {
        //                    paymentInfo.PaymentSourceDeductions = [];
        //                },
        //                function (btn) {
        //                    paymentInfo.IsUseUserProfileWorkerSourceDeduction = false;
        //                });
        //        }
        //        else if (oldIsUseUserProfileWorkerSourceDeduction) {
        //            paymentInfo.PaymentSourceDeductions = [];
        //            $scope.getSubDivisionSourceDeductions(paymentInfo, null);
        //        }
        //    };
        //    if (oldIsUseUserProfileWorkerSourceDeduction === paymentInfo.IsUseUserProfileWorkerSourceDeduction) {
        //        // we need it because the 'pt-input-radio' is build based on 'ng-click' event, but must be on 'ng-change'
        //        // as result, the current fuction SOMETIMES is calling before model (paymentInfo.IsUseUserProfileWorkerSourceDeduction) is changed
        //        $timeout(function () {
        //            doOnClickIsUseUserProfileWorkerSourceDeduction(paymentInfo);
        //        }, 500);
        //    }
        //    else {
        //        doOnClickIsUseUserProfileWorkerSourceDeduction(paymentInfo);
        //    }
        //};

        //$scope.$watch('CurrentWorkOrderVersion.PaymentInfoes[0].IsUseUserProfileWorkerSourceDeduction', function () {
        //    var paymentInfo = $scope.CurrentWorkOrderVersion.PaymentInfoes[0];
        //    if (paymentInfo.IsUseUserProfileWorkerSourceDeduction) {
        //        dialogs.confirm('Source Deduction', 'Are you sure you would like to Take from Worker Profile? This will erase all current selections.').result.then(
        //            function (btn) {
        //                paymentInfo.PaymentSourceDeductions = [];
        //            },
        //            function (btn) {
        //                paymentInfo.IsUseUserProfileWorkerSourceDeduction = false;
        //            });
        //    }
        //    else {
        //        paymentInfo.PaymentSourceDeductions = [];
        //        $scope.getSubDivisionSourceDeductions(paymentInfo, null);
        //    }
        //});

        //$scope.onClickIsUseUserProfileWorkerSourceDeduction = function () {
        //    var paymentInfo = $scope.CurrentWorkOrderVersion.PaymentInfoes[0];
        //    if (paymentInfo.IsUseUserProfileWorkerSourceDeduction) {
        //        dialogs.confirm('Source Deduction', 'Are you sure you would like to Take from Worker Profile? This will erase all current selections.').result.then(
        //            function (btn) {
        //                paymentInfo.PaymentSourceDeductions = [];
        //            },
        //            function (btn) {
        //                paymentInfo.IsUseUserProfileWorkerSourceDeduction = false;
        //            });
        //    }
        //    else {
        //        paymentInfo.PaymentSourceDeductions = [];
        //        $scope.getSubDivisionSourceDeductions(paymentInfo, null);
        //    }
        //};

        $scope.getSubDivisionSourceDeductions = function (paymentInfo, userProfileWorkerSourceDeductions) {
            paymentInfo.PaymentSourceDeductions = [];
            if ($scope.CurrentWorkOrderVersion.PaymentInfoes[0] != paymentInfo) {
                dialogs.notify('SubDivisionSourceDeductions must apply only for first instance of  PaymentgInfoes', message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) {
                });
                return;
            }
            AssignmentCommonFunctionalityService.getSubDivisionSourceDeductions($scope.model.entity, paymentInfo, userProfileWorkerSourceDeductions, $scope.lists.listUserProfileWorker);
        };

        $scope.paymentSourceDeductionOnClick = function (paymentSourceDeduction) {
            paymentSourceDeduction.RateAmount = null;
        };

        $scope.setIsAccrued = function (paymentOtherEarning) {
            if (paymentOtherEarning.PaymentOtherEarningTypeId == ApplicationConstants.PaymentOtherEarningType.VacationPay) {
                paymentOtherEarning.IsAccrued = paymentOtherEarning.IsApplied ? true : null;
            }
        }
        $scope.paymentOtherEarningIsAppliedOnChange = function (paymentInfo, paymentOtherEarning) {
            $scope.setIsAccrued(paymentOtherEarning);
            paymentOtherEarning.RatePercentage = null;
            if (paymentOtherEarning.IsApplied) {
                if ($scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                    if (paymentInfo.PaymentOtherEarnings.length === 0) {
                        setPaymentOtherEarnings(paymentInfo, null);
                    }
                    else {
                        var worker = AssignmentCommonFunctionalityService.getWorker($scope.model.entity, $scope.lists.listUserProfileWorker);//var worker = $scope.getWorker();
                        if (worker.OrganizationId === null && ($scope.model.entity.workerProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp)) {
                            var findPaymentOtherEarning = _.find(worker.UserProfileWorkerOtherEarnings, function (eachPaymentOtherEarnings) {
                                return eachPaymentOtherEarnings.PaymentOtherEarningTypeId == paymentOtherEarning.PaymentOtherEarningTypeId;
                            });

                            if (findPaymentOtherEarning) {
                                paymentOtherEarning.RatePercentage = findPaymentOtherEarning.RatePercentage;
                            }

                            if (paymentOtherEarning.RatePercentage === null) {
                                paymentOtherEarning.RatePercentage = ApplicationConstants.PaymentOtherEarningTypeVacationPayRatePercentageDefault;
                            }
                        }
                    }
                }
            }
            else {
                if (paymentOtherEarning.PaymentOtherEarningTypeId == ApplicationConstants.PaymentOtherEarningType.VacationPay) {
                    paymentOtherEarning.RatePercentage = null;
                }
            }
        };



        // Invoice Recipient Strategy Method
        $scope.onDeliveryMethodChange = function($select, billingRecipient){
            billingRecipient.DeliveryMethodId = $select.selected.id;
            billingRecipient.DeliverToUserProfileId = null;
        }

        // CC Delivery To
        $scope.onDeliveryToChange = function($select, billingRecipient){
            billingRecipient.DeliverToUserProfileId = $select.selected.Id;
        }

        $scope.onChangeInternalOrganization = function () {
            $scope.worksiteChangedMessage = [];

            var internalOrganization = _.find($scope.lists.listOrganizationInternal, function (org) {
                return (org.Id == $scope.model.entity.OrganizationIdInternal);
            });
            var organizationCode = internalOrganization ? internalOrganization.Code : null;
            $scope.model.entity.OrganizationCode = organizationCode;
            if (!$scope.CurrentWorkOrderVersion.profilesListForApproval) {
                $scope.CurrentWorkOrderVersion.profilesListForApproval = {
                    Supplier: [],
                    Internal: [],
                    Client: []
                };
            }
            if ($scope.model.entity.OrganizationIdInternal > 0) {
                AssignmentApiService.getProfilesListOrganizationalByUserProfileType($scope.model.entity.OrganizationIdInternal, ApplicationConstants.UserProfileType.Internal).then(function (responseItems) {
                    $scope.CurrentWorkOrderVersion.profilesListForApproval.Internal = responseItems;
                });
            }
            else {
                $scope.CurrentWorkOrderVersion.profilesListForApproval.Internal = [];
            }
            angular.forEach($scope.CurrentWorkOrderVersion.BillingInfoes, function (billingInfo) {
                $scope.getBillingSalesTaxes(billingInfo);
            });
            $scope.getWCBIsAppliedDefault("Internal Company");
            $scope.getCommissionRates();
            //WCB Code list
            $scope.CurrentWorkOrderVersion.WCBIsApplied = null;
            $scope.CurrentWorkOrderVersion.WorkerCompensationId = null;

            var wcbMessages = $scope.loadWCBCodelist();
            $scope.worksiteChangedMessage = $scope.worksiteChangedMessage.concat(wcbMessages);

            if ($scope.worksiteChangedMessage.length > 0) {
                dialogs.notify('The Internal Company has Changed', $scope.worksiteChangedMessage.join('<br>'), { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
            }

            AssignmentValidationService.validate($scope.model.entity.OrganizationIdInternal, $scope.model.entity.UserProfileIdWorker, $scope.model.entity.workerProfileTypeId, $scope.CurrentWorkOrder, $scope.CurrentWorkOrderVersion, AssignmentValidationService.edit.earningsanddeductions, null, $scope.lists);

            $scope.setIsTest();
        };

        $scope.onChangeCurrentWorkOrderVersionWorksiteId = function () {
            $scope.worksiteChangedMessage = [];

            var billingInfo = $scope.CurrentWorkOrderVersion.BillingInfoes[0];
            if ($scope.CurrentWorkOrderVersion.WorksiteId > 0) {
                var subdivisionIdByWorksite = AssignmentApiService.getSubdivisionIdByWorksiteId($scope.CurrentWorkOrderVersion.WorksiteId);
                if (subdivisionIdByWorksite !== null && typeof subdivisionIdByWorksite !== 'undefined') {
                    var organizationClientSalesTaxDefaultId = billingInfo.OrganizationClientSalesTaxDefaultId;
                    if (organizationClientSalesTaxDefaultId !== null && organizationClientSalesTaxDefaultId === ApplicationConstants.ClientSalesTaxDefault.HeadOffice) {
                        ;
                        //  http://webdr01:8080/tfs/DefaultCollection/Phoenix_Oppenheimer/_workitems?id=6312
                        //  when organizationClient is head office, then any changes of Worksite will NOT effect any messages or changes of billingInfo.SubdivisionIdSalesTax
                    }
                    else {
                        var subdivisionIdSalesTax = billingInfo.SubdivisionIdSalesTax;
                        if (subdivisionIdSalesTax !== null && typeof subdivisionIdSalesTax !== 'undefined') {
                            if (subdivisionIdByWorksite != subdivisionIdSalesTax) {
                                var subdivisionByWorksiteName = _.find($scope.lists.workOrderSalesTaxTerritories, function (subdivision) { return subdivision.id == subdivisionIdByWorksite; }).text;
                                if (subdivisionIdSalesTax > 0) {
                                    var subdivisionSalesTaxName = _.find($scope.lists.workOrderSalesTaxTerritories, function (subdivision) { return subdivision.id == subdivisionIdSalesTax; }).text;
                                    $scope.worksiteChangedMessage.push('The Client Sales Tax Territory has been updated from "' + subdivisionSalesTaxName + '" to "' + subdivisionByWorksiteName + '"');

                                }
                                billingInfo.SubdivisionIdSalesTax = subdivisionIdByWorksite;
                                $scope.getBillingSalesTaxes(billingInfo);
                            }
                        }
                        else {
                            if (billingInfo.OrganizationIdClient && billingInfo.OrganizationIdClient > 0) {
                                $scope.onChangeOrganizationIdClient(billingInfo);
                            }
                            else {
                                billingInfo.SubdivisionIdSalesTax = subdivisionIdByWorksite;
                                $scope.getBillingSalesTaxes(billingInfo);
                            }
                        }
                    }

                    if ($scope.model.entity.workerProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp) {
                        if ($scope.CurrentWorkOrderVersion.changePaymentRatesForWorkSite()) {
                            $scope.worksiteChangedMessage.push('The default setting for applying vacation pay has been updated.');
                        }
                    }
                }
            }
            //WCB Code list
            $scope.CurrentWorkOrderVersion.WCBIsApplied = null;
            $scope.CurrentWorkOrderVersion.WorkerCompensationId = null;

            var wcbMessages = $scope.loadWCBCodelist();
            $scope.worksiteChangedMessage = $scope.worksiteChangedMessage.concat(wcbMessages);

            if ($scope.worksiteChangedMessage.length > 0) {
                dialogs.notify('The Worksite Province has Changed', $scope.worksiteChangedMessage.join('<br>'), { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) { });
            }
        };

        $scope.onChangeBillingInfoCurrencyId = function (currencyId) {
            var paymentInfo = $scope.CurrentWorkOrderVersion.PaymentInfoes && $scope.CurrentWorkOrderVersion.PaymentInfoes[0];
            paymentInfo.CurrencyId = paymentInfo.CurrencyId || currencyId;
        };

        $scope.onChangePaymentInfoCurrencyId = function (currencyId) {
            var billingInfo = $scope.CurrentWorkOrderVersion.BillingInfoes && $scope.CurrentWorkOrderVersion.BillingInfoes[0];
            billingInfo.CurrencyId = billingInfo.CurrencyId || currencyId;
        };

        $scope.getWCBIsAppliedDefault = function (caller) {

            if ($scope.CurrentWorkOrderVersion.WorkerCompensationId == null || $scope.CurrentWorkOrderVersion.WorkerCompensationId == ($scope.oldWCBDetailId || 0) || $scope.lists.wcbCodeList.length == 0) {
                return;
            }
            var oldVal = $scope.CurrentWorkOrderVersion.WCBIsApplied;

            var currentWCBDetail = _.find($scope.lists.wcbCodeList, function (o) {
                return o.WorkerCompensationId == $scope.CurrentWorkOrderVersion.WorkerCompensationId;
            });
            var workerProfileTypeId = $scope.model.entity.workerProfileTypeId;
            var wcbSubdivisionDetailWorkerTypes = _.filter(currentWCBDetail.WCBSubdivisionDetailWorkerTypeDefault, function (o) {
                return o.ProfileTypeIdWorker == $scope.model.entity.workerProfileTypeId
            })
            $scope.CurrentWorkOrderVersion.WCBIsApplied = (wcbSubdivisionDetailWorkerTypes.length > 0);

            if (oldVal != $scope.CurrentWorkOrderVersion.WCBIsApplied && oldVal !== null && typeof oldVal !== 'undefined') {
                var message = 'On change of ' + caller + ' the Is WCB Applied has been updated from ' + oldVal + ' to ' + $scope.CurrentWorkOrderVersion.WCBIsApplied;
                //common.logWarning(message);
                dialogs.notify('Is WCB Applied has been updated', message, { keyboard: false, backdrop: 'static' }).result.then(function (btn) { }, function (btn) {
                });
            }
            $scope.oldWCBDetailId = currentWCBDetail.Id;
            return;
        };

        $scope.onChangeCurrentWorkOrderVersionWCBHeaderId = function () {
            $scope.oldWCBDetailId = $scope.CurrentWorkOrderVersion.WCBIsApplied = null;
            $scope.getWCBIsAppliedDefault("WCB Code");
        };

        $scope.onChangeCurrentWorkOrderVersionWCBIsITWorker = function () {
            $scope.getWCBIsAppliedDefault("Is IT Worker");
        };

        $scope.onChangeOrganizationIdClient = function (billingInfo) {
            AssignmentCommonFunctionalityService.onChangeOrganizationIdClient($scope.model.entity, billingInfo, $scope.lists.listOrganizationClient).then(function () {
                $scope.getCommissionRates();
                getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization();
            });

            $scope.getStateValid(false);
            
            $scope.html.calculateVisibility();
        };

        $scope.getBillingSalesTaxes = function (billingInfo) {
            AssignmentCommonFunctionalityService.getBillingSalesTaxes($scope.model.entity, billingInfo);
        };

        $scope.getPaymentSalesTaxes = function (paymentInfo, callback) {
            // paymentInfo.paymentSalesTaxes = [];
            AssignmentCommonFunctionalityService.getPaymentSalesTaxes($scope.model.entity, paymentInfo, callback);
        };

        $scope.onChangeOrganizationIdSupplier = function (paymentInfo) {
            if (paymentInfo.OrganizationIdSupplier && paymentInfo.OrganizationIdSupplier > 0) {
                angular.forEach($scope.lists.listOrganizationSupplier, function (organizationSupplier) {
                    if (organizationSupplier.Id == paymentInfo.OrganizationIdSupplier) {
                        paymentInfo.OrganizationSupplierDisplayName = organizationSupplier.DisplayName;
                        AssignmentApiService.getProfilesListByOrganizationId(paymentInfo.OrganizationIdSupplier).then(function (responseItems) {
                            paymentInfo.profilesListForPaymentOrganization = responseItems;
                            ProfileApiService.removeInactiveProfile(paymentInfo.profilesListForPaymentOrganization, paymentInfo.UserProfileIdSupplier);
                        });
                    }
                });
                $scope.getPaymentSalesTaxes(paymentInfo);
                $scope.getStateValid(false);
            }

            $scope.reloadSupplierProfilesListForApproval();
        };

        $scope.rateTypesMirroring = function () {
            $scope.CurrentWorkOrderVersion.rateTypesMirroring($scope.model.defaults);
            return;
        };

        $scope.paymentPartyRateUnitMirror = function (rate) {
            if ($scope.CurrentWorkOrderVersion.paymentPartyRateUnitsMirroring) {
                $scope.CurrentWorkOrderVersion.paymentPartyRateUnitsMirroring(rate);
            }
            return;
        };

        $scope.updateBillingPartyAndPaymentPartyMirrorRateUnit = function (paymentRate) {
            if (paymentRate.RateTypeId && (paymentRate.RateUnitId === ApplicationConstants.RateUnit.Words
                || paymentRate.RateUnitId === ApplicationConstants.RateUnit.Monthly
                || paymentRate.RateUnitId === ApplicationConstants.RateUnit.Shift)) {
                $scope.CurrentWorkOrderVersion.BillingInfoes.forEach(function (billingInfo) {
                    billingInfo.BillingRates.forEach(function (billingRate) {
                        if (billingRate.RateTypeId === paymentRate.RateTypeId) {
                            billingRate.RateUnitId = paymentRate.RateUnitId;
                        }
                    });
                });
            }
            paymentRate.IsApplyStatHoliday = ($scope.model.entity.workerProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp && paymentRate.RateTypeId === ApplicationConstants.RateType.Primary); // set default to true if RateType isPrimary
            $scope.paymentPartyRateUnitMirror(paymentRate);
            return;
        };

        $scope.updatePaymentPartyRateUnit = function (billingRate) {
            if (billingRate.RateTypeId && (billingRate.RateUnitId === ApplicationConstants.RateUnit.Words
                || billingRate.RateUnitId === ApplicationConstants.RateUnit.Monthly
                || billingRate.RateUnitId === ApplicationConstants.RateUnit.Shift)) {
                $scope.CurrentWorkOrderVersion.PaymentInfoes.forEach(function (paymentInfo) {
                    paymentInfo.PaymentRates.forEach(function (paymentRate) {
                        if (paymentRate.RateTypeId === billingRate.RateTypeId) {
                            paymentRate.RateUnitId = billingRate.RateUnitId;
                        }
                    });
                });
            }
            return;
        };

        //  add/remove/erase billingInfo
        $scope.addBillingInfo = function () {
            var billingInfo = angular.copy($scope.model.defaults.billingInfo);
            billingInfo.Hours = $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours;
            billingInfo.BrokenRules = {
            };
            $scope.CurrentWorkOrderVersion.BillingInfoes.push(billingInfo);
            $scope.rateTypesMirroring();
        };
        $scope.removeBillingInfo = function (billingInfo) {
            var index = $scope.CurrentWorkOrderVersion.BillingInfoes.indexOf(billingInfo);
            if (index >= 0) {
                $scope.CurrentWorkOrderVersion.BillingInfoes.splice(index, 1);
            }
            if ($scope.CurrentWorkOrderVersion.BillingInfoes[0] == billingInfo) {
                $scope.rateTypesMirroring();
            }
            $scope.scopeApply();
            $scope.getStateValid(false);
        };
        $scope.eraseBillingInfo = function (billingInfo) {
            var oldBillingInfo = angular.copy(billingInfo);
            var index = $scope.CurrentWorkOrderVersion.BillingInfoes.indexOf(billingInfo);
            billingInfo = angular.copy($scope.model.defaults.billingInfo);
            billingInfo.OrganizationIdClient = 0;

            // Pre-default old values from the old billing info
            billingInfo.Hours = oldBillingInfo.Hours;
            billingInfo.CurrencyId = oldBillingInfo.CurrencyId;
            billingInfo.BillingRates = oldBillingInfo.BillingRates;

            $scope.CurrentWorkOrderVersion.BillingInfoes[index] = billingInfo;

            // Removing this for now, as we are presetting the hours.
            //if ($scope.CurrentWorkOrderVersion.BillingInfoes[0] == billingInfo) {
            //    $scope.rateTypesMirroring();
            //}


            // clear timesheet approver
            $scope.CurrentWorkOrderVersion.TimeSheetApproverProfileId = null;

            $scope.resetRebateAndVmsFee();

            $scope.scopeApply();
            $scope.getStateValid(false);
        };

        $scope.reloadSupplierProfilesListForApproval = function () {
            angular.forEach($scope.CurrentWorkOrderVersion.PaymentInfoes, function (paymentInfo) {
                $scope.CurrentWorkOrderVersion.profilesListForApproval.Supplier = [];
                if (paymentInfo.OrganizationIdSupplier && paymentInfo.OrganizationIdSupplier > 0) {

                    AssignmentApiService.getProfilesListOrganizationalByUserProfileType(paymentInfo.OrganizationIdSupplier, ApplicationConstants.UserProfileType.Organizational).then(function (responseItems) {
                        $scope.CurrentWorkOrderVersion.profilesListForApproval.Supplier = $scope.CurrentWorkOrderVersion.profilesListForApproval.Supplier.concat(responseItems);
                    });
                }
            });

        }

        //  add/remove/erase paymentInfo
        $scope.addPaymentInfo = function () {
            var paymentInfo = angular.copy($scope.model.defaults.paymentInfo);
            paymentInfo.BrokenRules = {
            };
            paymentInfo.Hours = $scope.CurrentWorkOrderVersion.BillingInfoes[0].Hours;
            paymentInfo.ApplySalesTax = true;
            $scope.CurrentWorkOrderVersion.PaymentInfoes.push(paymentInfo);
            $scope.rateTypesMirroring();

            $scope.CurrentWorkOrderVersion.paymentPartyRateUnitsMirroring($scope.CurrentWorkOrderVersion.PaymentInfoes[0].PaymentRates);

            $scope.getStateValid(false);
            $scope.reloadSupplierProfilesListForApproval();

        };
        $scope.removePaymentInfo = function (paymentInfo) {
            if ($scope.CurrentWorkOrderVersion.PaymentInfoes[0] == paymentInfo) {
                $scope.erasePaymentInfo(paymentInfo);
            } else {
                var index = $scope.CurrentWorkOrderVersion.PaymentInfoes.indexOf(paymentInfo);
                if (index >= 0) {
                    $scope.CurrentWorkOrderVersion.PaymentInfoes.splice(index, 1);
                }
                $scope.scopeApply();
                $scope.getStateValid(false);
            }

            $scope.reloadSupplierProfilesListForApproval();

        };
        $scope.erasePaymentInfo = function (paymentInfo) {
            var oldPaymentInfo = angular.copy(paymentInfo);
            if ($scope.CurrentWorkOrderVersion.PaymentInfoes[0] == paymentInfo) {
                $scope.model.entity.UserProfileIdWorker = 0;
                $scope.model.entity.workerProfileTypeId = 0;
                $scope.model.entity.workerContactId = 0;
                paymentInfo.OrganizationSupplierDisplayName = "";
                //  to refresh lists.listUserProfileWorker to exclude IncProfiles from already selected Organizations
                // implemented based on filter: workerIncProfileListFilteredByUsedOrganizations
            }

            var index = $scope.CurrentWorkOrderVersion.PaymentInfoes.indexOf(paymentInfo);
            paymentInfo = angular.copy($scope.model.defaults.paymentInfo);
            paymentInfo.OrganizationIdSupplier = 0;

            paymentInfo.Hours = oldPaymentInfo.Hours;
            paymentInfo.CurrencyId = oldPaymentInfo.CurrencyId;
            paymentInfo.PaymentRates = oldPaymentInfo.PaymentRates;

            $scope.CurrentWorkOrderVersion.PaymentInfoes[index] = paymentInfo;
            $scope.scopeApply();
            $scope.getStateValid(false);


        };

        //  add/remove billingRecipient
        $scope.addBillingRecipient = function (billingInvoice) {
            var billingRecipient = angular.copy($scope.model.defaults.billingRecipient);
            billingRecipient.BrokenRules = {
            };
            billingInvoice.BillingRecipients.push(billingRecipient);
        };
        $scope.removeBillingRecipient = function (billingInvoice, billingRecipient) {
            var index = billingInvoice.BillingRecipients.indexOf(billingRecipient);
            if (index >= 0) {
                billingInvoice.BillingRecipients.splice(index, 1);
            }
            $scope.scopeApply();
        };

        //  add/remove PaymentContact
        $scope.addPaymentContact = function (paymentInfo) {
            var paymentContact = angular.copy($scope.model.defaults.paymentContact);
            paymentContact.BrokenRules = {
            };
            paymentInfo.PaymentContacts.push(paymentContact);
        };
        $scope.removePaymentContact = function (paymentInfo, paymentContact) {
            var index = paymentInfo.PaymentContacts.indexOf(paymentContact);
            if (index >= 0) {
                paymentInfo.PaymentContacts.splice(index, 1);
            }
            $scope.scopeApply();
        };

        //  add/remove billingRate
        $scope.addBillingPartyRate = function (billingInfo) {
            var billingRate = angular.copy($scope.model.defaults.billingRate);
            billingRate.BrokenRules = {
            };
            billingInfo.BillingRates.push(billingRate);
        };
        $scope.removeBillingPartyRate = function (billingInfo, billingRate) {
            var index = billingInfo.BillingRates.indexOf(billingRate);
            if (index >= 0) {
                billingInfo.BillingRates.splice(index, 1);
            }
            $scope.scopeApply();
            $scope.rateTypesMirroring();
        };

        //  add/remove billingSalesTax
        $scope.addBillingTax = function (billingInfo) {
            var billingSalesTax = angular.copy($scope.model.defaults.billingSalesTax);
            billingSalesTax.BrokenRules = {
            };
            billingInfo.BillingSalesTaxes.push(billingSalesTax);
        };
        $scope.removeBillingTax = function (billingInfo, billingSalesTax) {
            var index = billingInfo.BillingSalesTaxes.indexOf(billingSalesTax);
            if (index >= 0) {
                billingInfo.BillingSalesTaxes.splice(index, 1);
            }
            $scope.scopeApply();
            $scope.rateTypesMirroring();
        };

        //  add/remove WorkOrderPurchaseOrderLine from workOrder
        $scope.addWorkOrderPurchaseOrderLine = function (organizationIdClient) {
            organizationIdClient = organizationIdClient ? organizationIdClient : 0;
            PurchaseOrderApiService.getPurchaseOrderLineByOrganizationIdClient(organizationIdClient,
                oreq.request()
                    .withExpand(['WorkOrderPurchaseOrderLines', 'PurchaseOrderTransactions'])
                    .withSelect([
                        'CurrencyId',
                        'Id',
                        'StatusId',
                        'PurchaseOrderNumber',
                        'DepletionGroupId',
                        'PurchaseOrderLineNumber',
                        'PurchaseOrderId',
                        'Amount',
                        'WorkOrderPurchaseOrderLines/Id',
                        'WorkOrderPurchaseOrderLines/AmountCommited',
                        'WorkOrderPurchaseOrderLines/AmountSpent'
                    ]).url())
                .then(
                    function (responseSuccess) {
                        var responseItems = [];
                        _.each(responseSuccess.Items, function (pol) {
                            var newItem = {
                                Id: pol.Id,
                                PurchaseOrderId: pol.PurchaseOrderId,
                                PurchaseOrderDepletionGroupId: pol.DepletionGroupId,
                                PurchaseOrderNumber: pol.PurchaseOrderNumber,
                                PurchaseOrderLineNumber: pol.PurchaseOrderLineNumber,
                                Amount: pol.Amount,
                                AmountCommited: 0,
                                AmountSpent: 0,
                                CurrencyCode: _.find($scope.lists.currencyList, function (currency) { return currency.id === pol.CurrencyId; }).code,
                                StatusId: pol.StatusId,
                                PurchaseOrderLineStatusName: _.find($scope.lists.workOrderPurchaseOrderLineStatusList, function (status) { return status.id === pol.StatusId; }).code
                            };

                            _.each(pol.WorkOrderPurchaseOrderLines, function (wopol) {
                                //newItem.Amount += wopol.Amount;
                                newItem.AmountCommited += wopol.AmountCommited;
                                newItem.AmountSpent += wopol.AmountSpent;
                            });

                            responseItems.push(newItem);
                        });
                        var purchaseOrderLinesFiltered = $filter('purchaseOrderLinesFilteredByUsage')(responseItems, $scope.CurrentWorkOrderVersion.WorkOrderPurchaseOrderLines);

                        var dialogConfig = {
                            defaults: {
                                workOrderPurchaseOrderLine: $scope.model.defaults.workOrderPurchaseOrderLine
                            },
                            purchaseOrderSearchLines: purchaseOrderLinesFiltered,
                            entity: $scope.model.entity,
                            WorkOrderIndex: $scope.model.WorkOrderIndex,
                            WorkOrderVersionIndex: $scope.model.WorkOrderVersionIndex,
                            assignmentId: $scope.model.entity.Id,
                            workOrderId: $scope.CurrentWorkOrder.Id,
                            workOrderNumber: $scope.CurrentWorkOrder.WorkOrderNumber,
                            purchaseOrderDepletedOptionList: $scope.lists.purchaseOrderDepletedOptionList,
                            purchaseOrderDepletedGroupList: $scope.lists.purchaseOrderDepletedGroupList,
                            purchaseOrderStatuses: $scope.lists.purchaseOrderStatuses,
                            currencyList: $scope.lists.currencyList,
                        };
                        var dlg = dialogs.create('/Phoenix/modules/workorder/views/DialogPurchaseOrderLineToWorkOrder.html', 'PurchaseOrderLineToWorkOrderController', dialogConfig, {
                            keyboard: false, backdrop: 'static'
                        });
                        dlg.result.then(function (selectedLine) {
                            var workOrderNumber = $scope.CurrentWorkOrder.WorkOrderNumber;
                            $state.go('workorder.edit.purchaseorder.line', {
                                purchaseOrderId: selectedLine.PurchaseOrderId, purchaseOrderLineId: selectedLine.Id, workOderPurchaseOrderLineId: -1, workOrderNumber: workOrderNumber
                            });
                        }, function () {

                        });

                    },
                    function (responseError) {
                        common.responseErrorMessages(responseError);
                    });
        };
        $scope.removeWorkOrderPurchaseOrderLine = function (workOrder, workOrderPurchaseOrderLine) {
            var index = workOrder.WorkOrderPurchaseOrderLines.indexOf(workOrderPurchaseOrderLine);
            if (index >= 0) {
                workOrder.WorkOrderPurchaseOrderLines.splice(index, 1);
            }
            $scope.scopeApply();
            $scope.rateTypesMirroring();
        };

        $scope.datePickerCallbackOnDoneStartDate = function () {
            if ($scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.New ||
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.Extend
            ) {
                $scope.CurrentWorkOrderVersion.EffectiveDate = $scope.CurrentWorkOrder.StartDate || new Date();
            }
            else if ($scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionEarliest ||
                $scope.CurrentWorkOrderVersion.WorkOrderCreationReasonId == ApplicationConstants.WorkOrderCreationReason.CorrectWorkOrderVersionUnique
            ) {
                $scope.CurrentWorkOrderVersion.EffectiveDate = $scope.CurrentWorkOrderVersion.WorkOrderStartDateState || new Date();
            }
            
            $scope.html.calculateVisibility();
        };

        $scope.datePickerCallbackOnDoneEndDate = function() {
            $scope.CurrentWorkOrderVersion.wovEndDate = AssignmentCommonFunctionalityService.getWorkOrderEndDate($scope.CurrentWorkOrder, $scope.CurrentWorkOrderVersion);
            $scope.html.calculateVisibility();
        };

        $scope.addSupportingJobOwner = function () {
            if (!$scope.CurrentWorkOrderVersion.SupportingJobOwners) {
                $scope.CurrentWorkOrderVersion.SupportingJobOwners = [];
            }
            $scope.CurrentWorkOrderVersion.SupportingJobOwners.push(angular.copy({}));
        };
        $scope.clearSupportingJobOwner = function (support) {
            support.UserProfileIdSales = undefined;
            $scope.getCommissionRates();
        };

        $scope.removeSupportingJobOwner = function (support) {
            var index = $scope.CurrentWorkOrderVersion.SupportingJobOwners.indexOf(support);

            if (index >= 0) {
                $scope.CurrentWorkOrderVersion.SupportingJobOwners.splice(index, 1);
            }
            $scope.getCommissionRates();
        };

        $scope.initRecruiter = function() {
            if ($scope.CurrentWorkOrderVersion.IsDraftStatus) {
                if (!$scope.CurrentWorkOrderVersion.Recruiters) {
                    $scope.CurrentWorkOrderVersion.Recruiters = [];
                }
                if ($scope.CurrentWorkOrderVersion.Recruiters.length === 0 && !$scope.CurrentWorkOrderVersion.IsRecruiterRemoved) {
                    $scope.CurrentWorkOrderVersion.Recruiters.push(angular.copy({}));
                }
            }
        };
        $scope.addRecruiter = function () {
            if (!$scope.CurrentWorkOrderVersion.Recruiters) {
                $scope.CurrentWorkOrderVersion.Recruiters = [];
            }
            $scope.CurrentWorkOrderVersion.Recruiters.push(angular.copy({}));
            $scope.CurrentWorkOrderVersion.IsRecruiterRemoved = false;
        };
        $scope.clearRecruiter = function (recruiter) {
            recruiter.UserProfileIdSales = undefined;
            $scope.getCommissionRates();
        };
        $scope.removeRecruiter = function (recruiter) {
            var index = $scope.CurrentWorkOrderVersion.Recruiters.indexOf(recruiter);
            if (index >= 0) {
                $scope.CurrentWorkOrderVersion.Recruiters.splice(index, 1);
            }
            $scope.CurrentWorkOrderVersion.IsRecruiterRemoved = ($scope.CurrentWorkOrderVersion.Recruiters.length === 0);
            $scope.getCommissionRates();
        };

        $scope.clearJobOwner = function () {
            $scope.CurrentWorkOrderVersion.JobOwner = undefined;
            $scope.getCommissionRates();
        };

        $scope.canViewCommissionRates = function () {
            return $scope.CurrentWorkOrderVersion.InternalOrganizationDefinition1Id !== null && $scope.CurrentWorkOrderVersion.InternalOrganizationDefinition1Id > 0 &&
                $scope.CurrentWorkOrderVersion.LineOfBusinessId !== null && $scope.CurrentWorkOrderVersion.LineOfBusinessId > 0 &&
                $scope.model.entity.OrganizationIdInternal !== null && $scope.model.entity.OrganizationIdInternal > 0 &&
                $scope.CurrentWorkOrderVersion.BillingInfoes !== null && $scope.CurrentWorkOrderVersion.BillingInfoes.length > 0 &&
                $scope.CurrentWorkOrderVersion.BillingInfoes[0].OrganizationIdClient !== null && $scope.CurrentWorkOrderVersion.BillingInfoes[0].OrganizationIdClient > 0;
        };
        $scope.getCommissionRates = function () {
            if (ApplicationConstants.ProductionHideFunctionality) {
                return;
            }
            var jobOwner = angular.copy($scope.CurrentWorkOrderVersion.JobOwner);
            var supportOwners = _.filter(_.map(angular.copy($scope.CurrentWorkOrderVersion.SupportingJobOwners), 'UserProfileIdSales'), function (o) {
                return o;
            });
            var recruiters = _.filter(_.map(angular.copy($scope.CurrentWorkOrderVersion.Recruiters), 'UserProfileIdSales'), function (o) {
                return o;
            });
            if ($scope.canViewCommissionRates()) {
                var command = {
                    WorkflowPendingTaskId: -1,
                    UserProfileIdJobOwner: jobOwner ? jobOwner.UserProfileIdSales : null,
                    UserProfileIdSupportingJobOwners: supportOwners,
                    UserProfileIdRecruiters: recruiters,
                    JobOwnerUsesSupport: $scope.CurrentWorkOrderVersion.JobOwnerUsesSupport,
                    OrganizationIdInternal: $scope.model.entity.OrganizationIdInternal,
                    OrganizationIdClient: $scope.CurrentWorkOrderVersion.BillingInfoes[0].OrganizationIdClient,
                    BranchId: $scope.CurrentWorkOrderVersion.InternalOrganizationDefinition1Id,
                    LineOfBusinessId: $scope.CurrentWorkOrderVersion.LineOfBusinessId,
                };
                if ($scope.CommissionsLoading === null || typeof ($scope.CommissionsLoading) === 'undefined') {
                    $scope.CommissionsLoading = 0;
                }
                $scope.CommissionsLoading++;

                AssignmentApiService.workOrderVersionCommissionPicker(command);

                $timeout(function () {
                    if ($scope.CommissionsLoading != 0) {
                        $scope.CommissionsLoading = 0;
                    }
                }, 1000);

            } else {
                var summaries = angular.copy($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions);

                var findExistingSummary = function (UserProfileId, CommissionRoleId, obj) {
                    return UserProfileId == obj.UserProfileIdSales && CommissionRoleId == obj.CommissionRoleId;
                };
                var extractCommissionRateHeaderId = function (obj) {
                    return obj.CommissionRateHeaderId;
                };
                var findProfile = function (id, obj) {
                    return obj.Id == id;
                };

                var newList = [];
                if (jobOwner) {
                    var existingSummary = _.find(summaries, findExistingSummary.bind(null, jobOwner.UserProfileIdSales, jobOwner.CommissionRoleId)) || {};
                    var newSummary = angular.extend({}, existingSummary, {
                        UserProfileIdSales: jobOwner.UserProfileIdSales, IsApplicable: true, CommissionRates: [], CommissionRateHeaderId: null, CommissionRoleId: (supportOwners.length > 0 ? ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport : ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport)
                    });
                    var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                    if (contact && contact.Contact && contact.Contact.FullName) {
                        newSummary.FullName = contact.Contact.FullName;
                    } else {
                        newSummary.FullName = '';
                    }
                    newList.push(newSummary);
                }

                angular.forEach(supportOwners, function (s) {
                    var existingSummary = _.find(summaries, findExistingSummary.bind(null, s, ApplicationConstants.CommissionRole.SupportingJobOwner)) || { CommissionRoleId: ApplicationConstants.CommissionRole.SupportingJobOwner };
                    var newSummary = angular.extend({}, existingSummary, {
                        UserProfileIdSales: s, IsApplicable: true, CommissionRates: [], CommissionRateHeaderId: null
                    });
                    var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                    if (contact && contact.Contact && contact.Contact.FullName) {
                        newSummary.FullName = contact.Contact.FullName;
                    } else {
                        newSummary.FullName = '';
                    }
                    newList.push(newSummary);
                });

                angular.forEach(recruiters, function (r) {
                    var existingSummary = _.find(summaries, findExistingSummary.bind(null, r, ApplicationConstants.CommissionRole.RecruiterRole)) || { CommissionRoleId: ApplicationConstants.CommissionRole.RecruiterRole };
                    var newSummary = angular.extend({}, existingSummary, {
                        UserProfileIdSales: r, IsApplicable: true, CommissionRates: [], CommissionRateHeaderId: null
                    });
                    var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                    if (contact && contact.Contact && contact.Contact.FullName) {
                        newSummary.FullName = contact.Contact.FullName;
                    } else {
                        newSummary.FullName = '';
                    }
                    newList.push(newSummary);
                });

                $scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions = newList;

                $scope.getStateValid(false);
            }
        };

        phoenixsocket.onPrivate("WorkOrderVersionCommissionPicker", function (event, data) {
            var summaries = data.CommissionSummaries;
            var jobOwner = _.filter(summaries, function (obj) {
                return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport || obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport;
            });
            var support = _.filter(summaries, function (obj) {
                return obj.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner;
            });
            var recruiters = _.filter(summaries, function (obj) {
                return obj.CommissionRoleId == ApplicationConstants.CommissionRole.RecruiterRole;
            });
            var nationalAccounts = _.filter(summaries, function (obj) {
                return obj.CommissionRoleId == ApplicationConstants.CommissionRole.NationalAccountsRole;
            });
            var branchManagers = _.filter(summaries, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.BranchManagerRole; });

            var summariesList = angular.copy($scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions);

            var findExistingSummary = function (UserProfileId, CommissionRoleId, obj) {
                return UserProfileId == obj.UserProfileIdSales && CommissionRoleId == obj.CommissionRoleId;
            };
            var extractCommissionRateHeaderId = function (obj) {
                return obj.CommissionRateHeaderId;
            };
            var findProfile = function (id, obj) {
                return obj.Id == id;
            };
            var filterInactives = function (id, obj) {
                return obj.CommissionRateHeaderStatusId == ApplicationConstants.CommissionRateHeaderStatus.Active || obj.CommissionRateHeaderId == id;
            };

            var newList = [];
            angular.forEach(jobOwner, function (o) {
                var existingSummary = _.find(summariesList, findExistingSummary.bind(null, o.UserProfileId, o.CommissionRoleId)) || {};
                var newSummary = angular.extend({
                }, existingSummary, { UserProfileIdSales: o.UserProfileId, IsApplicable: o.IsApplicable, CommissionRoleId: o.CommissionRoleId, CommissionRates: o.CommissionRates, CommissionRateHeaderId: (o.CommissionRates.length === 1 ? o.CommissionRates[0].CommissionRateHeaderId : null) });
                if (newSummary.CommissionRateHeaderId === null && existingSummary.CommissionRateHeaderId !== null && existingSummary.CommissionRateHeaderId > 0 && _.includes(_.map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)) {
                    newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
                }
                newSummary.CommissionRates = _.filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
                var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                if (contact && contact.Contact && contact.Contact.FullName) {
                    newSummary.FullName = contact.Contact.FullName;
                } else {
                    newSummary.FullName = '';
                }
                newList.push(newSummary);
            });

            angular.forEach(support, function (s) {
                var existingSummary = _.find(summariesList, findExistingSummary.bind(null, s.UserProfileId, s.CommissionRoleId)) || {};
                var newSummary = angular.extend({}, existingSummary, {
                    UserProfileIdSales: s.UserProfileId, IsApplicable: s.IsApplicable, CommissionRoleId: s.CommissionRoleId, CommissionRates: s.CommissionRates, CommissionRateHeaderId: (s.CommissionRates.length === 1 ? s.CommissionRates[0].CommissionRateHeaderId : null)
                });
                if (newSummary.CommissionRateHeaderId === null && existingSummary.CommissionRateHeaderId !== null && existingSummary.CommissionRateHeaderId > 0 && _.includes(_.map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)) {
                    newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
                }
                newSummary.CommissionRates = _.filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
                var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                if (contact && contact.Contact && contact.Contact.FullName) {
                    newSummary.FullName = contact.Contact.FullName;
                } else {
                    newSummary.FullName = '';
                }
                newList.push(newSummary);
            });

            angular.forEach(recruiters, function (r) {
                var existingSummary = _.find(summariesList, findExistingSummary.bind(null, r.UserProfileId, r.CommissionRoleId)) || {};
                var newSummary = angular.extend({}, existingSummary, {
                    UserProfileIdSales: r.UserProfileId, IsApplicable: r.IsApplicable, CommissionRoleId: r.CommissionRoleId, CommissionRates: r.CommissionRates, CommissionRateHeaderId: (r.CommissionRates.length === 1 ? r.CommissionRates[0].CommissionRateHeaderId : null)
                });
                if (newSummary.CommissionRateHeaderId === null && existingSummary.CommissionRateHeaderId !== null && existingSummary.CommissionRateHeaderId > 0 && _.includes(_.map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)) {
                    newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
                }
                newSummary.CommissionRates = _.filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
                var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                if (contact && contact.Contact && contact.Contact.FullName) {
                    newSummary.FullName = contact.Contact.FullName;
                } else {
                    newSummary.FullName = '';
                }
                newList.push(newSummary);
            });

            angular.forEach(nationalAccounts, function (n) {
                var existingSummary = _.find(summariesList, findExistingSummary.bind(null, n.UserProfileId, n.CommissionRoleId)) || {
                };
                var newSummary = angular.extend({
                }, existingSummary, {
                        UserProfileIdSales: n.UserProfileId, IsApplicable: n.IsApplicable, CommissionRoleId: n.CommissionRoleId, CommissionRates: n.CommissionRates, CommissionRateHeaderId: (n.CommissionRates.length === 1 ? n.CommissionRates[0].CommissionRateHeaderId : null)
                    });
                if (newSummary.CommissionRateHeaderId === null && existingSummary.CommissionRateHeaderId !== null && existingSummary.CommissionRateHeaderId > 0 && _.includes(_.map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)) {
                    newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
                }
                newSummary.CommissionRates = _.filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
                var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                if (contact && contact.Contact && contact.Contact.FullName) {
                    newSummary.FullName = contact.Contact.FullName;
                } else {
                    newSummary.FullName = '';
                }
                newList.push(newSummary);
            });

            angular.forEach(branchManagers, function (b) {
                var existingSummary = _.find(summariesList, findExistingSummary.bind(null, b.UserProfileId, b.CommissionRoleId)) || {};
                var newSummary = angular.extend({
                }, existingSummary, {
                        UserProfileIdSales: b.UserProfileId, IsApplicable: b.IsApplicable, CommissionRoleId: b.CommissionRoleId, CommissionRates: b.CommissionRates, CommissionRateHeaderId: (b.CommissionRates.length === 1 ? b.CommissionRates[0].CommissionRateHeaderId : null)
                    });
                if (newSummary.CommissionRateHeaderId === null && existingSummary.CommissionRateHeaderId !== null && existingSummary.CommissionRateHeaderId > 0 && _.includes(_.map(newSummary.CommissionRates, extractCommissionRateHeaderId), existingSummary.CommissionRateHeaderId)) {
                    newSummary.CommissionRateHeaderId = existingSummary.CommissionRateHeaderId;
                }
                newSummary.CommissionRates = _.filter(newSummary.CommissionRates, filterInactives.bind(null, newSummary.CommissionRateHeaderId));
                var contact = (_.find($scope.lists.UserProfileCommissions, findProfile.bind(null, newSummary.UserProfileIdSales)));
                if (contact && contact.Contact && contact.Contact.FullName) {
                    newSummary.FullName = contact.Contact.FullName;
                } else {
                    newSummary.FullName = '';
                }
                newList.push(newSummary);
            });

            if ($scope.CommissionsLoading !== null && typeof ($scope.CommissionsLoading) !== 'undefined' && $scope.CommissionsLoading > 0) {
                $scope.CommissionsLoading--;
            }

            $scope.CurrentWorkOrderVersion.WorkOrderVersionCommissions = newList;

            $scope.getStateValid(false);
        });

        $scope.onChangeCurrentWorkOrderVersionLineOfBusinessId = function () {
            if ($scope.CurrentWorkOrderVersion.LineOfBusinessId != ApplicationConstants.LineOfBusiness.Regular) {
                $scope.CurrentWorkOrderVersion.Recruiters = [];
            }
            $scope.getCommissionRates();
            $scope.resetRebateAndVmsFee();
        };

        $scope.onChangeCurrentWorkOrderVersionInternalOrganizationDefinition1Id = function () {
            $scope.getCommissionRates();
        };

        $scope.onChangeJobOwnerUsesSupport = function () {
            if ($scope.CurrentWorkOrderVersion.JobOwnerUsesSupport === false) {
                if ($scope.CurrentWorkOrderVersion.JobOwner && $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales && !_.some($scope.lists.JobOwnersNoSupport, function (obj) {
                    return obj.Id == $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales;
                })) {
                    $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales = undefined;
                }
                $scope.CurrentWorkOrderVersion.SupportingJobOwners = [];
                $scope.lists.JobOwners = $scope.lists.JobOwnersNoSupport;
            } else if ($scope.CurrentWorkOrderVersion.JobOwnerUsesSupport === true) {
                if ($scope.CurrentWorkOrderVersion.JobOwner && $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales && !_.some($scope.lists.JobOwnersWithSupport, function (obj) {
                    return obj.Id == $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales;
                })) {
                    $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales = undefined;
                }
                $scope.lists.JobOwners = $scope.lists.JobOwnersWithSupport;
                $scope.addSupportingJobOwner();
            }
            $scope.getCommissionRates();
        };

        $scope.onChangeSalesPattern = function () {
            if (!$scope.CurrentWorkOrderVersion.SalesPatternId) {
                $scope.CurrentWorkOrderVersion.JobOwnerUsesSupport = undefined;
                if ($scope.CurrentWorkOrderVersion.JobOwner) {
                    $scope.CurrentWorkOrderVersion.JobOwner.UserProfileIdSales = undefined;
                }
                $scope.CurrentWorkOrderVersion.SupportingJobOwners = [];
            } else {
                var filter = oreq.filter('Id').eq($scope.CurrentWorkOrderVersion.SalesPatternId);
                var oDataParams = oreq.request().withExpand(['CommissionSalesPatternSupporters']).withSelect(['CommissionSalesPatternSupporters/UserProfileId', 'CommissionSalesPatternSupporters/CommissionRoleId', 'CommissionSalesPatternSupporters/FullName'])
                    .withFilter(filter).url();
                AssignmentApiService.getSalesPatterns(oDataParams).then(function (response) {
                    if (response.Items && response.Items.length > 0) {
                        var resp = response.Items[0];
                        $scope.CurrentWorkOrderVersion.JobOwner = _.chain(resp.CommissionSalesPatternSupporters).map(function (obj) { return { UserProfileIdSales: obj.UserProfileId, CommissionRoleId: obj.CommissionRoleId, FullName: obj.FullName }; }).find(function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport || obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport; }).value();
                        $scope.CurrentWorkOrderVersion.SupportingJobOwners = _.chain(resp.CommissionSalesPatternSupporters).map(function (obj) { return { UserProfileIdSales: obj.UserProfileId, CommissionRoleId: obj.CommissionRoleId, FullName: obj.FullName }; }).filter(function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner; }).value();
                        $scope.CurrentWorkOrderVersion.JobOwnerUsesSupport = ($scope.CurrentWorkOrderVersion.JobOwner.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport) || $scope.CurrentWorkOrderVersion.SupportingJobOwners.length > 0;
                        $scope.getCommissionRates();
                    }
                }, function (error) { });
            }
        };

        $scope.resetRebate = function () {
            $scope.CurrentWorkOrderVersion.RebateHeaderId = null;
            $scope.CurrentWorkOrderVersion.RebateTypeId = null;
            $scope.CurrentWorkOrderVersion.RebateRate = null;
        };

        $scope.resetVmsFee = function () {
            $scope.CurrentWorkOrderVersion.VmsFeeHeaderId = null;
            $scope.CurrentWorkOrderVersion.VmsFeeTypeId = null;
            $scope.CurrentWorkOrderVersion.VmsFeeRate = null;
        };

        $scope.resetRebateAndVmsFee = function () {
            $scope.resetRebate();
            $scope.resetVmsFee();
            $scope.onChangeHasRebateOrHasVmsFee();
        };

        $scope.onChangeHasRebateOrHasVmsFee = function () {
            var wov = $scope.CurrentWorkOrderVersion;

            if (!wov.HasRebate) {
                $scope.resetRebate();
            }
            if (!wov.HasVmsFee) {
                $scope.resetVmsFee();
            }

            $scope.availableVmsFees = [];
            $scope.availableVmsFees = [];
            getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization();
        };

        var getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization = function () {
            var wov = $scope.CurrentWorkOrderVersion;
            var organizationId = wov.BillingInfoes[0].OrganizationIdClient;
            var lobId = wov.LineOfBusinessId;
            if (organizationId && lobId) {
                OrgApiService.getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId)
                    .then(function (data) {
                        function mapHeader(type, header) {
                            var version = header.Versions[0];
                            if (version && version.Id && version.Id > 0) {
                                var row = {
                                    headerId: +header.Id,
                                    versionId: +version.Id,
                                    type: type,
                                    description: header.Description,
                                    //lob: _.find(lineOfBusinessList, ['id', version.LineOfBusinessId]).text,
                                    lineOfBusinessId: +version.LineOfBusinessId,
                                    rebateTypeId: +version.RebateTypeId,
                                    rate: +version.Rate,
                                    //status: _.find(rebateHeaderStatusList, ['id', header.RebateHeaderStatusId]).text,
                                };
                                return row;
                            }
                        }

                        var rebates = data.Rebates;
                        var rebateRows = _.map(rebates.Headers, _.curry(mapHeader)(rebates.Type));
                        $scope.availableRebates = _.filter(rebateRows, ['lineOfBusinessId', lobId]);

                        var vmsFees = data.VmsFees;
                        var vmsFeeRows = _.map(vmsFees.Headers, _.curry(mapHeader)(vmsFees.Type));
                        $scope.availableVmsFees = _.filter(vmsFeeRows, ['lineOfBusinessId', lobId]);
                    },
                        function (error) {
                            console.log(error);
                        }
                    );
            }
        };

        $scope.getRebateOrVmsFee = function (list, headerId) {
            return list && (_.find(list, ['headerId', +headerId]));
        };

        $scope.getRebateType = function (list, headerId) {
            var item = $scope.getRebateOrVmsFee(list, headerId);
            var rebateTypeId = item && item.rebateTypeId;
            var rebateType = _.find($scope.lists.rebateTypes, ['id', rebateTypeId]);
            return rebateType && rebateType.text;
        };

        $scope.getRebateOrVmsFeeRate = function (list, headerId) {
            var item = $scope.getRebateOrVmsFee(list, headerId);
            return item && displayRate(item);
        };

        $scope.filterBillingTaxIsApplied = function (billingSalesTax) {
            return function (value, index, array) {
                return billingSalesTax.hasNumber === "Yes" || value.id === false;
            };
        };

        // commission
        $scope.onChangeIsEligibleForCommission = function () {
            if (!$scope.CurrentWorkOrderVersion.IsEligibleForCommission) {
                $scope.CurrentWorkOrderVersion.IsThirdPartyImport = null;
            }
            else {
                if ($scope.CurrentWorkOrderVersion.PaymentInfoes && $scope.CurrentWorkOrderVersion.PaymentInfoes[0]) {
                    $scope.CurrentWorkOrderVersion.PaymentInfoes[0].IsCommissionVacation = true;
                }
            }
        };

        $scope.onChangeIsThirdPartyImport = function () {
            if (!$scope.CurrentWorkOrderVersion.IsThirdPartyImport) {
                $scope.CurrentWorkOrderVersion.CommissionThirdPartyWorkerReference = null;
            }
        };


        function displayRate(item) {
            return item.rebateTypeId === ApplicationConstants.RebateType.Amount ? ('$' + item.rate) : (item.rebateTypeId === ApplicationConstants.RebateType.Percentage ? (item.rate + '%') : null);
        }

        // billing info note mask
        (function () {

            var billingInfoType = 1;
            $scope.lastTimesheetBillingInvoiceNote = 1;

            // set the initial viewable note count
            var billingInfoWatch = $scope.$watch('CurrentWorkOrderVersion.BillingInfoes', function () {
                var info = getBillingInfo(billingInfoType);
                $scope.lastTimesheetBillingInvoiceNote = Math.max($scope.lastTimesheetBillingInvoiceNote, getLastBillingInvoiceNoteIndex(info));
                billingInfoWatch();
                $scope.actionButton.onChange.timecardBillingInfoNote(info, $scope.lastTimesheetBillingInvoiceNote);
            });

            $scope.addTimesheetBillingInvoiceNote = function () {
                $scope.lastTimesheetBillingInvoiceNote++;
                $scope.actionButton.onChange.timecardBillingInfoNote(null, $scope.lastTimesheetBillingInvoiceNote);
            };

            $scope.removeTimesheetBillingInvoiceNote = function (index) {
                var info = getBillingInfo(billingInfoType);
                info['InvoiceNote' + (index + 1)] = null;
                $scope.lastTimesheetBillingInvoiceNote--;
                $scope.actionButton.onChange.timecardBillingInfoNote(info, $scope.lastTimesheetBillingInvoiceNote);
            };

            function getLastBillingInvoiceNoteIndex(billingInfo) {
                if (billingInfo) {
                    for (var i = 4; i > 0; i--) {
                        var note = billingInfo['InvoiceNote' + i];
                        if (note !== undefined && note !== null && note !== '') {
                            return i;
                        }
                    }
                }
                return 0;
            }

            function getBillingInfo(typeField) {
                return (
                    $scope &&
                    $scope.CurrentWorkOrderVersion &&
                    $scope.CurrentWorkOrderVersion.BillingInfoes &&
                    $scope.CurrentWorkOrderVersion.BillingInfoes[0].BillingInvoices ||
                    []
                ).filter(function (billingInfo) {
                    return billingInfo.InvoiceTypeId == typeField;
                })[0];
            }

        })();

        // timesheet approver
        (function () {

            $scope.addTimeSheetApproverDefinition = function () {
                if ($scope && $scope.CurrentWorkOrderVersion) {
                    $scope.CurrentWorkOrderVersion.TimeSheetApprovers = $scope.CurrentWorkOrderVersion.TimeSheetApprovers || [];
                    $scope.CurrentWorkOrderVersion.TimeSheetApprovers.push({
                        WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                        //SourceId:,
                        //UserProfileId:,
                        Sequence: $scope.CurrentWorkOrderVersion.TimeSheetApprovers.reduce(function (acc, el, index, arr) {
                            return Math.max(acc, el.Sequence || 0) + 1;
                        }, 1),
                        MustApprove: false,
                        //IsDraft
                    });
                }
            };

            $scope.removeTimeSheetApproverDefinition = function (index) {
                if ($scope.CurrentWorkOrderVersion.TimeSheetApprovers.length >= index) {
                    $scope.CurrentWorkOrderVersion.TimeSheetApprovers.splice(index, 1);
                }
            };

        })();


        // expense info note mask
        (function () {

            var ExpenseInfoType = 2;
            $scope.lastExpenseBillingInvoiceNote = 1;

            // set the initial viewable note count
            var billingInfoWatch = $scope.$watch('CurrentWorkOrderVersion.BillingInfoes', function () {
                var info = getBillingInfo(ExpenseInfoType);
                $scope.lastExpenseBillingInvoiceNote = Math.max($scope.lastExpenseBillingInvoiceNote, getLastBillingInvoiceNoteIndex(info));
                billingInfoWatch();
                $scope.actionButton.onChange.expenseBillingInfoNote(info, $scope.lastExpenseBillingInvoiceNote);
            });

            $scope.addExpenseBillingInvoiceNote = function () {
                $scope.lastExpenseBillingInvoiceNote++;
                $scope.actionButton.onChange.expenseBillingInfoNote(null, $scope.lastExpenseBillingInvoiceNote);
            };

            $scope.removeExpenseBillingInvoiceNote = function (index) {
                var info = getBillingInfo(ExpenseInfoType);
                info['InvoiceNote' + (index + 1)] = null;
                $scope.lastExpenseBillingInvoiceNote--;
                $scope.actionButton.onChange.expenseBillingInfoNote(info, $scope.lastExpenseBillingInvoiceNote);
            };

            function getLastBillingInvoiceNoteIndex(billingInfo) {
                if (billingInfo) {
                    for (var i = 4; i > 0; i--) {
                        var note = billingInfo['InvoiceNote' + i];
                        if (note !== undefined && note !== null && note !== '') {
                            return i;
                        }
                    }
                }
                return 0;
            }

            function getBillingInfo(typeField) {
                return (
                    $scope &&
                    $scope.CurrentWorkOrderVersion &&
                    $scope.CurrentWorkOrderVersion.BillingInfoes &&
                    $scope.CurrentWorkOrderVersion.BillingInfoes[0].BillingInvoices ||
                    []
                ).filter(function (billingInfo) {
                    return billingInfo.InvoiceTypeId == typeField;
                })[0];
            }

        })();

        // expense approver
        (function () {

            $scope.addExpenseApproverDefinition = function () {
                if ($scope && $scope.CurrentWorkOrderVersion) {
                    $scope.CurrentWorkOrderVersion.ExpenseApprovers = $scope.CurrentWorkOrderVersion.ExpenseApprovers || [];
                    $scope.CurrentWorkOrderVersion.ExpenseApprovers.push({
                        WorkOrderVersionId: $scope.CurrentWorkOrderVersion.Id,
                        ApproverTypeId: 1,
                        SortOrder: 3,
                        //SourceId:,
                        //UserProfileId:,
                        Sequence: $scope.CurrentWorkOrderVersion.ExpenseApprovers.reduce(function (acc, el, index, arr) {
                            return Math.max(acc, el.Sequence || 0) + 1;
                        }, 1),
                        MustApprove: false,
                        //IsDraft
                    });
                }
            };

            $scope.removeExpenseApproverDefinition = function (index) {
                if ($scope.CurrentWorkOrderVersion.ExpenseApprovers.length >= index) {
                    $scope.CurrentWorkOrderVersion.ExpenseApprovers.splice(index, 1);
                }
            };

        })();

        // placeholder for preview buttons
        $scope.previewBillingInvoiceTemplate = function () {
            console.log('clicked billing invoice preview');
        };

        $scope.previewpPaymentInvoiceTemplate = function () {
            console.log('clicked payment invoice preview');
        };

        // We need OrganizationId to prepopulate some lookup lists. Sorry for this brute force hack.
        function pollCurrentWorkOrderVersion() {
            if ($scope.CurrentWorkOrderVersion) {
                getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization();
            }
            else
                window.setTimeout(pollCurrentWorkOrderVersion, 500);
        }
        pollCurrentWorkOrderVersion();
    }

})(angular, Phoenix.App);