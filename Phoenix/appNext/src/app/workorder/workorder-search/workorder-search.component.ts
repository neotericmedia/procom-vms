import { CodeValueGroups } from './../../common/model/phx-code-value-groups';
import CustomDataSource from 'devextreme/data/custom_store';
// import { OrganizationApiService } from './../../organization/organization.api.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { PhxDataTableConfiguration, RowHighlightingConfig } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';
import { StateService } from '../../common/state/service/state.service';
import { Router, ActivatedRoute } from '@angular/router';

import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { CommonService, WindowRefService, ApiService, PhxLocalizationService, PhxConstants } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { CodeValue } from '../../common/model/code-value';
import { NavigationService } from './../../common/services/navigation.service';
import { UrlData } from './../../common/services/urlData.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AuthService } from '../../common/services/auth.service';
declare var oreq: any;

@Component({
  selector: 'app-workorder-search',
  templateUrl: './workorder-search.component.html',
  styleUrls: ['./workorder-search.component.css']
})
export class WorkorderSearchComponent implements OnInit {
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    rowHighlightingConfig: new RowHighlightingConfig()
  });

  sourceWorkers: any[] = [];
  dataSourceUrl: string = 'assignment/getSearch';
  dataGridComponentName: string = 'workorderSearch';
  internalOrganizations: any[] = [];
  public phxConstants: typeof PhxConstants = null;
  canAccess: boolean = false;
  oDataParams = oreq
    .request()
    .withSelect([
      'WorkOrderFullNumber',
      'AssignmentId',
      'WorkOrderId',
      'WorkOrderNumber',
      'StartDate',
      'EndDate',
      'AssignmentStatus',
      'WorkOrderStatus',
      'WorkOrderVersionStatus',
      'WorkOrderVersionId',
      'PaymentPrimaryRateSumPerRateUnit',
      'BillingPrimaryRateSumPerRateUnit',
      'WorkerName',
      'ClientName',
      'OrganizationIdInternal',
      'InternalCompanyDisplayName',
      'UserProfileIdWorker',
      'WorkerProfileType',
      'ManagerName',
      'TimeSheetApprover',
      'BranchId',
      'IsChangeInProgress',
      'WorkOrderLineOfBusiness',
      'JobOwnerName',
      'FirstRecruiterName',
      'ClientOrganizationId',
      'ContactId',
      'UserProfileTypeId',
      'IsTest'
    ])
    .url();
  columns: Array<PhxDataTableColumn>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingSpinnerService: LoadingSpinnerService,
    public commonService: CommonService,
    private navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private apiService: ApiService,
    private localizationService: PhxLocalizationService,
    private urlData: UrlData,
    private authService: AuthService
    
  ) {
    this.route.data.subscribe(data => {
      if (data && data.resolvedData && data.resolvedData.organizations && data.resolvedData.workers) {
        this.internalOrganizations = data.resolvedData.organizations;
        this.sourceWorkers = data.resolvedData.workers;
        this.dataSourceUrl = data.dataSourceUrl || this.dataSourceUrl;
        this.dataGridComponentName = data.dataGridComponentName || this.dataGridComponentName;
      }
    });
    this.phxConstants = PhxConstants;
  }

  ngOnInit() {
    this.navigationService.setTitle('workorder-manage');
    this.columns = this.buildColumns();
    this.urlData.clearUrl();
    this.canAccess = this.hasFunctionalAccess();
  }

  buildColumns(): Array<PhxDataTableColumn> {
    return [
      new PhxDataTableColumn({
        dataField: 'WorkOrderFullNumber',
        caption: 'Number',
        calculateSortValue: 'AssignmentId'
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
        dataField: 'AssignmentStatus',
        caption: 'Assignment Status',
        visible: false,
        showInColumnChooser: true,
        lookup: {
          dataSource: this.getAssignmentStatusLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderStatus',
        caption: 'Work Order Status',
        lookup: {
          dataSource: this.getWorkorderStatusLookup(),
          valueExpr: 'text',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderVersionStatus',
        caption: 'Work Order Version Status',
        lookup: {
          dataSource: this.getWorkorderVersionStatusLookup(),
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
  createNewWorkOrder() {
    if(this.hasFunctionalAccess()) {
      this.router.navigate(['/next', 'workorder', 'createsetup']);
    }
    else {
      console.log('NO access');
    }
  }

  hasFunctionalAccess(): boolean {
      return this.authService.hasFunctionalOperation(this.phxConstants.FunctionalOperation.WorkOrderCreateSetup);
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
      this.urlData.setUrl(this.router.url);
    }
  }

  viewWorkOrderDetails(assignmentId: number, workOrderId: number, workOrderVersionId: number) {
    // this.$state.go('workorder.edit.core', { assignmentId: assignmentId, workOrderId: workOrderId, workOrderVersionId: workOrderVersionId });
    this.router.navigate(['/next', 'workorder', assignmentId, workOrderId, workOrderVersionId, 'core']);
  }

  getAssignmentStatusLookup() {
    return this.codeValueService.getCodeValues(CodeValueGroups.AssignmentStatus, true);
  }

  getWorkorderStatusLookup() {
    return this.codeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true);
  }

  getWorkorderVersionStatusLookup() {
    return this.codeValueService.getCodeValues(CodeValueGroups.WorkOrderVersionStatus, true);
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
            return this.winRef.nativeWindow.open(`#/next/contact/${event.row.data.ContactId}/profile/${profiletype}/${event.row.data.UserProfileIdWorker}`, '_blank');
          }
        },
        {
          text: 'Open client in new tab',
          onItemClick: () => {
            this.winRef.nativeWindow.open(`#/next/organization/${event.row.data.ClientOrganizationId}/details`, '_blank');
          }
        }
      ];
      if (event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
        event.items.push({
          text: 'Open work order in new tab',
          onItemClick: () => {
            this.winRef.openUrl(`#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
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
