import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PhxDataTableConfiguration, PhxDataTableColumn, RowHighlightingConfig } from '../../common/model';
import { CommonService, CodeValueService, WindowRefService, ApiService, PhxLocalizationService } from '../../common';

import * as moment from 'moment';

import { OrganizationApiService } from '../../organization/organization.api.service';

@Component({
  selector: 'app-work-order-search-datagrid',
  templateUrl: './work-order-search-datagrid.component.html',
  styleUrls: ['./work-order-search-datagrid.component.less']
})
export class WorkOrderSearchDatagridComponent implements OnInit, OnDestroy {
  @Input() dataSourceUrl: string = 'assignment/getSearch';
  @Input() dataGridComponentName: string;
  @Input() oDataParams: string;

  @Input() sortOrderById: string; // 'asc', 'desc', undefined

  internalOrganizations: any[] = [];

  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    rowHighlightingConfig: new RowHighlightingConfig()
  });

  columns: Array<PhxDataTableColumn>;

  isAlive = true;

  constructor(
    public commonService: CommonService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private apiService: ApiService,
    private localizationService: PhxLocalizationService,
    private orgService: OrganizationApiService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.orgService.getListOrganizationsOriginalAndStatusIsAtiveOrPendingChangeInActiveInternalRole()
      .map((data) => {
        return data.Items.map((item) => {
          return {
            text: item.DisplayName,
            value: item.Id
          };
        });
      }).takeWhile(() => this.isAlive).subscribe(res => {
        this.internalOrganizations = res;
        this.columns = this.buildColumns();
      });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'WorkOrderFullNumber',
        caption: 'Number',
        calculateSortValue: 'AssignmentId',
        sortOrder: this.sortOrderById
      }),
      new PhxDataTableColumn({
        dataField: 'OrganizationIdInternal',
        caption: 'Internal Company',
        lookup: {
          dataSource: this.getInternalOrgLookup(),
          valueExpr: 'value',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerName',
        caption: 'Worker Name'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerProfileType',
        caption: 'Profile Type',
        lookup: {
          dataSource: this.getUserProfileTypeLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ClientName',
        caption: 'Client Name'
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: 'Start Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: 'End Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'BillingPrimaryRateSumPerRateUnit',
        caption: 'Bill Rate'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentPrimaryRateSumPerRateUnit',
        caption: 'Pay Rate'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderStatus',
        caption: 'Status',
        lookup: {
          dataSource: this.getWorkorderStatusLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BranchId',
        caption: 'Branch',
        lookup: {
          dataSource: this.getBranchLookup(),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'IsChangeInProgress',
        caption: 'Change In Progress',
        dataType: 'boolean',
        lookup: {
          dataSource: this.getChangeInProgressLookup(),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'TimeSheetApprover',
        caption: 'Timesheet Approver'
      }),
      new PhxDataTableColumn({
        dataField: 'ManagerName',
        caption: 'Client Manager'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderLineOfBusiness',
        caption: 'Line Of Business',
        lookup: {
          dataSource: this.getWorkOrderLineOfBusinessLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'JobOwnerName',
        caption: 'Job Owner'
      }),
      new PhxDataTableColumn({
        dataField: 'FirstRecruiterName',
        caption: 'Recruiter'
      }),
      new PhxDataTableColumn({
        dataField: 'IsTest',
        caption: this.localizationService.translate('common.phxDataTable.implementationHeader'),
        dataType: 'boolean',
        lookup: {
          dataSource: PhxDataTableColumn.isTest.lookupDataSource(this.localizationService),
          valueExpr: 'value',
          displayExpr: 'text'
        },
      })
    ];
  }

  calculateDateFilterExpression(filterValue, selectedFilterOperation) {
    if (filterValue[0]) {
      filterValue[0] = new Date(moment(filterValue[0]).format('YYYY-MM-DD') + 'T00:00:00.000Z');
    }
    if (filterValue[1]) {
      filterValue[1] = new Date(moment(filterValue[1]).format('YYYY-MM-DD') + 'T00:00:00.000Z');
    }
    if (!(filterValue[0] || filterValue[1])) {
      filterValue = new Date(moment(filterValue).format('YYYY-MM-DD') + 'T00:00:00.000Z');
    }
    return (<any>this).defaultCalculateFilterExpression(filterValue, selectedFilterOperation);
  }

  onRowClick(event: any) {
    if (event && event.data) {
      this.apiService
        .query(`assignment/latestWorkOrderVersionId/${event.data.WorkOrderId}`)
        .then((latestVersionId: number) => {
          this.viewWorkOrderDetails(event.data.AssignmentId, event.data.WorkOrderId, latestVersionId);
        })
        .catch(err => {
          this.viewWorkOrderDetails(event.data.AssignmentId, event.data.WorkOrderId, event.data.WorkOrderVersionId);
        });
    }
  }

  viewWorkOrderDetails(assignmentId: number, workOrderId: number, workOrderVersionId: number) {
    // this.$state.go('workorder.edit.core', { assignmentId: assignmentId, workOrderId: workOrderId, workOrderVersionId: workOrderVersionId });
    this.router.navigate(['/next', 'workorder', assignmentId, workOrderId, workOrderVersionId, 'core']);
  }

  getWorkorderStatusLookup() {
    return this.codeValueService.getCodeValues('workorder.CodeWorkOrderStatus', true);
  }

  getWorkOrderLineOfBusinessLookup() {
    return this.codeValueService.getCodeValues('org.CodeLineOfBusiness', true);
  }

  getChangeInProgressLookup() {
    return [{ id: false, text: 'No' }, { id: true, text: 'Yes' }];
  }

  getUserProfileTypeLookup() {
    return this.codeValueService.getCodeValues('usr.CodeProfileType', true);
  }

  getBranchLookup() {
    return this.codeValueService.getCodeValuesSortByCode('workorder.CodeInternalOrganizationDefinition1', true);
  }

  getInternalOrgLookup() {
    return this.internalOrganizations.sort(this.compareValues('text'));
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data') {
      event.items = [
        {
          text: 'Open worker in new tab',
          onItemClick: () => {
            let profiletype = null;
            switch (event.row.data.UserProfileTypeId) {
              case 1:
                profiletype = 'organizational';
                break;
              case 2:
                profiletype = 'internal';
                break;
              case 3:
                profiletype = 'workertemp';
                break;
              case 4:
                profiletype = 'workercanadiansp';
                break;
              case 5:
                profiletype = 'workercanadianinc';
                break;
              case 6:
                profiletype = 'workersubvendor';
                break;
              case 7:
                profiletype = 'workerunitedstatesw2';
                break;
              case 8:
                profiletype = 'workerunitedstatesllc';
                break;
              default:
                profiletype = '';
                break;
            }
            this.winRef.openUrl(`/#/next/contact/${event.row.data.ContactId}/profile/${profiletype}/${event.row.data.UserProfileIdWorker}`);
          }
        },
        {
          text: 'Open client in new tab',
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/organization/${event.row.data.ClientOrganizationId}/details`);
          }
        }
      ];
      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: 'Open work order in new tab',
          onItemClick: () => {
            this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
          }
        });
      }
    }
  }

  // Dynamic sorting based on property of object
  compareValues(key, order = 'asc') {
    return function (a, b) {
      let comparison = 0;

      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return comparison;
      }

      const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }

      return order === 'desc' ? comparison * -1 : comparison;
    };
  }
}
