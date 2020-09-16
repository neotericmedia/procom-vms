(function (app, angular) {
    
    var controllerId = "AssignmentDocumentsController";

   
    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$state','$q','AssignmentSecurityService','CodeValueService', AssignmentDocumentsController]);

    function AssignmentDocumentsController($scope, $state, $q, AssignmentSecurityService, CodeValueService) {
        
        $scope.documentCategoryId = '';        

        $scope.accessCheck = function (document) {
            return AssignmentSecurityService.canRemoveWorkOrderDocument(document, $scope.CurrentWorkOrder);
        };

        $scope.uploadDocument = function (docType) {
            $scope.documentCategoryId = docType;
        };

        $scope.documentUploadCallbackOnDone = function () {

        };

        $scope.getDocumentTypes = function () {
            var documentList = CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, ApplicationConstants.EntityType.WorkOrder, CodeValueGroups.EntityType);
            return documentList;
        };
    }

})(Phoenix.App, angular);