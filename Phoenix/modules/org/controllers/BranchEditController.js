(function (angular, app) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('BranchEditController', BranchEditController);

    BranchEditController.$inject = ['$state', 'common', 'phoenixapi', 'NavigationService', 'BranchApiService', 'branch', 'userProfileInternalList', 'phxLocalizationService', 'ProfileApiService'];

    function BranchEditController($state, common, phoenixapi, NavigationService, BranchApiService, branch, userProfileInternalList, phxLocalizationService, ProfileApiService) {

        var self = this;

        self.branch = branch;
        self.userProfileInternalList = userProfileInternalList;
        removeInactiveUserProfiles();
        self.isEditMode = branch.Id === 0;


        if (self.branch.Name) {
            NavigationService.setTitle('branch-viewedit', [self.branch.Name]);
        } else {
            NavigationService.setTitle('branch-viewedit', [phxLocalizationService.translate('common.generic.new')]);
        }


        BranchApiService.canCreate.then(
            function (canCreate) {
                self.canCreate = canCreate;
            }
        );

        self.fieldViewEditModeInit = function () {

            var viewEditModeConfig = {
                watchChangeEvent: '[vm.isEditMode]',
                funcToCheckViewStatus: function (modelPrefix, fieldName) {

                    if (self.isEditMode) {
                        return ApplicationConstants.viewStatuses.edit;
                    }
                    else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                },
                funcToPassMessages: function (message) {
                    contactService.logWarning(message);
                }
            };
            self.ptFieldViewStatus = viewEditModeConfig;
        };

        self.fieldViewEditModeInit();

        self.saveBranch = function () {
            self.ValidationMessages = [];
            //self.branch.WorkflowPendingTaskId = -1;
            return BranchApiService.branchSave(self.branch)
                .then(
                    function (responseSuccess) {
                        self.isEditMode = false;
                        // We refresh the server-side cache on BranchSave. Refresh the client-side cache then.
                        common.RefreshCodeValues()
                            .then(function () {
                                //if (!self.branch.Id) { // always update to get new LastModifiedDatetime
                                self.reload(+responseSuccess.EntityId);
                                //}
                            });
                    },
                    function (responseError) {
                        onErrorResponse(responseError, 'Branch is not valid.');
                    }
                );
        };

        function onErrorResponse(responseError, message) {
            if (message && message.length > 0) {
                common.logError(message);
            }
            self.ValidationMessages = common.responseErrorMessages(responseError);
        }

        self.discardChanges = function () {
            // Bug 36445:bug (HIGH) When first creating Branch and then discarding upon edit, it should not take you back to search page list
            // Bug 38805:Bug(Low) - Phoenix - Organization -Branches - When Discarding the Branch not navigating to Search Page
            self.isEditMode = false;
            if (self.branch.Id) {
                self.reload(self.branch.Id);
            }
            else {
                $state.go('ngtwo.m', { p: 'organization/branch' });
            }
        };

        self.reload = function (branchId) {
            $state.go($state.current.name, { branchId: branchId }, { reload: true });
        };

        function removeInactiveUserProfiles() {
            if (self.userProfileInternalList && self.userProfileInternalList.length > 0) {
                var branchManagerUserProfileIds = [];
                self.branch.BranchManagers.map(function (manager) { branchManagerUserProfileIds.push(manager.UserProfileInternalId) });
                ProfileApiService.removeInactiveProfile(self.userProfileInternalList, branchManagerUserProfileIds);
            }
        }

        self.addBranchManager = function () {
            if (!self.branch.BranchManagers) {
                self.branch.BranchManagers = [];
            }
            self.branch.BranchManagers.push({});
        };

        self.removeBranchManager = function (branchManager) {
            _.pull(self.branch.BranchManagers, branchManager);
        };

        self.clearBranchManager = function (branchManager) {
            delete branchManager.UserProfileInternalId;
        };

        self.canAddManager = function () {
            return self.branch && (
                !self.branch.BranchManagers ||
                _.every(self.branch.BranchManagers, function (i) { return !!i.UserProfileInternalId; })
            );
        };

        self.canSave = function () {
            return self.branch.Code && self.myForm.Code.$valid &&
                self.branch.Name &&
                _.every(self.branch.BranchManagers, function (i) { return i.UserProfileInternalId; });
        };

        self.edit = function () {
            self.isEditMode = true;
        };

        self.checkCodeUniqueness = function (el) {
            if (self.lastCode != self.branch.Code) {
                self.lastCode = self.branch.Code;
                BranchApiService.isCodeUnique(self.branch.Code)
                    .then(
                        function (responseSuccess) {
                            if (responseSuccess === true || responseSuccess === "true") {
                                el.$setValidity('codeIsNotUnique', true);
                            }
                            else {
                                el.$setValidity('codeIsNotUnique', false);
                            }
                        },
                        function (responseError) {
                            el.$setValidity('codeIsNotUnique', false);
                        }
                    );
            }
        };

    }

    if (!app.resolve) app.resolve = {
    };

    app.resolve.BranchEditController = {

        branch: ['$q', '$stateParams', 'BranchApiService', function ($q, $stateParams, BranchApiService) {
            var result = $q.defer();

            var id = +$stateParams.branchId;
            if (id !== 0) {

                BranchApiService.getBranchById(id).then(
                    function (responseSuccess) {
                        var branch = responseSuccess;
                        branch.WorkflowPendingTaskId = -1;//SergeyM: Not ok - tmp untill Branch move uder workflow
                        result.resolve(branch);
                    },
                    function (responseError) {
                        result.reject(responseError);
                    }
                );
            }
            else {
                var branch = {
                    WorkflowPendingTaskId: -1,
                    Id: 0,
                    BranchManagers: [],
                };
                result.resolve(branch);
            }

            return result.promise;
        }],

        // Load Internal Profiles
        userProfileInternalList: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();

            var filter = oreq.filter('ProfileStatusId')
                .eq(ApplicationConstants.ProfileStatus.Active)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingChange)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.InActive)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingInactive)
                .or().filter('ProfileStatusId').eq(ApplicationConstants.ProfileStatus.PendingActive);
            var oDataParams = oreq.request()
                .withExpand(['Contact'])
                .withSelect(['Id', 'ProfileStatusId', 'Contact/FullName'])
                .withFilter(filter)
                .url();
            AssignmentApiService.getListUserProfileInternal(oDataParams).then(
                function (responseSuccess) {
                    result.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    result.reject(responseError);
                });

            return result.promise;
        }],

    };

})(angular, Phoenix.App);