import * as Spinner from 'spin.js';
(function (directives) {
    'use strict';
    /**
     <div>
        <div ng-show="loading" class="my-loading-spinner-container"></div>
        <div ng-hide="loading" ng-transclude></div>
     </div>
    **/

    directives.directive('loadingSpinner', function () {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {
                loading: '=loadingSpinner'
            },
            template: "<div><div ng-show='loading' class='loading-spinner-container print-hidden' style='position:relative; left:50%; width:100px;'></div><div ng-hide='loading' ng-transclude></div></div>",
            link: function (scope, element, attrs) {                
                var spinner = new Spinner().spin();
                var container = element.find('.loading-spinner-container');
                var top = Math.max(0, (($(window).height() - $('.page-content').height()) / 3) + $(window).scrollTop()) + "px";
                $(container).css({ "top": top});
                var loadingContainer = element.find('.loading-spinner-container')[0];
                loadingContainer.appendChild(spinner.el);
            }
        };
    });

})(Phoenix.Directives);