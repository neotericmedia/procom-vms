(function (angular) {
    'use strict';

    var serviceId = 'NoteApiService';

    angular.module('phoenix.note.services').factory(serviceId, ['phoenixapi', NoteApiService]);

    function NoteApiService(phoenixapi) {

        var service = {
            getNotes: getNotes,
            saveNote: saveNote,
            markCritical: markCritical,
            markRead: markRead,
            sendFeedback: sendFeedback
        };

        return service;

        function getNotes(entityTypeId, entityId) {
            return phoenixapi.query('note/entityType/' + entityTypeId + '/entity/' + entityId);
        }

        // Commands
        function saveNote(command) {
            //command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("SaveNote", command);
        }

        function markCritical(command) {
            //command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("MarkCriticalNote", command);
        }

        function markRead(command) {
            //command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("MarkUnreadNote", command);
        }

        function sendFeedback(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command("SendFeedback", command);
        }

    }

}(angular));