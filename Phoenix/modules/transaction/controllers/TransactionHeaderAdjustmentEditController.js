(function (angular, app) {
    'use strict';

    var controllerId = 'TransactionHeaderAdjustmentEditController';

    angular.module('phoenix.transaction.controllers').controller(controllerId,
        [
            '$scope', '$rootScope', '$state', '$stateParams', 'common', 'commonDataService', 'NavigationService', 'dialogs', 'resolveModel', 'resolveWorkOrders', 'resolveUserProfileModel', 'resolveCodeValueLists', 'TransactionApiService', 'WorkflowApiService', TransactionHeaderAdjustmentEditController
        ]);

    function TransactionHeaderAdjustmentEditController($scope, $rootScope, $state, $stateParams, common, commonDataService, NavigationService, dialogs, resolveModel, resolveWorkOrders, resolveUserProfileModel, resolveCodeValueLists, TransactionApiService, WorkflowApiService) {

        var self = this;

        common.setControllerName(controllerId);

        function onLoad() {
            if (typeof resolveModel === 'undefined' || resolveModel === null) {// || common.isEmptyObject(resolveModel)) {
                return;
            }

            angular.extend(self, {
                model: resolveModel,
                common: {
                    loadItemsPromise: false,
                    addedAdjustment: null,
                    validationMessages: [],
                    workflow: {},
                    lists: resolveCodeValueLists,
                    listsWorkOrder: resolveWorkOrders,
                    userProfile: resolveUserProfileModel,
                    onClickSubmit: function () {

                        var adjustments = [];
                        var employeeAmountTotal = 0;
                        var employerAmountTotal = 0;
                        var clientAmountTotal = 0;

                        var isWorkerProfileSpValid = true;
                        var isWorkerProfileIncValid = true;
                        var isWorkerUnitedStatesW2Valid = true;
                        var isWorkerUnitedStatesLLCValid = true;
                        angular.forEach(self.model.AdjustmentApplicables, function (item) {
                            if (item.isApplied) {

                                employeeAmountTotal += parseFloat(item.EmployeeAmount);
                                employerAmountTotal += parseFloat(item.EmployerAmount);
                                clientAmountTotal += parseFloat(item.ClientAmount);

                                adjustments.push({
                                    SalesTaxTypeId: item.SalesTaxTypeId,
                                    SourceDeductionTypeId: item.SourceDeductionTypeId,
                                    EmployeeAmount: item.IsApplicableToEmployee ? parseFloat(item.EmployeeAmount) : null,
                                    EmployerAmount: item.IsApplicableToEmployer ? parseFloat(item.EmployerAmount) : null,
                                    ClientAmount: item.IsApplicableToClient ? parseFloat(item.ClientAmount) : null,
                                });

                                //For SP - Warning message for any source deductions that are not EI or CPP
                                if (self.model.WorkerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp &&
                                    item.SourceDeductionTypeId > 0 &&
                                    item.SourceDeductionTypeId !== ApplicationConstants.SourceDeductionType.CanadaPensionPlan &&
                                    item.SourceDeductionTypeId !== ApplicationConstants.SourceDeductionType.EmploymentInsurance) {
                                    isWorkerProfileSpValid = false;
                                }
                                //For Inc - Warning message for any source deductions entered
                                if (self.model.WorkerProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc &&
                                    item.SourceDeductionTypeId > 0) {
                                    isWorkerProfileIncValid = false;
                                }

                                if (self.model.WorkerProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 &&
                                    item.SourceDeductionTypeId > 0) {
                                    isWorkerUnitedStatesW2Valid = false;
                                }

                                if (self.model.WorkerProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC &&
                                    item.SourceDeductionTypeId > 0) {
                                    isWorkerUnitedStatesLLCValid = false;
                                }
                            }
                        });
                        dialogs.confirm('Create Adjustment Transaction',
                            //(!isWorkerProfileSpValid ? '<div class="alert alert-warning">A SP worker can only have EI and CPP source deductions</div>' : '') +
                            //(!isWorkerProfileIncValid ? '<div class="alert alert-warning">An Inc worker cannot have any source deductions</div>' : '') +
                            (!isWorkerProfileSpValid || !isWorkerProfileIncValid ? '<div class="alert alert-warning">Some source deductions selected are not normally charged for this profile type</div>' : '') +
                            '<br/>Employee Amount ' + common.floatApplyTwoDecimalPlaces(employeeAmountTotal * -1) + ' ' + self.model.CurrencyCode +
                            '<br/>Employer Amount ' + common.floatApplyTwoDecimalPlaces(employerAmountTotal) + ' ' + self.model.CurrencyCode +
                            '<br/>Client Amount ' + common.floatApplyTwoDecimalPlaces(clientAmountTotal) + ' ' + self.model.CurrencyCode +
                            '<br/>An Adjustment transaction will be created. Are you sure? '
                        ).result.then(
                            function (btn) {
                                var result = 'Confirmed';

                                var transactionHeaderAdjustmentSubmitCommand = {
                                    WorkflowPendingTaskId: self.model.WorkflowPendingTaskId,
                                    WorkOrderVersionId: self.model.WorkOrderVersionId,
                                    Description: self.model.Description,
                                    SuppressPayment: self.model.SuppressPayment,
                                    Adjustments: adjustments,
                                };
                                self.common.loadItemsPromise = true;
                                TransactionApiService.transactionHeaderAdjustmentSubmit(transactionHeaderAdjustmentSubmitCommand).then(
                                    function (responseSucces) {
                                        common.logSuccess('Transaction Submitted');
                                        commonDataService.setWatchConfigOnWorkflowEvent('transaction.view.summary', 'transaction.adjustment', ApplicationConstants.EntityType.Assignment, ApplicationConstants.EntityType.WorkOrderVersion, responseSucces.EntityId, { transactionHeaderId: responseSucces.EntityIdRedirect });
                                    },
                                    function (responseError) {
                                        self.common.loadItemsPromise = false;
                                        self.common.validationMessages = common.responseErrorMessages(responseError);
                                    });

                            }, function (btn) {
                                var result = 'Not Confirmed';
                            });
                    },
                    floatApplyTwoDecimalPlaces: function (c) {
                        return common.floatApplyTwoDecimalPlaces(c);
                    },
                    employeeOnChange: function (item) {
                        item.newEmployeeYtdDeduction = item.EmployeeYtdDeduction + parseFloat(item.EmployeeAmount);
                    },
                    employerOnChange: function (item) {
                        item.newEmployerYtdDeduction = item.EmployerYtdDeduction + parseFloat(item.EmployerAmount);
                    },
                    clientOnChange: function (item) {
                        // Do nothing
                    },
                    onClickCancel: function () {
                        self.common.loadItemsPromise = true;
                        common.logWarning('Transaction Discarded');
                        if ($state.previous && $state.previous.name && $state.previous.name != $state.current.name) {
                            $state.go($state.previous.name, $state.previous.params);
                        }
                        else if ($stateParams.workOrderVersionId && $stateParams.workOrderVersionId > 0) {
                            $state.go('workorder.edit.core', { assignmentId: 0, workOrderId: 0, workOrderVersionId: self.model.WorkOrderVersionId });
                        }
                        else if (self.common.userProfile && self.common.userProfile.ProfileTypeId && self.common.userProfile.ContactId && self.common.userProfile.Id) {
                            if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                                $state.go('EditWorkerCanadianSPProfile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                                $state.go('EditWorkerTempProfile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc) {
                                $state.go('EditWorkerCanadianIncProfile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
                                $state.go('EditWorkerUnitedStatesW2Profile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
                                $state.go('EditWorkerUnitedStatesLLCProfile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else if (self.common.userProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor) {
                                $state.go('EditWorkerSubVendorProfile', { contactId: self.common.userProfile.ContactId, profileId: self.common.userProfile.Id });
                            }
                            else {
                                history.back();
                            }
                        }
                        else {
                            history.back();
                        }
                    },
                    workOrderChanged: function (item) {
                        //if (!self.model || !self.model.AdjustmentApplicables) {
                        self.model = self.model || {};
                        if (self.model.WorkOrderVersionId) {
                            $rootScope.activateGlobalSpinner = true;
                            TransactionApiService.getAdjustmentNew(self.model.WorkOrderVersionId).then(
                                function (responseSucces) {
                                    responseSucces.Id = responseSucces.WorkOrderVersionId;
                                    WorkflowApiService.getWorkflowAvailableActions(responseSucces, responseSucces, ApplicationConstants.EntityType.WorkOrderVersion).then(
                                        function (workflowResponseSuccess) {
                                            $rootScope.activateGlobalSpinner = false;
                                            responseSucces.Id = null;
                                            self.model = Object.assign({}, self.model, responseSucces);
                                            angular.forEach(self.model.AdjustmentApplicables, function (item) {
                                                item.isApplied = false;
                                                item.EmployeeAmount = 0;
                                                item.EmployerAmount = 0;
                                                item.ClientAmount = 0;
                                            });
                                            NavigationService.setTitle('workorder-government-adjustment', [self.model.OrganizationInternalCode, self.model.WorkerName]);
                                        },
                                        function (responseError) {
                                            responseSucces.Id = null;
                                            $rootScope.activateGlobalSpinner = false;
                                        });
                                },
                                function (responseError) {
                                    $rootScope.activateGlobalSpinner = false;
                                }
                            );
                        }

                        // }
                    },
                    addAdjustment: function (item) {
                        item.isApplied = true;
                        item.EmployeeAmount = 0;
                        item.EmployerAmount = 0;
                        item.ClientAmount = 0;
                        self.common.addedAdjustment = null;
                    },
                    removeAdjustment: function (item) {
                        item.isApplied = false;
                        item.EmployeeAmount = 0;
                        item.EmployerAmount = 0;
                        item.ClientAmount = 0;
                    },
                },
            });

            angular.extend(self.model, {
                EmployeeAmountTotal: function () {
                    var amountTotal = 0;
                    angular.forEach(self.model.AdjustmentApplicables, function (item) {
                        if (item.IsApplicableToEmployee) {
                            amountTotal -= parseFloat(item.EmployeeAmount);
                        }
                    });
                    return amountTotal;
                },
                EmployerAmountTotal: function () {
                    var amountTotal = 0;
                    angular.forEach(self.model.AdjustmentApplicables, function (item) {
                        if (item.IsApplicableToEmployer) {
                            amountTotal += parseFloat(item.EmployerAmount);
                        }
                    });
                    return amountTotal;
                },
                ClientAmountTotal: function () {
                    var amountTotal = 0;
                    angular.forEach(self.model.AdjustmentApplicables, function (item) {
                        if (item.IsApplicableToClient) {
                            amountTotal += parseFloat(item.ClientAmount);
                        }
                    });
                    return amountTotal;
                },
                CurrencyCode: _.find(self.common.lists.currencyList, function (currency) { return currency.id == self.model.CurrencyId; }).code,
            });

            angular.forEach(self.model.AdjustmentApplicables, function (item) {
                item.isApplied = false;
                item.EmployeeAmount = 0;
                item.EmployerAmount = 0;
                item.ClientAmount = 0;
            });
            var args = [];
            if (self.model.WorkerName && self.model.OrganizationInternalCode) {
                args = [self.model.OrganizationInternalCode,self.model.WorkerName];
            }
            NavigationService.setTitle('workorder-government-adjustment', args);
        }
        onLoad();
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.TransactionHeaderAdjustmentEditController = {
        resolveWorkOrders: ['$stateParams', '$q', 'AssignmentApiService', function ($stateParams, $q, AssignmentApiService) {
            var result = $q.defer();
            AssignmentApiService.getSearchByUserProfileIdWorker($stateParams.userProfileId).then(
                function (responseSucces) {
                    result.resolve(responseSucces.Items);
                },
                function (responseError) {
                    result.reject(responseError);
                }
            );
            return result.promise;
        }],

        resolveUserProfileModel: ['$stateParams', '$timeout', '$q', 'ProfileApiService', function ($stateParams, $timeout, $q, ProfileApiService) {
            var result = $q.defer();
            ProfileApiService.get($stateParams.userProfileId).then(
                function (responseSucces) {
                    result.resolve(responseSucces);
                },
                function (responseError) {
                    result.reject(responseError);
                }
            );
            return result.promise;
        }],
        resolveModel: ['$stateParams', '$timeout', '$q', 'TransactionApiService', 'WorkflowApiService', function ($stateParams, $timeout, $q, TransactionApiService, WorkflowApiService) {
            var result = $q.defer();
            if ($stateParams.workOrderVersionId && $stateParams.workOrderVersionId > 0) {
                TransactionApiService.getAdjustmentNew($stateParams.workOrderVersionId).then(
                    function (responseSucces) {
                        responseSucces.Id = responseSucces.WorkOrderVersionId;
                        WorkflowApiService.getWorkflowAvailableActions(responseSucces, responseSucces, ApplicationConstants.EntityType.WorkOrderVersion).then(
                            function (responseSuccess) {
                                responseSucces.Id = null;
                                result.resolve(responseSucces);
                            },
                            function (responseError) {
                                responseSucces.Id = null;
                                result.reject(responseError);
                            });
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            }
            else {

                $timeout(function () {
                    result.resolve({ CurrencyId: ApplicationConstants.Currencies.CAD });
                });
            }

            return result.promise;
        }],

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var list = {};

            list.currencyList = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);

            result.resolve(list);
            return result.promise;
        }],
    };

})(angular, Phoenix.App);