import { CommissionService } from './../commission.service';
import { Injectable } from '@angular/core';
import {
    Router,
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { OrganizationApiService } from './../../organization/organization.api.service';

declare var oreq: any;


@Injectable()
export class CommissionReportResolver implements Resolve<any> {
    constructor(
        private orgService: OrganizationApiService,
        private commissionService: CommissionService,
        private router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const commissionPatternDataParams = oreq.request().withSelect(['CommissionUserProfileId', 'CommissionUserProfileFirstName', 'CommissionUserProfileLastName']).url();
        return Observable.forkJoin([
            this.orgService.getListOrganizationInternal(),
            this.commissionService.getCommissionUserProfileListWithRatesOnly(commissionPatternDataParams)
                .map((data) => {
                    return  data.Items.map(item => {
                        item.displayName = item.CommissionUserProfileLastName + ', ' + item.CommissionUserProfileFirstName;
                        return item;
                      });
                })
        ])
            .map((data: any[]) => {
                return { internalOrgs: data[0], commissionUserProfiles: data[1] };
            });
    }
}
