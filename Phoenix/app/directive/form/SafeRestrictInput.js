(function (directives) {

    directives.directive('safeRestrictInput', function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                if (ngModelCtrl) {
                    var restr = '\\W';
                    var maxLength = 100;

                    var attrValue = attr.safeRestrictInput;
                    // If the attribute is an empty string, use the default values.
                    if ((typeof attrValue === 'string') && (attrValue.length > 0)) {
                        restr = attrValue;
                        // If the attribute is an object literal, use its fields, otherwise use the string literal.
                        try {
                            var obj = scope.$eval(attrValue);
                            if (obj && typeof obj === "object") {
                                restr = obj.regExpStr || restr;
                                maxLength = obj.maxLength || maxLength;
                            }
                        }
                        catch (e) { }
                    }

                    var re = new RegExp(restr, "g");

                    var handleUserInput = function (value) {
                        if (!value) return value;

                        var transformedInput0 = value.replace(re, '');

                        var transformedInput = null;
                        if (maxLength) {
                            var newMaxLength = maxLength;
                            if ((element).hasClass("numberType")) {
                                var numberInput = parseInt(transformedInput0, 10);
                                if (numberInput > 2147483647) {
                                    newMaxLength = transformedInput0.length - 1;
                                }
                            }
                            transformedInput = ('' + transformedInput0).substring(0, newMaxLength);
                        }

                        if (transformedInput !== value) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    };
                    ngModelCtrl.$parsers.unshift(handleUserInput);
                }
            }
        };
    });

})(Phoenix.Directives);