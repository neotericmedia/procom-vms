import { Component, OnInit } from '@angular/core';
import { CodeValueService, LoadingSpinnerService } from '../../common';
import { CodeValueGroups } from '../../common/model/phx-code-value-groups';
import { AuthService } from '../../common/services/auth.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { UserContext, UserInfo, UserProfile, UserProfilePerDbInstance } from '../../common/model/user';

@Component({
  selector: 'app-profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.less']
})
export class ProfileSelectorComponent implements OnInit {

  user: UserInfo = null;
  lists = null;

  constructor(
    private codeValueService: CodeValueService,
    private authService: AuthService,
    private router: Router,
    private spinnerService: LoadingSpinnerService
  ) {
    this.lists = {
      UserProfileType: this.codeValueService.getCodeValues(CodeValueGroups.ProfileType, true)
    };
  }

  ngOnInit() {
    const self = this;
    this.spinnerService.show();
    this.authService.getCurrentUser().subscribe(
        function(user: UserInfo) {
          self.user = user;
          //if (!user || !user.Profiles || user.Profiles.length < 2) {
          //    $rootScope.initApp().then(function () {
          //        $state.go('dashboard.homepage');
          //        $rootScope.activateGlobalSpinner = false;
          //    });
          //} else {
          //    $rootScope.activateGlobalSpinner = false;
          //}

          if (!user || !user.Profiles || !user.Profiles.length) {
            // Shouldn't happen. If it does, spinner stays activated
          } else {
            const primaryProfiles = user.Profiles.filter((p: any) => {
              return p.IsPrimary;
            });
            const uniqueInstances = _.uniqBy(user.Profiles, 'DatabaseId');
            if ( primaryProfiles.length === 1 && uniqueInstances.length === 1) {
              const profile = primaryProfiles[0];
              self.authService.setCurrentProfile(profile.DatabaseId, profile.ProfileId)
                .then((userContext: UserContext) => {
                  self.authService.initApp(userContext.User.CultureId).then(function() {
                    self.router.navigate(['/next/activity-centre']);
                    self.spinnerService.hide();
                  });
                });
            } else {
              self.spinnerService.hide();
            }
          }
        },
        function(err) {
          self.spinnerService.hide();
        }
      );
  }

  pickProfile(profile: UserProfilePerDbInstance) {
    const self = this;
    this.spinnerService.show();
    this.authService.setCurrentProfile(profile.DatabaseId, profile.ProfileId)
      .then((userContext: UserContext) => {
        return self.authService.initApp(userContext.User.CultureId);
      })
      .then(
        function(data) {
          self.router.navigate(['/next/activity-centre']);
          self.spinnerService.hide();
        },
        function(err) {
          alert('An error occurred!');
          console.log(err);
          self.spinnerService.hide();
        }
      );
  }
}
