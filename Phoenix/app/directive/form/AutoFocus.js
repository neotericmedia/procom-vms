(function (directives) {
   /**
   * @ngdoc directive
   * @name directives.autofocus
   *
   * @description
   * Puts focus onto the selected element once it appears on the screen. The autofocus attribute doesn't work on it's own
   * 100% of the time in angular due to how views get loaded. This should allow it to work consistently.
   * @element A
   * @example
   <doc:example>
     <doc:source>
        <input ng-model="model" autofocus type="text"/>
     </doc:source>
   </doc:example>
   */
    
    directives.directive('autofocus', function () {
        return {
            restrict: 'A',
            link: function (scope, ele, attr) {
                setTimeout(function () {
                    ele.focus();
                }, 10);
            }
        };
    });
    

    directives.directive('ptParentTable', function () {
        return {
            restrict: 'C',
            link: function (scope, ele, attr) {
                ele.addClass("well well-box well-nice no-border");
            }
        };
    });
    
})(Phoenix.Directives);

