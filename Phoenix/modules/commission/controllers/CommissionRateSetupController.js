(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('CommissionRateSetupController', CommissionRateSetupController);

    CommissionRateSetupController.$inject = ['$state', 'NavigationService', 'resolvetInternalUserProfileList', 'resolvetCommissionTemplateList', 'resolveCodeValueLists', 'ProfileApiService', 'CommissionApiService', 'CodeValueService', 'commissionMessages'];

    function CommissionRateSetupController($state, NavigationService, resolvetInternalUserProfileList, resolvetCommissionTemplateList, resolveCodeValueLists, ProfileApiService, CommissionApiService, CodeValueService, commissionMessages) {

        var self = this;

        NavigationService.setTitle('commission-rate-new-wizard');

        resolvetInternalUserProfileList.forEach(function (item) {
            item.CommissionUserProfileName = item.CommissionUserProfileFirstName + ' ' + item.CommissionUserProfileLastName;
        });

        angular.extend(self, {
            CommissionUserProfileId: $state.params.commissionUserProfileId > 0 ? $state.params.commissionUserProfileId : null,
            CommissionUserProfileFirstName: '',
            CommissionUserProfileLastName: '',

            listInternalUserProfiles: resolvetInternalUserProfileList,
            listCommissionTemplates: resolvetCommissionTemplateList,

            lists: resolveCodeValueLists,

            commissionRoleId: undefined,
            commissionRateTypeId: resolveCodeValueLists.listCommissionRateType.length > 0 ? resolveCodeValueLists.listCommissionRateType[0].id : undefined,
            commissionTemplateId: undefined,

            msgDuplicateFound: commissionMessages.existingFound,
            msgDuplicateNotFound: commissionMessages.existingNotFound,

            onChangeCommissionRoleId: function () {
                resetCommissionTemplate()
                checkDuplicateCommissionRates();
            },
            onChangeCommissionUserProfileId: function () {
                checkDuplicateCommissionRates();
            },
            onChangeCommissionRateTypeId: function () {
                resetCommissionTemplate();
            },

            openCommissionRate: function (rate) {
                $state.go('commission.rate.details', {
                    commissionRateHeaderId: rate.CommissionRateHeaderId,
                    commissionRateVersionId: rate.CommissionRateVersionId
                });
            },

            onClickContinue: function () {
                if (self.duplicateCommissionRates && self.duplicateCommissionRates.length) {
                    self.continueClicked = true;
                } else {
                    self.onClickCreateNew();
                }
            },

            onClickCreateNew: function () {
                $state.go('commission.ratecreate.details', {
                    commissionUserProfileId: this.CommissionUserProfileId,
                    commissionRoleId: this.commissionRoleId,
                    commissionRateTypeId: this.commissionRateTypeId,
                    commissionTemplateId: this.commissionTemplateId !== undefined ? this.commissionTemplateId : 0
                });
            }
        });

        function resetCommissionTemplate() {
            self.commissionTemplateId = undefined;
        }

        function checkDuplicateCommissionRates() {
            self.continueClicked = false;
            self.duplicateCommissionRates = [];
            if (self.formCommissionRateAdd.$valid) {
                self.checkingDuplicateCommissionRates = true;
                CommissionApiService.getCommissionRateHeadersByCommissionUserProfile(self.CommissionUserProfileId).then(function (data) {
                    var commissionRates = data && data.Items && data.Items.length ? data.Items[0].CommissionRates : [];
                    self.duplicateCommissionRates = _.filter(commissionRates, function (rate) {
                        var codeStatus = CodeValueService.getCodeValue(rate.CommissionRateHeaderStatusId, CodeValueGroups.CommissionRateHeaderStatus);
                        rate.CommissionRateHeaderStatus = codeStatus ? codeStatus.text : rate.CommissionRateHeaderStatusId;
                        return rate.CommissionRoleId === self.commissionRoleId;
                    });
                    if (self.duplicateCommissionRates && self.duplicateCommissionRates.length) {
                        self.continueClicked = true;    // auto click continue
                    }
                }).finally(function () {
                    self.checkingDuplicateCommissionRates = false;
                });
            }
        }

        if (self.CommissionUserProfileId > 0) {
            var commissionUserProfile = _.find(self.listInternalUserProfiles, function (item) {
                return item.CommissionUserProfileId == self.CommissionUserProfileId;
            });
            self.CommissionUserProfileFirstName = commissionUserProfile.CommissionUserProfileFirstName;
            self.CommissionUserProfileLastName = commissionUserProfile.CommissionUserProfileLastName;
            self.CommissionUserProfileStatusName = commissionUserProfile.CommissionUserProfileStatusName;
        }

        ProfileApiService.removeInactiveProfileWithConfig({
            profileStatusId: 'CommissionUserProfileStatusId',
            id: 'CommissionUserProfileId'
        }, self.listInternalUserProfiles, self.CommissionUserProfileId);

        return self;
    }

    if (!app.resolve) app.resolve = {};
    app.resolve.CommissionRateSetupController = {

        resolvetInternalUserProfileList: ['$q', '$stateParams', 'CommissionApiService', function ($q, $stateParams, CommissionApiService) {
            var result = $q.defer();

            var commissionDataParams = $stateParams.commissionUserProfileId > 0 ?
                oreq.request()
                .withSelect([
                    'CommissionUserProfileId',
                    'CommissionUserProfileFirstName',
                    'CommissionUserProfileLastName',
                    'CommissionUserProfileStatusName'
                ])
                //  https://msdn.microsoft.com/en-us/library/hh169248(v=nav.90).aspx
                .withFilter(oreq.filter("CommissionUserProfileId").eq($stateParams.commissionUserProfileId))
                .url() :
                oreq.request()
                .withSelect([
                    'CommissionUserProfileId',
                    'CommissionUserProfileFirstName',
                    'CommissionUserProfileLastName',
                    'CommissionUserProfileStatusId',
                    'CommissionUserProfileStatusName'
                ])
                .url();

            CommissionApiService.getInternalUserProfileList(commissionDataParams).then(
                function (responseSucces) {
                    result.resolve(responseSucces.Items);
                },
                function (responseError) {
                    result.reject(responseError);
                }
            );
            return result.promise;
        }],

        resolvetCommissionTemplateList: ['$q', 'TemplateApiService', function ($q, TemplateApiService) {
            var result = $q.defer();
            TemplateApiService.getTemplatesByEntityTypeId(ApplicationConstants.EntityType.CommissionRateHeader).then(
                function (responseSucces) {
                    result.resolve(responseSucces.Items);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],

        resolveCodeValueLists: ['$q', 'CodeValueService', function ($q, CodeValueService) {
            var result = $q.defer();
            var lists = {};

            lists.listCommissionRole = CodeValueService.getCodeValues(CodeValueGroups.CommissionRole, true);
            lists.listCommissionRateType = CodeValueService.getCodeValues(CodeValueGroups.CommissionRateType, true);

            result.resolve(lists);
            return result.promise;
        }],
    };

})(angular, Phoenix.App);