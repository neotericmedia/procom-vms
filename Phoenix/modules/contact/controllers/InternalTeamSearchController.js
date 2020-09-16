(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('InternalTeamSearchController', InternalTeamSearchController);

    /** @ngInject */
    InternalTeamSearchController.$inject = ['$state', 'CodeValueService', 'contactService', 'contactsTableParams', 'mixinsFactory'];
    function InternalTeamSearchController($state, CodeValueService, contactService, contactsTableParams, mixinsFactory) {

        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            allowCreate: contactService.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.ContactInternalTeamCreate)
        });

        contactService.setTitle(self.title.main, self.title.icon);

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: contactService.getAllInternalTeams
        }, contactsTableParams)).init(self);

        return self;
    }
})();
