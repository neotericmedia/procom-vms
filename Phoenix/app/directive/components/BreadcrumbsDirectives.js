/// <reference path="../../../../libs/jquery/jquery-1.9.1.js" />
/// <reference path="../../../../libs/jquery/jquery-1.9.1.intellisense.js" />
/// <reference path="../../../../libs/angular/angular/angular.js" />
(function (directives) {
    'use strict';

    directives.directive('ptBreadcrumbs', ['$rootScope', '$parse', function ($rootScope, $parse) {
        return {
            restrict: 'A',
            scope: true,
            replace: true,
            templateUrl: '/Phoenix/templates/Template/Components/Breadcrumbs/Breadcrumbs.html',
            link: function (scope, elem, attr) {
                scope._component = {};
                scope._component.items = [];                
                
                if (!attr.ptBreadcrumbs) return; // do nothing if no items specified

                scope._component.items = $parse(attr.ptBreadcrumbs)(scope);
                $rootScope.$watch(attr.ptBreadcrumbs, function (value) {
                    scope._component.items = value;
                }, true);

                scope.isLastItem = function(item) {
                    if (!scope._component.items) return false;
                    if (scope._component.items.length === 0) return false;

                    if (item == scope._component.items[scope._component.items.length - 1]) {
                        return true;
                    }
                    return false;
                };

                scope.itemClass = function(item) {
                    if (scope.isLastItem(item) === true) {
                        return 'active';
                    }
                    return '';
                };
           }
        };
    }]);
})(Phoenix.Directives);