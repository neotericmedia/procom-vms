(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state("vms-commission", {
                    url: '/vms-commission',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms-commission.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsCommissionDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsCommission/views/VmsCommissionDocument.html',
                    resolve: app.resolve.VmsCommissionDocumentController
                })
                .state("vms-commission.document.details", {
                    url: '/details',
                    views: {
                        'commissionDocTab': {
                            templateUrl: '/Phoenix/modules/vmsCommission/views/VmsCommissionDocumentDetails.html',
                            controller: 'VmsCommissionDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state("vms-commission.document.files", {
                    url: '/files',
                    views: {
                        'commissionDocTab': {
                            templateUrl: '/Phoenix/modules/vmsCommission/views/VmsCommissionDocumentFiles.html',
                            controller: 'VmsCommissionDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms-commission.document.workflow", {
                    url: '/workflow',
                    views: {
                        'commissionDocTab': {
                            templateUrl: '/Phoenix/modules/vmsCommission/views/VmsCommissionDocumentWorkflow.html',
                            controller: 'VmsCommissionDocumentWorkflowController',
                            controllerAs: 'workflow'                            
                        }
                    }
                })
            ;
        }
    ]);
})();