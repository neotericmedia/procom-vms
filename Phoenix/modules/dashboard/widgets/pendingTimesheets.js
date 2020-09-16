(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingTimesheets/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.timesheetPendingReview.noTSPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetPendingReview.multipleTSPendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetPendingReview.oneTSPendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'ngtwo.m';
    var toParams = { p: 'timesheet/search/pending-review' }

    var predicate = {
        TimeSheetStatusId: ['8'],
    };
    var searchNames = [
    ];

    var selectList = ['Id'];
    //var selectList = ['TaskId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingTimesheets', {
                title: 'dashboard.timesheetPendingReview.tSPendingReviewWidgetTitle',
                description: 'dashboard.timesheetPendingReview.tSPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.All,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingTimesheetsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'WorkflowApiService', 'TimesheetApiService', function (WidgetUtils, WorkflowApiService, TimesheetApiService) {
                        return WidgetUtils.getItems2(TimesheetApiService.getTimesheetsAndWorkOrdersByPendingTask, predicate, selectList);
                    }],
                },
                //edit: {
                //    templateUrl: editTemplatePath,
                //}
            });
    }

    //-------------------------------------------------------------------------------

    WidgetPendingTimesheetsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingTimesheetsController($state, WidgetUtils, items, phxLocalizationService) {
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
        //.run(SeedTableState)
        .controller('WidgetPendingTimesheetsController', WidgetPendingTimesheetsController)
        ;

})();