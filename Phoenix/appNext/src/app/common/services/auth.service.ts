import { Subject, Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RequestHeaders } from './../model/request-headers';
import { UserProfile, UserContext, UserInfo, UserProfilePerDbInstance, BasicUserProfile, User } from './../model/user';
import { CommandResponse } from './../model/command-response';

import { LoadingSpinnerService } from './../loading-spinner/service/loading-spinner.service';
import { CookieService } from './cookie.service';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { SignalrService } from './signalr.service';
import { EventService } from './event.service';
import { PhxLocalizationService } from './phx-localization.service';

declare var $;
declare var window;

@Injectable()
export class AuthService implements OnDestroy {
  public userInfo: UserInfo;
  public currentProfile: UserProfile;
  public currentDbProfile: UserProfilePerDbInstance;

  private apiEndPoint;
  private userContext: UserContext;
  private currentUser: UserInfo;
  rawApiEndPoint: string; // used for /token url

  private broadcastEventLogoutSubscription: Subscription;
  private currentProfileSubject: Subject<any> = new Subject();

  constructor(
    private loadingSpinnerService: LoadingSpinnerService,
    private http: HttpClient,
    private cookieSvc: CookieService,
    private apiSvc: ApiService,
    private signalrSvc: SignalrService,
    private eventSvc: EventService,
    private localizationService: PhxLocalizationService
  ) {
    const self = this;
    this.broadcastEventLogoutSubscription = this.eventSvc.subscribe('broadcastEvent:logout', () => {
      self.userInfo = null;
      self.currentProfile = null;
    });

    this.apiEndPoint = environment.apiUrl + 'api';
    this.rawApiEndPoint = environment.apiUrl.replace(/\/$/, '');
    this.loadContext();
  }

  ngOnDestroy(): void {
    this.broadcastEventLogoutSubscription.unsubscribe();
  }

  public subscribeProfileChanges(next?: () => void): Subscription {
    return this.currentProfileSubject.subscribe(next);
  }

  public getCurrentUser(): Observable<UserInfo> {
    return Observable.fromPromise(
      this.fetchCurrentUser()
    );
  }

  public getCurrentProfile(): Observable<UserProfile> {
    return Observable.fromPromise(
      this.fetchCurrentProfile()
    );
  }

  public getRequestHeaderValues(): RequestHeaders {
    return {
      'PhoenixValues': this.currentProfile.Id,
      'Authorization': 'Bearer ' + this.cookieSvc.getItem('BearerToken')
    };
  }

  public getRequestDefaultHeader() {
    return {
        headers: {
            // 'PhoenixValues': this.currentProfile.Id,
            'Authorization': 'Bearer ' + this.cookieSvc.getItem('BearerToken')
        }
    };
  }

  public getUserContext(): Promise<UserContext> {
    return new Promise((resolve, reject) => {
      this.loadContext()
        .then((response: UserContext) => {
          resolve(response);
        }).catch((err) => {
          if (err) {
            console.error(`error getting user context`, err);
          } else {
            console.error(`error getting user context`);
          }
          reject(err);
        });
    });
  }

