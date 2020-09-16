(function (ng) {
    'use strict';
    ng.module('smart-table')
    .directive('stPenName', function () {
        return {
            // Acts as a identifier name for each column
            restrict: 'A',
            link: function (scope, element, attr, ctrl) {
            }
        };
    });
})(angular);
