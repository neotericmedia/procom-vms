/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
/// <reference path="~/Content/libs/underscore/underscore.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />

(function (directives) {

    directives.directive('inputDisplayDecimalPlaces', ['$parse', 'common', function ($parse, common) {
        //example usage <input type="text" ng-model="rate.incomeTo" input-display-decimal-places="2" />
        return {
            require: 'ngModel',
            scope: false,
            restrict: 'A',
            link: function (scope, element, attr, ngModel) {

                var toDecimalPlaces = function (value) {
                    var decimalPlaces = attr.inputDisplayDecimalPlaces ? parseFloat(attr.inputDisplayDecimalPlaces) : 0;
                    var viewVal = common.floatApplySpecifiedNumberOfDecimalPlaces(value, decimalPlaces);
                    return viewVal;
                };

                ngModel.$formatters.push(toDecimalPlaces);
                var ngElement = angular.element(element);
                ngElement.on("blur", function (ev) {
                    ngModel.$setViewValue(toDecimalPlaces(ngElement.val()));
                    ngModel.$render();
                });
            }
        };
    }]);

})(Phoenix.Directives);