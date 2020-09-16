
(function (app) {
    'use strict';

    var controllerId = 'AssignmentTemplateController';

    angular.module('phoenix.workorder.controllers').controller(controllerId,
    ['$scope', '$state', 'common', 'TemplateApiService', 'AssignmentDataService', 'AssignmentCommonFunctionalityService', AssignmentTemplateController]);

    function AssignmentTemplateController($scope, $state, common, TemplateApiService, AssignmentDataService, AssignmentCommonFunctionalityService) {

        common.setControllerName(controllerId);

        $scope.templateSettingsControl = {};

        TemplateApiService.get($state.params.templateId).then(function (response) {
            $scope.template = response;
        });

        $scope.updateTemplateSettings = function (template) {
            var updateTemplateSettings =
            {
                TemplateId: $state.params.templateId,
                Name: template.Name,
                Description: template.Description,
                IsPrivate: template.IsPrivate,                
                LastModifiedDatetime: template.LastModifiedDateTime,
            };

            TemplateApiService.updateTemplateSettings(updateTemplateSettings).then(function (response) {
                common.logSuccess("Template Settings Updated");
                $scope.showTemplateSettingsVisible = false;
            }).then(function(){
                return TemplateApiService.get($state.params.templateId);
            }).then(function(response){
                $scope.template = response;
            });
        };

        $scope.showTemplateSettings = function () {

            $scope.templateSettingsControl.openDialog($scope.template).then(function (response) {
                $scope.template.Name = response.Name;
                $scope.template.Description = response.Description;
                $scope.template.IsPrivate = response.IsPrivate;
            });
            //$scope.showTemplateSettingsVisible = true;
        };

        $scope.workOrderTemplateSave = function () {
            if ($scope.model && $scope.model.entity) {
                var tempAssignmentTemplate = AssignmentCommonFunctionalityService.getAssignmentWithTemplate($scope.model.entity);
                var assignmentTemplate = TemplateApiService.assignmentToTemplate(tempAssignmentTemplate, 0, 0);
                
                var updateTemplateBody =
                {
                    TemplateId: $state.params.templateId,
                    TemplateBody: assignmentTemplate,
                    LastModifiedDatetime: $scope.template.LastModifiedDateTime,
                };

                TemplateApiService.updateTemplateBody(updateTemplateBody).then(function (response) {
                    common.logSuccess("Work Order Template Updated");
                }).then(function(){
                    return TemplateApiService.get($state.params.templateId);
                }).then(function(response){
                    $scope.template = response;
                });
            }
        };
    }


})(Phoenix.App);