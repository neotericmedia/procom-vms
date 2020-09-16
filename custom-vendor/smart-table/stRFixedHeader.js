(function (ng) {
    'use strict';
    ng.module('smart-table')
        .directive('stRFixedHeader', ['$window', function ($window) {
            return {
                require: '^?stTable',
                link: function (scope, element, attrs, transcludeFn) {
                    var fudgeFactor = 90;

                    var maxHeight = element.attr('st-fixed-header') ? parseInt(element.attr('st-fixed-header'), 10) : element.attr('data-st-fixed-header') ? parseInt(element.attr('data-st-fixed-header'), 10) : 0;
                    maxHeight = maxHeight && !isNaN(maxHeight) ? maxHeight : 999999;

                    if (attrs.stFixedHeader == undefined || attrs.stFixedHeader == "") {
                        element.addClass('r-fixed-columns');
                    }
                    else {
                        element.addClass(attrs.stFixedHeader);
                    }

                    var w = angular.element($window);

                    var resizeObj = {
                        resizeBody: function () {
                            var tBody = angular.element('tbody', element);
                            var tFooter = angular.element('tfoot', element);
                            var top = element[0].getBoundingClientRect().top;
                            var resultingHeight = tBody.hasClass('ignore-set-height') ? tBody.height() : Math.min(window.innerHeight - angular.element('.navbar').height() - top - fudgeFactor - tFooter.height(), maxHeight);
                            $(element).parent().css({ "height": resultingHeight + 'px', "overflow-y": "scroll" });
                            var thead = angular.element('thead', element);
                            var theadHeight = thead.height();
                            $(".smart-table-wrapper").css({ "position": "relative" });
                            thead.css({ "top": "0", "width": "100%" });
                            //thead.find('th:last').css("width", '20em');
                            var tFooterTop = $(".smart-table-wrapper").height() + fudgeFactor;
                            tFooter.css({ "top": tFooterTop, "width": "100%" });
                        },
                        setup: function () {
                            this.cancel();
                            var self = this;
                            this.timeoutID = window.setTimeout(function (msg) { self.resizeBody(); }, 200);
                        },
                        cancel: function () {
                            if (typeof this.timeoutID == "number") {
                                window.clearTimeout(this.timeoutID);
                                delete this.timeoutID;
                            }
                        }
                    };
                    w.bind('resize', function () {
                        resizeObj.setup();
                        scrollToTop();
                        // Load more pages if need to after resize
                        if (typeof scope.onLoadMoreThanOnePage != 'undefined') {
                            scope.onLoadMoreThanOnePage();
                        }
                    });
                    resizeObj.setup();

                    // there will be displacement of table outside visible space if scroll bar not at top upon resize
                    function scrollToTop() {
                        var findByClass = document.getElementsByClassName("horizontal-scroll");
                        angular.forEach(findByClass, function (currentElement) {
                            angular.forEach(currentElement.children, function (child) {
                                if (child.firstElementChild.localName == "tbody") {
                                    currentElement.scrollTop = 0;
                                }
                            });
                        });
                    }
                }
            };
        }]);
})(angular);
