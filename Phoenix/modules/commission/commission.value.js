(function (angular) {
    'use strict';

    angular.module('phoenix.commission')
        .value('commissionUserSearchTableParams', {
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
        .value('commissionRateSearchTableParams', {
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
        .value('commissionAdjustmentSearchTableParams', {
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
        .value('commissionTableState', {
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
        })
        .value('commissionMessages', {
            existingFound: "We've found the following commission rates with this internal user and role. Select to review, or edit to change an existing commission rate.",
            existingNotFound: "We haven't found any commission rates with this internal user and role."
        });

})(angular);