/// <reference path="../../../../libs/jquery/jquery-1.9.1.js" />
/// <reference path="../../../../libs/jquery/jquery-1.9.1.intellisense.js" />
/// <reference path="../../../../libs/angular/angular.js" />
(function (directives) {
    'use strict';

    directives.directive('modalManager', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
        return {
            restrict: 'EA',
            terminal: true,
            link: function (scope, elm, attrs) {
                var opts = angular.extend({}, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
                var shownExpr = attrs.modalManager || attrs.show;
                var setClosed;

                // Create a dialog with the template as the contents of the directive
                // Add the current scope as the resolve in order to make the directive scope as a dialog controller scope
                //opts = angular.extend(opts, {
                //    template: elm.html(),
                //    resolve: { $scope: function () { return scope; } }
                //});

                if (attrs.close) {
                    setClosed = function () {
                        $parse(attrs.close)(scope);
                    };
                } else {
                    setClosed = function () {
                        if (angular.isFunction($parse(shownExpr).assign)) {
                            if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                                $timeout(function() {
                                    $parse(shownExpr).assign(scope, false);
                                }, 0);
                            }
                        }
                    };
                }

                // expose modal actions at the scope
                scope.modal = {};
                scope.modal.action = function (action) {
                    $(elm).modal(action);
                };

                scope.$watch(shownExpr, function (isShown, oldShown) {
                    if (isShown) {
                        $(elm).modal(opts);
                        $compile(elm)(scope);
                                               
                        $(elm).on('hidden', function () {
                            setClosed();
                        });
                    } else {
                        //Make sure it is not opened
                        $(elm).modal('hide');
                    }
                });
            }
        };
    }]);

})(Phoenix.Directives);