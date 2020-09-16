/// <reference path="C:\Projects\tfs\Development\BluePhoenix\Procom.Phoenix.Web\Phoenix/app/directive/stAdvancedSearchNormal.html" />
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
            data-st-as-lazy-attributes="{'uib-datepicker' : ApplicationConstants.formatDate}"
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

// Number inputs and search inputs: 
All type="search" fields don't have a numberType set to them. To restrict them to numbers, they use data-safe-restrict-input="[^0123456789]" or data-safe-restrict-input="[^-0123456789]" to support negatives.

If type="search" then it assumes the underlying is correct:
That the value is compared as a number, and uses comparative functions, not operands.

......................

Input elements with numberType in their class may still use comparative functions instead of operands. But those that actually apply filter, hence using operands, should use the "useNumberAdvancedSearch" class to use the number advanced search

**/

(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stAdvancedSearch', ['$timeout', '$window', '$rootScope', '$compile', '$filter', function ($timeout, $window, $rootScope, $compile, $filter) {
            return {
                require: '^?stTable',
                replace: true,
                //templateUrl: '/custom-vendor/smart-table/stAdvancedSearchNormal.html',
                templateUrl: '/Phoenix/app/directive/stAdvancedSearchNormal.html',
                transclude: 'element',
                scope: {
                    predicateUI: '=?stAdvancedSearch',
                    lazyAttributes: '=?stAsLazyAttributes',
                    heightOverride: '=?stAsHeightOverride',
                    widthOverride: '=?stAsWidthOverride',
                    operatorOverride: '=?stAsOperatorOverride',
                    codeItemsOverride: '=?stAsOptionsOverride',
                    allowedDecimalPlaces: '=?stAsAllowedDecimalPlaces',
                    useSecondarySearch: '=?stUseSecondarySearch'
                },

                link: function (scope, element, attr, ctrl, transcludeFn) {

                    if (ctrl != undefined) {
                        var isNumberField = false;
                        var useNumberAdvancedSearch = false;
                        var useTextAdvancedSearch = false;
                        var disableAdvancedSearch = false;
                        var isTextField = false;
                        // This is the defualt value, but will be overwritted if there is more than one search using useODataExpressions
                        var privateRandomName = "AAAAA";
                        var alreadyAddedRandomName = false;
                        var elementTypeKeeper = "";
                        var selectionKeeper = [];
                        var calenderTextKeeper = "";
                        var calenderValueKeeper = "";

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

                        // If there is no property name given, make one. Although makes no sence not to give a porperty name to the search field.
                        if (!scope.predicate.property) {
                            // Generated property name (won't be used for OData anyway)
                            //property = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                            // Eventually use secondaryRandomComponent as a character number, and sequatially add it instead of creating random property names
                            var property = ""
                            var secondaryRandomComponent = "A";
                            var letterCounter = 65;
                            if (alreadyAddedRandomName == false) {
                                var length = ctrl.getRandomPropertyNames().length;
                                for (var g = 0; g < length; g++) {
                                    if (ctrl.getRandomPropertyNames()[g] == ("AAA" + secondaryRandomComponent)) {
                                        // increase secondary secondaryRandomComponent by one letter
                                        secondaryRandomComponent = String.fromCharCode(letterCounter + 1);
                                        letterCounter++;
                                    }
                                }
                                ctrl.getRandomPropertyNames().push("AAA" + secondaryRandomComponent);
                                privateRandomName = "AAA" + secondaryRandomComponent;
                                alreadyAddedRandomName = true;
                            }

                            scope.predicate.property = privateRandomName;
                        }

                        // limit to to 2 decimal places.
                        // Alternatively, add data-st-as-allowed-decimal-places="1" for a custom amount of decimal places
                        var numberOfDecimalPlaces = 2;
                        if (typeof (scope.allowedDecimalPlaces) != 'undefined') {
                            numberOfDecimalPlaces = scope.allowedDecimalPlaces;
                        }
                        var numberOfZeros = "";
                        for (var i = 0; i < numberOfDecimalPlaces; i++) {
                            numberOfZeros += "0";
                        }

                        scope.updateCodeItemsOverride = function (scope) {
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

                        scope.validateNumberField = function () {
                            var validatedText = "";                            
                            var draftValue = scope.draftSearchValue.value;

                            // Apply regex on validation if needed here below
                            //draftValue = draftValue.replace(/\D./g, '');

                            // Find number of decimals in string
                            //var numberOfDecimals = draftValue.replace(/[^.]/g, "").length;

                            // Get rid of multiple zeros in the front 
                            draftValue = draftValue.replace(/^0+(?!\.|$)/, '');

                            // If found a negative within the string
                            var foundNegative = draftValue.indexOf("-") != -1;

                            if (foundNegative) {
                                // Filter out the negative sign, and proceed to process value exactly through the same procedure as a positive number, but remember to add negative sign at the end.
                                // Incase of of multiple negative signs or typing negative sign in the middle of a number, take away all characters previous to the last negativesign in the string.
                                var splitDraftValue = draftValue.split("");
                                var lastKnownNegative = -1;
                                for (var h = 0; h < splitDraftValue.length; h++) {
                                    if (splitDraftValue[h] == "-") {
                                        lastKnownNegative = h;
                                    }
                                }
                                var collectedString = "";
                                for (var j = lastKnownNegative + 1; j < splitDraftValue.length; j++) {
                                    collectedString += splitDraftValue[j];
                                }
                                draftValue = collectedString;
                            }
                            if (draftValue != "") {
                                // Setting input type to number and max="2147483647" causes an error on right click on field in firefox
                                // Get input and check for max int value of 2147483647
                                var numberInput = parseInt(draftValue, 10);
                                if (numberInput >= 2147483647) {
                                    validatedText = "2147483647";
                                }
                                else {
                                    if (draftValue.indexOf('.') != -1 && draftValue != ".") {
                                        var dotSplit = draftValue.split('.')
                                        if (dotSplit.length >= 2) {
                                            validatedText = dotSplit[0] + '.' + dotSplit[1].slice(0, numberOfDecimalPlaces);
                                        }
                                        else if (dotSplit.length == 1) {
                                            if (dotSplit[0] != "") {
                                                validatedText = "." + dotSplit[0].slice(0, numberOfDecimalPlaces);
                                            }
                                        }

                                        if (validatedText.startsWith('.')) {
                                            validatedText = '0'+validatedText;
                                        }
                                    }
                                    else {
                                        validatedText = draftValue;
                                    }
                                }
                            }
                            if (foundNegative) {
                                validatedText = "-" + validatedText;
                            }
                            
                            scope.draftSearchValue.value = validatedText;
                            scope.draftSearchValue.text = validatedText;
                        }

                        scope.fixNumberField = function () {
                            // Decimal ending and starting in a string may cause a crash
                            var foundNegative = scope.draftSearchValue.value.indexOf("-") != -1;
                            var charArray = scope.draftSearchValue.value.split('');
                            if (typeof charArray != "undefined") {
                                if (foundNegative) {
                                    //remove the negative sign, do validation, then add negative sign to the front again
                                    charArray.shift();
                                    scope.draftSearchValue.value = scope.draftSearchValue.value.substring(1, scope.draftSearchValue.value.length);
                                }
                                if (charArray.length == 1 && charArray[0] == '.') {
                                    scope.draftSearchValue.value = "0" + scope.draftSearchValue.value + numberOfZeros;
                                }
                                else if (charArray[0] == '.') {
                                    scope.draftSearchValue.value = "0" + scope.draftSearchValue.value;
                                }
                                else if (charArray[charArray.length - 1] == '.') {
                                    scope.draftSearchValue.value = scope.draftSearchValue.value + numberOfZeros;
                                }
                                if (foundNegative) {
                                    if (scope.draftSearchValue.value != "") {
                                        scope.draftSearchValue.value = "-" + scope.draftSearchValue.value;
                                    } else {
                                        scope.draftSearchValue.value = "-0";
                                    }
                                }
                                scope.draftSearchValue.text = scope.draftSearchValue.value;
                            }
                        }

                        scope.numberTextValue = function () {
                            var prefixSymbol = "";
                            switch (scope.selectPropertySearch) {
                                case "0":
                                    prefixSymbol = "= ";
                                    break;
                                case "1":
                                    prefixSymbol = "!= ";
                                    break;
                                case "2":
                                    prefixSymbol = "> ";
                                    break;
                                case "3":
                                    prefixSymbol = ">= ";
                                    break;
                                case "4":
                                    prefixSymbol = "< ";
                                    break;
                                case "5":
                                    prefixSymbol = "<= ";
                                    break;
                                default:
                                    prefixSymbol = "";
                            }

                            scope.searchValue.text = prefixSymbol + scope.searchValue.text;
                        }

                        // Main Logic
                        scope.searchValue = { value: "", text: "" };
                        scope.draftSearchValue = { value: "", text: "" };
                        var onStartTempSearchValue = "";
                        var onStartTempSearchText = "";
                        var onStartTempSearchType = "0";
                        var overrideSearchNames = false;
                        scope.showDialog = false;

                        // Precompilation of the element
                        scope.setupElement = function (el, lazyAttributes) {
                            var elementType = el[0].tagName.toLowerCase();
                            if (!elementType) return null;
                            var scopeAdditions = {};
                            // Input model setting
                            lazyAttributes ? elementTypeKeeper = "calender" : elementTypeKeeper = elementType;
                            if (lazyAttributes) {
                                onStartTempSearchType = "gt";
                                if (lazyAttributes.hasOwnProperty('uib-datepicker')) {
                                    if (typeof lazyAttributes['uib-datepicker'] === 'undefined') {
                                        lazyAttributes['uib-datepicker'] = "MMM dd yyyy";
                                    }
                                }
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

                                if (typeof newEl.attr('uib-datepicker') != 'undefined') {
                                    elementType = 'uib-datepicker';
                                    if (!lazyAttributes['class']) {
                                        newEl.attr('class', '');
                                    }
                                }

                                el = newEl;
                                el.attr('data-ng-model', 'draftSearchValue.value');
                                el.attr('name', scope.predicateUI);
                            }
                            else if (elementType == "input") {
                                el.removeAttr('data-st-advanced-search');
                                el.removeAttr('st-advanced-search');
                                el.removeAttr('data-ng-model');
                                el.removeAttr('ng-model');

                                el.attr('data-ng-model', 'draftSearchValue.value');
                                if (scope.predicateUI != undefined) {
                                    el.attr('name', scope.predicateUI);
                                }

                                if ((element).hasClass("numberType") == true) {
                                    el.attr('data-ng-change', 'validateNumberField()');
                                    isNumberField = true;
                                    useNumberAdvancedSearch = true;
                                } else {
                                    isTextField = true;
                                }

                                // Force to have advanced Search
                                //if ((element).hasClass("useNumberAdvancedSearch") == true) {
                                //    useNumberAdvancedSearch = true;
                                //}
                                //if ((element).hasClass("useTextAdvancedSearch") == true) {
                                //    useTextAdvancedSearch = true;
                                //}
                                //if ((element).hasClass("useTextAdvancedSearch") == true) {
                                //    useTextAdvancedSearch = true;
                                //}
                                if ((element).hasClass("disableAdvancedSearch") == true) {
                                    disableAdvancedSearch = true;
                                }
                                // Add restrictions of max size depending on input type
                                if (element[0].hasAttribute("type")) {
                                    if (element[0].getAttribute("type") == "search") {
                                        // "URLs over 2,000 characters will not work in the most popular web browser."
                                        el.context.setAttribute('maxlength', '2000');
                                    }
                                }
                            }
                            else if (elementType == "select") {
                                scopeAdditions.multiFilterOptions = [];

                                if (scope.codeItemsOverride && scope.codeItemsOverride.length > 0) {

                                    scope.$watch('codeItemsOverride', function (newVal, oldVal) {
                                        //scope.multiFilterOptions = updateCodeItemsOverride(scope);
                                        scope.multiFilterOptions = scope.updateCodeItemsOverride(scope);
                                    });

                                    scopeAdditions.multiFilterOptions = scope.updateCodeItemsOverride(scope);
                                } else {
                                    var options = el.find('option');

                                    angular.forEach(options, function (item) {
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

                                // create a new element
                                // Give a name attribute for each column for easier automation when testing
                                if (scope.predicate.switchSearchType) {
                                    if (ctrl.tableState().isLoadedFromPreviousState === true && ctrl.tableState().search.predicateObject) {
                                        var tempProperty = "ODATAEXP_" + scope.predicate.property;
                                        // if the predicate property has ODATAEXP_ as a prefix to its array name, then we can safely assume that it uses the AND/OR switch search.
                                        var predicateObjectKeys = Object.keys(ctrl.tableState().search.predicateObject);
                                        for (var a = 0; a < predicateObjectKeys.length; a++) {
                                            if (predicateObjectKeys[a].indexOf("ODATAEXP_") != -1) {
                                                scope.useSecondarySearch = ctrl.tableState().search.predicateObject[tempProperty][ctrl.tableState().search.predicateObject[tempProperty].length - 1];
                                                a = predicateObjectKeys.length;
                                            }
                                        }
                                    }
                                    if (typeof scope.useSecondarySearch === 'undefined') {
                                        scope.useSecondarySearch = scope.predicate.useSecondarySearch;
                                    }
                                    // Allow selection between true and flase on useODataExpressions fields
                                    el = angular.element('<ul class="list-group checked-list-box"><li data-ng-repeat="option in multiFilterOptions" class="list-group-item"><input type="checkbox" name="{{option.text}}" data-ng-model="option.isSelected" data-ng-change="selectFilter(option, $event)" /><span class="lbl" name="{{option.text}}" data-ng-click="selectFilter(option, $event)">{{option.text}}</span></li></ul><div style="display: inline-block" class="pull-left"><span ng-if="!useSecondarySearch">Group Selection</span><span ng-if="useSecondarySearch">Individual Selection</span><label class="switch-smaller"><input style="margin-top: 0px;" type="checkbox" ng-checked="useSecondarySearch" data-ng-click="useSecondarySearch = !useSecondarySearch;"/><div class="slider slider-smaller round"></div></label></div>');
                                }
                                else {
                                    el = angular.element('<ul class="list-group checked-list-box"><li data-ng-repeat="option in multiFilterOptions" class="list-group-item"><input type="checkbox" name="{{option.text}}" data-ng-model="option.isSelected" data-ng-change="selectFilter(option, $event)" /><span class="lbl" name="{{option.text}}" data-ng-click="selectFilter(option, $event)">{{option.text}}</span></li></ul>');
                                }

                                scope.multiFilterOptions = scopeAdditions.multiFilterOptions;
                            }

                            if (ctrl.tableState().isLoadedFromPreviousState == true) {
                                overrideSearchNames = true;
                                var length = ctrl.getSearchNames().length;
                                for (var i = 0; i < length; i++) {
                                    if (scope.predicate.property == ctrl.getSearchNames()[i].property) {
                                        var value = ctrl.getSearchNames()[i].value;
                                        onStartTempSearchValue = value;
                                        onStartTempSearchText = ctrl.getSearchNames()[i].text;
                                        if (typeof ctrl.getSearchNames()[i].type != 'undefined') {
                                            onStartTempSearchType = ctrl.getSearchNames()[i].type;
                                        }
                                        if (typeof ctrl.getSearchNames()[i].directDate != 'undefined') {
                                            scope.savedDateText = ctrl.getSearchNames()[i].directDate;
                                        };
                                        // Extra management for select boxes
                                        if (elementTypeKeeper == "select") {
                                            // Clear default state
                                            angular.forEach(scope.multiFilterOptions, function (eachFilter) {
                                                eachFilter.isSelected = false;
                                                eachFilter.defaultSelected = false;
                                            });
                                            for (var v = 0; v < scope.multiFilterOptions.length; v++) {
                                                for (var r = 0; r < value.length; r++) {
                                                    if (scope.multiFilterOptions[v].value == value[r]) {
                                                        scope.multiFilterOptions[v].isSelected = true;
                                                        scope.multiFilterOptions[v].defaultSelected = true;
                                                    }
                                                }
                                            }
                                        }
                                        i = length;
                                    }
                                }
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

                        // Function which is activated upon changing calender search sign or calender value.
                        scope.changeCalenderSelection = function () {

                            // if scope.draftSearchValue.text is empty then make the date be today
                            if (scope.draftSearchValue.value === "") {
                                var todaysDate = $filter('date')(new Date(), "yyyy-MM-dd");
                                scope.savedDateText = todaysDate;
                                scope.draftSearchValue.text = todaysDate;
                                scope.searchValue.text = todaysDate;
                                scope.draftSearchValue.value = 'datetime\'' + todaysDate + '\'';
                            }
                            else {
                                scope.operatorOverride = scope.selectedCalenderSign;
                            }

                            // Change text only, value stays the same
                            if (scope.draftSearchValue.value !== "" && scope.draftSearchValue.text !== "" && typeof scope.savedDateText != 'undefined') {
                                var prefixSymbol = "";
                                switch (scope.operatorOverride) {
                                    case "eq":
                                        prefixSymbol = "= ";
                                        break;
                                    case "ne":
                                        prefixSymbol = "!= ";
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
                                var newDateText = prefixSymbol + scope.savedDateText;

                                scope.searchValue.text = newDateText;
                                //scope.searchValue.value = newDateText;
                                scope.draftSearchValue.text = newDateText;
                                //scope.draftSearchValue.value = newDateText;
                            }
                        }

                        //var newElementObj = setupElement(oldElement, scope.lazyAttributes);
                        var newElementObj = scope.setupElement(oldElement, scope.lazyAttributes);
                        if (!newElementObj) return;

                        scope.originalSource = newElementObj.type;

                        // Extend scope
                        angular.extend(scope, newElementObj.scopeAdditions);
                        // Replace element
                        var placeholderParent = element.find('stas-placeholder').parent();
                        placeholderParent.html(newElementObj.element);
                        if (elementTypeKeeper == "input") {
                            if (typeof onStartTempSearchType != 'undefined') {
                                // Set the selection property from previous save, if loading an already visited page
                                scope.selectPropertySearch = onStartTempSearchType;
                            }
                            if (disableAdvancedSearch === false) {
                                if (isTextField || useTextAdvancedSearch) {
                                    placeholderParent[0].innerHTML += '<div>Type: <select ng-model="' + 'selectPropertySearch' + '"><option value="0">Found within</option><option value="1">Start\'s with</option><option value="2">End\'s with</option></select></div>';
                                }
                                else if (useNumberAdvancedSearch) {
                                    placeholderParent[0].innerHTML += '<div>Type: <select ng-model="' + 'selectPropertySearch' + '"><option value="0">Equal (Exact Value)</option><option value="1">Not equal</option><option value="2">Greater than</option><option value="3">Greater than or equal</option><option value="4">Less than</option><option value="5">Less than or equal</option></select></div>';
                                }
                            }
                        } else if (elementTypeKeeper == "calender") {
                            if (typeof scope.operatorOverride == 'undefined') {
                                scope.operatorOverride = "gt";
                            }
                            scope.selectedCalenderSign = scope.operatorOverride;
                            if (typeof onStartTempSearchType != 'undefined' && onStartTempSearchType != "0") {
                                //scope.operatorOverride = onStartTempSearchType;
                                scope.selectedCalenderSign = onStartTempSearchType;
                            }
                            placeholderParent[0].innerHTML += '<div>Type: <select ng-model="selectedCalenderSign"><option value="eq">On the selected day</option><option value="ne">Any other day</option><option value="gt">All days above selected date</option><option value="ge">All days above and including the day</option><option value="lt">All days prior to the day</option><option value="le">All days prior to and including the day</option></select></div>';
                            //data-ng-change="changeCalenderSelection()"
                            //placeholderParent[0].innerHTML += '<br><div>Search by Quarters: <select ng-model="' + 'overrideOperator' + '"><option value="">No quarter selected/option><option value="ne"><option value="Q1">First Quarter(January 1 - March 31)</option><option value="Q2">Second Quarter(April 1 - June 30)</option><option value="Q3">Third Quarter(July 1 - September 30)</option><option value="Q4">Fourth Quarter(October 1 - December 31)</option></select></div>';
                        }
                        $compile(placeholderParent.contents())(scope);

                        if (scope.predicate.useODataExpressions === true && scope.operatorOverride) {
                            throw 'Invalid use of directive! Cannot use operator override and OData Expressions!';
                        }

                        if (scope.heightOverride) {
                            element.find('div.menu-dropdown').css('height', scope.heightOverride + "px");
                        }

                        if (scope.widthOverride) {
                            element.find('div.menu-dropdown').css('width', scope.widthOverride + "px");
                        }

                        scope.toggleFilterDialogVisibility = function () {
                            scope.showDialog = !scope.showDialog;
                            if (scope.showDialog) {
                                if (elementTypeKeeper == "select") {
                                    angular.forEach(scope.multiFilterOptions, function (filterObject) {
                                        if (selectionKeeper.indexOf(filterObject.value) != -1) {
                                            filterObject.isSelected = true;
                                        }
                                        else {
                                            filterObject.isSelected = false;
                                        }
                                    });
                                }
                                else if (elementTypeKeeper == "calender") {
                                    scope.searchValue.value = calenderValueKeeper;
                                    scope.searchValue.text = calenderTextKeeper;
                                }
                            }
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
                                if (oldVal.length > 1 && oldVal[oldVal.length - 1] == '.' && parseFloat(oldVal) == parseFloat(newVal))
                                    return;

                                scope.draftSearchValue.text = newVal;
                                if (newVal && elementTypeKeeper == "input" && useNumberAdvancedSearch) {                                    
                                    scope.numberTextValue();
                                    if (newVal !== oldVal) {
                                        scope.searchValue.text = "";
                                    }                                    
                                }
                            });
                        }
                            // Select specific logic (events)
                        else if (scope.originalSource == "select") {

                            scope.refreshDraft = function () {
                                var newSelectedText = "";
                                var newSelectedValues = [];
                                var results = _.filter(scope.multiFilterOptions, { isSelected: true });

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

                            var results = _.filter(scope.multiFilterOptions, { defaultSelected: true });
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

                            // Save intial selection
                            angular.forEach(scope.multiFilterOptions, function (filterObject) {
                                if (filterObject.isSelected) {
                                    selectionKeeper.push(filterObject.value);
                                }
                            });
                        }

                        else if (scope.originalSource == 'uib-datepicker') {

                            scope.predicate.ignoreQuotes = true;

                            scope.extractDateFormatFromDatePicker = function (datePickerElement) {
                                return datePickerElement.attr('uib-datepicker');
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
                                                case "ne":
                                                    prefixSymbol = "!= ";
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
                                            scope.savedDateText = newDateText;
                                            newDateText = prefixSymbol + newDateText;
                                        }

                                        scope.draftSearchValue.value = newDateVal;
                                        scope.draftSearchValue.text = newDateText;
                                    }
                                };
                            }(placeholderParent));
                        }

                        var tableCtrl = ctrl;
                        if (overrideSearchNames) {
                            scope.draftSearchValue.value = onStartTempSearchValue;
                            scope.draftSearchValue.text = onStartTempSearchText;
                            scope.searchValue.text = onStartTempSearchText || scope.searchValue.text;
                            scope.searchValue.value = onStartTempSearchValue || scope.searchValue.value;
                            if (elementTypeKeeper == "calender") {
                                calenderTextKeeper = onStartTempSearchText;
                                calenderValueKeeper = onStartTempSearchValue;
                            }
                        }

                        scope.clearAllSelections = function () {
                            if (elementTypeKeeper == "select") {
                                selectionKeeper = [];
                            }
                            else if (elementTypeKeeper == "calender") {
                                calenderValueKeeper = "";
                                calenderTextKeeper = "";
                            }

                            if (scope.$parent.selectionObj !== undefined) {
                                if (typeof scope.$parent.selectionObj.deselectAllRows != 'undefined') {
                                    scope.$parent.selectionObj.deselectAllRows();
                                    scope.$parent.masterSelecter = false;
                                    if (scope.$parent.selectAllButtonVisiblity !== undefined) {
                                        scope.$parent.selectAllButtonVisiblity = false;
                                    }
                                    //if (scope.$parent.selectEntire !== undefined) {
                                    //    if (scope.$parent.selectEntire.isSelected !== undefined) {
                                    //        scope.$parent.selectEntire.isSelected = false;
                                    //    }
                                    //}
                                }
                            }
                        }
                        // Search and Clear Functions
                        scope.search = function (onClear) {
                            if (elementTypeKeeper == "calender" && onClear !== true) {
                                scope.changeCalenderSelection();
                            }

                            if (isNumberField) {
                                scope.fixNumberField();
                            }
                            var draftValue = scope.draftSearchValue.value.slice();
                            if (isTextField) {
                                if (typeof draftValue != 'undefined') {
                                    draftValue = draftValue.replace(/'/g, "''");
                                }
                            }
                            // if using useODataExpressions is true
                            if (draftValue.length > 1) {
                                // Change this later, for now just pretend theres always two being selected
                                draftValue[0]
                            }
                            // If from Invoice Pending Release; nullify selections;
                            scope.clearAllSelections();

                            if (scope.predicate.maxLength && draftValue.length > scope.predicate.maxLength) {
                                alert('The filter length must not exceed ' + scope.predicate.maxLength + ' characters.');
                                return;
                            }

                            var property = scope.predicate.property || '';

                            // Don't add the option to add quotes to expression based searching
                            if (scope.predicate.useODataExpressions === true || typeof (scope.operatorOverride) !== 'undefined') {
                                // If no property name is specified, generate it.
                                if (typeof scope.predicate.switchSearchType !== 'undefined' && onClear !== true && draftValue.length > 0) {
                                    draftValue.push(scope.useSecondarySearch);
                                }

                                if (!property) {
                                    // Generated property name (won't be used for OData anyway)
                                    //property = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                                    // Eventually use secondaryRandomComponent as a character number, and sequatially add it instead of creating random property names
                                    var secondaryRandomComponent = "A";
                                    var letterCounter = 65;
                                    if (alreadyAddedRandomName == false) {
                                        var length = tableCtrl.getRandomPropertyNames().length;
                                        for (var g = 0; g < length; g++) {
                                            if (tableCtrl.getRandomPropertyNames()[g] == ("AAA" + secondaryRandomComponent)) {
                                                // increase secondary secondaryRandomComponent by one letter
                                                secondaryRandomComponent = String.fromCharCode(letterCounter + 1);
                                                letterCounter++;
                                            }
                                        }
                                        tableCtrl.getRandomPropertyNames().push("AAA" + secondaryRandomComponent);
                                        privateRandomName = "AAA" + secondaryRandomComponent;
                                        alreadyAddedRandomName = true;
                                    }

                                    property = privateRandomName;
                                    scope.predicate.property = property;
                                }
                                property = "ODATAEXP_" + property;
                            }

                            // Generate unique id for the specified search field, used as a further suffix for its property name
                            if (typeof (scope.operatorOverride) != 'undefined' && draftValue && draftValue.trim() !== "") {

                                var initDraftValue = draftValue;

                                draftValue = scope.predicate.originalProperty + " " + scope.operatorOverride + " " + initDraftValue;

                                // Need to add time in the case of less than equal to -- to be the last second of the day
                                if (scope.operatorOverride === 'le' || scope.operatorOverride === 'gt') {
                                    var dateExtractor = /^datetime\'([0-9]{4}-[0-9]{2}-[0-9]{2})\'/;
                                    var matches = dateExtractor.exec(initDraftValue);
                                    if (matches && matches.length > 1) {
                                        var dateMatch = matches[1];
                                        initDraftValue = 'datetime\'' + dateMatch + 'T23:59:59\'';
                                        draftValue = scope.predicate.originalProperty + " " + scope.operatorOverride + " " + initDraftValue;
                                    }
                                }
                                else if (scope.operatorOverride === 'eq') {
                                    var dateExtractor = /^datetime\'([0-9]{4}-[0-9]{2}-[0-9]{2})\'/;
                                    var matches = dateExtractor.exec(initDraftValue);
                                    if (matches && matches.length > 1) {
                                        var dateMatch = matches[1];

                                        var selectedDay = moment(dateMatch);
                                        var nextDay = moment(dateMatch).add(1, "day");

                                        var draftSelectedDay = 'datetime\'' + selectedDay.format('YYYY-MM-DD') + '\'';
                                        var draftNextDay = 'datetime\'' + nextDay.format('YYYY-MM-DD') + '\'';

                                        draftValue = scope.predicate.originalProperty + " ge " + draftSelectedDay + " and " + scope.predicate.originalProperty + " lt " + draftNextDay;
                                    }
                                }
                                else if (scope.operatorOverride === 'ne') {
                                    var dateExtractor = /^datetime\'([0-9]{4}-[0-9]{2}-[0-9]{2})\'/;
                                    var matches = dateExtractor.exec(initDraftValue);
                                    if (matches && matches.length > 1) {
                                        var dateMatch = matches[1];

                                        var selectedDay = moment(dateMatch);
                                        var nextDay = moment(dateMatch).add(1, "day");

                                        var draftSelectedDay = 'datetime\'' + selectedDay.format('YYYY-MM-DD') + '\'';
                                        var draftNextDay = 'datetime\'' + nextDay.format('YYYY-MM-DD') + '\'';

                                        draftValue = scope.predicate.originalProperty + " lt " + draftSelectedDay + " or " + scope.predicate.originalProperty + " gt " + draftNextDay;
                                    }
                                }
                            }

                            // for searches that need to be wrapped in extra quotes
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

                            if (!onClear) {
                                if (elementTypeKeeper == "input") {
                                    var searchSelectOptiontext = "";
                                    if (typeof scope.selectPropertySearch != 'undefined') {
                                        searchSelectOptiontext = scope.selectPropertySearch;
                                        for (var v = scope.selectPropertySearch.length; v < 3; v++) {
                                            searchSelectOptiontext += "0";
                                        }
                                    }
                                    else {
                                        searchSelectOptiontext = "000";
                                    }
                                    // Add three characters to the end, need to be removed before sending to assembler, this removal is done in oreq.smartTableAdapter.js
                                    if (draftValue !== "") {
                                        draftValue += searchSelectOptiontext;
                                    }
                                }
                            }

                            // If empty array, we need to clear the search
                            if (angular.isArray(draftValue) && draftValue.length == 0) {
                                draftValue = '';
                            }

                            // Save selection for Calender and Selection search fields
                            if (!onClear) {
                                if (elementTypeKeeper == "calender") {
                                    calenderTextKeeper = scope.draftSearchValue.text;
                                    calenderValueKeeper = scope.draftSearchValue.value;
                                }
                                else if (elementTypeKeeper == "select") {
                                    angular.forEach(scope.multiFilterOptions, function (filterObject) {
                                        if (filterObject.isSelected) {
                                            selectionKeeper.push(filterObject.value);
                                        }
                                    });
                                }
                            }

                            var foundPropertySearchName = false;
                            var length = tableCtrl.getSearchNames().length;
                            for (var i = 0; i < length; i++) {
                                if (tableCtrl.getSearchNames()[i].property == scope.predicate.property) {
                                    tableCtrl.getSearchNames()[i].value = scope.draftSearchValue.value;
                                    tableCtrl.getSearchNames()[i].text = scope.draftSearchValue.text;
                                    if (elementTypeKeeper == "input") {
                                        tableCtrl.getSearchNames()[i].type = scope.selectPropertySearch;
                                    }
                                    else if (elementTypeKeeper == "calender") {
                                        tableCtrl.getSearchNames()[i].type = scope.operatorOverride;
                                    }
                                    if (typeof scope.savedDateText != 'undefined' && typeof scope.savedDateText != "") {
                                        tableCtrl.getSearchNames()[i].directDate = scope.savedDateText;
                                    }

                                    foundPropertySearchName = true;
                                    i = length;
                                }
                            }

                            if (foundPropertySearchName === false) {
                                var type = "0";
                                if (elementTypeKeeper == "input") {
                                    type = scope.selectPropertySearch;
                                }
                                else if (elementTypeKeeper == "calender") {
                                    type = scope.operatorOverride;
                                }
                                var searchNameObj = {
                                    type: type,
                                    value: scope.draftSearchValue.value,
                                    text: scope.draftSearchValue.text,
                                    property: scope.predicate.property
                                }
                                if (typeof scope.savedDateText != 'undefined' && typeof scope.savedDateText != "") {
                                    searchNameObj.directDate = scope.savedDateText;
                                }
                                tableCtrl.getSearchNames().push(searchNameObj);
                            }

                            tableCtrl.search(draftValue, property);
                            scope.searchValue.value = scope.draftSearchValue.value;
                            scope.searchValue.text = scope.draftSearchValue.text;
                            if (elementTypeKeeper == "input" && useNumberAdvancedSearch && !onClear) {
                                scope.numberTextValue();
                            }
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
                            scope.draftSearchValue = {
                                value: "", text: ""
                            };
                            for (var i = 0; i < tableCtrl.getSearchNames().length; i++) {
                                if (scope.predicate.property == tableCtrl.getSearchNames()[i].property) {
                                    tableCtrl.getSearchNames()[i].value = "";
                                    tableCtrl.getSearchNames()[i].text = "";
                                    tableCtrl.getSearchNames()[i].type = "000";
                                }
                            }
                            scope.search(true);
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
                                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(); }
                                    else { scope.$eval(); }
                                }
                            }
                        }(element));
                    }
                }
            }
        }
        ]);
})(angular);