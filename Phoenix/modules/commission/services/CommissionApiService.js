(function (services) {
    'use strict';

    var serviceId = 'CommissionApiService';

    angular.module('phoenix.payroll.services').factory(serviceId, ['$q', 'common', 'phoenixapi', 'SmartTableService', 'AssignmentDataService', 'commonDataService', CommissionApiService]);

    function CommissionApiService($q, common, phoenixapi, SmartTableService, AssignmentDataService, commonDataService) {

        var service = {
            //  queries:
            getInternalUserProfileList: getInternalUserProfileList,
            getCommissionUserProfileListWithRatesOnly: getCommissionUserProfileListWithRatesOnly,
            getCommissionRateHeadersByCommissionUserProfile: getCommissionRateHeadersByCommissionUserProfile,
            getCommissionRatesByCommissionUserProfile: getCommissionRatesByCommissionUserProfile,

            getCommissionRateHeaderByCommissionRateHeaderId: getCommissionRateHeaderByCommissionRateHeaderId,
            getCommissionRateHeaderByCommissionRateVersionId: getCommissionRateHeaderByCommissionRateVersionId,

            getListOrganizationInternal: getListOrganizationInternal,
            getListOrganizationClient: getListOrganizationClient,
            getAllSalesPatterns: getAllSalesPatterns,
            getSalesPattern: getSalesPattern,
            getCommissionRateHeaderUsers: getCommissionRateHeaderUsers,
            commissionDiscardSalesPattern: commissionDiscardSalesPattern,
            commissionSaveSalesPattern: commissionSaveSalesPattern,
            getAllAdjustments: getAllAdjustments,
            saveCommissionTransaction: saveCommissionTransaction,
            getCommissionHeaderById: getCommissionHeaderById,
            getAllWorkorders: getAllWorkorders,
            getCommissionReport: getCommissionReport,
            finalizeCommissionReport: finalizeCommissionReport,
            getCommissionPendingInterestReport: getCommissionPendingInterestReport,
            getPendingInterestSearch: getPendingInterestSearch,
            getPendingInterestTotal: getPendingInterestTotal,
            changeRecurring: changeRecurring,
            convertCommissionAdjustmentApiToUi: convertCommissionAdjustmentApiToUi,
            convertCommissionAdjustmentUiToApi: convertCommissionAdjustmentUiToApi
        };

        return service;

        //  queries:
        function getInternalUserProfileList(oDataParams) {
            return phoenixapi.query('Commission/getInternalUserProfileList?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }

        function getCommissionUserProfileListWithRatesOnly(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('Commission/getCommissionUserProfileListWithRatesOnly?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getCommissionRateHeadersByCommissionUserProfile(commissionUserProfileId, oDataParams) {
            return phoenixapi.query('Commission/getCommissionRateHeadersByCommissionUserProfile/' + commissionUserProfileId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getCommissionRatesByCommissionUserProfile(tableState, oDataParams, commissionUserProfileId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            var params = (oDataParams && oDataParams !== undefined ? ('?' + oDataParams + '&') : '') + '&' + tableStateParams;
            return phoenixapi.query('Commission/getCommissionRatesByCommissionUserProfile/' + commissionUserProfileId + params);
        }

        function getCommissionRateHeaderByCommissionRateVersionId(commissionRateVersionId, oDataParams) {
            return phoenixapi.query('Commission/getCommissionRateHeaderByCommissionRateVersionId/' + commissionRateVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getCommissionRateHeaderByCommissionRateHeaderId(commissionRateHeaderId, oDataParams) {
            return phoenixapi.query('Commission/getCommissionRateHeaderByCommissionRateHeaderId/' + commissionRateHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getListOrganizationInternal(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
            var result = $q.defer();
            result.resolve(commonDataService.getListOrganizationInternal());
            return result.promise;
        }

        function getListOrganizationClient(oDataParams) {
            oDataParams = oDataParams || oreq.request().
            withExpand(['OrganizationAddresses, OrganizationClientRoles']).
            withSelect(['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax', 'OrganizationClientRoles/ClientSalesTaxDefaultId']).url();
            var result = $q.defer();
            if (common.isEmptyObject(AssignmentDataService.getListOrganizationClient())) {
                phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams).then(
                    function (response) {
                        AssignmentDataService.setListOrganizationClient(response.Items);
                        result.resolve(response.Items);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    });
            } else {
                result.resolve(AssignmentDataService.getListOrganizationClient());
            }
            return result.promise;
        }

        function getAllSalesPatterns(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('commission/getAllSalesPatterns?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getSalesPattern(salesPatternId, oDataParams) {
            return phoenixapi.query('commission/getSalesPattern/' + salesPatternId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getCommissionRateHeaderUsers(oDataParams) {
            return phoenixapi.query('commission/getCommissionRateHeaderUsers?' + (oDataParams && oDataParams !== undefined ? oDataParams : ''));
        }

        function commissionDiscardSalesPattern(discardCommand) {
            return phoenixapi.command("CommissionDiscardSalesPattern", discardCommand);
        }

        function commissionSaveSalesPattern(saveCommand) {
            return phoenixapi.command("CommissionSaveSalesPattern", saveCommand);
        }

        function getAllAdjustments(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('commission/getAllAdjustments?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getCommissionHeaderById(commissionId, oDataParams) {
            return phoenixapi.query('commission/getCommissionHeaderById/' + commissionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function saveCommissionTransaction(saveCommand) {
            return phoenixapi.command("CommissionAdjustmentNew", saveCommand);
        }

        function getAllWorkorders(oDataParams) {
            return phoenixapi.query('assignment/getSearch?' + (oDataParams && oDataParams !== undefined ? oDataParams : ''));
        }

        function getCommissionReport(reportCommand) {
            return phoenixapi.command("CommissionReport", reportCommand);
        }

        function finalizeCommissionReport(reportCommand) {
            return phoenixapi.command("CommissionReportFinalize", reportCommand);
        }

        function getCommissionPendingInterestReport(userProfileId) {
            return phoenixapi.query('commission/PendingInterestReport/' + userProfileId);
        }

        function getPendingInterestSearch(tableState, oDataParams, userProfileId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('commission/PendingInterestSearch/' + userProfileId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getPendingInterestTotal(userProfileId) {
            return phoenixapi.query('commission/PendingInterestTotal/' + userProfileId);
        }

        function changeRecurring(command) {
            return phoenixapi.command("CommissionAdjustmentHeaderStatusChange", command);
        }

        function convertCommissionAdjustmentApiToUi(commissionHeader) {
            if (commissionHeader) {
                commissionHeader.isAdjustmentAmountAdd = getIsAdjustmentAmountAddFromAdjustmentAmount(commissionHeader.AdjustmentAmountNet);
                commissionHeader.AdjustmentAmountNet = Math.abs(commissionHeader.AdjustmentAmountNet);
                _.forEach(commissionHeader.CommissionAdjustmentDetails, function(detail) {
                    detail.AdjustmentAmount = Math.abs(detail.AdjustmentAmount);
                });
            }
            return commissionHeader;
        }

        function convertCommissionAdjustmentUiToApi(commissionHeaderUi) {
            var commissionHeader = angular.copy(commissionHeaderUi);
            if (commissionHeader) {
                commissionHeader.AdjustmentAmountNet = commissionHeader.AdjustmentAmountNet * getMultiplierIsAdjustmentAmountAdd(commissionHeader.isAdjustmentAmountAdd);
                _.forEach(commissionHeader.CommissionAdjustmentDetails, function(detail) {
                    detail.AdjustmentAmount = detail.AdjustmentAmount * getMultiplierIsAdjustmentAmountAdd(commissionHeader.isAdjustmentAmountAdd);
                });
                delete commissionHeader.isAdjustmentAmountAdd;
            }
            return commissionHeader;
        }

        function getMultiplierIsAdjustmentAmountAdd(isAdjustmentAmountAdd) {
            return isAdjustmentAmountAdd ? 1 : -1;
        }

        function getIsAdjustmentAmountAddFromAdjustmentAmount(AdjustmentAmount) {
            return AdjustmentAmount >= 0;
        }
    }

}(Phoenix.Services));