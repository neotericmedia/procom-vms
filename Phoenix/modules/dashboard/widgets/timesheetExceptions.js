(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/timesheetExceptions/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.timesheetExceptionPendingReview.noTSExceptionsPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetExceptionPendingReview.multipleTSExceptionsPendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.timesheetExceptionPendingReview.oneTSExceptionsPendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'ngtwo.m';
    var toParams = { p: 'timesheet/exceptions' }

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('TimesheetExceptions', {
                title: 'dashboard.timesheetExceptionPendingReview.tSExceptionsPendingReviewWidgetTitle',
                description: 'dashboard.timesheetExceptionPendingReview.tSExceptionsPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetTimesheetExceptionsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'TimesheetApiService', function (WidgetUtils, TimesheetApiService) {
                        return WidgetUtils.getItems(TimesheetApiService.getTimesheetExceptionsLite);
                    }],
                },
                //edit: {
                //    templateUrl: editTemplatePath,
                //}
            });
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
        //$templateCache.put(editTemplatePath, editTemplate);
    }

    //-------------------------------------------------------------------------------

    WidgetTimesheetExceptionsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetTimesheetExceptionsController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            $state.go(toState, toParams);
        };
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetTimesheetExceptionsController', WidgetTimesheetExceptionsController)
        ;

})();