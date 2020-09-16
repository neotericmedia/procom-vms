(function(directives) {
  directives.directive('profileSelector', [
    function() {
      return {
        restrict: 'E',
        controller: [
          '$scope',
          'phoenixauth',
          'phoenixapi',
          '$state',
          '$rootScope',
          'CodeValueService',
          function(
            $scope,
            auth,
            phoenixapi,
            $state,
            $rootScope,
            CodeValueService
          ) {
            $scope.user = null;
            $scope.lists = {
              UserProfileType: CodeValueService.getCodeValues(
                CodeValueGroups.ProfileType,
                true
              )
            };

            $scope.pickProfile = function(profile) {
              $rootScope.activateGlobalSpinner = true;
              auth
                .setCurrentProfile(profile.DatabaseId, profile.ProfileId)
                .then(function(result) {
                  return $rootScope.initApp();
                })
                .then(
                  function(data) {
                    $state.go('ngtwo.m', { p: 'activity-centre' });
                    $rootScope.activateGlobalSpinner = false;
                  },
                  function(err) {
                    alert('An error occurred!');
                    console.log(err);
                    $rootScope.activateGlobalSpinner = false;
                  }
                );
            };

            $rootScope.activateGlobalSpinner = true;
            auth.getCurrentUser().then(
              function(user) {
                $scope.user = user;
                //if (!user || !user.Profiles || user.Profiles.length < 2) {
                //    $rootScope.initApp().then(function () {
                //        $state.go('dashboard.homepage');
                //        $rootScope.activateGlobalSpinner = false;
                //    });
                //} else {
                //    $rootScope.activateGlobalSpinner = false;
                //}

                if (!user || !user.Profiles || !user.Profiles.length) {
                  //Shouldn't happen. If it does, spinner stays activated
                } else {
                  var primaryProfiles = user.Profiles.filter(function(profile) {
                    return profile.IsPrimary;
                  });
                  var uniqueInstances = _.uniqBy(user.Profiles, 'DatabaseId');
                  if (
                    primaryProfiles.length === 1 &&
                    uniqueInstances.length === 1
                  ) {
                    var profile = primaryProfiles[0];
                    auth
                      .setCurrentProfile(profile.DatabaseId, profile.ProfileId)
                      .then(function(result) {
                        $rootScope.initApp().then(function() {
                          $state.go('ngtwo.m', { p: 'activity-centre' });
                          $rootScope.activateGlobalSpinner = false;
                        });
                      });
                  } else {
                    $rootScope.activateGlobalSpinner = false;
                  }
                }
              },
              function(err) {
                $rootScope.activateGlobalSpinner = false;
              }
            );
          }
        ],
        templateUrl: '/Phoenix/app/transitions/profile-selector.component.html'
      };
    }
  ]);
})(Phoenix.Directives);
