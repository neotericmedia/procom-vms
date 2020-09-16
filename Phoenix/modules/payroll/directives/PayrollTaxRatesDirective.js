/// <reference path="../../../../Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="../../../../Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../../Content/libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />

(function (directives) {
    'use strict';

    directives.directive('payrollTaxRates', ['$compile', 'common', function ($compile, common) {
        // example usage:
        // <payroll-tax-rates tax-rates="header.taxRates"></payroll-tax-rates>
        return {
            scope: {
                taxRates: '=taxRates',
                ptFieldViewConfigOnChangeStatusId: '=ptFieldViewConfigOnChangeStatusId',
                taxVersionStatusId: '=',
                customStatusId: '=',
                hideConstantColumn: '@',
                showButtons: '=',
                constantLabel: '@'
            },
            restrict: 'E',
            templateUrl: '/Phoenix/modules/payroll/directives/PayrollTaxRatesDirective.html',
            link: link,
        };
        function link(scope, element, attrs) {
            scope.DisplayConstantLabel = angular.isUndefined(scope.constantLabel) ? 'Constant' : scope.constantLabel;
            scope.addRate = function () {
                // don't need to update next IncomeFrom, as its taken care of on change event
                scope.taxRates.splice(scope.taxRates.length - 1, 0, { IncomeFrom: scope.taxRates.length >= 2 ? (scope.taxRates[scope.taxRates.length - 2].IncomeTo * 1 + 0.01) : 0, IncomeTo: '', RatePercentage: '', Constant: '' });
            };
            scope.removeRate = function (idx) {
                scope.taxRates.splice(idx, 1);
                // don;t have to worry about idx out of bounds, since last element can't be deleted.
                scope.taxRates[idx].IncomeFrom = idx > 0 ? (scope.taxRates[idx - 1].IncomeTo * 1 + 0.01) : 0;
            };
            scope.floatApplySpecifiedNumberOfDecimalPlaces = function (c, n) {
                return common.floatApplySpecifiedNumberOfDecimalPlaces(c, n);
            };
            scope.ptFieldViewConfig = scope.ptFieldViewConfigOnChangeStatusId ? angular.copy(scope.ptFieldViewConfigOnChangeStatusId) : {};
            scope.ptFieldViewConfig.watchChangeEvent = '[taxVersionStatusId, customStatusId]';
            if (scope.taxRates === null || typeof scope.taxRates === 'undefined')
                scope.taxRates = [{ IncomeFrom: 0, IncomeTo: ApplicationConstants.max.currency, RatePercentage: '', Constant: '' }];
        }
    }]);


})(Phoenix.Directives);