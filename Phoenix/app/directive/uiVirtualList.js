/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';

    directives.directive('uiVirtualList', [function () {
        return {
            restrict: 'E',
            require: "ngModel",
            templateUrl: function ($scope, $attrs) {
                if (typeof $attrs.uiVirtualListTemplate !== 'undefined' && $attrs.uiVirtualListTemplate.length > 0) {
                    return $attrs.uiVirtualListTemplate;
                }
                else {
                    return "/Phoenix/app/directive/uiVirtualList.html";
                }
            },
            scope: {
                uiVirtualListData: '=',
                uiVirtualListOnSelect: '&',
            },
            link: function (scope, elem, attrs, ngModelCtrl) {
                var rowHeight = 10;

                scope.height = 400;
                scope.scrollTop = 0;
                scope.visibleProvider = [];
                scope.cellsPerPage = 0;
                scope.numberOfCells = 0;
                scope.canvasHeight = {};

                scope.init = function () {
                    elem[0].addEventListener('scroll', scope.onScroll);
                    scope.cellsPerPage = Math.round(scope.height / rowHeight);
                    scope.numberOfCells = 3 * scope.cellsPerPage;
                    scope.canvasHeight = {
                        height: scope.uiVirtualListData.length * rowHeight + 'px'
                    };

                    scope.updateDisplayList();
                };

                scope.updateDisplayList = function () {
                    var firstCell = Math.max(Math.floor(scope.scrollTop / rowHeight) - scope.cellsPerPage, 0);
                    var cellsToCreate = Math.min(firstCell + scope.numberOfCells, scope.numberOfCells);
                    scope.visibleProvider = scope.uiVirtualListData.slice(firstCell, firstCell + cellsToCreate);

                    for (var i = 0; i < scope.visibleProvider.length; i++) {
                        scope.visibleProvider[i].styles = {
                            'top': ((firstCell + i) * rowHeight) + "px"
                        };
                    }
                };

                scope.onScroll = function (evt) {
                    scope.scrollTop = elem.prop('scrollTop');
                    scope.updateDisplayList();

                    if (scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') { scope.$apply(); }
                    else { scope.$eval(); }
                };

                scope.onClickOption = function (option) {
                    ngModelCtrl.$setViewValue(option);
                    scope.currentOption = option;
                    scope.uiVirtualListOnSelect({ "option": option });
                };

                scope.init();
            }
        };
    }]);

})(Phoenix.Directives);