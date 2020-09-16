(function (directives) {
    directives.directive('login', [function () {
        return {
            restrict: 'E',
            controller: ['$scope', 'phoenixauth', 'phoenixapi', '$state', '$rootScope', 'phxLocalizationService', '$window', '$timeout',
                function ($scope, auth, phoenixapi, $state, $rootScope, phxLocalizationService, $window, $timeout) {
                    $scope.localization = {
                        usernameEmailLabel  :   'Username or Email',
                        pwdLabel	        :   'Password',
                        rememberMeLabel	    :   'Remember me',
                        loadingMessage	    :   'Loading . . .',
                        signInLabel	        :   'Sign In',
                        pwdRecoverMessage	:   'Recover your password',
                        errorLabel	        :   'Error - '      ,
                        loginFailedMessage  :   'Login has failed.'
                    };

                    Object.keys($scope.localization).forEach(
                        function(key, index)
                        {
                            $scope.localization[key] = phxLocalizationService.translate('account.login.' + key);
                        });

                    $scope.user = {UserEmail: '', Password: ''};
                    $scope.showError = false;
                    $scope.login = function () {

                        auth.logout();
                        $scope.showError = false;
                        $rootScope.activateGlobalSpinner = true;

                        return auth.login($scope.user.UserEmail, $scope.user.Password).then(function () {
                            return $rootScope.initApp();
                        }).then(function (data) {

                            $state.go('profile-selector').then(function () {
                                // // Hard refresh not needed. Removing for now.
                                // $timeout(function () {
                                //     $window.location.reload(true);
                                // }, 200);
                            });

                        }, function(err){
                            // alert(JSON.stringify(err));
                            console.log(err);
                            $rootScope.activateGlobalSpinner = false;
                             $scope.showError = true;
                        });
                    };
                }],
            templateUrl: '/Phoenix/app/transitions/login.component.html'
        };
    }]);

})(Phoenix.Directives);