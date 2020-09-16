/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {

    directives.directive('controlLabel', ['$parse', '$timeout', function ($parse, $timeout) {
        return {
            restrict: 'C',
            require: '?^form',
            link: function (scope, element, attrs, ctrl) {

                var propertyName = attrs.modelProperty,
                    watchProperty = attrs.watchProperty,
                    requiredCondition = attrs.requiredCondition,
                    multi = scope.$eval(attrs.multi),
                    brokenRulesModel,
                    brokenRules,
                    validationMessage,
                    controls = [
                    {
                        propertyName: attrs.modelProperty,
                        controlName: attrs["for"],
                        inputElement: null,
                        isHidden: false
                    }];

                var controlName = attrs["for"];

                if (propertyName) {
                    brokenRulesModel = attrs.brokenRules;

                    if (multi) {
                        for (var prop in multi) {
                            controls.push({
                                propertyName: prop,
                                controlName: multi[prop]
                            });
                        }
                    }

                    setInputElement();
                    
                    if (brokenRulesModel) {
                        brokenRules = $parse(brokenRulesModel)(scope);
                        validationMessage = constructValidationResult(brokenRules, ctrl[controlName], propertyName);

                        if (validationMessage.length > 0) {
                            displayValidationResult(validationMessage);
                        }

                        scope.$watch(brokenRulesModel, function (value) {
                            brokenRules = value;
                            validationMessage = constructValidationResult(brokenRules, ctrl[controlName], propertyName);

                            if (!ctrl.$pristine || validationMessage.length > 0) {
                                displayValidationResult(validationMessage);
                            }
                        });
                    }

                    angular.forEach(controls, function (control) {
                        var ie = control.inputElement;
                        var propertyName = control.propertyName;

                        scope.$watch(function () { return ie.attr('class'); }, function (newVal, oldVal) {
                        if (newVal && oldVal && newVal != oldVal &&
                            ((newVal.indexOf('ng-valid') >= 0 && oldVal.indexOf('ng-invalid') >= 0) ||
                            (newVal.indexOf('ng-invalid') >= 0 && oldVal.indexOf('ng-valid') >= 0))
                            ) {
                            handlePropertyChange();
                        }
                    });

                        scope.$watch(function () { return ie.attr('data-ng-class'); }, function (newVal, oldVal) {
                        if (newVal && oldVal && newVal != oldVal &&
                            ((newVal.indexOf('ng-valid') >= 0 && oldVal.indexOf('ng-invalid') >= 0) ||
                            (newVal.indexOf('ng-invalid') >= 0 && oldVal.indexOf('ng-valid') >= 0))
                            ) {
                            var isInvalid = (newVal.indexOf('ng-invalid') >= 0);
                            handlePropertyChange(isInvalid);
                        }
                    });

                        if (ie.attr('ui-select') || ie.attr('data-ui-select') || ie.attr('data-hidden-select') || ie.is('ui-select') || ie.hasClass('ui-select-container')) {
                        scope.$watch(propertyName, function () {
                            $timeout(function () {
                                handlePropertyChange();
                            });
                        });
                    } else {
                        scope.$watch(propertyName, function () {
                            handlePropertyChange();
                        });
                    }

                    if (watchProperty) {
                        scope.$watch(watchProperty, function () {
                            handlePropertyChange();
                        });
                    }

                    if (requiredCondition) {
                        var fnIsRequired = scope.$eval(requiredCondition);
                        var isrequired = (typeof fnIsRequired == "function") ? fnIsRequired() : fnIsRequired;
                        displayRequiredIndicator(isrequired);
                        scope.$watch(fnIsRequired, function (fnRequired) {
                            handlePropertyChange();
                            if (fnRequired) {
                                isrequired = (typeof fnRequired == "function") ? fnRequired() : fnRequired;
                                displayRequiredIndicator(isrequired);
                            }
                        }, true);
                    }
                    });
                }

                function handlePropertyChange(isInvalid) {
                    brokenRules = null;
                    if (brokenRulesModel) {
                        brokenRules = $parse(brokenRulesModel)(scope);
                    }

                    validationMessage = '';
                    if (ctrl && !ctrl.$pristine) {

                        var ieChecked = false;

                        angular.forEach(controls, function (control) {
                            if (!control.inputElement) {
                                setInputElement();
                                ieChecked = true;
                            }
                            validationMessage += constructValidationResult(brokenRules, ctrl[control.controlName], control.propertyName, control.inputElement, control.isHidden);
                        });
                    }
                    var infnIsRequired = null;
                    if (requiredCondition) {
                        infnIsRequired = scope.$eval(requiredCondition);
                        var inisrequired = (typeof infnIsRequired == "function") ? infnIsRequired() : infnIsRequired;
                        displayRequiredIndicator(inisrequired);
                    }

                    displayValidationResult(validationMessage, isInvalid, inisrequired);
                }

                function setInputElement() {
                    angular.forEach(controls, function (control) {
                        var e = $(element).parent().parent().find('[name="' + control.controlName + '"]');
                        control.inputElement = $(e);
                        control.isHidden = e.attr("type") == "hidden";
                    });
                }

                function constructValidationResult(rules, form, property, inputElement, isHidden) {
                    var result = '';
                    if (rules && property) {
                        var path = property.split(".");
                        var modelProperty = path[path.length - 1];
                        var servererror = rules[modelProperty];
                        if (servererror) {
                            angular.forEach(servererror, function (value) {
                                result = result + '<li>' + value + '</li>';
                            });
                        }
                    }

                    if (form) {
                        if (!form.$valid && (isHidden || !form.$pristine)) {
                            var error = form.$error;

                            if (error.required) {
                                if (inputElement && angular.element(inputElement).attr('data-required-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-required-message') + '</li>';
                                } else {
                                    result = result + '<li>Required</li>';
                                }
                            } else if (error.maxlength) {
                                if (inputElement && angular.element(inputElement).attr('data-maxlength-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-maxlength-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-range-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-range-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-length-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-length-message') + '</li>';
                                } else {
                                    result = result + '<li>Field is too long</li>';
                                }
                            } else if (error.max) {
                                if (inputElement && angular.element(inputElement).attr('data-maxlength-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-maxlength-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-range-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-range-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-length-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-length-message') + '</li>';
                                } else {
                                    result = result + '<li>Value is too large</li>';
                                }
                            } else if (error.minlength) {
                                if (inputElement && angular.element(inputElement).attr('data-minlength-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-minlength-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-range-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-range-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-length-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-length-message') + '</li>';
                                } else {
                                    result = result + '<li>Field is too short</li>';
                                }
                            } else if (error.min) {
                                if (inputElement && angular.element(inputElement).attr('data-minlength-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-minlength-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-range-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-range-message') + '</li>';
                                } else if (inputElement && angular.element(inputElement).attr('data-length-message')) {
                                    result = result + '<li>' + angular.element(inputElement).attr('data-length-message') + '</li>';
                                } else {
                                    result = result + '<li>Value is too small</li>';
                                }
                            }
                        }
                    }

                    return result;
                }

                function displayValidationResult(errorMessage, isInvalidExternal, isRequired) {
                    $timeout(function () {
                        isInvalidExternal = (isInvalidExternal !== undefined && isInvalidExternal !== null) ? isInvalidExternal : false;
                        var isInvalidLocal = $(element).parent().find('[name="' + $(element).attr('for') + '"]').hasClass('ng-invalid');
                        if (isRequired === false) {
                            $(element).removeClass('req-lab-left-valid');
                            $(element).removeClass('req-lab-right-valid');
                            $(element).removeClass('req-lab-left');
                            $(element).removeClass('req-lab-right');
                        }
                        else if (errorMessage.length > 0 || isInvalidLocal || isInvalidExternal) {
                            if ($(element).hasClass('req-lab-left-valid'))
                            {
                                $(element).removeClass('req-lab-left-valid');
                                $(element).addClass('req-lab-left');
                            }
                            if ($(element).hasClass('req-lab-right-valid'))
                            {
                                $(element).removeClass('req-lab-right-valid');
                                $(element).addClass('req-lab-right');
                            }
                            //if (!$(element).hasClass('req-lab-left') && !$(element).hasClass('req-lab-right')) {
                            //    $(element).addClass('req-lab-right');
                            //}
                            //$(element).popover('destroy');
                            //$(element).popover({
                            //   html: true,
                            //    trigger: 'hover',
                            //    placement: 'top',
                            //    //title: 'Validation',
                            //    content: '<ul style="list-style-type:none; padding:0">' + errorMessage + '</ul>'
                            //});
                        } else {
                            if ($(element).hasClass('req-lab-left'))
                            {
                                $(element).removeClass('req-lab-left');
                                $(element).addClass('req-lab-left-valid');
                            }
                            if ($(element).hasClass('req-lab-right'))
                            {
                                $(element).removeClass('req-lab-right');
                                $(element).addClass('req-lab-right-valid');
                            }
                            //if (!$(element).hasClass('req-lab-left-valid') && !$(element).hasClass('req-lab-right-valid')) {
                            //    $(element).addClass('req-lab-right-valid');
                            //}
                            //$(element).popover('destroy');
                        }
                    });
                    
                }

                function displayRequiredIndicator(isRequired) {
                    if (isRequired === true) {
                        if (!$(element).hasClass('req-lab-right-valid') && !$(element).hasClass('req-lab-left-valid') && !$(element).hasClass('req-lab-right')) {
                            $(element).addClass('req-lab-right');
                        }
                    } else {
                        $(element).removeClass('req-lab-right');
                    }
                }
            }
        };
    }]);

})(Phoenix.Directives);


