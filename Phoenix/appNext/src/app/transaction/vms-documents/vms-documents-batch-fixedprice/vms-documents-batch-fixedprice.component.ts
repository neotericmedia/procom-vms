import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsDocumentService } from '../vms-document.service';
import { PhxDataTableConfiguration } from './../../../common/model/data-table/phx-data-table-configuration';
import { BaseComponentOnDestroy } from '../../../common/state/epics/base-component-on-destroy';
import { PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../../common/model';
import { CodeValueService } from '../../../common';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-vms-documents-batch-fixedprice',
  templateUrl: './vms-documents-batch-fixedprice.component.html',
  styleUrls: ['./vms-documents-batch-fixedprice.component.less']
})
export class VmsDocumentsBatchFixedpriceComponent extends BaseComponentOnDestroy implements OnInit {
  record: any;

  phxTableProcessedRecordConfig: PhxDataTableConfiguration;
  phxTableProcessedRecordColumns: Array<PhxDataTableColumn>;
  phxTableProcessedRecordDataSource: Array<any>;

  phxTableWorkOrderConfig: PhxDataTableConfiguration;
  phxTableWorkOrderColumns: Array<PhxDataTableColumn>;
  phxTableWorkOrderDataSource: Array<any>;

  phxTableTransactionConfig: PhxDataTableConfiguration;
  phxTableTransactionColumns: Array<PhxDataTableColumn>;
  phxTableTransactionDataSource: Array<any>;

  constructor(private activatedRoute: ActivatedRoute, private vmsDocumentService: VmsDocumentService, private codeValueService: CodeValueService, private router: Router) {
    super();
    this.initPhxTableConfig();
    this.initPhxTableColumns();
  }

  ngOnInit() {
    this.activatedRoute.params.takeUntil(this.isDestroyed$).subscribe(params => {
      this.vmsDocumentService
        .getVmsFixedPriceProcessedRecordById(params['recordId'])
        .takeUntil(this.isDestroyed$)
        .subscribe((record: any) => {
          this.record = record;
          this.initDataSource(record);
        });
    });
  }

  initDataSource(record) {
    this.phxTableProcessedRecordDataSource = record ? [record] : null;
    this.phxTableWorkOrderDataSource = record && record.WorkOrder && record.WorkOrder.WorkOrderId ? [record.WorkOrder] : null;
    this.phxTableTransactionDataSource = record && record.BillingTransaction ? [record.BillingTransaction] : null;
  }

  initPhxTableConfig() {
    this.phxTableProcessedRecordConfig = new PhxDataTableConfiguration({
      showFilter: false,
      showClearFilterButton: false,
      showSearch: false,
      showColumnChooser: false,
      showGrouping: false,
      stateSavingMode: PhxDataTableStateSavingMode.None,
      showToolbar: false,
      showTotalCount: false
    });
    this.phxTableWorkOrderConfig = new PhxDataTableConfiguration({
      showFilter: false,
      showClearFilterButton: false,
      showSearch: false,
      showColumnChooser: false,
      showGrouping: false,
      stateSavingMode: PhxDataTableStateSavingMode.None,
      showToolbar: false,
      showTotalCount: false
    });
    this.phxTableTransactionConfig = new PhxDataTableConfiguration({
      showFilter: false,
      showClearFilterButton: false,
      showSearch: false,
      showColumnChooser: false,
      showGrouping: false,
      stateSavingMode: PhxDataTableStateSavingMode.None,
      showToolbar: false,
      showTotalCount: false
    });
  }

  initPhxTableColumns() {
    this.initProcessedRecordColumns();
    this.initWorkOrderColumns();
    this.initTransactionColumns();
  }

  initProcessedRecordColumns() {
    this.phxTableProcessedRecordColumns = [
      new PhxDataTableColumn({
        dataField: 'ImportDate',
        caption: 'Import Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkOrderReference',
        caption: 'Third Party Worker Id'
      }),
      new PhxDataTableColumn({
        dataField: 'FirstName',
        caption: 'First Name'
      }),
      new PhxDataTableColumn({
        dataField: 'LastName',
        caption: 'Last Name'
      }),
      new PhxDataTableColumn({
        dataField: 'BillAmount',
        caption: 'Bill Amount',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'PayAmount',
        caption: 'Pay Amount',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'StartDate',
        caption: 'From Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'EndDate',
        caption: 'To Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'Reason',
        caption: 'Reason',
        cellTemplate: 'reasonTemplate'
      })
    ];
  }

  initWorkOrderColumns() {
    this.phxTableWorkOrderColumns = [
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: 'Work Order'
      }),
      new PhxDataTableColumn({
        dataField: 'WorkerId',
        caption: 'Third Party Worker ID'
      }),
      new PhxDataTableColumn({
        dataField: 'FirstName',
        caption: 'First Name'
      }),
      new PhxDataTableColumn({
        dataField: 'LastName',
        caption: 'Last Name'
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
      })
    ];
  }

  initTransactionColumns() {
    this.phxTableTransactionColumns = [
      new PhxDataTableColumn({
        dataField: 'AssignmentId',
        caption: 'Work Order',
        calculateDisplayValue: data => {
          return `${data.AssignmentId}.${data.WorkOrderNumber}`;
        }
      }),
      new PhxDataTableColumn({
        dataField: 'BillingTransactionNumber',
        caption: 'Transaction No'
      }),
      new PhxDataTableColumn({
        dataField: 'FirstName',
        caption: 'First Name'
      }),
      new PhxDataTableColumn({
        dataField: 'LastName',
        caption: 'Last Name'
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
      })
    ];
  }

  onProcessedRecordClick(event) {
    if (event && event.data) {
      const OrganizationIdInternal = event.data.OrganizationIdInternal || 0;
      const DocumentId = event.data.DocumentId || 0;
      this.router.navigate(['/next', 'vms', 'fixedprice', 'InternalOrganization', OrganizationIdInternal, 'document', DocumentId, 'details']);
    }
  }

  onWorkOrderClick(event) {
    if (event && event.data) {
      const AssignmentId = event.data.AssignmentId || 0;
      const WorkOrderId = event.data.WorkOrderId || 0;
      const WorkOrderVersionId = event.data.WorkOrderVersionId || 0;
      this.router.navigate(['/next', 'workorder', AssignmentId, WorkOrderId, WorkOrderVersionId, 'core']);
    }
  }

  onTransactionClick(event) {
    if (this.record) {
      const TransactionHeaderId = this.record.TransactionHeaderId || 0;
      this.router.navigate(['/next', 'transaction', TransactionHeaderId, 'summary']);
    }
  }
}
