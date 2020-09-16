(function (services) {
    'use strict';

    var serviceId = 'ApplicationConfigurationApiService';

    angular.module('phoenix.payroll.services').factory(serviceId, ['phoenixapi', 'SmartTableService', ApplicationConfigurationApiService]);

    function ApplicationConfigurationApiService(phoenixapi, SmartTableService) {

        var service = {
            //  queries:
            getApplicationConfiguration: getApplicationConfiguration,
            getApplicationConfigurationByTypeId: getApplicationConfigurationByTypeId,
        };

        return service;

        //  queries:
        function getApplicationConfiguration(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('config/getApplicationConfiguration?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getApplicationConfigurationByTypeId(typeid, oDataParams) {
            return phoenixapi.query('config/getApplicationConfigurationByTypeId/' + typeid + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
    }

}(Phoenix.Services));