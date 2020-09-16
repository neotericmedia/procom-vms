(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/timesheetDeclined/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.timesheetDeclined.noDeclinedTSMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetDeclined.multipleDeclinedTSMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetDeclined.oneDeclinedTSMessage\' | phxTranslate"></a></div>';

    var toState = 'ngtwo.m';
    var toParams = { p: 'timesheet/search/declined' }

    var predicate = {
    };
    var searchNames = [
    ];

    var selectList = ['Id'];
    //var selectList = ['TaskId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('TimesheetDeclined', {
                title: 'dashboard.timesheetDeclined.tSDeclinedWidgetTitle',
                description: 'dashboard.timesheetDeclined.tSDeclinedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.All,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetTimesheetDeclinedController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'TimesheetApiService', function (WidgetUtils, TimesheetApiService) {
                        return WidgetUtils.getItems(TimesheetApiService.getTimesheetsDeclined, predicate, selectList);
                    }],
                },
                //edit: {
                //    templateUrl: editTemplatePath,
                //}
            });
    }

    //-------------------------------------------------------------------------------

    WidgetTimesheetDeclinedController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetTimesheetDeclinedController($state, WidgetUtils, items, phxLocalizationService) {
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
        .controller('WidgetTimesheetDeclinedController', WidgetTimesheetDeclinedController)
        ;

})();