(function (angular) {
    'use strict';

    var serviceId = 'ProfileApiService';
    angular.module('phoenix.contact.services').factory(serviceId, ['common', 'config', 'phoenixapi', 'SmartTableService', 'AssignmentDataService', ProfileApiService]);

    function ProfileApiService(common, config, phoenixapi, SmartTableService, AssignmentDataService) {
        var $q = common.$q;
        var service = {
            getLoginInfo: getLoginInfo,

            get: get,
            getProfilesForOrganization: getProfilesForOrganization,
            getListUserProfileInternal: getListUserProfileInternal,

            defaultAddress: defaultAddress,
            defaultPhone: defaultPhone,
            defaultRole: defaultRole,
            defaultTaxNumber: defaultTaxNumber,
            defaultWorkerSPGovernmentRuling: defaultWorkerSPGovernmentRuling,

            searchProfiles: searchProfiles,
            searchInternalProfiles: searchInternalProfiles,
            searchOrganizationalProfiles: searchOrganizationalProfiles,

            searchContactsST: searchContactsST,
            searchContactsWithDocumentCounts: searchContactsWithDocumentCounts,
            getContact: getContact,
            saveContact: saveContact,
            getContactProfiles: getContactProfiles,

            getContactsForOrganization: getContactsForOrganization,
            getOrganizationsForContact: getOrganizationsForContact,
            userProfileSetPrimary: userProfileSetPrimary,
            searchOrganizationalProfile: searchOrganizationalProfile,
            getOrganizationalProfile: getOrganizationalProfile,
            //saveOrganizationalProfile: saveOrganizationalProfile, // NJ: not used

            searchInternalProfile: searchInternalProfile,
            getInternalProfile: getInternalProfile,
            //saveInternalProfile: saveInternalProfile, // NJ: not used

            searchWorkerProfile: searchWorkerProfile,

            searchCanadianIncProfiles: searchCanadianIncProfiles,
            getCanadianIncProfile: getCanadianIncProfile,
            //saveCanadianIncProfile: saveCanadianIncProfile, // NJ: not used

            searchSubVendorProfiles: searchSubVendorProfiles,
            getSubVendorProfile: getSubVendorProfile,

            getCanadianSPProfile: getCanadianSPProfile,
            //saveCanadianSPProfile: saveCanadianSpProfile, // NJ: not used

            getWorkerTempProfile: getWorkerTempProfile,
            //saveWorkerTempProfile: saveWorkerTempProfile, // NJ: not used


            getWorkerUnitedStatesLLCProfile: getWorkerUnitedStatesLLCProfile,
            //saveWorkerUnitedStatesLLCProfile: saveWorkerUnitedStatesLLCProfile, // NJ: not used

            getWorkerUnitedStatesW2Profile: getWorkerUnitedStatesW2Profile,
            //saveWorkerUnitedStatesW2Profile: saveWorkerTempProfile, // NJ: not used

            sendInvitation: sendInvitation,

            searchUserProfile: searchUserProfile,
            searchWorkerCanadianIncProfile: searchWorkerCanadianIncProfile,
            searchWorkerUnitedStatesW2Profile: searchWorkerUnitedStatesW2Profile,
            searchWorkerUnitedStatesLLCProfile: searchWorkerUnitedStatesLLCProfile,

            getProfile: getProfile,
            discardProfile: discardProfile,

            searchAllWorkerProfile: searchAllWorkerProfile,
            removeInactiveProfile: removeInactiveProfile,
            removeInactiveProfileWithConfig: removeInactiveProfileWithConfig,

            canAddProfile: canAddProfile
        };

        var cache = {};

        function fetch(profileid, callback) {
            var key = "_" + profileid;
            cache[key] = cache.hasOwnProperty(key) ? cache[key] : callback();
            return cache[key];
        }

        function defaultAddress(profileId) {
            return {
                UserProfileId: profileId,
                AddressTypeId: 2, // business
                CountryId: 124,  // Canada
                SubdivisionId: 600 // Ontario
            };
        }

        function defaultPhone(profileId) {
            return {
                UserProfileId: profileId,
                PhoneTypeId: 1, // business
                Phone: null,
                Extension: null
            };
        }

        function defaultRole(profileId) {
            var tempDefaultRole = $q.defer();
            tempDefaultRole.resolve({ UserProfileId: profileId });
            return tempDefaultRole.promise;
        }

        function defaultTaxNumber(profileId, profileTypeId) {
            return {
                UserProfileId: profileId,
                ProfileTypeId: profileTypeId,
            };
        }

        function defaultWorkerSPGovernmentRuling(profileId) {
            var year = new Date().getFullYear();
            return {
                OrganizationIdClient: null,
                RulingNumber: null,
                EffectiveYear: year,
                // For UI datepicker
                EffectiveDate: new Date(year, 0)
            };
        }

        function getProfile(profileTypeId, profileId) {
            if (profileTypeId == ApplicationConstants.UserProfileType.Organizational) {
                return getOrganizationalProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.Internal) {
                return getInternalProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerTemp) {
                return getWorkerTempProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianSp) {
                return getCanadianSPProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerCanadianInc) {
                return getCanadianIncProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesW2) {
                return getWorkerUnitedStatesW2Profile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC) {
                return getWorkerUnitedStatesLLCProfile(profileId);
            }
            else if (profileTypeId == ApplicationConstants.UserProfileType.WorkerSubVendor) {
                return getSubVendorProfile(profileId);
            } else {
                return null;
            }
        }

        // Queries

        function getLoginInfo(id) {
            return phoenixapi.query("Contact/LoginInfo?loginUserId=" + id);
        }

        function get(id) {
            var callback = function () {
                return phoenixapi.query("UserProfile/" + id);
            };

            return fetch(id, callback);
        }

        function searchContactsST(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('Contact/Search?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function searchContactsWithDocumentCounts(tableState, oDataParams) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('Contact/SearchWithDocumentCounts?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getContact(contactId) {
            return phoenixapi.query("Contact/" + contactId);
        }

        function getContactProfiles(contactId) {
            return phoenixapi.query("Contact/" + contactId + "/getContactProfiles");
        }

        // get all by profile type
        function searchCanadianIncProfiles() {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerCanadianInc + "/getUserProfileTypes");
        }
        function searchWorkerUnitedStatesW2Profiles() {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 + "/getUserProfileTypes");
        }
        function searchWorkerUnitedStatesLLCProfiles() {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC + "/getUserProfileTypes");
        }
        function searchSubVendorProfiles() {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerSubVendor + "/getUserProfileTypes");
        }
        function searchProfiles(organizationId) {
            return phoenixapi.query("UserProfile/" + 0 + "/getUserProfileTypes?organizationId=" + organizationId);
        }

        function searchInternalProfiles(organizationId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.Internal + "/getUserProfileTypes?organizationId=" + organizationId);
        }

        function searchOrganizationalProfiles(organizationId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.Organizational + "/getUserProfileTypes?organizationId=" + organizationId);
        }

        function getCanadianIncProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerCanadianInc + "/getUserProfileType/" + profileId);
        }
        function getWorkerUnitedStatesW2Profile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 + "/getUserProfileType/" + profileId);
        }
        function getWorkerUnitedStatesLLCProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC + "/getUserProfileType/" + profileId);
        }
        function getSubVendorProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerSubVendor + "/getUserProfileType/" + profileId);
        }
        function getWorkerTempProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerTemp + "/getUserProfileType/" + profileId);
        }

        function getCanadianSPProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.WorkerCanadianSp + "/getUserProfileType/" + profileId);
        }

        function getInternalProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.Internal + "/getUserProfileType/" + profileId);
        }

        function getOrganizationalProfile(profileId) {
            return phoenixapi.query("UserProfile/" + ApplicationConstants.UserProfileType.Organizational + "/getUserProfileType/" + profileId);
        }

        function getProfilesForOrganization(organizationId, tableState, oDataParams) {
            var tableStateParams = (tableState && tableState !== undefined ? SmartTableService.generateRequestObject(tableState).url() : '');
            return phoenixapi.query("UserProfile/getProfilesForOrganization/" + organizationId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }

        function getListUserProfileInternal(oDataParams) {
            var internalDataParams = oreq.request()
                .withExpand(['Contact'])
                .withSelect(['Id',
                    'ProfileStatusId',
                    'Contact/Id',
                    'Contact/FullName'
                ]).url();
            oDataParams = oDataParams || internalDataParams;

            return phoenixapi.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getContactsForOrganization(organizationId, oDataParams) {
            return phoenixapi.query("UserProfile/getProfilesForOrganization/" + organizationId + '?' + oDataParams);
        }

        function getOrganizationsForContact(contactId, oDataParams) {
            return phoenixapi.query("UserProfile/getOrganizationsForContact/" + contactId);
        }

        // Searches | Concern: These searches only return FirstOrDefault. Not really a search
        function searchUserProfile(email) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=0&primaryEmail=" + email); // new
        }

        function searchOrganizationalProfile(criteria) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.Organizational + "&primaryEmail=" + criteria.PrimaryEmail);
        }

        function searchInternalProfile(criteria) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.Internal + "&primaryEmail=" + criteria.PrimaryEmail);
        }

        function searchWorkerProfile(criteria) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + criteria.ProfileTypeId + "&primaryEmail=" + criteria.PrimaryEmail);
        }

        function searchAllWorkerProfile(primaryEmail) {
            return phoenixapi.query("UserProfile/getUserProfilesByPrimaryEmail?primaryEmail=" + primaryEmail + "&$orderby=Contact/FirstName,Contact/LastName,Contact/Id");
        }

        function searchWorkerCanadianIncProfile(email) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.WorkerCanadianInc + "&primaryEmail=" + email);
        }
        function searchWorkerUnitedStatesLLCProfile(email) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC + "&primaryEmail=" + email);
        }
        function searchWorkerUnitedStatesW2Profile(email) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.WorkerUnitedStatesW2 + "&primaryEmail=" + email);
        }
        function searchWorkerSubVendorProfile(email) {
            return phoenixapi.query("UserProfile/getUserProfileByProfileTypeIdAndPrimaryEmail?profileTypeId=" + ApplicationConstants.UserProfileType.WorkerSubVendor + "&primaryEmail=" + email);
        }

        // Commands

        function saveContact(contact) {
            return phoenixapi.command('SaveContact', contact);
        }

        function userProfileSetPrimary(contactId, profileId) {
            return phoenixapi.command('UserProfileSetPrimary', { WorkflowPendingTaskId: -1, ContactId: contactId, ProfileId: profileId });
        }

        function sendInvitation(primaryEmail, contactId, firstName, profileTypeId, profileId, cultureId) {
            var command = {
                WorkflowPendingTaskId: -1,
                ContactId: contactId,
                PrimaryEmail: primaryEmail,
                ProfileTypeId: profileTypeId,
                ProfileId: profileId,
                FirstName: firstName,
                CultureId: cultureId
            };
            return phoenixapi.command("InviteContact", command);
        }

        function discardProfile(command) {
            return phoenixapi.command('UserProfileStatusToDiscard', command);
        }

        ///removeInactiveProfile(profileArray, 2,243,355);
        ///removeInactiveProfile(profileArray, [2,243,355]);
        function removeInactiveProfileWithConfig(config, profiles, exceptionIds) {
            var inactiveProfileStatusIds = [2, 9, 10]; //Inactive, Pending Inactive, Pending Active
            var settings = angular.extend({ profileStatusId: 'ProfileStatusId', id: 'Id' }, config);
            var exceptionProfileIds = _.uniq(_.isArray(exceptionIds) ? exceptionIds : _.slice(arguments, 2));
            _.remove(profiles, function (profile) {
                return _.indexOf(inactiveProfileStatusIds, profile[settings.profileStatusId]) > -1 && _.indexOf(exceptionProfileIds, profile[settings.id]) < 0;
            });
        }

        function removeInactiveProfile(profiles, exceptionIds) {
            service.removeInactiveProfileWithConfig(null, profiles, exceptionIds);
        }

        function checkProfileTypeExists(profileTypeId, profileList) {
            return _.filter(profileList, function (item) { return item == profileTypeId; }).length > 0;
        };

        function canAddProfile(profileTypeId, profileList) {
            switch (profileTypeId) {
                case ApplicationConstants.UserProfileType.Internal:
                case ApplicationConstants.UserProfileType.WorkerTemp:
                case ApplicationConstants.UserProfileType.WorkerCanadianSp:
                case ApplicationConstants.UserProfileType.WorkerUnitedStatesW2:
                    return !checkProfileTypeExists(profileTypeId, profileList);
                default:
                    return true;
            }
        }

        return service;
    }

}(angular));