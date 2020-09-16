// Opens a new window full of checkboxs with a title matching the visible column name.
// This window gives the ability to manipulate visibility using checkboxs displayd on the menu

(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stOpenColumnView', ['$window', '$compile', function ($window, $compile) {
            return {
                restrict: "E",
                replace: true,
                template: "<div class='stAdvancedSearch menu' style='position: relative !important; z-index: 100;'>" +
                                    '<div class="menu-dropdown stOpenColumnEditor" data-ng-show="showColumnView" style="width: {{customWidthForEditColumnsView}};">' +
                                        '<div class="menu-header"><b>Edit Columns</b>' +
                                         //'<input class="pull-right" type="checkbox" ng-click="toggleKeepScreenOpen()" /><span ng-click=\"resetChangesColumnCleaning()\" class="pull-right badge badge-info">Clear</span>' +
                                         '<span ng-click=\"resetChangesColumnCleaning()\" class="pull-right badge badge-info">Clear</span>' +
                                    '</div>' +
                                        '<div class="menu-content" style="margin-bottom:20px;">' +
                                             // Glyphicon-eye and innerHTML text changes for the following two spans depending on if there any checkboxes selected
                                            '<span ng-click=\"resetMenuCheckboxes(false)\" class="pull-left glyphicon glyphicon-eye-close" style="margin-top:2px;"></span>' +
                                            '<span ng-click=\"resetMenuCheckboxes(false)\" class="pull-left text-primary" style="margin-left:7px;">Hide/Show Columns</span>' +
                                            '<a class="btn btn-success pull-right" ng-click="saveColumnSettings()">Save</a>' +
                                        '</div>' +
                                        '<div class="menu-content">' +
                                                '<stas-placeholder></stas-placeholder>' +
                                        '</div>' +
                                        //'<div style="display:inline-flex" class="menu-content">' +
                                        //       '<a class="btn pull-right" ng-click="returnColumnsToOriginal()">Original State</a>' +
                                        //       '<a class="btn pull-right" ng-click="returnColumnsToLastLoad()">Last load</a>' +
                                        //'</div>' +
                                     '</div>' +
                             "</div>",
                transclude: 'element',

                link: function (scope, element, attr, ctrl, transcludeFn) {

                    function detectIE() {
                        var isIE = /*@cc_on!@*/false || !!document.documentMode;
                        return isIE;
                    }

                    scope.ieVersion = detectIE();
                    //scope.keepEditScreenOpen = false;

                    // Precompilation of the element
                    function setupElementView(el) {
                        el = angular.element('<ul class="list-group checked-list-box"></ul>');
                        for (var i = 0; i < scope.penNames.length; i++) {
                            var li = angular.element('<li class="list-group-item padding-block"><input id="'
                                + scope.penNames[i] + '" type="checkbox"></input><label for="' + scope.penNames[i] + '">' + scope.appearanceNameList[i] + ' </label></li>');
                            el[0].appendChild(li[0]);
                        }

                        scope.checkboxPositions = el[0].childNodes;

                        return {
                            element: el,
                        };
                    }

                    // Setup of the element
                    var oldElement = transcludeFn();

                    if (oldElement.hasClass('fixed')) {
                        var th = element.parent();
                        th.css('overflow', 'visible');
                    }

                    var newElementObj = setupElementView(oldElement);
                    if (!newElementObj) return;

                    // Replace element
                    var placeholderParent = element.find('stas-placeholder').parent();
                    placeholderParent.html(newElementObj.element);
                    placeholderParent[0].parentElement.parentElement.style.marginLeft = "calc(" + scope.customWidth + " - " + scope.customWidthForEditColumnsView + ")";
                    $compile(placeholderParent.contents())(scope);

                    scope.showColumnView = false;

                    scope.toggleFilterDialogVisibility = function () {
                        scope.showColumnView = !scope.showColumnView;
                        scope.resetColumnView();
                        return scope.showColumnView;
                    };

                    //scope.toggleKeepScreenOpen = function () {
                    //    scope.keepEditScreenOpen = !scope.keepEditScreenOpen;
                    //};

                    var childNumber = 0;
                    // Figure out child number for the open column view button through parent
                    var check = false;
                    var number = 0;
                    angular.forEach(element[0].parentElement.children, function (child) {
                        if (!check && child.classList) {
                            for (var i = 0; i < child.classList.length ; i++) {
                                if (child.classList[i] == "enter-column-settings") {
                                    check = true;
                                    childNumber = number;
                                    break;
                                }
                            }
                        }
                        number++;
                    });
                    var w = angular.element($window);
                    w.bind('click', function (parentElem) {
                        return function (e) {
                            //if (!scope.keepEditScreenOpen) {
                                // If windows isn't currently launched then do nothing here
                                if (scope.showColumnView) {
                                    var foundParent = (element[0].children[0]).contains(e.target);

                                    // If user has clicked on not current object or open column button, then hide window
                                    if (!foundParent && e.target != parentElem[0].parentElement.children[childNumber]) {
                                        scope.showColumnView = false;
                                    }
                                }
                            }
                        //}
                    } (element));
                }
            }
        }
        ]);
})(angular);