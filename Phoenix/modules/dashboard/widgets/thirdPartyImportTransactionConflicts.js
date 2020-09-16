(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/thirdPartyImportTransactionConflicts/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.thirdPartyImportTransactionsWithConflicts.noThirdPartyImportTrnConflictMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div class="text-danger" ng-show="vm.hasError">{{vm.message}}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.thirdPartyImportTransactionsWithConflicts.multipleThirdPartyImportTrnConflictMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.thirdPartyImportTransactionsWithConflicts.oneThirdPartyImportTrnConflictMessage\' | phxTranslate"></a></div>';

    var toState = 'vms.management';

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('ThirdPartyImportTransactionConflicts', {
                title: 'dashboard.thirdPartyImportTransactionsWithConflicts.thirdPartyImportTrnConflictWidgetTitle',
                description: 'dashboard.thirdPartyImportTransactionsWithConflicts.thirdPartyImportTrnConflictWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetThirdPartyImportTransactionConflictsController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'TransactionApiService', function (WidgetUtils, TransactionApiService) {
                        return TransactionApiService.getVmsAllItems('').catch(function (error) {
                            return error.Message;
                        });;
                    }],
                },

            });
    }

    //-------------------------------------------------------------------------------

    WidgetThirdPartyImportTransactionConflictsController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];


    function WidgetThirdPartyImportTransactionConflictsController($state, WidgetUtils, items, phxLocalizationService) {
        this.message = 'There are currently no conflicts.';
        if (typeof items == 'string') {
            this.message = items;
            this.hasError = true;
            return;
        }

        var cnt = 0

        angular.forEach(items.Items, function (value, key) {
            cnt = cnt + value.DiscountConflictCount + value.ExpenseConflictCount + value.ConflictCount;
        });
        this.itemCount = cnt;

        this.goToSearch = function () {
            $state.go(toState);
        };
    }

    //-------------------------------------------------------------------------------

    CacheTemplates.$inject = ['$templateCache'];

    function CacheTemplates($templateCache) {
        $templateCache.put(viewTemplatePath, viewTemplate);
    }


    //-------------------------------------------------------------------------------

    angular.module('phoenix.widgets')
        .run(RegisterWidget)
        .run(CacheTemplates)
        .controller('WidgetThirdPartyImportTransactionConflictsController', WidgetThirdPartyImportTransactionConflictsController)
        ;

})();