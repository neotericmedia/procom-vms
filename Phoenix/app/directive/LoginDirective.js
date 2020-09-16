(function (directives) {

    /// <reference  path="../app.js"/>
    /*global PheonixTrackDirectives:false */

    'use strict';
  
    directives.directive('ptLoginModalForm', function () {
        return {
            restrict: 'A',
            templateUrl: '/Template/Account/LoginModal',
            controller: ['$scope','$rootScope',function ($scope, $rootScope) {

                $rootScope.$on("event:show-login-modal", function () {
                    $scope.showModal();
                });
               
                $rootScope.$on("event:auth-loginRequired", function () {
                    $scope.showModal();
                });
                
                $rootScope.$on("event:auth-loginConfirmed", function () {
                    $scope.hideModal();
                });

                $scope.showModal = function() {
                    $scope.showLoginModal = true;
                };
                $scope.hideModal = function () {
                    $scope.showLoginModal = false;
                };
            }],
            link: function (scope, elem, attrs, x) {
                
            }
        };
    });
})(Phoenix.Directives);