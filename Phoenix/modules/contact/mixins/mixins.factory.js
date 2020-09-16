/**
 * tableParams parameter should look like this:
 * {
 *      currentPage: <default 1>
 *      pageSize: <default 30>
 *      serviceMethod: <the actual service method you want called that takes in the tableState parameter>
 *      dataTargetItems: <the string name of the target parameter of the returned result object, i.e. 'Items'>
 *      dataTargetCount: <the string name of the count parameter on the returned data>
 * }
 *
 * (You can add any additional parameters below - they will be overridden as action demands)
 *
 * This is the interface that the TableSupportMixin will expose (populated on return of promise):
 * {
 *      currentPage:
 *      busyPromise: <the promise that can be used for busy spinners>
 *      items: <an array of data that comes back from the server>
 *      pageSize:
 *      pageCount:
 *      totalItemCount:
 *      callServer: <the server call method>
 *      externalMethod: <the name of the method to be called on table queries, default 'callServer'
 * }
 *
 * Just bind this object to the scope like so:
 * angular.extend($scope, TableSupportFactory(tableParams));
 *
 * ...and then bind the relevant scoped parameters to your view.
 *
 */
(function () {
    'use strict';

    angular.module('phoenix.contact.mixins')
        .value('defaultTableParams', {
            currentPage: 1,
            pageSize: 30,
            serviceMethod: null,
            dataTargetItems: null,
            dataTargetCount: null,
            busyPromise: null,
            pageCount: 0,
            totalItemCount: 0,
            externalMethod: 'callServer'
        })
        .factory('mixinsFactory', mixinsFactory);

    mixinsFactory.$inject = ['defaultTableParams'];

    function mixinsFactory(defaultTableParams) {
        return {
            createTableSupportMixin: function (tableParams, oDataParams, args) {
                return new TableSupportMixin(angular.extend(defaultTableParams, tableParams), oDataParams, args);
            }
        };
    }

    function TableSupportMixin(tableParams, oDataParams, args) {
        var self = this;
        var target = null;
        self[tableParams.externalMethod] = getData;

        angular.extend(self, tableParams, {
            init: init
        });

        function init(that) {
            target = that;
            // todo - ok, so this won't work - need to add the properties directly to the target, just like the scope.
            angular.extend(target, self);
        }

        // while this might look messy, it's a necessity, but this isn't a true factory/service - it's a helper/mixin, so the scope is fine.
        function getData(tableState, oDataParamsOnRefresh, argsOnRefresh) {

            if (typeof argsOnRefresh !== 'undefined' && args !== argsOnRefresh) {
                args = argsOnRefresh;
            }

            if (self.serviceMethod && self.dataTargetItems) {
                target.currentPage = target.currentPage || self.currentPage;

                var isPaging = false;

                if (typeof target.viewLoadingMixin != 'undefined') {
                    target.viewLoadingMixin = true;
                }

                if (tableState.pagination.start === 0) {
                    // full refresh
                    // todo - this is ugly here...
                    angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                    isPaging = false;
                    target.currentPage = 1;
                } else {
                    // paginating
                    target.currentPage++;
                    isPaging = true;
                }

                tableState.pagination.currentPage = target.currentPage;
                tableState.pagination.pageSize = self.pageSize;

                if (!tableState.isLoadedFromPreviousState && self.initialSearchPredicateObject) {
                    tableState.search.predicateObject = tableState.search.predicateObject || {};
                    angular.extend(tableState.search.predicateObject, self.initialSearchPredicateObject);
                }

                var promise = self.serviceMethod(tableState, oDataParams, args)
                    .then(function (response) {
                        if (isPaging && target.items) {
                            target.items = target.items.concat(response[self.dataTargetItems]);
                            target.totalItemCount = self.dataTargetCount ? response[self.dataTargetCount] : target.items.length;
                        } else {
                            target.currentPage = 1;
                            target.items = response[self.dataTargetItems];
                            target.totalItemCount = self.dataTargetCount ? response[self.dataTargetCount] : target.items.length;
                        }
                        if (typeof target.successfulRetrieval === 'function') {
                            target.successfulRetrieval(target.items, tableState);
                        }
                    }, function (error) {
                        if (typeof self.errorRetrieval === 'function') {
                            self.errorRetrieval(error);
                        }
                    });

                target.busyPromise = isPaging ? null : promise;
            }
        }
    }
})();