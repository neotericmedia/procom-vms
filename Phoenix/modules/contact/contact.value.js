(function (ApplicationConstants) {
    'use strict';

    angular.module('phoenix.contact')
        .value('contactsTableParams', {
            selectedCount: 0,
            totalItemCount: 0,
            currentPage: 1,
            totalItems: 0,
            pageSize: 30,
            pageCount: 1,
            dataTargetItems: 'Items',
            dataTargetCount: 'Count',
            externalMethod: 'callServer',
        })
        .value('contactMessages', {
            existingFound: "We've found the following profiles with this email address. Remember, you can only add or edit profiles if there are no changes pending. Select to review, or add details to an existing contact.",
            existingNotFound: "We haven't found any profile with this email address."
        })
        .value('defaultContact', {

        })
        .value('profileTypeMapping', {
            tempWorker: {
                editMethod: 'getWorkerTempProfile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerTemp,
                requiredParams: []
            },
            organizational: {
                editMethod: 'getOrganizationalProfile',
                profileTypeId: ApplicationConstants.UserProfileType.Organizational,
                requiredParams: []
            },
            internal: {
                editMethod: 'getInternalProfile',
                profileTypeId: ApplicationConstants.UserProfileType.Internal,
                requiredParams: []
            },
            canadianIncWorker: {
                editMethod: 'getCanadianIncProfile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerCanadianInc,
                requiredParams: []
            },
            canadianSPWorker: {
                editMethod: 'getCanadianSPProfile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerCanadianSp,
                requiredParams: []
            },
            subVendorWorker: {
                editMethod: 'getSubVendorProfile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerSubVendor,
                requiredParams: []
            },
            unitedStatesLLCWorker: {
                editMethod: 'getWorkerUnitedStatesLLCProfile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC,
                requiredParams: []
            },
            unitedStatesW2Worker: {
                editMethod: 'getWorkerUnitedStatesW2Profile',
                profileTypeId: ApplicationConstants.UserProfileType.WorkerUnitedStatesW2,
                requiredParams: []
            },
        });
})(window.ApplicationConstants);