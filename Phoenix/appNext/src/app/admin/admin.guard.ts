import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../common/services/auth.service';
import { first } from 'rxjs/operators/first';
import { map } from 'rxjs/operators/map';
import { UserProfile, PhxConstants } from '../common/model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService
      .getCurrentProfile()
      .pipe(
        first(),
        map((profile: UserProfile) => profile && profile.FunctionalRoles && profile.FunctionalRoles.some(role => role.FunctionalRoleId === PhxConstants.FunctionalRole.SystemAdministrator))
      )
      .catch(() => Observable.of(false));
  }
}
