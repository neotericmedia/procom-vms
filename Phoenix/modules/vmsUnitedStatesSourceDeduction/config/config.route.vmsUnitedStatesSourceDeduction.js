(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state("vms-ussourcededuction", {
                    url: '/vms-ussourcededuction',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms-ussourcededuction.search", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}',
                    controller: 'VmsUnitedStatesSourceDeductionDocumentSearchController',
                    controllerAs: 'search',
                    templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionDocumentSearch.html',
                })
                .state("vms-ussourcededuction.process", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/process',
                    controller: 'VmsUnitedStatesSourceDeductionProcessController',
                    templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionProcess.html',
                    controllerAs: 'trn',
                    resolve: app.resolve.VmsUnitedStatesSourceDeductionProcessController
                })
                .state("vms-ussourcededuction.conflicts", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/conflicts',
                    controller: 'VmsUnitedStatesSourceDeductionConflictsController',
                    templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionConflicts.html',
                    controllerAs: 'conflict',
                    resolve: app.resolve.VmsUnitedStatesSourceDeductionConflictsController
                })
                .state("vms-ussourcededuction.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsUnitedStatesSourceDeductionDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionDocument.html',
                    resolve: app.resolve.VmsUnitedStatesSourceDeductionDocumentController
                })
                .state('vms-ussourcededuction.document.details', {
                    url: '/details',
                    views: {
                        'unitedstatessourcedeductionBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionDocumentDetails.html',
                            controller: 'VmsUnitedStatesSourceDeductionDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state('vms-ussourcededuction.document.files', {
                    url: '/files',
                    views: {
                        'unitedstatessourcedeductionBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionDocumentFiles.html',
                            controller: 'VmsUnitedStatesSourceDeductionDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms-ussourcededuction.document.workflow", {
                    url: '/workflow',
                    views: {
                        'unitedstatessourcedeductionBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsUnitedStatesSourceDeduction/views/VmsUnitedStatesSourceDeductionDocumentWorkflow.html',
                            controller: 'VmsUnitedStatesSourceDeductionDocumentWorkflowController',
                            controllerAs: 'workflow'
                        }
                    }
                })
            ;
        }
    ]);
})();