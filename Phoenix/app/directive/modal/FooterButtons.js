

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
    directives.directive('modalFotterButtons', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: '^form',
            replace: true,
            templateUrl: '/Phoenix/templates/Template/Components/Modal/FooterButtons.html',
            link: function (scope, elem, attr, form) {
                scope.footer = {};
                scope.footer.form = form;
                scope.footer.canSave = false;

                scope.$watch('entityForm.$valid', function () {
                    evaluateToolbar();
                });
                
                scope.$watch('entityForm.$pristine', function () {
                    evaluateToolbar();
                });

                var brokenRulesAttr = attr.modalFotterButtons;
                if (brokenRulesAttr) {
                    brokenRulesAttr = brokenRulesAttr + '.BrokenRules';
                    scope.$watch(function () {
                        var brokenRules = $parse(brokenRulesAttr)(scope);
                        return angular.toJson(brokenRules);
                    }, function () {
                        evaluateToolbar();
                    });
                }

                // enable save when:
                // 1. form valid
                // 2. form dirty (there are some changes)
                // 3. entity broken rules collection is empty
                function evaluateToolbar() {
                    // evaluate existence of Broken rules collection
                    var hasBrokenRules = false;
                    if (brokenRulesAttr) {
                        var brokenRules = $parse(brokenRulesAttr)(scope);
                        if (brokenRules) {
                            for (var property in brokenRules) {
                                if (property === "") continue;

                                var errors = brokenRules[property];
                                hasBrokenRules = errors.length > 0;
                                if (hasBrokenRules) break;
                            }
                        }
                    }

                    if(hasBrokenRules === true) {
                        scope.footer.canSave = false;
                    }
                    else {                       
                        scope.footer.canSave = scope.footer.form.$valid;
                    }
                }
            }
        };
    }]);

})(Phoenix.Directives);