module.exports = {
    vendor: {
        assets: [
            { origin: './vendor/font-awesome/fonts/*.*', dest: 'font-awesome/fonts/*' },
            { origin: './Content/fonts/appicon/fonts/appicon.*', dest: 'fonts/*' },
            { origin: './Content/fonts/fontawesome/font/*.*', dest: 'fonts/*' },
            { origin: './Content/fonts/fontello/font/fontello.woff', dest: 'font/fontello.woff' },
            { origin: './Content/fonts/fontello/font/fontello.ttf', dest: 'font/fontello.ttf' },
            { origin: './Content/fonts/fontello/font/fontello.eot', dest: 'font/fontello.eot' },
            { origin: './Content/fonts/fontello/font/fontello.svg', dest: 'font/fontello.svg' },
            { origin: './vendor/select2/*.{png,gif}', dest: 'assets/*' },
            { origin: './custom-vendor/**/*.{png,gif}', dest: 'img/*' },
            { origin: './Content/images/**/*.*', dest: 'assets/*' }
        ],
        js: [
            { origin: './vendor/angular-ui/build/angular-ui.js', dest: 'angular-ui.js' },
            { origin: './vendor/angular-ui/build/angular-ui-ieshiv.js', dest: 'angular-ui-ieshiv.js' },
            { origin: './Phoenix/ace.js', dest: 'ace.js' },
            { origin: './Phoenix/ace-extra.js', dest: 'ace-extra.js' },
            { origin: './custom-vendor/prototype/prototype.js', dest: 'prototype.js' },
            { origin: './custom-vendor/smart-table/*.js', dest: 'smart-table/*' },
            { origin: './custom-vendor/abn-tree/abn_tree_directive.js', dest: 'abn_tree_directive.js' },
            { origin: './vendor/oreq/src/oreq.js', dest: 'oreq.js' },
            { origin: './Content/extensions/oreq/oreq.smartTableAdapter.js', dest: 'smart-table/oreq.smartTableAdapter.js' },
            { origin: './Content/extensions/filesaver/FileSaver.js', dest: 'FileSaver.js' },
            { origin: './vendor/blueimp-file-upload/js/jquery.fileupload-angular.js', dest: 'jquery.fileupload-angular.js' },
            { origin: './vendor/blueimp-file-upload/js/jquery.fileupload-process.js', dest: 'jquery.fileupload-process.js' },
            { origin: './vendor/blueimp-file-upload/js/jquery.fileupload-validate.js', dest: 'jquery.fileupload-validate.js' },
            { origin: './vendor/blueimp-file-upload/js/jquery.iframe-transport.js', dest: 'jquery.iframe-transport.js' },
            { origin: './vendor/jquery.inputmask/dist/jquery.inputmask.bundle.js', dest: 'jquery.inputmask.bundle.js' },
            { origin: './custom-vendor/print-preview/jquery.print-preview.js', dest: 'jquery.print-preview.js' }
        ],
        css: [
            { origin: './Content/css/themes/base/themes/base/datepicker.custom.css', dest: 'css/datepicker.custom.css' },

            { origin: './Content/fonts/fontello/css/fontello.css', dest: 'css/fontello.css' },
            { origin: './Content/fonts/fontello/css/fontello-codes.css', dest: 'css/fontello-codes.css' },
            { origin: './Content/fonts/fontello/css/fontello-ie7.css', dest: 'css/fontello-ie7.css' },
            { origin: './Content/fonts/fontello/css/fontello-ie7-codes.css', dest: 'css/fontello-ie7-codes.css' },

            { origin: './Content/fonts/appicon/style.css', dest: 'css/app-icon-style.css' },
            { origin: './Content/fonts/fontawesome/less/myIcons.css', dest: 'css/myIcons.css' },
            { origin: './custom-vendor/pl-form/typeahead.js/typeahead.css', dest: 'css/typeahead.css' },
            { origin: './custom-vendor/notyfy/themes/boo-notyfylight.css', dest: 'css/boo-notyfylight.css' },
            { origin: './custom-vendor/jquery-file-upload/css/style.css', dest: 'css/file-upload-style.css' },
            { origin: './custom-vendor/jquery-file-upload/css/jquery.fileupload.css', dest: 'css/jquery.fileupload.css' },
            { origin: './custom-vendor/jquery-file-upload/css/jquery.fileupload-ui.css', dest: 'css/jquery.fileupload-ui.css' },
            { origin: './custom-vendor/abn-tree/abn_tree.css', dest: 'css/abn_tree.css' },
            { origin: './custom-vendor/print-preview/css/print-preview.css', dest: 'css/print-preview.css' }
        ],
    },
    htmlPaths: ['!Phoenix/appNext/**/*','!Phoenix/tests/**/*','./Phoenix/**/*.html'],
    scripts: {
        phoenix: [
            './Phoenix/app/core.js',
            './Phoenix/app/phoenixapi-service.js',
            './Phoenix/app/app.js',
            './Phoenix/app/transitions/*.component.js',
            './Phoenix/app/interceptors.js',
        ],
        phoenixConfig: [
            './Phoenix/app/config.js',
        ],
        phoenixConfigRoute: [
            './Phoenix/app/config.route.Account.js',
            './Phoenix/modules/**/config.route.*.js'
        ],
        phoenixConfigException: [
            './Phoenix/app/config.exceptionHandler.js',
        ],
        phoenixConstants: [
            './Phoenix/app/constants/**/*.js',
        ],
        phoenixCommon: [
            './Phoenix/app/common/**/*.js',
        ],
        phoenixController: [
            './Phoenix/app/controller/**/*.js',
        ],
        phoenixFilter: [
            './Phoenix/app/filter/**/*.js',
        ],
        phoenixDirective: [
            './Phoenix/app/directive/**/*.js',
        ],
        phoenixService: [
            './Phoenix/app/service/**/*.js',
        ],
        phoenixUtils: [
            './Phoenix/app/utils/**/*.js',
        ],
        phoenixTests: [
            './Phoenix/tests/**/*.js',
        ],
        phoenixBootstrap: [
            './Phoenix/app/bootstrap.js',
        ],
        phoenixModules: [
            './Phoenix/modules/**/*.js'
        ],
        phoenixTemplateOverrides: [
            './Phoenix/app/phoenix.template-overrides.js'
        ],
        //printPreview: [
        //    './vendor/jquery-print-preview-plugin/src/jquery.print-preview.js'
        //],        
        phoenixAppNext: [
            './Phoenix/appNext/**/*.ts'
        ]

    },
    styles: {
        //fontAwesome: [
        //    './vendor/font-awesome/css/font-awesome.css'
        //],
        main: [
            './Content/less/red-phoenix/fonts.css',

            './Content/less/red-phoenix/type.less',
            './Content/less/red-phoenix/panes.less',
            './Content/less/red-phoenix/grid.less',

            './Content/less/red-phoenix/tables.less',
            './Content/less/red-phoenix/forms.less',
            './Content/less/red-phoenix/buttons.less',

            './Content/less/red-phoenix/animations.less',
            './Content/less/red-phoenix/colors.less',
            './Content/less/red-phoenix/input-groups.less',
            './Content/less/red-phoenix/dropdowns.less',

            './Content/less/red-phoenix/navs.less',
            './Content/less/red-phoenix/navbar.less',
            './Content/less/red-phoenix/button-groups.less',
            './Content/less/red-phoenix/breadcrumbs.less',
            './Content/less/red-phoenix/pagination.less',
            './Content/less/red-phoenix/panels.less',

            './Content/less/red-phoenix/tab-accordion.less',

            './Content/less/red-phoenix/calendar.less',

            './Content/less/red-phoenix/modals.less',

            './Content/less/red-phoenix/labels.less',
            './Content/less/red-phoenix/layouts.less',
            './Content/less/red-phoenix/sidebar.less',
            './Content/less/red-phoenix/dataicon.less',

            './Content/less/red-phoenix/sidebar-new.less',
            './Content/less/red-phoenix/sidebar-min.less',

            './Content/less/red-phoenix/utilities.less',

            './Content/less/red-phoenix/style.less',
            './Content/less/red-phoenix/validation.less',
            './Content/less/red-phoenix/wizard.less',
            './Content/less/red-phoenix/responsive.less',
            './Content/less/red-phoenix/file-upload.less',
            './Content/less/red-phoenix/misc.less',
            './Content/less/red-phoenix/responsive-align.less',

            // TEST THESE:

            './Content/less/red-phoenix/pretty-print.less',

            './Content/less/red-phoenix/main.less',
            './Content/less/red-phoenix/smart-table.less',

            './Phoenix/modules/**/*.less',
        ],
        print: [
            './Content/less/red-phoenix/print.less',
        ],
        //jqueryUi: [
        //    './vendor/jquery-ui/themes/base/themes/base/core.css',
        //    './vendor/jquery-ui/themes/base/themes/base/resizable.css',
        //    './vendor/jquery-ui/themes/base/themes/base/selectable.css',
        //    './vendor/jquery-ui/themes/base/themes/base/accordion.css',
        //    './vendor/jquery-ui/themes/base/themes/base/autocomplete.css',
        //    './vendor/jquery-ui/themes/base/themes/base/button.css',
        //    './vendor/jquery-ui/themes/base/themes/base/dialog.css',
        //    './vendor/jquery-ui/themes/base/themes/base/slider.css',
        //    './vendor/jquery-ui/themes/base/themes/base/tabs.css',
        //    './Content/css/themes/base/themes/base/datepicker.custom.css',
        //    './vendor/jquery-ui/themes/base/themes/base/progressbar.css',
        //    './vendor/jquery-ui/themes/base/themes/base/theme.css',
        //],
        //printPreview: [
        //    './vendor/jquery-print-preview-plugin/src/css/print-preview.css'
        //],
    },
    ignoreExtensions: [
        '**/*.intellisense.js',
        '**/*-vsdoc.js',
        '**/*.debug.js'
    ],
    base: ".",
    buildBaseFolder: "./build/",
    debug: "debug",
    release: "release",
    bundleNames: {
        vendorStyles: "vendorStyles",
        vendorScripts: "vendorScripts",
        customVendorStyles: "customVendorStyles",
        customVendorScripts: "customVendorScripts",
        stylesLayout: "stylesLayout",
        stylesApplication: "stylesApplication",
        stylesApplicationPrint: "stylesApplicationPrint",
        scriptsLayout: "scriptsLayout",
        scriptsApplication: "scriptsApplication",
        htmlTemplates: "htmlTemplates"
    },
    css: "css",
    styleLoadOrderLayout: ["printPreview", "jqueryUi"],
    styleLoadOrderApplication: ["main"],
    styleLoadOrderApplicationPrint: ["print"],

    scriptLoadOrderApplication: ["phoenixConstants", "phoenix", "phoenixConfig", "phoenixConfigRoute", "phoenixConfigException", "phoenixCommon", "phoenixController", "phoenixFilter", "phoenixDirective", "phoenixService", "phoenixUtils", "phoenixModules", "phoenixTemplateOverrides"],
    scriptLoadOrderLayoutBootstrap: ["phoenixBootstrap"]

}
module.exports.debugFolder = "./" + module.exports.debug + "/";
module.exports.releaseFolder = "./" + module.exports.release + "/";