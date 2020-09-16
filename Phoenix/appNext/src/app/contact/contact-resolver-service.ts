import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService, PhxConstants, LoadingSpinnerService } from '../common';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserProfileResolver implements Resolve<any> {
  constructor(private phoenixApi: ApiService, private router: Router, private loadingSpinnerService: LoadingSpinnerService) {}

  resolve(route: ActivatedRouteSnapshot, rstate: RouterStateSnapshot): Observable<any> {
    return Observable.create(observer => {
      this.phoenixApi.query('UserProfile/' + route.params.profileId).then((response: any) => {
        const profileTypeName = Object.keys(PhxConstants.ProfileType).find(k => PhxConstants.ProfileType[k] === response.ProfileTypeId);
        this.router.navigate(['next', 'contact', response.ContactId, 'profile', profileTypeName, response.Id]);
        this.loadingSpinnerService.hideAll();
        observer.next();
        observer.complete();
      });
    });
  }
}
