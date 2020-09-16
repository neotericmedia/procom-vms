(function () {
    'use strict';

    angular.module('phoenix.contact.controllers')
        .controller('ProfileDeclinedSearchController', ProfileDeclinedSearchController);

    /** @ngInject */
    ProfileDeclinedSearchController.$inject = ['$state', 'CodeValueService', 'contactService', 'contactsTableParams', 'mixinsFactory'];
    function ProfileDeclinedSearchController($state, CodeValueService, contactService, contactsTableParams, mixinsFactory) {
        var self = this;

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }

        angular.extend(self, {
            draftStatusList: [{ id: true, text: 'Draft' }, { id: false, text: 'Active' }],
            profileTypes: CodeValueService.getCodeValues(CodeValueGroups.ProfileType),
        });

        contactService.setTitle(self.title.main, self.title.icon);

        self.successfulRetrieval = function (items) {
            angular.forEach(items, function (item) {
                item.UserProfileType = CodeValueService.getCodeValue(item.UserProfileTypeId, CodeValueGroups.ProfileType).code;
            });
        };

        mixinsFactory.createTableSupportMixin(angular.extend({
            serviceMethod: contactService.getDeclinedProfiles
        }, contactsTableParams)).init(self);

        return self;
    }
})();
