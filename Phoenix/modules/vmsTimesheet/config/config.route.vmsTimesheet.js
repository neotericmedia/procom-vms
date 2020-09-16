(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider                
                .state("vms.conflicts", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/conflicts',
                    controller: 'VmsTimesheetConflictsController',
                    controllerAs: 'conflict',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetConflicts.html',
                    resolve: app.resolve.VmsTimesheetConflictsController
                })
                .state("vms.transactions", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/transactions',
                    controller: 'VmsTransactionCreateController',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTransactionCreate.html',
                    controllerAs: 'trn',
                    resolve: app.resolve.VmsTransactionCreateController
                })
                .state("vms.preprocessing", {
                    url: '/preprocessing',
                    controller: 'VmsTimesheetPreprocessingController',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetPreprocessing.html',
                    resolve: {
                        resolveListOrganizationInternal: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                            var result = $q.defer();
                            AssignmentApiService.getListOrganizationInternal().then(
                                function (response) {
                                    result.resolve(response);
                                },
                                function (responseError) {
                                    result.reject(responseError);
                                });
                            return result.promise;
                        }],
                        resolveListOrganizationClient: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
                            var result = $q.defer();
                            AssignmentApiService.getListOrganizationClient().then(
                                function (response) {
                                    result.resolve(response);
                                },
                                function (responseError) {
                                    result.reject(responseError);
                                });
                            return result.promise;
                        }],
                    }
                })
                .state("vms.preprocessedv", {
                    url: '/preprocessedv/{organizationIdInternal:[0-9]{1,}}/{organizationIdClient:[0-9]{1,}}?documentPublicId',
                    controller: 'VmsPreprocessedVirtualizationController',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsPreprocessedVirtualization.html',
                    controllerAs: 'selfScope',
                    resolve: {
                        resolveListDocuments: ['$q', '$stateParams', 'TransactionApiService', function ($q, $stateParams, TransactionApiService) {
                            var result = $q.defer();
                            var oDataParams = oreq.request()
                            .withExpand(['Document'])
                            .withSelect(['Document/PublicId', 'Document/Name', 'Document/UploadedDatetime'])
                            .url();
                            TransactionApiService.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization($stateParams.organizationIdInternal, $stateParams.organizationIdClient, oDataParams).then(
                                function (response) {
                                    if (response.Items) {
                                        angular.forEach(response.Items, function (item) {
                                            if (item && item.Document && item.Document.UploadedDatetime) {
                                                item.Document.UploadedDatetime = moment.utc(item.Document.UploadedDatetime).toDate();
                                            }
                                        });

                                        result.resolve(response.Items);
                                    } else {
                                        result.resolve(response);
                                    }
                                },
                                function (responseError) {
                                    result.reject(responseError);
                                });
                            return result.promise;
                        }],
                    }
                })
                .state("vms.timesheet", {
                    url: "/timesheet",
                    abstract: true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms.timesheet.search", {
                    url: '/search/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}',
                    controller: 'VmsTimesheetDocumentSearchController',
                    controllerAs: 'docs',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetDocumentSearch.html',
                })
                .state("vms.timesheet.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsTimesheetDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetDocument.html',
                    resolve: app.resolve.VmsTimesheetDocumentController
                })
                .state('vms.timesheet.document.details', {
                    url: '/details',
                    views: {
                        'timesheetDocTab': {
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetDocumentDetails.html',
                            controller: 'VmsTimesheetDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state('vms.timesheet.document.files', {
                    url: '/files',
                    views: {
                        'timesheetDocTab': {
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetDocumentFiles.html',
                            controller: 'VmsTimesheetDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms.timesheet.document.workflow", {
                    url: '/workflow',
                    views: {
                        'timesheetDocTab': {
                            controller: 'VmsTimesheetDocumentWorkflowController',
                            controllerAs: 'workflow',
                            templateUrl: '/Phoenix/modules/vmsTimesheet/views/VmsTimesheetDocumentWorkflow.html'
                        }
                    }
                })   
            ;
        }
    ]);
})();