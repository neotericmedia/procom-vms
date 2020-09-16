(function (angular) {
    'use strict';

    angular.module('phoenix.vms.controllers').controller('VmsConflictReasonController', VmsConflictReasonController);

    VmsConflictReasonController.$inject = ['$scope', '$uibModalInstance', 'data'];

    function VmsConflictReasonController($scope, $uibModalInstance, data) {

        var recordType = data && data.recordType;
        $scope.typeName = '';
        if (recordType === ApplicationConstants.VmsImportedRecordType.Conflict
            //|| recordType === ApplicationConstants.VmsDiscountImportedRecordType.Conflict
            //|| recordType === ApplicationConstants.VmsExpenseImportedRecordType.Conflict
            )
            $scope.typeName = 'Import as Conflict';
        else if (recordType === ApplicationConstants.VmsImportedRecordType.Discarded
            //|| recordType === ApplicationConstants.VmsDiscountImportedRecordType.Discarded
            //|| recordType === ApplicationConstants.VmsExpenseImportedRecordType.Discarded
            )
            $scope.typeName = 'Discard';
        else if (recordType === ApplicationConstants.VmsImportedRecordType.ToProcess
            //|| recordType === ApplicationConstants.VmsDiscountImportedRecordType.Discarded
            //|| recordType === ApplicationConstants.VmsExpenseImportedRecordType.Discarded
        )
            $scope.typeName = 'Import as Ready to Process';

        $scope.reason = '';
        $scope.cancel = function () {
            $uibModalInstance.dismiss('canceled');
        };
        $scope.save = function () {
            $uibModalInstance.close($scope.reason);
        };

    }
})(angular);