(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/pendingProfiles/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.profilePendingReview.noProfilePendingReviewMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profilePendingReview.multipleProfilePendingReviewMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profilePendingReview.oneProfilePendingReviewMessage\' | phxTranslate"></a></div>';

    var toState = 'ContactCreate.pendingReview';

    var predicate = {
        UserStatusId: ApplicationConstants.ContactStatus.PendingReview, // 6 - because [usr].[fnContactSearch].[UserStatusId] is based on ContactStatus, not on UserProfileStatus
    };
    var searchNames = [{
        type: '0',
        value: ['Pending Review'],
        text: 'Pending Review',
        property: 'UserStatus',
    }];
    var selectList = ['ContactId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PendingProfiles', {
                title: 'dashboard.profilePendingReview.profilePendingReviewWidgetTitle',
                description: 'dashboard.profilePendingReview.profilePendingReviewWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPendingProfilesController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'ProfileApiService', function (WidgetUtils, ProfileApiService) {
                        return WidgetUtils.getItems(ProfileApiService.searchContactsST, predicate, selectList);
                    }],
                },
                //edit: {
                //    templateUrl: editTemplatePath,
                //}
            });
    }

    //-------------------------------------------------------------------------------

    WidgetPendingProfilesController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetPendingProfilesController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;

        this.goToSearch = function () {
            $state.go('ngtwo.m', { p: 'contact/search/pending-review' });;
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
        .controller('WidgetPendingProfilesController', WidgetPendingProfilesController)
        ;

})();