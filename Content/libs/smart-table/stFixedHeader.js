(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stFixedHeader', ['$window', function ($window) {
            return {
                compile: function (element, attrs, transcludeFn) {
                    var fudgeFactor = 90;

                    var maxHeight = element.attr('st-fixed-header') ? parseInt(element.attr('st-fixed-header'), 10) : element.attr('data-st-fixed-header') ? parseInt(element.attr('data-st-fixed-header'), 10) : 0;
                    maxHeight = maxHeight && !isNaN(maxHeight) ? maxHeight : 999999;

                    
                    element.addClass('fixed-columns');

                    var w = angular.element($window);
                    var myNav = navigator.userAgent.toLowerCase();
                    var ieVersion =(myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]): false;

                    var resizeObj = {
                        resizeBody: function() {
                            var tBody = angular.element('tbody', element);
                            var tFooter = angular.element('tfoot', element);
                            var top = element[0].getBoundingClientRect().top;
                            var resultingHeight = Math.min(window.innerHeight - angular.element('.navbar').height() - top - fudgeFactor - tFooter.height(), maxHeight);
                            //IE9 && lower
                            if (ieVersion && ieVersion < 10) {
                                $(element).parent().css({ "height": resultingHeight + 'px', "overflow-y": "scroll", "position": "" });
                                var thead = angular.element('thead', element);
                                var theadHeight = thead.height();
                                $(".smart-table-wrapper").css({ "position": "relative", "padding-top": theadHeight });
                                thead.css({ "position": "absolute", "top": "0", "width": "100%" });
                                thead.find('th:last').css("width",'20em');
                                var tFooterTop = $(".smart-table-wrapper").height() + fudgeFactor;
                                tFooter.css({ "position": "absolute", "top": tFooterTop, "width": "100%" });
                            } else {
                                tBody.css('height', resultingHeight + 'px');
                            }
                        },
                        setup: function() {
                            this.cancel();
                            var self = this;
                            this.timeoutID = window.setTimeout(function(msg) { self.resizeBody(); }, 200);
                        },
                        cancel: function() {
                            if (typeof this.timeoutID == "number") {
                                window.clearTimeout(this.timeoutID);
                                delete this.timeoutID;
                            }
                        }
                    };
                    w.bind('resize', function() {
                        resizeObj.setup();
                    });
                    resizeObj.setup();
                }
            };
        }]);
})(angular);
