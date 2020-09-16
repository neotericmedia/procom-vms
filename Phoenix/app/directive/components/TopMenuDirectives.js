/// <reference  path="../app.js"/>
(function (directives) {
    'use strict';

    directives.directive('ptTopMenu', [function () {
        return {
            restrict: 'A',
            templateUrl: '/Phoenix/templates/Template/Components/TopMenu/TopMenu.html',
            link: function (scope, elem, attr) {
                scope.itemClass = function (item, activeItem) {
                    var result = '';
                    if (item.ItemType == 'Divider') {
                        result = ''; //result = 'divider';
                    }
                    else {
                        if (item.ItemType == 'Header') {
                            result = 'nav-header ';
                        }
                        if (angular.isDefined(activeItem)) {
                            if (item.Code == activeItem.Code) {
                                result = result + 'active';
                            } else {
                                result = result + '';
                            }
                        }
                    }
                    return result;
                };
                scope.toggle = function (sub) {
                    sub.toggled = !sub.toggled;
                };
            }
        };
    }]);

})(Phoenix.Directives);