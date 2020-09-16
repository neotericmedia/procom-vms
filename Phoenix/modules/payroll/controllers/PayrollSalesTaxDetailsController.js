(function (angular, app) {
    'use strict';

    angular.module('phoenix.payroll.controllers').controller('PayrollSalesTaxDetailsController', PayrollSalesTaxDetailsController);

    /** @ngInject */
    PayrollSalesTaxDetailsController.$inject = ['$state', 'CodeValueService', 'common', 'commonDataService', 'NavigationService', 'PayrollApiService', 'WorkflowApiService', 'salesTaxHeader', 'salesTaxCodeValueList', 'salesTaxUsedCodes'];

    function PayrollSalesTaxDetailsController($state, CodeValueService, common, commonDataService, NavigationService, PayrollApiService, WorkflowApiService, salesTaxHeader, salesTaxCodeValueList, salesTaxUsedCodes) {

        NavigationService.setTitle('payroll-sales-tax-details');

        var self = this;

        angular.extend(self, {
            taxHeader: salesTaxHeader,
            taxCodeValueList: salesTaxCodeValueList,
            currentVersion: {},
            taxSubdivisions: [],
            validationMessages: [],
            selectedActionId: null,
            isWorflowRunning: false,
            ptFieldViewConfigOnChangeStatusId: {},

            init: init,
            actionChanged: actionChanged,
            setVersion: setVersion,
            onVersionClick: onVersionClick,
            fieldViewEditModeInit: fieldViewEditModeInit,
            removeCountry: removeCountry,
            taxCountryChanged: taxCountryChanged,
            radioChanged: radioChanged,
            getAvailableActions: getAvailableActions,
            salesTaxButtonsHandler: salesTaxButtonsHandler
        });

        self.init();

        function init() {

            var versionId = $state.params.salesTaxVersionId;

            self.currentVersion = angular.copy(_.find(self.taxHeader.SalesTaxVersions, function (version) {
                return version.Id == versionId;
            }));

            if (!self.currentVersion && salesTaxHeader && salesTaxHeader.SalesTaxVersions) {
                self.currentVersion = salesTaxHeader.SalesTaxVersions[0];
            }

            if (self.currentVersion) {
                getAvailableActions(self.currentVersion);
            }

            if (self.taxHeader.CountryId && self.taxHeader.CountryId > 0) {
                self.taxSubdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, self.taxHeader.CountryId, CodeValueGroups.Country);
            }

            filteredTaxCodes($state.params.salesTaxHeaderId, $state.params.salesTaxVersionId);

            self.fieldViewEditModeInit();
        }

        function getAvailableActions(version) {
            WorkflowApiService.getWorkflowAvailableActions(version, version, ApplicationConstants.EntityType.SalesTaxVersion);
        }

        function removeCountry() {
            self.taxHeader.CountryId = null;
            self.currentVersion.SalesTaxVersionRates = [];
        }

        function taxCountryChanged(country) {

            self.currentVersion.SalesTaxVersionRates = [];

            self.taxSubdivisions = [];

            if (country.id && country.id > 0) {

                self.taxSubdivisions = CodeValueService.getRelatedCodeValues(CodeValueGroups.Subdivision, country.id, CodeValueGroups.Country);

                angular.forEach(self.taxSubdivisions, function (subdivision) {
                    angular.extend(subdivision, { IsApplied: false, RatePercentage: null, SubdivisionId: subdivision.id });
                });

                self.currentVersion.SalesTaxVersionRates = angular.copy(self.taxSubdivisions);
            }
        }

        function radioChanged(rate) {
            if (!rate.IsApplied) {
                rate.RatePercentage = null;
            }
        }

        function salesTaxButtonsHandler(action, version, countryId, salesTaxId) {
            switch (action) {
                case 'Created':
                    actionExecute('SalesTaxHeaderCreate', version, countryId, salesTaxId, action);
                    break;
                case 'Corrected':
                    actionExecute('SalesTaxVersionCorrect', version, countryId, salesTaxId, action);
                    break;
                case 'Schedule Changed':
                    actionExecute('SalesTaxVersionScheduleChange', version, countryId, salesTaxId, action);
                    break;
                case 'Cancelled':
                    //self.setVersion($state.params.salesTaxVersionId);
                    $state.reload();//we need to reload to support page updates by other user
                    break;
                default:
                    $state.go('payroll.salesTaxes');
            }
        }

        function actionExecute(commandName, version, countryId, salesTaxId, action) {
            self.isWorkflowRunning = true;
            self.validationMessages = [];
            self.taxActionId = null;
            WorkflowApiService.executeCommand({ WorkflowPendingTaskId: (commandName === 'SalesTaxHeaderCreate') ? -1 : version.WorkflowPendingTaskId, CommandName: commandName, SalesTaxVersion: version, Id: self.taxHeader.Id, CountryId: countryId, SalesTaxId: salesTaxId }).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, $state.current.name, 'Payroll Sales Tax ' + action);
                },
                function (error) {
                    onResponseError(error);
                }
            );
        }

        function actionChanged(action, version) {
            if (action && action.CommandName && version) {
                version.WorkflowAvailableActions = [];
                switch (action.CommandName) {
                    case 'SalesTaxVersionCorrect':
                        self.selectedActionId = self.taxCodeValueList.actionStatusType.ToCorrect;
                        break;
                    case 'SalesTaxVersionScheduleChange':
                        version.EffectiveDate = null;
                        self.selectedActionId = self.taxCodeValueList.actionStatusType.ToScheduleChange;
                        break;
                    default: self.selectedActionId = null;
                }
            }
        }

        function onWorkflowEventSuccess(salesTaxVersionId, stateNameGo, message) {
            self.validationMessages = [];
            if (message && message.length > 0) {
                common.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'payroll.salesTaxDetails', ApplicationConstants.EntityType.SalesTaxHeader, ApplicationConstants.EntityType.SalesTaxVersion, salesTaxVersionId, { salesTaxHeaderId: 0, salesTaxVersionId: salesTaxVersionId });
        }

        function onResponseError(responseError) {
            self.isWorkflowRunning = false;
            self.validationMessages = common.responseErrorMessages(responseError);
        }

        function onVersionClick(version) {
            if (self.currentVersion.TaxVersionStatusId === ApplicationConstants.TaxVersionStatus.New || self.selectedActionId === self.taxCodeValueList.actionStatusType.ToCorrect || self.selectedActionId === self.taxCodeValueList.actionStatusType.ToScheduleChange) {
                common.logWarning('Option to change version is disabled in "Edit" mode');
            }
            else {
                $state.go('payroll.salesTaxDetails', { salesTaxHeaderId: $state.params.salesTaxHeaderId, salesTaxVersionId: version.Id }, { notify: false });
                self.setVersion(version.Id);
            }
        }

        function setVersion(versionId) {
            if (versionId) {
                self.currentVersion = angular.copy(_.find(self.taxHeader.SalesTaxVersions, function (version) {
                    return version.Id == versionId;
                }));
                self.selectedActionId = null;
                self.taxActionId = null;
                self.validationMessages = [];
                self.getAvailableActions(self.currentVersion);
            }
        }

        function filteredTaxCodes(taxHeaderId, taxVersionId) {

            self.usedTaxCodes = (salesTaxUsedCodes && salesTaxUsedCodes.Items) ? salesTaxUsedCodes.Items : [];
            var tHeaderId = parseInt(taxHeaderId, 10);
            var tVersionId = parseInt(taxVersionId, 10);

            if (isNaN(tHeaderId) || tHeaderId === 0 || isNaN(tVersionId) || tVersionId === 0) {

                var tempCodes = [];
                var TaxIds = _.map(self.usedTaxCodes, 'TaxId');

                angular.forEach(self.taxCodeValueList.taxCodes, function (code) {
                    if (TaxIds.indexOf(code.id) === -1) {
                        tempCodes.push(code);
                    }
                });

                self.taxCodeValueList.taxCodes = tempCodes;
            }
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                watchChangeEvent: '[currentVersion.TaxVersionStatusId, tax.selectedActionId]',

                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if ($state.params.salesTaxVersionId === 0 || $state.params.salesTaxVersionId === '0') {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else if (self.isWorkflowRunning) {
                        return ApplicationConstants.viewStatuses.view;
                    }
                    else if (self.selectedActionId === self.taxCodeValueList.actionStatusType.ToCorrect) {

                        if (modelPrefix == 'tax.taxHeader' && fieldName == 'CountryId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'tax.taxHeader' && fieldName == 'SalesTaxId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'tax.currentVersion' && fieldName == 'EffectiveDate') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        else {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                    }
                    else if (self.selectedActionId === self.taxCodeValueList.actionStatusType.ToScheduleChange) {

                        if (modelPrefix == 'tax.taxHeader' && fieldName == 'CountryId') {
                            return ApplicationConstants.viewStatuses.view;
                        }
                        if (modelPrefix == 'tax.taxHeader' && fieldName == 'SalesTaxId') {
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
            };

            self.ptFieldViewConfigOnChangeStatusId = viewEditModeConfig;
        }

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.PayrollSalesTaxDetailsController = {

        salesTaxHeader: ['$q', '$stateParams', 'PayrollApiService', function ($q, $stateParams, PayrollApiService) {
            var result = $q.defer();

            if ($stateParams.salesTaxHeaderId && $stateParams.salesTaxHeaderId > 0 && $stateParams.salesTaxVersionId && $stateParams.salesTaxVersionId > 0) {
                PayrollApiService.getSalesTaxHeaderByVersion($stateParams.salesTaxVersionId).then(
                    function (success) {
                        result.resolve(success);
                    },
                    function (error) {
                        result.reject(error);
                    }
                );
            }
            else {
                result.resolve({
                    Id: 0,
                    CountryId: null,
                    SalesTaxId: null,
                    SalesTaxVersions: [{
                        Id: 0,
                        SourceId: null,
                        TaxVersionStatusId: 1,
                        EffectiveDate: new Date(),
                        SalesTaxVersionRates: []
                    }]
                });
            }

            return result.promise;
        }],

        salesTaxCodeValueList: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var list = {};

            list.countries = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Country), function (country) { return country.id == ApplicationConstants.CountryCanada; });
            list.taxVersionStatuses = CodeValueService.getCodeValues(CodeValueGroups.TaxVersionStatus);
            list.taxCodes = CodeValueService.getCodeValues(CodeValueGroups.SalesTax);
            list.actionStatusType = { ToCorrect: 1, ToScheduleChange: 2 };
            list.actionStatuses = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];

            result.resolve(list);
            return result.promise;
        }],

        salesTaxUsedCodes: ['$q', 'PayrollApiService', function ($q, PayrollApiService) {

            var result = $q.defer();
            var taxCodesParams = oreq.request().withSelect(['Id', 'TaxId']).url();

            PayrollApiService.getAllSalesTaxes('', taxCodesParams).then(
                    function (success) {
                        result.resolve(success);
                    },
                    function (error) {
                        result.reject(error);
                    }
                );

            return result.promise;
        }]
    };

})(angular, Phoenix.App);