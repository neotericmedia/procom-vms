(function (directives) {
    'use strict';

    /**

    @name directives.floatBetweenInput
    @description
    Used to filter keyboard entries for <input type="text"/> component to allow to type only digits in described range from='from' to='to' 
    and with allowed number of decimals='decimalplaces'
    Attributes:
        *from - min allowed float value;
        *to - max allowed float value;
        *decimalplaces - number of allowed decimal positions in float value;
        *defaultemptystring - default empty string value
    example:   

    @Html.CustomTextBoxFor(..., htmlAttributes: new { float_between_input = "", from = "0.01", to = "24", decimalplaces = "2" })

    OR

    <input type="text" float-between-input="" from="0.01" to="24" decimalplaces="2" doesemptytozero='false' />

    OR 

    <input type="text" float-between-input="{from:0.01, to:24, decimalplaces:2, doesemptytozero:'false'}" />

    OR 
    var optionsInController = {from:0.01, to:24, decimalplaces:2, doesemptytozero:'false'};

    <input type="text" float-between-input="optionsInController" />

    **/
    //directives.directive('floatBetweenInput', ['$parse', function ($parse) {
    directives.directive('floatBetweenInput', ['$parse', '$filter', function ($parse, $filter) {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                onDecInputCallback: '&'
            },
            link: link
        };

        return directive;

        function link(scope, element, attr, ctrl) {

            var options = {
                from: 0.1,
                to: 99.99,
                decimalplaces: 1,
                doesemptytozero: 'true'
            };

            var expression = attr.floatBetweenInput ? $parse(attr.floatBetweenInput)(scope) : {};
            options = angular.extend(options, expression);

            if (attr.from && attr.from.length > 0) {
                options.from = parseFloat(attr.from);
                if (!options.from) {
                    options.from = $parse(attr.from)(scope);
                }
            }
            if (attr.to && attr.to.length > 0) {
                options.to = parseFloat(attr.to);
                if (!options.to) {
                    options.to = $parse(attr.to)(scope);
                }
            }
            if (attr.decimalplaces && attr.decimalplaces.length > 0) {
                options.decimalplaces = parseInt(attr.decimalplaces);
            }
            if (attr.doesemptytozero && attr.doesemptytozero.length > 0) {
                options.doesemptytozero = attr.doesemptytozero;
            }

            var defaultEmptyString = (options.doesemptytozero.toString().toLowerCase() == 'true') ? '0' : '';

            var parse = function (value) {
                if (!value) {
                    return value;
                }
                if (typeof value === 'number') {
                    value = value.toString();
                }

                var replaceStr = '/\.{' + options.decimalplaces.toString() + ',}/';
                var clean = value.replace(/[^0-9.-]+/g, '').replace(replaceStr, '.');

                while (clean.charAt(0) == '0' && clean.length > 1 && clean.charAt(1) != '.') {
                    clean = clean.substr(1);
                }
                if (clean.charAt(0) == '-' && clean.charAt(1) == '0' && clean.charAt(2) != '.' && clean.length > 2) {
                    clean = clean.slice(0, 1) + clean.slice(2);
                }
                if (clean.charAt(0) == '0' && clean.length == 1 && (options.from > 0 || options.to < 0)) {
                    clean = defaultEmptyString;
                }
                if (clean.charAt(0) == '.' && clean.length == 1) {
                    clean = '0.';
                }
                if (clean.charAt(0) == '-' && clean.charAt(1) == '.' && clean.length == 2) {
                    clean = '-0.';
                }

                // case for users entering multiple periods throughout the number
                var dotSplit = clean.split('.');
                if (dotSplit.length >= 2) {
                    clean = dotSplit[0] + '.' + dotSplit[1].slice(0, options.decimalplaces);
                }
                var negativeSplit = clean.split('-');
                if (negativeSplit.length > 2 || (clean.length > 1 && clean.slice(-1) == '-')) {
                    clean = clean.substr(0, clean.length - 1);
                }
                if (clean.length === 0 || (clean.length == 1 && clean == '0' && (options.from > 0 || options.to < 0))) {
                    clean = defaultEmptyString;
                }
                else {
                    try {
                        var floatValue = parseFloat(clean);
                        if ((floatValue >= options.from || floatValue >= parseFloat(options.from.toString().substr(0, options.from.toString().length - floatValue.toString().length))) && floatValue <= options.to) {
                            //right result in requested range
                        } else if (clean.length == 1 && clean.charAt(0) == '-' && options.from < 0) {
                            //right result in requested range
                        }
                        else if (clean.length == 1) {
                            clean = defaultEmptyString;
                        } else {
                            clean = clean.slice(0, clean.length - 1);
                        }
                    } catch (e) {
                        clean = defaultEmptyString;
                    }
                }

                if (clean !== value) {
                    ctrl.$setViewValue(clean);
                    ctrl.$render();
                }

                if (attr.onDecInputCallback) {
                    scope.onDecInputCallback({unit: clean});
                }

                return clean;
            };            

            ctrl.$parsers.unshift(parse);
            ctrl.$formatters.unshift(parse);
        }

    }]);

})(Phoenix.Directives);