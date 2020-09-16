(function (angular) {

    angular.module('phoenix.template.directives').directive('loadTemplateDirective', ['TemplateApiService',
        function (TemplateApiService) {
            return {
                restrict: 'A',
                scope: {
                    control: '=',
                    filter: '=',
                    loadCallback: '&',

                },
                templateUrl: '/Phoenix/modules/template/views/LoadTemplateDirective.html',
                link: function (scope, elem, attr) {


                },
                controller: ['$scope', 'TemplateApiService', function ($scope, TemplateApiService) {
                    $scope.loadTemplate = function (template) {
                        TemplateApiService.get(template.Id).then(function (response) {
                            $scope.loadCallback()(response);
                        });

                    };
                    TemplateApiService.get().then(function (response) {
                        $scope.templates = response;
                    });
                }]
            };
        }
    ]);

})(angular);