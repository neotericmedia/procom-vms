
(function (angular, app) {

    'use strict';

    var controllerId = 'DraftsController';

    angular.module('phoenix.drafts.controllers').controller(controllerId, ['$scope', '$state', 'NavigationService', DraftsController]);

    function DraftsController($scope, $state, NavigationService) {

        NavigationService.setTitle('Drafts', 'icon icon-tasklist');

    }

})(angular, Phoenix.App);