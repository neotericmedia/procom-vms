(function () {
    'use strict';
    var app = angular.module('Phoenix');
    if (!app.resolve) app.resolve = {};
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {
            $stateProvider
            .state("timesheet", {
                url: '/timesheet',
                'abstract': true,
                template: '<div data-ui-view="" autoscroll="false"></div>',
                resolve: {
                    resolveTimesheetsAndWorkOrdersSummaryByCurrentUser: ['$q', 'TimesheetApiService',
                           function ($q, TimesheetApiService) {
                               var deferred = $q.defer();
                               TimesheetApiService.getTimesheetsAndWorkOrdersSummaryByCurrentUser(
                                   oreq.request().withSelect([
                                       'TimeSheetId',
                                       'TimesheetStartDate',
                                       'TimesheetEndDate',
                                       'TimeSheetStatusId',
                                       'TimesheetTypeId',
                                       'AssignmentId',
                                       'WorkOrderId',
                                       'WorkOrderNumber',
                                       'WorkOrderStartDate',
                                       'WorkOrderEndDate',
                                       'UserProfileWorkerName',
                                   ]).url()).then(
                                   function (resolveSuccess) {
                                       deferred.resolve(resolveSuccess.Items);
                                   }, function (resolveError) {
                                       deferred.reject(resolveError);
                                   });
                               return deferred.promise;
                           }
                    ]
                }
            })
            .state("timesheet.entry", {
                url: '/entry',
                controller: ['$state', 'timesheetUtils', 'resolveTimesheetsAndWorkOrdersSummaryByCurrentUser', 'common', '$location', 'NavigationService', function ($state, timesheetUtils, resolveTimesheetsAndWorkOrdersSummaryByCurrentUser, common, $location, NavigationService) {
                    $location.path('/next/timesheet/entry');
                    /*
                    var result = timesheetUtils.findCurrentTimesheet(resolveTimesheetsAndWorkOrdersSummaryByCurrentUser, new Date());
                    NavigationService.setTitle('my-timesheets');
                    if (result) {
                        
                        $location.path('/next/timesheet/' + result.TimeSheetId );

                    } else {
                        common.logWarning('You do not have any timesheets.');
                    }
                    */
                }],
                template: '<div data-ui-view="" autoscroll="false"></div>',
            })
            .state("timesheet.details", {
                url: '/workorder/{workOrderId:[0-9]{1,8}}/timesheet/{timesheetId:[0-9]{1,8}}?redirectOnComplete',
                data: {},
                controller: 'TimesheetDetailsController',
                templateUrl: '/Phoenix/modules/timesheet/views/TimesheetDetails.html',
                resolve: {
                    resolveTimesheetsAndWorkOrdersSummary: ['$q', '$stateParams', 'TimesheetApiService',
                               function ($q, $stateParams, TimesheetApiService) {
                                   var deferred = $q.defer();
                                   TimesheetApiService.getTimesheetsAndWorkOrdersSummary(
                                       $stateParams.workOrderId,
                                       oreq.request().withSelect([
                                           'TimeSheetId',
                                           'TimesheetStartDate',
                                           'TimesheetEndDate',
                                           'TimeSheetStatusId',
                                           'TimesheetTypeId',
                                           'AssignmentId',
                                           'WorkOrderId',
                                           'WorkOrderNumber',
                                           'WorkOrderStartDate',
                                           'WorkOrderEndDate',
                                           'UserProfileWorkerName',
                                       ]).url()).then(
                                       function (resolveSuccess) {
                                           deferred.resolve(resolveSuccess.Items);
                                       }, function (resolveError) {
                                           deferred.reject(resolveError);
                                       });
                                   return deferred.promise;
                               }
                    ],
                    previousState: ["$state", function ($state) {
                        return {
                            Name: $state.current.name,
                            Params: $state.params,
                            URL: $state.href($state.current.name, $state.params)
                        };
                    }]
                }
            })
            .state("timesheet.search", {
                url: '/search',
                controller: 'TimesheetSearchController',
                templateUrl: '/Phoenix/modules/timesheet/views/TimesheetSearch.html'
            })
            .state("timesheet.pendingReview", {
                url: '/pending-review',
                controller: 'TimesheetSearchController',
                templateUrl: '/Phoenix/modules/timesheet/views/TimesheetSearch.html'
            })
            .state("timesheet.exceptions", {
                url: '/exceptions',
                controller: 'TimesheetExceptionController',
                templateUrl: '/Phoenix/modules/timesheet/views/TimesheetExceptions.html'
            });

        }
    ]);
})();