(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingTimesheetsClient/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.timesheetPendingClientReview.noTSPendingClientReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetPendingClientReview.multipleTSPendingClientReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetPendingClientReview.oneTSPendingClientReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'ngtwo.m';
    var toParams = { p: 'timesheet/search/pending-client-review' }

    var predicate = {
        TimeSheetStatusId: ['3'],
    };
    var searchNames = [
    ];

    var selectList = ['Id'];
    //var selectList = ['TaskId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingTimesheetsClient', {
                title: 'dashboard.timesheetPendingClientReview.tSPendingClientReviewWidgetTitle',
                description: 'dashboard.timesheetPendingClientReview.tSPendingClientReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.All,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingTimesheetsClientController',
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

    WidgetPendingTimesheetsClientController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingTimesheetsClientController($state, WidgetUtils, items, phxLocalizationService) {
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
        .controller('WidgetPendingTimesheetsClientController', WidgetPendingTimesheetsClientController)
        ;

})();