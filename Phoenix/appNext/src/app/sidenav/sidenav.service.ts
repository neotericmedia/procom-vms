import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../common';
import { AuthService } from '../common/services/auth.service';
import { Subject } from 'rxjs/Subject';
import { UserProfileNavigationHistory } from './model';

@Injectable()
export class SidenavService {
  constructor(private apiService: ApiService, private authService: AuthService) {
    this.authService.subscribeProfileChanges(() => this.updateNavigationData());
  }

  private navigation$: Subject<any> = new Subject();

  getNavigationData(): Observable<any> {
    this.updateNavigationData();
    return this.navigation$.asObservable();
  }

  async updateNavigationData() {
    try {
      const httpResponse = await this.apiService.query('Navigation');
      this.navigation$.next(httpResponse);
    } catch (error) { }
  }

  public saveUserProfileNavigationHistory(navigationId: number, userProfileId: number) {
    return this.apiService.command('UserProfileNavigationHistorySave', {
      UserProfileId: userProfileId,
      NavigationId: navigationId
    }, false);
  }

  public async getUserProfileNavigationHistoryLastNavigationId(userProfileId: number): Promise<UserProfileNavigationHistory> {
    return this.apiService.query<UserProfileNavigationHistory>('UserProfile/getUserProfileNavigationHistoryLastItemByUserProfileId/' + userProfileId, false);
  }
}
