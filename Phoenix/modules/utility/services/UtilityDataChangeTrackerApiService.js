(function (services) {
    'use strict';

    var serviceId = 'UtilityDataChangeTrackerApiService';
    angular.module('phoenix.utility.services').factory(serviceId, ['phoenixapi', UtilityDataChangeTrackerApiService]);

    function UtilityDataChangeTrackerApiService(phoenixapi) {

        var service = {
            getTrackDataChange: getTrackDataChange,
            //getTrackFieldChangeBySource: getTrackFieldChangeBySource,
            //getTrackFieldChangeBySelf: getTrackFieldChangeBySelf,
            //getByAuditHistoryTable: getByAuditHistoryTable
        };

        return service;

        function getTrackDataChange(entityTypeId, entityId) {
            return phoenixapi.query('dataChangeTracker/getTrackDataChange/' + entityTypeId + '/' + entityId);
        }
        //function getTrackFieldChangeBySource(entityTypeId, entityId) {
        //    return phoenixapi.query('dataChangeTracker/getTrackFieldChangeBySource/' + entityTypeId + '/' + entityId);
        //}
        //function getTrackFieldChangeBySelf(entityTypeId, entityId) {
        //    return phoenixapi.query('dataChangeTracker/getTrackFieldChangeBySelf/' + entityTypeId + '/' + entityId);
        //}
        //function getByAuditHistoryTable(entityTypeId, entityId) {
        //    return phoenixapi.query('dataChangeTracker/getByAuditHistoryTable/' + entityTypeId + '/' + entityId);
        //}

    }
}(Phoenix.Services));