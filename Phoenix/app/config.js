(function() {
    'use strict';

    var app = angular.module('Phoenix');

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    var keyCodes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        del: 46
    };

    var imageSettings = {
        imageBasePath: '/Content/images/'
    };

    var config = {
        appErrorPrefix: '[Phoenix Error] ', //Configure the exceptionHandler decorator
        docTitle: 'Phoenix: ',
        keyCodes: keyCodes,
        imageSettings: imageSettings,
        version: '2.0.0'
    };

    app.value('config', config);

    app.config(['$logProvider', 'RestangularProvider', '$compileProvider',
        function ($logProvider, RestangularProvider, $compileProvider) {
            // turn debugging off/on (no info or warn)
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
            else {
                $compileProvider.debugInfoEnabled(false);
            }

            RestangularProvider.setRestangularFields({
                id: "Id",

            });
            RestangularProvider.setBaseUrl('/api');
        }
    ]);

    app.value('cgBusyDefaults', {
        message: 'Please wait...',
        backdrop: true,
        templateUrl: 'loaderForAngularJsAsAngular2Loader.html'
        //delay: 50,
        //minDuration: 700
    });

    app.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy('escape');
    }]);

})();
