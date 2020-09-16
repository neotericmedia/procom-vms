import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './common/services/auth.service';
import { CookieService } from './common/services/cookie.service';
import { UserInfo, UserContext } from './common/model/user';

@Injectable()
export class AppResolver implements Resolve<any> {
  loaded: boolean = false;
  skipFailRedirectPaths = [
    'home',
    'login',
    'accountforgot'
  ];

  constructor(private authService: AuthService, private cookieSvc: CookieService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, rstate: RouterStateSnapshot): Observable<any> {
    return Observable.create(observer => {
      if (this.loaded) {
        observer.next();
        observer.complete();
      } else {
        this.initApp()
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(() => {
            this.authService.loadTranslationDataByBrowserCulture().then((res) => {
              (<any>window).PhxTranslations = res;
              if (route && route.routeConfig && this.skipFailRedirectPaths.indexOf(route.routeConfig.path) === -1) {
                this.router.navigateByUrl('/');
              }
              observer.next();
              observer.complete();
            });
          });
      }
    });
  }

  initApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authService.fetchCurrentUser()
        .then((x: UserInfo) => {
          const p = x.Profiles[0];
          this.cookieSvc.putObject(this.cookieSvc.CookieStore, { profileId: p.ProfileId, dbId: p.DatabaseId });
          this.authService.loadContext()
            .then((userCntx: UserContext) => {
              this.authService.initApp(userCntx.User.CultureId)
                .then(() => {
                  this.loaded = true;
                  resolve();
                })
                .catch(() => {
                  reject();
                });
            })
            .catch(() => {
              reject();
            });
        })
        .catch(() => {
          reject();
        });
    });
  }

}
