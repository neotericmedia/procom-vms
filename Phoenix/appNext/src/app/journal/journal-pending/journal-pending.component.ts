import { Component, OnInit, OnDestroy } from '@angular/core';
import { PendingJournalEntity } from './journal-pending-entity';
import { JournalService } from './../journal.service';
import { chain, filter, forEach, find } from 'lodash';
import { CommonService, ApiService, NavigationService } from '../../common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-journal-pending',
  templateUrl: './journal-pending.component.html',
  styleUrls: ['./journal-pending.component.less']
})

export class JournalPendingComponent implements OnInit, OnDestroy {

  companies: Array<PendingJournalEntity>;
  oDataParams: string = '$select=OrganizationInternalLegalName,OrganizationIdInternal,AvailableForExport,TotalCount&$filter=BatchId eq null&$OrderBy=OrganizationIdInternal';
  companyCount: number = -1;
  organizationIdInternal: number;
  unregisterFunctionList: any[] = [];

  constructor(private journalService: JournalService,
    private commonService: CommonService,
    private apiService: ApiService,
    private navigationService: NavigationService,
    private router: Router) {

  }

  ngOnInit() {
    this.navigationService.setTitle('journal-pending');
    this.getPendingJournals();
  }

  getPendingJournals() {
    this.journalService.getJournalOrgsGrouped(this.oDataParams).then((response: any) => {
      if (response && response.Items) {
        this.companies = chain(response.Items).groupBy('OrganizationInternalLegalName').map((value, key) => {
          const filteredDataAvailableForExport = filter(value, (i: any) => {
            return i.AvailableForExport;
          });

          const totalCount: number = filteredDataAvailableForExport.reduce((a, b) => +a + +b.TotalCount, 0);

          return { Name: key, Count: totalCount, Id: value[0].OrganizationIdInternal, IsOpen: false };
        }).value();

        this.companies.sort((a, b) => a.Name.toLowerCase() > b.Name.toLowerCase() ? 1 : -1);
        this.companyCount = this.companies.length;

        if (this.companies.length > 0) {
          this.companies[0].IsOpen = true;
        }
      }
    });
  }

  exportLine(company: PendingJournalEntity) {
    const isOpen = company.IsOpen;
    forEach(this.companies, (c) => {
      c.IsOpen = false;
    });
    company.IsOpen = !isOpen;
  }

  generateFinancialBatch(id: number) {
    const hasExportableTransactions = find(this.companies, (company) => {
      return company.Id === id;
    }).Count > 0;

    if (hasExportableTransactions) {
      this.organizationIdInternal = id;
      const command = {
        organizationIdInternal: id,
        dateOffset: new Date().getTimezoneOffset()
      };
      this.journalService.generateFinancialBatch(command).then((response) => {
        this.commonService.logSuccess('Journal batch created successfully');
        this.router.navigate(['/next', 'journal', 'batches', 'organization', this.organizationIdInternal]);
      }
      );
    } else {
      this.commonService.logWarning('There are no remaining transactions for the current application month');
    }
  }

  ngOnDestroy() {
    if (this.unregisterFunctionList && this.unregisterFunctionList.length) {
      for (const func of this.unregisterFunctionList) {
        if (typeof func === 'function') {
          func();
        }
      }
    }
  }

}
