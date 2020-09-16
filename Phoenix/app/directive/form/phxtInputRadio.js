(function (directives) {
    'use strict';

    /**
    @name directives.ptInputRadio
    Used as Radio input-radio or buttons list

    Attributes:
        *data-template-type - input-radio/button
        *data-ng-model      - model
        *data-options       - options, examle: [{ key: true, value: 'Yes' },{ key: false, value: 'No' }]
        *data-change-callback - model, function you want to call when model changes (no parameters)
    example:   

    <phx-input-radio class="btn-group"
       data-template-type="input-radio"
       data-ng-model="model.entity.TimeSheetRequired"
       data-options="[{ key: true, value: 'Yes' },{ key: false, value: 'No' }]"
       data-change-callback="onChangeTimeSheetRequired"
       />

    **/
    directives.directive('phxInputRadio', ['$compile', '$parse', function ($compile, $parse) {
        var result = {
            restrict: 'E',
            require: '^ngModel',
            scope: { ngModel: '=', options: '=', type: '=', changeCallback: '&' },
            link: function ($scope, elem, attrs, ngModel) {
                $scope.onChange = function () {
                    if ($scope.changeCallback && typeof $scope.changeCallback() === "function") {
                        $scope.changeCallback()(!ngModel.$modelValue);
                    }
                };
            },
            template: function ($scope, $attrs) {
                return ($attrs.templateType == 'input-radio') ?
                    '<label class="radio-inline"' +
                    ' data-ng-repeat="option in options"' +
                    '>' +
                    '<input type="radio"' +
                    ' data-ng-model="$parent.ngModel"' +
                    ' data-ng-value="option.key"' +
                    ' data-ng-change="onChange()"' +
                    '/>' +
                    '{{option.value}}' +
                    '</label>' :
                    '<button type="button" class="btn btn-default "' +
                    ' data-toggle="buttons-radio"' +
                    ' data-ng-repeat="option in options"' +
                    ' data-ng-class="{active: option.key==$parent.ngModel}"' +
                    ' data-ng-click="$parent.ngModel=option.key"' +
                    '>' +
                    '<i class="icon-ok-sign" data-ng-if="option.key==$parent.ngModel">&nbsp;</i>' +
                    '{{option.value}}' +
                    '</button>';
            }
        };
        return result;
    }]);
})(Phoenix.Directives);