(function(angular) {
    angular.module('phoenix.vms', ['phoenix.vms.services', 'phoenix.vms.controllers']);
    angular.module('phoenix.vms.controllers', ['ngSanitize']);
    angular.module('phoenix.vms.services', []);

    angular.module('phoenix.vms')
       .value('vmsTableParams', {
           selectedCount: 0,
           totalItemCount: 0,
           currentPage: 1,
           totalItems: 0,
           pageSize: 30,
           pageCount: 1,
           dataTargetItems: 'Items',
           dataTargetCount: 'Count',
           externalMethod: 'callServer'
       }).value('vmsNewTableState', {
           pagination: {
               currentPage: 1,
               pageSize: 30,
               start: 0
           },
           search: {

           },
           sort: {
               predicate: "ImportDate",
               reverse: false
           }
       });
})(angular);

