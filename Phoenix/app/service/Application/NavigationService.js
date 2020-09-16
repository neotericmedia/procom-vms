/*global EROnline: false, console: false*/
(function (services) {
    'use strict';

    services.factory('NavigationService', ['config', '$rootScope', '$location', '$window', 'phoenixapi', 'phoenixauth',
        function (config, $rootScope, $location, $window, phoenixapi, phoenixauth) {

            // window.navigation = {};

            function NavigationService() {
                //init();
            }

            function setTitle(key, extraTexts) {
                var pages = PhoenixPageTitles;
                var title = '';
                var search = _.filter(pages, { Key: (key || '').toLowerCase() });
                if (search.length > 0) {
                    var page = search[0];
                    var decorators = page.Decorators || [];

                    angular.forEach(decorators, function (item) {
                        if (item.ShowText === true) {
                            if (title !== '') {
                                title += ' - ';
                            }
                            title += item.Text;
                        }
                    });

                    var extraDecorators = [];
                    if (extraTexts) {
                        angular.forEach(extraTexts, function (text) {
                            extraDecorators.push({ Text: text, ShowText: true, ShowIcon: false });
                        });
                    }

                    $rootScope.pageTitleDecorators = decorators.concat(extraDecorators);
                } else {
                    console.error('Page with key "' + key + '" not found');
                    $rootScope.pageTitleDecorators = [];
                }

                $window.document.title = title + " - FlexBackOffice";
                var wintitle = config.docTitle + ' ' + (title || '');
            }

            $rootScope.helpShow = false;

            function isHelpShow() {
                $rootScope.helpShow = ($rootScope.$state && $rootScope.$state.current && $rootScope.$state.current.name && $rootScope.stateCurrentName && $rootScope.$state.current.name.length > 0 && $rootScope.$state.includes($rootScope.stateCurrentName) && $rootScope.functionOnHelpAction) ? true : false;
            }

            function setHelp(stateCurrentName, title, icon, functionOnHelpAction) {
                $rootScope.stateCurrentName = stateCurrentName;
                $rootScope.helpTitle = (title || '');
                $rootScope.helpIcon = (icon || '');//'fontello-icon-help');
                $rootScope.functionOnHelpAction = functionOnHelpAction;
                isHelpShow();
            }

            $rootScope.clickOnHelp = function () {
                if ($rootScope.functionOnHelpAction) {
                    $rootScope.functionOnHelpAction();
                }
            };

            $rootScope.$on('$locationChangeSuccess', function () {
                isHelpShow();
            });

            $rootScope.$on('broadcastEvent:logout', function () {
                $rootScope.pageTitleDecorators = [];
            });

            // add methods to the 
            NavigationService.prototype =
                {
                    setTitle: setTitle,
                    setHelp: setHelp,
                    saveUserProfileNavigationHistory: saveUserProfileNavigationHistory,
                    getUserProfileNavigationHistoryLastNavigationId: getUserProfileNavigationHistoryLastNavigationId,
                };

            function saveUserProfileNavigationHistory(navigationId) {
                phoenixauth.getCurrentProfile().then(function (profile) {                    
                    const command = {
                        UserProfileId: profile.Id,
                        NavigationId: navigationId
                    };
                    return phoenixapi.command('UserProfileNavigationHistorySave', command);
                });
            }

            function getUserProfileNavigationHistoryLastNavigationId(userProfileId) {
                return phoenixapi.query('UserProfile/getUserProfileNavigationHistoryLastItemByUserProfileId/' + userProfileId);
            }

            return new NavigationService();
        }]);

}(Phoenix.Services));