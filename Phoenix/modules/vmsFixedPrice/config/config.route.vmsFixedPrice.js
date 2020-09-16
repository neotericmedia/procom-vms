(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state("vms-fixedprice", {
                    url: '/vms-fixedprice',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms-fixedprice.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsFixedPriceDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsFixedPriceDocument.html',
                    resolve: app.resolve.VmsFixedPriceDocumentController
                })
                .state("vms-fixedprice.document.details", {
                    url: '/details',
                    views: {
                        'fixedpriceDocTab': {
                            templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsFixedPriceDocumentDetails.html',
                            controller: 'VmsFixedPriceDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state("vms-fixedprice.document.files", {
                    url: '/files',
                    views: {
                        'fixedpriceDocTab': {
                            templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsFixedPriceDocumentFiles.html',
                            controller: 'VmsFixedPriceDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms-fixedprice.document.workflow", {
                    url: '/workflow',
                    views: {
                        'fixedpriceDocTab': {
                            templateUrl: '/Phoenix/modules/vmsFixedPrice/views/VmsFixedPriceDocumentWorkflow.html',
                            controller: 'VmsFixedPriceDocumentWorkflowController',
                            controllerAs: 'workflow'                            
                        }
                    }
                })
            ;
        }
    ]);
})();