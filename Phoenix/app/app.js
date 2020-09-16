/* jshint ignore:start */
// Phoenix single page application
var console = console || {};
console.log = console.log || function () { };

var Phoenix = Phoenix || {};

window.Phoenix = Phoenix = (function () {
    'use strict';

    // define app module
    var app = angular.module('Phoenix', [
        // Angular modules 
        //'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'smart-table',

        // App modules 
        'services',
        'directives',
        'filters',
        'common',           // common functions, logger, spinner

        // 3rd Party Modules
        'angular.filter',
        'ui',
        'ui.directives',
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'ui.router',
        'ui.select',
        'ngProgress',
        'cgBusy',
        //'ngRoute',
        'restangular',
        'blueimpFileupload',
        'dialogs.main',
        'dialogs.default-translations',
        'angularBootstrapNavTree',
        'angulartics',
        'angulartics.google.analytics',
        'tandibar/ng-rollbar',
        // phoenix modules
        'phoenixapi.service',
        'phoenix.note',
        'phoenix.utility',
        'phoenix.models',
        'phoenix.workorder',
        'phoenix.admin',
        'phoenix.transaction',
        'phoenix.payment',
        'phoenix.journal',
        'phoenix.org',
        'phoenix.compliancedocumentrule',
        'phoenix.access',
        'phoenix.purchaseOrder',
        'phoenix.vms',
        'phoenix.timesheet',
        'phoenix.drafts',
        'phoenix.template',
        'phoenix.workflow',
        'phoenix.contact',
        'phoenix.payroll',
        'phoenix.commission',
        'phoenix.dashboard',
        'phoenix.template-overrides',
        'vs-repeat'
    ]);

    app.run(['$rootScope', '$q', 'UserApiService', '$state', '$stateParams', '$templateCache', 'chromePrintHack', '$location', 'phoenixsocket', 'CodeValueService', 'phoenixauth', 'phoenixapi', 'phxLocalizationService',
        function ($rootScope, $q, UserApiService, $state, $stateParams, $templateCache, chromePrintHack, $location, phoenixsocket, CodeValueService, phoenixauth, phoenixapi, phxLocalizationService) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            // phoenixsocket.connect();

            if (phoenixapi.getServerUnavailable()) {
                phoenixapi.serverUnavailable();
            }

            $rootScope.$on('$stateChangeStart', function (event, to, toParams, from, fromParams) {
                from.params = fromParams;
                $state.previous = from;
                $rootScope.activateGlobalSpinner = true;
            });

            $rootScope.$on('$stateChangeSuccess', function () {
                $rootScope.activateGlobalSpinner = false;
            });

            $rootScope.initApp = function () {
                return phoenixauth.loadContext().then(function (r) {

                    return $q.all([
                        phoenixapi.query('pagetitle').then(function (rsp) {
                            window.PhoenixPageTitles = rsp.Items;
                            return rsp;
                        }),
                        phoenixapi.query('code').then(function (rsp) {
                            window.PhoenixCodeValues = rsp.Items;
                            return rsp;
                        }),
                        phoenixapi.PhoenixNavigationCache().then(function (data) {
                            window.navigation = data;
                            return data;
                        }),
                        phoenixapi.query('localization').then(function (response) {
                            window.PhxTranslations = response;
                            return response;
                        }),
                        phoenixauth.getCurrentUser().then(function (currentUser) {
                            const lang = phxLocalizationService.getLangFromUser(currentUser);
                            phxLocalizationService.setLocale(lang);
                        })
                    ]).then(function (responseArr) {
                        $rootScope.$emit('APP_INIT', true);
                        console.log(responseArr);
                        //return auth.setCurrentProfile(1);
                    }).catch(function (e) {
                        console.log(e);
                        phoenixauth.logout();
                        $state.go('account');
                    });
                }, function (e) {
                    phoenixauth.logout();
                    return $q.all([
                        phoenixapi.query('localization/'
                            + (window.navigator['languages'] ? window.navigator['languages'][0] : (window.navigator.language || window.navigator['userLanguage']))
                        ).then(function (response) {
                            window.PhxTranslations = response;
                            resolve({ isLoggedIn: false });
                        })
                    ]).then(function () {
                        $state.go('account');
                    });
                });
            }

            // if (phoenixauth.hasInit()) {
            //     // load up all of the cache services
            //     $rootScope.initApp();
            // }

            // Added loader for AngularJs that is same as one in Angular 2
            $templateCache.put("loaderForAngularJsAsAngular2Loader.html",
                "<style type=\"text/css\">" +
                "#loading-Overlay{position:fixed;width:100%;height:100%;top:0;left:0;right:0;bottom:0;padding:0;margin:0;background-color:rgba(53,64,81,0.6);z-index:999;cursor:pointer}#loading-Animation-Container{width:200px;margin:5px auto;padding-top:5px}.loading-text{font-size:1.2em;color:#fff}.sk-three-bounce{margin:30px auto;width:100px;text-align:center}.sk-three-bounce .sk-child{width:13px;height:13px;background-color:#fff;border-radius:100%;display:inline-block;-webkit-animation:sk-three-bounce 1.4s ease-in-out 0s infinite both;animation:sk-three-bounce 1.4s ease-in-out 0s infinite both}.sk-three-bounce .sk-bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.sk-three-bounce .sk-bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes sk-three-bounce{0%,100%,80%{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes sk-three-bounce{0%,100%,80%{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1);transform:scale(1)}}" +
                "</style>" +
                "<div id=\"loading-Overlay\" class=\"sk-three-bounce\">" +
                "<div id=\"loading-Animation-Container\">" +
                "<div class=\"sk-child sk-bounce1\"></div>" +
                "<div class=\"sk-child sk-bounce2\"></div>" +
                "<div class=\"sk-child sk-bounce3\"></div>" +
                "<div class=\"loading-text\">" + 
                    (window && window.PhxTranslations && window.PhxTranslations.common && window.PhxTranslations.common.generic
                    ? window.PhxTranslations.common.generic.loadingText
                    : '') +
                "</div>" +
                "</div>" +
                "</div>"
            );
        }
    ]).config(['RollbarProvider', function (RollbarProvider) {
        if (window.rollbarConfig && window.rollbarConfig.accessToken) {
            // RollbarProvider.init({
            //     accessToken: window.rollbarConfig.accessToken,
            //     captureUncaught: true,
            //     payload: window.rollBarPayload
            // });
            RollbarProvider.init(window.rollbarConfig);
        } else {
            RollbarProvider.deinit();
        }
    }]).config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('fr-CA', {
            DIALOGS_ERROR: "Erreur",
            DIALOGS_ERROR_MSG: "Une erreur inconnue s'est produite.",
            DIALOGS_CLOSE: "Fermer,",
            DIALOGS_PLEASE_WAIT: "Patientez svp",
            DIALOGS_PLEASE_WAIT_ELIPS: "Patienter svp...",
            DIALOGS_PLEASE_WAIT_MSG: "En attente de la fin de l'opération.",
            DIALOGS_PERCENT_COMPLETE: "% Terminé",
            DIALOGS_NOTIFICATION: "Notification",
            DIALOGS_NOTIFICATION_MSG: "Notification d'application inconnue",
            DIALOGS_CONFIRMATION: "Confirmation",
            DIALOGS_CONFIRMATION_MSG: "Confirmation requise.",
            DIALOGS_OK: "OK",
            DIALOGS_YES: "Oui",
            DIALOGS_NO: "Non"
        });
    }]);

    // // for environments that don't have internet access (see https://github.com/tandibar/ng-rollbar)
    // .config(function (RollbarProvider) {
    //     RollbarProvider.deinit();
    // })




    var services = angular.module('services', ['ngResource', 'ngCookies', 'ui.router', 'restangular', 'phoenixapi.service']),
        directives = angular.module('directives', []),
        filters = angular.module('filters', []);

    // TODO: move some of the below into their own files, start grouping by major area/functionality group
    angular.module('phoenix.models', []).factory('Base', function () {
        return {
            /**
             * Defines a new mixin with a set of properties. Multiple sets of properties can be provided.
             * If two property sets define the same property name, the last one will take priority.
             *
             * Mixins can extend upon each other.
             */
            extend: function () {
                var args = Array.prototype.slice.call(arguments);
                return angular.extend.apply(null, [{}, this].concat(args));
            },
            /**
             * Mixes the properties of this mixin into an object. If the mixin defines a beforeMixingInto
             * method, that will get called _before_ the mixing occurs.
             *
             * The first argument is the object to mix into. This will also be passed to beforeMixingInto.
             * If any subsequent arguments are provided, they will also be passed to beforeMixingInto.
             */
            mixInto: function () {
                var object = arguments[0];
                // If we're actually mixing into something,
                if (object) {
                    // If we've got some mixing customization todo, then invoke it
                    if (this.beforeMixingInto) this.beforeMixingInto.apply(this, arguments);

                    // Always do this
                    angular.extend(object, this);

                    return object;
                }
            }
        };
    }).factory('identityMap',
        /**
         * A simple identity-map implementation. This can be used to ensure that, for some class
         * descriptor and ID, only one instance of a particular object is ever used.
         */
        function () {
            var identityMap = {};
            /*
             * Identity-maps an object. This means that:
             *
             * - If an object with the same class and ID already exists in the map, the new object will be
             *   merged into the existing one, and the existing object returned.
             * - If an object with the same class and ID does _not_already exist in the map, it will be
             *   stored in the map and returned
             *
             * @param  {String} className a string descriptor of the class of the object
             * @param  {Object} object the object to be mapped
             * @return {Object} the identity-mapped object
             */
            return function (className, object) {
                if (object) {
                    var mappedObject;
                    if (identityMap[className]) {
                        mappedObject = identityMap[className][object.id];
                        if (mappedObject) {
                            angular.extend(mappedObject, object);
                        } else {
                            identityMap[className][object.id] = object;
                            mappedObject = object;
                        }
                    } else {
                        identityMap[className] = {};
                        identityMap[className][object.id] = object;
                        mappedObject = object;
                    }
                    return mappedObject;
                }
            };
        }
    );


    return {
        App: app,
        Services: services,
        Directives: directives,
        Filters: filters
    };
})();
/* jshint ignore:end */