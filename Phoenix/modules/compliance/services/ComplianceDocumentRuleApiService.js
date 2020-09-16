(function (services) {
    'use strict';

    var serviceId = 'ComplianceDocumentRuleApiService';

    angular.module('phoenix.compliancedocumentrule.services').factory(serviceId, ['phoenixapi', 'common', 'SmartTableService', ComplianceDocumentRuleApiService]);

    function ComplianceDocumentRuleApiService(phoenixapi, common, SmartTableService) {
        common.setControllerName(serviceId);

        var service = {
            //  PageResult
            getListComplianceDocumentRulesAll: getListComplianceDocumentRulesAll,
            getListComplianceDocumentRulesOriginal: getListComplianceDocumentRulesOriginal,
            //getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeId: getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeId,
            getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient: getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient,
            getListUserDefinedCodeComplianceDocumentTypes: getListUserDefinedCodeComplianceDocumentTypes,
            getListUserDefinedCodeComplianceDocumentTypesByTableState: getListUserDefinedCodeComplianceDocumentTypesByTableState,
            getListComplianceDocumentsByEntityTypeIdAndEntityId: getListComplianceDocumentsByEntityTypeIdAndEntityId,
            getListComplianceDocumentExpiry: getListComplianceDocumentExpiry, 
            getListComplianceDocumentDeclined: getListComplianceDocumentDeclined, 
            //  SingleResult
            getByComplianceDocumentRuleId: getByComplianceDocumentRuleId,
            getByUserDefinedCodeComplianceDocumentTypeId: getByUserDefinedCodeComplianceDocumentTypeId,
            //  Commands
            complianceDocumentRuleUserActionNew: complianceDocumentRuleUserActionNew,
            complianceDocumentRuleUserActionSave: complianceDocumentRuleUserActionSave,
            complianceDocumentRuleUserActionSubmit: complianceDocumentRuleUserActionSubmit,
            userDefinedCodeComplianceDocumentTypeNew: userDefinedCodeComplianceDocumentTypeNew,
            userDefinedCodeComplianceDocumentTypeSave: userDefinedCodeComplianceDocumentTypeSave,
            userDefinedCodeComplianceDocumentTypeDiscard: userDefinedCodeComplianceDocumentTypeDiscard,
            userDefinedCodeComplianceDocumentTypeSubmit: userDefinedCodeComplianceDocumentTypeSubmit,
            userDefinedCodeComplianceDocumentTypeActivate: userDefinedCodeComplianceDocumentTypeActivate,
            userDefinedCodeComplianceDocumentTypeInactivate: userDefinedCodeComplianceDocumentTypeInactivate,
        };

        return service;
        //  PageResult
        function getListComplianceDocumentRulesAll(oDataParams) {
            return phoenixapi.query('ComplianceDocumentRule/getListComplianceDocumentRulesAll?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getListUserDefinedCodeComplianceDocumentTypes(oDataParams) {
            return phoenixapi.query('ComplianceDocumentType/complianceDocumentTypes?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getListUserDefinedCodeComplianceDocumentTypesByTableState(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('ComplianceDocumentRule/getListUserDefinedCodeComplianceDocumentTypes' + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getListComplianceDocumentRulesOriginal(oDataParams) {
            return phoenixapi.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginal?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        //function getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeId(tableState, oDataParams, complianceDocumentRuleAreaTypeId) {
        //    var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
        //    return phoenixapi.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeId/' + complianceDocumentRuleAreaTypeId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        //}
        function getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient(tableState, oDataParams, args) {
            var complianceDocumentRuleAreaTypeId = args[0];
            var organizationIdClient = args[1];
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('ComplianceDocumentRule/getListComplianceDocumentRulesOriginalByComplianceDocumentRuleAreaTypeIdAndOrganizationIdClient/' + complianceDocumentRuleAreaTypeId + '/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getListComplianceDocumentExpiry(tableState, oDataParams, args) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('ComplianceDocument/getListComplianceDocumentExpiry?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        
        function getListComplianceDocumentDeclined(tableState, oDataParams, args) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('ComplianceDocument/getListComplianceDocumentDeclined?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        //  SingleResult
        function getByComplianceDocumentRuleId(complianceDocumentRuleId, oDataParams) {
            return phoenixapi.query('ComplianceDocumentRule?id=' + complianceDocumentRuleId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getByUserDefinedCodeComplianceDocumentTypeId(userDefinedCodeComplianceDocumentTypeId, oDataParams) {
            return phoenixapi.query('ComplianceDocumentType/' + userDefinedCodeComplianceDocumentTypeId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getListComplianceDocumentsByEntityTypeIdAndEntityId(entityTypeId, entityId, oDataParams) {
            return phoenixapi.query('ComplianceDocument/getListComplianceDocumentsByEntityTypeIdAndEntityId/' + entityTypeId + '/' + entityId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        //  Commands 
        function complianceDocumentRuleUserActionNew(command) {
            return phoenixapi.command('ComplianceDocumentRuleUserActionNew', command);
        }
        function complianceDocumentRuleUserActionSave(command) {
            return phoenixapi.command('ComplianceDocumentRuleUserActionSave', command);
        }
        function complianceDocumentRuleUserActionSubmit(command) {
            return phoenixapi.command('ComplianceDocumentRuleUserActionSubmit', command);
        }
        function userDefinedCodeComplianceDocumentTypeNew(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeNew', command);
        }
        function userDefinedCodeComplianceDocumentTypeSave(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeSave', command);
        }
        function userDefinedCodeComplianceDocumentTypeDiscard(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeDiscard', command);
        }
        function userDefinedCodeComplianceDocumentTypeSubmit(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeSubmit', command);
        }
        function userDefinedCodeComplianceDocumentTypeActivate(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeActivate', command);
        }
        function userDefinedCodeComplianceDocumentTypeInactivate(command) {
            return phoenixapi.command('UserDefinedCodeComplianceDocumentTypeInactivate', command);
        }
    }
}(Phoenix.Services));