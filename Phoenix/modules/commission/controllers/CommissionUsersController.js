(function (angular) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionUsersController', CommissionUsersController);

    CommissionUsersController.$inject = ['$state', 'commissionUserSearchTableParams', 'mixinsFactory', 'NavigationService', 'CommissionApiService'];

    function CommissionUsersController($state, commissionUserSearchTableParams, mixinsFactory, NavigationService, CommissionApiService) {

        var self = this;

        NavigationService.setTitle('Commission Search', ['icon icon-commission']);

        mixinsFactory.createTableSupportMixin(angular.extend({ serviceMethod: CommissionApiService.getCommissionUserProfileListWithRatesOnly }, commissionUserSearchTableParams), oreq.request()
            .withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName', 'CommissionUserProfileStatusName', 'CommissionRateHeadersCountOfActive']).url()).init(self);

        return self;
    }

})(angular);