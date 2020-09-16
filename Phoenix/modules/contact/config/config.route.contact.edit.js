(function () {
    'use strict';
    var associatedWorkordersRouteObj = {
        template: '<app-associated-workorders></app-associated-workorders>',
        controller: ['$scope', function ($scope) {
            $scope.edit.isNotProfilePage = true;
        }]
    };
    var app = angular.module('Phoenix');
    // define app.resolve
    if (!app.resolve) app.resolve = {};

    angular.module('Phoenix')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            // todo - in moving this over, I'm not sure if this needs to be here - dbye (original comment below)
            // temporary URL mapping until everyhting is updated, todo: get correct sref routes
            $stateProvider
                .state('ContactEdit', {
                    abstract: true,
                    url: '/contacts',
                    template: '<ui-view/>'
                })

                .state("UserProfile", {
                url: '/userprofile/{profileId:[0-9]{1,8}}',
                controller: ['$state', '$q', 'phoenixapi', function ($state, $q, phoenixapi) {
                    var result = $q.defer();
                    phoenixapi.query('UserProfile/' + $state.params.profileId).then(function (response) {
                        var options = { location: 'replace' };

                        if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                            $state.go('EditWorkerTempProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                            $state.go('EditWorkerCanadianSPProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc) {
                            $state.go('EditWorkerCanadianIncProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor) {
                            $state.go('EditWorkerSubVendorProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
                            $state.go('EditWorkerUnitedStatesW2Profile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
                            $state.go('EditWorkerUnitedStatesLLCProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.Organizational) {
                            $state.go('EditOrganizationalProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                        else if (response.ProfileTypeId == ApplicationConstants.UserProfileType.Internal) {
                            $state.go('EditInternalProfile', { contactId: response.ContactId, profileId: response.Id }, options);
                        }
                    });
                    return result.promise;
                }]
            })
                .state('EditOrganizationalProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/organizational/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon-organizational-profile'
                        },
                        profileTypeKey: 'organizational',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: false,
                        taxExempt: false,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        isBlockVisible: false,
                        workerEligibilityPanel: false
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.organizational, $stateParams.profileId);
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }],
                        smallBusinesses: [function () {
                            return null;
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditOrganizationalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditOrganizationalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditOrganizationalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        },
                        'Organization@EditOrganizationalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Organization.html',
                            controller: 'OrganizationController',
                            controllerAs: 'organization'
                        }
                    }
                }).state("EditOrganizationalProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditOrganizationalProfile': associatedWorkordersRouteObj
                    }
                }).state("EditOrganizationalProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditOrganizationalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditOrganizationalProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditOrganizationalProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditInternalProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/internal/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon-internal-profile'
                        },
                        profileTypeKey: 'internal',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: false,
                        taxExempt: false,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        isBlockVisible: false,
                        workerEligibilityPanel: false
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.internal, $stateParams.profileId);
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }],
                        smallBusinesses: [function () {
                            return null;
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        },
                        'InternalCommission@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/InternalCommission.html',
                            controller: 'InternalCommissionController',
                            controllerAs: 'vmCommission'
                        },
                        'InternalOrganization@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Organization.html',
                            controller: 'OrganizationController',
                            controllerAs: 'organization'
                        },
                        'Internal@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Internal.html',
                            controller: 'InternalController',
                            controllerAs: 'internal'
                        },
                        'InternalSubscriptions@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/InternalSubscriptions.html',
                            controller: 'InternalSubscriptionsController',
                            controllerAs: 'vmSub',
                        }
                    }
                }).state("EditInternalProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditInternalProfile': associatedWorkordersRouteObj
                    }
                }).state("EditInternalProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditInternalProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditInternalProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditInternalProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditWorkerTempProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workertemp/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workertemp',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: true,
                        taxExempt: true,
                        fullTaxExempt: true,
                        saveAsDraft: true,
                        isBlockVisible: true,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return contactService.getListOrganizationInternal();
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.tempWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: [function () {
                            return null;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        },
                        'ContactAdvances@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Advances.html',
                            controller: 'ContactAdvancesController',
                            controllerAs: 'scopeAdvance'
                        },
                        'ContactGarnishees@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Garnishees.html',
                            controller: 'ContactGarnisheesController',
                            controllerAs: 'scopeGarnishee'
                        }
                    }
                }).state("EditWorkerTempProfile.NewAdvance", {
                    url: '/newadvance',
                    views:
                    {
                        'newAdvanceView@EditWorkerTempProfile':
                        {
                            controller: 'ContactAdvanceNewController',
                            controllerAs: 'scopeAdvanceNew',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesNew.html'
                        }
                    },
                    resolve: app.resolve.ContactAdvanceNewController
                }).state("EditWorkerTempProfile.AdvanceDetails", {
                    url: '/advancedetails/{advanceId:[0-9]{1,8}}',
                    views:
                    {
                        'advanceDetailsView@EditWorkerTempProfile':
                        {
                            controller: 'ContactAdvanceDetailsController',
                            controllerAs: 'scopeAdvanceDetails',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesDetails.html',

                        }
                    },
                    resolve: app.resolve.ContactAdvanceDetailsController
                }).state("EditWorkerTempProfile.NewGarnishee", {
                    url: '/newgarnishee',
                    views:
                    {
                        'newGarnisheeView@EditWorkerTempProfile':
                        {
                            controller: 'ContactGarnisheeNewController',
                            controllerAs: 'scopeGarnisheeNew',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeNew.html',
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeNewController
                }).state("EditWorkerTempProfile.GarnisheeDetails", {
                    url: '/garnisheedetails/{garnisheeId:[0-9]{1,8}}',
                    views:
                    {
                        'garnisheeDetailsView@EditWorkerTempProfile':
                        {
                            controller: 'ContactGarnisheeDetailsController',
                            controllerAs: 'scopeGarnisheeDetails',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeDetails.html',
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeDetailsController
                }).state("EditWorkerTempProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerTempProfile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerTempProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerTempProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                })
                .state("EditWorkerTempProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerTempProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })
                .state('EditWorkerUnitedStatesW2Profile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workerunitedstatesw2/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workerunitedstatesw2',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: true,
                        taxExempt: true,
                        fullTaxExempt: true,
                        saveAsDraft: true,
                        isBlockVisible: true,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return contactService.getListOrganizationInternal();
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.tempWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: [function () {
                            return null;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        },
                        'ContactAdvances@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/Advances.html',
                            controller: 'ContactAdvancesController',
                            controllerAs: 'scopeAdvance'
                        },
                        'ContactGarnishees@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/Garnishees.html',
                            controller: 'ContactGarnisheesController',
                            controllerAs: 'scopeGarnishee'
                        }
                    }
                }).state("EditWorkerUnitedStatesW2Profile.NewAdvance", {
                    url: '/newadvance',
                    views:
                    {
                        'newAdvanceView@EditWorkerUnitedStatesW2Profile':
                        {
                            controller: 'ContactAdvanceNewController',
                            controllerAs: 'scopeAdvanceNew',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesNew.html'
                        }
                    },
                    resolve: app.resolve.ContactAdvanceNewController
                }).state("EditWorkerUnitedStatesW2Profile.AdvanceDetails", {
                    url: '/advancedetails/{advanceId:[0-9]{1,8}}',
                    views:
                    {
                        'advanceDetailsView@EditWorkerUnitedStatesW2Profile':
                        {
                            controller: 'ContactAdvanceDetailsController',
                            controllerAs: 'scopeAdvanceDetails',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesDetails.html',

                        }
                    },
                    resolve: app.resolve.ContactAdvanceDetailsController
                }).state("EditWorkerUnitedStatesW2Profile.NewGarnishee", {
                    url: '/newgarnishee',
                    views:
                    {
                        'newGarnisheeView@EditWorkerUnitedStatesW2Profile':
                        {
                            controller: 'ContactGarnisheeNewController',
                            controllerAs: 'scopeGarnisheeNew',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeNew.html',
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeNewController
                }).state("EditWorkerUnitedStatesW2Profile.GarnisheeDetails", {
                    url: '/garnisheedetails/{garnisheeId:[0-9]{1,8}}',
                    views:
                    {
                        'garnisheeDetailsView@EditWorkerUnitedStatesW2Profile':
                        {
                            controller: 'ContactGarnisheeDetailsController',
                            controllerAs: 'scopeGarnisheeDetails',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeDetails.html',
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeDetailsController
                }).state("EditWorkerUnitedStatesW2Profile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerUnitedStatesW2Profile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerUnitedStatesW2Profile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerUnitedStatesW2Profile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditWorkerUnitedStatesW2Profile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerUnitedStatesW2Profile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditWorkerCanadianIncProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workercanadianinc/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workercanadianinc',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: false,
                        taxExempt: false,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        companyName: false,
                        workerCompany: true,
                        isBlockVisible: false,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.canadianIncWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: ['$q', 'OrgApiService', function ($q, OrgApiService) {
                            var defer = $q.defer();
                            var odataquery = '$filter=IsOrganizationIndependentContractorRole eq true';
                            OrgApiService.getListOriginalOrganizations(odataquery)
                                .then(function (result) {
                                    defer.resolve(result.Items);
                                }, function (error) {
                                    defer.reject(error);
                                });

                            return defer.promise;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerCanadianIncProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerCanadianIncProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerCanadianIncProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        }
                    }
                }).state("EditWorkerCanadianIncProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerCanadianIncProfile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerCanadianIncProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerCanadianIncProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditWorkerCanadianIncProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerCanadianIncProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditWorkerUnitedStatesLLCProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workerunitedstatesllc/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workerunitedstatesllc',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: false,
                        taxExempt: false,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        companyName: false,
                        workerCompany: true,
                        isBlockVisible: false,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.canadianIncWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: ['$q', 'OrgApiService', function ($q, OrgApiService) {
                            var defer = $q.defer();
                            var odataquery = '$filter=IsOrganizationLimitedLiabilityCompanyRole eq true';
                            OrgApiService.getListOriginalOrganizations(odataquery)
                                .then(function (result) {
                                    defer.resolve(result.Items);
                                }, function (error) {
                                    defer.reject(error);
                                });

                            return defer.promise;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerUnitedStatesLLCProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerUnitedStatesLLCProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerUnitedStatesLLCProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        }
                    }
                }).state("EditWorkerUnitedStatesLLCProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerUnitedStatesLLCProfile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerUnitedStatesLLCProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerUnitedStatesLLCProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditWorkerUnitedStatesLLCProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerUnitedStatesLLCProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditWorkerSubVendorProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workersubvendor/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workersubvendor',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: false,
                        taxExempt: false,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        companyName: false,
                        workerCompany: true,
                        isBlockVisible: false,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.subVendorWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: ['$q', 'OrgApiService', function ($q, OrgApiService) {
                            var defer = $q.defer();
                            var odataquery = '$filter=IsOrganizationSubVendorRole eq true';
                            OrgApiService.getListOriginalOrganizations(odataquery)
                                .then(function (result) {
                                    defer.resolve(result.Items);
                                }, function (error) {
                                    defer.reject(error);
                                });

                            return defer.promise;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerSubVendorProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerSubVendorProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerSubVendorProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        }
                    }
                }).state("EditWorkerSubVendorProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerSubVendorProfile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerSubVendorProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerSubVendorProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditWorkerSubVendorProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerSubVendorProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })



                .state('EditWorkerCanadianSPProfile', {
                    url: '/contacts/{contactId:[0-9]{1,8}}/profile/workercanadiansp/{profileId:[0-9]{1,8}}',
                    data: {
                        title: {
                            main: 'Edit Contact',
                            icon: 'icon icon-contact',
                            ProfileIcon: 'icon icon-worker-profile'
                        },
                        profileTypeKey: 'workercanadiansp',
                        newProfileButton: false,
                        newContact: true,
                        addressesPanel: true,
                        phoneNumbersPanel: true,
                        personalInfoPanel: true,
                        taxExempt: true,
                        fullTaxExempt: false,
                        saveAsDraft: true,
                        companyName: true,
                        workerCompany: false,
                        salesTax: true,
                        isBlockVisible: true,
                        workerEligibilityPanel: true
                    },
                    resolve: {
                        resolveListOrganizationInternal: ['contactService', '$q', function (contactService, $q) {
                            return null;
                        }],
                        resolveListOrganizationClientForWorkerProfile: ['$stateParams', 'contactService', '$q', function ($stateParams, contactService, $q) {
                            return contactService.getListOrganizationClientForWorkerProfile($stateParams.profileId);
                        }],
                        profile: ['$stateParams', 'contactService', 'profileTypeMapping', function ($stateParams, contactService, profileTypeMapping) {
                            return contactService.getEditProfile(profileTypeMapping.canadianSPWorker, $stateParams.profileId);
                        }],
                        smallBusinesses: [function () {
                            return null;
                        }],
                        profiles: ['$stateParams', 'contactService', function ($stateParams, contactService) {
                            var contactId = parseInt($stateParams.contactId, 10);
                            if (contactId > 0) {
                                return contactService.getContactProfiles($stateParams.contactId);
                            }
                        }]
                    },
                    views: {
                        '': {
                            templateUrl: '/Phoenix/modules/contact/views/Contact.html',
                            controller: 'ContactController',
                            controllerAs: 'edit'
                        },
                        'ContactEmail@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactEmail.html',
                            controller: 'ContactEmailController',
                            controllerAs: 'email'
                        },
                        'ContactName@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactName.html',
                            controller: 'ContactNameController',
                            controllerAs: 'contact'
                        },
                        'Profile@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Profile.html',
                            controller: 'ProfileController',
                            controllerAs: 'profile'
                        },
                        'ContactAdvances@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Advances.html',
                            controller: 'ContactAdvancesController',
                            controllerAs: 'scopeAdvance'
                        },
                        'ContactGarnishees@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/Garnishees.html',
                            controller: 'ContactGarnisheesController',
                            controllerAs: 'scopeGarnishee'
                        }
                    }
                }).state("EditWorkerCanadianSPProfile.NewAdvance", {
                    url: '/newadvance',
                    views:
                    {
                        'newAdvanceView@EditWorkerCanadianSPProfile':
                        {
                            controller: 'ContactAdvanceNewController',
                            controllerAs: 'scopeAdvanceNew',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesNew.html',
                        }
                    },
                    resolve: app.resolve.ContactAdvanceNewController
                }).state("EditWorkerCanadianSPProfile.AdvanceDetails", {
                    url: '/advancedetails/{advanceId:[0-9]{1,8}}',
                    views:
                    {
                        'advanceDetailsView@EditWorkerCanadianSPProfile':
                        {
                            controller: 'ContactAdvanceDetailsController',
                            controllerAs: 'scopeAdvanceDetails',
                            templateUrl: '/Phoenix/modules/contact/views/AdvancesDetails.html'
                        }
                    },
                    resolve: app.resolve.ContactAdvanceDetailsController
                })
                .state("EditWorkerCanadianSPProfile.NewGarnishee", {
                    url: '/newgarnishee',
                    views:
                    {
                        'newGarnisheeView@EditWorkerCanadianSPProfile':
                        {
                            controller: 'ContactGarnisheeNewController',
                            controllerAs: 'scopeGarnisheeNew',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeNew.html'
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeNewController
                }).state("EditWorkerCanadianSPProfile.GarnisheeDetails", {
                    url: '/garnisheedetails/{garnisheeId:[0-9]{1,8}}',
                    views:
                    {
                        'garnisheeDetailsView@EditWorkerCanadianSPProfile':
                        {
                            controller: 'ContactGarnisheeDetailsController',
                            controllerAs: 'scopeGarnisheeDetails',
                            templateUrl: '/Phoenix/modules/contact/views/GarnisheeDetails.html'
                        }
                    },
                    resolve: app.resolve.ContactGarnisheeDetailsController
                }).state("EditWorkerCanadianSPProfile.WorkOrders", {
                    url: '/workorders',
                    data: {
                        title: {
                            main: 'Contact WorkOrders',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'WorkOrders@EditWorkerCanadianSPProfile': associatedWorkordersRouteObj
                    }
                }).state("EditWorkerCanadianSPProfile.ContactNotes", {
                    url: '/notes',
                    data: {
                        title: {
                            main: 'Contact Notes',
                            icon: 'icon icon-contact'
                        }
                    },
                    views: {
                        'ContactNotes@EditWorkerCanadianSPProfile': {
                            templateUrl: '/Phoenix/modules/contact/views/ContactNotes.html',
                            controller: 'ContactNotesController',
                            controllerAs: 'contactNotes'
                        }
                    }
                }).state("EditWorkerCanadianSPProfile.History", {
                    url: '/history',
                    data: {
                        title: {
                            main: 'Contact History',
                            icon: 'icon icon-contact'
                        }
                    },
                    views:
                    {
                        'History@EditWorkerCanadianSPProfile':
                        {
                            templateUrl: '/Phoenix/modules/contact/views/ContactHistory.html',
                            controller: 'ContactHistoryController',
                            controllerAs: 'history'
                        }
                    }
                })
                .state("ContactEdit.InternalTeamEdit", {
                    url: '/internalteams/team/{internalTeamId:[0-9]{1,8}}',
                    controller: 'InternalTeamEditController',
                    controllerAs: 'edit',
                    templateUrl: '/Phoenix/modules/contact/views/InternalTeamEdit.html',
                    resolve: app.resolve.InternalTeamEditController
                });
        }]);
})();