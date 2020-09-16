(function (services) {
    'use strict';

    var serviceId = 'OrgApiService';

    angular.module('phoenix.org.services').factory(serviceId, ['phoenixapi', 'common', 'SmartTableService', OrgApiService]);

    function OrgApiService(phoenixapi, common, SmartTableService) {
        common.setControllerName(serviceId);

        var service = {
            //  Queries
            isExistsOrganizationLegalName: isExistsOrganizationLegalName,
            isExistsOrganizationCode: isExistsOrganizationCode,
            //  PageResult
            getOrganizations: getOrganizations,
            getListOriginalOrganizations: getListOriginalOrganizations,
            getOrganizationWithDocumentCountList: getOrganizationWithDocumentCountList,
            getListOfOrganizationsForUserProfile: getListOfOrganizationsForUserProfile,
            getListOrganizationsInPendingReviewStatus: getListOrganizationsInPendingReviewStatus,
            getListParentOrganizations: getListParentOrganizations,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRoleOrLimitedLiabilityCompanyRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRoleOrLimitedLiabilityCompanyRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveLimitedLiabilityCompanyRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveLimitedLiabilityCompanyRole,
            getListOrganizationsOriginalWithActiveNonInternalRole: getListOrganizationsOriginalWithActiveNonInternalRole,
            getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRoleOrSubVendorRole: getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRoleOrSubVendorRole,
            getListOrganizationsWithRabatesAndFees: getListOrganizationsWithRabatesAndFees,
            getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getListGarnisheePayToGroup: getListGarnisheePayToGroup,
            getListUserProfileInternal: getListUserProfileInternal,
            //  SingleResult
            getByOrganizationId: getByOrganizationId,
            getByOrganizationIndependentContractorRoleId: getByOrganizationIndependentContractorRoleId,
            getByOrganizationClientRoleId: getByOrganizationClientRoleId,
            getByOrganizationInternalRoleId: getByOrganizationInternalRoleId,
            getByOrganizationSubVendorRoleId: getByOrganizationSubVendorRoleId,
            getByOrganizationLimitedLiabilityCompanyRoleId: getByOrganizationLimitedLiabilityCompanyRoleId,


            getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getSingleVmsFeeHeaderByVersion: getSingleVmsFeeHeaderByVersion,
            getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization: getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization,
            getSingleRebateHeaderByVersion: getSingleRebateHeaderByVersion,
            //  Commands
            organizationNew: organizationNew,
            organizationNewOnQuickAdd: organizationNewOnQuickAdd,
            organizationSave: organizationSave,
            organizationSubmit: organizationSubmit,
            organizationFinalize: organizationFinalize,
            organizationInternalRoleDateRollOver: organizationInternalRoleDateRollOver,
            garnisheeNew: garnisheeNew,
            garnisheeSubmit: garnisheeSubmit,
            advanceNew: advanceNew,
            advanceSubmit: advanceSubmit,
            getListOrganizationsDeclined: getListOrganizationsDeclined,
            deleteInternalOrganizationImage: deleteInternalOrganizationImage,
            organizationInviteClientConsultants: organizationInviteClientConsultants
        };

        return service;
        //  Queries
        function isExistsOrganizationLegalName(name, organizationId) {
            return phoenixapi.query('org/isExistsOrganizationLegalName?name=' + name + (organizationId ? "&organizationId=" + organizationId : ""));
        }
        function isExistsOrganizationCode(code, organizationId) {
            return phoenixapi.query('org/isExistsOrganizationCode?code=' + code + (organizationId ? "&organizationId=" + organizationId : ""));
        }
        function getOrganizations(oDataParams) {
            return phoenixapi.query('org/getOrganizations' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOriginalOrganizations(oDataParams) {
            return phoenixapi.query('org/getListOriginalOrganizations?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }

        function getOrganizationWithDocumentCountList(oDataParams) {
            return phoenixapi.query('org/getOrganizationWithDocumentCountList?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }

        function getListOrganizationsDeclined(oDataParams) {
            return phoenixapi.query('org/getListOrganizationsInDraftAndDeclined?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getListOfOrganizationsForUserProfile(oDataParams) {
            return phoenixapi.query('org/getListOfOrganizationsForUserProfile?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getListOrganizationsInPendingReviewStatus(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsInPendingReviewStatus?' + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getListParentOrganizations(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'Name', 'IsDraft']).url();
            return phoenixapi.query('org/getListParentOrganizations' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRoleOrSubVendorRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientOrIndependentContractorRoleOrSubVendorRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }

        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRoleOrLimitedLiabilityCompanyRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveIndependentContractorRoleOrLimitedLiabilityCompanyRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveLimitedLiabilityCompanyRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveLimitedLiabilityCompanyRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsOriginalWithActiveNonInternalRole(oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            return phoenixapi.query('org/getListOrganizationsOriginalWithActiveNonInternalRole' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListOrganizationsWithRabatesAndFees(tableState, oDataParams) {
            oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code']).url();
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('org/getListOrganizationsWithRabatesAndFees?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + tableStateParams);
        }
        function getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId, oDataParams) {
            return phoenixapi.query('org/getListOrganizationClientRolesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(tableState, oDataParams, organizationId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('org/getListAdvancesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization(tableState, oDataParams, organizationId) {
            var tableStateParams = SmartTableService.generateRequestObject(tableState).url();
            return phoenixapi.query('org/getListGarnisheesByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '?' + (oDataParams && oDataParams !== undefined ? (oDataParams + '&') : '') + '&' + tableStateParams);
        }
        function getListGarnisheePayToGroup(oDataParams) {
            return phoenixapi.query('org/getListGarnisheePayToGroup' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        function getListUserProfileInternal(oDataParams) {
            var filter = oreq.filter('Contact/UserStatusId').eq("'1'");
            var internalDataParams = oreq.request().withExpand(['Contact']).withSelect(['Id', 'Contact/FullName']).withFilter(filter).url();
            oDataParams = oDataParams || internalDataParams;

            return phoenixapi.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : ''));
        }
        //  SingleResult
        function getByOrganizationId(organizationId, oDataParams) {
            return phoenixapi.query('org?id=' + organizationId + (oDataParams && oDataParams !== undefined ? ('&' + oDataParams) : ''));
        }
        function getByOrganizationIndependentContractorRoleId(roleId, oDataParams) {
            return phoenixapi.query('org/getByOrganizationIndependentContractorRoleId/' + roleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')
            );
        }
        function getByOrganizationClientRoleId(roleId, oDataParams) {
            return phoenixapi.query('org/getByOrganizationClientRoleId/' + roleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')
            );
        }
        function getByOrganizationInternalRoleId(roleId, oDataParams) {
            return phoenixapi.query('org/getByOrganizationInternalRoleId/' + roleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')
            );
        }
        function getByOrganizationSubVendorRoleId(roleId, oDataParams) {
            return phoenixapi.query('org/getByOrganizationSubVendorRoleId/' + roleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')
            );
        }
        function getByOrganizationLimitedLiabilityCompanyRoleId(roleId, oDataParams) {
            return phoenixapi.query('org/getByOrganizationLimitedLiabilityCompanyRoleId/' + roleId + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')
            );
        }
        function getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId) {
            return phoenixapi.query('org/getSingleOrganizationInternalRoleByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId);
        }
        function getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId, advanceId) {
            return phoenixapi.query('org/getSingleAdvanceDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '/advance/' + advanceId);
        }
        function getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId, garnisheeId) {
            return phoenixapi.query('org/getSingleGarnisheeDetailByOriginalAndStatusIsAtiveOrPendingChangeOrganization/organization/' + organizationId + '/garnishee/' + garnisheeId);
        }
        function getSingleVmsFeeHeaderByVersion(vmsFeeVersionId) {
            return phoenixapi.query('org/getSingleVmsFeeHeaderByVersion/vmsFeeVersion/' + vmsFeeVersionId);
        }
        function getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization(organizationId) {
            return phoenixapi.query('org/getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization/' + organizationId);
        }
        function getSingleRebateHeaderByVersion(rebateVersionId) {
            return phoenixapi.query('org/getSingleRebateHeaderByVersion/rebateVersion/' + rebateVersionId);
        }
        //  Commands 
        function organizationNew(command) {
            return phoenixapi.command('OrganizationNew', command);
        }
        function organizationNewOnQuickAdd(command) {
            return phoenixapi.command('OrganizationNewOnQuickAdd', command);
        }
        function organizationSave(command) {
            return phoenixapi.command('OrganizationSave', command);
        }
        function organizationSubmit(command) {
            return phoenixapi.command('OrganizationSubmit', command);
        }
        function organizationFinalize(command) {
            return phoenixapi.command('OrganizationFinalize', command);
        }
        function organizationInternalRoleDateRollOver(command) {
            return phoenixapi.command('OrganizationInternalRoleDateRollOver', command);
        }
        function garnisheeNew(command) {
            return phoenixapi.command("GarnisheeNew", command);
        }
        function garnisheeSubmit(command) {
            return phoenixapi.command("GarnisheeSubmit", command);
        }
        function advanceNew(command) {
            return phoenixapi.command("AdvanceNew", command);
        }
        function advanceSubmit(command) {
            return phoenixapi.command("AdvanceSubmit", command);
        }
        function deleteInternalOrganizationImage(command) {
            return phoenixapi.command("DeleteInternalOrganizationImage", command);
        }
        function organizationInviteClientConsultants(command) {
            return phoenixapi.command("OrganizationInviteClientConsultants", command);
        }
    }
}(Phoenix.Services));