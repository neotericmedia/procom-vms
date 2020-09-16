// todo: document this properly
// todo: normalize this properly, i.e. use the function declaration method
angular.module('directives')
    .constant('ftColumnConfig', {
        maxColumns: 12,
        columnClass: 'col-lg-'
    })
    .directive('ftColumns', [function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: ['$scope', 'ftColumnConfig', function ($scope, ftColumnConfig) {
                $scope.columns = [];

                this.addColumn = function (column) {
                    $scope.columns.push(column);
                    $scope.columnSize = ftColumnConfig.columnClass + Math.round(ftColumnConfig.maxColumns / $scope.columns.length);
                    angular.forEach($scope.columns, function (column) {
                        column.columnSize = $scope.columnSize;
                    });
                };
            }],
            template: '<div class="row" data-ng-transclude></div>'
        };
    }])
    .directive('ftColumn', [function () {
        return {
            require: '^ftColumns',
            restrict: 'E',
            scope: {},
            transclude: true,
            link: function (scope, element, attrs, ftCtrl) {
                ftCtrl.addColumn(scope);
            },
            template: '<div class="{{columnSize}}" data-ng-transclude></div>'
        };
    }])
    .directive('ftRow', [function () {
        return {
            restrict: 'E',
            scope: {
                classes: '@'
            },
            transclude: true,
            template: '<div class="row {{classes}}" data-ng-transclude></div>'
        };
    }]);