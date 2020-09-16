(function (angular) {
    'use strict';

    angular.module('phoenix.org')
        .value('organizationTableParams', {
            selectedCount: 0,
            totalItemCount: 0,
            currentPage: 1,
            totalItems: 0,
            pageSize: 30,
            pageCount: 1,
            dataTargetItems: 'Items',
            dataTargetCount: 'Count',
            externalMethod: 'callServer'
        })
        .value('newTableState', {
            pagination: {
                currentPage: 1,
                pageSize: 30,
                start: 0
            },
            search: {

            },
            sort: {
                predicate: "Id",
                reverse: false
            }
        });
})(angular);