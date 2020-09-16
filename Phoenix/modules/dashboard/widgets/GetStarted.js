(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/getStarted/src/view.html';
    var viewTemplate = '<blockquote><p>{{msg.text}}</p></blockquote>';

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('ZZZ_getStarted', {
                title: 'dashboard.getStarted.getStartedWidgetTitle',
                description: 'dashboard.getStarted.getStartedWidgetDescription',
                category: ApplicationConstants.WidgetCategories.All,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'getStartedCtrl',
                controllerAs: 'vm',
            });
    }


    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
    }
    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .service('getStartedService', function () {
            var msgs = [
                'dashboard.getStarted.getStartedMessage'
            ];
            return {
                get: function () {
                    return {
                        text: msgs[Math.floor(Math.random() * msgs.length)],
                    };
                }
            };
        })
        .controller('getStartedCtrl', ["$scope", "getStartedService", "phxLocalizationService", function ($scope, getStartedService, phxLocalizationService) {
            $scope.msg = { text : phxLocalizationService.translate(getStartedService.get().text)} ;
        }]);

})();