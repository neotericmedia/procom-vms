(function (directives) {
    'use strict';

    /**
    @name directives.ptDatePicker
    Used as Date Picker

    Attributes:
        *data-ng-model      - model
        append-to-body      - passthrough bol to datePickers appendToBody attribute
    example:   
        <pt-date-picker data-ng-model="model.entity.StartDate" />

    **/
    directives.directive('ptDatePicker', ['UtilityService', function (UtilityService) {
        var result = {
            restrict: 'E',
            template: function ($elem, $attrs) {
                //var id = UtilityService.createUuid();
                var attrs = '';
                var elementAttr = { ngModel: '', name: '', id: UtilityService.createUuid() };

                angular.forEach($attrs.$$element.context.attributes, function (attr) {
                    if (attr.name != 'data-pt-field-view' && attr.name != 'pt-field-view' && attr.name != 'name') {
                        attrs += ' ' + attr.name + '="' + attr.value + '"';
                    }
                });

                // get element attribute 'name'
                if ($attrs.name && $attrs.name.length > 0) {
                    elementAttr.name = $attrs.name;
                } else if ($attrs.ngModel && $attrs.ngModel.length > 0) {
                    elementAttr.name = ($attrs.ngModel.indexOf('.') >= 0) ? $attrs.ngModel.substring($attrs.ngModel.lastIndexOf('.') + '.'.length) : '';
                }

                var template = '' +
                    '<div class="input-group" style="width: 160px">' +
                    '<input pt-date-picker-format type="text" style="width: 120px" class="form-control"' +
                    ($attrs.pickerId ? ' id="{{pickerId}}"' : ' id="' + elementAttr.id + '"') +
                    (elementAttr.name ? ' name="' + elementAttr.name + '"' : '') +
                    ' uib-datepicker-popup="{{ApplicationConstants.formatDate}}"' +
                    ' datepicker-append-to-body="{{appendToBody}}"' +
                    attrs +
                    ' datepicker-options="{showWeeks:false, closeOnDateSelection:true}" show-button-bar="false" is-open="opened_' + elementAttr.id.replace(/-/g, '') + '" ng-click="opened_' + elementAttr.id.replace(/-/g, '') + '=true;" ' +
                    'alt-input-formats="[\'M!/d!/yy\',\'M!/d!/yyyy\',\'MMM d!, yyyy\']" ' +
                    '/>' +
                    '<label ' + ($attrs.pickerId ? 'for="{{pickerId}}"' : 'for="' + elementAttr.id + '"') + ' class="input-group-addon btn"><i class="fontello-icon-calendar"></i></label>' +
                    '</div>';
                return template;
            },
            
            // Without link function previous code wasn't working in ng-repeat
            // so date picker id need to be added as an attribute picker-id = "{{someId}}" in <pt-date-picker picker-id="{{someId}}" /> 
            // otherwise it will be guid from UtilityService.createUuid(); as it was implemented before.

            link: {
                pre: function (scope, elem, attr) {
                    if (attr.pickerId) {
                        scope.pickerId = attr.pickerId;
                    }
                    scope.appendToBody = attr.appendToBody || false;
                }
            }
        };
        return result;

    }]);

    directives.directive('ptDatePickerFormat', function () {
        return {
            restrict: 'A',
            priority: 1,
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$formatters.push(function (value) {
                    if (typeof value === "undefined") {
                        value = null;
                    }
                    var date = moment(value);
                    return date.isValid() ? date.toDate() : null;
                });

                ctrl.$parsers.push(function (value) {
                    if (typeof value === "undefined") {
                        value = null;
                    }
                    var date = moment(value);
                    return date.isValid() ? date.format('YYYY-MM-DD') : null;
                });
            }
        };
    });


})(Phoenix.Directives);