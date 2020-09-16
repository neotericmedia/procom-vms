(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/declinedOrganizations/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.organizationDeclined.noDeclinedOrgMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationDeclined.multipleDeclinedOrgMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.organizationDeclined.oneDeclinedOrgMessage\' | phxTranslate"></a></div>';

    var toState = 'org.declined';

    var predicate = {
        OrganizationStatusId: ["'8'"],
    };
    var searchNames = [
        {
            type: '0',
            value: ["'8'"],
            text: 'Declined',
            property: 'OrganizationStatusId',
        }
    ];
    var selectList = ['Id,OrganizationStatusId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('DeclinedOrganizations', {
                title: 'dashboard.organizationDeclined.orgDeclinedWidgetTitle',
                description: 'dashboard.organizationDeclined.orgDeclinedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetDeclinedOrganizationsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'OrgApiService', function (WidgetUtils, OrgApiService) {
                        return WidgetUtils.getItems2(OrgApiService.getListOrganizationsDeclined, predicate, selectList);
                    }],
                }
            });
    }

    //-------------------------------------------------------------------------------

    WidgetDeclinedOrganizationsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetDeclinedOrganizationsController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;
        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'organization/search/declined' });;
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
        .controller('WidgetDeclinedOrganizationsController', WidgetDeclinedOrganizationsController)
        ;

})();