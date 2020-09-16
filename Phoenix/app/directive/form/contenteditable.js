(function (directives) {
    'use strict';

    directives.directive('contenteditable', ['$timeout',function ($timeout) {
        return {
            restrict: 'A', // only activate on element attribute
            require: 'ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function () {
                    var text = ngModel.$viewValue || '&nbsp;';
                    if (ngModel.$viewValue === 0) text = '&nbsp;';
                    element.html(text);
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        $timeout(function() {
                            read();
                        }, 0);
                    }
                });

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    html = html.replace('<br>', '').trim();
                    html = html.replace('<br/>', '').trim();
                    html = html.replace('&nbsp;', '').trim();
                    ngModel.$setViewValue(html);
                }
            }
        };
    }]);
})(Phoenix.Directives);


