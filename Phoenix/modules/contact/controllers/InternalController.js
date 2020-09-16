(function () {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('InternalController', InternalController);

    InternalController.$inject = ['$state', 'CodeValueService', 'contactService', 'profile'];

    function InternalController($state, CodeValueService, contactService, profile) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            currentProfile: profile,
            organizationProfilesList: [],
            organizationsList: [],
            functionalRoleList: [],
            functionalRole: null
        });

        self.UserProfileFunctionalRoles = self.currentProfile.UserProfileFunctionalRoles;

        //contactService.searchProfiles(self.currentProfile.OrganizationId).then(function (profiles) {
        //    self.organizationProfilesList = _.reject(profiles.Items, function (p) { return p.Id == self.currentProfile.Id; });
        //});

        //this.organizationChanged = function (organizationId) {
        //    contactService.searchProfiles(organizationId).then(function (profiles) {
        //        self.organizationProfilesList = _.reject(profiles.Items, function (p) { return p.Id == self.currentProfile.Id; });
        //    });
        //};

        self.ProfileGroupId = CodeValueService.getParentId(CodeValueGroups.ProfileType, self.currentProfile.ProfileTypeId);

        self.functionalRoleList = CodeValueService.getRelatedCodeValues(CodeValueGroups.FunctionalRole, self.ProfileGroupId, CodeValueGroups.ProfileGroup);

        contactService.defaultRole(self.currentProfile.Id).then(function (role) {
            self.functionalRole = role;
            if (self.UserProfileFunctionalRoles == []._ || self.UserProfileFunctionalRoles.length === 0) {
                self.addFunctionalRole();
            }
        });

        this.addFunctionalRole = function () {
            var role = angular.copy(self.functionalRole);
            self.UserProfileFunctionalRoles.push(role);
        };

        this.removeFunctionalRole = function (functionalRole) {
            if (!functionalRole) return;
            var index = self.UserProfileFunctionalRoles.indexOf(functionalRole);
            if (index >= 0) self.UserProfileFunctionalRoles.splice(index, 1);
        };

        self.restoreFunctionalRole = function (functionalRole) {
            functionalRole.FunctionalRoleId = null;
        };
    }
})();