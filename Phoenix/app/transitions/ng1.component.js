var holdng1 = (function (app) {
    app.directive('ng1', [function () {
        return {
            restrict: 'E',
            controller: 'RootController',
            templateUrl: '/Phoenix/app/transitions/ng2.component.html'
        };
    }]).run(['$uiRouter', '$state', function ($uiRouter, $state) {
        // Hack for routing into the ng2 app after hard refresh
        if ($uiRouter && $uiRouter.urlService) {
            var path = $uiRouter.urlService.path();
            var nextPattern = /^\/next/;
            if (nextPattern.test(path)) {
                var args = path.split('\/');
                var params = {};
                var i = 0;
                args.forEach(function (v) {
                    if (v && v !== "" && v !== "next") {
                        i++;
                        params['p' + i] = v;
                    }
                });
                var resolvedRoute = 'ngtwo.m' + (i < 1 ? '' : i);

                setTimeout(function () {
                    $state.go(resolvedRoute, params, { reload: true });
                });
            }
        }
    }]).config(['$stateProvider', '$locationProvider', '$urlRouterProvider',
        function ($stateProvider, $locationProvider, $urlRouterProvider) {
            $locationProvider.html5Mode(false);
            $stateProvider
                .state({
                    name: 'view-email-in-browser',
                    url: '/view-email-in-browser',
                    component: 'viewemailinbrowser',
                    data: {
                        isAnon: true,
                    }
                })
                .state({
                    name: 'document-view',
                    url: '/document-view',
                    component: 'documentview',
                    data: {
                        isAnon: true,
                    }
                })
                .state({
                    name: 'error',
                    url: '/error',
                    data: {
                        isAnon: true
                    },
                    template: '<error></error>'
                })
                .state({
                    name: 'unavailable',
                    url: '/unavailable',
                    data: {
                        isAnon: true,
                        isUnavailable: true
                    },
                    templateUrl: '/Phoenix/app/transitions/500.html'
                })
                .state({
                    name: 'home',
                    url: '/home',
                    abstract: true,
                    data: {
                        isAnon: true,
                        isNg2: true
                    },
                    template: ''//'<app-root>ng2Root</app-root>'
                })
                .state({
                    name: 'home.m',
                    url: ''
                })
                .state({
                    name: 'home.m1',
                    url: '/:p1'
                })
                .state({
                    name: 'account',
                    url: '/account',
                    data: {
                        isAnon: true
                    },
                    template: '<login></login>'
                })
                .state({
                    name: 'logout',
                    url: '/logout',
                    component: 'logout',
                    data: {
                        isAnon: true,
                    },
                })
                .state({
                    name: 'profile-selector',
                    url: '/profile-selector',
                    template: '<profile-selector></profile-selector>'
                })
                .state({
                    name: 'register',
                    url: '/register?et',
                    component: 'register',
                    data: {
                        isAnon: true
                    },
                    resolve: {
                        tokenObj: ['phoenixauth', '$stateParams', function (auth, $stateParams) {
                            var et = $stateParams['et'];
                            return auth.validateRegistrationToken(et).then(function (response) {
                                var data = response && response.data;
                                if (data) {
                                    data.token = et;
                                }
                                return data;
                            }, function (err) {
                                return null;
                            });
                        }]
                    }
                })
                .state({
                    name: 'ngtwo',
                    url: '/next',
                    abstract: true,
                    data: {
                        isNg2: true
                    },
                    template: '' //'<app-root>ng2Root</app-root>',
                })
                // dummy states for ng2
                .state({
                    name: 'ngtwo.m',
                    url: '/:p',
                    params: {
                        p: { raw: true, type: 'string', value: '' }
                    }
                });
            $urlRouterProvider.otherwise('/home');
        }]);

    app.run(['$state', '$rootScope', '$transitions', function ($state, $rootScope, $transitions) {

        // auth
        $state.defaultErrorHandler(function (error) {
            // $state.go("error");
        });

        $transitions.onBefore({}, function (trans) {
            var dataTo = trans.to().data;
            var phoenixapi = trans.injector().get('phoenixapi');
            if (dataTo && !dataTo.isUnavailable && phoenixapi.getServerUnavailable()) {
                phoenixapi.serverUnavailable();
                return false;
            }
            if (!dataTo || !dataTo.isAnon) {
                var phoenixauth = trans.injector().get('phoenixauth');
                var common = trans.injector().get('common');
                return phoenixauth.getCurrentUser().then(function (user) {
                    if (!user) {
                        common.logError("Token expired!");
                        phoenixauth.logout();
                        trans.router.stateService.go("account");
                        return false;
                    } else {
                        return true;
                    }
                }, function (err) {
                    console.log(err);
                    common.logError("Token expired!");
                    phoenixauth.logout();
                    trans.router.stateService.go("account");
                    return false;
                });
            }
            return true;
        });
        $transitions.onSuccess({}, function ($transition) {
            console.log('success! - ng1');
            $rootScope.stateName = ($transition.$to().name || '') + 'component';
        });


    }])
})(Phoenix.App);