(function (directives) {
    'use strict';

    /**
    @name directives.ptValidationMessages
    @description
    Used to display summary validation messages. 
    Attributes:
        *pt-pt-validation-messages - model property with collection of validation items
        *show-event - event name which trigger validation-messages box to be visible
        *hide-event - event name which trigger validation-messages box to be hidden
    example:   
   
    <div data-pt-validation-messages="model.ValidationMessages"></div>

    **/
    directives.directive('ptValidationMessages', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: '/Phoenix/templates/Template/Components/ErrorBox/ValidationMessages.html',
            link: function (scope, elem, attr) {
                var itemsExp = attr.ptValidationMessages,
                    showEvent = attr.showEvent,
                    hideEvent = attr.hideEvent,
                    isopen = true;

                scope.validationMessageBox = {};
                scope.validationMessageBox.items = [];
                scope.validationMessageBox.visible = false;

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
                    scope._validationMessageBox.visible = false;
                };

                // private function to assign list of items
                function assignItems(validationMessages) {
                    var boxItems = [];
                    var boxIsVisible = false;
                    angular.forEach(validationMessages, function (validationMessage) {
                      boxItems.push({ propertyName: validationMessage.PropertyName, message: validationMessage.Message && validationMessage.Message.replace(/\n/g, '<br />') });
                        boxIsVisible = true;
                    });
                    scope.validationMessageBox.items = boxItems;
                    scope.validationMessageBox.visible = boxIsVisible;
                }
            }
        };
    }]);

})(Phoenix.Directives);