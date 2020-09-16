(function (app, angular) {

    var controllerId = "AssignmentNotesController";

    angular.module('phoenix.workorder.controllers').controller(controllerId, ['$scope', '$state', 'NoteApiService', AssignmentNotesController]);

    function AssignmentNotesController($scope, $state, NoteApiService) {

        $scope.notes = [];
        $scope.woNotesLength = 0;
        $scope.woNotesTotal = 0;
        $scope.workOrderId = parseInt($state.params.workOrderId, 10);
        $scope.getComments = function () {
            NoteApiService.getNotes(ApplicationConstants.EntityType.WorkOrder, $state.params.workOrderId).then(
                function success(responseSuccess) {
                    var items = responseSuccess.Items;
                    $.each(items, function (index, item) {
                        item.time = item.CreatedDatetime;
                        if (!item.UnreadNote) {
                            item.UnreadNote = {
                                Id: 0,
                                IsRead: false,
                                NoteId: item.Id
                            };
                        }
                        $scope.notes.push(item);
                    });
                    var length = $scope.unreadCount($scope.notes);
                    $scope.woNotesLength = length;
                    $scope.woNotesTotal = $scope.notes.length;
                }
            );
        };

        if ($scope.workOrderId>0) {
            $scope.getComments();
        }         

        $scope.unreadCount = function (notes) {
            var length = 0;
            $.each(notes, function (idx, item) {
                if (!item.UnreadNote.IsRead)
                    length += 1;
            });
            return length;
        };
        $scope.getNotesLength = function (notes) {
            $scope.woNotesTotal = notes.length;
            var notesLength = $scope.unreadCount(notes);
            $scope.woNotesLength = notesLength;
        };
    }

})(Phoenix.App, angular);