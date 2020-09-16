import { Component, OnInit } from '@angular/core';
import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { NavigationService } from '../../common/services/navigation.service';
import { Router, ActivatedRoute } from '@angular/router';
declare var oreq: any;
@Component({
  selector: 'app-contact-internalteam-search',
  templateUrl: './contact-internalteam-search.component.html',
  styleUrls: ['./contact-internalteam-search.component.less']
})
export class ContactInternalTeamSearchComponent implements OnInit {
  contact: any;
  self = this;
  totalColumnFormat = { type: 'fixedPoint', precision: 2 };
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: true
  });
  columns: Array<PhxDataTableColumn> = [
    new PhxDataTableColumn({
      dataField: 'Id',
      width: 100,
      caption: 'ID',
      fixed: true,
      dataType: 'number'
    }),
    new PhxDataTableColumn({
      dataField: 'TeamName',
      caption: 'Team Name',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'Description',
      caption: 'Description',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'TeamMembers',
      caption: 'Members',
      dataType: 'string'
    }),
    new PhxDataTableColumn({
      dataField: 'JobOwner',
      caption: 'Team Owner',
      alignment: 'center',
      dataType: 'string'
    }),
    // new PhxDataTableColumn({
    //   dataField: 'ClientOrgs',
    //   caption: 'Client',
    //   alignment: 'center',
    //   dataType: 'string'
    // }),
    // new PhxDataTableColumn({
    //   dataField: 'InternalOrgs',
    //   caption: 'Internal Org',
    //   alignment: 'center',
    //   dataType: 'string'
    // }),
    // new PhxDataTableColumn({
    //   dataField: 'Branches',
    //   caption: 'Branch',
    //   alignment: 'center',
    //   dataType: 'string'
    // }),
    // new PhxDataTableColumn({
    //   dataField: 'LOBs',
    //   caption: 'Line Of Business',
    //   alignment: 'center',
    //   dataType: 'string'
    // }),
    new PhxDataTableColumn({
      dataField: 'Action',
      caption: 'Action',
      alignment: 'center',
      cellTemplate: 'viewInternalTeamsDetailTemplate',
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  public onRowClick(event: any) {
    if (event && event.data) {
      this.viewInternalTeamDetail(event.data);
    } else {
      console.error('Selection collection \'event.data\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewInternalTeamDetail(rowdata) {
    this.router.navigate(['ContactEdit.InternalTeamEdit', { internalTeamId: rowdata.Id }], { relativeTo: this.activatedRoute.parent });
  }

  createInternalTeam() {
    this.router.navigate(['ContactEdit.InternalTeamEdit', { internalTeamId: 0 }], { relativeTo: this.activatedRoute.parent });
  }

  ngOnInit() {
    this.navigationService.setTitle('manage-teams');
    const oDataParams = oreq
      .request()
      .withSelect([
        'AccessActions',
        // 'Branches',
        // 'ClientOrgs',
        'Description',
        'Id',
        // 'InternalOrgs',
        'InternalTeamId',
        'InternalTeamMembers',
        'InternalTeamRestrictions',
        'InternalTeamStatusId',
        'JobOwner',
        'JobOwnerUserProfileId',
        // 'LOBs',
        'TeamMembers',
        'TeamName',
        'WorkflowAvailableActions',
        'WorkflowPendingTaskId'
      ])
      .url();
  }
}
