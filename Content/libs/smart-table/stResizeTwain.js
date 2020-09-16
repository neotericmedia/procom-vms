(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stResizeTwain', ['$window', function ($window) {
            return function (scope, element, attr) {

                window.onresize = resize;
                // Resize table's height after dragging page, if not used and scrollbar is not at the 0 position, then
                // there will be displacement of table outside visible space

                function resize() {
                    var findByClass = document.getElementsByClassName("horizontal-scroll");
                    angular.forEach(findByClass, function (currentElement) {
                        angular.forEach(currentElement.children, function (child) {
                            if (child.firstElementChild.localName == "tbody") {
                                currentElement.scrollTop = 0;
                            }
                        });
                    });
                }
            }
        }]);
})(angular);