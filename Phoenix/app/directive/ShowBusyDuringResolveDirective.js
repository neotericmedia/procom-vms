(function (directives) {

    directives.directive('showBusyDuringResolve', ['$rootScope', '$compile', function ($rootScope, $compile) {

        return {
            restrict: 'E',
            templateUrl: '/Phoenix/app/directive/ShowBusyDuringResolve.html',
            replace: true,
            link: function (scope, element) {

                element.addClass('ng-hide');
                angular.element(angular.element(element.children()[1]).children()[0])
                                .css('position', 'absolute')
                                .css('top', '30%')
                                .css('left', 0)
                                .css('right', 0)
                                .css('bottom', 0);
                $compile(element)(angular.extend(scope, { $message: 'Please wait...' }));
                var unregister = $rootScope.$on('$stateChangeStart', function () {
                    element.removeClass('ng-hide');
                });
                $rootScope.$on('$stateChangeSuccess', function () {
                    element.addClass('ng-hide');
                });

                scope.$on('$destroy', unregister);
            }
        };
    }]);
})(Phoenix.Directives);