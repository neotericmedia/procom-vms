module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            '../content/libs/angular/angular.js',
            '../content/libs/angular/angular-mocks.js',
            '../content/libs/angular/angular-resource.js',
            '../content/libs/angular/angular-cookies.js',
            '../content/libs/angular/angular-animate.js',
            '../content/libs/angular/angular-route.js',
            '../content/libs/angular/angular-sanitize.js',
            '../content/libs/angular-ui/angular-ui.js',
            '../content/libs/angular-dialog-service/dialogs.js',
            '../content/libs/angular-ui-router/angular-ui-router.js',
            '../content/libs/angular-ui-bootstrap/ui-bootstrap-0.6.0.js',
            '../content/libs/underscore/underscore.js',
            '../content/libs/jquery/jquery-1.9.0.js',
            '../content/libs/jquery-file-upload/js/jquery.fileupload-angular.js',
            '../content/libs/toastr/toastr.js',
            '../content/libs/moment/moment.js',
            '../content/libs/moment/moment-range.js',
            '../content/libs/restangular/restangular.js',
            '../content/libs/prototype/prototype.js',
            '../content/libs/ng-progress/angular-ngProgress.js',
            '../content/libs/datepicker/js/angular-pickadate.js',
            'app/*.js',
            'app/**/*.js',
            'tests/data/**/*.js',
            'tests/unit/**/*.js'
        ],
        exclude: ['app/core.js'],
        reporters: ['progress'],
        port: 9090,
        runnerPort: 9100,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        captureTimeout: 5000,
        singleRun: false
            
    });
};
