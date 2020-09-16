(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/PendingSubscriptions/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.subscriptionPendingReview.noSubscriptionPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.subscriptionPendingReview.multipleSubscriptionPendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.subscriptionPendingReview.oneSubscriptionPendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'access.pendingSubscriptions';

    var predicate = {
        AccessSubscriptionStatusId: ["'" + ApplicationConstants.AccessSubscriptionStatus.PendingReview + "'"],
    };
    var searchNames = [
        {
            type: '0',
            value: ["'" + ApplicationConstants.AccessSubscriptionStatus.PendingReview + "'"],
            text: 'Pending Review',
            property: 'AccessSubscriptionStatusId',
        }
    ];

    var selectList = ['Id'];
    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingSubscriptions', {
                title: 'dashboard.subscriptionPendingReview.subscriptionPendingReviewWidgetTitle',
                description: 'dashboard.subscriptionPendingReview.subscriptionPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingSubscriptionsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'AccessSubscriptionApiService', function (WidgetUtils, AccessSubscriptionApiService) {
                        return WidgetUtils.getItems2(AccessSubscriptionApiService.getPendingAccessSubscriptions, predicate, selectList);
                    }],
                },
                //edit: {
                //    templateUrl: editTemplatePath,
                //}
            });
    }

    //-------------------------------------------------------------------------------

    WidgetPendingSubscriptionsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingSubscriptionsController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'contact/subscriptions/pending-review' });
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
        .run(SeedTableState)
        .controller('WidgetPendingSubscriptionsController', WidgetPendingSubscriptionsController)
        ;

})();