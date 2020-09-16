(function () {
    'use strict';

    var serviceId = 'AccessSubscriptionApiService';

    angular.module('phoenix.access.services').factory(serviceId, ['phoenixapi', 'common', 'SmartTableService', AccessSubscriptionApiService]);

    function AccessSubscriptionApiService(phoenixapi, common, SmartTableService) {

        common.setControllerName(serviceId);

        var service = {
            //  Queries
            getAllAccessSubscriptions: getAllAccessSubscriptions,
            getAllOriginalAccessSubscriptions: getAllOriginalAccessSubscriptions,
            getPendingAccessSubscriptions: getPendingAccessSubscriptions,
            getAccessSubscription: getAccessSubscription,
            //  Commands
            accessSubscriptionNew: accessSubscriptionNew,
            accessSubscriptionSave: accessSubscriptionSave,
            accessSubscriptionSubmit: accessSubscriptionSubmit,
        };

        return service;

        //  Queries
        function getAllAccessSubscriptions(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('AccessSubscription/getAllAccessSubscriptions' + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getAllOriginalAccessSubscriptions(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('AccessSubscription/getAllOriginalAccessSubscriptions' + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getPendingAccessSubscriptionsForSearch(tableState,oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
        return phoenixapi.query('AccessSubscription/getPendingSubscriptions' + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getPendingAccessSubscriptions(oDataParams) {
            return phoenixapi.query('AccessSubscription/getPendingSubscriptions' +  (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')); 
        }
      
        function getAccessSubscription(accessSubscriptionId, oDataParams) {
            return phoenixapi.query('AccessSubscription/getAccessSubscription/' + accessSubscriptionId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        //  Commands
        function accessSubscriptionNew(command) {
            return phoenixapi.command('AccessSubscriptionNew', command);
        }

        function accessSubscriptionSave(command) {
            return phoenixapi.command('AccessSubscriptionSave', command);
        }

        function accessSubscriptionSubmit(command) {
            return phoenixapi.command('AccessSubscriptionSubmit', command);
        }

    }
}());