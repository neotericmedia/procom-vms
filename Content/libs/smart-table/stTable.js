(function (ng, undefined) {
    'use strict';
    ng.module('smart-table')
        .controller('stTableController', ['$scope', '$parse', '$filter', '$attrs', function StTableController($scope, $parse, $filter, $attrs) {
            var propertyName = $attrs.stTable;
            var displayGetter = $parse(propertyName);
            var displaySetter = displayGetter.assign;
            var safeGetter;
            var orderBy = $filter('orderBy');
            var filter = $filter('filter');
            var safeCopy = copyRefs(displayGetter($scope));
            var tableState = {
                sort: {},
                search: {},
                pagination: {
                    start: 0
                }
            };
            var pipeAfterSafeCopy = true;
            var ctrl = this;
            var lastSelected;

            function copyRefs(src) {
                return [].concat(src);
            }

            function updateSafeCopy() {
                safeCopy = copyRefs(safeGetter($scope));
                if (pipeAfterSafeCopy === true) {
                    ctrl.pipe();
                }
            }

            if ($attrs.stSafeSrc) {
                safeGetter = $parse($attrs.stSafeSrc);
                $scope.$watch(function () {
                    var safeSrc = safeGetter($scope);
                    return safeSrc ? safeSrc.length : 0;

                }, function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        updateSafeCopy();
                    }
                });
                $scope.$watch(function () {
                    return safeGetter($scope);
                }, function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        updateSafeCopy();
                    }
                });
            }

            /**
             * sort the rows
             * @param {Function | String} predicate - function or string which will be used as predicate for the sorting
             * @param [reverse] - if you want to reverse the order
             */
            this.sortBy = function sortBy(predicate, reverse) {
                tableState.sort.predicate = predicate;
                tableState.sort.reverse = reverse === true;
                tableState.pagination.start = 0;
                this.pipe();
            };

            /**
             * search matching rows
             * @param {String} input - the input string
             * @param {String} [predicate] - the property name against you want to check the match, otherwise it will search on all properties
             */
            this.search = function search(input, predicate) {
                var predicateObject = tableState.search.predicateObject || {};
                var prop = predicate ? predicate : '$';
                predicateObject[prop] = input;
                // to avoid to filter out null value
                if (!input) {
                    delete predicateObject[prop];
                }
                tableState.search.predicateObject = predicateObject;
                tableState.pagination.start = 0;
                this.pipe();
            };

            /**
             * this will chain the operations of sorting and filtering based on the current table state (sort options, filtering, ect)
             */
            this.pipe = function pipe() {
                var pagination = tableState.pagination;
                var filtered = tableState.search.predicateObject ? filter(safeCopy, tableState.search.predicateObject) : safeCopy;
                if (tableState.sort.predicate) {
                    filtered = orderBy(filtered, tableState.sort.predicate, tableState.sort.reverse);
                }
                if (pagination.number !== undefined) {
                    pagination.numberOfPages = filtered.length > 0 ? Math.ceil(filtered.length / pagination.number) : 1;
                    pagination.start = pagination.start >= filtered.length ? (pagination.numberOfPages - 1) * pagination.number : pagination.start;
                    filtered = filtered.slice(pagination.start, pagination.start + pagination.number);
                }
                displaySetter($scope, filtered);
            };

            /**
             * select a dataRow (it will add the attribute isSelected to the row object)
             * @param {Object} row - the row to select
             * @param {String} [mode] - "single" or "multiple" (multiple by default)
             */
            this.select = function select(row, mode) {
                var rows = safeCopy;
                var index = rows.indexOf(row);
                if (index !== -1) {
                    if (mode === 'single') {
                        row.isSelected = row.isSelected !== true;
                        if (lastSelected) {
                            lastSelected.isSelected = false;
                        }
                        lastSelected = row.isSelected === true ? row : undefined;
                    } else {
                        rows[index].isSelected = !rows[index].isSelected;
                    }
                }
            };

            /**
             * take a slice of the current sorted/filtered collection (pagination)
             *
             * @param {Number} start - start index of the slice
             * @param {Number} number - the number of item in the slice
             */
            this.slice = function splice(start, number) {
                tableState.pagination.start = start;
                tableState.pagination.number = number;
                this.pipe();
            };

            /**
             * return the current state of the table
             * @returns {{sort: {}, search: {}, pagination: {start: number}}}
             */
            this.tableState = function getTableState() {
                return tableState;
            };

            /**
             * Use a different filter function than the angular FilterFilter
             * @param filterName the name under which the custom filter is registered
             */
            this.setFilterFunction = function setFilterFunction(filterName) {
                filter = $filter(filterName);
            };

            /**
             *User a different function than the angular orderBy
             * @param sortFunctionName the name under which the custom order function is registered
             */
            this.setSortFunction = function setSortFunction(sortFunctionName) {
                orderBy = $filter(sortFunctionName);
            };

            /**
             * Usually when the safe copy is updated the pipe function is called.
             * Calling this method will prevent it, which is something required when using a custom pipe function
             */
            this.preventPipeOnWatch = function preventPipe() {
                pipeAfterSafeCopy = false;
            };
        }])
        .directive('stTable', ['$compile', function ($compile) {
            return {
                restrict: 'A',
                controller: 'stTableController',
                priority: 1001,
                link: function (scope, element, attr, ctrl) {
                //compile: function (element, attrs, transcludeFn) {
                    //skip this if already passed
                    if (!scope.passed) {
                        scope.passed = true;
                        var isSeparateBodyHead = false;
                        angular.forEach(element.context.attributes, function (a) {
                            if (a.name == "data-st-get-pre-compiled") {
                                isSeparateBodyHead = true;
                            }
                        });
                        if (isSeparateBodyHead) {
                            //order: compile directives, sttable, link directives, sttable again 2 times
                            var inputElement = angular.element(element);
                            //var element = $(inputElement)[0];

                            var TBodyHasClassAttr = false;
                            var attrsHeader, attrsBody, attrsTHead, attrsTBody = '';

                            angular.forEach(element.context.attributes, function (a) {
                                if (a.name != "data-st-get-pre-compiled") {
                                    if (a.name != "data-st-pagination-scroll" && a.name != "data-st-fixed-header" && a.name != "data-st-pagination-scroll-separated") {
                                        attrsHeader += ' ' + a.name + '="' + a.value + '"';
                                    }
                                    if (a.name == "data-st-pagination-scroll") {
                                        a.name = "data-st-pagination-scroll-separated";
                                        //attrsHeader += ' ' + a.name + '="' + a.value + '"';
                                    }
                                    //if (a.name != "data-st-pipe") {
                                    attrsBody += ' ' + a.name + '="' + a.value + '"';
                                    //}
                                }
                            });
                            attrsBody += ' ' + 'data-st-resize-twain' + '="' + '' + '"';

                            angular.forEach(element.context.children, function (tableChildren) {
                                if (tableChildren.nodeName == "THEAD") {
                                    angular.forEach(tableChildren.attributes, function (a) {
                                        attrsTHead += a.name + '="' + a.value + '" ';

                                    });
                                }

                                else if (tableChildren.nodeName == "TBODY") {
                                    angular.forEach(tableChildren.attributes, function (a) {
                                        if (a.name == "class") {
                                            TBodyHasClassAttr = true;
                                            attrsTBody += a.name + '="' + a.value + ' ' + 'overflowYVisible' + '" ';
                                        }
                                        else {
                                            attrsTBody += a.name + '="' + a.value + '" ';
                                        }
                                    });
                                }
                            });

                            //attrsHeader = ' class="table table-striped table-content table-hover fixed-columns" data-st-fixed-header="" data-st-column-widths="[3,7, 8, 8, 8, 8, 8, 8, 8, 8, 7, 8, 7,5]" ';

                            //attrsBody = ' class="table table-striped table-content table-hover fixed-columns" data-st-table="items" data-st-pagination-scroll="pageSize" data-st-pipe="callServer" data-st-fixed-header="" data-st-column-widths="[3, 7, 8, 8, 8, 8, 8, 8, 8, 8, 7, 8, 7, 5]"';

                            //function getElement(inputElement, tagName) {
                            //    var tagNameAll = inputElement.find(tagName)
                            //    return tagNameAll[0].innerHTML;
                            //};

                            var tableHead =
                                 '<table '
                                 + attrsHeader
                                 + ' style="min-width:'
                                 + element.context.newMinWidth
                                 + 'px;"'
                                 + '><thead '
                                 + attrsTHead
                                 + ' >'
                                 + element.context.ATHead
                            + ' </thead></table>'
                            ;

                            // Tbody needs to have overflowYVisible class in order to work;
                            // If class attribute is present, then add it with the other classes,
                            // if not, then add class
                            if (TBodyHasClassAttr) {
                                //already added overflowYVisible within attrsTBody
                                var tableBody =
                                 '<table '
                                 + attrsBody
                                 + ' style="min-width:'
                                 + element.context.newMinWidth
                                 + 'px;"'
                                 + '><tbody '
                                 + attrsTBody
                                 + ' >'
                                 + element.context.ATBody
                                + ' </tbody></table>'
                                ;
                            }
                            else {
                                //Need to add class overflowYVisible and attrsTBody separetly
                                var tableBody =
                                 '<table '
                                 + attrsBody
                                 + ' style="min-width:'
                                 + element.context.newMinWidth
                                 + 'px;"'
                                 + '><tbody class="overflowYVisible" '
                                 + attrsTBody
                                 + ' >'
                                 + element.context.ATBody
                                 + ' </tbody></table>'
                                ;
                            }

                            var separatedTableHTML =
                                '<div id="InvoiceReleaseBodyTable" class="separatedTablesDiv1" combine-horizontal-scrolls="horizontal-scroll">'
                                    + '<div class="separatedTablesDiv2">'
                                        + '<div class="horizontal-scroll separatedTablesDiv3">'
                                            + tableHead
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="horizontal-scroll separatedTablesDiv4">'
                                        + tableBody
                                    + '</div>'
                                        + '<div class="separatedTablesDiv5">'
                                        + element.context.ATFoot
                                        + '</div>'
                                + '</div>'
                            ;
                            //inputElement.parent().append($compile(r)(scope));
                            var parentElement = inputElement.parent().parent();
                            //parentElement.removeChild(inputElement);
                            var compiled = $compile(separatedTableHTML)(scope);
                            ////var linked = compiled(scope);
                            parentElement.append(compiled);
                            inputElement.remove();
                        }
                    }

                }
            };
        }]);
})(angular);
