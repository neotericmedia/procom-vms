(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('OrganizationController', OrganizationController);

    OrganizationController.$inject = ['$state', 'CodeValueService', 'contactService', 'profile', 'profiles', 'ProfileApiService'];
    function OrganizationController($state, CodeValueService, contactService, profile, profiles, ProfileApiService) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            currentProfile: profile,
            organizationProfilesList: [],
            organizationsList: [],
            internalOrganizationDefinition1List: CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true),
            currentProfiles: profiles ? profiles.Items : profiles
        });

        self.currentProfile.InternalOrganizationDefinition1Id = !self.currentProfile.InternalOrganizationDefinition1Id ? null : self.currentProfile.InternalOrganizationDefinition1Id;

        if ($state.params.organizationId) {
            self.currentProfile.OrganizationId = $state.params.organizationId;
        }
        else if (self.currentProfile.Organization) {
            self.currentProfile.OrganizationId = self.currentProfile.Organization.Id;
        }

        if (self.currentProfile.IsDraftStatus) {

            if (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Organizational) {
                contactService.getListOrganizationsOriginalWithActiveNonInternalRole().then(function (organizations) {                                       
                    self.organizationsList = organizations.Items;

                    _.each(self.currentProfiles, function (p) {
                        if (p.ProfileTypeId == ApplicationConstants.UserProfileType.Organizational && p.OrganizationId)
                            self.organizationsList = _.reject(self.organizationsList, function (o) { return p.OrganizationId == o.Id; });
                    });                    
                });
            }

            if (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Internal) {
                contactService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole().then(function (organizations) {
                    self.organizationsList = organizations.Items;
                });
            }            
        }
        
        contactService.searchProfiles(self.currentProfile.OrganizationId).then(function (profiles) {
            self.organizationProfilesList = _.reject(profiles.Items, function (p) { return p.Id == self.currentProfile.Id; });
            ProfileApiService.removeInactiveProfile(self.organizationProfilesList, self.currentProfile.ReportsToProfileId);
        });

        self.organizationChanged = function (organizationId) {
            contactService.searchProfiles(organizationId).then(function (profiles) {
                self.organizationProfilesList = _.reject(profiles.Items, function (p) { return p.Id == self.currentProfile.Id; });
                // organization.currentProfile.ReportsToProfileId
                ProfileApiService.removeInactiveProfile(self.organizationProfilesList, self.currentProfile.ReportsToProfileId);
            });
        };

        self.organizationRestored = function () {
            self.currentProfile.OrganizationId = null;
            self.currentProfile.ReportsToProfileId = null;
        };
    }
})();