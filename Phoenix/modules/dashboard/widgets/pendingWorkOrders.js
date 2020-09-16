(function () {
    'use strict';


    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingWorkOrders/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.workOrderPendingReview.noWOPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderPendingReview.multipleWOPendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderPendingReview.oneWOPendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'workorder.pendingApproval';

    var predicate = {
        // Filtering by WorkOrderVersionStatusId is meaningless because a WorkOrder in the recordset may be represented by a WorkOrderVersion with another StatusId depending on WorkOrderVersionEffectiveDate.
        //WorkOrderVersionStatusId: ['5'],
    };
    var searchNames = [
        // The Status column on the original Search screen displays WorkOrderStatus (not WorkOrderVersionStatus) and pre-setting its filter caption may be confusing.
        //{
        //    type: '0',
        //    value: ['5'],
        //    text: 'Pending Approval',
        //    property: 'WorkOrderStatusId',
        //},
    ];
    var selectList = ['AssignmentId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingWorkOrders', {
                title: 'dashboard.workOrderPendingReview.wOPendingReviewWidgetTitle',
                description: 'dashboard.workOrderPendingReview.wOPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingWorkOrdersController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'AssignmentApiService', function (WidgetUtils, AssignmentApiService) {
                        return WidgetUtils.getItems(AssignmentApiService.getSearchByTableState, predicate, selectList, toState);
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

    WidgetPendingWorkOrdersController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingWorkOrdersController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'workorder/search/pending-review' });;
        };
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
        .run(SeedTableState)
        .controller('WidgetPendingWorkOrdersController', WidgetPendingWorkOrdersController)
        ;

})();