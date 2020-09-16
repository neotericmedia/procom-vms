(function (ng, undefined) {
    'use strict';
    ng.module('smart-table')
        .controller('stTableController', ['$scope', '$rootScope', '$location', '$state', '$parse', '$filter', '$attrs', '$q', 'UserProfileSearchSettingsApiService', 'common', function StTableController($scope, $rootScope, $location, $state, $parse, $filter, $attrs, $q, UserProfileSearchSettingsApiService, common) {
            var propertyName = $attrs.stTable;
            var displayGetter = $parse(propertyName);
            var displaySetter = displayGetter.assign;
            var safeGetter;
            var orderBy = $filter('orderBy');
            var filter = $filter('filter');
            var safeCopy = copyRefs(displayGetter($scope));
            var hasSortingLoaded = false;
            var havePreviouslySavedTableState = false;
            var searchNames = [];
            var masterSelector = false;
            var selectedRows = [];
            var randomPropertyNames = [];
            if ($scope.$state == undefined) {
                $scope.$state = $state;
            }
            // Use name when templateUrl is undefined (for example at "transaction.view.invoices" it is in a nested view)
            var locationPath = $scope.$state.$current.name;
            var tableState = {
                sort: {},
                search: {},
                pagination: {
                    start: 0
                },
                isLoadedFromPreviousState: false
            };

            if ($rootScope.globalTableState) {
                var foundTableState = false;
                for (var i = 0; i < $rootScope.globalTableState.length; i++) {
                    if ( $rootScope.globalTableState[i].routeName == locationPath) {
                        foundTableState = true;
                        tableState = $rootScope.globalTableState[i].tableState;
                        // Ignore saving pagination for now.
                        tableState.pagination = { start: 0 };
                        searchNames = $rootScope.globalTableState[i].searchNames;
                        selectedRows = $rootScope.globalTableState[i].selectedRows;
                        masterSelector = $rootScope.globalTableState[i].masterSelector;
                        //if (typeof $scope.batchArray != 'undefined') {
                        //    $scope.batchArray = selectedRows;
                        //}
                        i = $rootScope.globalTableState.length;
                        havePreviouslySavedTableState = true;
                        tableState.isLoadedFromPreviousState = true;
                    }
                }
                if (foundTableState == false) {
                    var tableStateObject = {
                        routeName: locationPath,
                        tableState: tableState,
                        searchNames: searchNames,
                        selectedRows: selectedRows,
                        masterSelector: masterSelector,
                        dontSaveCheckboxSelection: false
                    }
                    $rootScope.globalTableState.push(tableStateObject);
                }
            }

            $scope.$on('$stateChangeStart', function () {
                if (typeof $rootScope.globalTableState === 'undefined') {
                    $rootScope.globalTableState = [];
                }
                //if (typeof $scope.batchArray != 'undefined') {
                //    selectedRows = $scope.batchArray;
                //}

                var alreadySavedTableStatePrior = false;
                var savedIterationInList = 0;
                for (var i = 0; i < $rootScope.globalTableState.length; i++) {
                    if ($rootScope.globalTableState[i].routeName == locationPath) {
                        alreadySavedTableStatePrior = true;
                        savedIterationInList = i;
                        i = $rootScope.globalTableState.length;
                    }
                }
                if (alreadySavedTableStatePrior) {
                    // If need to reset selection for this page before; Hence perform deselection before saving
                    if ($rootScope.globalTableState[savedIterationInList].dontSaveCheckboxSelection == true) {
                        selectedRows = [];
                        masterSelector = false;
                        if (typeof $rootScope.globalTableState !== 'undefined' && $rootScope.globalTableState !== null &&
                            typeof tableState !== 'undefined' && tableState !== null &&
                            typeof tableState.selected !== 'undefined' && tableState.selected !== null &&
                            typeof tableState.selected.deselectAllRows !== 'undefined' && tableState.selected.deselectAllRows !== null) {
                            tableState.selected.deselectAllRows();
                            $rootScope.globalTableState[savedIterationInList].dontSaveCheckboxSelection = false;
                        }
                    }
                    $rootScope.globalTableState[savedIterationInList].tableState = tableState;
                    $rootScope.globalTableState[savedIterationInList].searchNames = searchNames;
                    $rootScope.globalTableState[savedIterationInList].selectedRows = selectedRows;
                    $rootScope.globalTableState[savedIterationInList].masterSelector = masterSelector;
                }
                else {
                    var tableStateObject = {
                        routeName: locationPath,
                        tableState: tableState,
                        searchNames: searchNames,
                        selectedRows: selectedRows,
                        masterSelector: masterSelector,
                        dontSaveCheckboxSelection: false
                    }
                    $rootScope.globalTableState.push(tableStateObject);
                }
            });

            $scope.userProfileSearchSettingsSave = function () {

                var columnSettings = [];

                angular.forEach($scope.searchSettings.ColumnSettings, function (columnSetting) {
                    var tempVisbility = 1;
                    tempVisbility = (columnSetting.Visiblity) ? 1 : 0;
                    columnSettings.push({
                        Name: columnSetting.ColumnName,
                        OrderIndex: columnSetting.OrderIndex,
                        SortIsAsc: columnSetting.SortIsAsc,
                        Visiblity: tempVisbility
                    });
                });

                var userProfileSearchSettingSaveCommand = {
                    Id: $scope.searchSettings.Id,
                    LastModifiedDatetime: $scope.searchSettings.LastModifiedDatetime,
                    StateRoutingName: $scope.$state.$current.name,
                    // Currently do not need DtoName, since $scope.$state.$current.url.prefix; will be unique.
                    // Yet in the future case of having multiple tables on one page we may need this in the future.
                    DtoName: '',
                    ColumnSettings: columnSettings
                };

                $scope.loadItemsPromise = UserProfileSearchSettingsApiService.userProfileSearchSettingSave(userProfileSearchSettingSaveCommand).then(
                function (responseSuccesOnPost) {
                    common.logSuccess("Saved User Preferences");
                },
                function (responseError) {
                    common.responseErrorMessages(responseError);
                })
                .then(function(){ // retrieve new save date
                    UserProfileSearchSettingsApiService.getByStateRoutingName($scope.searchSettings.StateRoutingNameEncoded)
                        .then(function(response){
                            var stateCurrentUserProfileSearchSetting = _.find(response.Items, function (item) { return item.StateRoutingName === $scope.$state.$current.name; });
                            if (typeof stateCurrentUserProfileSearchSetting != 'undefined') {
                                if (typeof stateCurrentUserProfileSearchSetting.LastModifiedDatetime != 'undefined') {
                                    $scope.searchSettings.LastModifiedDatetime = stateCurrentUserProfileSearchSetting.LastModifiedDatetime;
                                }
                            }
                        });
                });

            };

            if ($scope.searchSettings == undefined) {
                $scope.searchSettings = {};
                $scope.searchSettings.ColumnSettings = [];
            }
            var localSearchSettings = $scope.searchSettings;
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
            this.sortBy = function sortBy(predicate, reverse, dontMakeServerCallOnStartup) {
                if (!(hasSortingLoaded === false && havePreviouslySavedTableState === true)) {
                    tableState.sort.predicate = predicate;
                    tableState.sort.reverse = reverse === true;
                    tableState.pagination.start = 0;
                }
                hasSortingLoaded = true;
                if (dontMakeServerCallOnStartup !== true) {
                    this.pipe(tableState);
                }
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
                //var defer = $q.defer();
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
                //defer.resolve();
                //return defer.promise;
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
                //var defer = $q.defer();
                tableState.pagination.start = start;
                tableState.pagination.number = number;
                this.pipe();
                //    .then(
                //        function (responseSucces) {                              
                //            defer.resolve(responseSucces);
                //        }, function (responseError) {
                //            defer.reject(responseError);
                //        });
                //return defer.promise;
            };

            /**
             * return the current state of the table
             * @returns {{sort: {}, search: {}, pagination: {start: number}}}
             */
            this.tableState = function getTableState() {
                return tableState;
            };

            this.getRandomPropertyNames = function getRandomPropertyNames() {
                return randomPropertyNames;
            };

            this.getSearchNames = function getSearchNames() {
                return searchNames;
            };

            this.getSelectedRows = function getSelectedRows() {
                return selectedRows;
            };

            this.changeMasterSelector = function changeMasterSelector(newMasterSelector) {
                masterSelector = newMasterSelector;
            };

            this.getMasterSelector = function getMasterSelector() {
                return masterSelector;
            };

            this.returnSearchNameByProperty = function getSearchName(property) {
                var index = 0;
                for (var t = 0; t < searchNames.length; t++) {
                    if (searchNames[t].property = property) {
                        index = t;
                    }
                }
                return searchNames[index];
            };

            // return a local copy of user's settings
            this.getTableSettings = function getTableSettings() {
                return localSearchSettings;
            };

            // Empty out ColumnSettings
            this.emptyTableColumnSettings = function emptyTableColumnSettings() {
                $scope.searchSettings.ColumnSettings = [];
                localSearchSettings.ColumnSettings = [];
            };

            // save local copy under $scope, so that controller of webpage can acess it when saving smart table settings
            this.saveTableSettings = function saveTableSettings() {
                $scope.searchSettings = localSearchSettings;
            };

            // trying saving using the settings within $scope.searchSettings
            this.saveSearchSettings = function saveSearchSettings() {
                try {
                    $scope.userProfileSearchSettingsSave();
                }
                catch (err) {
                    // $scope.userProfileSearchSettingsSave(); does not exist or is not configured correctly in the page's controller.
                }
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
                }
            };
        }]);
})(angular);
