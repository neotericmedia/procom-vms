(function (services) {
    'use strict';

    var serviceId = "UserProfileSearchSettingsApiService";
    services.factory(serviceId, ['$q', 'phoenixapi', UserProfileSearchSettingsApiService]);

    function UserProfileSearchSettingsApiService($q, phoenixapi) {

        var service = {
            getAll: getAll,
            getByStateRoutingName: getByStateRoutingName,
            userProfileSearchSettingSave: userProfileSearchSettingSave,
            //getUserSettings: getUserSettings
        };

        return service;

        // Commands
        function getAll(oDataParams) {
            return phoenixapi.query('userProfileSearchSettings/getAll');
        }
        function getByStateRoutingName(stateRoutingName) {
            return phoenixapi.query('userProfileSearchSettings/getByStateRoutingName/' + stateRoutingName);
        }
        function userProfileSearchSettingSave(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command('UserProfileSearchSettingSave', command);
        }

        // Alternative approach to getting userSettings instead of using smart-table diretive "stTableStruct.js"
        //function getUserSettings(stateRoutingName) {
        //    var deferred = $q.defer();
        //    getAll().then(
        //        function (responseSucces) {
        //            var stateCurrentUserProfileSearchSetting = _.find(responseSucces.Items, function (item) {
        //                return item.StateRoutingName === stateRoutingName;//$state.current.name;
        //            });
        //            deferred.resolve(stateCurrentUserProfileSearchSetting);
        //        },
        //        function (responseError) {
        //            deferred.reject(responseError);
        //        }
        //    );
        //    return deferred.promise;
        //}
    }

}(Phoenix.Services));