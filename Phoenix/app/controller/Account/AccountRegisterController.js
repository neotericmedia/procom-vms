/*global Phoenix: false, console: false, angular: false*/
(function (app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AccountRegisterController';

    /// Register Controller - used to manage account registration
    /// Should redirect to manage page if already registered
    /// Should redirect to manage page with header 'registration successful' if they are able to register
    /// should display error if registration fails 
    /// makes use of the AuthorizationService service
    app.controller(controllerId, ["$scope", 'AccountApiService', '$location', AccountRegisterController]);

    function AccountRegisterController($scope, AccountApiService, $location) {

        AccountApiService.IsLoggedIn().then(function (data) {
            if (data.IsLoggedIn === true) {
                navigateToManage();
            }
        });

        $scope.errorList = [];

        $scope.register = function (user) {

            AccountApiService.register(user).then(function (data) {
                if (angular.isDefined(data.ErrorList)) {
                    $scope.errorList = data.ErrorList;
                }
            });
        };

        function navigateToManage() {
            $location.path("/Account");
        }

        $scope.$on('event:auth-loginConfirmed', navigateToManage);
    }

}(Phoenix.App));
