(function () {
    'use strict';

    var serviceId = 'JournalApiService';

    angular.module('phoenix.journal.services').factory(serviceId, ['$q', 'common', '$http', '$cookies', 'apiConfig', 'phoenixapi', 'SmartTableService', JournalApiService]);

    function JournalApiService($q, common, $http, $cookies, apiConfig, phoenixapi, SmartTableService) {
        common.setControllerName(serviceId);

        var service = {
            tableToExcel: tableToExcel,
            getPendingToExport: getPendingToExport,           
            getJournalBatches: getJournalBatches,
            csvStreamByBatchId: csvStreamByBatchId,
            arReportStreamByBatchId: arReportStreamByBatchId,
            generateFinancialBatch: generateFinancialBatch,
            streamByBatchId: streamByBatchId,
            accpacStreamByBatchId: accpacStreamByBatchId,
            accpacARStreamByBatchId: accpacARStreamByBatchId
        };

        return service;       

        function tableToExcel(searchTableType, count) {
            var exportData = [], temp = [], exportString = "";

            var headerRow = angular.element('thead tr').first();
            angular.forEach(angular.element(headerRow.find('th')), function (th) {
                temp.push(angular.element(th).text());
            });
            temp.splice(count, 1);
            exportString = temp.join() + "\n";
            exportData.push(temp);

            var selector = '.' + searchTableType + 'Body .' + searchTableType + 'Tr';
            var regularRows = angular.element(selector);
            angular.forEach(angular.element(regularRows), function (tr) {
                temp = [];
                angular.forEach(angular.element(tr).find('td'), function (td) {
                    var tdTxt = angular.element(td).text();
                    temp.push('"' + tdTxt + '"');
                });
                temp.splice(count, 1);
                exportString += temp.join() + "\n";
                exportData.push(temp);
            });

            return { exportData: exportData, exportString: exportString };
        }

        function getPendingToExport(oDataParams) {
            return phoenixapi.query('journal/pending-export?' + oDataParams);
        }       

        function getJournalBatches(organizationId, tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('journal/batches/' + organizationId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }        

        function csvStreamByBatchId(batchId) {
            return phoenixapi.url('journal/' + batchId + '/csvStreamByBatchId');
        }

        function arReportStreamByBatchId(batchId) {
            return phoenixapi.url('journal/' + batchId + '/arReportStreamByBatchId');
        }        

        function generateFinancialBatch(command) {
            return phoenixapi.command('FinancialTransactionBatchNew', command);
        }

        function streamByBatchId(batchId) {
            return phoenixapi.query('journal/' + batchId + '/csvStreamByBatchId');
        }

        function accpacStreamByBatchId(batchId) {
            return phoenixapi.url('journal/' + batchId + '/accpacStreamByBatchId');
        }

        function accpacARStreamByBatchId(batchId) {
            return phoenixapi.url('journal/' + batchId + '/accpacARStreamByBatchId');
        }
    }
}());
