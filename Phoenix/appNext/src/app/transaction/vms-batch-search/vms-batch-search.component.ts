import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { Subscription } from 'rxjs/Subscription';

import { PhxDataTableSelectionMode, PhxDataTableConfiguration, PhxDataTableStateSavingMode, PhxDataTableSummaryType, PhxConstants } from '../../common/model/index';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';

import { Http, HttpModule } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Router, ActivatedRoute } from '@angular/router';

import { WindowRefService } from '../../common/index';

declare var oreq: any;

@Component({
  selector: 'app-vms-batch-search',
  templateUrl: './vms-batch-search.component.html',
  styleUrls: ['./vms-batch-search.component.less']
})
export class VmsBatchSearchComponent implements OnInit, OnDestroy {
  goState: string;
  organizationId: any;
  vmsType: string;

  exportFileName: string;
  pageTitle: string = 'Search';
  dataSourceUrl: string = 'vms/getVmsDiscountSummary/internalOrganization';
  dataGridComponentName: string = 'OrganizationSearch';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true,
    enableExport: true,
    showOpenInNewTab: true
  });
  oDataParams: string;
  oDataParameterSelectFields: string = oreq.request().withSelect([
    'DocumentId',
    'ImportDate',
    'ClientOrganizationName',
    'FileName',
    'TotalRecords',
    'TotalOutstandingRecords',
    'UploadedBy',
    'FileStatus',
    'TotalDiscarded',

  ]).url();

  // tslint:disable-next-line:max-line-length


  columns: Array<PhxDataTableColumn> = [

    new PhxDataTableColumn({
      dataField: 'ImportDate',
      caption: 'Import Date',
      dataType: 'date',
    }),
    new PhxDataTableColumn({
      dataField: 'ClientOrganizationName',
      caption: 'Client',

    }),
    new PhxDataTableColumn({
      dataField: 'FileName',
      caption: 'File Name',

    }),
    new PhxDataTableColumn({
      dataField: 'TotalRecords',
      caption: 'Total Records',
      alignment: 'right',
      dataType: 'number'
    })
    ,
    new PhxDataTableColumn({
      dataField: 'TotalOutstandingRecords',
      caption: 'Outstanding Records',
      alignment: 'right',
      dataType: 'number'
    })
    ,
    new PhxDataTableColumn({
      dataField: 'TotalDiscarded',
      caption: 'Total Discarded',
      alignment: 'right',
      dataType: 'number'
    })
    ,
    new PhxDataTableColumn({
      dataField: 'UploadedBy',
      caption: 'Uploaded By',

    })
    ,
    new PhxDataTableColumn({
      dataField: 'FileStatus',
      caption: 'File Status',
      lookup: {
        dataSource: this.vmsDocumentStatus(),
        valueExpr: 'value',
        displayExpr: 'text'
      }
    }),
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => { this.organizationId = +params['organizationId']; });

    this.route.data
      .subscribe(d => {
        this.dataSourceUrl = d.dataSourceUrl + '/' + this.organizationId + '/document/-1' || this.dataSourceUrl;
        this.oDataParams = d.oDataParameterFilters ? this.oDataParameterSelectFields + d.oDataParameterFilters : this.oDataParameterSelectFields;
        this.dataGridComponentName = d.dataGridComponentName || this.dataGridComponentName;
        this.goState = d.goState;
        this.pageTitle = d.pageTitle || this.pageTitle;
        this.exportFileName = d.exportFileName || 'VmsDocuments';

        this.navigationService.setTitle(this.pageTitle);
      });
  }

  ngOnDestroy() {

  }

  vmsDocumentStatus() {
    return this.codeValueService.getCodeValues('etl.CodeVmsDocumentStatus', true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
  }

  onRowClick(event: any) {
    if (event) {
      const route = this.getDocRoute(event.data);
      if (route) {
        this.router.navigate([route]);
      }
    }
  }

  onContextMenuOpenTab(event) {
    const route = this.getDocRoute(event);
    if (route) {
      this.winRef.nativeWindow.open(`/#${route}`, '_blank');
    }
  }

  getDocRoute(data) {
    let url = null;
    if (data && data.OrganizationIdInternal && data.DocumentId) {
      switch (this.dataGridComponentName) {
        case 'VmsDiscountManagement':
          url = `/next/vms/discount/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
        case 'VmsCommissionManagement':
          url = `/next/vms/commission/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
        case 'VmsFixedPriceManagement':
          url = `/next/vms/fixedprice/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
        case 'VmsUnitedStatesSourceDeductionManagement':
          url = `/next/vms/ussourcededuction/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
        case 'VmsExpenseManagement':
          url = `/next/vms/expense/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
        case 'VmsTimesheetManagement':
          url = `/next/vms/timesheet/InternalOrganization/${data.OrganizationIdInternal}/document/${data.DocumentId}/details`;
          break;
      }
    }
    return url;
  }

}


