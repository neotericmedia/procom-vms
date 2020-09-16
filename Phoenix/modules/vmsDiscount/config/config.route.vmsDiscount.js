(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state("vms-discount", {
                    url: '/vms-discount',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms-discount.search", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}',
                    controller: 'VmsDiscountDocumentSearchController',
                    controllerAs: 'search',
                    templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountDocumentSearch.html',
                })
                .state("vms-discount.process", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/process',
                    controller: 'VmsDiscountProcessController',
                    templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountProcess.html',
                    controllerAs: 'trn',
                    resolve: app.resolve.VmsDiscountProcessController
                })
                .state("vms-discount.conflicts", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/conflicts',
                    controller: 'VmsDiscountConflictsController',
                    templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountConflicts.html',
                    controllerAs: 'conflict',
                    resolve: app.resolve.VmsDiscountConflictsController
                })
                .state("vms-discount.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsDiscountDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountDocument.html',
                    resolve: app.resolve.VmsDiscountDocumentController
                })
                .state('vms-discount.document.details', {
                    url: '/details',
                    views: {
                        'discountBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountDocumentDetails.html',
                            controller: 'VmsDiscountDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state('vms-discount.document.files', {
                    url: '/files',
                    views: {
                        'discountBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountDocumentFiles.html',
                            controller: 'VmsDiscountDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms-discount.document.workflow", {
                    url: '/workflow',
                    views: {
                        'discountBatchTab': {
                            templateUrl: '/Phoenix/modules/vmsDiscount/views/VmsDiscountDocumentWorkflow.html',
                            controller: 'VmsDiscountDocumentWorkflowController',
                            controllerAs: 'workflow'
                        }
                    }
                })
            ;
        }
    ]);
})();