/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
/// <reference path="~/Content/libs/underscore/underscore.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />

(function (directives) {

    directives.directive('inputFloatGreaterThanExpr', ['$parse', function ($parse) {
        //example usage <input type="text" ng-model="rate.incomeTo" input-float-greater-than-expr="$first ? 0 : taxRates[$index-1].incomeTo" />
        return {
            require: 'ngModel',
            scope: false,
            link: function (scope, element, attr, ngModel) {

                var toValid = function (value) {
                    var v = parseFloat(angular.element(element).val());
                    var greaterThan = parseFloat(scope.$eval(attr.inputFloatGreaterThanExpr));
                    ngModel.$setValidity('inputFloatGreaterThanExpr', isNaN(v) || isNaN(greaterThan) || v > greaterThan);
                    return value;
                };

                toValid();

                ngModel.$parsers.unshift(toValid);

                scope.$watch(attr.inputFloatGreaterThanExpr, toValid);

            }
        };
    }]);

})(Phoenix.Directives);