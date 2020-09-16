(function (angular, app) {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('InternalTeamEditController', InternalTeamEditController);
    /** @ngInject */
    InternalTeamEditController.$inject = ['$state', 'CodeValueService', 'WorkflowApiService', 'commonDataService', 'contactService', 'dialogs', 'NavigationService', 'clientOrganizations', 'internalTeam', 'internalUsers', 'internalOrganizations'];

    function InternalTeamEditController($state, CodeValueService, WorkflowApiService, commonDataService, contactService, dialogs, NavigationService, clientOrganizations, internalTeam, internalUsers, internalOrganizations) {

        

        var self = this;

        angular.extend(self, {
            //properties
            ValidationMessages: [],
            internalTeam: internalTeam,
            internalUsers: internalUsers,
            branches: CodeValueService.getCodeValues(CodeValueGroups.InternalOrganizationDefinition1, true),
            lineOfBusinesses: CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness, true),
            internalTeamRestrictionTypes: CodeValueService.getCodeValues(CodeValueGroups.InternalTeamRestrictionType, true),
            clientOrganizations: clientOrganizations,
            internalOrganizations: internalOrganizations,
            internalTeamRestrictionsGroups: [],
            allowCreate: contactService.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.ContactInternalTeamCreate),
            isSubmitted: false,
            //methods
            discard: discard,
            create: create,
            submit: submit,
            init: init,
            correct: correct,
            cancel: cancel,
            addMember: addMember,
            removeMember: removeMember,
            addRestriction: addRestriction,
            fieldViewEditModeInit: fieldViewEditModeInit,
            internalTeamRestrictionsGrouped: internalTeamRestrictionsGrouped,
            filterGroupByInternalTeamRestrictionTypeId: filterGroupByInternalTeamRestrictionTypeId
        });

        function init() {

            self.internalTeamId = parseInt($state.params.internalTeamId, 10);

            if (self.internalTeamId > 0) {
                internalTeam.InternalTeamMembers.unshift({ InternalTeamMemberUserProfileId: internalTeam.JobOwnerUserProfileId });
                WorkflowApiService.getWorkflowAvailableActions(self.internalTeam, self.internalTeam, ApplicationConstants.EntityType.InternalTeam);
                angular.forEach(self.internalTeam.InternalTeamRestrictions, function (teamRes) {
                    teamRes.CommissionRateRestrictionTypeId = teamRes.InternalTeamRestrictionTypeId;
                });

                NavigationService.setTitle('edit-team');
                self.isEditMode = false;
                
                self.fieldViewEditModeInit();
            }
            else {
                self.isEditMode = true;
                NavigationService.setTitle('new-team');
            }
        }

        self.init();

        function create(internalTeam) {
            self.copyInternalTeam = angular.copy(internalTeam);
            self.copyInternalTeam.JobOwnerUserProfileId = self.copyInternalTeam.InternalTeamMembers[0].InternalTeamMemberUserProfileId;
            self.copyInternalTeam.InternalTeamMembers.splice(0, 1);
            self.copyInternalTeam.WorkflowPendingTaskId = -1;
            self.isSubmitted = true;
            contactService.internalTeamNew(self.copyInternalTeam).then(
               function (success) {
                   onWorkflowEventSuccess(success.EntityId, 'ContactEdit.InternalTeamEdit', "Internal Team created successfully.");
               }, function (e) {
                   onResponseError(e, "Error while creating Internal Team.");
               });
        }

        function submit(internalTeam) {
            self.copyInternalTeam = angular.copy(internalTeam);
            self.copyInternalTeam.JobOwnerUserProfileId = self.copyInternalTeam.InternalTeamMembers[0].InternalTeamMemberUserProfileId;
            self.copyInternalTeam.InternalTeamMembers.splice(0, 1);
            self.isSubmitted = true;
            contactService.internalTeamCorrect(self.copyInternalTeam).then(
                  function (success) {
                      onWorkflowEventSuccess(success.EntityId, 'ContactEdit.InternalTeamEdit', "Internal Team updated successfully.");
                  }, function (e) {
                      onResponseError(e, "Error while updating Internal Team.");
                  });
        }

        function discard(internalTeam) {

            dialogs.confirm('Discard Internal Team', 'Are you sure you want to discard this Internal Team?').result.then(
                function (btn) {

                    $state.go('ngtwo.m', {p: "contact/internalteam-search"});

                }, function (btn) { });
        }

        function onResponseError(responseError, errorMessage) {
            if (errorMessage && errorMessage.length > 0) {
                contactService.logError(errorMessage);
            }
            self.ValidationMessages = contactService.responseErrorMessages(responseError);
            self.isSubmitted = false;
        }

        function onWorkflowEventSuccess(internalTeamId, stateNameGo, message) {
            self.ValidationMessages = [];
            self.isSubmitted = false;
            if (message && message.length > 0) {
                contactService.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, $state.current.name, ApplicationConstants.EntityType.InternalTeam, ApplicationConstants.EntityType.InternalTeam, internalTeamId, { internalTeamId: internalTeamId });
        }

        function removeMember(index) {
            self.internalTeam.InternalTeamMembers.splice(index, 1);
        }

        function addMember() {
            self.internalTeam.InternalTeamMembers.push(
                {
                    Id: 0,
                    InternalTeamMemberUserProfileId: null,
                }
            );
        }

        function addRestriction(type) {

            var internalTeamRestrictionDialogConfig = { title: "Add/Edit Restriction", commissionRateRestrictions: self.internalTeam.InternalTeamRestrictions, commissionRateRestrictionTypeId: type, viewType: 'Checkbox' };

            switch (type) {
                case ApplicationConstants.InternalTeamRestrictionType.InternalOrganization:
                    internalTeamRestrictionDialogConfig.list = self.internalOrganizations;
                    internalTeamRestrictionDialogConfig.viewType = 'DropDown';
                    break;
                case ApplicationConstants.InternalTeamRestrictionType.ClientOrganization:
                    internalTeamRestrictionDialogConfig.list = self.clientOrganizations;
                    internalTeamRestrictionDialogConfig.viewType = 'DropDown';
                    break;
                case ApplicationConstants.InternalTeamRestrictionType.LineOfBusiness:
                    internalTeamRestrictionDialogConfig.list = self.lineOfBusinesses;
                    break;
                case ApplicationConstants.InternalTeamRestrictionType.InternalOrganizationDefinition1:
                    internalTeamRestrictionDialogConfig.list = self.branches;
                    break;
            }

            dialogs.create('/Phoenix/modules/commission/views/CommissionRateAddRestrictionDialog.html', 'CommissionRateAddRestrictionDialogController', internalTeamRestrictionDialogConfig, { keyboard: false, backdrop: 'static', windowClass: 'restrictionTypeWindow' }).result.then(
                function (result) {
                    if (result.action == 'create') {
                        angular.forEach(result.commissionRateRestrictions, function (teamRes) {
                            teamRes.InternalTeamRestrictionTypeId = teamRes.CommissionRateRestrictionTypeId;
                        });
                        self.internalTeam.InternalTeamRestrictions = angular.copy(result.commissionRateRestrictions);
                    }
                }, function () { });
        }

        function internalTeamRestrictionsGrouped() {
            self.internalTeamRestrictionsGroups = [];
            return self.internalTeam.InternalTeamRestrictions;
        }

        function filterGroupByInternalTeamRestrictionTypeId(restriction) {
            var isNew = self.internalTeamRestrictionsGroups.indexOf(restriction.InternalTeamRestrictionTypeId) == -1;
            if (isNew) {
                self.internalTeamRestrictionsGroups.push(restriction.InternalTeamRestrictionTypeId);
            }
            return isNew;
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {
                watchChangeEvent: '[edit.isEditMode]',
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
        }

        function correct() {
            self.copyInternalTeam = angular.copy(self.internalTeam);
            self.isEditMode = !self.isEditMode;
        }

        function cancel() {
            self.isEditMode = !self.isEditMode;
            self.internalTeam = angular.copy(self.copyInternalTeam);
        }
    }

    if (!app.resolve) app.resolve = {};

    app.resolve.InternalTeamEditController = {

        internalTeam: ['$q', '$stateParams', 'contactService', function ($q, $stateParams, contactService) {

            var result = $q.defer();

            var internalTeamId = parseInt($stateParams.internalTeamId, 10);

            if (internalTeamId > 0) {
                contactService.getInternalTeam(internalTeamId).then(
                    function (success) {
                        result.resolve(success);
                    },
                    function (error) {
                        result.reject(error);
                    }
                );
            }
            else {
                var newInternalTeam = {
                    WorkflowPendingTaskId: -1,
                    InternalTeamId: 0,
                    TeamName: null,
                    Description: null,
                    JobOwnerUserProfileId: null,
                    InternalTeamStatusId: ApplicationConstants.InternalTeamStatus.New,
                    InternalTeamMembers: [{ Id: 0, InternalTeamMemberUserProfileId: null }, { Id: 0, InternalTeamMemberUserProfileId: null }],
                    InternalTeamRestrictions: []
                };
                result.resolve(newInternalTeam);
            }

            return result.promise;
        }],
        internalUsers: ['$q', 'AssignmentApiService', function ($q, AssignmentApiService) {
            var result = $q.defer();
            var filter = oreq.filter('Contact/UserStatusId').eq("'1'")
                .or().filter('Contact/UserStatusId').eq("'7'");
            var internalDataParams = oreq.request()
                .withExpand(['Contact'])
                .withSelect(['Id',
                    'Contact/FullName'
                ]).withFilter(filter).url();
            AssignmentApiService.getListUserProfileInternal(internalDataParams).then(
                function (response) {
                    result.resolve(response.Items);
                }, function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        internalOrganizations: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
            var result = $q.defer();
            CommissionApiService.getListOrganizationInternal().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
        clientOrganizations: ['$q', 'CommissionApiService', function ($q, CommissionApiService) {
            var result = $q.defer();
            CommissionApiService.getListOrganizationClient().then(
                function (response) {
                    result.resolve(response);
                },
                function (responseError) {
                    result.reject(responseError);
                });
            return result.promise;
        }],
    };

})(angular, Phoenix.App);