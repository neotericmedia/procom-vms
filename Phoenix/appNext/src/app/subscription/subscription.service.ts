import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from '../common';

@Injectable()
export class SubscriptionService {

    constructor(
        private apiService: ApiService
    ) { }

    getListUserProfileInternal(oDataParams) {
        const filter = oreq.filter('Contact/UserStatusId').eq("'1'");
        const internalDataParams = oreq.request().withExpand(['Contact']).withSelect(['Id', 'Contact/FullName']).withFilter(filter).url();
        oDataParams = oDataParams || internalDataParams;
        return Observable.fromPromise(this.apiService.query('UserProfile/getListUserProfileInternal' + (oDataParams && oDataParams !== undefined ? ('?' + oDataParams) : '')));
    }

    getListOrganizationClient(oDataParams) {
        oDataParams = oDataParams || oreq.request().
            withExpand(['OrganizationAddresses, OrganizationClientRoles']).
            withSelect(['Id', 'DisplayName', 'OrganizationAddresses/IsPrimary', 'OrganizationAddresses/SubdivisionId', 'OrganizationClientRoles/IsChargeSalesTax', 'OrganizationClientRoles/ClientSalesTaxDefaultId']).url();
        return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveClientRole?' + oDataParams));
    }

    accessSubscriptionNew(command): Observable<any> {
        return Observable.fromPromise(this.apiService.command('AccessSubscriptionNew', command));
    }

    accessSubscriptionSave(command): Observable<any> {
        return Observable.fromPromise(this.apiService.command('AccessSubscriptionSave', command));
    }

    accessSubscriptionSubmit(command): Observable<any> {
        return Observable.fromPromise(this.apiService.command('AccessSubscriptionSubmit', command));
    }

    getListOrganizationInternal(oDataParams) {
        const organizationsListInternal: Array<any> = [];
        oDataParams = oDataParams || oreq.request().withSelect(['Id', 'DisplayName', 'Code', 'IsTest']).url();
        if (this.isEmptyObject(organizationsListInternal)) {
            return Observable.fromPromise(this.apiService.query('org/getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole?' + oDataParams));
        } else {
            return null;
        }
    }

    isEmptyObject(obj) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    }
}

