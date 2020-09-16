(function (directives) {
    directives.component('error', {
        bindings: {
        },
        controller: ['phoenixauth', 'phoenixapi', '$state', '$rootScope', '$scope', 'phxLocalizationService',
            function (auth, phoenixapi, $state, $rootScope, $scope, phxLocalizationService) {
                $scope.localization = {
                    genericErrorMessage : phxLocalizationService.translate('common.generic.genericErrorMessage')//'An error occurred.'
                };
            }],
        templateUrl: '/Phoenix/app/transitions/error.component.html'
    });
})(Phoenix.Directives);