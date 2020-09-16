import { AuthService } from './../common/services/auth.service';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponentOnDestroy } from '../common/state/epics/base-component-on-destroy';
import { combineLatest, take, takeUntil } from 'rxjs/operators';

import { UserProfile } from '../common/model';
import { SidenavService } from './sidenav.service';
import { NavigationMenuItem, UserProfileNavigationHistory, Navigation } from './model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent extends BaseComponentOnDestroy implements OnInit {
  currentProfile: UserProfile;
  navigation: Navigation;
  mobileExpanded = false;
  userProfileNavigationHistory: UserProfileNavigationHistory = {
    CreatedDateTime: null,
    Id: null,
    NavigationId: null,
    UserProfileId: null
  };

  constructor(private authService: AuthService, private sidenavService: SidenavService, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.sidenavService.getNavigationData().takeUntil(this.isDestroyed$).subscribe((data: Navigation) => this.checkSideNav(data));

    this.authService.getCurrentUser()
      .pipe(
        take(1),
        combineLatest(this.authService.getCurrentProfile().take(1)),
        takeUntil(this.isDestroyed$)
      ).subscribe(item => {
        this.currentProfile = item[1];
        this.getuserProfileNavigationHistory();
      });
  }

  async getuserProfileNavigationHistory() {
    this.userProfileNavigationHistory = await this.sidenavService.getUserProfileNavigationHistoryLastNavigationId(this.currentProfile.Id);
    this.checkSideNav(this.navigation);
  }

  accordionGroupOpenChange(event, navItem) {
    if (event) {
      this.sidenavService.saveUserProfileNavigationHistory(navItem.Id, this.currentProfile.Id);
    }
  }

  getUrl(child) {
    if (child && child.State) {
      const s = child.State.replace('ngtwo.m(', '').replace(')', '');
      if (s.indexOf('{') !== -1) {
        return JSON.parse(s).p;
      } else {
        // map angularJs Url temporarily
        if (s === 'compliancedocument.ruleareatype.search') {
          return 'document/ruleareatype/search';
        } else if (s === 'vms.management') {
          return 'transaction/vms/management';
        } else if (s === 'vms.batch.management') {
          return 'transaction/vms/batch/management';
        } else if (s === 'payment.pending') {
          return 'payment/pending';
        } else if (s === 'payment.directdepositbatch.search') {
          return 'payment/directdepositbatch/search';
        } else if (s === 'payment.wiretransferbatch.search') {
          return 'payment/wiretransferbatch/search';
        } else if (s === 'WizardInternalProfile') {
          return 'contact/wizardinternalprofile';
        } else if (s === 'WizardOrganizationalProfile') {
          return 'contact/wizardorganizationalprofile';
        } else if (s === 'WizardCreateWorkerProfile') {
          return 'contact/wizardworkerprofile';
        } else {
          return s;
        }
      }
    } else {
      return child.State;
    }
  }

  /**
   * Toggles collapsibles in the side nav menu
   * This is called from both top level and sub menu item
   * @param navItem The menu item that user clicked on
   */
  toggleCollapsed(navItem: NavigationMenuItem) {
    // check whether user clicked on the same menu item of a differnt one
    if (this.userProfileNavigationHistory.NavigationId !== navItem.Id) {
      // close the previously open menu item
      this.closeOpenCollapsible();
      // set the NavigationId to current open menu item
      this.userProfileNavigationHistory.NavigationId = navItem.Id;
      // update UI
      this.checkSideNav(this.navigation);
      // save menu selection history
      this.sidenavService.saveUserProfileNavigationHistory(navItem.Id, this.currentProfile.Id);
    } else {
      // toggle the IsOpen property as user clicked on the same menu item
      navItem.IsOpen = !navItem.IsOpen;
      // update UI
      this.cdr.detectChanges();
      // save menu selection history.
      // If the item is open, use its own id as the navigated id, if the current item is closed, use its parent's id as the navigated id
      // current item being closed means that the parent is the active navigated menu item
      this.sidenavService.saveUserProfileNavigationHistory(!navItem.IsOpen ? navItem.ParentId : navItem.Id, this.currentProfile.Id);
    }
  }

  /**
   * Click handler for a tags in side nav
   * Sets user profile navigation history
   * @param id id of the menu item clicked
   */
  onSideNavLinkClick(id: number) {
    this.toggleMobileExpand(false);
    this.sidenavService.saveUserProfileNavigationHistory(id, this.currentProfile.Id);
  }

  toggleMobileExpand(value?: boolean) {
    this.mobileExpanded = typeof value !== 'undefined' ? value : !this.mobileExpanded;
  }

  /**
   * Updates sidenav data and check which menu item is open
   * @param data array of menu items
   */
  checkSideNav(data: Navigation) {
    if (data && data.NavigationItems) {
      data.NavigationItems.forEach((element: NavigationMenuItem) => {
        this.isCollapsibleOpen(element);
      });
      this.navigation = data;
      this.cdr.detectChanges();
    }
  }

  /**
   * Checks whether a given menu item is open by comparing with user's last navigation id
   * Does a deep lookup of menu item till a child is found that should be open, then sets IsOpen propery all the way up the hierarchy
   * @param navigationItem given menu item
   */
  isCollapsibleOpen(navigationItem: NavigationMenuItem) {
    if (navigationItem && navigationItem.Id === this.userProfileNavigationHistory.NavigationId) {
      navigationItem.IsOpen = true;
      return true;
    }

    if (navigationItem.HasChildren) {
      for (const navItem of navigationItem.Children) {
        if (this.isCollapsibleOpen(navItem)) {
          navigationItem.IsOpen = true;
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Finds and closes the currently active menu item
   */
  closeOpenCollapsible(navigationItems = this.navigation.NavigationItems) {
    for (const navItem of navigationItems) {
      if (navItem.Id === this.userProfileNavigationHistory.NavigationId) {
        navItem.IsOpen = false;
        return true;
      } else if (navItem.HasChildren && navItem.Children && navItem.Children.length > 0) {
        if (this.closeOpenCollapsible(navItem.Children)) {
          return true;
        }
      }
    }
    return false;
  }
}
