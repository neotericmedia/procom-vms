(function (angular, app) {
    'use strict';

    var controllerId = 'PaymentReportViewController';

    angular.module('phoenix.payment.controllers').controller(controllerId, ['$scope', 'common', '$state', 'DocumentApiService', 'payment', PaymentReportViewController]);

    function PaymentReportViewController($scope, common, $state, DocumentApiService, payment) {

        common.setControllerName(controllerId);

        $scope.reportUrl = function (paymentId) {
            return DocumentApiService.getPdfStreamForPayment(paymentId);
        };
        $scope.getReport = function () {
            $("#paymentReport").attr("src", $scope.reportUrl(payment.Id));
        };
        $scope.getReport();

        $scope.close = function () {
            $state.go('^');
        };
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.PaymentReportViewController = {
        payment: ['$stateParams', 'PaymentApiService', '$q',
             function ($stateParams, PaymentApiService, $q) {
                 var result = $q.defer();
                 PaymentApiService.getPaymentById($stateParams.paymentDocumentId).then(
                     function (response) {
                         result.resolve(response);
                     },
                     function (responseError) {
                         result.reject(responseError);
                     });
                 return result.promise;
             }
        ]
    };
    
})(angular, Phoenix.App);