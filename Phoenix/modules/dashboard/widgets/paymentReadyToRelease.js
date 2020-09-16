(function () {
    'use strict';

    var editTemplatePath = '/assets/dashboard/adf-custom-widget-edit.html';    
    var viewTemplatePath = '{widgetsPath}/paymentReadyToRelease/view.html';
    var viewTemplate = '<div ng-show="!vm.itemCount">{{ \'dashboard.paymentReadyForRelease.noPaymentsReadyForReleaseMessage\' | phxTranslate }}</div>';
    viewTemplate += '<div ng-show="vm.itemCount > 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.paymentReadyForRelease.multiplePaymentReadyForReleaseMessage\' | phxTranslate:vm.itemCount"></a></div>';
    viewTemplate += '<div ng-show="vm.itemCount === 1"><a href="javascript:;" ng-click="vm.goToSearch()" ng-bind-html="\'dashboard.paymentReadyForRelease.onePaymentReadyForReleaseMessage\' | phxTranslate"></a></div>';

    var toState = 'payment.pending';

    // Give AP more time to process ready payments. If Thursday or Friday then we make it 2 business days.
    var extraDays = (moment().day() === 4 || moment().day() === 5) ? 4 : 2;
    var extraDaysADP = (moment().day() === 4 || moment().day() === 5) ? 6 : 4;
    var releaseDate = moment().startOf('day').add(extraDays, 'days').format('YYYY-MM-DDTHH:mm:ss');
    var releaseDateADP = moment().startOf('day').add(extraDaysADP, 'days').format('YYYY-MM-DDTHH:mm:ss');

    //-------------------------------------------------------------------------------

    RegisterWidget.$inject = ['dashboardProviderInstance', 'phxLocalizationService'];

    function RegisterWidget(dashboardProviderInstance, phxLocalizationService) {

        dashboardProviderInstance
            .widget('PaymentReadyToRelease', {
                title: 'dashboard.paymentReadyForRelease.paymentsReadyForReleaseWidgetTitle',
                description: 'dashboard.paymentReadyForRelease.paymentsReadyForReleaseWidgetDescription',
                category: ApplicationConstants.WidgetCategories.InternalOnly,
                editTemplateUrl: editTemplatePath,
                templateUrl: viewTemplatePath,
                controller: 'WidgetPaymentReadyToReleaseController',
                controllerAs: 'vm',
                resolve: {
                    items: ['WidgetUtils', 'PaymentApiService', function (WidgetUtils, PaymentApiService) {
                        return PaymentApiService.getListPendingPaymentTransactionForWidget('?$filter=(PaymentMethodId eq 5 and PlannedReleaseDate le DateTime\'' + releaseDateADP + '\') or ( PaymentMethodId ne 5 and PlannedReleaseDate le DateTime\'' + releaseDate + '\')&$top=1&$skip=0&$inlinecount=allpages');
                    }],
                },

            });
    }

    //-------------------------------------------------------------------------------

    WidgetPaymentReadyToReleaseController.$inject = ['$state', 'WidgetUtils', 'items', 'phxLocalizationService'];


    function WidgetPaymentReadyToReleaseController($state, WidgetUtils, items, phxLocalizationService) {
        this.itemCount = items && items.Count;
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
        .controller('WidgetPaymentReadyToReleaseController', WidgetPaymentReadyToReleaseController)
        ;

})();