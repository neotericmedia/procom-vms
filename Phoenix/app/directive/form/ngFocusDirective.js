//(function (directives) {
//    'use strict';
//    directives.directive('ngFocus', ['$parse', function ($parse) {
//        return function (scope, element, attr) {
//            var fn = $parse(attr.ngFocus);
//            element.bind('click', function (event) {
//                if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(function () { fn(scope, { $event: event }); }); }
//                else { scope.$eval(function () { fn(scope, { $event: event }); }); }
//            });
//        };
//    }]);
//})(Phoenix.Directives);