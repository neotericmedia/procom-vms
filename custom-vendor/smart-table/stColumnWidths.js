(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stColumnWidths', ['$window', function ($window) {
            return {
                //priority: 1004,
                compile: function (element, attrs, transcludeFn) {
                    var array = JSON.parse(attrs.stColumnWidths);
                    if (array && array.length > 0) {
                        for (var i = 0; i < array.length; i++) {
                            var currWidth = array[i];

                            angular.forEach(angular.element('thead tr', element), function (item) {
                                var childItem = angular.element('th:eq(' + i + ')', item);
                                if (!childItem.hasClass('ignore-st-column-width')) {
                                    childItem.css('width', currWidth + '%');
                                    var childInput = angular.element('input, select', childItem);
                                    childInput.addClass('fixed');
                                }
                            });

                            angular.forEach(angular.element('tbody tr', element), function (item) {
                                var childItem = angular.element('td:eq(' + i + ')', item);
                                if (!childItem.hasClass('ignore-st-column-width')) {
                                    childItem.css('width', currWidth + '%');
                                }
                            });
                        }
                    }
                }
            };
        }]);
})(angular);
