(function () {
    'use strict';

    var app = angular.module('Phoenix');
    // define app.resolve
    if (!app.resolve) app.resolve = {};

    // configure app routing}
    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
        function ($httpProvider, $stateProvider, $urlRouterProvider) {

            $stateProvider.state('org', {
                url: '/org',
                template: '<div data-ui-view="" autoscroll="false"></div>'
            })
            .state("org.role", {
                url: '/role',
            })
            .state("org.role.client", {
                url: '/{roleId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.getByOrganizationClientRoleId($state.params.roleId, null).then(function (response) {
                        $state.go('org.edit.roles', { organizationId: response.Id, roleId: $state.params.roleId });
                    });
                    return result.promise;
                }]
            })
            .state("org.role.independentcontractor", {
                url: '/independentcontractor/{roleId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.getByOrganizationIndependentContractorRoleId($state.params.roleId, null).then(function (response) {
                        $state.go('org.edit.roles', { organizationId: response.Id, roleId: $state.params.roleId });
                    });
                    return result.promise;
                }]
            })
            .state("org.role.limitedliabilitycompany", {
                url: '/limitedliabilitycompany/{roleId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.getByOrganizationLimitedLiabilityCompanyRoleId($state.params.roleId, null).then(function (response) {
                        $state.go('org.edit.roles', { organizationId: response.Id, roleId: $state.params.roleId });
                    });
                    return result.promise;
                }]
            })
            .state("org.role.subvendor", {
                url: '/subvendor/{roleId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.getByOrganizationSubVendorRoleId($state.params.roleId, null).then(function (response) {
                        $state.go('org.edit.roles', { organizationId: response.Id, roleId: $state.params.roleId });
                    });
                    return result.promise;
                }]
            })
            .state("org.role.internal", {
                url: '/internal/{roleId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.getByOrganizationInternalRoleId($state.params.roleId, null).then(function (response) {
                        $state.go('org.edit.roles', { organizationId: response.Id, roleId: $state.params.roleId });
                    });
                    return result.promise;
                }]
            })
            .state('org.quickadd', {
                url: '/quickadd',
                resolve: app.resolve.OrgEditController,
                views: {
                    '': {
                        controller: 'OrgEditController',
                        controllerAs: 'scopeOrg',
                        templateUrl: '/Phoenix/modules/org/views/OrgQuickAddView.html',
                    },
                    'OrgUiViewOrganizationDetails@org.quickadd': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationDetails.html',
                    },
                    'OrgUiViewOrganizationAddresses@org.quickadd': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationAddresses.html'
                    },
                    'OrgUiViewOrganizationTaxNumbers@org.quickadd': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationTaxNumbers.html'
                    },
                    'OrgUiViewOrganizationPrimaryContact@org.quickadd': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationPrimaryContact.html'
                    },
                    
                    'OrgUiViewOrganizationCollaborators@org.quickadd': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationCollaborators.html'
                    },
                },
            })
            .state('org.create', {
                url: '/create',
                controller: ['$state', '$q', 'OrgApiService', function ($state, $q, OrgApiService) {
                    var result = $q.defer();
                    OrgApiService.organizationNew({
                        OrganizationStatusId: ApplicationConstants.OrganizationStatus.New,
                        Code: null,
                        LegalName: null,
                        DisplayName: null,
                        IndustryTypeId: null,
                        SectorTypeId: null,
                        CountryId: 124, //CountryCanada
                        DefaultTaxSubdivisionId: null,
                        ParentOrganizationId: null,
                        ParentOrganization: null,
                        OrganizationAddresses: [{
                            IsPrimary: true,
                            AddressDescription: null,
                            CityName: null,
                            AddressLine1: null,
                            AddressLine2: null,
                            CountryId: 124, //CountryCanada
                            SubdivisionId: null,
                            PostalCode: null,
                        }],
                    }).then(
                        function (responseSave) {
                            $state.go('org.edit.details', { organizationId: responseSave.EntityId });
                        });
                    return result.promise;
                }]
            })
            .state('org.search', {
                url: '/search',
                controller: 'OrgSearchController',
                templateUrl: '/Phoenix/modules/org/views/OrgSearchView.html',
            })
            .state('org.pendingReview', {
                url: '/pending-review',
                controller: 'OrgSearchController',
                templateUrl: '/Phoenix/modules/org/views/OrgSearchView.html',
            })
            .state('org.declined', {
                url: '/declined',
                controller: 'OrgDeclinedController',
                templateUrl: '/Phoenix/modules/org/views/OrgSearchView.html',
            })
            .state('org.edit', {
                url: '/{organizationId:[0-9]{1,8}}',
                controller: 'OrgEditController',
                controllerAs: 'scopeOrg',
                resolve: app.resolve.OrgEditController,
                templateUrl: '/Phoenix/modules/org/views/OrgEdit.html',
            })
            .state('org.edit.details', {
                url: '/details',
                views: {
                    'organizationActiveTab': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabDetails.html'
                    },
                    'OrgUiViewOrganizationDetails@org.edit.details': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationDetails.html'
                    },
                    'OrgUiViewOrganizationAddresses@org.edit.details': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationAddresses.html'
                    },
                },
            })
            .state('org.edit.roles', {
                url: '/roles',
                views: {
                    'organizationActiveTab': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabRoles.html',
                    },
                    'OrgUiViewOrganizationRoleClient@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleClient.html'
                    },
                    'OrgUiViewOrganizationRoleIndependentContractor@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleIndependentContractor.html'
                    },
                    'OrgUiViewOrganizationRoleLimitedLiabilityCompany@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleLimitedLiabilityCompany.html'
                    },
                    'OrgUiViewOrganizationRoleSubVendor@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleSubVendor.html'
                    },
                    'OrgUiViewOrganizationRoleInternal@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleInternal.html'
                    },
                    'OrgUiViewOrganizationTaxNumbers@org.edit.roles': {
						templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationTaxNumbers.html'
                    },
                    'OrgUiViewOrganizationRoleClientAlternateBill@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleClientAlternateBill.html'
                    },
                    'OrgUiViewOrganizationRoleClientImport@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleClientImport.html'
                    },
                    'OrgUiViewOrganizationInternalRoleBankAccounts@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationInternalRoleBankAccounts.html'
                    },
                    'OrgUiViewOrganizationIndependentContractorRolePaymentMethods@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationIndependentContractorRolePaymentMethods.html'
                    },
                    'OrgUiViewOrganizationLimitedLiabilityCompanyRolePaymentMethods@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationLimitedLiabilityCompanyRolePaymentMethods.html'
                    },
                    'OrgUiViewOrganizationSubVendorRolePaymentMethods@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationSubVendorRolePaymentMethods.html'
                    },
                    'OrgUiViewOrganizationRoleSubVendorRestrictions@org.edit.roles': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationRoleSubVendorRestrictions.html'
                },
                },
            })
            .state('org.edit.roles.client', {
                url: '/client/{roleId:[0-9]{1,8}}',
            })
            .state('org.edit.roles.independentcontractor', {
                url: '/independentcontractor/{roleId:[0-9]{1,8}}',
            })
            .state('org.edit.roles.limitedliabilitycompany', {
                url: '/limitedliabilitycompany/{roleId:[0-9]{1,8}}',
            })
            .state('org.edit.roles.subvendor', {
                url: '/subvendor/{roleId:[0-9]{1,8}}',
            })
            .state('org.edit.roles.internal', {
                url: '/internal/{roleId:[0-9]{1,8}}',
            })
            .state('org.edit.contacts', {
                url: '/contacts',
                views: {
                    'organizationActiveTab': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabContacts.html',
                        controller: 'OrgEditControllerContactSearch'
                    }
                }
            })
            .state('org.edit.collaborators', {
                url: '/collaborators',
                views: {
                    'organizationActiveTab': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabCollaborators.html',
                    },
                    'OrgUiViewOrganizationCollaborators@org.edit.collaborators': {
                        templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewOrganizationCollaborators.html'
                    },
                },
            })
            .state('org.edit.notes', {
                url: '/notes',
                views: {
                    "organizationActiveTab": {
                        template: '<div class="content-group form-horizontal" ng-if="scopeOrg.actionScope.show.notesView">'+
                        '<div data-pt-comment-utility-service="" ' +
                            'data-entity-type-id="ApplicationConstants.EntityType.Organization" ' +
                            'data-entity-id="$state.params.organizationId" ' +
                            'data-func-get-notes-length="scopeOrg.updateNotesTotal"' +
                            'data-header-text="Add your notes here" ' +
                            '></div></div>'
                    }
                }
            })
           .state('org.edit.history', {
               url: '/history',
               views: {
                   'organizationActiveTab': {
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabHistory.html',
                   },
               },
           })
           .state('org.edit.advances', {
               url: '/advances',
               views: {
                   'organizationActiveTab': {
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabAdvances.html',
                       controller: 'OrgAdvanceController',
                       controllerAs: 'scopeAdvance'
                   }
               }
           })
           .state('org.edit.advances.new', {
               url: '/new',
               resolve: app.resolve.OrgAdvanceNewController,
               views:
               {
                   'newAdvanceView@org.edit.advances':
                   {
                       controller: 'OrgAdvanceNewController',
                       controllerAs: 'scopeAdvanceNew',
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabAdvancesNew.html'
                       
                   }
               }               
           })
           .state('org.edit.advances.details', {
               url: '/details/{advanceId:[0-9]{1,8}}',
               resolve: app.resolve.OrgAdvanceDetailsController,
               views:
               {
                   'advanceDetailsView@org.edit.advances':
                   {
                       controller: 'OrgAdvanceDetailsController',
                       controllerAs: 'scopeAdvanceDetails',
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabAdvancesDetails.html'                       
                   }
               }               
           })
           .state('org.edit.garnishees', {
               url: '/garnishees',
               views: {
                   'organizationActiveTab': {
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabGarnishees.html',
                       controller: 'OrgGarnisheeController',
                       controllerAs: 'scopeGarnishee'
                   }
               }
           })
           .state('org.edit.garnishees.new', {
               url: '/new',
               resolve: app.resolve.OrgGarnisheeNewController,
               views:
               {
                   'newGarnisheeView@org.edit.garnishees':
                   {
                       controller: 'OrgGarnisheeNewController',
                       controllerAs: 'scopeGarnisheeNew',
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabGarnisheesNew.html'
                   }
               },
           })
           .state('org.edit.garnishees.details', {
               url: '/details/{garnisheeId:[0-9]{1,8}}',
               resolve: app.resolve.OrgGarnisheeDetailsController,
               views:
               {
                   'garnisheeDetailsView@org.edit.garnishees':
                   {
                       controller: 'OrgGarnisheeDetailsController',
                       controllerAs: 'scopeGarnisheeDetails',
                       templateUrl: '/Phoenix/modules/org/views/UiView/OrgUiViewTabGarnisheesDetails.html'
                   }
               }
           })
           .state('org.rebatesandfees', {
               url: '/rebatesandfees',
               controller: 'OrgRebatesAndFeesController',
               templateUrl: '/Phoenix/modules/org/views/OrgRebatesAndFees.html',
               controllerAs: 'rf'
           })
           .state('org.rebatesandfeesdetails', {
               url: '/{organizationId:[0-9]{1,8}}/rebatesandfees',
               controller: 'OrgRebatesAndFeesDetailsController',
               templateUrl: '/Phoenix/modules/org/views/OrgRebatesAndFeesDetails.html',
               controllerAs: 'vm'
           })
           .state('org.rebate', {
               url: '/rebate/rebateHeader/{rebateHeaderId:[0-9]{1,8}}/rebateVersion/{rebateVersionId:[0-9]{1,8}}/:orgId',
               controller: 'OrgRebateController',
               templateUrl: '/Phoenix/modules/org/views/OrgRebate.html',
               controllerAs: 'rebate',
               resolve: app.resolve.OrgRebateController,
           })
           .state('org.vmsfee', {
               url: '/vmsfee/vmsFeeHeader/{vmsFeeHeaderId:[0-9]{1,8}}/vmsFeeVersion/{vmsFeeVersionId:[0-9]{1,8}}/:orgId',
               controller: 'OrgVmsFeeController',
               controllerAs: 'fee',
               templateUrl: '/Phoenix/modules/org/views/OrgVmsFee.html',
               resolve: app.resolve.OrgVmsFeeController,
           })
           .state('org.branchlist', {
               url: '/branch/list',
               controller: 'BranchSearchController',
               templateUrl: '/Phoenix/modules/org/views/BranchSearch.html',
           })
           .state('org.branch', {
               url: '/branch/:branchId',
               controller: 'BranchEditController',
               controllerAs: 'vm',
               templateUrl: '/Phoenix/modules/org/views/BranchEdit.html',
               resolve: app.resolve.BranchEditController,
           })
            ;
        }
    ]);
})();