(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
           
            $stateProvider.state('accountmanage', {
                url: '/accountmanage',
                templateUrl: '/Phoenix/templates/Account/Manage.html',
                controller: 'AccountManageController'
            });

            $stateProvider.state('accountforgot', {
                url: '/accountforgot',
                templateUrl: '/Phoenix/templates/Account/ForgotPassword.html',
                controller: 'AccountForgotController',
                data: {
                    isAnon: true
                }
            });

            $stateProvider.state('reset', {
                url: '/reset?et&email',
                templateUrl: '/Phoenix/templates/Account/ResetPassword.html',
                controller: 'AccountResetController',
                data: {
                    isAnon: true
                }
            });
        }
    ]);
})();