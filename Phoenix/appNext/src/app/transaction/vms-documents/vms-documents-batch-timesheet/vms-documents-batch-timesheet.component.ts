import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsDocumentService } from '../vms-document.service';
import { PhxDataTableConfiguration } from './../../../common/model/data-table/phx-data-table-configuration';
import { BaseComponentOnDestroy } from '../../../common/state/epics/base-component-on-destroy';
import { PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../../common/model';
import { CodeValueService } from '../../../common';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-vms-documents-batch-timesheet',
  templateUrl: './vms-documents-batch-timesheet.component.html',
  styleUrls: ['./vms-documents-batch-timesheet.component.less']
})
export class VmsDocumentsBatchTimesheetComponent extends BaseComponentOnDestroy implements OnInit {
  record: any;

  phxTableProcessedRecordConfig: PhxDataTableConfiguration;
  phxTableProcessedRecordColumns: Array<PhxDataTableColumn>;
  phxTableProcessedRecordDataSource: Array<any>;

  phxTableWorkOrderConfig: PhxDataTableConfiguration;
  phxTableWorkOrderColumns: Array<PhxDataTableColumn>;
  phxTableWorkOrderDataSource: Array<any>;

  phxTableTimesheetConfig: PhxDataTableConfiguration;
  phxTableTimesheetColumns: Array<PhxDataTableColumn>;
  phxTableTimesheetDataSource: Array<any>;

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
        .getVmsTimesheetProcessedRecordById(params['recordId'])
        .takeUntil(this.isDestroyed$)
        .subscribe((record: any) => {
          this.record = record;
          this.initDataSource(record);
        });
    });
  }

  initDataSource(record) {
    this.phxTableProcessedRecordDataSource = record && record.ImportedRecord ? [record] : null;
    this.phxTableWorkOrderDataSource = record && record.WorkOrders ? record.WorkOrders : null;
    this.phxTableTimesheetDataSource = record && record.Timesheet ? record.Timesheet : null;
    this.phxTableTransactionDataSource = record && record.BillingTransaction ? record.BillingTransactions : null; // original ng1 logic.. check obj then use array..
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
    this.phxTableTimesheetConfig = new PhxDataTableConfiguration({
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
    this.initTimesheetColumns();
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
        dataField: 'VmsWorkOrderReference',
        caption: 'VMS Worker ID'
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
        dataField: 'ImportedRecord.V1RateTypeId',
        caption: 'Rate Type 1',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ImportedRecord.V1BillRate',
        caption: 'Bill Rate 1',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'ImportedRecord.V1BillUnits',
        caption: 'Rate Unit 1',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'ImportedRecord.V2RateTypeId',
        caption: 'Rate Type 2',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'ImportedRecord.V2BillRate',
        caption: 'Bill Rate 2',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'ImportedRecord.V2BillUnits',
        caption: 'Rate Unit 2',
        dataType: 'number'
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
        dataField: 'InvoiceReference',
        caption: 'Transaction Reference'
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
        dataField: 'AssignmentId',
        caption: 'Work Order',
        calculateDisplayValue: data => {
          return `${data.AssignmentId}.${data.WorkOrderNumber}`;
        }
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
        dataField: 'VmsWorkOrderReference',
        caption: 'VMS Worker ID'
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
        dataField: 'V1RateTypeId',
        caption: 'Rate Type 1',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'V1BillRate',
        caption: 'Bill Rate 1',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'V1BillUnits',
        caption: 'Rate Unit 1',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'V2RateTypeId',
        caption: 'Rate Type 2',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'V2BillRate',
        caption: 'Bill Rate 2',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'V2BillUnits',
        caption: 'Rate Unit 2',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'StatusId',
        caption: 'Work Order Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.WorkOrderStatus, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      })
    ];
  }

  initTimesheetColumns() {
    this.phxTableTimesheetColumns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'Timesheet ID',
        dataType: 'number'
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
      this.router.navigate(['/next', 'vms', 'timesheet', 'InternalOrganization', OrganizationIdInternal, 'document', DocumentId, 'details']);
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

  onTimesheetClick(event) {
    this.router.navigate(['next', 'timesheet', event.data.Id]);
  }

  onTransactionClick(event) {
    if (event && event.data) {
      const TransactionHeaderId = event.data.TransactionHeaderId || 0;
      this.router.navigate(['/next', 'transaction', TransactionHeaderId, 'summary']);
    }
  }
}
