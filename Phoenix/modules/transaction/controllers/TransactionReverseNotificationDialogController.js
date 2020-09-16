(function (app) {
    'use strict';
    var controllerId = 'TransactionReverseNotificationDialogController';
    app.controller(controllerId, ['$scope', '$uibModalInstance', 'common', 'data', TransactionReverseNotificationDialogController]);
    function TransactionReverseNotificationDialogController($scope, $uibModalInstance, common, data) {

        common.setControllerName(controllerId);

        function toLocalTime(date) {
            if (!date) return null;
            date = moment(date).format('MMMM D, YYYY');
            return date;
        }
        data.transactionHeader.StartDate = toLocalTime(data.transactionHeader.StartDate);
        data.transactionHeader.EndDate = toLocalTime(data.transactionHeader.EndDate);

        $scope.model = {
            data: data,
            emailTo : '',//data.admin.PrimaryEmail,
            emailCc: data.worker.PrimaryEmail,
            messageSubject: ((data.transactionHeader.TimeSheetId === null) ?
                'Transaction Reverse' :
                'Timesheet #' + data.transactionHeader.TimeSheetId + ' withdrawn for ' + data.worker.Contact.FullName),
            messageBody: ((data.transactionHeader.TimeSheetId === null) ?
                'Transaction Reverse reason given is: ' :
                'Timesheet #' + data.transactionHeader.TimeSheetId + ' for the period ' + data.transactionHeader.StartDate + ' to ' + data.transactionHeader.EndDate + ' has been withdrawn. The reason given is: ') +
                '\n ' + data.message.Comment +
                '\n Please inform ' + data.worker.Contact.FullName + ' that the timesheet is available for revision.'
        };

        $scope.IsEmail = function (email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };

        $scope.EmailsNotReady = function () {
            if (!$scope.IsEmail($scope.model.emailTo) || ($.trim($scope.model.emailCc) !== '' && !$scope.IsEmail($scope.model.emailCc))) {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.sendReversalNotification = function () {
            $uibModalInstance.close($scope.model);
        };

        $scope.reverseWitoutSendNotification = function () {
            $uibModalInstance.dismiss('cancelled');
        };
    }
}(Phoenix.App));