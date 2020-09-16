//  <input type="text" input-text-limit-to-max-length="10"/>
(function (directives) {
    'use strict';
    directives.directive("inputTextLimitToMaxLength", [function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var limit = parseInt(attrs.inputTextLimitToMaxLength);
                angular.element(elem).on("keypress", function (e) {
                    if (this.value.length == limit) e.preventDefault();
                });
            }
        };
    }]);
})(Phoenix.Directives);