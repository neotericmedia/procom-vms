﻿(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('combineHorizontalScrolls', [function () {
            var scrollLeft = 0;
            function combine(elements) {
                elements.on('scroll', function (e) {
                    if (e.isTrigger) {
                        e.target.scrollLeft = scrollLeft;
                    } else {
                        scrollLeft = e.target.scrollLeft;
                        elements.each(function (element) {
                            if (this !== (e.target)) {
                                $(this).trigger('scroll');
                            }
                        });
                    }
                });
            }

            return {
                restrict: 'A',
                replace: false,
                compile: function (element, attrs) {
                    combine(element.find('.' + attrs.combineHorizontalScrolls));
                }
            };
        }]);
})(angular);