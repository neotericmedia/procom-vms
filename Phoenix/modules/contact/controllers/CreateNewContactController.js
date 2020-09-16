(function () {
	'use strict';

	angular.module('phoenix.contact.controllers')
		.controller('CreateNewContactController', CreateNewContactController);

	CreateNewContactController.$inject = ['$state', '$rootScope', 'NavigationService', '$stateParams', 'CodeValueService', 'contactMessages', 'contactService', 'OrgApiService'];
	function CreateNewContactController($state, $rootScope, NavigationService, $stateParams, CodeValueService, contactMessages, contactService, OrgApiService) {
		var self = this;
		//Can't extend this, due to prototypal inheritance of $state.current.parent.data
		for (var key in $state.current.data) {
			self[key] = $state.current.data[key];
		}

		if (self.worker === true) {
			NavigationService.setTitle('new-worker-contact');
		} else if (self.internal === true) {
			NavigationService.setTitle('new-internal-contact');
		} else if (self.organizational === true) {
			NavigationService.setTitle('new-organizational-contact');
		} else {
			NavigationService.setTitle('contact-new');
		}

		angular.extend(self, {
			organizations: [],
			message: '',
			Continue: false,
			submitted: false,
			workerTypes: CodeValueService.getRelatedCodeValues(CodeValueGroups.ProfileType, ApplicationConstants.UserProfileGroupWorker, CodeValueGroups.ProfileGroup),
			newProfile: angular.extend({}, {
				organization: null,
				organizationId: $stateParams.organizationId,
				primaryEmail: $stateParams.primaryEmail,
				contactId: $stateParams.contactId,
				profiles: []
			}),
			changeAction: changeAction,
			continueAction: continueAction,
			createAction: createAction,
			workerTypeChanged: workerTypeChanged,
			openProfile: openProfile
		});



		self.newProfile.profileTypeId = self.profileTypeId;
		if (self.newProfile.profileTypeId) {
			self.newProfile.profileType = CodeValueService.getCodeValue(self.newProfile.profileTypeId, CodeValueGroups.ProfileType).code;
		}


		if (self.organizational) {
			if (self.newProfile.organizationId > 0) {
				contactService.getByOrganizationId(self.newProfile.organizationId, oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'LegalName',]).url()).then(function (organization) {
					self.newProfile.organization = organization;
				});
			} else {
				OrgApiService.getListOrganizationsOriginalWithActiveNonInternalRole().then(function (organizations) {
					self.organizations = organizations.Items;
				});
			}
		}

		function workerTypeChanged(profileTypeId) {
			self.newProfile.profileType = CodeValueService.getCodeValue(profileTypeId, CodeValueGroups.ProfileType).code;
		}

		function changeAction() {
			self.Continue = false;
			self.newProfile.profiles = [];
			self.message = "";

			if ((!self.organizational && self.entityForm.$valid) || ((self.organizational || self.worker) && self.entityForm.myForm.PrimaryEmail.$valid)) {
				self.checkingDuplicateEmails = true;
				contactService.searchAllWorkerProfile(self.newProfile.primaryEmail).then(function (result) {
					var profiles = result.Items;
					self.checkingDuplicateEmails = false;
					if (profiles.length > 0) {
						angular.forEach(profiles, function (profile) {
							var profileType = CodeValueService.getCodeValue(profile.ProfileTypeId, CodeValueGroups.ProfileType);
							profile.profileType = profileType.code;
							profile.profileTypeText = profileType.text;
							profile.profileStatus = CodeValueService.getCodeValue(profile.ProfileStatusId, CodeValueGroups.ProfileStatus).text;
							//profile.canAddProfile = profile.Contact.UserStatusId == ApplicationConstants.ContactStatus.Active && contactService.canAddProfile(self.newProfile.profileTypeId, profile.ContactProfileTypes);
						});
						self.newProfile.profiles = profiles;
						self.message = contactMessages.existingFound;
					}
					else {
						self.message = contactMessages.existingNotFound;
					}
				}).catch(function (err) {
					self.checkingDuplicateEmails = false;
				});
			}
		}

		function openProfile(profile) {
			$rootScope.activateGlobalSpinner = true;
			var existingProfile = null;
			var newOrganizationId = null;
			if (self.internal || self.worker) {
				existingProfile = _.find(self.newProfile.profiles, function (item) {
					return item.ProfileTypeId === self.newProfile.profileTypeId && item.Contact.Id === profile.Contact.Id;
				});
			}
			else if (self.organizational) {
				existingProfile = _.find(self.newProfile.profiles, function (item) {
					return item.ProfileTypeId === self.newProfile.profileTypeId && item.Contact.Id === profile.Contact.Id && item.OrganizationId === self.newProfile.organizationId;
				});
				if (!existingProfile) {
					newOrganizationId = self.newProfile.organizationId;
				}
			}

			if (existingProfile) {
				goToProfile(existingProfile);
			}
			else if (profile.Contact.UserStatusId == ApplicationConstants.ContactStatus.Active && contactService.canAddProfile(self.newProfile.profileTypeId, profile.ContactProfileTypes)) {
				var profileType = CodeValueService.getCodeValue(self.newProfile.profileTypeId, CodeValueGroups.ProfileType).code;
				
				contactService.userProfileNew({
					ContactId: profile.ContactId,
					ProfileTypeId: self.newProfile.profileTypeId,
					PrimaryEmail: profile.PrimaryEmail,
					OrganizationId: newOrganizationId
				}).then(
					function (success) {
						$state.go('Edit' + profileType + 'Profile', { profileId: success.EntityId, contactId: success.EntityIdRedirect });
					})
					.catch(function(error) {
						$rootScope.activateGlobalSpinner = false;
					});
			}
			else {
				goToProfile(profile);
			}
		}

		function goToProfile(profile) {
			$state.go('Edit' + profile.profileType + 'Profile', { contactId: profile.ContactId, profileId: profile.Id });
		}

		function createAction() {
			var criteria = {
				primaryEmail: self.newProfile.primaryEmail
			};
			if (self.organizational) {
				criteria.organizationId = self.newProfile.organizationId;
			}
			//$state.go('Create' + self.newProfile.profileType + 'Profile', criteria);
			contactService.userProfileNew({
				ContactId: 0,
				ProfileTypeId: self.newProfile.profileTypeId,
				PrimaryEmail: self.newProfile.primaryEmail,
				OrganizationId: self.newProfile.organizationId
			}).then(
				function (success) {
					$state.go('UserProfile', { profileId: success.TargetEntityId });
				})
				.catch(function (err) {
					self.submitted = false;
				});
		}

		function continueAction() {
			if (self.newProfile.profiles.length === 0) {
				if (self.submitted === false) {
					self.submitted = true;
					self.createAction();
				}
			}
			else {
				self.Continue = true;
			}
		}
	}
})();