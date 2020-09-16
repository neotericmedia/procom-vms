(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingOrganizationDocuments/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.organizationDocumentPendingReview.noOrgDocPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationDocumentPendingReview.multipleOrgDocPendingReviewMessage\' | phxTranslate:vm.orgCount:vm.docCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationDocumentPendingReview.oneOrgDocPendingReviewMessage\' | phxTranslate:vm.docCount"></a></div>';

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingOrganizationDocuments', {
                title: 'dashboard.organizationDocumentPendingReview.orgDocPendingReviewWidgetTitle',
                description: 'dashboard.organizationDocumentPendingReview.orgDocPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingOrganizationDocumentsController',
                controllerAs: 'vm',
                resolve: {
                    orgs: ['OrgApiService', function (OrgApiService) {
                        return OrgApiService.getOrganizationWithDocumentCountList("$inlinecount=allpages&$select=Id,PendingComplianceDocumentCount&$filter=(OrganizationStatusId eq " + ApplicationConstants.OrganizationStatus.PendingReview + ")").then(function (r) {
                            return r;
                        });
                    }],
                },
            });
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
    }

    //-------------------------------------------------------------------------------

    WidgetPendingOrganizationDocumentsController.$inject = ['$state', 'orgs', 'phxLocalizationService'];

    function WidgetPendingOrganizationDocumentsController($state, orgs, phxLocalizationService) {
        this.orgCount = orgs.Items.length;
        this.docCount = _.sumBy(orgs.Items, function (o) { return o.PendingComplianceDocumentCount; });
        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'organization/search/pendingDocuments' });;
        };
    }

    //-------------------------------------------------------------------------------



    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetPendingOrganizationDocumentsController', WidgetPendingOrganizationDocumentsController)
        ;
})();