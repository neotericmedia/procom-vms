(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingProfileDocuments/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.profilesDocumentPendingReview.noProfileDocPendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profilesDocumentPendingReview.multipleProfileDocPendingReviewMessage\' | phxTranslate:vm.itemCount:vm.documentCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profilesDocumentPendingReview.oneProfileDocPendingReviewMessage\' | phxTranslate:vm.documentCount"></a></div>';

    var predicate = {
        UserStatusId: ["6"],
    };
    var selectList = ['ContactId', 'UserStatusId', 'UserStatus', 'PendingComplianceDocumentCount'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingProfileDocuments', {
                title: 'dashboard.profilesDocumentPendingReview.profileDocPendingReviewWidgetTitle',
                description: 'dashboard.profilesDocumentPendingReview.profileDocPendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingProfileDocumentsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'ProfileApiService', function (WidgetUtils, ProfileApiService) {
                        return WidgetUtils.getAllItems(ProfileApiService.searchContactsWithDocumentCounts, predicate, selectList);
                    }],
                }
            });
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
    }

    //-------------------------------------------------------------------------------

    WidgetPendingProfileDocumentsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingProfileDocumentsController($state, WidgetUtils, items, phxLocalizationService) {

        this.itemCount = items && items.Count;

        this.documentCount = Array.isArray(items.Items) &&
            items.Items.reduce(function (count, item) {
                return count + item.PendingComplianceDocumentCount;
            }, 0);

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'contact/pending-documents' });
        };
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetPendingProfileDocumentsController', WidgetPendingProfileDocumentsController)
        ;

})();