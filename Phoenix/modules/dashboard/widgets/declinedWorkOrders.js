(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/declinedWorkOrders/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.workOrderDeclined.noDeclinedWOMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderDeclined.multipleDeclinedWOMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderDeclined.oneDeclinedWOMessage\' | phxTranslate"></a></div>';

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
            .widget('DeclinedWorkOrders', {
                title: 'dashboard.workOrderDeclined.wODeclinedWidgetTitle',
                description: 'dashboard.workOrderDeclined.wODeclinedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetDeclinedWorkOrdersController',
                controllerAs: 'vm',
                resolve: {
                    noOfDeclinedWorkOrders: ['AssignmentApiService', function (AssignmentApiService) {
                        return AssignmentApiService.getNoOfDeclinedWorkOrders().then(function (r) {
                            return r.Count || 0;
                        });
                    }],
                }
            });
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
        //$templateCache.put(editTemplatePath, editTemplate);
    }

    //-------------------------------------------------------------------------------

    WidgetDeclinedWorkOrdersController.$inject = ['$state', 'noOfDeclinedWorkOrders', 'phxLocalizationService'];

    function WidgetDeclinedWorkOrdersController($state, noOfDeclinedWorkOrders, phxLocalizationService) {
        this.itemCount = noOfDeclinedWorkOrders;
        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'workorder/search/declined' });
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
        .controller('WidgetDeclinedWorkOrdersController', WidgetDeclinedWorkOrdersController)
        ;
})();