(function (ng) {
    ng.module('smart-table')
    .directive('stPaginationScrollSeparated', ['$timeout', '$compile', function (timeout, $compile) {
        return {
            restrict: 'A',
            priority: 1005,
            require: 'stTable',
            link: function (scope, element, attr, ctrl) {
                var inBodyElement = typeof attr.stFixedHeader == "string";

                var colSpan = angular.element("thead > tr th", element).length;

                var $el = inBodyElement ? angular.element("<tr data-ng-hide=\"maxedOut\"><td colspan='" + colSpan + "' style='width:100%;'><div class=\"loading-indicator\"></div></td></tr>")
                    : angular.element("<div data-ng-hide=\"maxedOut\" class=\"loading-indicator\"></div>");

                scope.maxedOut = false;
                var itemsPerPage = scope.$eval(attr.stPaginationScrollSeparated);
                itemsPerPage = itemsPerPage ? itemsPerPage : 10;
                var pagination = ctrl.tableState().pagination;
                var lengthThreshold = 50;
                var timeThreshold = 200;
                var handler = function () {
                    // call next page
                    ctrl.slice(pagination.start + itemsPerPage, itemsPerPage);
                };
                var promise = null;
                var lastRemaining = 9999;
                var myNav = navigator.userAgent.toLowerCase();
                var ieVersion = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
                var container;
                // container is simply just to show the spinning animation on the last visible row, 
                // that interprets some live progress is happening
                if (!ieVersion)
                    container = inBodyElement ? angular.element('tbody', element) : angular.element(element.parent());
                else {
                    container = $(element).parent();
                }

                scope.$watch(attr.stTable, function (pageLimit, directiveScope) {
                    return function (newValue, oldValue) {
                        var oldValueCount = oldValue ? oldValue.length : 0;
                        var newValueCount = newValue ? newValue.length : 0;
                        var difference = newValueCount - oldValueCount;
                        directiveScope.maxedOut = newValueCount != pageLimit && (difference < pageLimit || difference == 0);
                    }
                }(itemsPerPage, scope));

                container.append($el);
                $compile($el)(scope);
                //var findByClass = document.getElementsByClassName("horizontal-scroll");

                var inputElement = angular.element(element);
                var parentElement = inputElement.parent().parent();
                var scrollBarElement = parentElement.find(".separatedTablesDiv4");
                element.context.scrollBarElement = scrollBarElement;
                //if (findByClass.length > 0) {
                    //assign to container
                    element.context.scrollBarElement.bind('scroll', function (directiveScope) {
                        return function () {
                            var remaining = element.context.scrollBarElement[0].scrollHeight - (element.context.scrollBarElement[0].clientHeight + element.context.scrollBarElement[0].scrollTop);
                            if (remaining < lengthThreshold && (remaining - lastRemaining) < 0 && !directiveScope.maxedOut) {

                                if (promise !== null) {
                                    timeout.cancel(promise);
                                }
                                promise = timeout(function () {
                                    handler();
                                    promise = null;
                                }, timeThreshold);
                            }
                            lastRemaining = remaining;
                        };
                    }(scope));
                //}
            }

        };
    }]);

})(angular);