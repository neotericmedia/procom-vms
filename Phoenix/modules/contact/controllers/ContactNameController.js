(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('ContactNameController', ContactNameController);

    ContactNameController.$inject = ['$state', 'CodeValueService', 'contactService', 'profile'];
    function ContactNameController($state, CodeValueService, contactService, profile) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        // flatten the contact specific config in the state's data block
        angular.extend(self, {
            currentProfile: profile,
            currentContact: profile.Contact,
            titles: CodeValueService.getCodeValues(CodeValueGroups.PersonTitle),
            cultureOptions: CodeValueService.getCodeValues(CodeValueGroups.Culture, true),
            getLoginInfo: getLoginInfo,
            cultureTooltip: 'This selection will set the application language for this user\'s account.' +
            '<br/>' +
            'This user may also modify this setting from the Manage Account page within FlexBackOffice'
        });

        var firstNameOldValue = self.currentContact.FirstName ? self.currentContact.FirstName : '', lastNameOldValue = self.currentContact.LastName ? self.currentContact.LastName : '', personTitleIdOldValue = 0;

        self.titleChanged = function (personTitleId) {
            var preferredPersonTitleId = self.currentContact.PreferredPersonTitleId ? self.currentContact.PreferredPersonTitleId : 0;
            if (preferredPersonTitleId === personTitleIdOldValue) {
                self.currentContact.PreferredPersonTitleId = personTitleId;
            }
            personTitleIdOldValue = personTitleId;
        };

        self.firstNameChanged = function (firstName) {
            firstName = firstName ? firstName.trim() : '';
            var preferredFirstName = self.currentContact.PreferredFirstName ? self.currentContact.PreferredFirstName.trim() : '';

            if (preferredFirstName === firstNameOldValue) {
                self.currentContact.PreferredFirstName = firstName;
            }
            firstNameOldValue = firstName;
        };

        self.lastNameChanged = function (lastName) {
            lastName = lastName ? lastName.trim() : '';
            var preferredLastName = self.currentContact.PreferredLastName ? self.currentContact.PreferredLastName.trim() : '';

            if (preferredLastName === lastNameOldValue) {
                self.currentContact.PreferredLastName = lastName;
            }
            lastNameOldValue = lastName;
        };

        function getLoginInfo() {
            if (self.currentContact.LoginUserId) {
                contactService.getLoginInfo(self.currentContact.LoginUserId).then(
                    function success(response) {
                        response.UserName = response.UserName.replace(/\"/g, "");
                        self.currentContact.LoginName = response.UserName;
                        self.currentContact.LoginPreferredCultureId = response.PreferredCultureId;
                    },
                    function error() {
                        contactService.logError('Cannot get login info.');
                    });
            }
        }
        self.getLoginInfo();
    }
})();