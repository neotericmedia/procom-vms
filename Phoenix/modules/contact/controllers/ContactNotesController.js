(function () {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactNotesController', ContactNotesController);

    // this is the overall "top parent" controller in the top-level state/route
    ContactNotesController.$inject = ['$rootScope', '$state', 'CodeValueService', 'contactService', 'profile'];
    function ContactNotesController($rootScope, $state, CodeValueService, contactService, profile) {

        var self = this;
        
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            currentContact: profile.Contact,
            currentProfile: profile,
            cultureId: ApplicationConstants.Culture.Default,
            contactId: $state.params.contactId
        });

        self.init = function (edit) {
            self.edit = edit;
            self.edit.isNotProfilePage = true;
        };

        self.getNotesCount = function (notes) {
            self.edit.UpdateNoteCounts(notes);
        };
    }
})();