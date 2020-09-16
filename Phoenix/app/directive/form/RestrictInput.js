(function (directives) {
    
    directives.directive('restrictInput', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                var restr = '\\W';
                if (attr.restrictInput && attr.restrictInput.length > 0) {
                    restr = attr.restrictInput;
                }
                var re = new RegExp(restr, "g");

                var handleUserInput = function (value) {
                    if (!value) return value;
                    
                    var transformedInput = value.replace(re, '');
                    
                    if (transformedInput !== value) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                };
                ngModelCtrl.$parsers.unshift(handleUserInput);
            }
        };
    });
    
})(Phoenix.Directives);