(function (angular) {
    'use strict';

    angular.module('phoenix.org.controllers').controller('OrgRebatesAndFeesDetailsController', OrgRebatesAndFeesDetailsController);

    OrgRebatesAndFeesDetailsController.$inject = ['$stateParams', 'NavigationService', 'CodeValueService', 'OrgApiService'];

    function OrgRebatesAndFeesDetailsController($stateParams, NavigationService, CodeValueService, OrgApiService) {

        var self = this;

        // TODO AF20160419 Magic numbers
        var typeVmsFee = ApplicationConstants.VmsFeeRebate.VmsFee;
        var typeRebate = ApplicationConstants.VmsFeeRebate.Rebate;

        NavigationService.setTitle('vmsrebate-viewedit');

        var organizationRoleStatusTypeList = CodeValueService.getCodeValues(CodeValueGroups.OrganizationRoleStatusType, true);
        var rebateTypeList = CodeValueService.getCodeValues(CodeValueGroups.RebateType, true); // It is the same for both Rebates and VMS Fees
        var lineOfBusinessList = CodeValueService.getCodeValues(CodeValueGroups.LineOfBusiness, true);
        var rebateHeaderStatusList = CodeValueService.getCodeValues(CodeValueGroups.RebateHeaderStatus, true);
        var vmsFeeHeaderStatusList = CodeValueService.getCodeValues(CodeValueGroups.VmsFeeHeaderStatus, true);

        // Query the server
        self.loadItemsPromise = OrgApiService.getRebatesAndFeesDetailsByOriginalAndStatusIsAtiveOrPendingChangeOrganization($stateParams.organizationId)
            .then(function (data) {
                self.organizationId = data.Organization.Id;
                self.organizationName = data.Organization.DisplayName;
                self.organizationStatus = data.Organization.StatusId && (_.find(organizationRoleStatusTypeList, ['id', data.Organization.StatusId]).text);

                function mapHeader(type, header) {
                    var version = header.Versions[0];
                    var row = {
                        headerId: header.Id,
                        versionId: version.Id,
                        type: type,
                        feeType: type == typeVmsFee ? 'VMS Fee' : (type == typeRebate ? 'Rebate' : null),
                        description: header.Description,
                        lob: _.find(lineOfBusinessList, ['id', version.LineOfBusinessId]).text,
                        rebateTypeId: version.RebateTypeId,
                        rateType: _.find(rebateTypeList, ['id', version.RebateTypeId]).text,
                        rate: version.Rate,
                        status: _.find(rebateHeaderStatusList, ['id', header.RebateHeaderStatusId]).text,
                    };
                    return row;
                }

                var rebates = data.Rebates;
                rebates.Type = typeRebate;
                var rebateRows = _.map(rebates.Headers, _.curry(mapHeader)(rebates.Type));
                var vmsFees = data.VmsFees;
                vmsFees.Type = typeVmsFee;
                var vmsFeeRows = _.map(vmsFees.Headers, _.curry(mapHeader)(vmsFees.Type));

                self.items = _.concat(rebateRows, vmsFeeRows);

                NavigationService.setTitle('vmsrebate-viewedit', [self.organizationName]);
            },
            function (error) {
                console.log(error);
            }
        );

        self.displayRate = function (item) {
            return item.rebateTypeId === ApplicationConstants.RebateType.Amount ? ('$' + item.rate) : (item.rebateTypeId === ApplicationConstants.RebateType.Percentage ? (item.rate + '%') : null);
        };

        self.sref = function (item) {
            var rebateSref = 'org.rebate({ rebateHeaderId: ' + item.headerId + ', rebateVersionId:' + item.versionId + ', orgId:' + self.organizationId + '})';
            var vmsFeeeSref = 'org.vmsfee({ vmsFeeHeaderId: ' + item.headerId + ', vmsFeeVersionId:' + item.versionId + ', orgId:' + self.organizationId + '})';
            return item.type == typeVmsFee ? vmsFeeeSref : (item.type == typeRebate ? rebateSref : null);
        };
    }

})(angular);