(function () {
    'use strict';

    angular.module('phoenix.contact.services')
        .factory('contactService', ContactService);

    /** @ngInject */
    ContactService.$inject = ['$q', '$rootScope', '$state', 'commonDataService', 'OrgApiService', 'NavigationService', 'ProfileApiService', 'WorkflowApiService', 'SmartTableService', 'common', 'defaultContact', 'phoenixapi', 'profileTypeMapping'];
    function ContactService($q, $rootScope, $state, commonDataService, OrgApiService, NavigationService, ProfileApiService, WorkflowApiService, SmartTableService, common, defaultContact, phoenixapi, profileTypeMapping) {
        var self = this;
        var contact = null;
        var profile = null;
        var email = '';

        angular.extend(self, OrgApiService, Object.getPrototypeOf(NavigationService), ProfileApiService, common, {
            createNewContact: createNewContact,
            getCurrentContact: getCurrentContact,
            getCurrentProfile: getCurrentProfile,
            getCurrentEmail: getCurrentEmail,
            getEditProfile: getEditProfile,
            getProfileMapping: getProfileMapping,
            execCommand: execCommand,
            declineCurrentProfile: declineCurrentProfile,
            approveCurrentProfile: approveCurrentProfile,
            correctCurrentProfile: correctCurrentProfile,
            recallCurrentProfile: recallCurrentProfile,
            recallCurrentProfileToCompliance: recallCurrentProfileToCompliance,

            inactivateCurrentProfile: inactivateCurrentProfile,
            approveInactivateCurrentProfile: approveInactivateCurrentProfile,
            declineInactivateCurrentProfile: declineInactivateCurrentProfile,
            activateCurrentProfile: activateCurrentProfile,
            approveActivateCurrentProfile: approveActivateCurrentProfile,
            declineActivateCurrentProfile: declineActivateCurrentProfile,
            deleteCurrentProfile: deleteCurrentProfile,

            userProfileSubmit: userProfileSubmit,
            userProfileFinalize: userProfileFinalize,
            userProfileNew: userProfileNew,
            userProfileSave: userProfileSave,

            getProfileAdvances: getProfileAdvances,
            advanceNew: advanceNew,
            getUserProfileAdvanceDetail: getUserProfileAdvanceDetail,
            advanceSubmit: advanceSubmit,
            getProfileGarnishees: getProfileGarnishees,
            getUserProfileGarnisheeDetail: getUserProfileGarnisheeDetail,
            garnisheeSubmit: garnisheeSubmit,
            getAllInternalTeams: getAllInternalTeams,
            getInternalTeam: getInternalTeam,
            internalTeamNew: internalTeamNew,
            internalTeamCorrect: internalTeamCorrect,
            getUserProfileByWorkOrderId: getUserProfileByWorkOrderId,


            getDeclinedProfiles: getDeclinedProfiles,
            getListOrganizationInternal: getListOrganizationInternal,
            getListOrganizationClientForWorkerProfile: getListOrganizationClientForWorkerProfile,
            getUserProfileWithDifferentSINInSameContact: getUserProfileWithDifferentSINInSameContact,
            isSINDuplicated: isSINDuplicated
        });

        return self;

        // create an initial contact based on either what's passed in or an empty object
        function createNewContact(cont) {
            // todo - fix this - the contact hangs off the current profile
            contact = cont || angular.extend({}, defaultContact);

            return contact;
        }

        function getCurrentContact() {
            return contact;
        }

        function getCurrentProfile() {
            return profile;
        }

        function getCurrentEmail() {
            return email;
        }

        function getEditProfile(profileType, profileId) {
            if (!profileType || !profileId) {
                throw new Error('Need both profileType AND profileId to edit a profile');
            }

            var promise = self[profileType.editMethod](profileId);

            promise.then(function (success) {
                setEditability(success);
                setProfileTypeFlags(success);
                parseProfileFields(success);
                profile = success;
                contact = profile.Contact;
                email = profile.PrimaryEmail;
            });

            return promise;
        }

        function parseProfileFields(profile) {
            _.forEach(profile.UserProfileWorkerSPGovernmentRulings, function(item) {
                if (item.EffectiveYear != null) {
                    item.EffectiveDate = new Date(item.EffectiveYear, 0);
                }
            });
        }

        function setProfileTypeFlags(profile) {
            profile.isProfileW2OrTempOrSP = profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 || profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp || profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp;
            profile.isProfileW2OrTemp = profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 || profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp;
            profile.isProfileTempOrSP = profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerTemp || profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp;
            profile.isProfileSP = profile.ProfileTypeId === ApplicationConstants.UserProfileType.WorkerCanadianSp;
        }

        function currentProfileUnderComplianceRole() {
            return _.filter($rootScope.CurrentProfile.FunctionalRoles, function (item) {
                return (
                    item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOffice
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Finance
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.SystemAdministrator
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.Controller
                    || item.FunctionalRoleId === ApplicationConstants.FunctionalRole.BackOfficeARAP
                );
            }).length > 0;
        }

        function setEditability(profile) {
            var isProfileStatusComplianceDraft = isComplianceDraftStatus(profile.ProfileStatusId);
            var iscurrentProfileUnderComplianceRole = currentProfileUnderComplianceRole();

            profile.IsDraftStatus = profile.ProfileStatusId == ApplicationConstants.ProfileStatus.New
                || profile.ProfileStatusId == ApplicationConstants.ProfileStatus.Draft
                || profile.ProfileStatusId == ApplicationConstants.ProfileStatus.Declined
                || profile.ProfileStatusId == ApplicationConstants.ProfileStatus.Recalled
                || (isProfileStatusComplianceDraft && iscurrentProfileUnderComplianceRole);
                
            profile.Contact.IsDraftStatus = profile.IsDraftStatus; // Use profile editability for now, right now the contact editability is driven by the user profile

            profile.ValidateComplianceDraft = !(profile.IsDraftStatus && !isProfileStatusComplianceDraft);
            profile.AreComplianceFieldsEditable = iscurrentProfileUnderComplianceRole && isProfileStatusComplianceDraft;
        }

        function isComplianceDraftStatus(statusId) {
            return statusId === ApplicationConstants.ProfileStatus.ComplianceDraft
                || statusId === ApplicationConstants.ProfileStatus.RecalledCompliance;
        }

        function getProfileMapping(profileTypeId) {
            if (profileTypeId == ApplicationConstants.UserProfileType.Organizational) {
                return profileTypeMapping.organizational;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.Internal) {
                return profileTypeMapping.internal;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                return profileTypeMapping.tempWorker;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                return profileTypeMapping.canadianIncWorker;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc) {
                return profileTypeMapping.canadianSPWorker;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
                return profileTypeMapping.unitedStatesW2Worker;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
                return profileTypeMapping.unitedStatesLLCWorker;
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor) {
                return profileTypeMapping.subVendorWorker;
            } else {
                return null;
            }
        }

        function userProfileSubmit(command) {
            return this.execCommand("UserProfileSubmit", command);
        }

        function userProfileFinalize(command) {
            return this.execCommand("UserProfileFinalize", command);
        }

        function declineCurrentProfile(command) {
            return this.execCommand("UserProfileDecline", command);
        }

        function approveCurrentProfile(command) {
            return this.execCommand("UserProfileApproval", command);
        }

        function correctCurrentProfile(command) {
            return this.execCommand("UserProfileCorrect", command);
        }

        function recallCurrentProfile(command) {
            return this.execCommand("UserProfileRecall", command);
        }

        function recallCurrentProfileToCompliance(command) {
            return this.execCommand("UserProfileRecallCompliance", command);
        }

        function inactivateCurrentProfile(command) {
            return this.execCommand("UserProfileInactivate", command);
        }

        function approveInactivateCurrentProfile(command) {
            return this.execCommand("UserProfileInactivateApprove", command);
        }

        function declineInactivateCurrentProfile(command) {
            return this.execCommand("UserProfileInactivateDecline", command);
        }

        function activateCurrentProfile(command) {
            return this.execCommand("UserProfileActivate", command);
        }

        function approveActivateCurrentProfile(command) {
            return this.execCommand("UserProfileActivateApprove", command);
        }

        function declineActivateCurrentProfile(command) {
            return this.execCommand("UserProfileActivateDecline", command);
        }

        function deleteCurrentProfile(command) {
            return this.execCommand("UserProfileDelete", command);
        }

        function execCommand(commandName, commandObj) {
            return phoenixapi.command(commandName, commandObj);
        }

        function getProfileAdvances(tableState, oDataParams, profileId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('UserProfile/getProfileAdvances/profile/' + profileId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function advanceNew(command) {
            return phoenixapi.command("AdvanceNew", command);
        }
        function getUserProfileAdvanceDetail(profileId, advanceId) {
            return phoenixapi.query('UserProfile/getUserProfileAdvanceDetail/profile/' + profileId + '/advance/' + advanceId);
        }
        function advanceSubmit(command) {
            return phoenixapi.command("AdvanceSubmit", command);
        }
        function getProfileGarnishees(tableState, oDataParams, profileId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('UserProfile/getProfileGarnishees/profile/' + profileId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function garnisheeNew(command) {
            return phoenixapi.command("GarnisheeNew", command);
        }
        function getUserProfileGarnisheeDetail(profileId, garnisheeId) {
            return phoenixapi.query('UserProfile/getUserProfileGarnisheeDetail/profile/' + profileId + '/garnishee/' + garnisheeId);
        }
        function garnisheeSubmit(command) {
            return phoenixapi.command("GarnisheeSubmit", command);
        }

        function getAllInternalTeams(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('contact/getAllInternalTeams?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }

        function getInternalTeam(internalTeamId, oDataParams) {
            return phoenixapi.query('contact/getInternalTeam/' + internalTeamId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getUserProfileByWorkOrderId(id) {
            return phoenixapi.query('UserProfile/getUserProfileByWorkOrderId/' + id);
        }

        function internalTeamNew(command) {
            return phoenixapi.command("InternalTeamNew", command);
        }
        function internalTeamCorrect(command) {
            return phoenixapi.command("InternalTeamCorrect", command);
        }

        function userProfileNew(command) {
            var stateName = $state.current.name;
            return new Promise(function(resolve, reject) {
                phoenixapi.command("UserProfileNew", command)
                .then(function(response) {
                    // Wait for the workflow to stop before resolving
                    // Temporariliy copying the ng2 workflow service pattern & logic (Notemptyrandomstring), should use ng2 workfow.service.ts -> setWatchConfigOnWorkflowEvent()
                    commonDataService.setWatchConfigOnWorkflowEvent('Notemptyrandomstring', stateName, ApplicationConstants.EntityType.UserProfile, ApplicationConstants.EntityType.UserProfile, response.EntityId, null, resolve);
                })
                .catch(function(error) {
                    reject(error);
                });
            }) 
        }

        function userProfileSave(command) {
            return phoenixapi.command("UserProfileSave", command);
        }
        
        function getDeclinedProfiles(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('Contact/getDeclinedProfiles?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getListOrganizationInternal(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
            var deferred = $q.defer();
            deferred.resolve(commonDataService.getListOrganizationInternal(oDataParams));
            return deferred.promise;
        }

        function getListOrganizationClientForWorkerProfile(userProfileIdWorker, oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
            var deferred = $q.defer();
            phoenixapi.query('org/getListOrganizationClientForWorkerProfile/' + userProfileIdWorker + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''))
            .then(
                function (response) {
                    deferred.resolve(response ? response.Items : []);
                },
                function (responseError) {
                    deferred.reject(responseError);
                }
            );

            return deferred.promise;
        }

        function getUserProfileWithDifferentSINInSameContact(id, SIN) {
            return phoenixapi.query('UserProfile/' + id + '/getUserProfileWithDifferentSINInSameContact/' + SIN);
        }

        function isSINDuplicated(id, SIN){
            return phoenixapi.query('UserProfile/' + id +'/isSINDuplicated/' + SIN + '/');
        }
    }
})();
