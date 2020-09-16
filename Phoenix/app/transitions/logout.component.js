(function (directives) {
    directives.component('logout', {
        bindings: {
        },
        controller: ['phoenixauth', '$location', '$state', '$timeout', '$scope', 'phxLocalizationService',
            function (phoenixauth, $location, $state, $timeout, $scope, phxLocalizationService) {
                $scope.localization = {
                    loggingOutMessage : phxLocalizationService.translate('account.login.loggingOutMessage')//'Logging out...'               
                };

                phoenixauth.logout();
                $timeout(function(){
                    // $location.path("/");
                    $state.go('home.m');
                }, 1000);
            }],
        templateUrl: '/Phoenix/app/transitions/logout.component.html'
    });
})(Phoenix.Directives);