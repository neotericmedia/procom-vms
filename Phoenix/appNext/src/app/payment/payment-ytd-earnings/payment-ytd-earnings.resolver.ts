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
import { PhxConstants } from '../../common/model/phx-constants';
import { CodeValueService } from '../../common';
import { CommonService } from '../../common/services/common.service';

declare var oreq: any;


@Injectable()
export class PaymentYtdEarningsResolver implements Resolve<any> {

    constructor(
        private orgService: OrganizationApiService,
        private router: Router,
        private codeValueService: CodeValueService,
        private commonService: CommonService ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const filter = oreq.filter('ProfileStatusId')
                           .eq(PhxConstants.ProfileStatus.Active)
                           .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingChange)
                           .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.InActive)
                           .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingInactive)
                           .or().filter('ProfileStatusId').eq(PhxConstants.ProfileStatus.PendingActive);
       
        const oDataParams = oreq.request()
            .withExpand(['Contact', 'UserProfileAddresses'])
            .withSelect(['Id',
                         'ContactId',
                         'PrimaryEmail',
                         'ProfileStatusId',
                         'ProfileTypeId',
                         'Contact/FirstName',
                         'Contact/LastName',
                         'Contact/FullName'])
            .withFilter(filter)
            .url();

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
            this.orgService.getListUserProfileWorker(oDataParams)
                .map((data) => {
                    return data.Items.map((item) => {
                        item.FirstName = item.Contact.FirstName;
                        item.LastName = item.Contact.LastName;
                        item.WorkerProfileTextField = item.ContactId + ' - ' +
                                                      item.Contact.FullName + ' - ' +
                                                      item.PrimaryEmail + ' - ' +
                                                      this.codeValueService.getCodeValueText(item.ProfileTypeId, this.commonService.CodeValueGroups.ProfileType);
                        return item;
                    });
                })
        ])
        .map((data: any[]) => {
            return { internalOrgs: data[0], workerProfiles: data[1]};
        });
    }
}
