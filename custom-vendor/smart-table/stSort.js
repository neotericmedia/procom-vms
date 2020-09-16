(function (ng, undefined) {
    'use strict';
    ng.module('smart-table')
        .directive('stSort', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                require: '^?stTable',
                link: function (scope, element, attr, ctrl) {
                    if (ctrl != undefined) {
                        var predicate = attr.stSort;
                        var getter = $parse(predicate);
                        var index = 0;
                        var classAscent = attr.stClassAscent || 'st-sort-ascent';
                        var classDescent = attr.stClassDescent || 'st-sort-descent';
                        var stateClasses = ['st-sort-natural', classAscent, classDescent];

                        // Called on inital loadup of stSort, and if stSortDefault is defined. So in theory, should only be called once per smart table
                        scope.sort = function () {
                            index++;
                            if (index % 3 === 0) {
                                //manual reset
                                index = 0;
                                ctrl.tableState().sort = {};
                                ctrl.tableState().pagination.start = 0;
                                ctrl.pipe();
                            } else {
                                if (scope.dontMakeServerCallOnStartup && typeof scope.initTableState != "undefined") {
                                    scope.initTableState = ctrl.tableState();
                                }
                                ctrl.sortBy(predicate, index % 2 === 0, scope.dontMakeServerCallOnStartup);
                            }
                        }

                        if (ng.isFunction(getter(scope))) {
                            predicate = getter(scope);
                        }

                        element.bind('click', function sortClick() {
                            if (typeof scope.selectionObj !== 'undefined') {
                                scope.clearOldSelection();
                            }
                            if (predicate) {

                                if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                    scope.$apply(
                                        // copied from scope.sort = function () {...}
                                        function () {
                                            index++;
                                            if (index % 3 === 0) {
                                                //manual reset
                                                index = 0;
                                                ctrl.tableState().sort = {};
                                                ctrl.tableState().pagination.start = 0;
                                                ctrl.pipe();
                                            } else {
                                                ctrl.sortBy(predicate, index % 2 === 0);
                                            }
                                        });
                                }

                            }
                            var findByClass = document.getElementsByClassName("horizontal-scroll");
                            angular.forEach(findByClass, function (currentElement) {
                                angular.forEach(currentElement.children, function (child) {
                                    if (child.firstElementChild.localName == "tbody") {
                                        currentElement.scrollTop = 0;
                                    }
                                });
                            });
                            if (typeof scope.onLoadMoreThanOnePage != 'undefined') {
                                scope.onLoadMoreThanOnePage();
                            }
                        });

                        if (attr.stSortDefault !== undefined) {
                            index = attr.stSortDefault === 'reverse' ? 1 : 0;
                            scope.sort();
                        }

                        //table state --> view
                        scope.$watch(function () {
                            return ctrl.tableState().sort;
                        }, function (newValue, oldValue) {
                            if (newValue.predicate !== predicate) {
                                index = 0;
                                element
                                    .removeClass(classAscent)
                                    .removeClass(classDescent);
                            } else {
                                index = newValue.reverse === true ? 2 : 1;
                                element
                                    .removeClass(stateClasses[(index + 1) % 2])
                                    .addClass(stateClasses[index]);
                            }
                        }, true);
                    }
                }
            };
        }]);
})(angular);
