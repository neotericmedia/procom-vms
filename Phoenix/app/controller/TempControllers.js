/*global Phoenix: false, console: false*/
(function (app) {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'TempController';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    app.controller(controllerId, ["$scope", "$rootScope", "UserApiService", "NavigationService", TempController]);

    function TempController($scope, $rootScope, UserApiService, NavigationService) {
        NavigationService.setTitle('');
    }

})(Phoenix.App);