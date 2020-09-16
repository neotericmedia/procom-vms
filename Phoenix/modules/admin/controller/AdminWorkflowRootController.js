/*global Phoenix: false, console: false*/
(function (app, angular) {
    'use strict';

    var controllerId = 'AdminWorkflowRootController';

    angular.module('phoenix.admin.controllers').controller(controllerId, ['$scope', 'common', AdminWorkflowRootController]);

    function AdminWorkflowRootController($scope, common) {
        common.setControllerName(controllerId);

        function load() {
            var result = document.getElementsByClassName("page-content");
            if (result.length == 1) {
                var pageContent = angular.element(result);
                pageContent.css('max-width', 'none');
                pageContent.css('width', 'auto');
            }
        }
        load();

    }
})(Phoenix.App, angular);