import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsDocumentService } from '../vms-document.service';
import { PhxDataTableConfiguration } from './../../../common/model/data-table/phx-data-table-configuration';
import { BaseComponentOnDestroy } from '../../../common/state/epics/base-component-on-destroy';
import { PhxDataTableColumn, PhxDataTableStateSavingMode } from '../../../common/model';
import { CodeValueService } from '../../../common';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';

@Component({
  selector: 'app-vms-documents-batch-ussourcededuction',
  templateUrl: './vms-documents-batch-ussourcededuction.component.html',
  styleUrls: ['./vms-documents-batch-ussourcededuction.component.less']
})
export class VmsDocumentsBatchUssourcedeductionComponent extends BaseComponentOnDestroy implements OnInit {
  record: any;

  phxTableProcessedRecordConfig: PhxDataTableConfiguration;
  phxTableProcessedRecordColumns: Array<PhxDataTableColumn>;
  phxTableProcessedRecordDataSource: Array<any>;

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
        .getVmsUnitedStatesSourceDeductionProcessedRecordById(params['recordId'])
        .takeUntil(this.isDestroyed$)
        .subscribe((record: any) => {
          this.record = record;
          this.initDataSource(record);
        });
    });
  }

  initDataSource(record) {
    this.phxTableProcessedRecordDataSource = record ? [record] : null;
    this.phxTableTransactionDataSource = record && record.PaymentTransaction ? [record.PaymentTransaction] : null;
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
    this.initTransactionColumns();
  }

  initProcessedRecordColumns() {
    this.phxTableProcessedRecordColumns = [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'ID',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionNumber',
        caption: 'Transaction #'
      }),
      new PhxDataTableColumn({
        dataField: 'LastName',
        caption: 'Last Name'
      }),
      new PhxDataTableColumn({
        dataField: 'Date',
        caption: 'Date',
        dataType: 'date'
      }),
      new PhxDataTableColumn({
        dataField: 'GrossAmount',
        caption: 'Gross',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'MedicareAmount',
        caption: 'Medicare',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'SocialSecurityAmount',
        caption: 'SocSec',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'FudiAmount',
        caption: 'Fudi',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'SuiAmount',
        caption: 'Sui',
        dataType: 'money'
      }),
      new PhxDataTableColumn({
        dataField: 'Reason',
        caption: 'Reason',
        cellTemplate: 'reasonTemplate'
      }),
      new PhxDataTableColumn({
        dataField: 'VmsUnitedStatesSourceDeductionImportedRecordTypeId',
        caption: 'Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      })
    ];
  }

  initTransactionColumns() {
    this.phxTableTransactionColumns = [
      new PhxDataTableColumn({
        dataField: 'WorkOrderNumber',
        caption: 'Work Order'
      }),
      new PhxDataTableColumn({
        dataField: 'PaymentTransactionNumber',
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
      this.router.navigate(['/next', 'vms', 'ussourcededuction', 'InternalOrganization', OrganizationIdInternal, 'document', DocumentId, 'details']);
    }
  }

  onTransactionClick(event) {
    if (event && event.data) {
      const TransactionHeaderId = event.data.TransactionHeaderId || 0;
      this.router.navigate(['/next', 'transaction', TransactionHeaderId, 'summary']);
    }
  }
}
