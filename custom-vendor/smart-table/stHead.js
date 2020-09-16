(function (ng) {
    'use strict';
    ng.module('smart-table')
    .directive('stHead', ['$compile', function ($compile) {
        return {
            // find all rows, and directly add directives, which would not need a compile.
            // Get the String representaion after of the finished code and save it under the table
            restrict: 'A',
            priority: 901,
            compile: function compile(telement, tattrs, transclude) {
                // innerHTMLNameList is a list of names that are representative and visible. 
                // if there is a title, takes name from title, if not, then take innerHTML name of the table header

                // nameList contains a list of names that represents columns but is not visible.
                // if there is st-pen-name then uses that name as representative, if not then uses st-sort value as a name

                // <th data-st-pen-name="SubTotalSecond" data-st-sort="Subtotal" title="Total Title">Total</th>
                // In the row above, "SubTotalSecond" is saved under nameList, and "Total Title" is saved under innerHTMLNameList
                // <th data-st-sort="SubTotal">Total</th>
                // In the row above, "SubTotal" is saved under nameList, and "Total" is saved under innerHTMLNameList
                var nameList = [];
                var innerHTMLNameList = [];
                var allTableRows = telement.context.getElementsByTagName("th");
                var hasTitle = false;
                var hasPenName = false;
                // If c="reverse" does not exist there will be no data loaded into the table.
                // Hence, unless its found somewhere, add it to the first column
                var stSortDefaultIs = false;
                var saveParentElement = null;
                var minWidth = "";
                
                angular.forEach(allTableRows, function (row) {
                    hasTitle = false;
                    if (saveParentElement == null) {
                        // two if statements inorder to not call row.hasAttribute() if don't have to
                        if (row.hasAttribute("data-st-pen-name") || row.hasAttribute("data-st-sort")) {
                            saveParentElement = row.parentElement;
                        }
                    }
                    if (saveParentElement == row.parentElement) {
                        row.hasAttribute("data-st-pen-name") ? hasPenName = true : hasPenName = false;
                        angular.forEach(row.attributes, function (attr) {
                            if (attr && attr.name == "data-st-pen-name" && hasPenName) {
                                nameList.push(attr.value);
                                row.removeAttribute("data-st-pen-name");
                            }
                            else if (attr && attr.name == "data-st-sort" && !hasPenName) {
                                nameList.push(attr.value);
                            }
                            else if (attr && attr.name == "title" && !hasTitle) {
                                hasTitle = true;
                                innerHTMLNameList.push(attr.value);
                            }
                            if (attr && attr.name == "data-st-sort-default") {
                                stSortDefaultIs = true;
                            }
                        });
                        if (!hasTitle) {
                            innerHTMLNameList.push(row.innerHTML);
                        }
                    }
                });

                if (stSortDefaultIs == false) {
                    allTableRows[0].setAttribute("data-st-sort-default", "");
                }

                if (tattrs.stHead == undefined || tattrs.stHead == "") {
                    minWidth = "2000px";
                }
                else {
                    minWidth = tattrs.stHead;
                }

                telement.removeAttr("data-st-head");
                //telement.context.style.minWidth = minWidth;
                telement.context.parentElement.nameColumns = nameList;
                telement.context.parentElement.innerHTMLList = innerHTMLNameList;

                // Assign Pen Name to each column
                var count = 0;
                var parent;
                allTableRows = telement.context.getElementsByTagName("td");
                if (allTableRows.length > 0) {
                    var InitialParent = allTableRows.get(0);
                    parent = InitialParent.parentNode;
                    angular.forEach(allTableRows, function (row) {
                        if (row.parentNode != parent) {
                            // Reset the count upon change of parent, so keep track of parent when we shift from one tr to the next.
                            count = 0;
                            parent = row.parentNode;
                        }
                        if (count < nameList.length) {
                            row.setAttribute("st-pen-name", nameList[count]);
                        }
                        count++;
                    });
                }

                allTableRows = telement.context.getElementsByTagName("th");
                if (allTableRows.length > 0) {
                    // get intial parent of the first row
                    var InitialParent = allTableRows[0];
                    parent = InitialParent.parentNode;
                    angular.forEach(allTableRows, function (row) {
                        if (!row.hasAttribute("ng-class")) {
                            if (row.parentNode != parent) {
                                count = 0;
                                parent = row.parentNode;
                            }
                            if (count < nameList.length) {
                                row.setAttribute("st-pen-name", nameList[count]);
                            }
                            count++;
                        }
                    });
                }

                var saveHTML = telement.context.outerHTML;
                telement.context.parentElement.ATHead = saveHTML;
                telement.context.parentElement.setMinWidth = minWidth;

                //Body
                var tableBodyElement = telement.context.parentElement.children[1];
                tableBodyElement.style.overflowY = "visible";
                allTableRows = tableBodyElement.getElementsByTagName("td");
                count = 0;
                if (allTableRows.length > 0) {
                    var InitialParent = allTableRows[0];
                    parent = InitialParent.parentNode;
                    angular.forEach(allTableRows, function (row) {
                        if (row.parentNode != parent) {
                            ///Reset the count upon change of parent, so keep track of parent when we shift from one tr to the next.
                            count = 0;
                            parent = row.parentNode;
                        }
                        if (count < nameList.length) {
                            row.setAttribute("st-pen-name", nameList[count]);
                        }
                        count++;
                    });
                }

                // Add extra table row that should not be visible but take up enough space to trigger the scroll if there are currently no table rows
                var row = tableBodyElement.insertRow(0);
                row.setAttribute("style", "background-color:white;");
                var tableCell = row.insertCell(0);
                tableCell.setAttribute("style", "padding:0px");
                tableCell.setAttribute("class", "invisible-row");
               
                var saveHTML = tableBodyElement.outerHTML;
                telement.context.parentElement.ATBody = saveHTML;
            }
        };
    }]);
})(angular);
