/// <reference path="~/Content/libs/jquery/jquery-1.9.0.js" />
/// <reference path="~/Content/libs/jquery/jquery-1.9.0.intellisense.js" />
/// <reference path="~/Content/libs/angular/angular.js" />

(function (directives) {
    'use strict';
    /**
      @name directives.ptCommentUtilityService
      @description
      Used as FileUpload extension
      Attributes:
           data-entity-type-id            - (int) "ApplicationConstants.EntityType.TimeSheet" or entity type id (parent table  id to choose related document Type IDs)
           data-entity-id                 - (int) entity.Id
           data-header-text               - html header text
           data-template-url              - template url path           
           data-func-get-notes-length     - custom function

      example:
        <div data-pt-comment-utility-service=""
            data-entity-type-id="ApplicationConstants.EntityType.TimeSheet"
            data-entity-id="timesheet.Id"
            data-header-text="comment utility"
            data-func-get-notes-length="getNotesLength">
        </div>
    **/

    directives.directive('ptCommentUtilityService', [function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                entityTypeId: "=",
                entityId: "=",
                noteCount: "=?",
                funcGetNotesLength: '&?'
            },
            templateUrl: '/Phoenix/templates/Template/Components/CommentUtilityService/Default.html',
            controller: ['$scope', '$rootScope', '$attrs', '$timeout', 'dialogs', 'NoteApiService', 'CodeValueService', '$q', 'phoenixapi', function ($scope, $rootScope, $attrs, $timeout, dialogs, NoteApiService, CodeValueService, $q, phoenixapi) {
                $scope.entity =
                   {
                       note: '',
                       isCritical: false
                   };

                $scope.isInt = function (value) {
                    var er = /^[0-9]+$/;
                    return (er.test(value)) ? true : false;
                };

                $scope.headerText = $attrs.headerText || '';
                $scope.notes = [];

                $scope.funcGetNotesLength = typeof ($scope.funcGetNotesLength) !== 'undefined' ? $scope.funcGetNotesLength() : null;

                $scope.addNote = function (comment, isCritical) {
                    if ($.trim(comment).length === 0) return;
                    NoteApiService.saveNote({ EntityTypeId: $scope.entityTypeId, EntityId: $scope.entityId, Comment: comment, IsCritical: isCritical }).then(
                        function () {
                            $scope.notes = [];
                            $scope.getComments();
                            $scope.entity.note = '';
                            $scope.entity.isCritical = false;
                            $rootScope.$broadcast('event:refresh-notes-list');
                        });
                };

                $scope.markCritical = function (note, isCritical) {
                    var markCriticalCommand = { EntityTypeId: $scope.entityTypeId, EntityId: $scope.entityId, IsCritical: isCritical, NoteId: note.Id, LastModifiedDatetime: note.LastModifiedDatetime };
                    NoteApiService.markCritical(markCriticalCommand)/*.then(
                        function () {
                            $scope.notes[index].IsCritical = isCritical;
                            var idx = _.findIndex($scope.notesCopy, function (i) { return i.Id == NoteId; });
                            $scope.notesCopy[idx].IsCritical = isCritical;
                            $scope.criticalCount = $scope.notesCopy.reduce(function (prev, curr) { return prev + (curr.IsCritical ? 1 : 0); }, 0);
                            if ($scope.funcGetNotesLength) {
                                $scope.funcGetNotesLength($scope.notes);
                            }
                            $rootScope.$broadcast('event:refresh-notes-list');
                        });*/
                        // reloading data to get LastModifiedDatetime for concurrency
                        .then(function(response){ 
                            $scope.getComments(); 
                        })
                        .then(function(){ 
                            $rootScope.$broadcast('event:refresh-notes-list'); 
                        });
                };

                $scope.markRead = function (note, isRead) {
                    var markReadCommand = { NoteId: note.Id, LastModifiedProfileId: note.LastModifiedByProfileId, IsRead: isRead, Id: note.UnreadNote.Id, LastModifiedDatetime: note.UnreadNote.LastModifiedDatetime };
                    NoteApiService.markRead(markReadCommand)/*.then(
                        function () {
                            $scope.notes[index].UnreadNote.IsRead = isRead;
                            var idx = _.findIndex($scope.notesCopy, function (i) { return i.Id == NoteId; });
                            $scope.notesCopy[idx].UnreadNote.IsRead = isRead;
                            $scope.readCount = $scope.notesCopy.reduce(function (prev, curr) { return prev + (curr.UnreadNote.IsRead ? 0 : 1); }, 0);
                            if ($scope.funcGetNotesLength) {
                                $scope.funcGetNotesLength($scope.notes);
                            }
                            $rootScope.$broadcast('event:refresh-notes-list');
                        });*/
                        // reloading data to get LastModifiedDatetime for concurrency
                        .then(function(response){ 
                            $scope.getComments(); 
                        })
                        .then(function(){ 
                            $rootScope.$broadcast('event:refresh-notes-list'); 
                        });
                };

                $scope.getComments = function () {
                    return NoteApiService.getNotes($scope.entityTypeId, $scope.entityId).then(
                        function success(responseSuccess) {
                            $scope.notes = [];

                            var items = responseSuccess.Items;

                            $scope.criticalCount = 0;
                            $scope.readCount = 0;
                            $.each(items, function (index, item) {
                                item.time = item.CreatedDatetime;
                                if (!item.UnreadNote) {
                                    item.UnreadNote = {
                                        Id: 0,
                                        IsRead: false,
                                        NoteId: item.Id
                                    };
                                }
                                if (item.IsCritical) $scope.criticalCount += 1;
                                if (!item.UnreadNote.IsRead) $scope.readCount += 1;
                                $scope.notes.push(item);
                                $scope.notesCopy = angular.copy($scope.notes);
                            });
                            if ($scope.funcGetNotesLength) {
                                $scope.funcGetNotesLength($scope.notes);
                            }
                        });
                };

                if ($scope.entityId) {
                    $scope.getComments();
                }

                $scope.noteEntered = function (event, comment, isCritical) {
                    return;
                    //if (event.which === 13)
                    //    $scope.addNote(comment, isCritical);
                };

                $scope.all = true;
                $scope.unred = false;
                $scope.critical = false;

                $scope.filterUnread = function () {
                    var temp = angular.copy($scope.notesCopy);
                    $scope.notes = _.filter(temp, function (note) { return !note.UnreadNote.IsRead; });
                    $timeout(function () {
                        var scrl = angular.element(document.getElementById('noteScroll'));
                        if (scrl) {
                            var height = scrl[0].scrollHeight;
                            scrl.scrollTop(height);
                        }
                    }, 0);
                    $scope.all = false;
                    $scope.unred = true;
                    $scope.critical = false;
                };

                $scope.filterCritical = function () {
                    var temp = angular.copy($scope.notesCopy);
                    $scope.notes = _.filter(temp, function (note) { return note.IsCritical; });
                    $timeout(function () {
                        var scrl = angular.element(document.getElementById('noteScroll'));
                        if (scrl) {
                            var height = scrl[0].scrollHeight;
                            scrl.scrollTop(height);
                        }
                    }, 0);
                    $scope.all = false;
                    $scope.unred = false;
                    $scope.critical = true;
                };

                $scope.filterAll = function () {
                    var temp = angular.copy($scope.notesCopy);
                    $scope.notes = temp;
                    $timeout(function () {
                        var scrl = angular.element(document.getElementById('noteScroll'));
                        if (scrl) {
                            var height = scrl[0].scrollHeight;
                            scrl.scrollTop(height);
                        }
                    }, 0);
                    $scope.all = true;
                    $scope.unred = false;
                    $scope.critical = false;
                };

                $scope.$watch('entityId', function (newVal, oldVal) {
                    if (newVal && $scope.entityTypeId) {
                        $scope.getComments();
                    } else {
                        $scope.noteCount = 0;
                    }
                });

            }],

            link: function (scope, el, attrs) {
                angular.element(document.getElementById('noteArea')).focus();
                scope.onLast = function () {
                    var scrl = angular.element(document.getElementById('noteScroll'));
                    if (scrl) {
                        var height = scrl[0].scrollHeight;
                        scrl.scrollTop(height);
                    }
                };
                scope.$watch('note == notes[notes.length - 1]', function () {
                    scope.onLast();
                });
            }
        };
    }]);
})(Phoenix.Directives);