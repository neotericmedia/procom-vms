//(function (directives) {
//    'use strict';

//    directives.directive('ngEnter', function () {
//        return function (scope, element, attrs) {
//            element.bind("keydown keypress", function (event) {
//                if (event.which === 13) {

//                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(attrs.ngEnter); }

//                    event.preventDefault();
//                }
//            });
//        };
//    });

//})(Phoenix.Directives);

