(function (directives) {
    'use strict';

    /**


        <input type="text" data-float-to-decimal-places="{decimalplaces:2}" />

    **/

    directives.directive('floatToDecimalPlaces', ['$parse', '$filter', function ($parse, $filter) {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };

        return directive;

        function link(scope, element, attr, ngModel) {
            var options = { decimalplaces: 2, };

            var expression = attr.floatToDecimalPlaces ? $parse(attr.floatToDecimalPlaces)(scope) : {};
            options = angular.extend(options, expression);

            var numberOfDecimalPlaces = options.decimalplaces ? options.decimalplaces : 0;



            var valueParser = function (value) {

                var parseValue = parseFloat(value);

                parseValue = parseValue.toFixed(numberOfDecimalPlaces);

                if (parseValue !== value) {
                    ngModel.$setViewValue(parseValue);
                    ngModel.$render();
                }
                return parseValue;
            };

            ngModel.$formatters.push(function (value) {
                var parsedValue = valueParser(value);
                return parsedValue;
            });

            ngModel.$parsers.push(function (value) {
                var parsedValue = valueParser(value);
                return parsedValue;
            });

        }

    }]);

})(Phoenix.Directives);