import { Component, OnInit, ViewChild, HostListener, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, PhxLocalizationService } from '../common';
import { UserProfile, UserProfilePerDbInstance, UserContext } from '../common/model';
import { AuthService } from './../common/services/auth.service';
import { PhxModalComponent } from '../common/components/phx-modal/phx-modal.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { TopNavMenuResourceKeys } from './top-nav-menu-resource-keys';

@Component({
  selector: 'app-top-nav-menu',
  templateUrl: './top-nav-menu.component.html',
  styleUrls: ['./top-nav-menu.component.less']
})
export class TopNavMenuComponent implements OnInit, AfterViewInit {
  @ViewChild('pickProfileModal')
  pickProfileModal: PhxModalComponent;
  @ViewChild(FeedbackComponent)
  feedbackComponent: FeedbackComponent;

  @Output()
  menuOpenChange = new EventEmitter<boolean>();

  fullName: string;
  currentProfile: UserProfile;
  currentProfileId: number;
  currentDatabaseId: number;
  currentInstanceName: string;
  moreThanOneProfiles: boolean;

  profiles: { ProfileId: number; DatabaseId: number; ProfileTypeId: number; Label: string }[] = [];
  profilesGroupedByInstance: { instanceName: string; fullName: string; profiles: UserProfilePerDbInstance[] }[] = [];
  multiProfile: boolean = false;

  menuOpen: boolean = false;
  isMobile: boolean = false;

  codeValueGroups: any;
  resourceKeys: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateIsMobile();
  }

  constructor(private authService: AuthService, private commonService: CommonService, private localizationService: PhxLocalizationService, private router: Router) {
    this.resourceKeys = TopNavMenuResourceKeys;
    this.codeValueGroups = this.commonService.CodeValueGroups;
  }

  ngOnInit() {
    this.updateIsMobile();

    this.authService.getUserContext().then(user => {
      this.fullName = user.User.PreferredFirstName + ' ' + user.User.PreferredLastName;
    });

    this.authService
      .getCurrentUser()
      .take(1)
      .combineLatest(this.authService.getCurrentProfile().take(1))
      .subscribe(item => {
        const [userInfo, currentProfile] = item;

        this.currentProfile = currentProfile;
        this.currentProfileId = currentProfile.Id;
        this.currentDatabaseId = currentProfile.DatabaseId;
        this.moreThanOneProfiles = userInfo.Profiles && userInfo.Profiles.length > 1;

        const firstDbInstanceProfile = userInfo.Profiles.find(x => x.DatabaseId === this.currentDatabaseId);
        this.currentInstanceName = firstDbInstanceProfile != null ? firstDbInstanceProfile.InstanceName : '';

        this.profiles = userInfo.Profiles.sort((a, b) => {
          const diffDatabaseId = (a.DatabaseId === this.currentDatabaseId ? -1 : a.DatabaseId) - (b.DatabaseId === this.currentDatabaseId ? -1 : b.DatabaseId);
          const diffProfileTypeId = a.ProfileTypeId - b.ProfileTypeId;

          return diffDatabaseId !== 0 ? diffDatabaseId : diffProfileTypeId;
        }).map(profile => {
          return {
            ProfileId: profile.ProfileId,
            DatabaseId: profile.DatabaseId,
            ProfileTypeId: profile.ProfileTypeId,
            Label: profile.DatabaseId !== this.currentDatabaseId ? `${profile.InstanceName} - ${profile.FirstName} ${profile.LastName}` : ''
          };
        });

        this.multiProfile = this.profiles.length > 1;

        this.profilesGroupedByInstance = this.GroupBy(userInfo.Profiles, 'DatabaseId').map(group => {
          return {
            instanceName: group.value[0].InstanceName,
            fullName: `${group.value[0].FirstName} ${group.value[0].LastName}`,
            profiles: group.value
          };
        });
      });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const sideNavToggle = document.querySelector('#menu-toggler'); // temp until sidenav migrated to ng2 and can pass data/events easier
      if (sideNavToggle) {
        sideNavToggle.addEventListener('click', () => (this.menuOpen = false));
      }
    }, 0);
  }

  updateIsMobile() {
    this.isMobile = window.innerWidth <= 992;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  onMenuOpenChange(value: boolean) {
    this.menuOpen = value;
    this.menuOpenChange.emit(value);
  }

  showFeedback() {
    this.closeMenu();
    this.feedbackComponent.show();
  }

  openPickProfileModal() {
    this.pickProfileModal.show();
  }

  setProfile(profile: UserProfilePerDbInstance) {
    this.closeMenu();
    const oldDatabaseId = this.currentDatabaseId;
    const oldProfileId = this.currentProfileId;

    this.currentDatabaseId = profile.DatabaseId;
    this.currentProfileId = profile.ProfileId;

    this.authService
      .setCurrentProfile(profile.DatabaseId, profile.ProfileId)
      .then((userContex: UserContext) => {
        const p = userContex.User.UserProfiles.find(x => x.Id === profile.ProfileId);
        if (p) {
          this.currentProfile = p;
        }
        this.router.navigate(['/next/activity-centre']);
      })
      .catch(() => {
        this.currentDatabaseId = oldDatabaseId;
        this.currentProfileId = oldProfileId;
        this.router.navigate(['/next/activity-centre']);
      });
  }

  logoff() {
    this.closeMenu();

    // let listeners handle menu close before exiting main app and this.OnDestroy
    setTimeout(() => {
      this.commonService.logSuccess(this.localizationService.translate('account.login.loggingOutMessage'));
      this.router.navigate(['/home']);
      // fix for some components that are subscribed to current profile. Now they don't do any extra unneeded work before they're disposed by navigating away
      setTimeout(() => {
        this.authService.logout();
      }, 0);
    }, 0);
  }

  public GroupBy<T>(value: Array<T>, field: string): Array<{ key: string; value: T[] }> {
    const groupedObj = value.reduce((prev, cur) => {
      if (!prev[cur[field]]) {
        prev[cur[field]] = [cur];
      } else {
        prev[cur[field]].push(cur);
      }
      return prev;
    }, {});
    return Object.keys(groupedObj).map(key => ({ key, value: groupedObj[key] }));
  }
}
