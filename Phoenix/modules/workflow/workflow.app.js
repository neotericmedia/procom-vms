(function (angular, phoenixApp) {

    angular.module('phoenix.workflow', ['phoenix.workflow.models', 'phoenix.workflow.services', 'phoenix.workflow.controllers', 'phoenix.workflow.directives']);
    angular.module('phoenix.workflow.controllers', []);
    angular.module('phoenix.workflow.directives', []);
    angular.module('phoenix.workflow.services', []);
    angular.module('phoenix.workflow.models', []);

    angular.module('phoenix.workflow').config([
        '$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

        }
    ]);
})(angular, Phoenix.App);