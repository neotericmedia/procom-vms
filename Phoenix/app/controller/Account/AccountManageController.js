(function (app) {
    'use strict';

    

    // Controller name is handy for logging
    var controllerId = 'AccountManageController';

    /// Should redirect to Manage page if already logged in
    /// Should display error if login fails
    /// Should redirect to manage page if Login succeeds 
    app.controller(controllerId, ["$scope", '$q', 'phoenixapi', 'phoenixauth', 'AccountApiService', 'common', '$rootScope', '$location', 'NavigationService', 'CodeValueService', 'phxLocalizationService', AccountManageController]);
    
    function AccountManageController($scope, $q, phoenixapi, phoenixauth, AccountApiService, common, $rootScope, $location, NavigationService, CodeValueService, phxLocalizationService) {
        common.setControllerName(controllerId);
        $scope.isInit = false;
        $scope.editModel = null;

        $scope.currentUser = null;
        $scope.currentProfile = null;
        
        $scope.loginUserSettingsModel = {
            CultureId: null
        };
        
        $scope.changePasswordModel = {};
        
        $scope.currentCulture = '';

        $scope.init = function () {
            NavigationService.setTitle('account-manage');

            $scope.cultureList = CodeValueService.getCodeValues(CodeValueGroups.Culture, true);
            
            Promise.all([phoenixauth.getCurrentUser(), phoenixauth.getCurrentProfile()])
            .then(function (response) {
                var user = response[0];
                var profile = response[1];

                $scope.currentUser = user;

                $scope.currentCulture = CodeValueService.getCodeValueText(user.PreferredCultureId, CodeValueGroups.Culture);

                $scope.currentProfile = profile;

                $scope.setModelDefaults();

                $scope.isInit = true;
            });
        }

        $scope.init();
        
        $scope.setEdit = function (model) {
            $scope.editModel = model;
        }

        $scope.cancel = function () {
            $scope.closeEdit();
        }

        $scope.closeEdit = function () {
            $scope.editModel = null;
            $scope.setModelDefaults();
        }

        $scope.setModelDefaults = function () {
            $scope.loginUserSettingsModel.CultureId = $scope.currentUser.PreferredCultureId;
            $scope.loginUserSettingsModel.BrokenRules = null;

            $scope.changePasswordModel = {};
        }

        $scope.changePassword = function () {
            $scope.changePasswordModel.BrokenRules = {};
            var deferred = $q.defer();
            phoenixauth.changePassword($scope.changePasswordModel).then(
                function timesheetSaveSuccess(response) {
                    var responseString = '';

                    if (response.data) {
                        responseString = response.data;
                    }

                    if (!responseString) {
                        responseString = phxLocalizationService.translate('account.manage.pwdUpdateSuccessMessage');
                    }

                    common.logSuccess(responseString);

                    $scope.closeEdit();

                    deferred.resolve(responseString);
                }, function timesheetSaveError(response) {
                    if ((response === null) || (response.data === null)) {
                        common.logError(phxLocalizationService.translate('account.manage.pwdNotChangedMessage'));
                        $scope.changePasswordModel.BrokenRules.OldPassword = [phxLocalizationService.translate('account.manage.pwdNotChangedMessage')];
                    } else if (response.status == 304) {
                        $scope.changePasswordModel.BrokenRules.OldPassword = [phxLocalizationService.translate('account.manage.pwdIncorrect')];
                    } else if (response.status == 400) {
                        $scope.changePasswordModel.BrokenRules = response.data.ModelState;
                    }
                    deferred.reject(response);
                });
            return deferred.promise;
        };

        $scope.saveLoginUserSettings = function () {
            $scope.loginUserSettingsModel.BrokenRules = {};
            var deferred = $q.defer();
            phoenixapi.command('SaveLoginUserSettings', $scope.loginUserSettingsModel).then(
                function responseSuccess(response) {
                    
                    common.logSuccess(phxLocalizationService.translate('account.manage.cultureUpdateSuccessMessage'));
                    deferred.resolve();

                    $scope.refreshProfile(); // TODO: find way to refresh backend, then only reload?

                }, function responseError(response) {
                    if(response && response.ModelState) {
                        $scope.loginUserSettingsModel.BrokenRules = response.ModelState;
                    }
                    deferred.reject(response);
                });
            return deferred.promise;
        };

        $scope.refreshProfile = function () {
            $rootScope.activateGlobalSpinner = true;
            
            var dbProfile = $scope.currentProfile;

            phoenixauth.setCurrentProfile(dbProfile.DatabaseId, dbProfile.Id).then(function (result) {
                location.reload();
            });
        };
    }

})(Phoenix.App);
