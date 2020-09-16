(function () {
    'use strict';

    var app = angular.module('Phoenix');

    if (!app.resolve) app.resolve = {};

    app.config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state("vms-expense", {
                    url: '/vms-expense',
                    'abstract': true,
                    template: '<div data-ui-view="" autoscroll="false"></div>'
                })
                .state("vms-expense.process", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/process',
                    controller: 'VmsExpenseProcessController',
                    templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseProcess.html',
                    controllerAs: 'trn',
                    resolve: app.resolve.VmsExpenseProcessController
                })
                .state("vms-expense.conflicts", {
                    url: '/internal-organization/{internalOrganizationId:[0-9]{1,8}}/conflicts',
                    controller: 'VmsExpenseConflictsController',
                    templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseConflicts.html',
                    controllerAs: 'conflict',
                    resolve: app.resolve.VmsExpenseConflictsController
                })
                .state("vms-expense.search", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}',
                    controller: 'VmsExpenseDocumentSearchController',
                    controllerAs: 'docs',
                    templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseDocumentSearch.html',
                })
                .state("vms-expense.document", {
                    url: '/InternalOrganization/{internalOrganizationId:[0-9]{1,8}}/document/{documentId:[0-9]{1,8}}',
                    controller: 'VmsExpenseDocumentController',
                    controllerAs: 'document',
                    templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseDocument.html',
                    resolve: app.resolve.VmsExpenseDocumentController
                })
                .state('vms-expense.document.details', {
                    url: '/details',
                    views: {
                        'expenseDocTab': {
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseDocumentDetails.html',
                            controller: 'VmsExpenseDocumentDetailsController',
                            controllerAs: 'details',
                        }
                    },
                })
                .state('vms-expense.document.files', {
                    url: '/files',
                    views: {
                        'expenseDocTab': {
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseDocumentFiles.html',
                            controller: 'VmsExpenseDocumentFilesController',
                            controllerAs: 'files',
                        }
                    },
                })
                .state("vms-expense.document.workflow", {
                    url: '/workflow',
                    views: {
                        'expenseDocTab': {
                            templateUrl: '/Phoenix/modules/vmsExpense/views/VmsExpenseDocumentWorkflow.html',
                            controller: 'VmsExpenseDocumentWorkflowController',
                            controllerAs: 'workflow'                            
                        }
                    }
                })
            ;
        }
    ]);
})();