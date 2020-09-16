(function (services) {
    'use strict';

    var serviceId = 'TransactionApiService';

    angular.module('phoenix.transaction.services').factory(serviceId, ['common', 'config', 'phoenixapi', 'SmartTableService', TransactionApiService]);

    function TransactionApiService(common, config, phoenixapi, SmartTableService) {

        var service = {
            //  queries:
            getSearchByTableState: getSearchByTableState,
            getByTransactionHeaderId: getByTransactionHeaderId,
            getApprovedByWorkOrderId: getApprovedByWorkOrderId,
            getAllByWorkOrderId: getAllByWorkOrderId,
            getAdjustmentNew: getAdjustmentNew,
            transactionHeaderAdjustmentSubmit: transactionHeaderAdjustmentSubmit,
            getTransactionHeaderPayments: getTransactionHeaderPayments,
            getClientConflicts: getClientConflicts,
            getVmsExpenseConflicts: getVmsExpenseConflicts,
            getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization: getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization,

            getVmsTimesheetImportedRecords: getVmsTimesheetImportedRecords,
            getVmsTimesheetImportedRecordsTable: getVmsTimesheetImportedRecordsTable,
            getVmsTimesheetImportedRecord: getVmsTimesheetImportedRecord,

            getVmsAllItems: getVmsAllItems,
            getClientProcessingTransactions: getClientProcessingTransactions,

            //  commands:
            //transactionHeaderActionReverseTimeSheetUnsubmit: transactionHeaderActionReverseTimeSheetUnsubmit,
            //TransactionHeaderActionReverseTimeSheetReturnToException: TransactionHeaderActionReverseTimeSheetReturnToException,
            transactionHeaderOnReversedNotification: transactionHeaderOnReversedNotification,
            transactionHeaderOnReversedNoNotification: transactionHeaderOnReversedNoNotification,

            TransactionHeaderManualDiscard: TransactionHeaderManualDiscard,
            TransactionHeaderManualDiscardState: TransactionHeaderManualDiscardState,
            transactionHeaderManualAddLine: transactionHeaderManualAddLine,
            transactionHeaderManualAddLineState: transactionHeaderManualAddLineState,
            transactionHeaderManualRemoveLine: transactionHeaderManualRemoveLine,
            transactionHeaderManualRemoveLineState: transactionHeaderManualRemoveLineState,
            transactionHeaderManualSave: transactionHeaderManualSave,
            transactionHeaderManualSaveState: transactionHeaderManualSaveState,
            transactionHeaderUserActionManualSubmit: transactionHeaderUserActionManualSubmit,
            transactionHeaderUserActionManualSubmitState: transactionHeaderUserActionManualSubmitState,
            transactionHeaderManualCalculation: transactionHeaderManualCalculation,
            // TODO AF20170418 Move to VmsApiService.js
            vmsTimesheetImportRecordTypeUpdate: vmsTimesheetImportRecordTypeUpdate,
            vmsTimesheetMarkImportRecordsDeleted: vmsTimesheetMarkImportRecordsDeleted,
            vmsTimesheetProcessImportRecords: vmsTimesheetProcessImportRecords,
            vmsProcessedRecordSetTypeToProcess: vmsProcessedRecordSetTypeToProcess,
            vmsProcessedRecordSetTypeConflict: vmsProcessedRecordSetTypeConflict,

            //  VmsDiscount
            getVmsDiscountConflicts: getVmsDiscountConflicts,
            getVmsDiscountImportedRecords: getVmsDiscountImportedRecords,
            getVmsDiscountImportedRecordsTable: getVmsDiscountImportedRecordsTable,
            getVmsDiscountImportedRecord: getVmsDiscountImportedRecord,
            getTransactionHeaderByVmsDiscountProcessedRecordId: getTransactionHeaderByVmsDiscountProcessedRecordId,

            vmsDiscountImportRecordTypeUpdate: vmsDiscountImportRecordTypeUpdate,
            vmsDiscountMarkImportRecordsDeleted: vmsDiscountMarkImportRecordsDeleted,
            vmsDiscountProcessImportRecords: vmsDiscountProcessImportRecords,
            vmsDiscountProcessedRecordSetTypeToProcess: vmsDiscountProcessedRecordSetTypeToProcess,

            //  VmsUnitedStatesSourceDeduction
            getVmsUnitedStatesSourceDeductionConflicts: getVmsUnitedStatesSourceDeductionConflicts,
            getVmsUnitedStatesSourceDeductionImportedRecords: getVmsUnitedStatesSourceDeductionImportedRecords,
            getVmsUnitedStatesSourceDeductionImportedRecordsTable: getVmsUnitedStatesSourceDeductionImportedRecordsTable,
            getVmsUnitedStatesSourceDeductionImportedRecord: getVmsUnitedStatesSourceDeductionImportedRecord,
            getTransactionHeaderByVmsUnitedStatesSourceDeductionProcessedRecordId: getTransactionHeaderByVmsUnitedStatesSourceDeductionProcessedRecordId,

            vmsUnitedStatesSourceDeductionImportRecordTypeUpdate: vmsUnitedStatesSourceDeductionImportRecordTypeUpdate,
            vmsUnitedStatesSourceDeductionMarkImportRecordsDeleted: vmsUnitedStatesSourceDeductionMarkImportRecordsDeleted,
            vmsUnitedStatesSourceDeductionProcessImportRecords: vmsUnitedStatesSourceDeductionProcessImportRecords,
            vmsUnitedStatesSourceDeductionProcessedRecordSetTypeToProcess: vmsUnitedStatesSourceDeductionProcessedRecordSetTypeToProcess,
        };

        return service;

        //  queries:
        function getSearchByTableState(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getByTransactionHeaderId(transactionHeaderId, oDataParams) {
            return phoenixapi.query('transactionHeader/' + transactionHeaderId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getApprovedByWorkOrderId(workOrderId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getApprovedByWorkOrderId/' + workOrderId + '?' + (oDataParams ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getAllByWorkOrderId(workOrderId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getAllByWorkOrderId/' + workOrderId + '?' + (oDataParams ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getAdjustmentNew(workOrderVersionId, oDataParams) {
            return phoenixapi.query('transactionHeader/getAdjustmentNew/' + workOrderVersionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }


        function getTransactionHeaderPayments(tableState, oDataParams, transactionHeaderId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getTransactionHeaderPayments/transactionHeader/' + transactionHeaderId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(organizationIdInternal, organizationIdClient, oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization/' + organizationIdInternal + '/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }
        function getVmsTimesheetImportedRecords(documentPublicId, oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsTimesheetImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }

        function getVmsTimesheetImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsTimesheetImportedRecord/' + id);
        }
        function getVmsExpenseConflicts(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = organizationArgs && organizationArgs[0] ? organizationArgs[0] : 0;
            var organizationIdClient = organizationArgs && organizationArgs[1] ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsExpenseConflicts/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getClientConflicts(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = organizationArgs && organizationArgs[0] ? organizationArgs[0] : 0;
            var organizationIdClient = organizationArgs && organizationArgs[1] ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getClientConflicts/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getVmsAllItems(oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsAllItems' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getClientProcessingTransactions(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = organizationArgs && organizationArgs[0] ? organizationArgs[0] : 0;
            var organizationIdClient = organizationArgs && organizationArgs[1] ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getClientProcessingTransactions/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }


        //  commands:
        //function transactionHeaderActionReverseTimeSheetUnsubmit(command) {
        //    return phoenixapi.command('TransactionHeaderActionReverseTimeSheetUnsubmit', command);
        //}
        //function TransactionHeaderActionReverseTimeSheetReturnToException(command) {
        //    return phoenixapi.command('TransactionHeaderActionReverseTimeSheetReturnToException', command);
        //}
        function transactionHeaderOnReversedNotification(command) {
            return phoenixapi.command('TransactionHeaderOnReversedNotification', command);
        }
        function transactionHeaderOnReversedNoNotification(command) {
            return phoenixapi.command('TransactionHeaderOnReversedNoNotification', command);
        }

        function TransactionHeaderManualDiscard(command) {
            return phoenixapi.command('TransactionHeaderManualDiscard', command);
        }
        function TransactionHeaderManualDiscardState(command) {
            return phoenixapi.command('TransactionHeaderManualDiscardState', command);
        }
        function transactionHeaderManualAddLine(command) {
            return phoenixapi.command('TransactionHeaderManualAddLine', command);
        }
        function transactionHeaderManualAddLineState(command) {
            return phoenixapi.command('TransactionHeaderManualAddLineState', command);
        }
        function transactionHeaderManualRemoveLine(command) {
            return phoenixapi.command('TransactionHeaderManualRemoveLine', command);
        }
        function transactionHeaderManualRemoveLineState(command) {
            return phoenixapi.command('TransactionHeaderManualRemoveLineState', command);
        }
        function transactionHeaderManualSave(command) {
            return phoenixapi.command('TransactionHeaderManualSave', command);
        }
        function transactionHeaderManualSaveState(command) {
            return phoenixapi.command('TransactionHeaderManualSaveState', command);
        }
        function transactionHeaderUserActionManualSubmit(command) {
            return phoenixapi.command('TransactionHeaderUserActionManualSubmit', command);
        }
        function transactionHeaderUserActionManualSubmitState(command) {
            return phoenixapi.command('TransactionHeaderUserActionManualSubmitState', command);
        }
        function transactionHeaderManualCalculation(command) {
            //SergeyM: NOT ok- must be migrated to assembler
            return phoenixapi.command('TransactionHeaderManualCalculation', command);
        }
        function transactionHeaderAdjustmentSubmit(command) {
            return phoenixapi.command('TransactionHeaderAdjustmentSubmit', command);
        }
        function vmsTimesheetImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsTimesheetImportRecordTypeUpdate', command);
        }

        function vmsTimesheetMarkImportRecordsDeleted(command) {
            return phoenixapi.command('VmsTimesheetMarkImportRecordsDeleted', command);
        }

        function vmsTimesheetProcessImportRecords(command) {
            return phoenixapi.command('VmsTimesheetProcessImportRecords', command);
        }

        function vmsProcessedRecordSetTypeToProcess(command) {
            return phoenixapi.command('VmsProcessedRecordSetTypeToProcess', command);
        }
        // TODO AF20170803. This method is moved to VmsApiService. Delete it from here after the ng1->ng2 migration is finished and VmsTransactionCreateController is abandoned.
        function vmsProcessedRecordSetTypeConflict(command) {
            return phoenixapi.command('VmsProcessedRecordSetTypeConflict', command);
        }
        function getVmsTimesheetImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsTimesheetImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }


        //  VmsDiscount
        function getVmsDiscountImportedRecords(documentPublicId, oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsDiscountImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }
        function getVmsDiscountImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsDiscountImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getVmsDiscountImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsDiscountImportedRecord/' + id);
        }
        function getVmsDiscountConflicts(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = organizationArgs && organizationArgs[0] ? organizationArgs[0] : 0;
            var organizationIdClient = organizationArgs && organizationArgs[1] ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsDiscountConflicts/internalOrganization/' + organizationIdInternal + '/clientOrganization/' + organizationIdClient + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getTransactionHeaderByVmsDiscountProcessedRecordId(id) {
            return phoenixapi.query('transactionHeader/getTransactionHeaderByVmsDiscountProcessedRecordId/id/' + id);
        }
        function vmsDiscountImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsDiscountImportRecordTypeUpdate', command);
        }
        function vmsDiscountMarkImportRecordsDeleted(command) {
            return phoenixapi.command('VmsDiscountMarkImportRecordsDeleted', command);
        }
        function vmsDiscountProcessImportRecords(command) {
            return phoenixapi.command('VmsDiscountProcessImportRecords', command);
        }
        function vmsDiscountProcessedRecordSetTypeToProcess(command) {
            return phoenixapi.command('VmsDiscountRecordSetToProcessType', command);
        }
        //  VmsUnitedStatesSourceDeduction
        function getVmsUnitedStatesSourceDeductionImportedRecords(documentPublicId, oDataParams) {
            return phoenixapi.query('transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : ''));
        }
        function getVmsUnitedStatesSourceDeductionImportedRecordsTable(documentPublicId, oDataParams, tableState) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecords/' + documentPublicId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getVmsUnitedStatesSourceDeductionImportedRecord(id) {
            return phoenixapi.query('transactionHeader/getVmsUnitedStatesSourceDeductionImportedRecord/' + id);
        }
        function getVmsUnitedStatesSourceDeductionConflicts(tableState, oDataParams, organizationArgs) {
            var organizationIdInternal = organizationArgs && organizationArgs[0] ? organizationArgs[0] : 0;
            // var organizationIdClient = organizationArgs && organizationArgs[1] ? organizationArgs[1] : 0;
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('transactionHeader/getVmsUnitedStatesSourceDeductionConflicts/internalOrganization/' + organizationIdInternal + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getTransactionHeaderByVmsUnitedStatesSourceDeductionProcessedRecordId(id) {
            return phoenixapi.query('transactionHeader/getTransactionHeaderByVmsUnitedStatesSourceDeductionProcessedRecordId/id/' + id);
        }
        function vmsUnitedStatesSourceDeductionImportRecordTypeUpdate(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionImportRecordTypeUpdate', command);
        }
        function vmsUnitedStatesSourceDeductionMarkImportRecordsDeleted(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionMarkImportRecordsDeleted', command);
        }
        function vmsUnitedStatesSourceDeductionProcessImportRecords(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionProcessImportRecords', command);
        }
        function vmsUnitedStatesSourceDeductionProcessedRecordSetTypeToProcess(command) {
            return phoenixapi.command('VmsUnitedStatesSourceDeductionRecordSetToProcessType', command);
        }
    }

}(Phoenix.Services));