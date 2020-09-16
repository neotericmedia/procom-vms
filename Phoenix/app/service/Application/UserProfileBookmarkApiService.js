(function (services) {
    'use strict';

    var serviceId = "UserProfileBookmarkApiService";
    services.factory(serviceId, ['$q', 'phoenixapi', UserProfileBookmarkApiService]);

    function UserProfileBookmarkApiService($q, phoenixapi) {

        var service = {
            getBookmarkByUser: getBookmarkByUser,
            addUpdateBookmark: addUpdateBookmark,
            bookmarkDelete: bookmarkDelete
        };

        return service;

        // Commands
        function getBookmarkByUser(oDataParams) {
            return phoenixapi.query('userProfileBookmarks/getBookmarkByUser');
        }

        // Need pathName, color, description
        function addUpdateBookmark(command) {
            return phoenixapi.command('UserProfileAddBookmark', command);
        }

        // ProfileId can be found inside the handler. Only need the PathName.
        function bookmarkDelete(command) {
            command.WorkflowPendingTaskId = -1;
            return phoenixapi.command('UserProfileDeleteBookmark', command);
        }
    }

}(Phoenix.Services));