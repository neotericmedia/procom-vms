(function (directives) {

    directives.directive('showBusyControlled', ['$rootScope', '$compile', function ($rootScope, $compile) {

        return {
            restrict: 'E',
            templateUrl: '/Phoenix/app/directive/ShowBusyControlled.html',
            replace: true,
            link: function (scope, element, attr) {
                angular.element(angular.element(element.children()[1]).children()[0])
                                .css('position', 'absolute')
                                .css('top', '30%')
                                .css('left', 0)
                                .css('right', 0)
                                .css('bottom', 0);
                $compile(element)(angular.extend(scope, { $message: attr.message || 'Please wait...', $show: attr.associate, $intrusive: attr.nonIntrusive !== 'true' }));
            }
        };
    }]);
})(Phoenix.Directives);