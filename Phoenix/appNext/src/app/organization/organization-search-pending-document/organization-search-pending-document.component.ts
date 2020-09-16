// angular
import { Component, OnInit, Inject } from '@angular/core';
// common
import { PhxDataTableConfiguration } from './../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from './../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from './../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from './../../common/model/data-table/phx-data-table-summary-type';

import { StateService } from './../../common/state/service/state.service';
import { CodeValueService } from './../../common/services/code-value.service';
import { CodeValue } from './../../common/model/code-value';
import { NavigationService } from './../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
declare var oreq: any;

@Component({
  selector: 'app-organization-search-pending-document',
  templateUrl: './organization-search-pending-document.component.html',
  styleUrls: ['./organization-search-pending-document.component.css']
})
export class OrganizationSearchPendingDocumentComponent implements OnInit {
  organizations: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  page: string = 'search';
  dataSourceUrl: string = 'org/getOrganizationWithDocumentCountList';
  dataGridComponentName: string = 'OrganizationSearchPendingDocuments';
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });

  oDataParams: any;
  private requestCols: any[] = [
    'Id',
    'DisplayName',
    'Code',
    'LegalName',
    'IsOrganizationClientRole',
    'IsOrganizationIndependentContractorRole',
    'IsOrganizationLimitedLiabilityCompanyRole',
    'IsOrganizationInternalRole',
    'IsOrganizationSubVendorRole',
    'IsDraft',
    'OrganizationStatusId',
    'PendingComplianceDocumentCount'
  ];
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      fixed: true,
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'DisplayName',
      caption: 'DISPLAY NAME',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'Code',
      caption: 'ORG CODE',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'LegalName',
      caption: 'LEGAL NAME',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'Roles',
      caption: 'ROLES',
      alignment: 'center',
      cellTemplate: 'orgRolesTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    }),
    new PhxDataTableColumn({
      dataField: 'OrganizationStatusId',
      caption: 'STATUS',
      alignment: 'center',
      dataType: 'number',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
      cellTemplate: 'orgStatusTemplate'
    }),
    new PhxDataTableColumn({
      dataField: 'PendingComplianceDocumentCount',
      caption: 'Documents Pending Review',
      alignment: 'center',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'Action',
      caption: 'ACTION',
      alignment: 'center',
      cellTemplate: 'viewOrganizationDetailTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false
    })
  ];

  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'Title',
      summaryType: PhxDataTableSummaryType.Count
    }),
    new PhxDataTableSummaryItem({
      column: 'Total',
      summaryType: PhxDataTableSummaryType.Sum,
      displayFormat: 'Total: {0}',
      valueFormat: this.totalColumnFormat
    })
  ];

  constructor(
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private commonService: CommonService
  ) {
    this.oDataParams = oreq
      .request()
      .withSelect(this.requestCols)
      .withFilter(oreq.filter('OrganizationStatusId').eq(this.commonService.ApplicationConstants.OrganizationStatus.PendingReview))
      .url();
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewOrganizationDetail(event.data);
    } else {
      console.error("Selection collection 'event.data' does not exist or is missing Id property for navigation: ", event);
    }
  }
  viewOrganizationDetail(rowdata) {
    // fix me
    //this.$state.go('org.edit.details', { organizationId: rowdata.Id });
  }

  createOrg() {
    // fix me
    //this.$state.go('org.create');
  }

  getStatusLookup() {
    return this.codeValueService
      .getCodeValues('org.CodeOrganizationStatus', true)
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
          text: codeValue.code,
          value: codeValue.id
        };
      });
  }

  ngOnInit() {
    this.navigationService.setTitle('Organization Pending Documents Search', ['icon icon-organization']);
  }
}
