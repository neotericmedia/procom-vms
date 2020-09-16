(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stGetPreCompiled', ['$window', function ($window) {
            return {
                priority: 1002,
                restrict: 'A',
                require: 'stTable',
                compile: function (element, attrs, transcludeFn) {
                    element.context.newMinWidth = attrs.stGetPreCompiled;
                    if (element.context.ATHead = element.context.tHead != null) {
                    element.context.ATHead = element.context.tHead.innerHTML;
                    }
                    if (element.context.ATBody = element.context.tBodies[0] != null) {
                        element.context.ATBody = element.context.tBodies[0].innerHTML;
                    }
                    if ( element.context.ATFoot = element.context.tFoot != null) {
                        element.context.ATFoot = element.context.tFoot.innerHTML;
                    }
                }
            };
        }]);
})(angular);
