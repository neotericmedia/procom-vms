/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />
(function (directives) {
    'use strict';
    /**
        @name directives.ptDocumentList
        @description
        Used as FileUpload extension
        
        Attributes:

             data-entity-type-id                    - (int) "ApplicationConstants.EntityType.TimeSheet" or entity type id (parent table  id to choose related document Type IDs)
             data-entity-id                         - (int) entity.Id
             data-func-get-documents-length         - callback function name to pass (int) documentsLength, (int) entityTypeId, (int) entityId
             data-func-get-document-id-to-preview   - callback function name to pass (int) pdfDocumentIdToPreview, (int) entityTypeId, (int) entityId
             data-template-url                      - template url path

        example:   
         <div data-pt-document-list=""
             data-entity-type-id="ApplicationConstants.EntityType.TimeSheet"
             data-entity-id="model.entity.Id"
             data-func-get-documents-length="getDocumentsLength"
             data-func-get-document-id-to-preview="getDocumentIdToPreview"
             data-template-url="/Phoenix/templates/Template/Components/CommentUtilityService/NoteListDefault"
             >
         </div>
    **/

    directives.directive('ptNotesList', ['$templateCache', '$parse', '$compile', '$q', '$http', function ($templateCache, $parse, $compile, $q, $http) {
        var getTemplate = function (templateUrl) {
            return $http.get(templateUrl, { cache: $templateCache });
        };
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                entityTypeId: "=",
                entityId: "=",
                noteCount: "=?",
                noteTotal: "=?",
                profileTypeId: "<?"
            },
            templateUrl: '/Phoenix/templates/Template/Components/CommentUtilityService/NoteListDefault.html',
            controller: ['$scope', '$rootScope', '$attrs', '$timeout', 'NoteApiService', '$state', function ($scope, $rootScope, $attrs, $timeout, NoteApiService, $state) {

                $scope.isInt = function (value) {
                    var er = /^[0-9]+$/;
                    return (er.test(value)) ? true : false;
                };


                var cutComment = function (c) {
                    if (c.length > 90)
                        c = c.substring(0, 90) + "...";
                    return c;
                };

                $scope.notes = [];
                $scope.getComments = function () {
                    NoteApiService.getNotes($scope.entityTypeId, $scope.entityId).then(
                        function success(responseSuccess) {
                            $scope.notes = [];
                            var items = responseSuccess.Items;
                            var displayCount = 0;
                            $.each(items, function (index, item) {
                                item.time = item.CreatedDatetime;
                                if (!item.UnreadNote) {
                                    item.UnreadNote = {
                                        Id: 0,
                                        IsRead: false,
                                        NoteId: item.Id
                                    };
                                }
                                if (item.UnreadNote.IsRead === false) {
                                    displayCount++;
                                }
                                $scope.notes.push(item);
                                _.each($scope.notes, function (n) {
                                    n.Comment = cutComment(n.Comment);
                                });
                            });
                            $scope.noteTotal = $scope.notes.length;
                            $scope.notes = $scope.notes.reverse().slice(0, 2);
                            $scope.noteCount = displayCount;                           
                        }
                    );
                };

                $scope.noteCount = 0;
                $scope.noteTotal = 0;

                if ($scope.entityId && $scope.entityTypeId) {
                    $scope.getComments();
                }

                $scope.$watch('entityId', function (newVal, oldVal) {
                    if (newVal && $scope.entityTypeId) {
                        $scope.getComments();
                    } else {
                        $scope.noteCount = 0;
                        $scope.noteTotal = 0;
                    }
                });


                $scope.scrollDown = function () {
                    $timeout(function () {
                        var scrl = angular.element(document.getElementById('noteScroll'));
                        if (scrl && scrl[0] && scrl[0].scrollHeight) {
                            var height = scrl[0].scrollHeight;
                            scrl.scrollTop(height);
                        }
                        if ($scope.entityTypeId === ApplicationConstants.EntityType.WorkOrder) {
                            $state.go('workorder.edit.activity.notes');
                        } else if ($scope.entityTypeId == ApplicationConstants.EntityType.Organization){
                            $state.go('org.edit.notes');
                        }
                        if ($scope.entityTypeId === ApplicationConstants.EntityType.Contact) {

                            switch ($scope.profileTypeId) {
                                case ApplicationConstants.UserProfileType.Organizational:
                                    $state.go('EditOrganizationalProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.Internal:
                                    $state.go('EditInternalProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerTemp:
                                    $state.go('EditWorkerTempProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerUnitedStatesW2:
                                    $state.go('EditWorkerUnitedStatesW2Profile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerCanadianInc:
                                    $state.go('EditWorkerCanadianIncProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerUnitedStatesLLC:
                                    $state.go('EditWorkerUnitedStatesLLCProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerSubVendor:
                                    $state.go('EditWorkerSubVendorProfile.ContactNotes');
                                    break;
                                case ApplicationConstants.UserProfileType.WorkerCanadianSp:
                                    $state.go('EditWorkerCanadianSPProfile.ContactNotes');
                                    break;
                            }
                        }
                    }, 0);
                };
                $rootScope.$on('event:refresh-notes-list', function () {
                    $scope.getComments();
                });
            }]
        };
    }
    ]);
})(Phoenix.Directives);
