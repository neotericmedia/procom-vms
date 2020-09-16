import { Component, OnInit } from '@angular/core';
import { PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType } from '../../common/model/index';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { NavigationService } from '../../common/services/navigation.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { Router } from '@angular/router';
import { CommonService } from '../../common';

declare var oreq: any;

@Component({
  templateUrl: './pending-document-search.component.html',
})
export class PendingDocumentSearchComponent implements OnInit {
  oDataParams: any;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  dataTableConfiguration = new PhxDataTableConfiguration({ showFilter: true });

  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'ContactId',
      caption: 'ID',
      fixed: true,
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'FirstName',
      caption: 'FIRST NAME',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'LastName',
      caption: 'LAST NAME',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'OrganizationNames',
      caption: 'ORGANIZATION',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'ProfileTypes',
      caption: 'PROFILE TYPE',
      dataType: 'string',
      lookup: {
        dataSource: this.getProfileLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
      // cellTemplate: 'commaDelimitedLookupCellTemplate',
      filterOperations: ['contains', 'notcontains'],
      selectedFilterOperation: 'contains',
      hidingPriority: undefined,
    }),
    new PhxDataTableColumn({
      dataField: 'Emails',
      caption: 'EMAIL',
      alignment: 'center',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'UserStatus',
      caption: 'STATUS',
      alignment: 'center',
      lookup: {
        dataSource: this.getStatusLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'PendingComplianceDocumentCount',
      caption: 'DOCUMENTS',
      alignment: 'right',
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'Action',
      caption: 'ACTION',
      alignment: 'center',
      cellTemplate: 'viewContactDetailTemplate',
      allowFiltering: false,
      allowSearch: false,
      allowSorting: false,
      allowExporting: false,
      allowGrouping: false,
    }),
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
    private router: Router,
    private commonService: CommonService,
  ) {
  }

  ngOnInit() {
    this.navigationService.setTitle('Search for People with Documents pending review', 'icon icon-contact');
    const predicate = {
      UserStatusId: ['6'],
    };
    this.oDataParams = oreq.request()
      .withFilter(oreq.filter().smartTableObjectConverter(predicate))
      .withSelect([
        'ContactId',
        'FirstName',
        'LastName',
        'OrganizationNames',
        'UserProfileTypeId',
        'ProfileTypes',
        'Emails',
        'UserStatus',
        'UserProfileId',
        'ChildContactId',
        'ChildProfileId',
        'PendingComplianceDocumentCount',
      ])
      .url();
  }

  getProfileLookup() {
    return this.codeValueService.getCodeValues('usr.CodeProfileType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          value: codeValue.id,
          text: codeValue.text,
        };
      });
  }

  getStatusLookup() {
    return this.codeValueService.getCodeValues('usr.CodeUserStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((codeValue: CodeValue) => {
        return {
          value: codeValue.id,
          text: codeValue.text,
        };
      });
  }

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewContactDetail(event.data);
    }
  }

  viewContactDetail(rowdata) {
    const userProfileTypeSufix = this.commonService.getUserProfileTypeSufix(rowdata);

    this.router.navigate(['next', 'contact', rowdata.ContactId, 'profile', userProfileTypeSufix, rowdata.UserProfileId]);
  }



}
