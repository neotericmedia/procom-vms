(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stSelectRowInArray', ['$parse', '$q', '$timeout', function ($parse, $q, $timeout) {
            return {
                restrict: 'A',
                require: '^?stTable',
                link: function (scope, element, attr, ctrl) {
                    if (ctrl != undefined) {
                        var mode = attr.stSelectMode || 'single';
                        var lastSelected;

                        var defaultSelectedObject = {
                            count: 0,
                            _items: {},
                            isVirtualAllSelected: false,
                            selectAllRows: function () { },
                            deselectAllRows: function () { },
                            getSelected: function () { }
                        };

                        if (attr.stSelectionObj) {
                            var selectionObjGetter = $parse(attr.stSelectionObj);
                            var selectionObjSetter = selectionObjGetter.assign;

                            scope.$watch(function () { return ctrl.tableState(); }, function (setter, setterScope, def) {
                                return function (val) {
                                    if (val) {
                                        if (val.selected) {
                                            setter(setterScope, val.selected);
                                        } else {
                                            setter(setterScope, def);
                                        }
                                    }
                                };
                            }(selectionObjSetter, scope.$parent, defaultSelectedObject));
                        }

                        var selectAllFunction;

                        if (attr.stSelectAllRetrieval) {
                            selectAllFunction = $parse(attr.stSelectAllRetrieval)(scope);
                        }

                        var expression = attr.stSelectRowInArray;

                        var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))\s*$/);

                        if (!match) {
                            throw { message: "Expected expression in form of '_item_ in _collection track by _id_' but got '" + expression + "'." };
                        }

                        var lhs = match[1];
                        var rhs = match[2];
                        var trackBy = match[3];

                        var trackByProperty = trackBy.match(/\.([\s\S]+?)$/);
                        if (!trackByProperty || trackByProperty.length < 2) {
                            throw { message: "Unexpected trackby expression. Expected sub-property. Got: '" + trackBy + "'." };
                        }

                        // Set it to the property. 
                        trackByProperty = trackByProperty[1];

                        if (lhs && rhs) {
                            // watch
                            element.bind('click', function () {

                                if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                    scope.$apply(function () {
                                        var row = $parse(lhs)(scope);
                                        var rows = $parse(rhs)(scope);
                                        var index = rows.indexOf(row);
                                        var tableState = ctrl.tableState();

                                        tableState.selected = tableState.selected || defaultSelectedObject;

                                        tableState.selected.isVirtualAllSelected = false;

                                        if (index !== -1) {
                                            var id = $parse(trackByProperty)(row);

                                            if (id) {
                                                if (mode === 'single') {
                                                    row.isSelected = row.isSelected !== true;
                                                    if (lastSelected) {
                                                        lastSelected.isSelected = false;
                                                    }
                                                    lastSelected = row.isSelected === true ? row : undefined;
                                                    // clear the array 
                                                    tableState.selected = defaultSelectedObject;
                                                    if (row.isSelected === true) {
                                                        tableState.selected._items[id] = row;
                                                        tableState.selected.count = 1;
                                                    }
                                                } else {
                                                    rows[index].isSelected = !rows[index].isSelected;
                                                    if (rows[index].isSelected) {
                                                        tableState.selected._items[id] = row;
                                                        tableState.selected.count++;
                                                    } else {
                                                        delete tableState.selected._items[id];
                                                        tableState.selected.count--;
                                                    }
                                                }
                                            }
                                        }

                                    });
                                }

                            });
                        } else {
                            throw "Expected expression in form of '_item_ in _collection' but got invalid binding.";
                        }

                        scope.$watch(lhs + '.isSelected', function (newValue, oldValue) {
                            if (newValue === true) {
                                element.addClass('st-selected');
                            } else {
                                element.removeClass('st-selected');
                            }
                        });

                        // Update counts on data refresh
                        scope.$watchCollection(rhs, function (collection) {
                            var tableState = ctrl.tableState();
                            if (!tableState.selected) {
                                tableState.selected = defaultSelectedObject;
                            }
                            if (tableState.selected.isVirtualAllSelected === true) {
                                _.forEach(collection, function (item) {
                                    item.isSelected = true;
                                });
                            }
                            if (tableState.selected.count == 0) {
                                tableState.selected.count = collection ? _.filter(collection, { isSelected: true }).length || 0 : 0;
                            }
                            else {
                                var keys = Object.keys(tableState.selected._items);
                                var collectionKeys = Object.keys(collection);
                                for (var g = 0; g < collection.length; g++) {
                                    for (var h = 0; h < keys.length; h++) {
                                        if (collection[collectionKeys[g]].Id == tableState.selected._items[keys[h]].Id) {
                                            collection[g].isSelected = true;
                                        }
                                    }
                                }
                            }
                        });

                        // Initialize SelectAllRows and DeselectAllRows Events
                        var tableState = ctrl.tableState();

                        tableState.selected = tableState.selected || defaultSelectedObject;

                        tableState.selected.selectAllRows = function () {
                            var collection = $parse(rhs)(scope);
                            if (collection) {
                                _.each(collection, function (item) {
                                    item.isSelected = true;
                                    var id = $parse(trackByProperty)(item);
                                    tableState.selected._items[id] = item;
                                });
                                tableState.selected.count = collection.length;
                                tableState.selected.isVirtualAllSelected = true;
                            };
                        };
                        tableState.selected.deselectAllRows = function () {
                            var collection = $parse(rhs)(scope);
                            if (collection) {
                                _.each(collection, function (item) {
                                    item.isSelected = false;
                                });
                                tableState.selected.count = 0;
                                tableState.selected._items = {};
                                tableState.selected.isVirtualAllSelected = false;
                            };
                        };

                        tableState.selected.getSelected = function () {
                            var deferred = $q.defer();

                            if (selectAllFunction && tableState.selected.isVirtualAllSelected === true) {
                                // Do a serverside request
                                selectAllFunction(tableState).then(function (data) {
                                    deferred.resolve(data);
                                }, function (error) {
                                    deferred.reject(error);
                                });
                            } else {
                                $timeout(function () {
                                    deferred.resolve(tableState.selected._items);
                                });
                            }

                            return deferred.promise;
                        };
                    }
                }
            };
        }]);
})(angular);
