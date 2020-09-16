(function (services) {
    'use strict';

    var serviceId = 'PayrollApiService';

    angular.module('phoenix.payroll.services').factory(serviceId, ['$q', 'common', 'phoenixapi', 'SmartTableService', PayrollApiService]);

    function PayrollApiService($q, common, phoenixapi, SmartTableService) {

        var service = {
            //  queries:
            getFederalTaxHeaderByFederalTaxHeaderId: getFederalTaxHeaderByFederalTaxHeaderId,
            getFederalTaxHeaderByFederalTaxVersionId:getFederalTaxHeaderByFederalTaxVersionId,
            getProvincialTaxHeaderByProvincialTaxHeaderId: getProvincialTaxHeaderByProvincialTaxHeaderId,
            getProvincialTaxHeaderByProvincialTaxVersionId: getProvincialTaxHeaderByProvincialTaxVersionId,
            getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId: getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId,
            getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId:getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId,
            getAllPayrolls: getAllPayrolls,
            getAllSalesTaxes: getAllSalesTaxes,
            getSalesTaxHeader: getSalesTaxHeader,
            getSalesTaxHeaderByVersion: getSalesTaxHeaderByVersion
        };

        return service;

        //  queries:
        function getFederalTaxHeaderByFederalTaxHeaderId(federalTaxHeaderId, oDataParams) {
            return phoenixapi.query('Payroll/getFederalTaxHeaderByFederalTaxHeaderId/' + federalTaxHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getFederalTaxHeaderByFederalTaxVersionId(federalTaxVersionId, oDataParams) {
            return phoenixapi.query('Payroll/getFederalTaxHeaderByFederalTaxVersionId/' + federalTaxVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getProvincialTaxHeaderByProvincialTaxHeaderId(payrollProvincialTaxHeaderId, oDataParams) {
            return phoenixapi.query('Payroll/getProvincialTaxHeaderByProvincialTaxHeaderId/' + payrollProvincialTaxHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getProvincialTaxHeaderByProvincialTaxVersionId(provincialTaxVersionId, oDataParams) {
            return phoenixapi.query('Payroll/getProvincialTaxHeaderByProvincialTaxVersionId/' + provincialTaxVersionId +(oDataParams && oDataParams !== undefined ? ('?' +oDataParams): ''));
        }
        function getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId(subdivisionId, oDataParams) {
            return phoenixapi.query('Payroll/getActiveCurrentlyEffectiveProvincialTaxVersionTaxTypeBySubdivisionId/' + subdivisionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId(subdivisionId, oDataParams) {
            return phoenixapi.query('Payroll/getActiveCurrentlyEffectiveFederalTaxVersionBySubdivisionId/' + subdivisionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getAllPayrolls(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('payroll/getAllPayrolls?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getAllSalesTaxes(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('payroll/getAllSalesTaxes?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getSalesTaxHeader(salesTaxHeaderId) {
            return phoenixapi.query('payroll/getSalesTaxHeader/taxHeader/' + salesTaxHeaderId);
        }
        function getSalesTaxHeaderByVersion(salesTaxHeaderVersionId) {
            return phoenixapi.query('payroll/getSalesTaxHeaderByVersionId/taxHeaderVersion/' + salesTaxHeaderVersionId);
        }
    }

}(Phoenix.Services));