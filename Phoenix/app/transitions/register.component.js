(function (directives) {
    directives.component('register', {
        bindings: {
            tokenObj: '<'
        },
        controller: ['phoenixauth', 'phoenixapi', '$state', '$rootScope', 'common', '$scope', '$window', '$timeout',
            function (auth, phoenixapi, $state, $rootScope, common, $scope, $window, $timeout) {
                var ctrl = this;
                ctrl.isInit = false;

                var cultureObj = $window.PhxTranslations.codeValue.culture;
                ctrl.cultureList = Object.keys(cultureObj).map(function (key) { return { id: key, text: cultureObj[key] } });

                if (ctrl.tokenObj) {
                    // Set locale from token
                    var codeCulture = ctrl.cultureList.filter(function (value) {
                        return value.id == ctrl.tokenObj.CultureId;
                    })[0];
                    if (codeCulture) {
                        phoenixapi.query('localization/' + codeCulture.id).then(function (response) {
                            $window.PhxTranslations = response;
                            ctrl.isInit = true;
                        });
                    } else {
                        ctrl.isInit = true;
                    }

                    // Setup
                    ctrl.register = { token: ctrl.tokenObj.token, username: ctrl.tokenObj.UserName, cultureId: ctrl.tokenObj.CultureId };

                    this.onRegister = function () {
                        $scope.showError = false;
                        $scope.errorMessage = '';
                        $rootScope.activateGlobalSpinner = true;
                        return auth.register(
                            ctrl.register.username,
                            ctrl.register.password,
                            ctrl.register.confirmPassword,
                            ctrl.register.cultureId,
                            ctrl.register.token
                        ).then(function (data) {
                            return auth.login(ctrl.register.username, ctrl.register.password).then(function (data) {
                                return $rootScope.initApp();
                            }).then(function (data) {
                                $state.go('dashboard.homepage').then(function () {
                                    $timeout(function () {
                                        $window.location.reload(true);
                                    }, 200);
                                });
                                $rootScope.activateGlobalSpinner = false;
                            }, function (err) {
                                alert(JSON.stringify(err));
                                $rootScope.activateGlobalSpinner = false;
                            })
                        }, function (err) {
                            $scope.errorMessage = common.responseErrorMessages(err.data, null);

                            $scope.errorMessage.forEach(function (message) {
                                message.PropertyName = '';
                            });

                            $rootScope.activateGlobalSpinner = false;
                            $scope.showError = true;
                        });
                    };
                }
            }],
        templateUrl: '/Phoenix/app/transitions/register.component.html'
    });
})(Phoenix.Directives);