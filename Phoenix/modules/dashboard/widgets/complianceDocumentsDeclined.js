(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/complianceDocumentsDeclined/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.documentDeclined.noDocDeclinedMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.documentDeclined.multipleDocDeclinedMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.documentDeclined.oneDocDeclinedMessage\' | phxTranslate"></a></div>';

    var toState = 'ngtwo.m';
    var toParams = { p: 'compliance/search/declined-documents' };

    var predicate = {
    };
    var searchNames = [
    ];

    var selectList = ['Id'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {
        dashboardProviderInstance
            .widget('ComplianceDocumentDeclined', {
                title: 'dashboard.documentDeclined.docDeclinedWidgetTitle', 
                description: 'dashboard.documentDeclined.docDeclinedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetComplianceDocumentDeclinedController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'ComplianceDocumentRuleApiService', function (WidgetUtils, ComplianceDocumentRuleApiService) {
                        return WidgetUtils.getItems(ComplianceDocumentRuleApiService.getListComplianceDocumentDeclined, predicate, selectList);
                    }],
                }
            });
    }

    //-------------------------------------------------------------------------------

    WidgetComplianceDocumentDeclinedController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetComplianceDocumentDeclinedController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            WidgetUtils.setTableState(toState, predicate, searchNames);
            $state.go(toState, toParams);
        };
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
        //$templateCache.put(editTemplatePath, editTemplate);
    }

    //-------------------------------------------------------------------------------

    SeedTableState.$inject = ['WidgetUtils'];

    function SeedTableState(WidgetUtils) {
        WidgetUtils.setTableState(toState, predicate, searchNames);
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetComplianceDocumentDeclinedController', WidgetComplianceDocumentDeclinedController)
        ;

})();