import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


import { PhxDataTableColumn, PhxDataTableSummaryItem, PhxDataTableSummaryType } from '../../common/model/index';

import { LoadingSpinnerService } from '../../common/index';
import { NavigationService } from '../../common/services/navigation.service';
import { CodeValueService } from '../../common/services/code-value.service';
import { WorkorderSearchBase } from '../workorder-search/workorder-search-base';

declare var oreq: any;

@Component({
  templateUrl: './pending-document-search.component.html',
})
export class PendingDocumentSearchComponent extends WorkorderSearchBase implements OnInit {

  constructor(
    route: ActivatedRoute,
    loadingSpinnerService: LoadingSpinnerService,
    navigationService: NavigationService,
    codeValueService: CodeValueService,
    router: Router
  ) {
    super(route, loadingSpinnerService, navigationService, codeValueService, router);

    this.pageTitle = 'Search for Work Orders with Documents pending review';

    // For some reason the lookup from the original definition is lost. Reassign it again.
    this.colDefs.organizationIdInternal.lookup = {
      dataSource: this.getInternalOrgLookup(),
      valueExpr: 'value',
      displayExpr: 'text'
    };

    const workerName = new PhxDataTableColumn({
      dataField: 'WorkerName',
      caption: 'WORKER NAME',
      hidingPriority: undefined
    });

    this.colDefs.workOrderStatus.allowFiltering = false;

    const pendingComplianceDocumentCount = new PhxDataTableColumn({
      dataField: 'PendingComplianceDocumentCount',
      caption: 'DOCUMENTS',
      alignment: 'right',
      dataType: 'number',
      hidingPriority: undefined,
    });

    this.columns = [
      this.colDefs.workOrderFullNumber,
      this.colDefs.organizationIdInternal,
      workerName,
      this.colDefs.workerProfileType,
      this.colDefs.clientName,
      this.colDefs.startDate,
      this.colDefs.endDate,
      this.colDefs.billingPrimaryRateSumPerRateUnit,
      this.colDefs.paymentPrimaryRateSumPerRateUnit,
      this.colDefs.workOrderStatus,
      this.colDefs.managerName,
      this.colDefs.timeSheetApprover,
      pendingComplianceDocumentCount,
      this.colDefs.action,
    ];

    this.oDataParams = oreq.request().url();
  }

  ngOnInit() {
    this.onInit();
  }

}
