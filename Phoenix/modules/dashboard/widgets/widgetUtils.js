(function () {
    'use strict';

    WidgetUtils.$inject = ['$rootScope', '$state'];

    function WidgetUtils($rootScope, $state) {

        var setTableState = function (toState, predicate, searchNames) {
            var location = toState;
            $rootScope.globalTableState = $rootScope.globalTableState || [];
            var tableStateObjects = _.filter($rootScope.globalTableState, function (i) { return i.routeName == location; }) || [];
            if (tableStateObjects.length === 0) {
                var tableStateObject = {
                    routeName: location,
                    searchNames: [],
                    selectedRows: [],
                    masterSelector: false,
                    tableState: {
                        sort: {},
                        pagination: {
                            start: 0
                        },
                        isLoadedFromPreviousState: true,
                    },
                };
                $rootScope.globalTableState.push(tableStateObject);
                tableStateObjects = [tableStateObject];
            }
            // If predicate is assigned as a reference, the original can be modified in-place from UI.
            var predicateObject = angular.copy(predicate);
            _.forEach(tableStateObjects, function (i) {
                i.searchNames = searchNames || [];
                i.tableState.search = {
                    predicateObject: predicateObject,
                };
            });

        };

        var getItems = function (queryFunc, predicate, selectList, arg3) {
            var tableState = {
                search: {
                    predicateObject: predicate,
                },
            };
            var oDataParams = oreq.request()
                .withSelect(selectList)
                .url();

            return queryFunc(tableState, oDataParams, arg3);
        };


        var getItems2 = function (queryFunc, predicate, selectList) {
            var oDataParams = oreq.request()
                .withSelect(selectList)
                .withFilter(oreq.filter().smartTableObjectConverter(predicate))
                .withTop(1)
                .withInlineCount()
                .url();

            //var tableState = {
            //    search: {
            //        predicateObject: predicate,
            //    },
            //};

            //var oDataParams2 = SmartTableService.generateRequestObject(tableState)
            //    .withSelect(selectList)
            //;
            //var oDataParams = oDataParams2.url();

            return queryFunc(oDataParams);
        };

        var getAllItems = function (queryFunc, predicate, selectList) {
            var tableState = {
                search: {
                    predicateObject: predicate,
                },
                pagination: {
                    pageSize: 1000000
                },
            };
            var oDataParams = oreq.request()
                .withSelect(selectList)
                .url();

            return queryFunc(tableState, oDataParams);
        };

        var customGetItems = function (queryFunc, oDataParams) {
            return queryFunc(oDataParams);
        }

        return {
            setTableState: setTableState,
            getItems: getItems,
            getItems2: getItems2,
            getAllItems: getAllItems,
            customGetItems: customGetItems,
        };
    }

    angular.module('phoenix.widgets')
      .service('WidgetUtils', WidgetUtils)
    ;

})();