import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { JournalService } from './../journal.service';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'app-journal-batch',
    templateUrl: './journal-batch.component.html',
    styleUrls: ['./journal-batch.component.less']
})
export class JournalBatchComponent implements OnInit, OnDestroy {
    batchId: number;
    organizationId: number;
    dataSourceUrl: string;
    codeValueGroups: any;
    ApplicationConstants: any;
    subscription: Subscription;
    odataParams: string = `$select=Id,BatchNumber,BatchCount,ExportDate,OrganizationInternalLegalName,ShowAP,ShowAR`;
    dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'BatchNumber',
            caption: 'Batch Number',
            dataType: 'number',
            width: '150px'
        }),
        new PhxDataTableColumn({
            dataField: 'BatchCount',
            caption: 'Batch Count',
            dataType: 'number',
            width: '150px'
        }),
        new PhxDataTableColumn({
            dataField: 'ExportDate',
            caption: 'Create Date',
            dataType: 'date',
            // format: 'longDate',
            width: '150px'
        }),
        new PhxDataTableColumn({
            dataField: 'Id',
            caption: 'Action',
            cellTemplate: 'viewJournalCellTemplate',
            allowFiltering: false,
            allowSearch: false,
            allowSorting: false,
            allowExporting: false,
            allowGrouping: false,
        })
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private commonService: CommonService,
        private navigationService: NavigationService,
        private journalService: JournalService,
        private codeValueService: CodeValueService
    ) {
        this.codeValueGroups = this.commonService.CodeValueGroups;
        this.ApplicationConstants = this.commonService.ApplicationConstants;
        this.subscription = this.route.params.subscribe((params: { organizationId: number }) => {
            this.organizationId = +params.organizationId;
            this.dataSourceUrl = `journal/batches/${this.organizationId}`;
        });
    }

    ngOnInit() {
        this.navigationService.setTitle('journal-manage-org');
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    csvUrl(batchId): SafeResourceUrl {
        return this.journalService.docUrl(batchId, 'csvStreamByBatchId');
    }

    arReportUrl(batchId): SafeResourceUrl {
        return this.journalService.docUrl(batchId, 'arReportStreamByBatchId');
    }

    accpacUrl(batchId): SafeResourceUrl {
        return this.journalService.docUrl(batchId, 'accpacStreamByBatchId');
    }

    accpacARUrl(batchId): SafeResourceUrl {
        return this.journalService.docUrl(batchId, 'accpacARStreamByBatchId');
    }
}


