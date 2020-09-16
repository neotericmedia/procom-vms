(function (angular) {
    'use strict';

    angular.module('phoenix.payroll')
        .value('payrollTableParams', {
            selectedCount: 0,
            totalItemCount: 0,
            currentPage: 1,
            totalItems: 0,
            pageSize: 30,
            pageCount: 1,
            dataTargetItems: 'Items',
            dataTargetCount: 'Count',
            externalMethod: 'callServer'
        });
})(angular);