(function(angular) {
    angular.module('phoenix.workorder.services').factory('AssignmentSecurityService', [
        '$q', 'UserApiService', function($q, UserApiService) {

            return {
                canRemoveWorkOrderDocument: canRemoveWorkOrderDocument
            };

            function canRemoveWorkOrderDocument(document, workOrder) {
                if (workOrder.StatusId == 1 || workOrder.StatusId == 3) {
                    return $q.when(true);
                } else if (workOrder.StatusId == 2 || workOrder.StatusId == 5) {
                    return UserApiService.doesUserHaveAccessToOperation('WorkOrder', 'RemoveWorkOrderDocument');
                } else {
                    return $q.when(false);
                }
            }

        }
    ]);
})(angular);