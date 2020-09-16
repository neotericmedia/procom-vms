(function (angular) {
    angular.module('phoenix.template.directives').controller('SaveAsTemplateDirectiveController', [
             '$scope', '$state', '$uibModalInstance', 'TemplateApiService', 'data', function ($scope, $state, $uibModalInstance, TemplateApiService, data) {
                 $scope.title = "Save New Template";
                 $scope.template =
                 {
                     Name: '',
                     Description: '',
                     EntityTypeId: data.EntityTypeId,
                     TemplateBody: data.TemplateBody,
                     IsPrivate: false,
                     TemplateMetadatas:data.TemplateBody && data.TemplateBody.TemplateMetadatas
                 };

                 $scope.cancel = function () {
                     $uibModalInstance.dismiss('cancelled');
                 };

                 $scope.save = function (template) {
                     var createTemplateCommand = template;

                     // actually call template API save, and return template ID to calling function
                     TemplateApiService.templateNew(createTemplateCommand).then(function (response) {
                         TemplateApiService.get(response.EntityId).then(function (getResponse) {
                             //$state.transitionTo($state.current.name, {}, { reload: true, inherit: true, notify: true });
                             $uibModalInstance.close(getResponse);
                         });
                     });
                 };
             }]);

    angular.module('phoenix.template.directives').directive('saveAsTemplate', ['dialogs',
        function (dialogs) {

            return {
                restrict: 'A',
                scope: {
                    control: '='
                },
                link: function (scope, elem, attr) {
                    scope.internalControl = scope.control || {};
                    scope.internalControl.openDialog = function (entityType, templateBody) {
                        var dlg = dialogs.create('/Phoenix/modules/template/views/SaveAsTemplateDirective.html', 'SaveAsTemplateDirectiveController', {
                            EntityTypeId: entityType, TemplateBody: templateBody
                        }, {
                            keyboard: false, backdrop: 'static'
                        });
                        return dlg.result;
                    };
                }
            };
        }
    ]);

    angular.module('phoenix.template.directives').controller('UpdateTemplateSettingsDirectiveController', [
         '$scope', '$state', '$uibModalInstance', 'TemplateApiService', 'data', function ($scope, $state, $uibModalInstance, TemplateApiService, data) {
             $scope.title = "Update Template Settings";
             $scope.template =
             {
                 TemplateId: data.Id,
                 Name: data.Name,
                 Description: data.Description,
                 IsPrivate: data.IsPrivate,
                 LastModifiedDatetime: data.LastModifiedDateTime,
             };

             $scope.cancel = function () {
                 $uibModalInstance.dismiss('cancelled');
             };

             $scope.save = function (template) {
                 var updateTemplateCommand = template;

                 // actually call template API save, and return template ID to calling function
                 TemplateApiService.updateTemplateSettings(updateTemplateCommand).then(function (response) {
                     TemplateApiService.get(response.EntityId).then(function (response2) {
                         $state.transitionTo($state.current.name, {}, { reload: true, inherit: true, notify: true });
                         $uibModalInstance.close(response2);
                     });
                 });
             };
         }]);
    angular.module('phoenix.template.directives').directive('updateTemplateSettings', ['dialogs',
    function (dialogs) {

        return {
            restrict: 'A',
            scope: {
                control: '='
            },
            link: function (scope, elem, attr) {
                scope.internalControl = scope.control || {
                };
                scope.internalControl.openDialog = function (templateSettings) {
                    var dlg = dialogs.create('/Phoenix/modules/template/views/SaveAsTemplateDirective.html', 'UpdateTemplateSettingsDirectiveController', templateSettings, { keyboard: false, backdrop: 'static' });
                    return dlg.result;
                };
            }
        };
    }
    ]);

})(angular);