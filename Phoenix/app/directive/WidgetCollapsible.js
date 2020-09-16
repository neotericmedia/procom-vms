(function (directives) {
    directives.directive('widgetCollapsible', function () {
        return {
            restrict: 'C',
            link: function (scope, element, attr) {
                $(element).on('shown', function (e) {
                    $(e.target)
                        .parent('.widget-collapsible')
                        .children('.widget-header')
                        .removeClass('collapsed');
                    $(e.target)
                        .prev('.widget-header')
                        .find('.widget-toggle')
                        .toggleClass('fontello-icon-publish fontello-icon-window');
                });

                $(element).on('hidden', function (e) {
                    $(e.target)
                        .parent('.widget-collapsible')
                        .children('.widget-header')
                        .addClass('collapsed');
                    $(e.target)
                        .prev('.widget-header')
                        .find('.widget-toggle')
                        .toggleClass('fontello-icon-window fontello-icon-publish');
                });
            }
        };
    });
})(Phoenix.Directives);