(function (angular, app) {
    'use strict';
    var controllerId = 'PayrollProvincialTaxController';

    angular.module('phoenix.payroll.controllers').controller(controllerId, ['$scope', '$state', 'dialogs', 'common', 'resolveHeader', 'resolveCodeValueLists', 'NavigationService', 'WorkflowApiService', 'commonDataService', PayrollProvincialTaxController]);

    function PayrollProvincialTaxController($scope, $state, dialogs, common, resolveHeader, resolveCodeValueLists, NavigationService, WorkflowApiService, commonDataService) {
        var self = this;
        common.setControllerName(controllerId);
        NavigationService.setTitle('payroll-provincial-taxes');

        function onLoad() {
            if (typeof resolveHeader === 'undefined' || resolveHeader === null || common.isEmptyObject(resolveHeader)) { return; }
            getMissedStateParams();

            angular.extend(self, resolveHeader, {
                validationMessages: [],
                common: {
                    workflow: {},
                    lists: resolveCodeValueLists,
                    currentVersion: {},
                    loadItemsPromise: null,
                    customStatusId: null,
                    customStatusType: {
                        ToCorrect: 1,
                        ToScheduleChange: 2,
                    }
                }
            });

            angular.extend(self.common, extendSelfByCommon(self.common));
            angular.extend(self.common.workflow, extendByWorkflow(self.common));
            angular.extend(self.common, extendByFieldViewConfig(self.common));
            angular.extend(self.common, extendByTaxRates(self.common));

            self.common.currentVersionSet($state.params.provincialTaxVersionId);
        }

        onLoad();

        function onEvent() {
            self.common.workflow.SelectedActionId = null;
            self.common.workflow.WorkflowIsRunning = true;
            self.validationMessages = null;
        }

        function onResponseSuccesWatchWorkflowEvent(provincialTaxVersionId, stateNameGo, successMessage) {
            self.loadItemsPromise = null;
            self.validationMessages = null;
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'payroll.provincialTax', ApplicationConstants.EntityType.ProvincialTaxHeader, ApplicationConstants.EntityType.ProvincialTaxVersion, provincialTaxVersionId, { provincialTaxHeaderId: 0, provincialTaxVersionId: provincialTaxVersionId });
        }

        function onResponseSuccesStateGo(provincialTaxVersionId, stateNameGo, successMessage) {
            self.loadItemsPromise = null;
            self.validationMessages = null;
            if (successMessage && successMessage.length > 0) {
                common.logSuccess(successMessage);
            }
            $state.transitionTo('payroll.provincialTax', { provincialTaxHeaderId: 0, provincialTaxVersionId: provincialTaxVersionId }, { reload: true, inherit: true, notify: true });
        }

        function onResponseError(responseError) {
            self.loadItemsPromise = null;
            self.common.workflow.WorkflowIsRunning = false;
            self.validationMessages = common.responseErrorMessages(responseError);
        }

        function getMissedStateParams() {

            function getTaxHeaderIds(header, ids) {
                var headerId = ids.headerId;
                var versionId = ids.versionId;
                if (header) {
                    headerId = (!headerId && headerId > 0) ? headerId : header.Id;
                    if (!versionId || versionId < 1) {
                        var versionWithMaxId = _.max(header.ProvincialTaxVersions, function (version) { return version.Id; });
                        versionId = versionWithMaxId.Id;
                    }
                }
                ids.headerId = headerId;
                ids.versionId = versionId;
                return ids;
            }

            if ($state.params.provincialTaxHeaderId === null ||
                typeof $state.params.provincialTaxHeaderId === 'undefined' ||
                $state.params.provincialTaxHeaderId < 1 ||
                $state.params.provincialTaxVersionId === null ||
                typeof $state.params.provincialTaxVersionId == 'undefined' ||
                $state.params.provincialTaxVersionId < 1) {
                var ids = { headerId: $state.params.provincialTaxHeaderId, versionId: $state.params.provincialTaxVersionId };
                getTaxHeaderIds(resolveHeader, ids);
                if ($state.params.provincialTaxHeaderId != ids.headerId || $state.params.provincialTaxVersionId != ids.versionId) {
                    $state.go('payroll.provincialTax', { provincialTaxHeaderId: ids.headerId, provincialTaxVersionId: ids.versionId }, { notify: false });
                }
            }
        }

        function extendSelfByCommon(selfCommon) {
            return {
                floatApplySpecifiedNumberOfDecimalPlaces: function (c, n) { return common.floatApplySpecifiedNumberOfDecimalPlaces(c, n); },
                datePickerCallbackOnDoneEffectiveDate: function () { self.currentVersion.EffectiveDate = self.currentVersion.EffectiveDate > new Date() ? self.currentVersion.EffectiveDate : new Date(); },
                currentVersionSet: function (versionId) {
                    self.currentVersion = null;
                    if (typeof versionId !== 'undefined') {
                        self.currentVersion = angular.copy(_.find(self.ProvincialTaxVersions, function (version) {
                            return version.Id == versionId;
                        }));
                        selfCommon.customStatusId = null;
                        self.validationMessages = [];
                        selfCommon.workflow.SelectedActionId = null;
                        selfCommon.workflow.getActions(self.currentVersion);
                    }
                },
                currentVersionGet: function () {
                    return self.currentVersion;
                },
                onVersionClick: function (version) {
                    if (self.currentVersion.TaxVersionStatusId == ApplicationConstants.TaxVersionStatus.New || selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect || selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange) {
                        common.logWarning('Option to change version is disabled in "Edit" mode');
                    }
                    else {
                        $state.go('payroll.provincialTax', { provincialTaxHeaderId: $state.params.provincialTaxHeaderId, provincialTaxVersionId: version.Id }, { notify: false });
                        this.currentVersionSet(version.Id);
                    }
                },
            };
        }

        function extendByWorkflow(selfCommon) {
            function setActionNameInPlural(actionName) {
                var result = actionName;
                var lastSymbol = actionName.slice(-1);
                if (lastSymbol == 'e') {
                    result += 'd';
                }
                else {
                    result += 'ed';
                }
                return result;
            }

            function actionExecute(local, version, subdivisionId, actionName, actionCommandName) {
                var dlgOnCreate = dialogs.confirm('Payroll Provincial Tax Action', 'Are you sure you want to ' + actionName + ' this Payroll Provincial Tax?');
                dlgOnCreate.result.then(function (btn) {
                    onEvent();
                    selfCommon.loadItemsPromise = WorkflowApiService.executeCommand({ WorkflowPendingTaskId: (actionCommandName === 'ProvincialTaxHeaderNew') ? -1 : version.WorkflowPendingTaskId, CommandName: actionCommandName, Id: $state.params.provincialTaxHeaderId, SubdivisionId: subdivisionId, ProvincialTaxVersion: version }).then(
                        function (responseSucces) {
                            onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, $state.current.name, 'Payroll Provincial Tax ' + setActionNameInPlural(actionName));
                        },
                        function (responseError) {
                            onResponseError(responseError);
                        });
                }, function (btn) {
                    local.SelectedActionId = null;
                });
            }

            return {
                WorkflowAvailableActions: [],
                SelectedActionId: null,
                getActions: function (version) { WorkflowApiService.getWorkflowAvailableActions(this, version, ApplicationConstants.EntityType.ProvincialTaxVersion); },
                actionButtonOnClick: function (version, action) {
                    if (action.CommandName == 'ProvincialTaxVersionCorrect') {
                        selfCommon.customStatusId = selfCommon.customStatusType.ToCorrect;
                        this.WorkflowAvailableActions = [];
                    }
                    else if (action.CommandName == 'ProvincialTaxVersionScheduleChange') {
                        selfCommon.customStatusId = selfCommon.customStatusType.ToScheduleChange;
                        version.EffectiveDate = null;
                        this.WorkflowAvailableActions = [];
                    }
                },
                customButtonOnClick: function (version, subdivisionId, action) {
                    if (action == 'NewCreate') {
                        actionExecute(this, version, subdivisionId, 'Create', 'ProvincialTaxHeaderNew');
                    }
                    else if (action == 'NewCancel') {
                        // $state.transitionTo('payroll.search', {}, { reload: true, inherit: true, notify: true });
                        $state.go('ngtwo.m', { p: "payroll/payroll-taxes-search" });
                    }
                    else if (action == 'ToCorrect') {
                        actionExecute(this, version, subdivisionId, 'Correct', 'ProvincialTaxVersionCorrect');
                    }
                    else if (action == 'ToScheduleChange') {
                        actionExecute(this, version, subdivisionId, 'Schedule Change', 'ProvincialTaxVersionScheduleChange');
                    }
                    else if (action == 'Cancel') {
                        //selfCommon.currentVersionSet($state.params.provincialTaxVersionId);
                        $state.reload();//we need to reload to support page updates by other user
                    }
                },
            };
        }

        function extendByFieldViewConfig(selfCommon) {
            return {
                ptFieldViewConfigOnChangeStatusId: {
                    watchChangeEvent: '[currentVersion.TaxVersionStatusId, header.common.customStatusId]',
                    funcToCheckViewStatus: function (modelPrefix, fieldName) {

                        if ($state.params.provincialTaxVersionId === 0 || $state.params.provincialTaxVersionId === '0') {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                        else if (selfCommon.workflow.WorkflowIsRunning) {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        else if (selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect) {
                            if (modelPrefix == 'header' && fieldName == 'SubdivisionId') {
                                return ApplicationConstants.viewStatuses.view;
                            }
                            if (modelPrefix == 'header.currentVersion' && fieldName == 'EffectiveDate') {
                                return ApplicationConstants.viewStatuses.view;
                            }
                            else {
                                return ApplicationConstants.viewStatuses.edit;
                            }
                        }
                        else if (selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange) {
                            if (modelPrefix == 'header' && fieldName == 'SubdivisionId') {
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
                }
            };
        }

        function extendByTaxRates(selfCommon) {
            function recalcProvincialTaxRates(version) {
                if (version.ProvincialTaxRates.length == 1) {
                    version.ProvincialTaxRates[0].IncomeFrom = 0;
                    version.ProvincialTaxRates[0].IncomeTo = ApplicationConstants.max.currency;
                }
                else {
                    for (var i = version.ProvincialTaxRates.length; i > 1; i--) {
                        version.ProvincialTaxRates[i - 1].IncomeFrom = parseFloat(version.ProvincialTaxRates[i - 2].IncomeTo) + 0.01;
                    }
                    version.ProvincialTaxRates[0].IncomeFrom = 0;
                    version.ProvincialTaxRates[version.ProvincialTaxRates.length - 1].IncomeTo = ApplicationConstants.max.currency;
                }
            }
            return {
                provincialTaxRateAdd: function (version) {
                    version.ProvincialTaxRates.splice(version.ProvincialTaxRates.length - 1, 0, { IncomeFrom: 0, IncomeTo: null, RatePercentage: 0, Constant: 0 });
                    recalcProvincialTaxRates(version);
                },
                provincialTaxRateRemove: function (version, idx) {
                    version.ProvincialTaxRates.splice(idx, 1);
                    recalcProvincialTaxRates(version);
                },
                provincialTaxRateBlurOnIncomeTo: function (version, idx, rate) {
                    recalcProvincialTaxRates(version);
                    rate.IncomeTo = selfCommon.floatApplySpecifiedNumberOfDecimalPlaces(rate.IncomeTo);
                },
            };
      }


      
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.PayrollProvincialTaxController = {

        resolveHeader: ['$q', '$stateParams', 'PayrollApiService', function ($q, $stateParams, PayrollApiService) {
            var result = $q.defer();

            if ($stateParams.provincialTaxVersionId > 0) {
                PayrollApiService.getProvincialTaxHeaderByProvincialTaxVersionId($stateParams.provincialTaxVersionId).then(
                    function (responseSuccess) {
                        var sortedProvincialTaxVersions = responseSuccess.ProvincialTaxVersions
                            .sort(function (a, b) {
                                var dateA = new Date(a.EffectiveDate), dateB = new Date(b.EffectiveDate);
                                return dateB - dateA;
                            });
                        var activeProvincialTaxVersions = sortedProvincialTaxVersions.filter(function(r) {
                            return r.TaxVersionStatusId === ApplicationConstants.TaxVersionStatus.Active
                        });
                        var otherVersions = sortedProvincialTaxVersions.filter(function(r) {
                            return r.TaxVersionStatusId !== ApplicationConstants.TaxVersionStatus.Active
                        });
                        responseSuccess.ProvincialTaxVersions = activeProvincialTaxVersions.concat(otherVersions);
                        result.resolve(responseSuccess);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            }
            else if ($stateParams.provincialTaxHeaderId > 0) {
                PayrollApiService.getProvincialTaxHeaderByProvincialTaxHeaderId($stateParams.provincialTaxHeaderId).then(
                    function (responseSucces) {
                        result.resolve(responseSucces);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            }
            else {
                result.resolve({
                    Id: 0,
                    SubdivisionId: null,
                    CreatedDatetime: new Date(),
                    ProvincialTaxVersions: [{
                        Id: 0,
                        TaxVersionStatusId: 1,
                        EffectiveDate: new Date(),
                        TD1Minimum: 0,
                        WCBMaximum: 0,
                        CanadaEmploymentAmount: 0,
                        ProvincialTaxRates: [{
                            Id: 0,
                            IncomeFrom: 0,
                            IncomeTo: ApplicationConstants.max.currency,
                            RatePercentage: 0,
                            Constant: 0,
                        }],
                        ProvincialSurtaxRates: [{
                            Id: 0,
                            IncomeFrom: 0,
                            IncomeTo: ApplicationConstants.max.currency,
                            RatePercentage: 0,
                        }],
                        ProvincialHealthPremiums: [{
                            Id: 0,
                            IncomeFrom: 0,
                            IncomeTo: ApplicationConstants.max.currency,
                            RatePercentage: 0,
                            Constant: 0,
                        }],
                        TaxTypeHealthCare: {
                            Id: 0,
                            SourceDeductionTypeId: ApplicationConstants.SourceDeductionType.HealthCare,
                            IsEligible: true,
                            EmployeeRatePercentage: 0,
                            //EmployerMultiplerPercentage : 0,
                            //MinAge : 0,
                            //MaxAge : 0,
                            //MaxEarnings : 0,
                            //MaxInsurable : 0,
                            //AnnualExemption : 0,
                        },
                        TaxTypeCanadaPensionPlan: {
                            Id: 0,
                            SourceDeductionTypeId: ApplicationConstants.SourceDeductionType.CanadaPensionPlan,
                            IsEligible: true,
                            EmployeeRatePercentage: 0,
                            EmployerMultiplerPercentage: 0,
                            MinAge: 0,
                            MaxAge: 0,
                            MaxEarnings: 0,
                            //MaxInsurable : 0,
                            AnnualExemption: 0,
                        },
                        TaxTypeEmploymentInsurance: {
                            Id: 0,
                            SourceDeductionTypeId: ApplicationConstants.SourceDeductionType.EmploymentInsurance,
                            IsEligible: true,
                            EmployeeRatePercentage: 0,
                            EmployerMultiplerPercentage: 0,
                            MinAge: 0,
                            MaxAge: 0,
                            MaxEarnings: 0,
                            MaxInsurable: 0,
                            //AnnualExemption: 0,
                        },
                        TaxTypeParentalInsurancePlan: {
                            Id: 0,
                            SourceDeductionTypeId: ApplicationConstants.SourceDeductionType.ParentalInsurancePlan,
                            IsEligible: false,
                            EmployeeRatePercentage: 0,
                            EmployerMultiplerPercentage: 0,
                            //MinAge: 0,
                            //MaxAge: 0,
                            //MaxEarnings: 0,
                            MaxInsurable: 0,
                            //AnnualExemption: 0,
                        },
                        TaxTypeQuebecPensionPlan: {
                            Id: 0,
                            SourceDeductionTypeId: ApplicationConstants.SourceDeductionType.QuebecPensionPlan,
                            IsEligible: false,
                            EmployeeRatePercentage: 0,
                            EmployerMultiplerPercentage: 0,
                            MinAge: 0,
                            MaxAge: 0,
                            MaxEarnings: 0,
                            //MaxInsurable : 0,
                            AnnualExemption: 0,
                        },
                    }]
                });
            }

            return result.promise;
        }],

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var lists = {};

            lists.listCurrency = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
            lists.listSubdivision = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, ApplicationConstants.CountryCanada, CodeValueGroups.Country);
            lists.listTaxVersionStatus = CodeValueService.getCodeValues(CodeValueGroups.TaxVersionStatus);
            lists.listCustomStatus = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];

            result.resolve(lists);
            return result.promise;
        }],

    };

})(angular, Phoenix.App);