  public changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    const options = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Authorization': 'Bearer ' + this.cookieSvc.getItem('BearerToken')
      })
    };
    const data = { oldPassword: oldPassword, newPassword: newPassword, confirmPassword: confirmPassword };
    return this.http.post(this.apiEndPoint + '/account/ChangePassword', data, options).toPromise();
  }

  public forgotPassword(email): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
    };
    return this.http.post(this.apiEndPoint + '/account/ForgotPassword', { Email: email }, options );
  }

  resetPassword(model) {
    const options = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
    };
    return this.http.post(this.apiEndPoint + '/account/ResetPassword', model, options).toPromise();
  }

  public setCurrentProfile(databaseId: number, profileId: number, urlRedirect: string = null): Promise<UserContext> {
    this.loadingSpinnerService.show();
    return new Promise((resolve, reject) =>
      this.setBearerTokenByProfileId(databaseId, profileId)
        .then((profile: BasicUserProfile) => {
          this.currentProfileSubject.next({DatabaseId: databaseId, ProfileId: profileId});
          this.loadingSpinnerService.hide();

          // refresh page or update the Code Array should be in caller
          // if (urlRedirect != null) {
          //   window.location.href = urlRedirect;
          // }
          // location.reload();
          this.loadContext().then((userContext: UserContext) => {
            resolve(userContext);
          });
        })
        .catch(error => {
          this.loadingSpinnerService.hideAll();
          console.log('Failed to set profile!', { databaseId, profileId });
          reject(error);
        })
    );
  }

  public hasInit(): boolean {
    return !!this.cookieSvc.hasItem('BearerToken');
  }

  public hasFunctionalOperation(functionalOperation: number): boolean {
    return this.currentProfile && this.currentProfile.FunctionalOperations && this.currentProfile.FunctionalOperations.includes(functionalOperation);
  }

  public loadContext(): Promise<UserContext> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.apiSvc.query('security/context').then((rsp: any) => {
        if (rsp.Items && rsp.Items.length > 0) {
          self.userContext = rsp.Items[0];
          self.currentProfile = self.pickProfile(self.userContext);
          // fix me
          // setup header and connect
          $.ajaxSetup(self.getRequestDefaultHeader());
          self.signalrSvc.connect();
          resolve(self.userContext);
        } else {
          reject();
        }
      },
        err => {
          reject();
        });
    });
  }


  public fetchCurrentUser(): Promise<UserInfo> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (!self.hasInit()) {
        reject();
      }

      if (self.currentUser) {
        resolve(self.currentUser);
      }

      const options = {
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Authorization': 'Bearer ' + this.cookieSvc.getItem('BearerToken')
        })
      };

      self.http.get(this.apiEndPoint + '/account/UserInfo', options).subscribe(
        (response: UserInfo) => {
          self.currentUser = response;
          self.userInfo = self.currentUser;

          if (!self.currentUser) {
            reject('User not valid');
          } else {
            resolve(self.currentUser);
          }
        },
        err => {
          self.currentUser = null;
          reject(err);
        }
      );
    });

  }

  private fetchCurrentProfile(): Promise<UserProfile> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (!self.currentProfile || !self.currentProfile.Id || self.currentProfile.Id <= 0) {
        self.loadContext()
          .then((rsp: UserContext) => {
            resolve(self.currentProfile);
          }, function (err) {
            reject();
          });
      } else {
        resolve(self.currentProfile);
      }
    });
  }


  private pickProfile(context: UserContext) {
    const user: User = context ? context.User : null;
    const userProfiles: UserProfile[] = user ? user.UserProfiles : null;
    const len = userProfiles ? userProfiles.length : 0;

    if (len) {
      let result;
      const profileIdObject: any = this.cookieSvc.getProfileIdFromCookie();

      for (let i = len - 1; i >= 0; i--) {
        if ((userProfiles[i].Id === profileIdObject.profileId || userProfiles[i].Id === profileIdObject.profileId) &&
            (!userProfiles[i].DatabaseId || userProfiles[i].DatabaseId === profileIdObject.dbId)) {
          result = userProfiles[i];
          break;
        }

        if (userProfiles[i].IsPrimary) {
          result = userProfiles[i];
        } else {
          if (!result || result.Id <= 0) {
            result = userProfiles[i];
          }
        }
      }

      // setBearerTokenByProfileId(result.Id || -1);
      return Object.assign(result, { DatabaseId: profileIdObject.dbId }) || {};
    }

    return {};
  }

  private setBearerTokenByProfileId(dbId, profileId): Promise<BasicUserProfile> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.cookieSvc.putObject(self.cookieSvc.CookieStore, { profileId: profileId, dbId: dbId });
      const url = self.apiEndPoint + '/account/SwitchProfile/' + dbId + '/' + profileId;
      const options = {
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Authorization': 'Bearer ' + self.cookieSvc.getItem('BearerToken')
        })
      };
      self.http.post(url, {}, options).subscribe((data: BasicUserProfile) => {
        // TODO: fix this
        const access_token = data && data.token;
        if (!access_token) {
            throw new Error('Invalid token!');
        }
        self.cookieSvc.setItem('BearerToken', access_token, null, '/');
        self.cookieSvc.setItem('BearerIdentity', data ? JSON.stringify({
          userName: data.userName,
          profileId: data.profileId,
          databaseId: data.databaseId,
          email: data.email
        }) : '', null, '/');

        // const userContext: UserContext = {
        //   IsLoggedIn: true,
        //   User: self.currentUser
        // };
        // self.currentProfile = self.pickProfile(userContext);
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  // For localhost, url is http://localhost:52474/token
  // For dev2, url is http://dev2.xx.xx/api/token
  login(username, password): Promise<any> {
    const self = this;
    const data = 'grant_type=password&username=' + username + '&password=' + password;
    const url = this.rawApiEndPoint + '/token';
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      withCredentials: true
    };

    return new Promise((resolve, reject) => {
      self.http.post(url, data, options).subscribe((res: any) => {
        // TODO: fix this
        const access_token = res && res.access_token;
        if (!access_token) {
          reject(new Error('Invalid token!'));
          return;
        }
        self.cookieSvc.setItem('BearerToken', access_token, null, '/');
        // connect to signalR
        self.signalrSvc.connect();
        $.ajaxSetup(self.getRequestDefaultHeader());
        // return response;
        resolve();
      }, err => {
        reject(err);
      });
    });
  }

  logout(dispatch: boolean = true) {
    this.signalrSvc.disconnect();

    document.cookie = 'BearerToken=; path=/; expires=' + new Date(0).toUTCString();
    document.cookie = 'BearerIdentity=; path=/; expires=' + new Date(0).toUTCString();
    localStorage.removeItem('phoenixtoken');

    this.currentUser = null;
    if(dispatch){
      this.eventSvc.trigger('broadcastEvent:logout');
    }
  }

  public refreshCodeValues(): Promise<any> {

    return this.apiSvc.query('code').then(
      function (responseSuccess: any) {
        (<any>window).PhoenixCodeValues = responseSuccess.Items;
      },
      function (responseError) {
        // fix me
        // onErrorResponse(responseError, 'Failed to refresh CodeValues.');
      }
    );
  }

  public validateRegistrationToken(et: any): Promise<any> {
    const self = this;
    const data = '=' + et;
    const url = this.apiEndPoint + '/account/ValidateExternalToken';
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    return new Promise((resolve, reject) => {
      self.http.post(url, data, options).subscribe((res: any) => {
        resolve(res);
      }, error => {
        reject(error);
      });
    });
  }

  public register(username, password, confirmPassword, cultureId, et) {
    const self = this;
    const data = {
      UserName: username,
      Password: password,
      ConfirmPassword: confirmPassword,
      CultureId: cultureId,
      RegistrationToken: et,
    };
    const url = this.apiEndPoint + '/Account/Register';
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'PhoenixCultureId': cultureId,
      })
    };

    return new Promise((resolve, reject) => {
      self.http.post(url, data, options).subscribe((res: any) => {
        resolve(res);
      }, error => {
        reject(error);
      });
    });
  }


  initApp(cultureId: number) {
    const self = this;
    const lang = self.localizationService.getLangFromCultureId(cultureId);
    self.localizationService.setLocale(lang);

    return Promise.all([
      this.apiSvc.query('pagetitle').then((rsp: any) => {
        window.PhoenixPageTitles = rsp.Items;
        return rsp;
      }),
      this.apiSvc.query('code').then((rsp: any) => {
        window.PhoenixCodeValues = rsp.Items;
        return rsp;
      }),
      this.apiSvc.query('Navigation').then((rsp: any) => {
        window.navigation = { 'Navigation': rsp.NavigationItems };
        // return {'Navigation': rsp.NavigationItems };
      }),
      this.apiSvc.query(`localization/full/${lang}`).then((rsp: any) => {
        window.PhxTranslations = rsp;
        return rsp;
      }),
      this.apiSvc.query('state/getPreferredEntityStatus').then((rsp: any) => {
        window.PhxPreferredEntityStatus = rsp.Items;
        return rsp;
      })
    ]).then(function (responseArr) {
      // $rootScope.$emit('APP_INIT', true);
      console.log(responseArr);

      // return auth.setCurrentProfile(1);
    }).catch(function (e) {
      console.log(e);
      self.logout();
      // $state.go('account');
    });
    // , function (e) {
    //     this.logout();
    //     return $q.all([
    //         this.query('localization/'
    //             + (window.navigator['languages'] ? window.navigator['languages'][0] : (window.navigator.language || window.navigator['userLanguage']))
    //         ).then(function (response) {
    //             window.PhxTranslations = response;
    //             resolve({ isLoggedIn: false });
    //         })
    //     ]).then(function () {
    //         // $state.go('account');
    //     });
    // });
  }



  loadTranslationDataByBrowserCulture(): Promise<any> {
    const culture = window.navigator['languages'] ? window.navigator['languages'][0] : (window.navigator.language || window.navigator['userLanguage']);
    return this.apiSvc.query('localization/full/' + culture);
  }


}
