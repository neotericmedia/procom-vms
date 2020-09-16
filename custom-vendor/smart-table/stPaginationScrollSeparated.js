(function (ng) {
    ng.module('smart-table')
    .directive('stPaginationScrollSeparated', ['$timeout', '$compile', '$q', function ($timeout, $compile, $q) {
        return {
            restrict: 'A',
            require: '^?stTable',
            priority: 1010,
            link: function (scope, element, attr, ctrl) {
                if (ctrl != undefined) {
                    var inBodyElement = true;
                    var colSpan = scope.penNames.length;
                    var $el = angular.element("<tr data-ng-hide=\"maxedOut\"><td colspan='" + colSpan + "' style='width:100%;'><div class=\"loading-indicator\"></div></td></tr>");
                    // If outside of Table, then just add a div to the end
                    // angular.element("<div data-ng-hide=\"maxedOut\" class=\"loading-indicator\"></div>");
                    scope.itemsPerPage = scope.$eval(attr.stPaginationScrollSeparated);
                    scope.itemsPerPage = scope.itemsPerPage ? scope.itemsPerPage : 10;
                    var pagination = ctrl.tableState().pagination;
                    var lengthThreshold = 50;
                    var timeThreshold = 250;
                    scope.handler = function () {
                        //var defer = $q.defer();
                        // call next page
                        ctrl.slice(pagination.start + scope.itemsPerPage, scope.itemsPerPage);
                            //.then(
                                //function (responseSucces) {
                                //    defer.resolve(responseSucces);
                                //}, function (responseError) {
                                //    defer.reject(responseError);
                                //});
                        //return defer.promise;
                    };
                    var promise = null;
                    var lastRemaining = 9999;
                    var container;
                    // container is simply just to show the spinning animation on the last visible row, 
                    // that interprets some live progress is happening
                    container = angular.element('tbody', element[0].children[0]);

                    container.append($el);
                    $compile($el)(scope);

                    //container.removeAttr('st-pagination-scroll-separated');
                    container.attr('vs-repeat', '');

                    // This function will be checked on load/startup, search click, and resizing of the page.
                    scope.onLoadMoreThanOnePage = function () {
                        var remaining = element[0].scrollHeight - (element[0].clientHeight + element[0].scrollTop);
                        // remaining is 0 and there is more items to be loaded then continue to surpass the one page on pageLoad.
                        if (remaining == 0 && typeof scope.items != 'undefined' && typeof scope.totalItemCount != 'undefined' && scope.totalItemCount > scope.items.length) {
                            // Note: that scope.items may be undefined, which is referenced inside each pages controller, hence there may be times when there is no access to
                            // amount of current rows, as variables fluctuate depending on page. It could be later possible to add parameter under ctrl.tableState(); under the pagination section if needed.
                            //var waitForLoad = $q.defer();
                            scope.handler();
                            //.then(
                                //function (responseSucces) {
                                //    scope.onLoadMoreThanOnePage();
                                //    waitForLoad.resolve();

                                //}, function (responseError) {
                                //    waitForLoad.reject(responseError);
                                    
                                //});
                            //return waitForLoad.promise;
                        }
                    }

                    //assign to container
                    element.bind('scroll', function (directiveScope) {
                        return function () {
                            scope.showColumnView = false;
                            var remaining = element[0].scrollHeight - (element[0].clientHeight + element[0].scrollTop);
                            if (remaining < lengthThreshold && (remaining - lastRemaining) < 0 && !directiveScope.maxedOut) {
                                if (promise !== null) {
                                    $timeout.cancel(promise);
                                }
                                promise = $timeout(function () {
                                    scope.handler();
                                    promise = null;
                                }, timeThreshold);
                            }
                            lastRemaining = remaining;
                        };
                    }(scope));
                }
            }
        };
    }]);

})(angular);