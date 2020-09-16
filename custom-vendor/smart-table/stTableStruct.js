(function (ng) {
    'use strict';
    ng.module('smart-table')
    .directive('stTableStruct', ['$compile', 'UserProfileSearchSettingsApiService', '$q', '$state', function ($compile, UserProfileSearchSettingsApiService, $q, $state) {
        return {
            // Compiles code based on info gathered from stHead directive
            restrict: 'A',
            priority: 902,
            link: function (scope, iElement, iAttrs, controller) {
                if (scope.penNames == undefined) {
                    scope.penNames = iElement.context.nameColumns;
                    scope.appearanceNameList = iElement.context.innerHTMLList;
                    var attrClassBody = '';
                    var attrClassHead = '';
                    // Currently all directives and etc. inside addon's will run twice, once at compile time, and secondly at the end of this directive compiled a second time
                    var attrAddons = '';
                    scope.customWidth = "100%";
                    scope.minWidth = iElement.context.setMinWidth;
                    var style = '';
                    angular.forEach(iElement.context.attributes, function (a) {
                        if (a !== null && a.name != 'st-table-struct' && a.name != 'data-st-table-struct') {
                            if (a.name == 'class') {
                                attrClassHead = 'class=' + '"' + a.value + ' table table-striped table-content table-hover"';
                                attrClassBody = 'class=' + '"' + a.value + ' table table-striped table-content table-hover"';
                            }
                            else if (a.name == 'style') {
                                // modifications inside style are to be attributed to the div level, where encaplusation of the tbody table happens
                                style += ' ' + a.name + '=\"' + a.value + '\"';
                                iElement.removeAttr("style");
                            }
                            else {
                                attrAddons += ' ' + a.name + '=\"' + a.value + '\"';
                            }
                        }
                    });
                    if (attrClassHead == '') {
                        attrClassHead = 'class="table table-striped table-content table-hover"';
                    }
                    if (attrClassBody == '') {
                        attrClassBody = 'class="table table-striped table-content table-hover"';
                    }

                    var stTableValue = 'data-st-table=""';
                    var stPipeValue = "";
                    var widthDimensions = "";
                    var scrollAttr = "";
                    // the default width without changes is 250px for the edit columns view
                    scope.customWidthForEditColumnsView = "250px";
                    var customMarginLeft = 100 - scope.customWidth.replace(/%/g, '') + "%";
                    // var tempJSON = '[{"stTableValue" : "items"}, {"stPipeValue" : "pagesize"}, {"widthValues" : "[9, 13, 10, 13, 10, 10, 12, 9, 8, 6]"}, {"stPaginationValue" : "pageSize"}, {"stPaginationValue" : "pageSize"}, {"dontMakeServerCallOnStartup" : "true"}]';

                    // Comment out the block for array below and use
                    // this if Json, in the form like the example above
                    var tempJSON = iAttrs.stTableStruct;
                    if (tempJSON != undefined && tempJSON != "") {
                        var array = JSON.parse(tempJSON);
                        angular.forEach(array, function (obj) {
                            if (obj.hasOwnProperty("stTableValue")) {
                                //data-st-table="' + stTableValue + '"
                                stTableValue = 'data-st-table="' + obj.stTableValue + '"';
                            }
                            else if (obj.hasOwnProperty("stPipeValue")) {
                                stPipeValue = 'data-st-pipe="' + obj.stPipeValue + '"';
                            }
                            else if (obj.hasOwnProperty("widthValues")) {
                                // if width Values is ommited, all columns will be of equal value
                                widthDimensions = 'data-st-column-widths="' + obj.widthValues + '"';
                            }
                            else if (obj.hasOwnProperty("stPaginationValue")) {
                                scrollAttr = 'data-st-pagination-scroll-separated=\"' + obj.stPaginationValue + '\" ';
                            }
                            else if (obj.hasOwnProperty("customWidthForEditColumnsView")) {
                                scope.customWidthForEditColumnsView = obj.customWidthForEditColumnsView;
                            }
                                // Do not make server call upon load, wait for manual search of data
                            else if (obj.hasOwnProperty("dontMakeServerCallOnStartup")) {
                                scope.dontMakeServerCallOnStartup = obj.dontMakeServerCallOnStartup === "true";
                            }
                        });
                    }
                    scrollAttr == "" ? scope.noLoadingIndicator = true : scope.noLoadingIndicator = false;

                    iElement.removeAttr("data-st-table-struct");

                    // Foot HTML
                    var tFootHTML = "";
                    if (iElement.context.tFoot != null || iElement.context.tFoot != undefined) {
                        tFootHTML = '<div class="r-table-div5">'
                                + iElement.context.tFoot.innerHTML
                                + '</div>';
                    }

                    var bodyHtml = angular.element(iElement.context.ATBody);

                    // bodyHtml.attr('vs-repeat', '');
                    // bodyHtml.attr('vs-scroll-parent', '.r-table-div4');

                    // Compile function
                    function compileHTML() {
                        // Compile into one String
                        var separatedTableHTML =
                            '<div class="animate-show column-hiding-group">'
                               + '<button type="button" ng-click="toggleFilterDialogVisibility()" style="margin-right:' + customMarginLeft + ' !important;"' + ' class="enter-column-settings btn btn-clouds">Edit Columns View</button>'
                               + '<st-open-column-view></st-open-column-view> '
                          + '</div>'
                             + '<div data-st-draggable="" data-st-cloak="" class="r-table-div1" style="width:' + scope.customWidth + ' !important;"' + ' combine-horizontal-scrolls="horizontal-scroll" ' + stTableValue + ' ' + stPipeValue + ' ' + attrAddons + '>'
                                + '<div class="gray-border">'
                                    + '<div class="r-table-div2">'
                                        + '<div class="horizontal-scroll r-table-div3">'
                                            + '<table '
                                            + attrClassHead
                                            + ' data-st-initilization="" ' + widthDimensions + ' style="position: relative; table-layout: fixed;"'
                                            + ' >'
                                            + iElement.context.ATHead
                                            + '</table>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="horizontal-scroll r-table-div4" ' + scrollAttr + ' ' + style + '>'
                                         + '<table '
                                         + attrClassBody
                                         + ' data-st-r-fixed-header="" ' + widthDimensions + ' '
                                         + ' >'
                                         + bodyHtml[0].outerHTML
                                        + '</table>'
                                    + '</div>'
                                + '</div>'
                                    + tFootHTML
                           + '</div>'
                        ;
                        var compiled = $compile(separatedTableHTML)(scope);
                        iElement.parent().append(compiled);
                        iElement.remove();
                    }

                    // Hide the DOM that has loaded already previous to this directive running
                    iElement.context.style.display = "none";

                    function getUserSettings() {
                        var result = $q.defer();
                        // replace the dot with a value that is not a special character in order to pass from service to controller
                        // AF20161228. Sorry, I don't know how to make a regular expression to work here.
                        //var selfEncodedUri = ($state.current.name).replace('/./i', 'AAA20AAA');
                        var selfEncodedUri = ($state.current.name).replace('.', 'AAA20AAA').replace('.', 'AAA20AAA').replace('.', 'AAA20AAA');
                        // UserProfileSearchSettingsApiService.getAll().then(
                        // convert the state name to a passable string in order to be able to transfer to Assembler the value
                        UserProfileSearchSettingsApiService.getByStateRoutingName(selfEncodedUri).then(
                            function (responseSucces) {
                                var stateCurrentUserProfileSearchSetting = _.find(responseSucces.Items, function (item) { return item.StateRoutingName === $state.current.name; });
                                if (stateCurrentUserProfileSearchSetting) {
                                    stateCurrentUserProfileSearchSetting.StateRoutingNameEncoded = selfEncodedUri;
                                }
                                result.resolve(stateCurrentUserProfileSearchSetting);
                            },
                            function (responseError) {
                                result.reject(responseError);
                            }
                        ).then(function () {
                            scope.searchSettings = result.promise.$$state.value;
                            compileHTML();
                        }
                        );
                        return result.promise;
                    }

                    if (typeof $state.current.name === 'undefined' || $state.current.name === "" || $state.current.name == null) {
                        compileHTML();
                    }
                    else {
                        getUserSettings();
                    }
                }
            }
        };
    }]);
})(angular);