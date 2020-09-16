// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run
(function () {
    'use strict';

    var app = angular.module('Phoenix');

    // Configure by setting an optional string value for appErrorPrefix.
    // Accessible via config.appErrorPrefix (via config value).

    app.config(['$provide', function ($provide) {
        $provide.decorator('$exceptionHandler',
            ['$delegate', 'config', 'logger', 'Rollbar', extendExceptionHandler]);
    }]);

    // Extend the $exceptionHandler service to also display a toast.
    function extendExceptionHandler($delegate, config, logger, rollbar) {
        var appErrorPrefix = config.appErrorPrefix;
        var logError = logger.getLogFn('app', 'error');

        function getCurrentUserPayload() {
            let identity = null;
            try {
                identity = JSON.parse(decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent('BearerIdentity').replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null);
                return {
                    person: {
                        id: 'ProfileId: ' + identity.profileId + ', DatabaseId: ' + identity.databaseId,
                        username: identity.userName,
                        email: identity.email
                    }
                };
            } catch (e) {
                return {};
            }
        }

        return function (exception, cause) {
            rollbar.configure({
                payload: getCurrentUserPayload()
            });
            $delegate(exception, cause);
            if (appErrorPrefix && exception && exception.message && exception.message.indexOf(appErrorPrefix) === 0) { return; }

            var errorData = { exception: exception, cause: cause };
            var msg = appErrorPrefix;
            if (exception != null) {
                msg += (exception.message ? exception.message : '') + ' ' + (exception.stack ? exception.stack : '');
            }
            logError(msg, errorData, true);
            // throw exception;
        };
    }
})();