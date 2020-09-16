/// <reference  path="../app.js"/>
(function (directives) {


    directives.directive('ptFormHeader', [function () {
        return {
            restrict: 'A',
            template: '<div class="widget-header"><h4><div ng-transclude><small></small></h4></div>',
            transclude: true,
            replace: true,
            link: function (scope, elem, attr) {

            }
        };
    }]);
    directives.directive('readonly', [function () {
        return {
            restrict: 'C',
            link: function (scope, elem, attr) {
                $(elem).attr("readonly", true);
            }
        };
    }]);
    directives.directive('ptFormItem', [function () {
        return {
            restrict: 'A',
            template: '<li class="control-group"><div ng-transclude></div></li>',
            transclude: true,
            replace: true,
            link: function (scope, ele, attr) {
                //ele.find("INPUT").wrap("<div class='controls'>");
                ele.find("LABEL").addClass("control-label").next().wrap("<div class='controls'>");
            }
        };
    }]);


    directives.directive('ptFieldError', [function () {
        return {
            restrict: 'A',
            template: '<span><div ng-transclude></div> <ul><li ng-repeat="error in getErrors()">{{error}}</li></span>',
            scope: {},
            require: '^form',
            transclude: true,
            replace: false,
            controller: function ($scope) {
                $scope.getErrors = function () {
                    var errorList = $scope.myForm[$scope["for"]].$error;
                    var result = [];
                    angular.forEach(errorList, function (value, key) {
                        if (value === true) {
                            result.push(key);
                        }
                    });
                    if (result.length >= 1) {
                        $scope.label.addClass("error");
                    } else {
                        $scope.label.removeClass("error");
                    }
                    return result;
                };
            },
            link: function (scope, element, attr, ngForm) {
                scope.myForm = ngForm;
                scope['for'] = attr['for'];
                scope.label = element;
                //scope.errorList = ngForm[scope.for].$error;


            }
        };
    }]);

})(Phoenix.Directives);