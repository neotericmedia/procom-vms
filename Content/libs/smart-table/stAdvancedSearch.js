/**

Usages:

Case (1): One property with single input value
---------------
Element: 
    <input data-st-advanced-search="'Id'" placeholder="" class="input-sm form-control" data-safe-restrict-input="[^0123456789.]" />

Result:
    - Input will be wrapped and all classes and attributes will be carried.
    - ngModel will be overwritten on the input.
    - If quotes are not required in the oData request object, use overload on the directive (e.g. data-st-advanced-search="{property: 'Id', ignoreQuotes: true}");
    - If 'ignoreQuotes' is not used or is false, expression will always be:
        substring('Id', VALUE)
    - If 'ignoreQuotes' is true, expression will always be:        
        'Id' eq VALUE

Case (2): Datepicker
---------------
Element: 
     <input data-st-advanced-search="'StartDate'"  
            data-st-as-operator-override="'gt'"
            close-on-date-selection="false" show-button-bar="false" show-weeks="false" class="input-sm form-control"
            data-st-as-lazy-attributes="{'datepicker' : ApplicationConstants.formatDate}"
            data-st-as-height-override="400" 
            data-st-as-width-override="315"  />

Result:
    - Datepicker will be used in the drop down (instantiated via the lazy attribute loading)
    - 'st-as-operator-override' is used to construct the odata query. Cannot be used with 'useODataExpressions'.
    - Attributes on the element will be carried over to the new datepicker
    - Added a few overrides for the height and width of the window popup that shows up.


Case (3): One property with multiple values
---------------
Element: 
    <select data-st-advanced-search="{property: 'IsDraft', ignoreQuotes: true}" class="input-sm form-control">
        <option value="false">Active</option>
        <option value="true">Draft</option>
    </select>

Result:
    - Select will be replaced with a checklist.
    - Quotes will be ignored as per the overload (see above)
    - Property used is "IsDraft" on the collection set returned from the stTable property. 
    - oData query will be constructed as follows if both checkboxes are selected for example:
        (IsDraft eq true or IsDraft eq false)

Case (4): Custom Expressions
---------------
Element:
    <select data-st-advanced-search="{ useODataExpressions: true }" class="input-sm form-control">
        <option data-st-advanced-search-expression="IsDraft eq false">Active</option>
        <option data-st-advanced-search-expression="IsDraft eq true">Draft</option>
    </select>

Result:
    - Select will be replaced as above.
    - OData expressions will be added from the custom attribute 'data-st-advanced-search-expression'
    - 'property' is optional
    - Everytime a checkbox is checked, the expression in the option will be added to the oData query.
    - Resulting oData query when all checkboxes are checked will be:
        (IsDraft eq true or IsDraft eq false)


**/

