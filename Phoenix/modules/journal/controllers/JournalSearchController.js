(function (angular) {
    'use strict';

    var controllerId = 'JournalSearchController';
    angular.module('phoenix.journal.controllers')       
        .constant('journalSearch', {
            companies: {
                apply: function (key, data) {
                    var count = 0;
                    var filteredData = _.filter(data, function (item) {
                        return item.EntityId !== null && item.BatchId !== null;
                    });
                    if (filteredData) count = filteredData.length;
                    return {
                        companyName: key,
                        companyId: data[0].OrganizationIdInternal,
                        count: count
                    };
                },
                action: function (data) {
                    return _.groupBy(data, 'OrganizationInternalLegalName');
                }
            }
        })
        .controller(controllerId, ['$scope', '$state', 'NavigationService', 'JournalApiService', 'aggregateSummarizer', 'journalSearch', JournalSearchController]);

    function JournalSearchController($scope, $state, NavigationService, JournalApiService, aggregateSummarizer, journalSearch) {
        $scope.loadItemsPromise = null;
        NavigationService.setTitle("Search in Exported Entries Journal", ['icon icon-journal']);
        
        function getPendingToExport() {
            var journalParams = oreq.request().withSelect(['EntityId', 'OrganizationInternalLegalName', 'OrganizationIdInternal', 'BatchId']).url();
            var promise = JournalApiService.getPendingToExport(journalParams).then(function (response) {
                $scope.companies = aggregateSummarizer.aggregateGroups(journalSearch, 'companies', response.Items);
            }, function (error) {
            });
            $scope.loadItemsPromise = promise;
        }
        getPendingToExport();
    }
})(angular);