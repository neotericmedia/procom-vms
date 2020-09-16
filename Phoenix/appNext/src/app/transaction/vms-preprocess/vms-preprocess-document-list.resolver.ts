import { Injectable, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {VmsService} from '../shared/Vms.service';

//declare var oreq: any;

@Injectable()
export class VmsPreprocessDocumentListResolver implements Resolve<any> {
    constructor( private vmsService: VmsService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        var response = Observable.fromPromise(
            this.vmsService.getVmsImportGroupedDocumentFilteredByInternalOrganizationAndClientOrganization(
                route.params.organizationIdInternal, route.params.organizationIdClient || -1, undefined)
        );
        return response.map((i:any) => {
            return i.Items;
        });
    }
}


