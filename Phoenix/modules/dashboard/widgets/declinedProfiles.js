(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/declinedProfiles/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.profileDeclined.noDeclinedProfileMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profileDeclined.multipleDeclinedProfileMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.profileDeclined.oneDeclinedProfileMessage\' | phxTranslate"></a></div>';

    var toState = 'ContactCreate.declined';

    var predicate = { 
    };
    var searchNames = [
        {
          
        }
    ];
    var selectList = ['UserProfileId'];

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];
  
    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {
       
        dashboardProviderInstance
            .widget('DeclinedProfiles', {
                title: 'dashboard.profileDeclined.profileDeclinedWidgetTitle', 
                description: 'dashboard.profileDeclined.profileDeclinedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetDeclinedProfilesController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'contactService', function (WidgetUtils, contactService) {
                        return WidgetUtils.getItems(contactService.getDeclinedProfiles, predicate, selectList);
                    }],
                }              
            });
    }

    //-------------------------------------------------------------------------------

    WidgetDeclinedProfilesController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];

    function WidgetDeclinedProfilesController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;
         
        this.goToSearch = function () {
            
            $state.go('ngtwo.m', { p: 'contact/search/declined' });;
            //WidgetUtils.setTableState(toState, predicate, searchNames);
            //$state.go(toState);
        };
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate, searchNames);
        //$templateCache.put(editTemplatePath, editTemplate);
    }

    //-------------------------------------------------------------------------------

    SeedTableState.$inject = ['WidgetUtils'];

    function SeedTableState(WidgetUtils) {
        WidgetUtils.setTableState(toState, predicate);
    }

    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
      .run(RegisterWidget)
      .run(CacheTemplates)
      .run(SeedTableState)
      .controller('WidgetDeclinedProfilesController', WidgetDeclinedProfilesController)
    ; 
     
})();