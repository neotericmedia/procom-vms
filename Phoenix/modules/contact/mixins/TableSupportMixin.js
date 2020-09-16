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
            totalItemCount: 0
        })
        .factory('TableSupportFactory', ['defaultTableParams', TableSupportFactory]);

    // this might seem a little odd, but in angular, services et al are "singletons" (sort of), but not quite, so we
    // want a contextually appropriate TableSupportMixin that's a) reusable, b) contextual (i.e. controller-per based)
    // this factory will supply a creator pattern that will do both.
    // todo - move this to a higher level package/module
    function TableSupportFactory (defaultTableParams) {
        return {
            createTableSupportMixin: function (tableParams) {
                return new TableSupportMixin(angular.extend(defaultTableParams, tableParams));
            }
        };
    }

    function TableSupportMixin (tableParams) {
        var self = this;

        angular.extend(self, tableParams, {
            getData: getData
        });

        // while this might look messy, it's a necessity, but this isn't a true factory/service - it's a helper/mixin, so the scope is fine.
        function getData(tableState, scope) {
            if (self.serviceMethod && self.dataTargetItems) {
                scope.currentPage = scope.currentPage || self.currentPage;

                var isPaging = false;

                if (tableState.pagination.start === 0) {
                    // full refresh
                    angular.element("table[data-st-table='items'] tbody").scrollTop(0);
                    isPaging = false;
                } else {
                    // paginating
                    scope.currentPage++;
                    isPaging = true;
                }

                tableState.pagination.currentPage = scope.currentPage;
                tableState.pagination.pageSize = self.pageSize;

                var promise = self.serviceMethod(tableState)
                    .then(function (response) {
                        if (isPaging) {
                            scope.items = response[self.dataTargetItems];

                            scope.totalItemCount = self.dataTargetCount ? response[self.dataTargetCount] : scope.items.length;
                        } else {
                            scope.currentPage = 1;
                            scope.items = response[self.dataTargetItems];
                            scope.totalItemCount = self.dataTargetCount ? response[self.dataTargetCount] : scope.items.length;
                        }
                    });

                scope.busyPromise = isPaging ? null : promise;
            }
        }
    }
})();