(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingWorkOrderDocuments/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.workOrderDocumentPendingReview.noWODocPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderDocumentPendingReview.multipleWODocPendingReviewMessage\' | phxTranslate:vm.itemCount:vm.documentCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.workOrderDocumentPendingReview.oneWODocPendingReviewMessage\' | phxTranslate:vm.documentCount"></a></div>';

    var predicate = {
        WorkOrderStatusId: ['5'] // PendingReview
    };
    var selectList = ['AssignmentId', 'PendingComplianceDocumentCount'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        var oDataParams = oreq.request()
            .withSelect(selectList)
            .withFilter(oreq.filter().smartTableObjectConverter(predicate))
            .url();

        dashboardProviderInstance
            .widget('PendingWorkOrderDocuments', {
                title: 'dashboard.workOrderDocumentPendingReview.wODocPendingReviewWidgetTitle',
                description: 'dashboard.workOrderDocumentPendingReview.wODocPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingWorkOrderDocumentsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'AssignmentApiService', function (WidgetUtils, AssignmentApiService) {
                        return WidgetUtils.customGetItems(AssignmentApiService.getWorkOrdersWithDocumentCountForWidget, oDataParams);
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

    WidgetPendingWorkOrderDocumentsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingWorkOrderDocumentsController($state, WidgetUtils, items, phxLocalizationService) {

        this.itemCount = items && Array.isArray(items.Items) && items.Items.length;

        this.documentCount = !!this.itemCount &&
            items.Items.reduce(function (accumulator, item) {
                return accumulator + item.PendingComplianceDocumentCount;
            }, 0);

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'workorder/search/pending-documents' });
        };
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetPendingWorkOrderDocumentsController', WidgetPendingWorkOrderDocumentsController)
        ;

})();