(function (angular) {
    'use strict';

    var controllerId = 'JournalGroupController';
    angular.module('phoenix.journal.controllers').controller(controllerId, ['common', '$scope', '$state', 'NavigationService', 'JournalApiService', 'phoenixsocket', JournalGroupController]);

    function JournalGroupController(common, $scope, $state, NavigationService, JournalApiService, phoenixsocket) {
        $scope.loadItemsPromise = null;
        NavigationService.setTitle('journal-pending');
        $scope.unregisterFunctionList = [];
        $scope.items = [];
        $scope.companyCount = 0;
        $scope.organizationIdInternal = null;
        function getPendingToExport() {
            var journalParams = oreq.request()
                .withSelect(['EntityId', 'OrganizationInternalLegalName', 'OrganizationIdInternal', 'BatchId', 'AvailableForExport'])
                .url();
            var promise = JournalApiService.getPendingToExport(journalParams).then(function (response) {
                $scope.items = response.Items;
                var companies = _.chain(response.Items).groupBy("OrganizationInternalLegalName").map(function (value, key) {
                    var companyName = key;
                    var companyId = value[0].OrganizationIdInternal;
                    var companyCode = value[0].InternalOrganizationCode;
                    var count = 0;
                    var filteredData = _.filter(value, function (item) {
                        return item.EntityId !== null && item.BatchId === null;
                    });
                    var hasExportableTransactions = _.filter(filteredData, function(item){
                        return item.AvailableForExport;
                    }).length > 0;
                    if (filteredData) count = filteredData.length;
                    $scope.companyCount += filteredData.length;
                    return { name: companyName, count: count, id: companyId, code: companyCode, isOpen: false, hasExportableTransactions: hasExportableTransactions };
                }).value();

                $scope.companies = _.sortBy(companies, function (o) { return o.name; });
                if ($scope.companies.length > 0) {
                    $scope.companies[0].isOpen = true;
                }
            }, function (error) {
            });
            $scope.loadItemsPromise = promise;
        }
        getPendingToExport();

        $scope.generateFinancialBatch = function (companyId) {
            var hasExportableTransactions = _.find($scope.companies, function(company){
                return company.id === companyId;
            }).hasExportableTransactions;
            if(hasExportableTransactions){
                $scope.organizationIdInternal = companyId;
                var command = { WorkflowPendingTaskId: -1, organizationIdInternal: companyId, dateOffset: new Date().getTimezoneOffset() };
                JournalApiService.generateFinancialBatch(command).then(
                    function (response) {
                       common.logSuccess("Journal batch created successfully");
                   }
               );
            }else {
                common.logWarning("There are no remaining transactions for the current application month")
            }
        };

        $scope.exportLine = function (company) {
            var isOpen = company.isOpen;
            angular.forEach($scope.comapnies, function (company) {
                company.isOpen = false;
            });
            company.isOpen = !isOpen;
        };

        phoenixsocket.onPrivate("FinancialTransactionBatchNew", function (event, data) {
            var batchId = data.BatchId;
            var batchNumber = data.BatchNumber;
            var internalOrganizationCode = data.InternalOrganizationCode;
            var date = new Date();
            var month = date.getMonth() + 1 + "";
            var pad = "00";
            month = pad.substring(0, pad.length - month.length) + month;
            var dateString = "_" + month + date.getFullYear();

            JournalApiService.streamByBatchId(batchId).then(function (response) {
                //var fileName = internalOrganizationCode + "_JE" + batchNumber + dateString + "_EXPORT.csv";
                //saveTextAs(response, fileName);
                $state.go('ngtwo.m', { p: 'journal/batches/organization/' + $scope.organizationIdInternal });
            });

        }).then(function (unregister) {
            if (unregister) {
                $scope.unregisterFunctionList.push(unregister);
            }
        });

        $scope.$on('$destroy', function () {
            if ($scope.unregisterFunctionList && $scope.unregisterFunctionList.length) {
                for (var i = 0; i < $scope.unregisterFunctionList.length; i++) {
                    if (typeof $scope.unregisterFunctionList[i] === 'function') {
                        $scope.unregisterFunctionList[i]();
                    }
                }
            }
        });
    }
})(angular);