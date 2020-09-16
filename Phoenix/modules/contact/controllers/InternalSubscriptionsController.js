(function (angular) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('InternalSubscriptionsController', InternalSubscriptionsController);

    InternalSubscriptionsController.$inject = ['$state', 'common', 'CodeValueService', 'AccessSubscriptionApiService'];

    function InternalSubscriptionsController($state, common, CodeValueService, AccessSubscriptionApiService) {

        var self = this;

        var state = {
            search: {
                predicateObject: {
                    UserProfileIdSubscriber: [$state.params.profileId],
                },
            },
        };

        self.loadSubscriptionsPromise = AccessSubscriptionApiService.getAllOriginalAccessSubscriptions(state)
        .then(
            function (responseSuccess) {
                self.subscriptions = responseSuccess.Items;
            },
            function (responseError) {
                common.responseErrorMessages(responseError);
            }
        );

        self.lists = {
            types: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionType, true),
            statuses: CodeValueService.getCodeValues(CodeValueGroups.AccessSubscriptionStatus, true),
        };
    }

})(angular);