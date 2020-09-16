import { CodeValueGroups } from './../../common/model/phx-code-value-groups';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PhxDataTableConfiguration, RowHighlightingConfig } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { CommonService, WindowRefService, ApiService, PhxLocalizationService } from '../../common/index';
import { CodeValueService } from '../../common/services/code-value.service';
import { PhxDataTableStateSavingMode } from '../../common/model/data-table/phx-data-table-state-saving-mode';
import { OrganizationApiService } from '../../organization/organization.api.service';
import { Router } from '@angular/router';
declare var oreq: any;

@Component({
  selector: 'app-associated-workorders',
  templateUrl: './associated-workorders.component.html',
  styleUrls: ['./associated-workorders.component.less']
})

export class AssociatedWorkordersComponent implements OnInit, OnDestroy {

  @Input() contactId: number;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    rowHighlightingConfig: new RowHighlightingConfig()
  });
  isAlive = true;
  dataSourceUrl: string;
  dataGridComponentName: string = 'workorderSearch';
  internalOrganizations: any[] = [];
  oDataParams: any;
  columns: Array<PhxDataTableColumn>;

  constructor(
    public commonService: CommonService,
    private codeValueService: CodeValueService,
    private winRef: WindowRefService,
    private apiService: ApiService,
    private localizationService: PhxLocalizationService,
    private orgService: OrganizationApiService,
    private router: Router,
  ) {
    this.dataTableConfiguration.stateSavingMode = PhxDataTableStateSavingMode.None;
  }

  ngOnInit() {
    this.dataSourceUrl = 'assignment/assignmentsByContactId/' + this.contactId;
    this.loadDataTable();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  loadDataTable() {
    this.oDataParams = oreq
      .request()
      .withSelect([
        'WorkOrderFullNumber',
        'AssignmentId',
        'WorkOrderId',
        'WorkOrderNumber',
        'StartDate',
        'EndDate',
        'WorkOrderStatus',
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
        }
      })
    ];
  }

  onRowClick(event: any) {
    if (event && event.data) {
      this.apiService
        .query(`assignment/latestWorkOrderVersionId/${event.data.WorkOrderId}`)
        .then((latestVersionId: number) => {
          this.viewWorkOrderDetails(event.data.AssignmentId, event.data.WorkOrderId, latestVersionId);
        })
        .catch(() => {
            this.viewWorkOrderDetails(event.data.AssignmentId, event.data.WorkOrderId, event.data.WorkOrderVersionId);
          });
    }
  }

  viewWorkOrderDetails(assignmentId: number, workOrderId: number, workOrderVersionId: number) {
    this.router.navigate(['next', 'workorder', assignmentId, workOrderId, workOrderVersionId, 'core']);
  }

  getWorkorderStatusLookup() {
    return this.codeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true);
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
    return this.internalOrganizations.sort(this.commonService.compareFnToSortObjects('text'));
  }

  onContextMenuPreparing(event: any) {
    if (event && event.row && event.row.rowType === 'data' && event.row.data.AssignmentId && event.row.data.WorkOrderId && event.row.data.WorkOrderVersionId) {
      event.items = [{
        text: 'Open work order in new tab',
        onItemClick: () => {
          this.winRef.openUrl(`/#/next/workorder/${event.row.data.AssignmentId}/${event.row.data.WorkOrderId}/${event.row.data.WorkOrderVersionId}/core`);
        }
      }];
    }
  }
}
