(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stAdvancedPipe', ['$q', function ($q) {
            return {
                require: 'stTable',
                scope: {
                    stAdvancedPipe: '='
                },
                link: {
                    pre: function (scope, element, attrs, ctrl) {

                        var defaults = {
                            promise: function () {
                                return $q.reject('Promise not set!');
                            },
                            success: function(data) {
                                return data;
                            },
                            error: function (error) {
                                console.log(error);
                                return error;
                            }
                        };

                        if (ng.isObject(scope.stAdvancedPipe)) {

                            ctrl.preventPipeOnWatch();

                            ng.extend(defaults, scope.stAdvancedPipe);

                            var newPipeFunction = function (tableState) {
                                scope.stAdvancedPipe.promise.then(scope.stAdvancedPipe.success, scope.stAdvancedPipe.error);
                            };

                            ctrl.pipe = ng.bind(ctrl, newPipeFunction, ctrl.tableState());
                        }
                    }
                }
            };
        }]);
})(angular);
