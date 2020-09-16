/**

Wrap in a div if not using stFixedHeader with a fixed height and overflow.

<div class="panel panel-default" style="height: 500px; overflow-y: scroll;">
...
</div>

**/

(function (ng) {
    ng.module('smart-table')
    .directive('stPaginationScroll', ['$timeout', '$compile', function (timeout, $compile) {
        return {
            restrict: 'A',
            priority: 1005,
            require: 'stTable',
            link: function (scope, element, attr, ctrl) {
                var inBodyElement = typeof attr.stFixedHeader == "string";
                element.addClass('table-layout-fixed');

                var colSpan = angular.element("thead > tr th", element).length;

                var $el = inBodyElement ? angular.element("<tr data-ng-hide=\"maxedOut\"><td colspan='" + colSpan + "' style='width:100%;'><div class=\"loading-indicator\"></div></td></tr>")
                    : angular.element("<div data-ng-hide=\"maxedOut\" class=\"loading-indicator\"></div>");

                scope.maxedOut = false;

                var itemsPerPage = scope.$eval(attr.stPaginationScroll);
                itemsPerPage = itemsPerPage ? itemsPerPage : 10;
                var pagination = ctrl.tableState().pagination;
                var lengthThreshold = 50;
                var timeThreshold = 200;
                var handler = function () {
                    //call next page
                    ctrl.slice(pagination.start + itemsPerPage, itemsPerPage);
                };
                var promise = null;
                var lastRemaining = 9999;
                var myNav = navigator.userAgent.toLowerCase();
                var ieVersion = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
                var container;
                if (!ieVersion)
                    container = inBodyElement ? angular.element('tbody', element) : angular.element(element.parent());
                else {
                    container = $(element).parent();
                }

                //element.context.ATBodyScrollY must change from 'visible;' to 'scroll;' in order to enter this watch
                scope.$watch(attr.stTable, function (pageLimit, directiveScope) {
                    return function (newValue, oldValue) {
                        //element.context.style.overflowY = "scroll";
                        var oldValueCount = oldValue ? oldValue.length : 0;
                        var newValueCount = newValue ? newValue.length : 0;
                        var difference = newValueCount - oldValueCount;
                        directiveScope.maxedOut = newValueCount != pageLimit && (difference < pageLimit || difference == 0);
                    }
                }(itemsPerPage, scope));

                container.append($el);
                $compile($el)(scope);

                container.removeAttr('st-pagination-scroll');
                container.attr('vs-repeat', '');

                //assign to container
                container.bind('scroll', function (directiveScope) {
                    return function () {
                        var remaining = container[0].scrollHeight - (container[0].clientHeight + container[0].scrollTop);
                        //var remaining = element.context.children['1'].scrollHeight - (element.context.children['1'].clientHeight + element.context.children['1'].scrollTop);

                        //if we have reached the threshold and we scroll down
                        if (remaining < lengthThreshold && (remaining - lastRemaining) < 0 && !directiveScope.maxedOut) {

                            //if there is already a timer running which has no expired yet we have to cancel it and restart the timer
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
            }

        };
    }]);

})(angular);