(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stAdvancedSearch', ['$timeout', '$window', '$rootScope', '$compile', '$filter', function ($timeout, $window, $rootScope, $compile, $filter) {
            function updateCodeItemsOverride(scope) {
                var returnList = [];

                angular.forEach(scope.codeItemsOverride, function (codeItem) {
                    if (codeItem) {
                        if (typeof codeItem.id !== "undefined") {
                            codeItem.value = codeItem.id;
                        }

                        var codeItemOption = {
                            value: '', text: '', isSelected: false, defaultSelected: false
                        };
                        angular.extend(codeItemOption, codeItem);
                        returnList.push(codeItemOption);
                    }
                });

                return returnList;
            }


            return {
                require: '^stTable',
                replace: true,
                template: "<div class='stAdvancedSearch menu' style='position: relative;'>" +
                                    "<div ng-click='toggleFilterDialogVisibility()' style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;'><span>&nbsp;{{searchValue.text}}</span></div>" +
                                    '<div class="menu-dropdown" data-ng-show="showDialog">' +
                                        '<div class="menu-header">Filter <span ng-click=\"clear()\" class="pull-right badge badge-info">Clear</span></div>' +
                                        '<div class="menu-content">' +
                                            '<stas-placeholder></stas-placeholder>' +
                                        '</div>' +
                                        '<div class="menu-footer">' +
                                            '<a class="btn btn-success pull-right" ng-click="search()">Go</a>' +
                                        '</div>' +
                                    '</div>' +
                             "</div>",
                transclude: 'element',
                scope: {
                    predicateUI: '=?stAdvancedSearch',
                    lazyAttributes: '=?stAsLazyAttributes',
                    heightOverride: '=?stAsHeightOverride',
                    widthOverride: '=?stAsWidthOverride',
                    operatorOverride: '=?stAsOperatorOverride',
                    codeItemsOverride: '=?stAsOptionsOverride'
                },

                link: function (scope, element, attr, ctrl, transcludeFn) {

                    // Precompilation of the element
                    function setupElement(el, lazyAttributes) {
                        var elementType = el[0].tagName.toLowerCase();
                        if (!elementType) return null;
                        var scopeAdditions = {};
                        // Input model setting
                        if (lazyAttributes) {
                            var newEl = angular.element("<" + elementType + "></" + elementType + ">");

                            // Copy attributes
                            for (var i = 0, l = el[0].attributes.length; i < l; ++i) {
                                var nodeName = el[0].attributes.item(i).name;
                                var nodeValue = el[0].attributes.item(i).value;

                                if (nodeName != 'data-st-advanced-search' && nodeName != 'st-advanced-search'
                                    && nodeName != 'data-ng-model' && nodeName != 'ng-model') {
                                    newEl.attr(nodeName, nodeValue);
                                }
                            }

                            for (var prop in lazyAttributes) {
                                newEl.attr(prop, lazyAttributes[prop]);
                            }

                            if (typeof newEl.attr('datepicker') != 'undefined') {
                                elementType = 'datepicker';
                            }

                            el = newEl;
                            el.attr('data-ng-model', 'draftSearchValue.value');
                        }
                        else if (elementType == "input") {
                            el.removeAttr('data-st-advanced-search');
                            el.removeAttr('st-advanced-search');
                            el.removeAttr('data-ng-model');
                            el.removeAttr('ng-model');

                            el.attr('data-ng-model', 'draftSearchValue.value');
                        }
                        // Select HTML conversion
                        //else if (elementType == "select") {
                        //    var options = el.find('option');
                        //    scopeAdditions.multiFilterOptions = [];

                        //    angular.forEach(options, function (item) {
                        //        var attributeLookup = item.attributes['st-advanced-search-expression'] || item.attributes['data-st-advanced-search-expression'] || item;
                        //        scopeAdditions.multiFilterOptions.push({ value: attributeLookup.value, text: item.text, isSelected: false });
                        //    });

                        //    // create a new el
                        //    el = angular.element('<ul class="list-group checked-list-box"><li data-ng-repeat="option in multiFilterOptions" class="list-group-item"><input type="checkbox" data-ng-model="option.isSelected" data-ng-change="selectFilter(option, $event)" /><span class="lbl" data-ng-click="selectFilter(option, $event)">{{option.text}}</span></li></ul>');
                        //}

                        else if (elementType == "select") {
                            scopeAdditions.multiFilterOptions = [];

                            if (scope.codeItemsOverride && scope.codeItemsOverride.length > 0) {
                              
                                scope.$watch('codeItemsOverride', function (newVal, oldVal) {
                                    scope.multiFilterOptions = updateCodeItemsOverride(scope);
                                });

                               // scopeAdditions.multiFilterOptions = updateCodeItemsOverride(scope);
                            } else {
                                var options = el.find('option');

                                angular.forEach(options, function(item) {
                                    var attributeLookup = item.attributes['st-advanced-search-expression'] || item.attributes['data-st-advanced-search-expression'] || item;
                                    var isSelected = item.attributes['st-advanced-search-selected'] || item.attributes['data-st-advanced-search-selected'] || { value: '' };
                                    scopeAdditions.multiFilterOptions.push({
                                        value: attributeLookup.value,
                                        text: item.text,
                                        isSelected: false,
                                        defaultSelected: isSelected.value === 'true'
                                    });
                                });
                            }

                            // create a new el
                            el = angular.element('<ul class="list-group checked-list-box"><li data-ng-repeat="option in multiFilterOptions" class="list-group-item"><input type="checkbox" data-ng-model="option.isSelected" data-ng-change="selectFilter(option, $event)" /><span class="lbl" data-ng-click="selectFilter(option, $event)">{{option.text}}</span></li></ul>');
                        }


                        return {
                            element: el,
                            type: elementType,
                            scopeAdditions: scopeAdditions
                        };
                    }

                    // Setup of the element
                    var oldElement = transcludeFn();

                    if (oldElement.hasClass('fixed')) {
                        var th = element.parent();
                        th.css('overflow', 'visible');
                    }

                    var newElementObj = setupElement(oldElement, scope.lazyAttributes);
                    if (!newElementObj) return;

                    scope.originalSource = newElementObj.type;

                    // Extend scope
                    angular.extend(scope, newElementObj.scopeAdditions);
                    // Replace element
                    var placeholderParent = element.find('stas-placeholder').parent();
                    placeholderParent.html(newElementObj.element);
                    $compile(placeholderParent.contents())(scope);

                    // Extend options
                    scope.setPredicate = function (value) {
                        var predicateObject = value;
                        if (typeof predicateObject == 'string') {
                            predicateObject = { property: predicateObject };
                        }
                        scope.predicate = angular.extend({ property: "" }, predicateObject);
                        scope.predicate.originalProperty = scope.predicate.property;
                    }

                    scope.setPredicate(scope.predicateUI);

                    if (scope.predicate.useODataExpressions === true && scope.operatorOverride) {
                        throw 'Invalid use of directive! Cannot use operator override and OData Expressions!';
                    }

                    if (scope.heightOverride) {
                        element.find('div.menu-dropdown').css('height', scope.heightOverride + "px");
                    }

                    if (scope.widthOverride) {
                        element.find('div.menu-dropdown').css('width', scope.widthOverride + "px");
                    }

                    // Main Logic
                    scope.searchValue = { value: "", text: "" };
                    scope.draftSearchValue = { value: "", text: "" };
                    scope.showDialog = false;

                    scope.toggleFilterDialogVisibility = function () {
                        scope.showDialog = !scope.showDialog;
                        return scope.showDialog;
                    };

                    // Input specific logic (events)
                    if (scope.originalSource == "input") {
                        var input = element.find('input').first();

                        input.bind("keydown keypress", function (directiveScope) {
                            return function (event) {
                                if (event.which === 13) {
                                    directiveScope.$apply(function () {
                                        directiveScope.search();
                                    });

                                    event.preventDefault();
                                }
                            }
                        }(scope));


                        // Focus on textbox
                        var oldVisibiltyFunction = scope.toggleFilterDialogVisibility;
                        scope.toggleFilterDialogVisibility = function (focusedElement) {
                            return function () {
                                if (oldVisibiltyFunction()) {
                                    $timeout(function () {
                                        focusedElement.focus();
                                    });
                                }
                            }
                        }(input);

                        scope.$watch('draftSearchValue.value', function (newVal, oldVal) {
                            scope.draftSearchValue.text = newVal;
                        });
                    }
                        // Select specific logic (events)
                    else if (scope.originalSource == "select") {

                        scope.refreshDraft = function () {
                            var newSelectedText = "";
                            var newSelectedValues = [];
                            var results = _.where(scope.multiFilterOptions, { isSelected: true });

                            for (var i = 0; i < results.length; i++) {
                                var result = results[i];
                                newSelectedValues.push(result.value);

                                newSelectedText += result.text;
                                if (i < results.length - 1) {
                                    newSelectedText += ", ";
                                }
                            }
                            scope.draftSearchValue.value = newSelectedValues;
                            scope.draftSearchValue.text = newSelectedText;
                        }

                        scope.selectFilter = function (filterOption, $e) {
                            // Add clause for label selection
                            if ($e && !angular.element($e.toElement).is('input')) {
                                filterOption.isSelected = !filterOption.isSelected;
                            }
                            scope.refreshDraft();
                        }

                        scope.changeSelection = function () {
                            scope.refreshDraft();
                        }

                        scope.$watch('draftSearchValue.value', function (newVal, oldVal) {
                            if (!newVal) {
                                angular.forEach(scope.multiFilterOptions, function (item) {
                                    item.isSelected = false;
                                });
                                scope.refreshDraft();
                            }
                        });

                        var results = _.where(scope.multiFilterOptions, { defaultSelected: true });
                        if (results.length > 0) {
                            // Defaults are set
                            for (var i = 0; i < results.length; i++) {
                                var result = results[i];
                                result.isSelected = true;
                                scope.draftSearchValue.value = result.value;
                                scope.draftSearchValue.text = result.text;
                                scope.searchValue.value = result.value;
                                scope.searchValue.text = result.text;
                            }
                        }
                    }

                    else if (scope.originalSource == 'datepicker') {

                        scope.predicate.ignoreQuotes = true;

                        scope.extractDateFormatFromDatePicker = function(datePickerElement) {
                            return datePickerElement.attr('datepicker');
                        }
                        
                        scope.$watch('draftSearchValue.value', function (dpEl) {
                            return function (newVal, oldVal) {
                                // Date composition
                                if (!newVal) {
                                    scope.draftSearchValue.value = "";
                                    scope.draftSearchValue.text = "";
                                }
                                else if (newVal instanceof Date) {
                                    var compiledElement = dpEl.children().first();
                                    var dateFormat = scope.extractDateFormatFromDatePicker(compiledElement);

                                    var newDateVal = $filter('date')(newVal, "yyyy-MM-dd");
                                    var newDateText = newDateVal;
                                    newDateVal = 'datetime\'' + newDateVal + '\'';

                                    if (dateFormat) {
                                        newDateText = $filter('date')(newVal, dateFormat);
                                        var prefixSymbol = "";
                                        switch (scope.operatorOverride) {
                                            case "eq":
                                                prefixSymbol = "= ";
                                                break;
                                            case "gt":
                                                prefixSymbol = "> ";
                                                break;
                                            case "ge":
                                                prefixSymbol = ">= ";
                                                break;
                                            case "lt":
                                                prefixSymbol = "< ";
                                                break;
                                            case "le":
                                                prefixSymbol = "<= ";
                                                break;
                                            default:
                                                prefixSymbol = "";
                                        }
                                        newDateText = prefixSymbol + newDateText;
                                    }
                                    
                                    scope.draftSearchValue.value = newDateVal;
                                    scope.draftSearchValue.text = newDateText;
                                }
                            };
                        }(placeholderParent));
                    } 

                    var tableCtrl = ctrl;

                    // Search and Clear Functions

                    scope.search = function () {

                        var draftValue = scope.draftSearchValue.value;

                        //If from Invoice Pending Release; nullify selections;
                        if (scope.$parent.masterSelecter !== undefined) {
                            scope.$parent.selectionObj.deselectAll();
                            scope.$parent.masterSelecter = false;
                        }
                        var property = scope.predicate.property || '';

                        // Don't add the option to add quotes to expression based searching
                        if (scope.predicate.useODataExpressions === true || typeof (scope.operatorOverride) != 'undefined') {
                            // If no property name is specified, generate it.
                            if (!property) {
                                // Generated property name (won't be used for OData anyway)
                                property = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                                scope.predicate.property = property;
                            }
                            property = "ODATAEXP_" + property;
                        }

                        if (typeof (scope.operatorOverride) != 'undefined' && draftValue.trim() !== "") {

                            // Need to add time in the case of less than equal to -- to be the last second of the day
                            if (draftValue && scope.operatorOverride === 'le') {
                                var dateExtractor = /^datetime\'([0-9]{4}-[0-9]{2}-[0-9]{2})\'/;
                                var matches = dateExtractor.exec(draftValue);
                                if (matches && matches.length > 1) {
                                    var dateMatch = matches[1];
                                    draftValue = 'datetime\'' + dateMatch + 'T23:59:59\'';
                                }
                            }

                            draftValue = scope.predicate.originalProperty + " " + scope.operatorOverride + " " + draftValue;
                        }

                        if (draftValue) {

                            if (scope.predicate.useODataExpressions !== true) {
                                // Searches using one property and either (1) an array based of values or (2) a single value
                                if (angular.isArray(draftValue)) {
                                    // Array based values for one property
                                    for (var i = 0; i < draftValue.length; i++) {
                                        draftValue[i] = scope.predicate.ignoreQuotes
                                            ? draftValue[i] + (scope.predicate.valueSuffix ? scope.predicate.valueSuffix : '')
                                            : "'" + draftValue[i] + (scope.predicate.valueSuffix ? scope.predicate.valueSuffix : '') + "'";
                                    }
                                } else {
                                    // Single value for one property
                                    draftValue = scope.predicate.ignoreQuotes
                                        ? draftValue + (scope.predicate.valueSuffix ? scope.predicate.valueSuffix : '')
                                        : "'" + draftValue + (scope.predicate.valueSuffix ? scope.predicate.valueSuffix : '') + "'";
                                }
                            }
                        }
                        // If empty array, we need to clear the search
                        if (angular.isArray(draftValue) && draftValue.length == 0) {
                            draftValue = '';
                        }

                        tableCtrl.search(draftValue, property);
                        scope.searchValue.value = scope.draftSearchValue.value;
                        scope.searchValue.text = scope.draftSearchValue.text;
                        scope.showDialog = false;

                        // If this page has THead and TBody in separate tables, then bring 
                        // scrollbar to top most point after search or clear in filtering
                        var findByClass = document.getElementsByClassName("horizontal-scroll");
                        angular.forEach(findByClass, function (currentElement) {
                            angular.forEach(currentElement.children, function (child) {
                                if (child.firstElementChild.localName == "tbody") {
                                    currentElement.scrollTop = 0;
                                }
                            });
                        });

                    }

                    scope.clear = function () {

                        scope.draftSearchValue = { value: "", text: "" };
                        scope.search();
                    }

                    // Existing scope watchers (see stSearch.js)

                    scope.$watch('predicateUI', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            scope.setPredicate(newValue);
                            ctrl.tableState().search = {};
                            //tableCtrl.search(element[0].value || '', newValue);
                            scope.search();
                        }
                    });

                    scope.$watch(function () {
                        return ctrl.tableState().search;
                    }, function (newValue, oldValue) {
                        var predicateExpression = scope.predicate.property || '$';
                        if (newValue.predicateObject && newValue.predicateObject[predicateExpression] !== element[0].value) {
                            element[0].value = newValue.predicateObject[predicateExpression] || '';
                        }
                    }, true);


                    // Click events to hide popup

                    $rootScope.$on('stAdvancedSearchCloseAll', function (currentScope) {
                        return function (event, scopeId) {
                            if (currentScope.showDialog && currentScope.$id != scopeId) {
                                $timeout(function () {
                                    currentScope.showDialog = false;
                                    currentScope.draftSearchValue.value = scope.searchValue.value;
                                    currentScope.draftSearchValue.text = scope.searchValue.text;
                                });
                            }
                        };
                    }(scope));

                    element.bind('click', function (currentScope) {
                        return function (e) {
                            $rootScope.$broadcast('stAdvancedSearchCloseAll', currentScope.$id);
                            e.stopPropagation();
                        };
                    }(scope));

                    var w = angular.element($window);
                    w.bind('click', function (parentEl) {
                        return function (e) {
                            if (angular.element(e.target) != parentEl[0].children[0]) {
                                scope.showDialog = false;
                                scope.draftSearchValue.value = scope.searchValue.value;
                                scope.draftSearchValue.text = scope.searchValue.text;
                                scope.$apply();
                            }
                        }
                    }(element));
                }
            }
        }
        ]);
})(angular);




