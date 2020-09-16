/// <reference path="../../../libs/jquery/jquery-1.9.0.js" />
/// <reference path="../../../libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../libs/angular/angular.js" />
(function (directives) {

    directives.directive('fueluxWizard', ['$log', function ($log) {
        return {
            restrict: 'A',
            require: '^form',
            scope: true,
            link: function (scope, elem, attr, ngForm) {
                scope._component = {};
                scope._component.form = ngForm;
                
                var wizard = $(elem).wizard();

                wizard.on('change', function(e) {
                    var step = wizard.wizard('selectedItem').step;
                });
                
                wizard.on('changed', function (e) {
                    var options = wizard.wizard('selectedItem');
                    
                    if (options.step == options.total) {
                        $(options.nextBtn).hide();
                        $(options.finishBtn).show();
                    } else {
                        $(options.finishBtn).hide();
                        $(options.nextBtn).show();
                    }
                });

            }
        };
    }]);


})(Phoenix.Directives);