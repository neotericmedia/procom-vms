import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { OrganizationApiService } from './../../organization/organization.api.service';


declare var oreq: any;

@Injectable()
export class WorkOrderSearchResolver implements Resolve<any> {
    constructor(private orgService: OrganizationApiService, private router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const oDataParams = oreq.request().withExpand(['Contact']).withSelect(['Id', 'ContactId', 'ProfileTypeId', 'OrganizationId', 'Contact/Id', 'Contact/FullName', 'Contact/FirstName', 'Contact/LastName']).url();

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
            this.orgService.getListUserProfileWorker(oDataParams).map((data) => {
                return data.Items
                    .filter(item => item.Contact && item.Contact.FullName && item.Contact.FullName.trim().length > 0)
                    .map((item) => {
                        return {
                            text: (item.Contact.LastName + ', ' + item.Contact.FirstName) || '',
                            value: item.Id
                        };
                    });
            })
        ])
            .map((data: any[]) => {
                return { organizations: data[0], workers: data[1] };
            });
    }
}
