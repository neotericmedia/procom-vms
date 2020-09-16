import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { OrganizationApiService } from './../../organization/organization.api.service';
import { WorkorderService } from '../../workorder/workorder.service';
declare var oreq: any;


@Injectable()
export class CommissionBranchSummaryResolver implements Resolve<any> {
    constructor(
        private orgService: OrganizationApiService,
        private workorderService: WorkorderService, private router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return Observable.forkJoin([
            this.orgService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
                .map((data) => {
                    return data.Items.map((item) => {
                        return {
                            text: item.DisplayName,
                            value: item.Id
                        };
                    });
                }),
            this.workorderService.getBranchList().map((data) => {
                return data.Items
                    .map((item) => {
                        return {
                            text: item.Name,
                            value: item.Id
                        };
                    });
            })
        ])
        .map((data: any[]) => {
            return { organizations: data[0], branches: data[1] };
        });
    }
}
