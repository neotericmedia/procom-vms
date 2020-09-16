(function (ng) {
    'use strict';
    ng.module('smart-table')
    .directive('stInitilization', ['$compile', '$timeout', function ($compile, $timeout) {
        return {
            // Intilization functions to be used for cloaking and uncloaking columns
            // scope.repositionBodyColumns is responsible for moving the columns back 
            // to thier appropriate places if stTable changes, this function is called upon
            // the value passed into this attribute is an array of column names that should be hidden on starUp
            restrict: 'A',
            require: "^stTable",
            priority: 920,
            link: function preLink(scope, tElement, iAttrs, controller) {
                scope.hideThisRow = true;
                // A map of penNames(column names) to thier associated default width
                scope.allVisibleColumns = {};
                scope.mapPenNameToPixels = {};
                scope.mapPenNameToPercents = {};
                scope.currentWidthsChange = 0;
                scope.tableColumnAttr = [];
                // Default min width
                scope.defaultMinWidth = 0;
                // Currently changed min-width
                scope.currentMinWidth = 0;
                // Contains list of column names that are to be cloaked
                scope.markedToBeCloaked = [];
                scope.markedToBeUncloaked = [];
                // Contains a backup list of "scope.markedToBeCloaked"
                scope.markedToBeCloakedHistory = [];
                scope.cloakArray = [];
                scope.givenArray = [];
                var mapCheckboxStatus = {};
                var onLoadResetColumnView = true;
                var onLoadSaveHistory = true;
                scope.allColumnsHidden = false;
                scope.maxedOut = false;
                scope.masterSelecter = controller.getMasterSelector();
                // Look back at the bottom two variables after making the table using templates
                var firstConstruction = false;
                var firstLoad = true;
                var ignoreSecondPageLoad = false;
                scope.extraRowsFromBottom = 0;
                scope.noLoadingIndicator ? scope.extraRowsFromBottom = 0 : scope.extraRowsFromBottom = 1;
                scope.findArray = scope.checkboxPositions;

                if (typeof controller.getTableSettings().ColumnSettings != 'undefined') {
                    if (controller.getTableSettings() != undefined && controller.getTableSettings() != {}) {
                        for (var countingColumnNames = 1; countingColumnNames <= controller.getTableSettings().ColumnSettings.length; countingColumnNames++) {
                            angular.forEach(controller.getTableSettings().ColumnSettings, function (columnSettings) {
                                if (columnSettings.OrderIndex == countingColumnNames) {
                                    for (var i = 0; i < scope.penNames.length; i++) {
                                        if (columnSettings.ColumnName == scope.penNames[i]) {
                                            scope.givenArray.push(columnSettings.ColumnName);
                                            if (columnSettings.Visiblity == false) {
                                                scope.cloakArray.push(columnSettings.ColumnName);
                                            }
                                        }
                                    }
                                    // if could not find the name of the column inside the current page list of column names
                                    // contained inside scope.penNames, then just skip column onto the next, and don't add to givenArray
                                }
                            });
                        }
                    }
                }
                if (scope.cloakArray.length == scope.penNames.length) {
                    // This basicly means that on the last user interaction, the user chose to hide all columns,
                    // and so there should be no columns visible, yet needs to be a correction for the spinner to also be not visible
                    scope.maxedOut = true;
                    scope.allColumnsHidden = true;
                }
                else {
                    //scope.maxedOut = false;
                    scope.allColumnsHidden = false;
                }
                // Create a blank new searchSettingProfile for the user, because either 
                // A: A new field has been added and cannot be found within the database
                // B: This is new webpages to use the smart table directives, and hence there is no preexisting settings defined for the user on this table
                if (scope.givenArray.length != scope.penNames.length) {
                    controller.emptyTableColumnSettings();
                    for (var i = 0; i < scope.penNames.length; i++) {
                        controller.getTableSettings().ColumnSettings.push({
                            ColumnName: scope.penNames[i],
                            Visiblity: true,
                            OrderIndex: (i + 1),
                            SortIsAsc: 1
                        });
                    }
                    scope.givenArray = scope.penNames;
                }

                if (scope.cloakArray != undefined) {
                    scope.savedListOfHidenColumns = scope.cloakArray;
                    scope.markedToBeCloaked = scope.cloakArray;
                }
                else {
                    scope.savedListOfHidenColumns = [];
                }

                scope.clearOldSelection = function () {
                    if (typeof scope.selectionObj !== 'undefined' && !(_.isEmpty(scope.selectionObj))) {
                        scope.selectionObj.deselectAllRows();
                        scope.masterSelecter = false;
                        controller.changeMasterSelector(false);

                        if (typeof scope.selectAllButtonVisiblity !== 'undefined') {
                            scope.selectAllButtonVisiblity = false;
                        }
                        if (typeof scope.deselectAllEntities !== 'undefined') {
                            scope.deselectAllEntities();
                        }
                        //if (typeof scope.selectEntire !== 'undefined') {
                        //    if (typeof scope.selectEntire.isSelected !== 'undefined') {
                        //        scope.selectEntire.isSelected = false;
                        //    }
                        //}
                    }
                    (controller.tableState()).pagination.start = 0;
                };

                scope.resetColumnView = function () {
                    if (onLoadResetColumnView) {
                        mapCheckboxStatus = [];
                        for (var j = 0; j < scope.penNames.length; j++) {
                            if (scope.markedToBeCloakedHistory.indexOf(scope.savedOrderOfColumns[j]) != -1) {
                                mapCheckboxStatus[scope.savedOrderOfColumns[j]] = false;
                            }
                            else {
                                mapCheckboxStatus[scope.savedOrderOfColumns[j]] = true;
                            }
                        }
                        onLoadResetColumnView = false;
                    }
                    // Load last saved settings
                    if (mapCheckboxStatus != undefined && mapCheckboxStatus != {}) {
                        var status = false;
                        for (var i = 0; i < scope.findArray.length; i++) {
                            status = mapCheckboxStatus[scope.findArray[i].children[0].id];
                            scope.findArray[i].children[0].checked = status;
                            if (status) {
                                scope.findArray[i].style.backgroundColor = 'white';
                            }
                            else {
                                scope.findArray[i].style.backgroundColor = 'rgba(0, 38, 255, 0.06)';
                            }
                        }
                    }
                };

                scope.repositionBodyColumns = function () {
                    //var row;
                    //// Take into account first row, to compare using stPenNames attrbitue values
                    //var perfectRowList = scope.table.rows[0];
                    //// Modify Body Table
                    //for (var i = scope.tableBody.rows.length - 1 - scope.extraRowsFromBottom; i > 0; i--) {
                    //    row = scope.tableBody.rows[i];
                    //    for (var y = 0; y < row.cells.length; y++) {
                    //        var currentRowValue = row.cells[y].getAttribute("st-pen-name");
                    //        var perfectRowValue = perfectRowList.cells[y].getAttribute("st-pen-name");
                    //        if (currentRowValue === perfectRowValue) {
                    //            // No need to change cell, in its proper place
                    //        }
                    //        else {
                    //            // Find row cell and move it accordingly
                    //            var findCellCounter = 0;
                    //            angular.forEach(row.cells, function (cellHolder) { // use angularjs search through
                    //                if (cellHolder.getAttribute("st-pen-name") === (perfectRowList.cells[y].getAttribute("st-pen-name"))) {
                    //                    var x = row.removeChild(row.cells[findCellCounter]);
                    //                    if (y < row.cells.length) {
                    //                        row.insertBefore(x, row.cells[y]);
                    //                    }
                    //                    else {
                    //                        row.appendChild(x);
                    //                    }
                    //                }
                    //                findCellCounter++;
                    //            });
                    //        }
                    //    }
                    //}
                };

                scope.constructCloakColumnSettings = function () {
                    if (firstConstruction == false) {
                        firstConstruction = true;
                        scope.defaultMinWidth = scope.minWidth;
                        scope.table.style.minWidth = scope.minWidth;
                        scope.tableBody.style.minWidth = scope.minWidth;
                        //scope.currentMinWidth = scope.defaultMinWidth;
                        var s = scope.defaultMinWidth.replace(/%/g, "");
                        scope.defaultMinWidthInt = parseFloat(s);
                        var counter = 0;
                        var totalWidthPercent = 0;
                        angular.forEach(scope.tableColumnAttr, function (item) {
                            // Remember how much each column is responsible for in percentages
                            scope.allVisibleColumns[(scope.penNames[counter])] = item;
                            totalWidthPercent += item;
                            counter++;
                        });

                        var ratio = (100 / totalWidthPercent);
                        for (var t = 0; t < scope.penNames.length; t++) {
                            // Calculate how much each column is responsible for in pixels
                            scope.mapPenNameToPixels[scope.penNames[t]] = (ratio * (scope.allVisibleColumns[(scope.penNames[t])]) * 0.01) * scope.defaultMinWidthInt;
                            scope.mapPenNameToPercents[scope.penNames[t]] = (ratio * (scope.allVisibleColumns[(scope.penNames[t])]));
                        }
                        angular.forEach(scope.penNames, function (columnName) {
                            var setWidthToDefault = function (item) {
                                // Replace with original value of column width
                                //item.style.width = scope.mapPenNameToPixels[columnName] + "px";
                                item.style.width = scope.mapPenNameToPercents[columnName] + "%";
                                item.style.wordBreak = "break-all";
                            };
                            var elementWithPenName = angular.element("[st-pen-name='" + columnName + "']");
                            angular.forEach(elementWithPenName, setWidthToDefault);
                        });
                    }
                };

                // return 0 if all are visible,
                // return 1 if all are hidden,
                // return 2 if none of the first two options
                scope.isAllHidden = function () {
                    var allSelectedBool = 2;

                    var countVisible = 0;
                    var countHidden = 0;
                    for (var i = 0; i < scope.findArray.length; i++) {
                        if (scope.findArray[i].children[0].checked == true) {
                            countVisible++;
                        }
                        if (scope.findArray[i].children[0].checked == false) {
                            countHidden++;
                        }
                    }
                    if (scope.findArray.length == countVisible) {
                        allSelectedBool = 0;
                    }
                    if (scope.findArray.length == countHidden) {
                        allSelectedBool = 1;
                    }
                    return allSelectedBool;
                }
                // Return all the checkboxes to false
                // If resetRow is false, then don't color row, for it might be currently hidden
                scope.resetMenuCheckboxes = function (resetRow) {
                    // unconditional reset
                    if (resetRow) {
                        for (var i = 0; i < scope.findArray.length; i++) {
                            scope.findArray[i].children[0].checked = true;
                            scope.findArray[i].style.backgroundColor = 'white';
                        }
                    }
                        // Make all checkboxes selected or not, depending on the current state
                    else {
                        // check if there are any columns selected
                        // if all columns are visible then take actions to make them hidden, and vice verse.
                        var selectAll = true;
                        if (scope.isAllHidden() == 0) {
                            selectAll = false;
                        }

                        // Default option is to deselect all
                        for (var i = 0; i < scope.findArray.length; i++) {
                            if (selectAll) {
                                scope.findArray[i].children[0].checked = selectAll;
                                scope.findArray[i].style.backgroundColor = 'white';
                            }
                            else {
                                scope.findArray[i].children[0].checked = selectAll;
                                scope.findArray[i].style.backgroundColor = 'rgba(0, 38, 255, 0.06)';
                            }
                        }
                    }
                }

                scope.saveColumnSettings = function (reCalibrate, onStart) {
                    mapCheckboxStatus = {};
                    var isHiddenReturn = scope.isAllHidden();
                    scope.allColumnsHidden = (isHiddenReturn == 1);
                    scope.saveChangesColumnCleaning(false, false, true);
                    //if (scope.allColumnsHidden) {
                    //    scope.maxedOut = true;
                    //}
                    //else if (!scope.allColumnsHidden) {
                        //if (!scope.allRowsLoaded) {
                        //    scope.maxedOut = false;
                        //}
                    //}

                    // If a column became hidden, then make the change under user Settings
                    if (controller.getTableSettings() != undefined) {
                        angular.forEach(controller.getTableSettings().ColumnSettings, function (columnSettings) {
                            if (scope.markedToBeCloakedHistory.indexOf(columnSettings.ColumnName) != -1) {
                                columnSettings.Visiblity = false;
                            }
                            else {
                                columnSettings.Visiblity = true;
                            }
                        });
                    }

                    controller.saveTableSettings();
                    controller.saveSearchSettings();
                }

                scope.saveChangesColumnCleaning = function (reCalibrate, onStart, onSave) {
                    // reCalibrate = true --> after a action(searching, sorting and loading more items),
                    // hide columns if they appear again, to remain previous state. Reason for addition to the function 
                    // this is that there may be checkBoxes checked, yet they thier column won't be selected for hiding, 
                    // as the procedure is simply to restore previous state.
                    var checkbox;
                    var columnName;
                    if (onLoadSaveHistory && firstLoad) {
                        scope.constructCloakColumnSettings();
                        firstLoad = false;
                    }

                    if (!reCalibrate) {
                        // Collect information about which columns should be eliminated;
                        angular.forEach(scope.findArray, function (eachCheckboxOfRow) {
                            checkbox = eachCheckboxOfRow.children[0];
                            if (onSave) {
                                mapCheckboxStatus[checkbox.id] = checkbox.checked;
                            }
                            angular.forEach(checkbox.attributes, function (attribuesOfCheckbox) {
                                if (attribuesOfCheckbox.name == "id") {
                                    columnName = attribuesOfCheckbox.value;
                                }
                            });
                            //if (onStart || onLoadSaveHistory) {
                            //    for (var r = 0; r < scope.markedToBeCloaked.length; r++) {
                            //        if (columnName == scope.markedToBeCloaked[r]) {
                            //            checkbox.checked = false;
                            //            eachCheckboxOfRow.style.backgroundColor = 'rgba(0, 38, 255, 0.06)';
                            //        }
                            //    }
                            //}
                            //else {
                            if (!checkbox.checked) {
                                eachCheckboxOfRow.style.backgroundColor = 'rgba(0, 38, 255, 0.06)';
                                var indexOfName = scope.markedToBeCloaked.indexOf(columnName);
                                // If it wasen't already cloaked prior, added it to the markedToBeCloaked list
                                if (indexOfName == -1) {
                                    scope.markedToBeCloaked.push(columnName);
                                }
                            }
                            else {
                                eachCheckboxOfRow.style.backgroundColor = 'white';
                                var indexOfName = scope.markedToBeCloaked.indexOf(columnName);
                                // If it was inside the marked to be cloaked list, then remove it
                                if (indexOfName != -1) {
                                    scope.markedToBeCloaked.splice(indexOfName, 1);
                                }
                                scope.markedToBeUncloaked.push(columnName);
                            }
                            //}
                        });
                    }

                    // Register that column is no longer cloaked under UserSearchSettings
                    if (controller.getTableSettings() != undefined) {
                        angular.forEach(controller.getTableSettings().ColumnSettings, function (columnSettings) {
                            if (scope.markedToBeUncloaked.indexOf(columnSettings.ColumnName) != -1) {
                                columnSettings.Visiblity = true;
                            }
                        });
                    }

                    var firstItem = false;
                    var uncloak = false;
                    var firstItemNumber = 0;
                    var currentWidthOfHeader = 0;
                    var addTotalWidths = 0;

                    angular.forEach(scope.penNames, function (columnName) {
                        // enter each row of a column, one at a time
                        var elementWithPenName = angular.element("[st-pen-name='" + columnName + "']");
                        if (scope.markedToBeCloaked.indexOf(columnName) == -1) {
                            var w = elementWithPenName[0].style.width;
                            var s = w.replace(/%/g, "");
                            var percentWidthInt = parseFloat(s);
                            // "11%" --> 11
                            addTotalWidths += percentWidthInt;
                        }
                    });

                    var ratioBalanced = 100 / addTotalWidths;
                    angular.forEach(scope.penNames, function (columnName) {
                        var applyConfiguration = function (item) {

                            // only get first row of every column
                            if (firstItemNumber === 0) {
                                //firstItem == true --> checkbox is selected for deletion
                                if (!reCalibrate) {
                                    (scope.markedToBeCloaked.indexOf(columnName) == -1) ? firstItem = false : firstItem = true;
                                    (scope.markedToBeUncloaked.indexOf(columnName) == -1) ? uncloak = false : uncloak = true;
                                }
                                else {
                                    (scope.markedToBeCloakedHistory.indexOf(columnName) == -1) ? firstItem = false : firstItem = true;
                                }
                                //if (scope.markedToBeCloaked.length == 0) {
                                //    item.style.width = scope.mapPenNameToPercents[columnName] + "%";
                                //    currentWidthOfHeader = scope.mapPenNameToPercents[columnName] + "%";
                                //} else {
                                    currentWidthOfHeader = scope.mapPenNameToPercents[columnName] + "%";
                                    //currentWidthOfHeader = currentWidthOfHeader * ratioBalanced;
                                    //currentWidthOfHeader = currentWidthOfHeader + "%";
                                    item.style.width = currentWidthOfHeader;
                                //}
                            }

                            if (firstItemNumber > 0) {
                                // Take width values for body from Header if they displace after filtering or search results
                                item.style.width = currentWidthOfHeader;
                                item.style.wordBreak = "break-all";
                                //item.style.maxWidth = "0px";
                                //item.style.maxWidth = currentWidthOfHeader;
                            }
                            firstItemNumber++;
                            if (firstItem) {
                                item.style.display = "none";
                                // Update list to be up to date on currently selected columns
                                if (scope.savedListOfHidenColumns.indexOf(columnName) == -1) {
                                    scope.savedListOfHidenColumns.push(columnName);
                                }
                            }
                            if (uncloak) {
                                item.style.display = "";
                                // Update list to be up to date on currently selected columns
                                var indexAt = scope.savedListOfHidenColumns.indexOf(columnName);
                                if (indexAt != -1) {
                                    scope.savedListOfHidenColumns.splice(indexAt, 1);
                                }
                            }
                        };
                        firstItemNumber = 0;
                        firstItem = false;
                        uncloak = false;
                        //enter each row of a column, one at a time
                        var elementWithPenName = angular.element("[st-pen-name='" + columnName + "']");
                        angular.forEach(elementWithPenName, applyConfiguration);
                    });

                    var previousMinWidth = 0;
                    var currentWidth = 0;
                    for (var t = 0; t < scope.penNames.length; t++) {
                        previousMinWidth = scope.mapPenNameToPixels[(scope.penNames[t])];
                        if (!(scope.markedToBeCloaked.indexOf(scope.penNames[t]) != -1)) {
                            currentWidth += previousMinWidth;
                        }
                    }

                    var currentMinWidth = currentWidth + "px";
                    //scope.table.style.minWidth = currentMinWidth;
                    //scope.tableBody.style.minWidth = currentMinWidth;

                    if (scope.markedToBeCloaked.length == scope.penNames.length) {
                        // This basicly means that on the last user interaction, the user chose to hide all columns,
                        // and so there should be no columns visible, yet needs to be a correction for the spinner to also be not visible
                        scope.maxedOut = true;
                        scope.allColumnsHidden = true;
                    }
                    else {
                        //scope.maxedOut = false;
                        scope.allColumnsHidden = false;
                        if (!scope.historicMaxedOut) {
                            scope.maxedOut = false;
                        }
                    }

                    if (!reCalibrate || onLoadSaveHistory) {
                        scope.markedToBeUncloaked = [];
                        scope.markedToBeCloakedHistory = scope.markedToBeCloaked;
                        onLoadSaveHistory = false;
                    } else {
                        if (ignoreSecondPageLoad === false) {
                            if (typeof scope.onLoadMoreThanOnePage !== 'undefined') {
                                scope.onLoadMoreThanOnePage();
                            }
                            ignoreSecondPageLoad = true;
                        }
                    }
                };

                scope.resetChangesColumnCleaning = function () {
                    // Does not make any actions to save, simply restores to all columns to be visibile

                    // Reset list tracking currently hidden columns
                    scope.markedToBeCloakedHistory = [];
                    scope.savedListOfHidenColumns = [];
                    scope.markedToBeCloaked = [];
                    // Bring back the spinner into visible state since all are visible
                    scope.allColumnsHidden = false;
                    if (!scope.historicMaxedOut) {
                        scope.maxedOut = false;
                    }

                    // All checkboxes are nullified
                    mapCheckboxStatus = {};
                    for (var i = 0; i < scope.penNames.length; i++) {
                        mapCheckboxStatus[scope.penNames[i]] = true;
                    }

                    // Register that column is no longer cloaked under UserSearchSettings
                    if (controller.getTableSettings() != undefined) {
                        angular.forEach(controller.getTableSettings().ColumnSettings, function (columnSettings) {
                            columnSettings.Visiblity = true;
                        });
                    }

                    angular.forEach(scope.penNames, function (columnName) {
                        var setCssToDefault = function (item) {
                            // Replace with original value of column width
                            //item.style.maxWidth = scope.mapPenNameToPixels[columnName] + "px";
                            //item.style.width = scope.mapPenNameToPixels[columnName] + "px";
                            //item.style.maxWidth = scope.mapPenNameToPercents[columnName] + "%";
                            item.style.width = scope.mapPenNameToPercents[columnName] + "%";
                            item.style.display = "";
                            item.style.wordBreak = "break-all";
                        };
                        var elementWithPenName = angular.element("[st-pen-name='" + columnName + "']");
                        angular.forEach(elementWithPenName, setCssToDefault);
                    });

                    // Return all the checkboxes to false and color them white;
                    scope.resetMenuCheckboxes(true);

                    //currentMinWidth = scope.defaultMinWidth;
                    //scope.table.style.minWidth = scope.defaultMinWidth;
                    //scope.tableBody.style.minWidth = scope.defaultMinWidth;
                };

                scope.selectAllRows = function () {
                    var isAllSelected = scope.functionIsAllSelected();

                    if (isAllSelected === true) {
                        // Deselect all rows
                        if (scope.masterSelecter !== false) {
                            scope.masterSelecter = false;
                        }
                        scope.selectionObj.deselectAllRows();
                        if (typeof scope.deselectAllEntities !== 'undefined') {
                            scope.deselectAllEntities();
                        }
                    }
                    else {
                        if (scope.masterSelecter !== true) {
                            scope.masterSelecter = true;
                        }
                        scope.selectionObj.selectAllRows();
                        if (typeof scope.selectAllEntities !== 'undefined') {
                            scope.selectAllEntities();
                        }
                    }

                    controller.changeMasterSelector(scope.masterSelecter);

                    //if (!scope.masterSelecter && typeof scope.selectEntire != 'undefined') {
                    //    scope.selectEntire.isSelected = false;
                    //}

                    scope.selectAllButtonVisiblity = scope.masterSelecter && scope.itemsPerPage < scope.totalItemCount;
                };

                scope.functionIsAllSelected = function () {
                    var isAllSelected = true;

                    for (var i = 0; i < scope.items.length; i++) {
                        if (scope.items[i].isSelected === false || typeof scope.items[i].isSelected === 'undefined') {
                            isAllSelected = false;
                        }
                    }
                    return isAllSelected;
                };

                scope.selectedRowCurrent = function () {
                    //figure out wheather all are selected
                    scope.masterSelecter = scope.functionIsAllSelected();
                    controller.changeMasterSelector(scope.masterSelecter);
                    //if (typeof scope.selectEntire != 'undefined') {
                    //    if (!scope.masterSelecter && scope.selectEntire) {
                    //        scope.selectEntire.isSelected = false;
                    //    }
                    //}

                    scope.selectAllButtonVisiblity = scope.masterSelecter && scope.itemsPerPage < scope.totalItemCount;
                };
            }
        };
    }]);
})(angular);