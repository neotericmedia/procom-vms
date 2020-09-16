(function () {
    'use strict';

    angular.module('Phoenix')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('WizardOrganizationalProfile', {
                    url: '/wizardorganizationalprofile?organizationId&primaryEmail&contactId',
                    templateUrl: '/Phoenix/modules/contact/views/CreateNewContact.html',
                    controller: 'CreateNewContactController',
                    controllerAs: 'create',
                    data: {
                        title: {
                            heading: "Enter the person's email address and select the organization",
                            main: 'Create Organizational Contact',
                            icon: 'icon icon-organizational-profile'
                        },
                        profileType: 'Organizational',
                        organizational: true,
                        internal: false,
                        worker: false,
                        profileTypeId: ApplicationConstants.UserProfileType.Organizational
                    }
                })
                .state('WizardInternalProfile', {
                    url: '/wizardinternalprofile',
                    templateUrl: '/Phoenix/modules/contact/views/CreateNewContact.html',
                    controller: 'CreateNewContactController',
                    controllerAs: 'create',
                    data: {
                        title: {
                            heading: "Enter the person's email address and select the organization",
                            main: 'Create Internal Contact',
                            icon: 'icon icon-organizational-profile'
                        },
                        profileType: 'Organizational',
                        organizational: false,
                        internal: true,
                        worker: false,
                        profileTypeId: ApplicationConstants.UserProfileType.Internal
                    }
                })
                .state('WizardCreateWorkerProfile', {
                    url: '/wizardworkerprofile',
                    templateUrl: '/Phoenix/modules/contact/views/CreateNewContact.html',
                    controller: 'CreateNewContactController',
                    controllerAs: 'create',
                    data: {
                        title: {
                            heading: "Enter the person's email address and select the organization",
                            main: 'Create Worker Contact',
                            icon: 'icon icon-worker-profile'
                        },
                        organizational: false,
                        internal: false,
                        worker: true,
                        profileTypeId: null,
                    }
                })
        }]);
})();
