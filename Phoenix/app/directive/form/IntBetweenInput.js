(function (directives) {
    'use strict';

    /**

    @name directives.intBetweenInput
    @description
    Used to filter keyboard entries for <input type="text"/> component to allow to type only digits in described range from='from' to='to' 
    Attributes:
        *from - min allowed int value;
        *to - max allowed int value;
    example:   

    @Html.CustomTextBoxFor(..., htmlAttributes: new { int_between_input = "", from = "1", to = "24" })

    OR

    <input type="text" int-between-input="" from="0.01" to="24" data-ng-model="billingInfo.Hours" />

    **/
    directives.directive('intBetweenInput', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                var intFrom = 1;
                var intTo = 99;

                if (attr.from && attr.from.length > 0) {
                    intFrom = parseInt(attr.from);
                }
                if (attr.to && attr.to.length > 0) {
                    intTo = parseInt(attr.to);
                }

                var parse = function (value) {
                    if (!value)
                        return value;
                    var clean = value.replace(/[^0-9]+/g, '');
                    while (clean.charAt(0) == '0') {
                        clean = clean.substr(1);
                    }
                    try {
                        var intValue = parseInt(clean);

                        if (intValue >= intFrom && intValue <= intTo) {
                            // todo
                        } else if (clean.length == 1) {
                            clean = '';
                        } else {
                            clean = clean.slice(0, clean.length - 1);
                        }
                        if (clean !== value) {
                            ngModel.$setViewValue(clean);
                            ngModel.$render();
                        }
                    } catch(e) {
                        clean = '';
                    } 
                    return clean;
                };

                ngModel.$parsers.unshift(parse);
            }
        };
    });

})(Phoenix.Directives);