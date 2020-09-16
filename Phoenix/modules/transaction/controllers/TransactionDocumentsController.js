(function (app, angular) {
    
    var controllerId = "TransactionDocumentsController";

   
    angular.module('phoenix.transaction.controllers').controller(controllerId, ['$scope', '$state', '$q', 'TransactionSecurityService', 'CodeValueService', TransactionDocumentsController]);

    function TransactionDocumentsController($scope, $state, $q, TransactionSecurityService, CodeValueService) {
        
        //Pass true to show uploader and false to hide uploader
        $scope.documentCategoryId = '';
        

        $scope.accessCheck = function (document) {
            return AssignmentSecurityService.canRemoveDocument(document, $scope.model.transactionHeader);
        };
        var toggleUploader = function (showHide) {
            $scope.hideUploader = showHide || false;
        };

        $scope.uploadDocument = function (docType) {
            $scope.documentCategoryId = docType;
            toggleUploader(true);
        };

        $scope.documentUploadCallbackOnDone = function () {
            toggleUploader(false);
        };

        $scope.getDocumentTypes = function () {
            //groupName, parentId, parentGroup
            return CodeValueService.getRelatedCodeValues(CodeValueGroups.DocumentType, ApplicationConstants.EntityType.TransactionHeader, CodeValueGroups.EntityType);
        };
    }

})(Phoenix.App, angular);