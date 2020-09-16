(function (app) {
    'use strict';
    /// Should redirect to Manage page if already logged in
    /// Should display error if login fails
    /// Should redirect to manage page if Login succeeds
    app.AccountController = app.controller('AccountController',
        ["$scope", 'AccountApiService', '$rootScope', '$location', function ($scope, AccountApiService, $rootScope, $location) {


            $scope.login = function (user) {
                AccountApiService.login(user).then(function (data) {
                    if (angular.isDefined(data.ErrorList)) {
                        $scope.errorList = data.ErrorList;
                    }
                });

            };


        }]);

    app.LandingAccountController = app.controller('LandingAccountController', ["$scope", 'AccountApiService', '$rootScope', '$location', function ($scope, AccountApiService, $rootScope, $location) {
        $scope.$on("event:auth-loginConfirmed", function (ngEvent, arg) {
            if (arg.IsLoggedIn === true) {
                window.location = "../#/";
            }
        });

    }]);

    app.AppAccountController = app.controller('AppAccountController', ["$scope", 'AccountApiService', '$rootScope', '$location', 'UserApiService', function ($scope, AccountApiService, $rootScope, $location, UserApiService) {
        $scope.$on("event:auth-loginConfirmed", function (ngEvent, arg) {
            if (arg.IsLoggedIn === true) {
                $location.path("/");
            }
        });

    }]);


})(Phoenix.App);