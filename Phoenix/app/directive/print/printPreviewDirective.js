/// <reference path="../../../../Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../../Content/libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />
/// <reference path="~/Content/libs/angular/angular.js" />

(function (directives) {
    'use strict';
    /**
        @name directives.printPreview
        @description
        Used to get print preview passing the id of print stylesheet
        Attributes:
             data-ng-model           - model.data
             
        example:   
       <div print-preview="timesheetPrint"></div> 
        **/

    directives.directive('printPreview', function () {
        return {
            restrict: 'A',
            scope: true,
            template: '<a type="button" ng-click="click()" class="btn btn-default" style="width:88px;">Print</a>',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                $scope.click = function () {
                    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                        //angular.element('div.page-content').addClass("print-mode");
                        angular.element('.print-hidden').addClass('collapse');
                        angular.element('.print-hidden-alt').hide();
                        var onPrintFinished = function (p) {
                            //angular.element('div.page-content').removeClass("print-mode");
                            angular.element('.print-hidden-alt').show();
                        };
                        onPrintFinished(window.print());
                        //window.print();
                        ////window.location.reload();
                    } else {
                        $element.printPreview($attrs.printPreview);
                    }
                };
            }]
        };
    });
})(Phoenix.Directives);