(function (services) {
    'use strict';

    var serviceId = 'VmsApiService';

    angular.module('phoenix.transaction.services').factory(serviceId, ['common', 'config', 'phoenixapi', 'SmartTableService', VmsApiService]);

    function VmsApiService(common, config, phoenixapi, SmartTableService) {

        var service = {
            //  queries:

            getVmsAllItems: getVmsAllItems,

            getVmsExpenseSummary: getVmsExpenseSummary,
            getVmsTimesheetDocument: getVmsTimesheetDocument,
            getVmsExpenseDocument: getVmsExpenseDocument,
            getVmsCommissionDocument: getVmsCommissionDocument,
            getVmsFixedPriceDocument: getVmsFixedPriceDocument,
            getVmsExpenseProcessedRecordsByDocument: getVmsExpenseProcessedRecordsByDocument,
            getVmsCommissionProcessedRecordsByDocument: getVmsCommissionProcessedRecordsByDocument,
            getVmsFixedPriceProcessedRecordsByDocument: getVmsFixedPriceProcessedRecordsByDocument,
            getVmsExpenseDocumentDetails: getVmsExpenseDocumentDetails,
            getVmsCommissionDocumentDetails: getVmsCommissionDocumentDetails,
            getVmsFixedPriceDocumentDetails: getVmsFixedPriceDocumentDetails,

            getExpenseProcessedRecords: getExpenseProcessedRecords,
            getVmsTimesheetProcessedRecordsByDocument: getVmsTimesheetProcessedRecordsByDocument,
            getVmsTimesheetDocumentDetails: getVmsTimesheetDocumentDetails,

            csvStreamForAllConflictingVmsTimesheetRecords: csvStreamForAllConflictingVmsTimesheetRecords,
            csvStreamForAllConflictingVmsExpenseRecords: csvStreamForAllConflictingVmsExpenseRecords,

            getVmsExpenseProcessedRecordById: getVmsExpenseProcessedRecordById,
            getVmsCommissionProcessedRecordById: getVmsCommissionProcessedRecordById,
            getVmsFixedPriceProcessedRecordById: getVmsFixedPriceProcessedRecordById,
            getVmsDocumentPendingTaskId: getVmsDocumentPendingTaskId,
            getVmsTimesheetProcessedRecordById: getVmsTimesheetProcessedRecordById,
            getVmsBatchSummary: getVmsBatchSummary,

            getVmsTimesheetImportedRecord: getVmsTimesheetImportedRecord,
            getVmsExpenseImportedRecordsTable: getVmsExpenseImportedRecordsTable,
            getVmsExpenseImportedRecord: getVmsExpenseImportedRecord,
            getVmsCommissionImportedRecordsTable: getVmsCommissionImportedRecordsTable,
            getVmsFixedPriceImportedRecordsTable: getVmsFixedPriceImportedRecordsTable,
            getVmsCommissionImportedRecord: getVmsCommissionImportedRecord,
            getVmsFixedPriceImportedRecord: getVmsFixedPriceImportedRecord,


            getVmsDiscountSummary: getVmsDiscountSummary,
            getDiscountProcessedRecordsByDocument: getDiscountProcessedRecordsByDocument,
            getVmsDiscountSummaryDocument: getVmsDiscountSummaryDocument,
            getDiscountProcessedRecords: getDiscountProcessedRecords,
            csvStreamForAllConflictingVmsDiscountRecords: csvStreamForAllConflictingVmsDiscountRecords,
            getVmsDiscountProcessedRecordById: getVmsDiscountProcessedRecordById,
            VmsDiscountRecordSetConflictType: VmsDiscountRecordSetConflictType,
            getVmsDiscountImportedRecord: getVmsDiscountImportedRecord,
            batchThreadExecutionOnVmsDiscountRecordToBillingTransaction: batchThreadExecutionOnVmsDiscountRecordToBillingTransaction,


            getVmsUnitedStatesSourceDeductionSummary: getVmsUnitedStatesSourceDeductionSummary,
            getUnitedStatesSourceDeductionProcessedRecordsByDocument: getUnitedStatesSourceDeductionProcessedRecordsByDocument,
            getVmsUnitedStatesSourceDeductionSummaryDocument: getVmsUnitedStatesSourceDeductionSummaryDocument,
            getUnitedStatesSourceDeductionProcessedRecords: getUnitedStatesSourceDeductionProcessedRecords,
            csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords: csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords,
            getVmsUnitedStatesSourceDeductionProcessedRecordById: getVmsUnitedStatesSourceDeductionProcessedRecordById,
            getVmsUnitedStatesSourceDeductionImportedRecord: getVmsUnitedStatesSourceDeductionImportedRecord,
            VmsUnitedStatesSourceDeductionRecordSetConflictType: VmsUnitedStatesSourceDeductionRecordSetConflictType,
            batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction: batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction,
            getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization: getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization,

            //  commands:
            vmsTimesheetImportRecordTypeUpdate: vmsTimesheetImportRecordTypeUpdate,
            vmsTimesheetRevalidateRecords: vmsTimesheetRevalidateRecords,
            vmsExpenseImportRecordTypeUpdate: vmsExpenseImportRecordTypeUpdate,
            vmsExpenseRecordSetToProcessType: vmsExpenseRecordSetToProcessType,
            vmsExpenseRecordSetConflictType: vmsExpenseRecordSetConflictType,
            vmsProcessedRecordSetTypeConflict: vmsProcessedRecordSetTypeConflict,
            vmsCommissionImportRecordTypeUpdate: vmsCommissionImportRecordTypeUpdate,
            vmsFixedPriceImportRecordTypeUpdate: vmsFixedPriceImportRecordTypeUpdate,
            vmsCommissionRecordSetConflictType: vmsCommissionRecordSetConflictType,
            vmsFixedPriceRecordSetConflictType: vmsFixedPriceRecordSetConflictType,
            vmsDiscountImportRecordTypeUpdate: vmsDiscountImportRecordTypeUpdate,
            vmsUnitedStatesSourceDeductionImportRecordTypeUpdate: vmsUnitedStatesSourceDeductionImportRecordTypeUpdate,
            vmsCommissionRevalidateRecords: vmsCommissionRevalidateRecords,
            vmsFixedPriceRevalidateRecords: vmsFixedPriceRevalidateRecords,

        };

        return service;

        //  queries:

        function getVmsAllItems(oDataParams) {
            return phoenixapi.query('vms/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getVmsBatchSummary(oDataParams) {
            return phoenixapi.query('vms/getVmsBatchSummary' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getVmsTimesheetImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsTimesheetImportedRecord/' + id);
        }

        function getExpenseProcessedRecords(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
            var organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getExpenseProcessedRecords/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsExpenseImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsExpenseImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getVmsCommissionImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsCommissionImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getVmsFixedPriceImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsFixedPriceImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        //  commands:



        function csvStreamForAllConflictingVmsTimesheetRecords(orgIdInternal, orgIdClient) {
            return phoenixapi.query('vms/csvStreamForAllConflictingVmsTimesheetRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient);
        }

        function csvStreamForAllConflictingVmsExpenseRecords(orgIdInternal, orgIdClient) {
            return phoenixapi.query('vms/csvStreamForAllConflictingVmsExpenseRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient);
        }


        function getVmsExpenseSummary(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsExpenseSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsExpenseProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsExpenseProcessedRecordById/' + id);
        }


        function getVmsTimesheetProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsTimesheetProcessedRecordById/' + id);
        }

        function getVmsCommissionProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsCommissionProcessedRecordById/' + id);
        }

        function getVmsFixedPriceProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsFixedPriceProcessedRecordById/' + id);
        }

        function getVmsDocumentPendingTaskId(documentPublicId) {
            return phoenixapi.query('vms/getVmsDocumentPendingTaskId/' + documentPublicId);
        }

        function getVmsTimesheetDocument(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsTimesheetDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsTimesheetProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsTimesheetProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsTimesheetDocumentDetails(documentId) {
            return phoenixapi.query('vms/getVmsTimesheetDocumentDetails/' + documentId);
        }

        function vmsTimesheetImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsTimesheetImportRecordTypeUpdate', command);
        }

        function vmsTimesheetRevalidateRecords(command) {
            return phoenixapi.command('VmsProcessedRecordRevalidate', command);
        }

        function vmsExpenseImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsExpenseImportRecordTypeUpdate', command);
        }

        function getVmsExpenseImportedRecord(id) {
            return phoenixapi.query('vms/getVmsExpenseImportedRecord/' + id);
        }

        function getVmsExpenseDocument(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsExpenseDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsCommissionDocument(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsCommissionDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsFixedPriceDocument(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsFixedPriceDocument/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsExpenseDocumentDetails(documentId) {
            return phoenixapi.query('vms/getVmsExpenseDocumentDetails/' + documentId);
        }

        function getVmsCommissionDocumentDetails(documentId) {
            return phoenixapi.query('vms/getVmsCommissionDocumentDetails/' + documentId);
        }

        function getVmsFixedPriceDocumentDetails(documentId) {
            return phoenixapi.query('vms/getVmsFixedPriceDocumentDetails/' + documentId);
        }

        function getVmsExpenseProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsExpenseProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsCommissionProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsCommissionProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsFixedPriceProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsFixedPriceProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function vmsExpenseRecordSetToProcessType(command) {
            return phoenixapi.command('VmsExpenseRecordSetToProcessType', command);
        }

        function vmsExpenseRecordSetConflictType(command) {
            return phoenixapi.command('VmsExpenseRecordSetConflictType', command);
        }

        function vmsProcessedRecordSetTypeConflict(command) {
            return phoenixapi.command('VmsProcessedRecordSetTypeConflict', command);
        }

        function vmsCommissionImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsCommissionImportRecordTypeUpdate', command);
        }

        function vmsFixedPriceImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsFixedPriceImportRecordTypeUpdate', command);
        }

        function getVmsCommissionImportedRecord(id) {
            return phoenixapi.query('vms/getVmsCommissionImportedRecord/' + id);
        }

        function getVmsFixedPriceImportedRecord(id) {
            return phoenixapi.query('vms/getVmsFixedPriceImportedRecord/' + id);
        }

        function vmsCommissionRecordSetConflictType(command) {
            return phoenixapi.command('VmsCommissionRecordSetConflictType', command);
        }

        function vmsFixedPriceRecordSetConflictType(command) {
            return phoenixapi.command('VmsFixedPriceRecordSetConflictType', command);
        }

        function vmsCommissionRevalidateRecords(command) {
            return phoenixapi.command('VmsCommissionRevalidateRecords', command);
        }

        function vmsFixedPriceRevalidateRecords(command) {
            return phoenixapi.command('VmsFixedPriceRevalidateRecords', command);
        }


        //  VmsDiscount
        function getVmsDiscountSummary(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsDiscountSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getDiscountProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getDiscountProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getVmsDiscountSummaryDocument(documentId) {
            return phoenixapi.query('vms/getVmsDiscountSummaryDocument/' + documentId);
        }
        function getDiscountProcessedRecords(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
            var organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getDiscountProcessedRecords/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function csvStreamForAllConflictingVmsDiscountRecords(orgIdInternal, orgIdClient) {
            return phoenixapi.query('vms/csvStreamForAllConflictingVmsDiscountRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient);
        }
        function getVmsDiscountProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsDiscountProcessedRecordById/' + id);
        }
        function VmsDiscountRecordSetConflictType(command) {
            return phoenixapi.command('VmsDiscountRecordSetConflictType', command);
        }

        function vmsDiscountImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsDiscountImportRecordTypeUpdate', command);
        }

        function batchThreadExecutionOnVmsDiscountRecordToBillingTransaction(command) {
            return phoenixapi.command('BatchThreadExecutionOnVmsDiscountRecordToBillingTransaction', command);
        }


        //  VmsUnitedStatesSourceDeduction
        function getVmsUnitedStatesSourceDeductionSummary(tableState, oDataParams, args) {
            var orgIdInternal = (args && args[0]) ? args[0] : -1;
            var documentId = (args && args[1]) ? args[1] : -1;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getVmsUnitedStatesSourceDeductionSummary/internalOrganization/' + orgIdInternal + '/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getUnitedStatesSourceDeductionProcessedRecordsByDocument(tableState, oDataParams, documentId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getUnitedStatesSourceDeductionProcessedRecordsByDocument/document/' + documentId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getVmsUnitedStatesSourceDeductionSummaryDocument(documentId) {
            return phoenixapi.query('vms/getVmsUnitedStatesSourceDeductionSummaryDocument/' + documentId);
        }
        function getUnitedStatesSourceDeductionProcessedRecords(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = (organizationArgs && organizationArgs[0]) ? organizationArgs[0] : 0;
            var organizationIdClient = (organizationArgs && organizationArgs[1]) ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('vms/getUnitedStatesSourceDeductionProcessedRecords/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords(orgIdInternal, orgIdClient) {
            return phoenixapi.query('vms/csvStreamForAllConflictingVmsUnitedStatesSourceDeductionRecords/internalOrganization/' + orgIdInternal + '/clientOrganization/' + orgIdClient);
        }
        function getVmsUnitedStatesSourceDeductionProcessedRecordById(id) {
            return phoenixapi.query('vms/getVmsUnitedStatesSourceDeductionProcessedRecordById/' + id);
        }

        function getVmsUnitedStatesSourceDeductionImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecord/' + id);
        }

        function VmsUnitedStatesSourceDeductionRecordSetConflictType(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionRecordSetConflictType', command);
        }

        function batchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction(command) {
            return phoenixapi.command('BatchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToBillingTransaction', command);
        }

        function getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(organizationIdInternal, organizationIdClient, oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization/' + organizationIdInternal + '/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }

        function getVmsDiscountImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsDiscountImportedRecord/' + id);
        }

        function vmsUnitedStatesSourceDeductionImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionImportRecordTypeUpdate', command);
        }

    }

}(Phoenix.Services));