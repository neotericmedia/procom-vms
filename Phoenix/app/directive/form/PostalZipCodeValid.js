/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
/// <reference path="~/Content/libs/underscore/underscore.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />
//postal_Zip_Code_Valid = "address.PostalCode",

(function (directives) {

    directives.directive('postalZipCodeValid', ['$parse', function ($parse) {
        return {
            require: 'ngModel',
            scope: false,
            link: function (scope, element, attr, ngModel) {
                if (!attr.postalZipCodeValid) return;

                var options = {
                    countryId: 0,
                    isRequired: false
                };

                var expression = attr.postalZipCodeValid ? $parse(attr.postalZipCodeValid)(scope) : {};
                options = angular.extend(options, expression);

                scope.$watch(attr.postalZipCodeValid, function (newValue, oldValue) {
                    options.countryId = scope.$eval(attr.postalZipCodeValid).countryId;
                    options.isRequired = scope.$eval(attr.postalZipCodeValid).isRequired;
                }, true);

                var addressIsZipPostalIsValid = function (countryId, isRequired, postalZipCode) {
                    if (!countryId || !isRequired) {
                        return true;
                    }
                    else if (countryId == ApplicationConstants.CountryCanada) {
                        if (ApplicationConstants.Regex.CountryCanadaPostalCode.test(postalZipCode)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (countryId == ApplicationConstants.CountryUSA) {
                        if (ApplicationConstants.Regex.CountryUsaZip.test(postalZipCode)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (countryId == ApplicationConstants.CountryMexico) {
                        return !!ApplicationConstants.Regex.CountryMexicoPostalCode.test(postalZipCode);
                    }
                    else {
                        return true;
                    }
                };

                var setValidationClass = function (isValid) {
                    //$(element).attr('class')

                    if (isValid) {
                        if ($(element).hasClass('ng-invalid')) {
                            $(element).removeClass('ng-invalid');
                        }
                        if (!$(element).hasClass('ng-valid')) {
                            $(element).addClass('ng-valid');
                        }
                    } else {
                        if ($(element).hasClass('ng-valid')) {
                            $(element).removeClass('ng-valid');
                        }
                        if (!$(element).hasClass('ng-invalid')) {
                            $(element).addClass('ng-invalid');
                        }
                    }
                };

                var toValid = function (value) {
                    var v = $(element).val();
                    setValidationClass(addressIsZipPostalIsValid(options.countryId, options.isRequired, v));
                    return value;
                };

                toValid();

                ngModel.$parsers.unshift(toValid);

                //ngModel.$render = function (value) { toValid(value); };

                //ngModel.$setViewValue = function (value) { toValid(value); };

                //ngModel.$formatters.push(function (value) { toValid(value); });

            }
        };
    }]);

})(Phoenix.Directives);