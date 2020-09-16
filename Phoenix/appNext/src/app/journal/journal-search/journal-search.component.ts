// import * as Rx from 'rxjs/Rx';
// import { Observable } from 'rxjs/Observable';
// import { Subscription } from 'rxjs/Subscription';
// import 'rxjs/add/operator/groupBy';
// Rx.Observable.fromPromise(this.companies$).groupBy...;

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NavigationService } from './../../common/services/navigation.service';
import { JournalEntity } from './journal-entity';
import { JournalService } from './../journal.service';
import { AuthService } from './../../common/services/auth.service';
import { UserProfile, EntityList } from '../../common/model/index';

@Component({
    selector: 'app-journal-search',
    templateUrl: './journal-search.component.html',
    styleUrls: ['./journal-search.component.less']
})
export class JournalSearchComponent implements OnInit, OnDestroy {

    companies$: Promise<EntityList<any>>;
    companies: Array<JournalEntity>;
    oDataParams: string = '$select=OrganizationInternalLegalName,OrganizationIdInternal,TotalCount&$filter=BatchId ne null&$OrderBy=OrganizationIdInternal';
    currentUserProfile: UserProfile;
    constructor(
        private journalService: JournalService,
        private navigationService: NavigationService,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
    ) {
        this.authService.getCurrentProfile()
            .subscribe(userProfile => {
                this.currentUserProfile = userProfile;
            });
    }

    ngOnInit() {
        this.navigationService.setTitle('journal-manage');
        this.companies$ = this.journalService.getJournalOrgsGrouped(this.oDataParams);
        this.companies$.then(resp => this.extractData(resp));
    }

    ngOnDestroy() { }

    extractData = (response: EntityList<any>) => {

        this.companies = new Array<JournalEntity>();

        let result = new Array<JournalEntity>();

        if (response && response.Items) {

            const groups = this.groupBy(response.Items, 'OrganizationInternalLegalName');

            Object.keys(groups).forEach((key) => {
                const values = groups[key];
                const companyName = key;
                const companyId = values[0].OrganizationIdInternal;
                // const totalCount: number = values.reduce((a, b) => +a + +b.TotalCount, 0);
                result.push({ OrganizationIdInternal: companyId, OrganizationLegalName: companyName, RecordCount: values.length });
            });
            result = result.sort((a, b) => {
                // tslint:disable-next-line:triple-equals
                if (a.OrganizationIdInternal == this.currentUserProfile.OrganizationId && b.OrganizationIdInternal != this.currentUserProfile.OrganizationId) {
                    return -1;
                    // tslint:disable-next-line:triple-equals
                } else if (a.OrganizationIdInternal != this.currentUserProfile.OrganizationId && b.OrganizationIdInternal == this.currentUserProfile.OrganizationId) {
                    return 1;
                } else {
                    return a.OrganizationLegalName < b.OrganizationLegalName ? -1 : b.OrganizationLegalName < a.OrganizationLegalName ? 1 : 0;
                }
            });
        }

        this.companies = result.slice();
    }

    onSelect(company: JournalEntity) {
        this.router.navigate(['../batches/organization/' + company.OrganizationIdInternal], { relativeTo: this.route });
    }

    groupBy = (items, key) => items.reduce((acc, obj) => Object.assign(acc, {}, {
        [obj[key]]: (acc[obj[key]] || []).concat(obj)
    }), {})

}

