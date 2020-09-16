(function (directives) {
    'use strict';
    /**
    @name directives.validateEmail

    Attributes: 
        *data-ng-model      - model
    
    example:   
        <input type='email' validate-email data-ng-model="ctrlAs.email" />

    **/
    directives.directive('validateEmail', function () {

        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (ApplicationConstants.Regex.Email.test(viewValue)) {
                        // it is valid
                        ctrl.$setValidity('validateEmail', true);
                        return viewValue;
                    } else {
                        // it is invalid, return undefined (no model update)
                        ctrl.$setValidity('validateEmail', false);
                        return undefined;
                    }
                });
            }
        };
    });


})(Phoenix.Directives);