(function (directives) {
    
    directives.directive('uppercase', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                var handleUserInput = function (value) {
                    if (!value) return value;
                    
                    var transformedInput = value.toUpperCase();
                    
                    if (transformedInput !== value) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                };
                ngModelCtrl.$parsers.push(handleUserInput);
            }
        };
    });
    
})(Phoenix.Directives);