(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionRatesController', CommissionRatesController);

    CommissionRatesController.$inject = ['$state', '$stateParams', 'commissionRateSearchTableParams', 'mixinsFactory', 'NavigationService', 'resolveCommissionRates', 'CodeValueService', 'CommissionApiService'];

    function CommissionRatesController($state, $stateParams, commissionRateSearchTableParams, mixinsFactory, NavigationService, resolveCommissionRates, CodeValueService, CommissionApiService) {

        var self = this;

        NavigationService.setTitle('Commission Rates', 'icon icon-commission');

        angular.extend(self, {
            CommissionUserProfileId: resolveCommissionRates.CommissionUserProfileId,
            CommissionUserProfileFirstName: resolveCommissionRates.CommissionUserProfileFirstName,
            CommissionUserProfileLastName: resolveCommissionRates.CommissionUserProfileLastName,
            CommissionUserProfileStatusName: resolveCommissionRates.CommissionUserProfileStatusName,
            lists: {
                listCommissionRateHeaderStatus: CodeValueService.getCodeValues(CodeValueGroups.CommissionRateHeaderStatus, true),
                listCommissionRole: CodeValueService.getCodeValues(CodeValueGroups.CommissionRole, true),
            },
        });

        var commissionDataParams = oreq.request()
                    .withSelect([
                        'CommissionRateHeaderId',
                        'CommissionRateVersionId',
                        'CommissionRateHeaderStatusId',
                        'CommissionRoleId',
                        'CommissionRateVersionPercentage',

                        'CommissionRateRestrictionsForInternalOrganizations',
                        'CommissionRateRestrictionsForClientOrganizations',
                        'CommissionRateRestrictionsForLineOfBusinesses',
                        'CommissionRateRestrictionsForBranches',

                        'CommissionRateRestrictionsForInternalOrganization',
                        'CommissionRateRestrictionsForClientOrganization',
                        'CommissionRateRestrictionsForLineOfBusiness',
                        'CommissionRateRestrictionsForBranch',
                    ]).url();

        mixinsFactory.createTableSupportMixin(
            angular.extend(
            {
                serviceMethod: CommissionApiService.getCommissionRatesByCommissionUserProfile
            }, commissionRateSearchTableParams), commissionDataParams, $stateParams.commissionUserProfileId).init(self);

        return self;
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.CommissionRatesController = {

        resolveCommissionRates: ['$q', '$stateParams', 'CommissionApiService', function ($q, $stateParams, CommissionApiService) {
            var result = $q.defer();

            var commissionDataParams = oreq.request()
                .withSelect([
                    'CommissionUserProfileId',
                    'CommissionUserProfileFirstName',
                    'CommissionUserProfileLastName',
                    'CommissionUserProfileStatusName',
                ]).url();

            if ($stateParams.commissionUserProfileId > 0) {
                CommissionApiService.getCommissionRateHeadersByCommissionUserProfile($stateParams.commissionUserProfileId, commissionDataParams).then(
                    function (responseSucces) {
                        if (responseSucces.Items !== null && responseSucces.Items.length == 1) {
                            result.resolve(responseSucces.Items[0]);
                        }
                        else {
                            result.reject(responseSucces);
                        }
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            }
            return result.promise;
        }],
    };

})(angular, Phoenix.App);