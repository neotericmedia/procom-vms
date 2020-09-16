/*global Phoenix: false, console: false, angular: false*/
(function (app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'AccountResetController';

    /// Register Controller - used to manage account registration
    /// Should redirect to manage page if already registered
    /// Should redirect to manage page with header 'registration successful' if they are able to register
    /// should display error if registration fails
    /// makes use of the AuthorizationService service
    app.controller(controllerId, ["$scope", 'phoenixauth', '$location', '$state', '$timeout', '$stateParams', '$rootScope', 'phxLocalizationService', AccountResetController]);

    function AccountResetController($scope, phoenixauth, $location, $state, $timeout, $stateParams, $rootScope, phxLocalizationService) {

        if(!$stateParams || !$stateParams['et'] || !$stateParams['email']){
            throw 'Invalid token!';
        }

        $scope.localization = {
            pwdResetRedirectionMessage  : 'Your password has been reset. Redirecting ...',            
            pwdResetMessage             : 'Reset the password for your account.',
            resetPwdLabel               : 'Reset Password',
            pwdLabel                    : 'Password',
            pwdResetErrorMessage        : 'Error resetting your password',
            pwdIncorrectErrorMessage    : 'The current password entered is incorrect.'            
        };

        Object.keys($scope.localization).forEach(
            function(key, index)
            {
                $scope.localization[key] = phxLocalizationService.translate('account.reset.' + key);
            });

        $scope.currentUser = null;
        $scope.model = {
            Code: $stateParams['et'],
            Email: $stateParams['email']
        };
        $scope.brokenRules = {};
        $scope.isPasswordReset = false;

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

        $scope.reset = function (resetForm) {
            $rootScope.activateGlobalSpinner = true;
            phoenixauth.resetPassword($scope.model).then(function (data) {
                $rootScope.activateGlobalSpinner = false;
                $scope.isPasswordReset = true;
                $scope.brokenRules = [];
                $timeout(function () {
                    $state.go('account');
                }, 3000);
            }, function (response) {
                $rootScope.activateGlobalSpinner = false;
                $scope.brokenRules = [];
                if ((response === null) || (response.data === null) || (response.data === "")) {
                    $scope.brokenRules.Password = [$scope.localization.pwdResetErrorMessage];
                } else if (response.status == 304) {
                    $scope.brokenRules.Password = [$scope.localization.pwdIncorrectErrorMessage];
                } else if (response.status == 400) {
                    $scope.brokenRules = response.data.ModelState;
                }
            });

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
