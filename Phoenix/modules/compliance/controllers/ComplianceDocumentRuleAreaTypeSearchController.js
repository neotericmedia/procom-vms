/*global Phoenix: false, console: false*/
(function (app, angular) {
    'use strict';

    var controllerId = 'ComplianceDocumentRuleAreaTypeSearchController';

    angular.module('phoenix.compliancedocumentrule.controllers').controller(controllerId, ['$state', 'common', 'NavigationService', 'ComplianceDocumentRuleApiService', 'CodeValueService',
            function ComplianceDocumentRuleAreaTypeSearchController($state, common, NavigationService, ComplianceDocumentRuleApiService, CodeValueService) {
                common.setControllerName(controllerId);
                var self = this;
                angular.extend(self, {
                    lists: {
                        industryTypeList: [],
                    },
                    load: function () {
                        NavigationService.setTitle('document-rules-manage');
                        this.lists.listComplianceDocumentRuleAreaType = CodeValueService.getCodeValues(CodeValueGroups.ComplianceDocumentRuleAreaType);
                    },
                    onGo: function (areaType) {
                        // $state.go('compliancedocument.ruleareatype.edit', { ruleAreaTypeId: areaType.id });
                        $state.go('ngtwo.m', { p: "compliance/document-rule/search/" + areaType.id });
                    }
                });
                self.load();
            }]);
})(Phoenix.App, angular);