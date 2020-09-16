/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
/// <reference path="~/Content/libs/underscore/underscore.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />
(function (directives) {
    directives.directive('customMask', ['$parse', function ($parse) {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {

                if (!attr.customMask) return;
                $(element).inputmask({ mask: attr.customMask, oncomplete: handleChange, oncleared: handleChange, onincomplete: handleChange, clearIncomplete: true, greedy: false });

                function handleChange() {
                    var value = $(element).inputmask('unmaskedvalue');
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$render();
                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(); }
                    else { scope.$eval(); }
                }
            }
        };
    }]);
    directives.directive('postalZipCodeMask', ['$parse', function ($parse) {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {

                if (!attr.postalZipCodeMask) return;

                var handleMaskChange = function () {
                    var value = $(element).inputmask('unmaskedvalue');
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$render();
                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(); }
                    else { scope.$eval(); }
                };

                var handleCountryChange = function (value) {
                    if (!value) {
                        $(element).inputmask('remove');
                    }
                    else if (value == ApplicationConstants.CountryCanada) {
                        // country Canada
                        $(element).inputmask({ mask: "A9A9A9", oncomplete: handleMaskChange, oncleared: handleMaskChange, onincomplete: handleMaskChange, clearIncomplete: true });
                    }
                    else if (value == ApplicationConstants.CountryUSA || value == ApplicationConstants.CountryMexico) {
                        // country Usa
                        // zip code formats (e.g., "94105")
                        $(element).inputmask({ mask: "99999", oncomplete: handleMaskChange, oncleared: handleMaskChange, onincomplete: handleMaskChange, clearIncomplete: true });
                    }
                    else {
                        $(element).inputmask('remove');
                    }
                };

                var countryCode = $parse(attr.postalZipCodeMask)(scope);
                handleCountryChange(countryCode);

                scope.$watch(attr.postalZipCodeMask, function (country) {
                    handleCountryChange(country);
                });
            }
        };
    }]);

})(Phoenix.Directives);