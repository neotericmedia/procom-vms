/// <reference path="../../../../Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="../../../../Content/libs/angular/angular.js" />
/// <reference path="~/Phoenix/app/constants/CodeValueGroups.js" />
/// <reference path="~/Phoenix/app/constants/ApplicationConstants.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
        @name directives.entityDifference
        @description
        Entity Difference
        Attributes:
             data-ng-model           - model.data

        example:   
        <div data-entity-difference  data-ng-model="model.data">
        **/
    directives.directive('entityDifference', function () {
        return {
            restrict: 'A',
            scope: { model: "= entityDifference" },
            templateUrl: '/Phoenix/templates/Template/Components/EntityDifference/EntityDifference.html',
            replace: true,
            link: function (scope, elem, attr) {
                scope.$watch("model", function (value) {
                    if (angular.isDefined(value) && angular.isDefined(scope.model)) {
                        for (var x = 0; x < scope.model.length; x++) {
                            for (var i = 0; i < scope.model[x].OldText.Lines.length; i++) {
                                if (scope.model[x].OldText.Lines[i].Key === null) {
                                    scope.model[x].OldText.Lines[i].Key = scope.model[x].NewText.Lines[i].Key;
                                }
                                scope.model[x].NewText.Lines[i].Changed = scope.model[x].OldText.Lines[i].Changed = !angular.equals(scope.model[x].OldText.Lines[i].Value, scope.model[x].NewText.Lines[i].Value);
                                scope.model[x].NewText.Lines[i].Removed = scope.model[x].OldText.Lines[i].Removed = scope.model[x].OldText.Lines[i].Value === null && scope.model[x].NewText.Lines[i].Value === null;
                            }
                        }
                    }
                }, true);
            },controller: ['$scope',function($scope) {
                $scope.getDiffLineStyle = function (value, changed) {
                    if (value && !changed) {
                        return "text-darkgray";
                    } else {
                        return "text-black";
                    }

                };
            }]
        };
    });
    
    

})(Phoenix.Directives);
