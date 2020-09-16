/*global Phoenix: false, console: false, angular: false*/
(function (app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AccountForgotController';

    /// Register Controller - used to manage account registration
    /// Should redirect to manage page if already registered
    /// Should redirect to manage page with header 'registration successful' if they are able to register
    /// should display error if registration fails
    /// makes use of the AuthorizationService service
    app.controller(controllerId, ["$scope", 'phoenixauth', '$location', '$state', '$timeout', '$rootScope', 'phxLocalizationService', AccountForgotController]);
    
    function AccountForgotController($scope, phoenixauth, $location, $state, $timeout, $rootScope, phxLocalizationService) {

        $scope.currentUser = null;

        $scope.passwordForgotSent = false;
        $scope.model = {Email: ''};
        $scope.brokenRules = {};

        $scope.localization = {
            pwdForgotSentMessage        : 'An email has been sent with your password recovery instructions. Redirecting back to the login page ...',
            emailId                     : 'Enter the email you use to login to FlexBackOffice',
            recoverButton               : 'Recover',
            pwdResetErrorMessage        : 'There was an error resetting your password.',
            emailIncorrectErrorMessage  : 'The current email entered is incorrect.'            
        };

        Object.keys($scope.localization).forEach(
            function(key, index)
            {
                $scope.localization[key] = phxLocalizationService.translate('account.forgot.' + key);
            });

        phoenixauth.getCurrentUser().then(function (user) {
            $scope.currentUser = user;
            navigateToManage();
        })


        // AccountApiService.IsLoggedIn().then(function (data) {
        //     if (data.IsLoggedIn === true) {
        //         navigateToManage();
        //     }
        // });

        $scope.errorList = [];

        $scope.forgotPassword = function (forgotForm) {
            $rootScope.activateGlobalSpinner = true;
            phoenixauth.forgotPassword($scope.model.Email).then(function (data) {
                $rootScope.activateGlobalSpinner = false;
                $scope.brokenRules = [];
                $scope.passwordForgotSent = true;
                $timeout(function () {
                    $state.go('account');
                }, 3000);
            }, function (response) {
                $rootScope.activateGlobalSpinner = false;
                $scope.brokenRules = [];
                if ((response === null) || (response.data === null) || (response.data === "")) {
                    $scope.brokenRules.Email = [$scope.localization.pwdResetErrorMessage];
                } else if (response.status == 304) {
                    $scope.brokenRules.Email = [$scope.localization.emailIncorrectErrorMessage];
                } else if (response.status == 400) {
                    $scope.brokenRules = response.data.ModelState;
                }
            });
        };

        $scope.register = function (user) {

            // AccountApiService.register(user).then(function (data) {
            //     if (angular.isDefined(data.ErrorList)) {
            //         $scope.errorList = data.ErrorList;
            //     }
            // });
        };

        function navigateToManage() {
            $state.go('accountmanage');
            //$location.path("/Account");
        }

        $scope.$on('event:auth-loginConfirmed', navigateToManage);
    }

}(Phoenix.App));
