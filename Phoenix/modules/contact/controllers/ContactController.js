(function () {
    'use strict';

    angular.module('phoenix.contact.controllers').controller('ContactController', ContactController);

    ContactController.$inject = ['$rootScope', '$state', '$q', 'CodeValueService', 'commonDataService', 'contactService', 'AssignmentDataService', 'dialogs', 'DocumentApiService', 'WorkflowApiService', 'profile', 'profiles', 'common', 'ProfileApiService', 'NoteApiService'];

    function ContactController($rootScope, $state, $q, CodeValueService, commonDataService, contactService, AssignmentDataService, dialogs, DocumentApiService, WorkflowApiService, profile, profiles, common, ProfileApiService, NoteApiService) {
        var self = this;
        if (profile === null) {
            profile = { Id: 0, ProfileTypeId: 0, Contact: { Id: 0 } };
        }

        self.NavigateToContactNotes = function () {
            $state.go('Edit' + self.activeProfileType + 'Profile.ContactNotes');
        };

        self.UpdateNoteCounts = function (notes) {
            self.contactTotalNoteCount = notes.length;
            self.contactUnreadNoteCount = notes.filter(function (item) {
                return !item.UnreadNote || !item.UnreadNote.IsRead;
            }).length;
        };

        //Can't extend this, due to prototypal inheritance of $state.current.parent.data
        for (var key in $state.current.data) {
            self[key] = $state.current.data[key];
        }
        angular.extend(self, {
            currentContact: profile.Contact,
            currentProfile: profile,
            currentProfiles: profiles ? profiles.Items : profiles,
            profileStatuses: CodeValueService.getCodeValues(CodeValueGroups.ProfileStatus),
            profileTypes: CodeValueService.getCodeValues(CodeValueGroups.ProfileType),
            contactStatuses: CodeValueService.getCodeValues(CodeValueGroups.UserStatus),
            ValidationMessages: [],
            block: { isProfiles: true, isAdvances: false, isGarnishees: false, isDocuments: false },
            isSubmitted: false,
            //isApprove: false,
            //isCorrect: false,
            //isRecall: false,
            //isSave: false,
            WorkerDocuments: [],
            isWorkerProfile: false,
            showAdvance: false,
            showGarnishee: false,
            isCurrentProfileUnderReassignRole: currentProfileUnderReassignRole(),
            goUp: goUp,
            getPdfStreamByPublicId: getPdfStreamByPublicId,
            documentDelete: documentDelete,
            documentUploadCallbackOnDone: documentUploadCallbackOnDone,
            onVersionClick: onVersionClick,
            addGovernmentTransition: addGovernmentTransition,
            profileSave: profileSave,
            profileSubmit: profileSubmit,
            profileFinalize: profileFinalize,
            hasAccess: hasAccess,

            buttonClass: buttonClass,
            validateButton: validateButton,
            clickOnWorkflowAvailableAction: clickOnWorkflowAvailableAction,
            declineProfile: declineProfile,
            approveProfile: approveProfile,
            correctProfile: correctProfile,
            recallProfile: recallProfile,
            recallProfileToCompliance: recallProfileToCompliance,
            deleteProfile: deleteProfile,

            inactivateProfile: inactivateProfile,
            approveInactivateProfile: approveInactivateProfile,
            declineInactivateProfile: declineInactivateProfile,
            activateProfile: activateProfile,
            approveActivateProfile: approveActivateProfile,
            declineActivateProfile: declineActivateProfile,

            discard: discard,

            init: init,
            fieldViewEditModeInit: fieldViewEditModeInit,
            refreshActiveAdvancesAndActiveGarnisheesCount: refreshActiveAdvancesAndActiveGarnisheesCount,

            complianceDocument: {
                parentEntityHasNoApplicableComplianceDocuments: false,
                allComplianceDocumentsAreValidForSubmission: false,
                onComplianceDocumentOutput: function (complianceDocumentCallBackEmitterObj) {
                    self.complianceDocument.allComplianceDocumentsAreValidForSubmission = complianceDocumentCallBackEmitterObj.AllComplianceDocumentsAreValidForSubmission;
                    self.complianceDocument.parentEntityHasNoApplicableComplianceDocuments = complianceDocumentCallBackEmitterObj.ParentEntityHasNoApplicableComplianceDocuments;
                },
                triggerToRefreshComplianceDocument: 0
            }
        });

        function resolveListUserProfileAssignedTo() {
            var deferred = $q.defer();
            ProfileApiService.getListUserProfileInternal().then(
                function (responseSuccess) {
                    deferred.resolve(responseSuccess.Items);
                },
                function (responseError) {
                    deferred.reject(responseError);
                });
            return deferred.promise;
        }

        function init() {
            self.cultureId = ApplicationConstants.Culture.Default;
            resolveListUserProfileAssignedTo().then(function (res) {
                self.userProfileAssignedTo = res;
            });
            self.isNotProfilePage = !!self.isNotProfilePage;
            self.isWorkerProfile =
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp ||
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp ||
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianInc ||
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerSubVendor ||
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 ||
                self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC;

            if (!self.currentContact.IsDraft && self.currentContact.Id > 0 && self.currentProfile.Id > 0 && self.isWorkerProfile) {
                DocumentApiService.getEntityDocuments(ApplicationConstants.EntityType.UserProfile, self.currentProfile.Id).then(function success(response) {
                    self.WorkerDocuments = response.Items;
                });
            }

            if (self.currentContact.Id > 0) {
                NoteApiService.getNotes(ApplicationConstants.EntityType.Contact, self.currentContact.Id).then(
                    function success(responseSuccess) {
                        self.UpdateNoteCounts(responseSuccess.Items);
                    }
                );
            }

            commonDataService.eraseWatchConfigOnWorkflowEvent();

            self.currentProfile.WorkflowAvailableActions = [];
            self.currentProfile.WorkflowPendingTaskId = null;

            self.hideActions = hideActions();

            if (!self.hideActions) {
                WorkflowApiService.getWorkflowAvailableActions(self.currentProfile, self.currentProfile, ApplicationConstants.EntityType.UserProfile).then(
                    function (responseSuccess) {
                        if (self.currentProfile.ProfileTypeId == ApplicationConstants.UserProfileType.Internal && self.isCurrentProfileUnderReassignRole) {
                            self.currentProfile.WorkflowAvailableActions.push({ Name: 'Reassign', CommandName: 'Reassign', IsActionButton: true, DisplayButtonOrder: 102 });
                        }
                        if ((self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.Draft ||
                            self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.Recalled ||
                            self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.Declined ||
                            self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.ComplianceDraft ||
                            self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.RecalledCompliance) &&
                            self.currentProfile.WorkflowAvailableActions.some(function (action) { return action.CommandName === 'UserProfileSave' })
                        ) {
                            self.currentProfile.WorkflowAvailableActions.push({ Name: 'Cancel', CommandName: 'UserProfileCancel', IsActionButton: true, DisplayButtonOrder: 100 });
                            // appends fake action to trigger profile refresh
                        }

                        if (self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.Active
                            && (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp || self.currentProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp)
                            && common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileAddGovernmentAdjustment)
                        ) {
                            self.currentProfile.WorkflowAvailableActions.push({ Name: 'Create Adjustment', CommandName: 'CreateAdjustment', IsActionButton: false, DisplayButtonOrder: 101 });
                        }
                    },
                    function (responseError) {

                    });
            }
            self.fieldViewEditModeInit();
            showGarnisheesAndAdvances();
        }
        self.init();

        function buttonClass(commandName) {
            if (commandName.indexOf('Approve') > -1) {
                return 'btn-primary';
            }
            switch (commandName) {
                case 'UserProfileSubmit':
                case 'UserProfileFinalize':
                case 'UserProfileApproval':
                    return 'btn-primary';
                default:
                    return 'btn-default';
            }
        }

        function validateButton(commandName) {
            switch (commandName) {
                case 'UserProfileSubmit':
                case 'UserProfileFinalize':
                    return true;
                default:
                    return false;
            }
        }

        function clickOnWorkflowAvailableAction(action) {
            if (action.CommandName === 'UserProfileStatusToDiscard') {
                self.discard();
            }
            else if (action.CommandName === 'UserProfileCancel') {
                $state.reload();
            }
            else if (action.CommandName === 'UserProfileSave') {
                self.profileSave();
            }
            else if (action.CommandName === 'UserProfileSubmit') {
                self.profileSubmit();
            }
            else if (action.CommandName === 'UserProfileFinalize') {
                self.profileFinalize();
            }
            else if (action.CommandName === 'UserProfileDecline') {
                self.declineProfile();
            }
            else if (action.CommandName === 'UserProfileRecall') {
                self.recallProfile();
            }
            else if (action.CommandName === 'UserProfileRecallCompliance') {
                self.recallProfileToCompliance();
            }
            else if (action.CommandName === 'UserProfileApproval') {
                self.approveProfile();
            }
            else if (action.CommandName === 'UserProfileCorrect') {
                self.correctProfile();
            }
            else if (action.CommandName === 'UserProfileInactivate') {
                self.inactivateProfile();
            }
            else if (action.CommandName === 'UserProfileInactivateApprove') {
                self.approveInactivateProfile();
            }
            else if (action.CommandName === 'UserProfileInactivateDecline') {
                self.declineInactivateProfile();
            }
            else if (action.CommandName === 'UserProfileActivate') {
                self.activateProfile();
            }
            else if (action.CommandName === 'UserProfileActivateApprove') {
                self.approveActivateProfile();
            }
            else if (action.CommandName === 'UserProfileActivateDecline') {
                self.declineActivateProfile();
            }
            else if (action.CommandName === 'UserProfileDelete') {
                self.deleteProfile();
            }
            else if (action.CommandName === 'CreateAdjustment') {
                self.addGovernmentTransition();
            }
            else if (action.CommandName === 'Reassign') {
                self.goToInternalUserReassign();
            }
        }

        var refreshDocumentsListHandler = $rootScope.$on('event:refresh-documents-list', function () {
            self.init();
        });

        var ProfileTypeCode;

        if (self.currentProfiles && self.currentProfiles.length > 0) {
            var activeProfile = _.find(self.currentProfiles, function (item) {
                return item.IsPrimary;
            });
            if (!activeProfile || activeProfile.Id !== self.currentProfile.Id) {
                activeProfile = self.currentProfile;
            }
            ProfileTypeCode = CodeValueService.getCodeValue(activeProfile.ProfileTypeId, CodeValueGroups.ProfileType);
            self.currentProfile.ProfileTypeCode = ProfileTypeCode.text;
            self.activeProfileType = ProfileTypeCode.code;
        }
        else {
            ProfileTypeCode = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType);
            self.currentProfile.ProfileTypeCode = ProfileTypeCode.text;
            self.activeProfileType = ProfileTypeCode.code;
        }

        function addGovernmentTransition() {
            if (self.currentProfile.ProfileStatusId === ApplicationConstants.ProfileStatus.Active && (self.currentProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerTemp || self.currentProfile.ProfileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp)) {
                $state.transitionTo('transaction.adjustment', { workOrderVersionId: 0, userProfileId: self.currentProfile.Id }, { reload: true, inherit: true, notify: true });
            }
        }

        function profileSave() {
            self.ValidationMessages = [];
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            if (self.currentProfile.IsDraft) {
                var userProfileFunctionalRoles = _.filter(self.currentProfile.UserProfileFunctionalRoles, function (role) {
                    return role.FunctionalRoleId > 0;
                });
                self.currentProfile.UserProfileFunctionalRoles = userProfileFunctionalRoles;
            }

            self.currentProfile.UserProfileId = self.currentProfile.Id;

            contactService.userProfileSave(self.currentProfile).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, $state.current.name, 'Profile saved successfully', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function confirmSubmit() {
            var deferred = $q.defer();
            var messageBody = [];

            if (self.currentProfile.DateOfBirth && new Date(self.currentProfile.DateOfBirth).getFullYear() > 0) {
                var age = common.calculateAge(self.currentProfile.DateOfBirth, new Date().toDateString());

                if (age < 16) {
                    messageBody.push('The worker is under 16 years old');
                }
                if (age > 65) {
                    messageBody.push('The worker is over 65 years old');
                }
            }

            var differentSINSameContactMessages = contactService.getUserProfileWithDifferentSINInSameContact(self.currentProfile.Id, self.currentProfile.SIN).then(function (result) {
                if (result && result.length > 0) {
                    messageBody.push(
                        (messageBody.length > 0 ? 'the ' : 'The ') +
                        'SIN entered in the ' +
                        self.currentProfile.ProfileTypeCode +
                        ' profile is different from other profiles within this contact'
                    );
                }
            });

            var differentSINMessages;
            if (window.allowDuplicateSIN && self.currentProfile.SIN) {
                differentSINMessages = contactService.isSINDuplicated(self.currentProfile.Id, self.currentProfile.SIN).then(function (result) {
                    if (result) {
                        messageBody.push("The SIN number already exists");
                    }
                });
            } else {
                differentSINMessages = Promise.resolve();
            }

            Promise.all([differentSINSameContactMessages, differentSINMessages]).then(function (results) {
                if (messageBody.length > 0) {
                    var title = 'Confirm';
                    var message = messageBody.join('.<br> </br> ') + '. Do you want to continue?';
                    dialogs.confirm(title, message).result.then(function (btn) {
                        deferred.resolve(true);
                    }, function (btn) {
                        deferred.resolve(false);
                    });
                } else {
                    deferred.resolve(true);
                }
            });
            return deferred.promise;
        }

        function profileSubmit() {
            confirmSubmit().then(function (confirmed) {
                if (confirmed) {
                    profileSubmitConfirmed();
                }
            });
        }

        function profileSubmitConfirmed() {
            self.ValidationMessages = [];
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            if (self.currentProfile.IsDraft) {
                var userProfileFunctionalRoles = _.filter(self.currentProfile.UserProfileFunctionalRoles, function (role) {
                    return role.FunctionalRoleId > 0;
                });
                self.currentProfile.UserProfileFunctionalRoles = userProfileFunctionalRoles;
            }

            self.currentProfile.UserProfileId = self.currentProfile.Id;

            contactService.userProfileSubmit(self.currentProfile).then(
                function (success) {
                    var entityContactId = self.currentProfile.ContactId;
                    if (success.EntityIdRedirect) {
                        success.EntityId = success.EntityIdRedirect;
                        entityContactId = self.currentProfile.SourceContactId;
                    }
                    onWorkflowEventSuccess(success.EntityId, $state.current.name, 'Profile submitted successfully', entityContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function profileFinalize() {
            confirmSubmit().then(function (confirmed) {
                if (confirmed) {
                    profileFinalizeConfirmed();
                }
            });
        }

        function profileFinalizeConfirmed() {
            self.ValidationMessages = [];
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            if (self.currentProfile.IsDraft) {
                var userProfileFunctionalRoles = _.filter(self.currentProfile.UserProfileFunctionalRoles, function (role) {
                    return role.FunctionalRoleId > 0;
                });
                self.currentProfile.UserProfileFunctionalRoles = userProfileFunctionalRoles;
            }

            self.currentProfile.UserProfileId = self.currentProfile.Id;

            contactService.userProfileFinalize(self.currentProfile).then(
                function (success) {
                    var entityContactId = self.currentProfile.ContactId;
                    if (success.EntityIdRedirect) {
                        success.EntityId = success.EntityIdRedirect;
                        entityContactId = self.currentProfile.SourceContactId;
                    }
                    onWorkflowEventSuccess(success.EntityId, $state.current.name, 'Profile finalized successfully', entityContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function hasAccess() {
            var retVal = true;
            for (var i = 0; i < arguments.length; i++) {
                retVal = ApplicationConstants.EntityAccessAction.exists(self.currentProfile.AccessActions, arguments[i])
                if (!retVal) {
                    break;
                }
            }
            return retVal;
        }

        function declineProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var dlg = dialogs.create('/dialogs/dialogCommentTemplate.html', 'dialogCommentController', {}, { keyboard: false, backdrop: 'static' });

            dlg.result.then(function (comment) {

                var declineCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id, AdditionalNotes: comment };

                contactService.declineCurrentProfile(declineCommand).then(
                    function (success) {
                        onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile declined successfully.', self.currentProfile.ContactId);
                    },
                    function (error) {
                        onResponseError(error, 'Profile is not valid');
                        self.isSubmitted = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            }, function () {
                self.isSubmitted = false;
                $rootScope.activateGlobalSpinner = false;
            });
        }

        function approveProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var approvalCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.approveCurrentProfile(approvalCommand).then(
                function (success) {
                    var sourceId = self.currentProfile.SourceId;
                    var contactId = self.currentProfile.ContactId;
                    if (sourceId) {
                        success.EntityId = sourceId;
                        contactId = self.currentProfile.SourceContactId;
                    }
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile approved successfully.', contactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function correctProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;
            var profileTypeId = self.currentProfile.ProfileTypeId;

            var correctCommand = {
                WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId,
                UserProfileId: self.currentProfile.Id,
                ContactId: self.currentProfile.ContactId,
                FirstName: self.currentContact.FirstName,
                LastName: self.currentContact.LastName,
                PersonTitleId: self.currentContact.PersonTitleId,
                PreferredPersonTitleId: self.currentContact.PreferredPersonTitleId,
                PreferredFirstName: self.currentContact.PreferredFirstName,
                PreferredLastName: self.currentContact.PreferredLastName,
                CultureId: self.currentContact.CultureId,
                AssignedToUserProfileId: self.currentContact.AssignedToUserProfileId,
            };

            contactService.correctCurrentProfile(correctCommand).then(
                function (success) {
                    self.isSubmitted = false;
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Editing profile created successfully.', success.EntityIdRedirect);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function inactivateProfile() {
            function inactivateProfileCore() {
                self.isSubmitted = true;
                $rootScope.activateGlobalSpinner = true;
                var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

                var inactivateCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

                return contactService.inactivateCurrentProfile(inactivateCommand).then(
                    function (success) {
                        self.isSubmitted = false;
                        onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Your deactivation request has been submitted for approval.', self.currentProfile.ContactId);
                    },
                    function (error) {
                        onResponseError(error, 'Profile is not valid');
                        self.isSubmitted = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            }
            if (self.currentProfile.ProfileTypeId == ApplicationConstants.UserProfileType.Internal && self.isCurrentProfileUnderReassignRole) {
                var dialogConfig = { contactName: self.currentContact.FirstName + ' ' + self.currentContact.LastName };
                dialogs.create('/Phoenix/modules/contact/views/DialogInternalUserDeactivateConfirm.html', 'DialogInternalUserDeactivateConfirmController', dialogConfig, { keyboard: false, backdrop: 'static' }).result.then(function (resultModel) {
                    if (resultModel.Action === 'Deactivate') {
                        inactivateProfileCore();
                    } else if (resultModel.Action === 'DeactivateAndReassign') {
                        inactivateProfileCore().then(function () {
                            self.goToInternalUserReassign();
                        });
                    }
                }, function (resultModel) {
                    var dialogResult = 'Not Confirmed';
                });
                return;
            }
            var dlg = dialogs.confirm('Deactivate User Profile', 'This profile will be deactivated. Continue?');

            dlg.result.then(function (btn) {
                inactivateProfileCore();
            }, function (btn) { });
        }

        function approveInactivateProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var approveInactivateCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.approveInactivateCurrentProfile(approveInactivateCommand).then(
                function (success) {
                    self.isSubmitted = false;
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile deactivation approved successfully.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function declineInactivateProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var declineInactivateCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.declineInactivateCurrentProfile(declineInactivateCommand).then(
                function (success) {
                    self.isSubmitted = false;
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile deactivation declined successfully.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function activateProfile() {

            var dlg = dialogs.confirm('Activate User Profile', 'This profile will be Activated. Continue?');

            dlg.result.then(function (btn) {
                self.isSubmitted = true;
                $rootScope.activateGlobalSpinner = true;
                var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

                var inactivateApproveCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

                contactService.activateCurrentProfile(inactivateApproveCommand).then(
                    function (success) {
                        self.isSubmitted = false;
                        onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Your activation request has been submitted for approval.', self.currentProfile.ContactId);
                    },
                    function (error) {
                        onResponseError(error, 'Profile is not valid');
                        self.isSubmitted = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            }, function (btn) { });

        }


        function approveActivateProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var approveActivateCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.approveActivateCurrentProfile(approveActivateCommand).then(
                function (success) {
                    self.isSubmitted = false;
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile activation approved successfully.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function declineActivateProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var declineActivateCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.declineActivateCurrentProfile(declineActivateCommand).then(
                function (success) {
                    self.isSubmitted = false;
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile activation declined successfully.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function deleteProfile() {
            var dlg = dialogs.confirm('Delete User Profile', 'This profile will be deleted. Continue?');

            dlg.result.then(function (btn) {
                self.isSubmitted = true;
                $rootScope.activateGlobalSpinner = true;
                var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

                var deleteCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

                contactService.deleteCurrentProfile(deleteCommand).then(
                    function (success) {
                        self.isSubmitted = false;
                        $rootScope.$state.transitionTo('ngtwo.m', { p: "contact/search" });
                        $rootScope.activateGlobalSpinner = false;
                        common.logSuccess('Profile deleted successfully.');
                    },
                    function (error) {
                        onResponseError(error, 'Profile is not valid');
                        self.isSubmitted = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            }, function (btn) { });
        }

        function recallProfile() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var recallCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.recallCurrentProfile(recallCommand).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile recalled successfully.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function recallProfileToCompliance() {
            self.isSubmitted = true;
            $rootScope.activateGlobalSpinner = true;
            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            var recallCommand = { WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: self.currentProfile.Id };

            contactService.recallCurrentProfileToCompliance(recallCommand).then(
                function (success) {
                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile recalled successfully to Compliance.', self.currentProfile.ContactId);
                },
                function (error) {
                    onResponseError(error, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function discard() {

            var discardId = self.currentProfile.Id;

            var profileType = CodeValueService.getCodeValue(self.currentProfile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            dialogs.confirm('Discard User Profile', 'Are you sure you want to discard this User Profile?').result.then(
                function (btn) {
                    if (discardId > 0) {
                        self.isSubmitted = true;
                        $rootScope.activateGlobalSpinner = true;
                        contactService.discardProfile({ WorkflowPendingTaskId: self.currentProfile.WorkflowPendingTaskId, UserProfileId: discardId }).then(
                            function (success) {

                                var contactId = self.currentProfile.ContactId;
                                var sourceId = self.currentProfile.SourceId;

                                if (sourceId) {
                                    success.EntityId = sourceId;
                                    contactId = self.currentProfile.SourceContactId;
                                    onWorkflowEventSuccess(success.EntityId, 'Edit' + profileType + 'Profile', 'Profile deleted successfully.', contactId);
                                }
                                else {
                                    $state.go('ngtwo.m', { p: 'contact/search' });
                                    contactService.logSuccess('Profile deleted successfully');
                                }
                            },
                            function (error) {
                                onResponseError(error);
                                self.isSubmitted = false;
                                $rootScope.activateGlobalSpinner = false;
                            });
                    }
                    else {
                        contactService.logSuccess('Profile deleted successfully');
                        $state.go('ngtwo.m', { p: 'contact/search' });
                    }
                }, function (btn) {
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        }

        function onResponseError(responseError, errorMessage) {
            if (errorMessage && errorMessage.length > 0) {
                contactService.logError(errorMessage);
            }
            self.ValidationMessages = contactService.responseErrorMessages(responseError);
            self.complianceDocument.triggerToRefreshComplianceDocument++;
        }

        function onWorkflowEventSuccess(profileId, stateNameGo, message, contactId) {
            AssignmentDataService.delListUserProfileWorker();
            self.validationMessages = [];
            self.isSubmitted = false;
            if (message && message.length > 0) {
                contactService.logSuccess(message);
            }
            commonDataService.setWatchConfigOnWorkflowEvent(stateNameGo, $state.current.name, ApplicationConstants.EntityType.UserProfile, ApplicationConstants.EntityType.UserProfile, profileId, { contactId: contactId, profileId: profileId });
            self.complianceDocument.triggerToRefreshComplianceDocument++;
        }

        function onVersionClick(profile, isOriginal) {

            var profileId = profile.Id, contactId = profile.ContactId;
            var profileType = CodeValueService.getCodeValue(profile.ProfileTypeId, CodeValueGroups.ProfileType).code;

            self.isNotProfilePage = false;

            if (isOriginal && profile.SourceId) {
                profileId = profile.SourceId;
                contactId = profile.SourceContactId;
            }
            if (!isOriginal && profile.ChildId) {
                profileId = profile.ChildId;
                contactId = profile.ChildContactId;
            }

            $state.go('Edit' + profileType + 'Profile', { contactId: contactId, profileId: profileId });
        }

        function documentUploadCallbackOnDone(document) {

            if (document && document.documentPublicId) {
                DocumentApiService.getDocumentByPublicId(document.documentPublicId).then(function (doc) {
                    self.WorkerDocuments.push(doc);
                },
                    function (error) {
                        onResponseError(error, 'Document upload has failed.');
                        self.isSubmitted = false;
                        $rootScope.activateGlobalSpinner = false;
                    });
            }
        }

        function documentDelete(document) {

            var dlg = dialogs.confirm('Document Delete', 'This document will be deleted. Continue ?');

            dlg.result.then(function (btn) {
                DocumentApiService.deleteDocumentByPublicId(document.PublicId).then(function () {
                    self.WorkerDocuments = _.filter(self.WorkerDocuments, function (doc) { return doc.PublicId != document.PublicId; });
                });
            }, function (btn) { });
        }

        function getPdfStreamByPublicId(publicId) {
            return DocumentApiService.getPdfStreamByPublicId(publicId);
        }

        function fieldViewEditModeInit() {

            var viewEditModeConfig = {

                funcToCheckViewStatus: function (modelPrefix, fieldName) {
                    if (modelPrefix == 'contact.currentContact' && fieldName == 'CultureId') {
                        // View mode based on current contact
                        if (self.currentContact.LoginUserId == null && self.currentContact.IsDraftStatus && !self.hideActions) {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                        else {
                            return ApplicationConstants.viewStatuses.view;
                        }
                    }

                    else if (self.currentProfile.IsDraftStatus && modelPrefix != undefined && fieldName != undefined
                        && !self.hideActions
                    ) {
                        // Payment Method Block
                        if (
                            (modelPrefix == 'profile.currentProfile' && fieldName == 'PayeeName') ||
                            (modelPrefix == 'method' && ['UserPaymentMethod', 'UserPaymentPreference'].indexOf(fieldName) > -1)
                        ) {
                            if (self.currentProfile.AreComplianceFieldsEditable) {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        }

                        // Direct Deposit/Wire Transfer /ADP fields Block
                        else if (modelPrefix == 'method' &&
                            [
                                'BankCode',
                                'BankBranchCode',
                                'BankAccountNumber',
                                'ProfileNameBeneficiary',
                                'NameBeneficiary',
                                'AccountNumberBeneficiary',
                                'Address1Beneficiary',
                                'Address2Beneficiary',
                                'CityBeneficiary',
                                'ProvinceOrStateBeneficiary',
                                'CountryCodeBeneficiary',
                                'PostalorZipBeneficiary',
                                'PayCurrencyBeneficiary',
                                'WireTransferBankTypeIdBeneficiary',
                                'BankIDBeneficiary',
                                'ABANoBeneficiary',
                                'WireTransferBankTypeIdIntemediary',
                                'BankNameIntemediary',
                                'BankIdIntemediary',
                                'Address1Intemediary',
                                'Address2Intemediary',
                                'CityIntemediary',
                                'ProvinceOrStateIntemediary',
                                'CountryCodeIntemediary',
                                'PostalOrZipIntemediary',
                                'WireTransferBankTypeIdReceivers',
                                'BankNameReceivers',
                                'BankIdReceivers',
                                'Address1Receivers',
                                'Address2Receivers',
                                'CityReceivers',
                                'ProvinceOrStateReceivers',
                                'CountryCodeReceivers',
                                'PostalOrZipReceivers',
                                'PaymentDetailNotes',
                                'EmployeeId'
                            ].indexOf(fieldName) > -1) {
                            if (self.currentProfile.AreComplianceFieldsEditable) {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        }

                        // Payroll Setup Block - All fields except IsAccrued
                        else if ((modelPrefix == 'profile.currentProfile' && [
                            'IsBasicSetup',
                            'FederalTD1',
                            'ProvincialTD1',
                            'TD1XTotalRemuneration',
                            'TD1XCommissionExpenses',
                            'IsApplyWorkerSPGovernmentRuling'
                            //'TaxSubdivisionId'
                        ].indexOf(fieldName) > -1) ||
                            (modelPrefix.indexOf('profile.currentProfile.UserProfileWorkerSourceDeductions') == 0 && [
                                'CPPExempt',
                                'QPPExempt',
                                'EIExempt',
                                'PIPExempt',
                                'QuebecTrainingFee',
                                'FederalExempt',
                                'ProvincialExempt',
                                'AdditionalTax'
                            ].indexOf(fieldName) > -1) ||
                            (modelPrefix == 'userProfileWorkerOtherEarning' && [
                                'IsApplied',
                                'RatePercentage'
                            ].indexOf(fieldName) > -1) ||
                            (modelPrefix == 'governmentRuling')
                        ) {
                            if (self.currentProfile.AreComplianceFieldsEditable) {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        }

                        // Payroll Setup Block - IsAccrued
                        else if (modelPrefix == 'userProfileWorkerOtherEarning' && fieldName == 'IsAccrued') {
                            if (self.currentProfile.AreComplianceFieldsEditable) {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        }

                        // Benefit Setup Block
                        else if (modelPrefix == 'profile.currentProfile' && fieldName == 'IsApplyBenefit') {
                            if (self.currentProfile.AreComplianceFieldsEditable) {
                                return ApplicationConstants.viewStatuses.edit;
                            } else {
                                return ApplicationConstants.viewStatuses.view;
                            }
                        }

                        else {
                            return ApplicationConstants.viewStatuses.edit;
                        }
                    }
                    else {
                        return ApplicationConstants.viewStatuses.view;
                    }
                },
                funcToPassMessages: function (message) {
                    common.logWarning(message);
                }
            };

            self.ptFieldViewStatus = viewEditModeConfig;
        }

        function hideActions() {
            return (self.currentProfile
                && self.currentProfile.Id > 0
                && self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.Internal
                && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileEditTypeInternal));
        }

        function showGarnisheesAndAdvances() {

            if (self.currentProfile.Id > 0 && (self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp || self.currentProfile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp)) {
                if (common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileViewWorkerAdvance)) {
                    self.showAdvance = true;
                }
                if (common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.UserProfileViewWorkerGarnishee)) {
                    self.showGarnishee = true;
                }
            }
        }

        function refreshActiveAdvancesAndActiveGarnisheesCount() {
            contactService.getProfile(self.currentProfile.ProfileTypeId, self.currentProfile.Id).then(function (response) {
                self.currentProfile.ActiveAdvancesCount = response.ActiveAdvancesCount;
                self.currentProfile.ActiveGarnisheesCount = response.ActiveGarnisheesCount;
            });
        }

        function goUp() {
            if (self.isNotProfilePage) {
                self.isNotProfilePage = false;
                $state.go("^");
            }
        }

        function currentProfileUnderReassignRole() {
            return _.filter($rootScope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOffice
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Finance
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Controller
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOfficeARAP
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.AccountsReceivable
                );
            }).length > 0;
        }

        self.CreateAdditionalProfile = function (contactId, profileTypeId) {

            var profileType = CodeValueService.getCodeValue(profileTypeId, CodeValueGroups.ProfileType).code;
            self.validationMessages = [];
            contactService.userProfileNew({
                ContactId: contactId,
                ProfileTypeId: profileTypeId,
                PrimaryEmail: this.currentProfile.PrimaryEmail,
                OrganizationId: null
            }).then(
                function (success) {
                  $state.go('Edit' + profileType + 'Profile', { profileId: success.TriggerEntityId, contactId: contactId });
                },
                function (responseError) {
                    self.validationMessages = common.responseErrorMessages(responseError);
                    onResponseError(responseError, 'Profile is not valid');
                    self.isSubmitted = false;
                    $rootScope.activateGlobalSpinner = false;
                });
        };

        self.CanAddProfile = function (profileTypeId) {
            if (profileTypeId === ApplicationConstants.UserProfileType.Internal
                && !common.hasFunctionalOperation(ApplicationConstants.FunctionalOperation.ContactCreateProfileTypeInternal)
            ) {
                return false;
            }
            return contactService.canAddProfile(profileTypeId, self.currentProfile.ContactProfileTypes);
        };
        self.goToInternalUserReassign = function () {
            var sourceProfileId = self.currentProfile.SourceId;
            if (!sourceProfileId) {
                sourceProfileId = self.currentProfile.Id;
            }
            $state.go('ngtwo.m', { p: 'contact/internal-user-reassign/' + sourceProfileId });
        };
    }
})();