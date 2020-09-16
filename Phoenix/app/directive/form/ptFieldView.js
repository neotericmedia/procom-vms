(function (directives) {
    'use strict';

    /**
    @name directives.ptFieldView
    Used as Field View extension

    directive Config:
        *funcToCheckViewStatus  - (required) funcToCheckViewStatus;
        *watchChangeEvent       - (required) watch Change Event;
        *classOnView            - (optional) class added on view mode 
        *funcToPassMessages     - (optional) funcToPassMessages
    Attributes:
        *fieldViewCustom        - (optional) field View Custom
    example:   

    @Html.CustomTextBoxFor(..., htmlAttributes: new {  data_pt_field_view = "{funcToCheckViewStatus:'ptFieldViewEventOnChangeStatusId', watchChangeEvent:'model.viewMode', funcToPassMessages: 'ptFieldViewMessages'}" })

    OR
    <input type="text" data-pt-field-view="{funcToCheckViewStatus:'ptFieldViewEventOnChangeStatusId', watchChangeEvent:'model.viewMode', funcToPassMessages: 'ptFieldViewMessages'}">
    OR
    $scope.model.ptFieldViewConfigOnChangeStatusId = {funcToCheckViewStatus:'ptFieldViewEventOnChangeStatusId', watchChangeEvent:'model.viewMode', funcToPassMessages: 'ptFieldViewMessages'};
    @Html.CustomTextBoxFor(..., htmlAttributes: new {  data_pt_field_view = "model.ptFieldViewConfigOnChangeStatusId" })
    <input type="text" 
        data_pt_field_view = "model.ptFieldViewConfigOnChangeStatusId" 
        data-pt-field-view-custom="{{billingRecipient.UserProfileId|lookupnocache:billingInfo.profilesListForBillingOrganization:'Id':'FullName':'ContactId'}} ({{billingRecipient.UserProfileId|lookupnocache:billingInfo.profilesListForBillingOrganization:'Id':'ProfileTypeId'| lookupnocache:lists.profileTypeList}} - {{billingRecipient.UserProfileId}})"
        data-pt-field-view-model-validation="{ { billingRecipient } }"
        >

    **/
    directives.directive('ptFieldView', ['$compile', '$parse', function ($compile, $parse) {
        var result = {
            restrict: 'A',
            link: link
        };
        return result;

        function link(scope, element, attr) {

            var options = { funcToCheckViewStatus: '', watchChangeEvent: '', classOnView: '', funcToPassMessages: '' };
            options = angular.extend(options, attr.ptFieldView ? $parse(attr.ptFieldView)(scope) : {});

            var elementAttr = { ngModel: '', modelPrefix: '', name: '', custom: '' };
            var funcToCheckViewStatus, funcToPassMessages;

            var getElementAttributes = function () {

                // get element attribute 'ngModel'
                if (attr.ngModel && attr.ngModel.length > 0) {
                    elementAttr.ngModel = attr.ngModel;
                }

                // get element attribute 'name'
                if (attr.name && attr.name.length > 0) {
                    elementAttr.name = attr.name;
                } else if (attr.ngModel && attr.ngModel.length > 0) {
                    elementAttr.name = (attr.ngModel.indexOf('.') >= 0) ? attr.ngModel.substring(attr.ngModel.lastIndexOf('.') + '.'.length) : '';
                }

                // get element attribute 'modelPrefix'
                if (attr.modelPrefix && attr.modelPrefix.length > 0) {
                    elementAttr.modelPrefix = attr.modelPrefix;
                } else if (attr.ngModel && attr.ngModel.length > 0) {
                    elementAttr.modelPrefix = (attr.ngModel.indexOf('.') > 0) ? attr.ngModel.substring(0, attr.ngModel.lastIndexOf('.')) : '';
                }

                // create scope function to Check View Status

                if (typeof options.funcToCheckViewStatus === 'function') {
                    funcToCheckViewStatus = options.funcToCheckViewStatus;
                }
                else if (options.funcToCheckViewStatus.length > 0) {
                    funcToCheckViewStatus = scope.$eval(options.funcToCheckViewStatus);
                }

                // create scope function to Pass Messages
                if (typeof options.funcToPassMessages === 'function') {
                    funcToPassMessages = options.funcToPassMessages;
                }
                else if (options.funcToPassMessages.length > 0) {
                    funcToPassMessages = scope.$eval(options.funcToPassMessages);
                }

                // create scope watch to listen controller event on changes
                if (options.watchChangeEvent.length > 0) {
                    if (options.watchChangeEvent.indexOf(',') > 0) {
                        scope.$watchCollection(options.watchChangeEvent, function () {
                            checkViewStatus();
                        });
                    } else {
                        scope.$watch(options.watchChangeEvent, function () {
                            checkViewStatus();
                        });
                    }
                }

                // classOnView default value
                if (!options.classOnView || options.classOnView.length === 0) {
                    options.classOnView = 'form-control-static';
                }


                // get element attribute 'fieldViewCustom'
                var attrs = '';
                angular.forEach(element.context.attributes, function (a) {
                    attrs += ' ' + a.name + '="' + a.value + '"';
                    if (a.name == "data-pt-field-view-custom" || a.name == "pt-field-view-custom") {
                        elementAttr.custom = a.value;
                        elementAttr.custom = elementAttr.custom.replace(new RegExp("{ {", 'g'), "{{");
                        elementAttr.custom = elementAttr.custom.replace(new RegExp("} }", 'g'), "}}");
                    }
                    if (a.name == "data-pt-field-view-model-validation" || a.name == "pt-field-view-model-validation") {
                        elementAttr.modelValidation = a.value;
                        elementAttr.modelValidation = elementAttr.modelValidation.replace(new RegExp("{ {", 'g'), "");
                        elementAttr.modelValidation = elementAttr.modelValidation.replace(new RegExp("} }", 'g'), "");
                    }
                });
                if (elementAttr.custom.length === 0 && attr.fieldViewCustom && attr.fieldViewCustom.length > 0) {
                    elementAttr.custom = attr.fieldViewCustom;
                    if (funcToPassMessages && (elementAttr.custom.indexOf('{ {') < 0 || elementAttr.custom.indexOf('} }') < 0 || elementAttr.custom.indexOf('{{') >= 0 || elementAttr.custom.indexOf('}}') >= 0)) {
                        var message = 'the attribute "fieldViewCustom" of directive "ptFieldView" of HTML element name="' + elementAttr.name + '", ngModel="' + elementAttr.ngModel + '" should include brackeds with space inside "{ {...} }"';
                        funcToPassMessages(message);
                    }
                    elementAttr.custom = elementAttr.custom.replace(new RegExp("{ {", 'g'), "{{");
                    elementAttr.custom = elementAttr.custom.replace(new RegExp("} }", 'g'), "}}");
                }
            };
            getElementAttributes();

            var get_html_select = function (inputElement) {
                var inputNode = $(inputElement)[0];
                var resultSelect = { html: '', ngClass: '' };
                if (inputNode.outerHTML.indexOf('ngRepeat') > 0) {
                    resultSelect.html = inputNode.outerHTML.substring(inputNode.outerHTML.indexOf('ngRepeat'));
                    if (resultSelect.html.indexOf(' in ') > 0) {
                        resultSelect.html = resultSelect.html.substring(resultSelect.html.indexOf(' in ') + ' in '.length);
                        if (resultSelect.html.indexOf(' ') > 0) {
                            resultSelect.html = resultSelect.html.substring(0, resultSelect.html.indexOf(' '));
                            resultSelect.html = '{{' + elementAttr.ngModel + ' | lookupnocache:' + resultSelect.html + '}}&nbsp;';
                        }
                    }
                }
                return resultSelect;
            };
            var get_html_input_text = function (inputElement) {
                var inputNode = $(inputElement)[0];
                var resultInputText = { html: '', ngClass: '' };
                if (inputNode.outerHTML.indexOf('uib-datepicker-popup') >= 0) {
                    return get_pt_date_picker(inputElement);
                }
                else if (inputNode.outerHTML.indexOf('data-decimalplaces="2"') >= 0) {
                    resultInputText.html = '{{' + elementAttr.ngModel + '|currency:""}}&nbsp;';
                }
                else if (inputNode.outerHTML.indexOf('decimalplaces:2') >= 0) {
                    resultInputText.html = '{{' + elementAttr.ngModel + '|currency:"":2}}&nbsp;';
                }
                else if (inputNode.outerHTML.indexOf('decimalplaces:4') >= 0) {
                    resultInputText.html = '{{' + elementAttr.ngModel + '|currency:"":4}}&nbsp;';
                }
                else {
                    resultInputText.html = '{{' + elementAttr.ngModel + '}}&nbsp;';
                }
                return resultInputText;
            };
            var get_html_input_checkbox = function (inputElement) {
                var resultInputCheckbox = { span: '', html: '', ngClass: '' };
                if (attr.options && attr.options.length > 0) {
                    resultInputCheckbox.span = '{{' + elementAttr.ngModel + ' | lookupnocache:' + attr.options + ':"key":"value"}}&nbsp;';
                }
                else {
                    resultInputCheckbox.span = '  ';
                    //resultInputCheckbox.ngClass = '{{'+elementAttr.ngModel+'?\'fontello-icon-ok-circled2\':\'fontello-icon-cancel-circled2\'}}';
                    resultInputCheckbox.ngClass = '{{' + elementAttr.ngModel + '?\'fontello-icon-check\':\'fontello-icon-check-empty\'}}';
                }
                return resultInputCheckbox;
            };
            var get_pt_input_radio = function (inputElement) {
                var resultInputRadio = { html: '', ngClass: '' };
                if (attr.options && attr.options.length > 0) {
                    resultInputRadio.html = '{{' + elementAttr.ngModel + ' | lookupnocache:' + attr.options + ':"key":"value"}}';
                }
                return resultInputRadio;
            };
            var get_pt_date_picker = function (inputElement) {
                var resultDatePicker = { html: '', ngClass: '' };

                var inputNode = $(inputElement)[0];
                if (inputNode.outerHTML.indexOf('uib-datepicker-popup') >= 0) {
                    var datepickerPopup = inputNode.outerHTML.substring(inputNode.outerHTML.indexOf('uib-datepicker-popup="') + 'uib-datepicker-popup="'.length);
                    if (datepickerPopup.indexOf('"') >= 0) {
                        datepickerPopup = datepickerPopup.substring(0, datepickerPopup.indexOf('"'));
                        if (datepickerPopup.indexOf('{{') >= 0 && datepickerPopup.indexOf('}}')) {
                            datepickerPopup = datepickerPopup.substring(datepickerPopup.indexOf('{{') + '{{'.length);
                            datepickerPopup = datepickerPopup.substring(0, datepickerPopup.indexOf('}}'));
                            resultDatePicker.html = '{{' + elementAttr.ngModel + '|date:' + datepickerPopup + '}}&nbsp;';
                        } else {
                            resultDatePicker.html = '{{' + elementAttr.ngModel + '|date:"' + datepickerPopup + '"}}&nbsp;';
                        }
                    }
                }
                else {
                    resultDatePicker.html = '{{' + elementAttr.ngModel + '}}&nbsp;';
                }
                return resultDatePicker;
            };
            var get_ui_select_bootstrap = function (inputElement) {
                var resulUiSelectBootstrap = { html: '', ngClass: '' };
                var inputNode = $(inputElement)[0];
                var repeat = $(inputNode).find('[repeat]');
                if (repeat && repeat[0] && repeat[0].outerHTML.length > 0) {
                    var repeatOuterHTML = repeat[0].outerHTML.substring(repeat[0].outerHTML.indexOf('repeat'));
                    if (repeatOuterHTML.indexOf(' in ') > 0) {
                        repeatOuterHTML = repeatOuterHTML.substring(repeatOuterHTML.indexOf(' in ') + ' in '.length);
                        if (repeatOuterHTML.indexOf(' ') > 0) {
                            repeatOuterHTML = repeatOuterHTML.substring(0, repeatOuterHTML.indexOf(' '));
                            resulUiSelectBootstrap.html = '{{' + elementAttr.ngModel + ' | lookupnocache:' + repeatOuterHTML + '}}&nbsp;';
                        }
                    }
                }
                return resulUiSelectBootstrap;
            };
			var get_pt_textarea = function (inputElement) {
				var resultTextArea = { html: '', ngClass: '' };
				resultTextArea.html = '<pre>{{' + elementAttr.ngModel + '}}';
				return resultTextArea;
			};
            var get_html_div = function (inputElement) {
                var resultDiv = { html: '' };
                var htmlPrefix = '';
                var htmlSuffix = '';
                var elementIdex = -1;
                angular.forEach($(inputElement)[0].children, function (child, index) {
                    var $child = $(child);

                    if (child.nodeName.toLowerCase() === 'input' && (child.type.toLowerCase() === 'text' || child.type.toLowerCase() === 'email')) {
                        resultDiv = get_html_input_text(child);
                        elementIdex = index;
                    }
                    else if (child.nodeName.toLowerCase() === 'div' && $child.hasClass('ui-select-bootstrap') && child.textContent && child.textContent.length > 0) {
                        resultDiv = get_ui_select_bootstrap(child);
                    }
                    else if (child.nodeName.toLowerCase() === 'span' && $child.hasClass('input-group-addon') && child.textContent && child.textContent.length > 0) {
                        if (index === 0 || index < elementIdex) {
                            htmlPrefix = child.textContent;
                        } else {
                            htmlSuffix = child.textContent;
                        }
                    }
                    else {
                        if (typeof $child.attr('ng-model') !== 'undefined' && $child.attr('ng-model') !== false) {
                            resultDiv.html = '{{' + $child.attr('ng-model') + '}}&nbsp;';
                        }
                        else if (typeof $child.attr('data-ng-model') !== 'undefined' && $child.attr('data-ng-model') !== false) {
                            resultDiv.html = '{{' + $child.attr('data-ng-model') + '}}&nbsp;';
                        }
                    }
                });

                if (htmlPrefix == '$') { }

                resultDiv = {
                    html: resultDiv.html,
                    htmlPrefix: htmlPrefix,
                    htmlSuffix: htmlSuffix,
                };

                return resultDiv;
            };

            var get_html_ViewMode = function (inputElement) {
                var htmlResult = { span: '', html: '', ngClass: '', htmlPrefix: '', htmlSuffix: '' };
                var $inputElement = $(inputElement);
                var element = $inputElement[0];
                var outerHTMLForDebug = element.outerHTML;
                var nodeName = (element.nodeName || '').toLowerCase();
                var type = (element.type || '').toLowerCase();

                if (elementAttr.custom && elementAttr.custom.length > 0) {
                    htmlResult.html = elementAttr.custom;
                }
                else if (nodeName === 'select') {
                    htmlResult = get_html_select(inputElement);
                }
                else if (nodeName === 'input' && type === 'text') {
                    htmlResult = get_html_input_text(inputElement);
                }
                else if (nodeName === 'input' && type === 'checkbox') {
                    htmlResult = get_html_input_checkbox(inputElement);
                }
                else if (nodeName === 'pt-input-radio') {
                    htmlResult = get_pt_input_radio(inputElement);
                }
                else if (nodeName === 'phx-input-radio') {
                    htmlResult = get_pt_input_radio(inputElement);
                }
                else if (nodeName === 'pt-date-picker') {
                    htmlResult = get_pt_date_picker(inputElement);
                }
                else if (nodeName === 'div' && (
                    $(element).hasClass('ui-select-bootstrap') ||
                    $(element).hasClass('select2-bootstrap-append') ||
                    $(element).hasClass('select2-container')
                    )) {
                    htmlResult = get_ui_select_bootstrap(inputElement);
				}
				else if (nodeName === 'textarea') {
					htmlResult = get_pt_textarea(inputElement);
				}
                else if (nodeName === 'div') {
                    htmlResult = get_html_div(inputElement);
                } else {
                    if (typeof $inputElement.attr('ng-model') !== 'undefined' && $inputElement.attr('ng-model') !== false) {
                        htmlResult.html = '{{' + $inputElement.attr('ng-model') + '}}&nbsp;';
                    }
                    else if (typeof $inputElement.attr('data-ng-model') !== 'undefined' && $inputElement.attr('data-ng-model') !== false) {
                        htmlResult.html = '{{' + $inputElement.attr('data-ng-model') + '}}&nbsp;';
                    }
                    else if (funcToPassMessages) {
                        var message = 'directive "ptFieldView" warning: HTML element name="' + elementAttr.name + '", ngModel="' + elementAttr.ngModel + '", nodeName="' + nodeName + '", type="' + type + '"  DOES NOT SUPPORTED!';
                        funcToPassMessages(message);
                    }
                }

                if (htmlResult.html && htmlResult.html.length > 0) {
                    var r = '<div ' +
                        'class="fieldViewMode ' +
                        '  ' + (options.classOnView && options.classOnView.length > 0 ? ' ' + options.classOnView : '') +
                        '  ' + (htmlResult.ngClass && htmlResult.ngClass.length > 0 ? ' ' + htmlResult.ngClass : '') +
                        '"' +
                        '>' +
                        (htmlResult.htmlPrefix && htmlResult.htmlPrefix.length > 0 ? htmlResult.htmlPrefix + ' ' : '') +
                        htmlResult.html +
                        (htmlResult.htmlSuffix && htmlResult.htmlSuffix.length > 0 ? ' ' + htmlResult.htmlSuffix : '') +
                        '</div>';
                    inputElement.parent().append($compile(r)(scope));
                }
                else if (htmlResult.span && htmlResult.span.length > 0) {
                    var s = '<span ' +
                        ' onclick="return false"' +
                        ' class="fieldViewMode ' +
                        '  ' + (options.classOnView && options.classOnView.length > 0 ? ' ' + options.classOnView : '') +
                        (htmlResult.ngClass && htmlResult.ngClass.length > 0 ? ' ' + htmlResult.ngClass : '') +
                        '"' +
                        '>' + htmlResult.span +
                        '</span>';
                    inputElement.parent().prepend($compile(s)(scope));
                }
            };

            var checkViewStatus = function () {
                var viewStatus = ApplicationConstants.viewStatuses.edit;
                if (funcToCheckViewStatus) {
                    var modelValidation = null;
                    if (elementAttr.modelValidation && elementAttr.modelValidation.length > 0) {
                        modelValidation = $parse(elementAttr.modelValidation)(scope);
                    }
                    viewStatus = funcToCheckViewStatus(elementAttr.modelPrefix, elementAttr.name, modelValidation);
                }
                var inputElement = angular.element(element);

                if (inputElement.parent().hasClass('input-group')) {
                    inputElement = inputElement.parent();
                }

                var viewModeElement = (inputElement.parent()[0].innerHTML.indexOf('fieldViewMode') >= 0) ? inputElement.parent().find('.fieldViewMode') : null;

                if (inputElement.parent().hasClass('form-group') && inputElement.parent().hasClass('viewModeGroup')) {
                    inputElement.parent().removeClass('hidden');
                    inputElement.parent().removeClass('viewModeGroup');
                }
                else if (inputElement.parent().parent().hasClass('form-group') && inputElement.parent().parent().hasClass('viewModeGroup')) {
                    inputElement.parent().parent().removeClass('hidden');
                    inputElement.parent().parent().removeClass('viewModeGroup');
                }
                else if (inputElement.parent().parent().parent().hasClass('form-group') && inputElement.parent().parent().parent().hasClass('viewModeGroup')) {
                    inputElement.parent().parent().parent().removeClass('hidden');
                    inputElement.parent().parent().parent().removeClass('viewModeGroup');
                }

                if (viewStatus == ApplicationConstants.viewStatuses.edit) {
                    // show main element
                    if (inputElement.hasClass('hidden')) {
                        inputElement.removeClass('hidden');
                    }
                    // hide viewMode element
                    if (viewModeElement && !viewModeElement.hasClass('hidden')) {
                        viewModeElement.addClass('hidden');
                        //http://api.jquery.com/category/manipulation/
                        //viewModeElement.detach();
                    }
                }
                else if (viewStatus == ApplicationConstants.viewStatuses.hideElement) {
                    // hide main element
                    if (!inputElement.hasClass('hidden')) {
                        inputElement.addClass('hidden');
                    }
                    // hide viewMode element
                    if (viewModeElement && !viewModeElement.hasClass('hidden')) {
                        viewModeElement.addClass('hidden');
                    }
                }
                else if (viewStatus == ApplicationConstants.viewStatuses.hideFormGroup) {
                    if (inputElement.parent().hasClass('form-group')) {
                        if (!inputElement.parent().hasClass('hidden')) {
                            inputElement.parent().addClass('hidden');
                        }
                        if (!inputElement.hasClass('viewModeGroup')) {
                            inputElement.addClass('viewModeGroup');
                        }
                    }
                    else if (inputElement.parent().parent().hasClass('form-group')) {
                        if (!inputElement.parent().parent().hasClass('hidden')) {
                            inputElement.parent().parent().addClass('hidden');
                        }
                        if (!inputElement.parent().parent().hasClass('viewModeGroup')) {
                            inputElement.parent().parent().addClass('viewModeGroup');
                        }
                    } else if (inputElement.parent().parent().parent().hasClass('form-group')) {
                        if (!inputElement.parent().parent().parent().hasClass('hidden')) {
                            inputElement.parent().parent().parent().addClass('hidden');
                        }
                        if (!inputElement.parent().parent().parent().hasClass('viewModeGroup')) {
                            inputElement.parent().parent().parent().addClass('viewModeGroup');
                        }
                    }
                }
                else if (viewModeElement && viewStatus == ApplicationConstants.viewStatuses.view) {
                    // hide main element
                    if (!inputElement.hasClass('hidden')) {
                        inputElement.addClass('hidden');
                    }
                    // show viewMode element
                    if (viewModeElement.hasClass('hidden')) {
                        viewModeElement.removeClass('hidden');
                    }
                } else if (viewStatus == ApplicationConstants.viewStatuses.view) {
                    // hide main element
                    if (!inputElement.hasClass('hidden')) {
                        inputElement.addClass('hidden');
                    }
                    // buid viewMode element
                    get_html_ViewMode(inputElement);
                }
            };
            checkViewStatus();
        }

    }]);

})(Phoenix.Directives);