import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PayrollService } from '../payroll.service';


declare var oreq: any;

@Injectable()
export class PendingPayrollRemittancesResolver implements Resolve<any> {
    constructor(private prs: PayrollService, private router: Router) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.prs.getAllWorkerCompensations().map((data) => {
            return data.Items.map((item) => {
                return {
                    text: item.Name,
                    value: item.Id
                };
            });
        });
    }
}


