import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { PhxDataTableConfiguration } from '../../common/model/data-table/phx-data-table-configuration';
import { PhxDataTableColumn } from '../../common/model/data-table/phx-data-table-column';
import { PhxDataTableSummaryItem } from '../../common/model/data-table/phx-data-table-summary-item';
import { PhxDataTableSummaryType } from '../../common/model/data-table/phx-data-table-summary-type';

import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { NavigationService } from './../../common/services/navigation.service';

export class WorkorderSearchBase {

  dataTableConfiguration = new PhxDataTableConfiguration({
  });

  columns: Array<PhxDataTableColumn>;
  pageTitle: string;
  sourceWorkers: any[] = [];
  internalOrganizations: any[] = [];
  oDataParams: any;

  colDefs: { [key: string]: PhxDataTableColumn; } = {
    workOrderFullNumber: new PhxDataTableColumn({
      dataField: 'WorkOrderFullNumber',
      caption: 'NUMBER',
      calculateSortValue: 'AssignmentId',
    }),
    organizationIdInternal: new PhxDataTableColumn({
      dataField: 'OrganizationIdInternal',
      caption: 'INTERNAL COMPANY',
      lookup: {
        dataSource: this.getInternalOrgLookup(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    userProfileIdWorker: new PhxDataTableColumn({
      dataField: 'UserProfileIdWorker',
      caption: 'WORKER NAME',
      lookup: {
        dataSource: this.getSourceWorkers(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
      calculateSortValue: 'WorkerName',
    }),
    workerProfileType: new PhxDataTableColumn({
      dataField: 'WorkerProfileType',
      caption: 'PROFILE TYPE',
      lookup: {
        dataSource: this.getUserProfileTypeLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
    }),
    clientName: new PhxDataTableColumn({
      dataField: 'ClientName',
      caption: 'CLIENT NAME',
    }),
    startDate: new PhxDataTableColumn({
      dataField: 'StartDate',
      caption: 'START DATE',
      dataType: 'date',
      format: 'yyyy/M/d',
    }),
    endDate: new PhxDataTableColumn({
      dataField: 'EndDate',
      caption: 'END DATE',
      dataType: 'date',
      format: 'yyyy/M/d',
    }),
    billingPrimaryRateSumPerRateUnit: new PhxDataTableColumn({
      dataField: 'BillingPrimaryRateSumPerRateUnit',
      caption: 'BILL RATE',
    }),
    paymentPrimaryRateSumPerRateUnit: new PhxDataTableColumn({
      dataField: 'PaymentPrimaryRateSumPerRateUnit',
      caption: 'PAY RATE',
    }),
    workOrderStatus: new PhxDataTableColumn({
      dataField: 'WorkOrderStatus',
      caption: 'STATUS',
      lookup: {
        dataSource: this.getWorkorderStatusLookup(),
        valueExpr: 'text',
        displayExpr: 'text'
      },
    }),
    managerName: new PhxDataTableColumn({
      dataField: 'ManagerName',
      caption: 'MANAGER NAME',
    }),
    timeSheetApprover: new PhxDataTableColumn({
      dataField: 'TimeSheetApprover',
      caption: 'APPROVER NAME',
    }),
    action: new PhxDataTableColumn({
      dataField: 'WorkOrderFullNumber',
      caption: 'ACTION',
      width: 50,
      cellTemplate: 'viewWorkOrderDetailsCellTemplate',
      allowFiltering: false,
      allowSorting: false,
      allowSearch: false,
      allowExporting: false,
      allowGrouping: false,
    }),
  };

  summary: Array<PhxDataTableSummaryItem> = [
    new PhxDataTableSummaryItem({
      column: 'WorkOrderFullNumber',
      summaryType: PhxDataTableSummaryType.Count
    })
  ];

  constructor(
    protected route: ActivatedRoute,
    private loadingSpinnerService: LoadingSpinnerService,
    protected navigationService: NavigationService,
    private codeValueService: CodeValueService,
    private router: Router
  ) {
    this.route.data
      .subscribe((data) => {
        if (data && data.resolvedData && data.resolvedData.organizations && data.resolvedData.workers) {
          this.internalOrganizations = data.resolvedData.organizations;
          this.sourceWorkers = data.resolvedData.workers;
        }
      });
  }

  onInit() {
    this.navigationService.setTitle('workorder-manage');
  }

  public onRowSelected(event: any) {
    if (event && event.currentSelectedRowKeys && event.currentSelectedRowKeys.length === 1) {
      this.viewWorkOrderDetails(event.currentSelectedRowKeys[0]);
    } else {
      console.error('Selection collection \'e.currentSelectedRowKeys\' does not exist or is missing Id property for navigation: ', event);
    }
  }

  viewWorkOrderDetails(item: any) {
    // this.$state.go('workorder.edit.core', { assignmentId: item.AssignmentId, workOrderId: item.WorkOrderId, workOrderVersionId: item.WorkOrderVersionId });
    this.router.navigate(['/next', 'workorder', 'edit', item.AssignmentId, item.WorkOrderId, item.WorkOrderVersionId ]);
  }

  getWorkorderStatusLookup() {
    const codeValues = this.codeValueService.getCodeValues('workorder.CodeWorkOrderStatus', true)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const uniqueValues = Array.from(new Set(codeValues.map(o => o.text)));
    return uniqueValues.map((str) => {
      return {
        text: str,
        value: str
      };
    });
  }

  getUserProfileTypeLookup() {
    const codeValues = this.codeValueService.getCodeValues('usr.CodeProfileType', true)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const uniqueValues = Array.from(new Set(codeValues.map(o => o.text)));
    return uniqueValues.map((str) => {
      return {
        text: str,
        value: str
      };
    });
  }

  getInternalOrgLookup() {
    return this.internalOrganizations.sort(this.compareValues('text'));
  }

  getSourceWorkers() {
    return this.sourceWorkers.sort(this.compareValues('text'));
  }

  // Dynamic sorting based on property of object
  compareValues(key, order = 'asc') {
    return function (a, b) {
      let comparison = 0;

      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return comparison;
      }

      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }

      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }
}

/*************************

import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


import { LoadingSpinnerService } from './../../common/loading-spinner/service/loading-spinner.service';
import { NavigationService } from './../../common/services/navigation.service';
import { CodeValueService } from '../../common/services/code-value.service';

import { WorkorderSearchBase } from './workorder-search-base';

declare var oreq: any;

@Component({
  templateUrl: './workorder-search.component.html',
  styleUrls: ['./workorder-search.component.css']
})
export class WorkorderSearch2Component extends WorkorderSearchBase implements OnInit {

  dataSourceUrl: string;
  dataGridComponentName: string;

  constructor(
    route: ActivatedRoute,
    loadingSpinnerService: LoadingSpinnerService,
    navigationService: NavigationService,
    codeValueService: CodeValueService,
  ) {
    super(route, loadingSpinnerService, navigationService, codeValueService, $state);

    this.dataSourceUrl = 'assignment/getSearch';
    this.dataGridComponentName = 'workorderSearch';
    this.pageTitle = 'Search Work Orders';

    this.columns = [
      this.colDefs.workOrderFullNumber,
      this.colDefs.organizationIdInternal,
      this.colDefs.userProfileIdWorker,
      this.colDefs.workerProfileType,
      this.colDefs.clientName,
      this.colDefs.startDate,
      this.colDefs.endDate,
      this.colDefs.billingPrimaryRateSumPerRateUnit,
      this.colDefs.paymentPrimaryRateSumPerRateUnit,
      this.colDefs.workOrderStatus,
      this.colDefs.managerName,
      this.colDefs.timeSheetApprover,
      this.colDefs.workOrderFullNumber,
    ];

    this.oDataParams = oreq.request()
      .withSelect([
        'WorkOrderFullNumber',
        'UserProfileIdWorker',
        'WorkerName',
        'WorkerProfileType',
        'ClientName',
        'StartDate',
        'EndDate',
        'BillingPrimaryRateSumPerRateUnit',
        'PaymentPrimaryRateSumPerRateUnit',
        'WorkOrderStatus',
        'AssignmentId',
        'WorkOrderId',
        'WorkOrderVersionId',
        'InternalCompanyDisplayName',
        'OrganizationIdInternal',
        'UserProfileIdWorker',
        'UserProfileIdClient',
        'ManagerName',
        'TimeSheetApproverId',
        'TimeSheetApprover'
      ])
      .url();
  }

  ngOnInit() {
    this.onInit();

    this.route.data
      .subscribe((data) => {
        if (data && data.resolvedData && data.resolvedData.organizations && data.resolvedData.workers) {
          this.internalOrganizations = data.resolvedData.organizations;
          this.sourceWorkers = data.resolvedData.workers;

          this.dataSourceUrl = data.dataSourceUrl || this.dataSourceUrl;
          this.dataGridComponentName = data.dataGridComponentName || this.dataGridComponentName;

          const pageTitle = data.pageTitle || this.pageTitle;
          this.navigationService.setTitle(pageTitle, ['icon icon-workorder']);
        }
      });
  }

  createNewWorkOrder() {
    this.$state.go('workorder.createsetup');
  }

}

*/
