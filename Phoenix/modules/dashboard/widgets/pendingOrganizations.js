(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingOrganizations/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.organizationPendingReview.noProfilePendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationPendingReview.multipleProfilePendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationPendingReview.oneProfilePendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'org.pendingReview';

    var predicate = {
        IsPendingReview: true,
    };
    var searchNames = [];
    var selectList = ['Id'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingOrganizations', {
                title: 'dashboard.organizationPendingReview.profilePendingReviewWidgetTitle',
                description: 'dashboard.organizationPendingReview.profilePendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingOrganizationsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'OrgApiService', function (WidgetUtils, OrgApiService) {
                        return WidgetUtils.getItems2(OrgApiService.getListOriginalOrganizations, predicate, selectList);
                    }],
                }
            });
    }

    //-------------------------------------------------------------------------------

    WidgetPendingOrganizationsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingOrganizationsController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'organization/search/pending-review' });;
        };
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate, searchNames);
        //$templateCache.put(editTemplatePath, editTemplate);
    }

    //-------------------------------------------------------------------------------

    SeedTableState.$inject = ['WidgetUtils'];

    function SeedTableState(WidgetUtils) {
        WidgetUtils.setTableState(toState, predicate);
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .run(SeedTableState)
        .controller('WidgetPendingOrganizationsController', WidgetPendingOrganizationsController)
        ;

})();