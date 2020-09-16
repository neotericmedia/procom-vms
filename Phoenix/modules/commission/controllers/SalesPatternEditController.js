(function (angular, app) {
    'use strict';

    angular.module('phoenix.commission.controllers').controller('SalesPatternEditController', SalesPatternEditController);

    /** @ngInject */
    SalesPatternEditController.$inject = ['$state', 'CodeValueService', 'common', 'dialogs', 'CommissionApiService', 'NavigationService', 'commissionRateHeaderUsers', 'salesPattern', 'ProfileApiService'];

    function SalesPatternEditController($state, CodeValueService, common, dialogs, CommissionApiService, NavigationService, commissionRateHeaderUsers, salesPattern, ProfileApiService) {

        NavigationService.setTitle('commission-patterns-viewedit');

        var self = this;

        angular.extend(self, {
            //properties
            validationMessages: [],
            salesPattern: salesPattern ? salesPattern : {},
            JobOwner: {},
            commissionOwnersNoSupport: _.chain(commissionRateHeaderUsers).filter(function (user) {
                return user.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport;
            }).uniqBy('CommissionUserProfileId').value(),
            commissionOwnersWithSupport: _.chain(commissionRateHeaderUsers).filter(function (user) {
                return user.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport;
            }).uniqBy('CommissionUserProfileId').value(),
            commissionSupporters: _.chain(commissionRateHeaderUsers).filter(function (user) {
                return user.CommissionRoleId == ApplicationConstants.CommissionRole.SupportingJobOwner;
            }).uniqBy('CommissionUserProfileId').value(),
            commissionStatuses: CodeValueService.getCodeValues(CodeValueGroups.CommissionRateHeaderStatus, true),

            //methods
            addSupporter: addSupporter,
            removeSupporter: removeSupporter,
            radioChanged: radioChanged,
            discard: discard,
            cancel: cancel,
            save: save,
            init: init
        });

        function init() {

            var commissionSalesPatternsSupporterIds = [];
            if (self.salesPattern.CommissionSalesPatternSupporters && self.salesPattern.CommissionSalesPatternSupporters.length > 0) {

                _.map(self.salesPattern.CommissionSalesPatternSupporters, function(commissionSalesPatternSupporter) {
                    commissionSalesPatternsSupporterIds.push(commissionSalesPatternSupporter.UserProfileId);
                    });
                
                var ownerIdx = _.findIndex(self.salesPattern.CommissionSalesPatternSupporters, function (obj) { return obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport || obj.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport; });

                if (ownerIdx > -1) {
                    self.JobOwner = angular.copy(self.salesPattern.CommissionSalesPatternSupporters[ownerIdx]);
                    self.salesPattern.SalesPatternWithSupport = self.JobOwner.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport ? false : true;
                    self.salesPattern.CommissionSalesPatternSupporters.splice(ownerIdx, 1);

                }
            }

            ProfileApiService.removeInactiveProfileWithConfig({ profileStatusId: 'CommissionUserProfileStatusId', id: 'CommissionUserProfileId' }, self.commissionOwnersWithSupport, commissionSalesPatternsSupporterIds);
            ProfileApiService.removeInactiveProfileWithConfig({ profileStatusId: 'CommissionUserProfileStatusId', id: 'CommissionUserProfileId' }, self.commissionOwnersNoSupport, commissionSalesPatternsSupporterIds);
            ProfileApiService.removeInactiveProfileWithConfig({ profileStatusId: 'CommissionUserProfileStatusId', id: 'CommissionUserProfileId' }, self.commissionSupporters, commissionSalesPatternsSupporterIds);

            
            if (self.salesPattern.SalesPatternWithSupport) {
                self.commissionOwners = angular.copy(self.commissionOwnersWithSupport);
            } else {
                self.commissionOwners = angular.copy(self.commissionOwnersNoSupport);
            }
        }

        self.init();

        function removeSupporter(index) {
            self.salesPattern.CommissionSalesPatternSupporters.splice(index, 1);
        }

        function addSupporter() {
            self.salesPattern.CommissionSalesPatternSupporters.push(
                {
                    Id: 0,
                    SalesPatternOwnerId: 0,
                    UserProfileId: null,
                    CommissionRoleId: ApplicationConstants.CommissionRole.SupportingJobOwner
                }
            );
        }

        function radioChanged() {

            if (self.salesPattern.SalesPatternWithSupport === true) {
                if (self.JobOwner.UserProfileId && self.commissionOwnersWithSupport && !_.some(self.commissionOwnersWithSupport, function (obj) { return obj.Id == self.JobOwner.UserProfileId; })) {
                    self.JobOwner.UserProfileId = undefined;
                }
                self.commissionOwners = angular.copy(self.commissionOwnersWithSupport);
            } else if (self.salesPattern.SalesPatternWithSupport === false) {
                if (self.JobOwner.UserProfileId && self.commissionOwnersWithSupport && !_.some(self.commissionOwnersNoSupport, function (obj) { return obj.Id == self.JobOwner.UserProfileId; })) {
                    self.JobOwner.UserProfileId = undefined;
                }
                self.commissionOwners = angular.copy(self.commissionOwnersNoSupport);
            }

            var supporters = self.salesPattern.CommissionSalesPatternSupporters;

            if (supporters.length === 0) {
                self.salesPattern.CommissionSalesPatternSupporters.push(
                    {
                        Id: 0,
                        SalesPatternOwnerId: 0,
                        UserProfileId: null,
                        CommissionRoleId: ApplicationConstants.CommissionRole.SupportingJobOwner
                    });

            }
        }

        function save(salesPattern) {

            var isValid = validateSupporters(salesPattern);

            if (!isValid) {
                dialogs.notify('Errors on saving sales pattern', 'Supporters cannot be same', { keyboard: false, backdrop: 'static', windowClass: 'sales-pattern-dlg-errors' }).result.then(function () { });
            }
            else {

                var jobOwner = angular.extend(self.JobOwner, { CommissionRoleId: salesPattern.SalesPatternWithSupport ? ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport : ApplicationConstants.CommissionRole.JobOwnerRoleNoSupport });

                var saveCommand = {
                    LastModifiedDatetime: salesPattern.LastModifiedDatetime,
                    SalesPatternId: salesPattern.Id,
                    SalesPatternWithSupport: salesPattern.SalesPatternWithSupport,
                    Description: salesPattern.Description,
                    SalesPatternSupporters: salesPattern.SalesPatternWithSupport ? _.concat(salesPattern.CommissionSalesPatternSupporters, jobOwner) : [jobOwner]
                };

                CommissionApiService.commissionSaveSalesPattern(saveCommand).then(
                    function (success) {
                        //$state.transitionTo("commission.salespatternedit", { salesPatternId: success.EntityId});//, { location: true, inherit: true, relative: $state.current, notify: false });
                        $state.go('ngtwo.m', { p: 'commission/salespatterns' });
                        common.logSuccess("Sales Pattern has been saved successfully");
                    },
                    function (error) {
                        onResponseError(error);
                    });
            }
        }

        function discard(salesPattern) {

            dialogs.confirm('Cancel & Discard Sales Pattern', 'Are you sure you want to cancel and discard this Sales Pattern?').result.then(
                function (btn) {

                    var salesPatternId = salesPattern.Id;

                    if (salesPatternId > 0) {

                        CommissionApiService.commissionDiscardSalesPattern({ LastModifiedDatetime: salesPattern.LastModifiedDatetime, SalesPatternId: salesPatternId }).then(
                            function (success) {
                                $state.go('ngtwo.m', { p: 'commission/salespatterns' });
                            },
                            function (error) {
                                onResponseError(error);
                            });
                    }
                    else {
                        $state.go('ngtwo.m', { p: 'commission/salespatterns' });
                    }



                }, function (btn) { });
        }

        function cancel() {
            console.log('cancel');
            dialogs.confirm('Cancel Sales Pattern', 'Are you sure you want to cancel this Sales Pattern?').result.then(
                function (btn) {

                    $state.go('ngtwo.m', { p: 'commission/salespatterns' });

                }, function (btn) { });
        }

        function onResponseError(responseError) {
            self.validationMessages = common.responseErrorMessages(responseError);
        }

        function validateSupporters(salesPattern) {

            var actualSupporters = _.chain(salesPattern.CommissionSalesPatternSupporters).uniqBy('UserProfileId').value();

            if (actualSupporters && actualSupporters.length === salesPattern.CommissionSalesPatternSupporters.length)
                return true;
            else
                return false;
        }

        return self;
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.SalesPatternEditController = {

        salesPattern: ['$q', '$stateParams', 'CommissionApiService', function ($q, $stateParams, CommissionApiService) {

            var result = $q.defer();
            var salesPatternDataParams = oreq.request()
                .withExpand(['CommissionSalesPatternSupporters'])
                .withSelect([
                    'Id',
                    'SalesPatternStatusId',
                    'Description',
                    'LastModifiedDatetime',
                    'CommissionSalesPatternSupporters/Id',
                    'CommissionSalesPatternSupporters/UserProfileId',
                    'CommissionSalesPatternSupporters/CommissionRoleId',
                ]).url();

            var salesPatternId = parseInt($stateParams.salesPatternId, 10);

            if (salesPatternId > 0) {
                CommissionApiService.getSalesPattern(salesPatternId, salesPatternDataParams).then(
                    function (success) {
                        //success.SalesPatternWithSupport = success.CommissionRoleId == ApplicationConstants.CommissionRole.JobOwnerRoleWithSupport;
                        result.resolve(success);
                    },
                    function (error) {
                        result.reject(error);
                    }
                );
            }
            else {
                var newSalesPattern = {
                    Id: 0,
                    SalesPatternWithSupport: false,
                    SalesPatternStatusId: ApplicationConstants.CommissionRateHeaderStatus.New,
                    Description: '',
                    CommissionSalesPatternSupporters: []
                };
                result.resolve(newSalesPattern);
            }

            return result.promise;
        }],
        commissionRateHeaderUsers: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {

            var result = $q.defer();
            var commissionPatternDataParams = oreq.request().withSelect(['CommissionUserProfileId', 'CommissionUserProfileStatusId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName', 'CommissionRoleId']).url();

            CommissionApiService.getCommissionRateHeaderUsers(commissionPatternDataParams).then(
                function (success) {
                    angular.forEach(success.Items, function (item) {
                        item.Name = item.CommissionUserProfileFirstName + ' ' + item.CommissionUserProfileLastName;
                    });
                    result.resolve(success.Items);
                },
                function (error) {
                    result.reject(error);
                }
            );

            return result.promise;
        }]
    };

})(angular, Phoenix.App);