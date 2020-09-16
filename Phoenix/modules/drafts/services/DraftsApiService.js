(function (angular) {
    'use strict';

    var serviceId = 'DraftsApiService';

    angular.module('phoenix.drafts.services').factory(serviceId, ['common', 'config', 'phoenixapi', 'SmartTableService', DraftsApiService]);

    function DraftsApiService(common, config, phoenixapi, SmartTableService) {

        var service = {
            getListDraftOrganizations: getListDraftOrganizations,
            getDraftContacts: getDraftContacts,
            getDraftAssignmentSearch: getDraftAssignmentSearch,
        };

        return service;

        function getListDraftOrganizations(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('org/getListDraftOrganizations?' + oDataParams);
        }

        function getDraftContacts(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('contact/getDraftContacts?' + oDataParams);
        }

        function getDraftAssignmentSearch(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('assignment/getDraftAssignmentSearch?' + oDataParams);
        }
    }

}(angular));