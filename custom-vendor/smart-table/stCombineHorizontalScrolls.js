(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('combineHorizontalScrolls', ['$timeout',  function ($timeout) {
            //var scrollLeft = 0;
            function combine(elements, scope) {

                // fix table mis-align issue 
                // * when 2nd element has vertical scroll the header and body
                // gets misaligned
                $timeout(function () {
                    // wait for DOM render

                    // get scroll width
                    var scrollbarWidth = elements[1].offsetWidth - elements[1].clientWidth;
                    if (scrollbarWidth){

                        var adj = scrollbarWidth;
                        var table = $(elements[0]).find('table').first();

                        // create a new cell on the header
                        // * reserve space to simulate the scroll bar
                        // * copy format of th cells 
                        // * maintain exisitng cells widths
                        var tr = table.find('thead > tr')[0];
                        var th = $(tr).find('th').first();                        
                        var cell = $(tr.insertCell(-1));
                        cell.css('width', adj + 'px');
                        cell.css('border-bottom-color', th.css('border-bottom-color'));
                        
                        // set the table min-width
                        // * required to align columns
                        var minWidth = (parseInt(table.css('min-width')) + adj) + 'px';                        
                        table.css('min-width', minWidth);
                        
                        // the table min-width gets modified when the data gets loaded
                        // make sure apply the minWidth when it changes
                        scope.$watch(function() { return table.css('min-width'); }, function(newValue){
                            if (newValue != minWidth){
                                table.css('min-width', minWidth)
                            }
                        });

                    }

                });

                elements.on('scroll', function (e) {
                    //if (e.isTrigger) {
                    //    e.target.scrollLeft = scrollLeft;
                    //} else {
                    //    scrollLeft = e.target.scrollLeft;
                    //    elements.each(function (element) {
                    //        if (this !== (e.target)) {
                    //            $(this).trigger('scroll');
                    //        }
                    //    });
                    //}
                    elements[0].scrollLeft = elements[1].scrollLeft;
                });
            }

            return {
                restrict: 'A',
                replace: false,
                compile: function (element, attrs) {                    
                    return {
                        pre: function preLink( scope, element, attributes ) {
                            combine(element.find('.' + attrs.combineHorizontalScrolls), scope);                            
                        },                        
                    };
                }
            };
        }]);
})(angular);