import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { InvoiceService } from './invoice.service';

@Injectable()
export class InvoiceClientRelatedRolesRouteGuard implements CanActivate {
  constructor(private invoiceService: InvoiceService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.invoiceService.isCurrentUserHasClientRelatedRoles().map((isCurrentUserHasClientRelatedRoles) => !isCurrentUserHasClientRelatedRoles);
  }
}
