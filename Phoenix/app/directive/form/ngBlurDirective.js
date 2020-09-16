//(function (directives) {
//    'use strict';

//    directives.directive('ngBlur', ['$parse', function ($parse) {
//        return function (scope, element, attr) {
//            var fn = $parse(attr.ngBlur);
//            element.bind('blur', function (event) {
//                console.log('Blurred again');
//                if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(function () { fn(scope, { $event: event }); }); }

//            });
//        };
//    }]);

//})(Phoenix.Directives);