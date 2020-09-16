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

    <pt-input-radio class="btn-group"
       data-template-type="input-radio"
       data-ng-model="model.entity.TimeSheetRequired"
       data-options="[{ key: true, value: 'Yes' },{ key: false, value: 'No' }]"
       data-change-callback="onChangeTimeSheetRequired"
       />

    **/
    directives.directive('ptInputRadio', ['$compile', '$parse', function ($compile, $parse) {
        var result = {
            restrict: 'E',
            require: '^ngModel',
            scope: { ngModel: '=', options: '=', type: '=', multiline: '=?', changeCallback: '&' },
            link: function ($scope, elem, attrs, ngModel) {
                if ($scope.changeCallback && typeof $scope.changeCallback() === "function") {
                    $scope.$watch(function () { return ngModel.$modelValue; }, function (newValue, oldValue) { if (newValue !== oldValue) { $scope.changeCallback()(); } }, true);
                }
            },
            template: function ($scope, $attrs) {
                if ($attrs.templateType === 'input-radio') {
                    var coreHtml = '' +
                        '       <input type="radio" data-ng-model="$parent.ngModel" data-ng-value="option.key" />' +
                        '       {{option.value}}';
                        
                    if ($attrs.multiline === 'true') {
                        return '' +
                            '<div class="radio" data-ng-repeat="option in options" >' +
                            '   <label>' +
                            coreHtml +
                            '   </label>' +
                            '</div>';

                    } else {
                        return '' +
                            '   <label class="radio-inline" data-ng-repeat="option in options">' +
                            coreHtml +
                            '   </label>';
                    }
                } else {
                    return '' +
                        '<button type="button" class="btn btn-default " data-toggle="buttons-radio" data-ng-repeat="option in options"' +
                        ' data-ng-class="{active: option.key==$parent.ngModel}" data-ng-click="$parent.ngModel=option.key" >' +
                        '     <i class="icon-ok-sign" data-ng-if="option.key==$parent.ngModel">&nbsp;</i>' +
                        '     {{option.value}}' +
                        '</button>';
                }
            }
        };
        return result;

    }]);

})(Phoenix.Directives);