(function (directives) {
    'use strict';

    /**
    @name directives.ptErrorBox
    @description
    Used to display summary validation messages. 
    Attributes:
        *pt-error-box - model property with collection of validation items
        *show-event - event name which trigger error box to be visible
        *hide-event - event name which trigger error box to be hidden
    example:   
    <div
            data-pt-error-box='' 
            data-show-event='event:validation-broken' 
            data-hide-event='event:validation-ok' >
    </div>

    OR

    <div data-pt-error-box='model.brokenRules'>
    </div>

    **/
    directives.directive('ptErrorBox', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: '/Phoenix/templates/Template/Components/ErrorBox/ErrorBox.html',
            link: function (scope, elem, attr) {
                var itemsExp = attr.ptErrorBox,
                    showEvent = attr.showEvent,
                    hideEvent = attr.hideEvent,
                    isopen = true;

                scope._errorBox = {};
                scope._errorBox.items = [];
                scope._errorBox.visible = false;

                // handle model broken rules collection
                if (itemsExp) {
                    var items = $parse(itemsExp)(scope);
                    assignItems(items);

                    scope.$watch(itemsExp, function (value) {
                        assignItems(value);
                    }, true);
                }

                // handle show event
                if (showEvent) {
                    scope.$on(showEvent, function (ngEvent, data) {
                        assignItems(data);
                        return false;
                    });
                }

                // handle hide event
                if (hideEvent) {
                    scope.$on(showEvent, function (ngEvent, data) {
                        assignItems({});
                        return false;
                    });
                }

                // handle collapse container
                scope.toggleCollapsible = function () {
                    if (isopen) {                       
                        $(elem).find('.widget-content').removeClass('in');
                        $(elem).find('.widget-header').addClass('collapsed');
                        $(elem).find('a.btn').toggleClass('fontello-icon-window fontello-icon-publish');

                        isopen = false;
                    }
                    else {
                        $(elem).find('.widget-content').addClass('in');
                        $(elem).find('.widget-header').removeClass('collapsed');
                        $(elem).find('a.btn').toggleClass('fontello-icon-window fontello-icon-publish');

                        isopen = true;
                    }
                };
                    
                // handle hide box click
                scope.hideBox = function() {
                    scope._errorBox.visible = false;
                };

                // private function to assign list of items
                function assignItems(errors) {
                    var errorsItems = [];
                    var isVisible = false;
                    for (var property in errors) {
                        if (errors[property].length > 0) {
                            errorsItems.push({ property: property, errors: errors[property] });
                            isVisible = true;
                        }
                    }
                    scope._errorBox.items = errorsItems;
                    scope._errorBox.visible = isVisible;
                }
            }
        };
    }]);

})(Phoenix.Directives);