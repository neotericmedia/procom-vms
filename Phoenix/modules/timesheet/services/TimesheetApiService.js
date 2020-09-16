(function (angular) {
    'use strict';

    var serviceId = 'TimesheetApiService';

    angular.module('phoenix.timesheet.services').factory(serviceId, ['$q', 'common', 'phoenixapi', 'SmartTableService', TimesheetApiService]);

    function TimesheetApiService($q, common, phoenixapi, SmartTableService) {
        common.setControllerName(serviceId);

        var service = {
            //  Queries
            getTimesheetsAndWorkOrdersSummaryByCurrentUser: getTimesheetsAndWorkOrdersSummaryByCurrentUser,
            getTimesheetAndWorkOrdersDetailByTimeSheetId: getTimesheetAndWorkOrdersDetailByTimeSheetId,

            getTimesheetsAndWorkOrdersByPendingTask: getTimesheetsAndWorkOrdersByPendingTask,
            getTimesheetsAndWorkOrdersSummary: getTimesheetsAndWorkOrdersSummary,
            getTimesheetExceptions: getTimesheetExceptions,
            getTimesheetExceptionsLite: getTimesheetExceptionsLite,
            getSubdvisionHolidays: getSubdvisionHolidays,
            getClientHolidays: getClientHolidays,
            getTimesheetsDeclined: getTimesheetsDeclined,

            //  Commands
            saveTimesheet: saveTimesheet,
            submitTimesheet: submitTimesheet,
        };

        var data = {
            timesheetsAndWorkOrdersSummaryByCurrentUser: null// Must be null, because for not worker result always empty array: []
        };

        return service;

        function getTimesheetsAndWorkOrdersSummaryByCurrentUser(oDataParams) {
            var deferred = $q.defer();
            if (data.timesheetsAndWorkOrdersSummaryByCurrentUser === null) {
                phoenixapi.query('timeSheet/getTimesheetsAndWorkOrdersSummaryByCurrentUser' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')).then(
                    function(resolveSuccess) {
                        data.timesheetsAndWorkOrdersSummaryByCurrentUser = angular.copy(resolveSuccess);
                        deferred.resolve(resolveSuccess);
                    }, function (resolveError) {
                        deferred.reject(resolveError);
                    });
            }
            else {
                deferred.resolve(data.timesheetsAndWorkOrdersSummaryByCurrentUser);
            }
            return deferred.promise;
        }
        function getTimesheetAndWorkOrdersDetailByTimeSheetId(timesheetId, oDataParams) {
            return phoenixapi.query('timeSheet/getTimesheetAndWorkOrdersDetailByTimeSheetId/' + timesheetId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getTimesheetsAndWorkOrdersByPendingTask(oDataParams) {
            return phoenixapi.query('timeSheet/getTimesheetsAndWorkOrdersByPendingTask' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getTimesheetsAndWorkOrdersSummary(workOrderId, oDataParams) {
            return phoenixapi.query('timeSheet/getTimesheetsAndWorkOrdersSummary/' + workOrderId + (oDataParams ? ('?' + oDataParams) : ''));
        }

        function getTimesheetExceptions(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('timeSheet/getTimesheetExceptions?' + oDataParams);
        }

        function getTimesheetExceptionsLite(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('timeSheet/getTimesheetExceptionsLite?' + oDataParams);
        }

        function getTimesheetsDeclined(tableState) {
            var oDataParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('timeSheet/getTimesheetsDeclined?' + oDataParams);
        }

        function getSubdvisionHolidays(oDataParams) {
            return phoenixapi.query('Holiday/allsubdivision' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getClientHolidays(oDataParams) {
            return phoenixapi.query('Holiday/allclient' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        // Commands
        function saveTimesheet(timesheet) {
            return phoenixapi.command("TimeSheetSave", timesheet);
        }
        function submitTimesheet(timesheet) {
            return phoenixapi.command("TimeSheetSubmit", timesheet);
        }

        
    }

}(angular));