(function(angular) {
    angular.module('phoenix.transaction.services').factory('TransactionSecurityService', [
        '$q', 'UserApiService', function($q, UserApiService) {

            return {
                canRemoveDocument: canRemoveDocument
            };

            function canRemoveDocument(document, transactionHeader) {
                //if (transactionHeader.StatusId == 1 || transactionHeader.StatusId == 3) {
                //    return $q.when(true);
                //} else if (transactionHeader.StatusId == 2 || transactionHeader.StatusId == 5) {
                //    return UserApiService.doesUserHaveAccessToOperation('Transaction', 'RemoveTransactionDocument');
                //} else {
                    return $q.when(false);
                //}
            }

        }
    ]);
})(angular);