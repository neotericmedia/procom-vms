(function (directives) {
    
    directives.directive('controlUserInput', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                if (!element) return;
                
                if (!scope.controlUserInputs) {
                    scope.controlUserInputs = [];
                }

                $(element).on('keyup', function (e) {
                    var code = e.keyCode || e.which;
                    if (code != '9') {
                        scope.controlUserInputs[ngModelCtrl.$name] = true;
                    }
                });
            }
        };
    });
    
})(Phoenix.Directives);