import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../../common/services/navigation.service';
import { CommonService } from '../../../common/index';
import { CodeValueService } from '../../../common/services/code-value.service';
import { CodeValue } from '../../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../../common/model/index';
import { PhxDataTableSummaryItem } from './../../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'payroll-taxes-federal',
  templateUrl: './payroll-taxes-federal.component.html',
  styleUrls: ['./payroll-taxes-federal.component.less']
})
export class PayrollTaxesFederalComponent implements OnInit, OnDestroy {
  codeValueGroups: any;
  ApplicationConstants: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService
  ) {
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.navigationService.setTitle('Payroll Federal Taxes', ['icon icon-payroll']);

    this.onLoad();

    // if (!app.resolve) app.resolve = {};
    // app.resolve.PayrollFederalTaxController = {

    //     resolveHeader: ['$q', '$stateParams', 'PayrollApiService', function ($q, $stateParams, PayrollApiService) {
    //         var result = $q.defer();

    //         if ($stateParams.federalTaxVersionId > 0) {
    //             PayrollApiService.getFederalTaxHeaderByFederalTaxVersionId($stateParams.federalTaxVersionId).then(
    //                 function (responseSucces) {
    //                     result.resolve(responseSucces);
    //                 },
    //                 function (responseError) {
    //                     result.reject(responseError);
    //                 }
    //             );
    //         }
    //         else if ($stateParams.federalTaxHeaderId > 0) {
    //             PayrollApiService.getFederalTaxHeaderByFederalTaxHeaderId($stateParams.federalTaxHeaderId).then(
    //                 function (responseSucces) {
    //                     result.resolve(responseSucces);
    //                 },
    //                 function (responseError) {
    //                     result.reject(responseError);
    //                 }
    //             );
    //         }
    //         else {
    //             result.resolve({
    //                 Id: 0,
    //                 CountryId: null,
    //                 CreatedDatetime: new Date(),
    //                 FederalTaxVersions: [{
    //                     Id: 0,
    //                     TaxVersionStatusId: 1,
    //                     EffectiveDate: new Date(),
    //                     TD1Minimum: 0,
    //                     AbatementRatePercentage: 0,
    //                     NonResidentWithholdingPercentage: 0,
    //                     FederalTaxRates: [{
    //                         Id: 0,
    //                         IncomeFrom: 0,
    //                         IncomeTo: ApplicationConstants.max.currency,
    //                         RatePercentage: 0,
    //                         Constant: 0,
    //                     }]
    //                 }]
    //             });
    //         }

    //         return result.promise;
    //     }],

    // resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
    //     var result = $q.defer();
    //     var lists = {};

    //     lists.listCurrency = CodeValueService.getCodeValues(CodeValueGroups.Currency, true);
    //     lists.listCountry = _.filter(CodeValueService.getCodeValues(CodeValueGroups.Country), function (country) { return country.id == ApplicationConstants.CountryCanada; });
    //     lists.listTaxVersionStatus = CodeValueService.getCodeValues(CodeValueGroups.TaxVersionStatus);
    //     lists.listCustomStatus = [{ id: 1, code: 'ToCorrect', text: 'To Correct' }, { id: 2, code: 'ToScheduleChange', text: 'To Schedule Change' }];

    //     result.resolve(lists);
    //     return result.promise;
    // }],

    // };
  }

  ngOnDestroy() {}

  onLoad() {
    // if (typeof resolveHeader === 'undefined' || resolveHeader === null || common.isEmptyObject(resolveHeader)) { return; }
    //     getMissedStateParams();
    //     angular.extend(self, resolveHeader, {
    //         validationMessages: [],
    //         common: {
    //             workflow: {},
    //             lists: resolveCodeValueLists,
    //             currentVersion: {},
    //             loadItemsPromise: null,
    //             customStatusId: null,
    //             customStatusType: {
    //                 ToCorrect: 1,
    //                 ToScheduleChange: 2,
    //             }
    //         }
    //     });
    //     angular.extend(self.common, extendSelfByCommon(self.common));
    //     angular.extend(self.common.workflow, extendByWorkflow(self.common));
    //     angular.extend(self.common, extendByFieldViewConfig(self.common));
    //     angular.extend(self.common, extendByTaxRates(self.common));
    //     self.common.currentVersionSet($state.params.federalTaxVersionId);
  }

  // onEvent() {
  //         self.common.workflow.SelectedActionId = null;
  //         self.common.workflow.WorkflowIsRunning = true;
  //         self.validationMessages = null;
  // }

  // onResponseSuccesWatchWorkflowEvent(federalTaxVersionId, stateNameGo, successMessage) {
  //     self.loadItemsPromise = null;
  //     self.validationMessages = null;
  //     if (successMessage && successMessage.length > 0) {
  //         common.logSuccess(successMessage);
  //     }
  //     commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, 'payroll.federalTax', ApplicationConstants.EntityType.FederalTaxHeader, ApplicationConstants.EntityType.FederalTaxVersion, federalTaxVersionId, { federalTaxHeaderId: 0, federalTaxVersionId: federalTaxVersionId });
  // }

  // onResponseSuccesStateGo(federalTaxVersionId, stateNameGo, successMessage) {
  //     self.loadItemsPromise = null;
  //     self.validationMessages = null;
  //     if (successMessage && successMessage.length > 0) {
  //         common.logSuccess(successMessage);
  //     }
  //     $state.transitionTo('payroll.federalTax', { federalTaxHeaderId: 0, federalTaxVersionId: federalTaxVersionId }, { reload: true, inherit: true, notify: true });
  // }

  // onResponseError(responseError) {
  //     self.loadItemsPromise = null;
  //     self.common.workflow.WorkflowIsRunning = false;
  //     self.validationMessages = common.responseErrorMessages(responseError);
  // }

  // getTaxHeaderIds(header, ids) {
  //     var headerId = ids.headerId;
  //     var versionId = ids.versionId;
  //     if (header) {
  //         headerId = (!headerId && headerId > 0) ? headerId : header.Id;
  //         if (!versionId || versionId < 1) {
  //             var versionWithMaxId = _.max(header.FederalTaxVersions, function (version) { return version.Id; });
  //             versionId = versionWithMaxId.Id;
  //         }
  //     }
  //     ids.headerId = headerId;
  //     ids.versionId = versionId;
  //     return ids;
  // }

  // getMissedStateParams() {
  //     if ($state.params.federalTaxHeaderId === null ||
  //         typeof $state.params.federalTaxHeaderId === 'undefined' ||
  //         $state.params.federalTaxHeaderId < 1 ||
  //         $state.params.federalTaxVersionId === null ||
  //         typeof $state.params.federalTaxVersionId == 'undefined' ||
  //         $state.params.federalTaxVersionId < 1) {
  //         var ids = { headerId: $state.params.federalTaxHeaderId, versionId: $state.params.federalTaxVersionId };
  //         getTaxHeaderIds(resolveHeader, ids);
  //         if ($state.params.federalTaxHeaderId != ids.headerId || $state.params.federalTaxVersionId != ids.versionId) {
  //             $state.go('payroll.federalTax', { federalTaxHeaderId: ids.headerId, federalTaxVersionId: ids.versionId }, { notify: false });
  //         }
  //     }
  // }

  // extendSelfByCommon(selfCommon) {
  //     return {
  //         floatApplySpecifiedNumberOfDecimalPlaces: function (c, n) { return common.floatApplySpecifiedNumberOfDecimalPlaces(c, n); },
  //         datePickerCallbackOnDoneEffectiveDate: function () { self.currentVersion.EffectiveDate = self.currentVersion.EffectiveDate > new Date() ? self.currentVersion.EffectiveDate : new Date(); },
  //         currentVersionSet: function (versionId) {
  //             self.currentVersion = null;
  //             if (typeof versionId !== 'undefined') {
  //                 self.currentVersion = angular.copy(_.find(self.FederalTaxVersions, function (version) {
  //                     return version.Id == versionId;
  //                 }));
  //                 selfCommon.customStatusId = null;
  //                 self.validationMessages = [];
  //                 selfCommon.workflow.SelectedActionId = null;
  //                 selfCommon.workflow.getActions(self.currentVersion);
  //             }
  //         },
  //         currentVersionGet: function () {
  //             return self.currentVersion;
  //         },
  //         onVersionClick: function (version) {
  //             if (self.currentVersion.TaxVersionStatusId == ApplicationConstants.TaxVersionStatus.New || selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect || selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange) {
  //                 common.logWarning('Option to change version is disabled in "Edit" mode');
  //             }
  //             else {
  //                 $state.go('payroll.federalTax', { federalTaxHeaderId: $state.params.federalTaxHeaderId, federalTaxVersionId: version.Id }, { notify: false });
  //                 this.currentVersionSet(version.Id);
  //             }
  //         },
  //     };
  // }

  // setActionNameInPlural(actionName) {
  //     var result = actionName;
  //     var lastSymbol = actionName.slice(-1);
  //     if (lastSymbol == 'e') {
  //         result += 'd';
  //     }
  //     else {
  //         result += 'ed';
  //     }
  //     return result;
  // }

  // actionExecute(local, version, countryId, actionName, actionCommandName) {
  //     var dlgOnCreate = dialogs.confirm('Payroll Federal Tax Action', 'Are you sure you want to ' + actionName + ' this Payroll Federal Tax?');
  //     dlgOnCreate.result.then(function (btn) {
  //         onEvent();
  //         selfCommon.loadItemsPromise = WorkflowService.executeCommand({ WorkflowPendingTaskId: (actionCommandName === 'FederalTaxHeaderNew') ? -1 : version.WorkflowPendingTaskId, CommandName: actionCommandName, Id: $state.params.federalTaxHeaderId, CountryId: countryId, FederalTaxVersion: version }).then(
  //             function (responseSucces) {
  //                 onResponseSuccesWatchWorkflowEvent(responseSucces.EntityId, $state.current.name, 'Payroll Federal Tax ' + setActionNameInPlural(actionName));
  //             },
  //             function (responseError) {
  //                 onResponseError(responseError);
  //             });
  //     }, function (btn) {
  //         local.SelectedActionId = null;
  //     });
  // }

  // extendByWorkflow(selfCommon) {
  //     return {
  //         WorkflowAvailableActions: [],
  //         SelectedActionId: null,
  //         getActions: function (version) { WorkflowService.getWorkflowAvailableActions(this, version, ApplicationConstants.EntityType.FederalTaxVersion); },
  //         actionButtonOnClick: function (version, action) {
  //             if (action.CommandName == 'FederalTaxVersionCorrect') {
  //                 selfCommon.customStatusId = selfCommon.customStatusType.ToCorrect;
  //                 this.WorkflowAvailableActions = [];
  //             }
  //             else if (action.CommandName == 'FederalTaxVersionScheduleChange') {
  //                 selfCommon.customStatusId = selfCommon.customStatusType.ToScheduleChange;
  //                 version.EffectiveDate = null;
  //                 this.WorkflowAvailableActions = [];
  //             }
  //         },
  //         customButtonOnClick: function (version, countryId, action) {
  //             if (action == 'NewCreate') {
  //                 actionExecute(this, version, countryId, 'Create', 'FederalTaxHeaderNew');
  //             }
  //             else if (action == 'NewCancel') {
  //                 $state.transitionTo('payroll.search', {}, { reload: true, inherit: true, notify: true });
  //             }
  //             else if (action == 'ToCorrect') {
  //                 actionExecute(this, version, countryId, 'Correct', 'FederalTaxVersionCorrect');
  //             }
  //             else if (action == 'ToScheduleChange') {
  //                 actionExecute(this, version, countryId, 'Schedule Change', 'FederalTaxVersionScheduleChange');
  //             }
  //             else if (action == 'Cancel') {
  //                 //selfCommon.currentVersionSet($state.params.federalTaxVersionId);
  //                 $state.reload();//we need to reload to support page updates by other user
  //             }
  //         },
  //     };
  // }

  // extendByFieldViewConfig(selfCommon) {
  //     return {
  //         ptFieldViewConfigOnChangeStatusId: {
  //             watchChangeEvent: '[currentVersion.TaxVersionStatusId, header.common.customStatusId]',
  //             funcToCheckViewStatus: function (modelPrefix, fieldName) {

  //                 if ($state.params.federalTaxVersionId === 0 || $state.params.federalTaxVersionId === '0') {
  //                     return ApplicationConstants.viewStatuses.edit;
  //                 }
  //                 else if (selfCommon.workflow.WorkflowIsRunning) {
  //                     return ApplicationConstants.viewStatuses.view;
  //                 }
  //                 else if (selfCommon.customStatusId == selfCommon.customStatusType.ToCorrect) {
  //                     if (modelPrefix == 'header' && fieldName == 'CountryId') {
  //                         return ApplicationConstants.viewStatuses.view;
  //                     }
  //                     if (modelPrefix == 'header.currentVersion' && fieldName == 'EffectiveDate') {
  //                         return ApplicationConstants.viewStatuses.view;
  //                     }
  //                     else {
  //                         return ApplicationConstants.viewStatuses.edit;
  //                     }
  //                 }
  //                 else if (selfCommon.customStatusId == selfCommon.customStatusType.ToScheduleChange) {
  //                     if (modelPrefix == 'header' && fieldName == 'CountryId') {
  //                         return ApplicationConstants.viewStatuses.view;
  //                     }
  //                     return ApplicationConstants.viewStatuses.edit;
  //                 }
  //                 else {
  //                     return ApplicationConstants.viewStatuses.view;
  //                 }
  //             },
  //             funcToPassMessages: function (message) {
  //                 common.logWarning(message);
  //             }
  //         }
  //     };
  // }

  // recalcFederalTaxRates(version) {
  //     if (version.FederalTaxRates.length == 1) {
  //         version.FederalTaxRates[0].IncomeFrom = 0;
  //         version.FederalTaxRates[0].IncomeTo = ApplicationConstants.max.currency;
  //     }
  //     else {
  //         for (var i = version.FederalTaxRates.length; i > 1; i--) {
  //             version.FederalTaxRates[i - 1].IncomeFrom = parseFloat(version.FederalTaxRates[i - 2].IncomeTo) + 0.01;
  //         }
  //         version.FederalTaxRates[0].IncomeFrom = 0;
  //         version.FederalTaxRates[version.FederalTaxRates.length - 1].IncomeTo = ApplicationConstants.max.currency;
  //     }
  // }

  // extendByTaxRates(selfCommon) {
  //     return {
  //         provincialTaxRateAdd: function (version) {
  //             version.FederalTaxRates.splice(version.FederalTaxRates.length - 1, 0, { IncomeFrom: 0, IncomeTo: null, RatePercentage: 0, Constant: 0 });
  //             recalcFederalTaxRates(version);
  //         },
  //         provincialTaxRateRemove: function (version, idx) {
  //             version.FederalTaxRates.splice(idx, 1);
  //             recalcFederalTaxRates(version);
  //         },
  //         provincialTaxRateBlurOnIncomeTo: function (version, idx, rate) {
  //             recalcFederalTaxRates(version);
  //             rate.IncomeTo = selfCommon.floatApplySpecifiedNumberOfDecimalPlaces(rate.IncomeTo);
  //         },
  //     };
  // }
}
