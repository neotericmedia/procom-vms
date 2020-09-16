(function (directives) {
    'use strict';

    /**
    @name directives.ptMonthPicker
    Used as Date Picker

    Attributes:
        *data-ng-model      - model
    
    example:   
        <pt-date-picker data-ng-model="model.entity.StartDate" />

    **/
    directives.directive('ptMonthPicker', ['UtilityService', function (UtilityService) {
        var result = {
            restrict: 'E',
            template: function ($scope, $attrs) {
                //var id = UtilityService.createUuid();
                var attrs = '';
                angular.forEach($attrs.$$element.context.attributes, function (attr) {
                    if (attr.name != 'data-pt-field-view' && attr.name != 'pt-field-view' && attr.name != 'name') {
                        attrs += ' ' + attr.name + '="' + attr.value + '"';
                    }
                });

                var elementAttr = { ngModel: '', name: '', id: UtilityService.createUuid() };
                // get element attribute 'name'
                if ($attrs.name && $attrs.name.length > 0) {
                    elementAttr.name = $attrs.name;
                } else if ($attrs.ngModel && $attrs.ngModel.length > 0) {
                    elementAttr.name = ($attrs.ngModel.indexOf('.') >= 0) ? $attrs.ngModel.substring($attrs.ngModel.lastIndexOf('.') + '.'.length) : '';
                }

                var template = '' +
                    '<div class="input-group" style="width: 160px">' +
                    '<input type="text" style="width: 120px" class="form-control"' +
                    ' id="' + elementAttr.id + '"' +
                    (elementAttr.name ? ' name="' + elementAttr.name + '"' : '') +
                    ' uib-datepicker-popup="{{ApplicationConstants.formatMonth}}"' +
                    attrs +
                    ' datepicker-options="{showWeeks:false, closeOnDateSelection:true, datepickerMode:\'month\', minMode:\'month\'}" show-button-bar="false" is-open="opened_' + elementAttr.id.replace(/-/g, '') + '" ng-click="opened_' + elementAttr.id.replace(/-/g, '') + '=true;" ' +
                    'alt-input-formats="[\'M!/d!/yy\',\'M!/d!/yyyy\',\'MMM d!, yyyy\']" ' +
                    '/>' +
                    '<label for="' + elementAttr.id + '" class="input-group-addon btn"><i class="fontello-icon-calendar"></i></label>' +
                    '</div>';
                return template;
            }
        };
        return result;

    }]);

    //directives.directive('ptMonthPickerFormat', function () {
    //    return {
    //        restrict: 'A',
    //        priority: 1,
    //        require: 'ngModel',
    //        link: function (scope, element, attrs, ctrl) {
    //            ctrl.$formatters.push(function (value) {
    //                if (typeof value === "undefined") {
    //                    value = null;
    //                }
    //                var date = moment(value);
    //                return date.isValid() ? date.toDate() : null;
    //            });

    //            ctrl.$parsers.push(function (value) {
    //                if (typeof value === "undefined") {
    //                    value = null;
    //                }
    //                var date = moment(value);
    //                return date.isValid() ? date.format('YYYY-MM-DD') : null;
    //            });
    //        }
    //    };
    //});


})(Phoenix.Directives);