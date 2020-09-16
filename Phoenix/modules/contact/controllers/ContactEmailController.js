(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('ContactEmailController', ContactEmailController);

    ContactEmailController.$inject = ['$state', 'common', 'contactService', 'phoenixauth', 'profile'];
    function ContactEmailController($state, common, contactService, phoenixauth, profile) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            currentProfile: profile,
            currentContact: profile.Contact,
            isAlowedToInvite: false,
            isInvited: false,

            makePrimary: makePrimary,
            invite: invite,
            checkIsAllowedToInvite: checkIsAllowedToInvite,
            invitationTooltip: profile.Contact.InvitationSent != null ? "Last invitation sent on:<br/>" + moment.utc(profile.Contact.InvitationSent).format(ApplicationConstants.formatMomentDateFull) : "No invitation has been sent."
        });

        function makePrimary() {
            contactService.userProfileSetPrimary($state.params.contactId, $state.params.profileId).then(function (result) {
                self.currentProfile.IsPrimary = true;
                contactService.logSuccess('Primary profile updated to the current profile');
            }, function (error) {
                contactService.logError('Error Message: ' + error.Message + '. CommandName: ' + error.CommandName);
            });
        }

        function invite(e) {
            if (contactService.getCurrentEmail() !== self.currentProfile.PrimaryEmail) {
                contactService.logError("You have changed the email. You'll need to submit the form before inviting the user!");
                return;
            }

            contactService.sendInvitation(self.currentProfile.PrimaryEmail, self.currentProfile.Contact.Id, self.currentProfile.Contact.FirstName,
                self.currentProfile.ProfileTypeId, self.currentProfile.Id, self.currentProfile.Contact.CultureId).then(function (data) {
                    contactService.logSuccess("Invitation sent to " + self.currentProfile.PrimaryEmail, true);
                    self.isInvited = true;
                }, function (data) {
                    var message = "";
                    if (data.ValidationMessages && data.ValidationMessages.length > 0) {
                        for (var i = 0; i < data.ValidationMessages.length; i++) {
                            message += data.ValidationMessages[i].Message + ' ';
                        }
                    }
                    else {
                        message = data.Message;
                    }
                    contactService.logError("Failed to invite the user! Reason: " + message);
                });
        }

        function checkIsAllowedToInvite() {

            phoenixauth.getCurrentProfile().then(function (profile) {
                self.isAlowedToInvite = false;
                if (profile) {
                    if (self.currentProfile.IsDraft || self.currentContact.LoginUserId > 0) {
                        self.isAlowedToInvite = false;
                    }
                    else {
                        self.isAlowedToInvite =
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Organizational && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeOrganizational)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Internal && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeInternal)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianInc && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerSubVendor && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker)) ||
                            (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileInviteTypeWorker));
                    }
                }
            });
        }
        checkIsAllowedToInvite();
    }
})();