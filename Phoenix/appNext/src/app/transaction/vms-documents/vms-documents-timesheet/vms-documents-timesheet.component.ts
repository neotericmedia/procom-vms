import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VmsDocumentService } from './../vms-document.service';
import { PhxConstants, WorkflowService, CommonService, CodeValueService, DialogService } from '../../../common';
import { BaseComponentActionContainer } from './../../../common/state/epics/base-component-action-container';
import { VmsService } from '../../shared/Vms.service';
import { IVmsDocumentRouterState } from '../vms-document.interface';
import { IRouterState } from '../../../common/state/router/reducer';
import { BatchCommand, PhxDataTableColumn, PhxDataTableConfiguration, DialogResultType, PhxDataTableStateSavingMode } from '../../../common/model';
import { CodeValueGroups } from '../../../common/model/phx-code-value-groups';
import { SignalrService } from '../../../common/services/signalr.service';
import { VmsDocumentsDetailsComponent } from '../shared/vms-documents-details/vms-documents-details.component';

@Component({
  selector: 'app-vms-documents-timesheet',
  templateUrl: './vms-documents-timesheet.component.html'
})
export class VmsDocumentsTimesheetComponent extends BaseComponentActionContainer implements OnInit, OnDestroy {
  @ViewChild('details') details: VmsDocumentsDetailsComponent;
  columns: Array<PhxDataTableColumn>;
  dataTableConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({});
  dataTableDiscartedConfiguration: PhxDataTableConfiguration = new PhxDataTableConfiguration({
    showFilter: false,
    showClearFilterButton: false,
    showSearch: false,
    showColumnChooser: false,
    showGrouping: false,
    stateSavingMode: PhxDataTableStateSavingMode.None
  });
  dataSourceUrl = null;
  oDataParams: string;
  actionId: number;
  routerState: IVmsDocumentRouterState = null;
  document: any = { Id: '' };

  conflictRecords: any[] = [];
  ValidationMessages: { PropertyName: string; Message: string }[];

  constCodeValueGroups = CodeValueGroups;
  skippedRecords: any[];
  private unregisterList = [];

  constructor(
    private vmsDocumentService: VmsDocumentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService,
    private commonService: CommonService,
    private codeValueService: CodeValueService,
    private signalrService: SignalrService,
    private dialogService: DialogService,
    private vmsService: VmsService
  ) {
    super();
  }
  ngOnInit(): void {
    this.columns = this.buildColumns();
    this.oDataParams = this.buildOdataParams();
    this.initialize(false);
    this.listenForProcessCompleted();
    this.listenForBatchMark();
    this.actionId = PhxConstants.StateAction.VmsTimesheetProcessedRecordDiscard;
  }

  ngOnDestroy(): void {
    if (this.unregisterList && this.unregisterList.length) {
      for (const sub of this.unregisterList) {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
      }
    }
  }

  buildOdataParams(): any {
    return oreq.request().url();
  }
  buildColumns(): PhxDataTableColumn[] {
    return [
      new PhxDataTableColumn({
        dataField: 'Id',
        caption: 'ID',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'VmsWorkOrderReference',
        caption: 'VMS WorkOrder'
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
        dataField: 'V1RateTypeId',
        caption: 'Type 1',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'V1BillRate',
        caption: 'Rate 1',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'V1BillUnits',
        caption: 'Units 1',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'V2RateTypeId',
        caption: 'Type 2',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.RateType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'V2BillRate',
        caption: 'Rate 2',
        dataType: 'number'
      }),
      new PhxDataTableColumn({
        dataField: 'V2BillUnits',
        caption: 'Units 2',
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
        caption: 'Transaction Ref.'
      }),
      new PhxDataTableColumn({
        dataField: 'VmsImportedRecordTypeId',
        caption: 'Status',
        lookup: {
          dataSource: this.codeValueService.getCodeValues(CodeValueGroups.VmsImportedRecordType, true),
          valueExpr: 'id',
          displayExpr: 'text'
        }
      }),
      new PhxDataTableColumn({
        dataField: 'Reason',
        caption: 'Reason',
        cellTemplate: 'reasonTemplate'
      })
    ];
  }

  setRouterState(routerStateResult: IRouterState, VmsDocumentNavigationName: string) {
    this.routerState = {
      documentId: routerStateResult.params.documentId,
      routerPath: VmsDocumentNavigationName,
      url: routerStateResult.location
    };
  }

  getConflictIds(): number[] {
    return this.details.phxTable
      .getDataSource()
      .items()
      .filter(item => {
        return item.VmsImportedRecordTypeId === PhxConstants.VmsImportedRecordType.Conflict;
      })
      .map(item => item.Id);
  }

  // executeBatch(commandBatchPreExecutionJsonBody, commandBatchThreadExecutionJsonBody) {
  //   const batchCommand: BatchCommand = {
  //     TaskIdsToBatch: this.getTaskIdsToBatch(),
  //     TaskResultId: PhxConstants.TaskResult.Complete,
  //     NotifyName_BatchOperation_OnBatchMarkered: `VmsTimesheetManagementConflictsBatchMark`,
  //     NotifyName_BatchOperation_OnReleased: `VmsTimesheetManagementConflictsProcessCompleted`,
  //     NotifyName_BatchOperation_OnPreExecutionException: '',
  //     CommandBatchPreExecutionJsonBody: commandBatchPreExecutionJsonBody,
  //     CommandBatchThreadExecutionJsonBody: commandBatchThreadExecutionJsonBody
  //   };
  //   this.workflowService.workflowBatchOperationOnTasksSelected(batchCommand).then(
  //     () => {
  //       // this.initialize(true);
  //     },
  //     error => {
  //       this.onErrorResponse(error, 'VMS Record object is not valid');
  //     }
  //   );
  // }

  onErrorResponse(responseError, message) {
    if (message && message.length > 0) {
      this.commonService.logError(message);
    }
    this.conflictRecords = [];
    this.ValidationMessages = this.commonService.parseResponseError(responseError);
  }

  discardAllConflicts() {
    const dialogHeader = 'Are you sure you want to discard all conflict records?';

    this.dialogService.confirm('Discard Records', dialogHeader).then(button => {
      if (button === DialogResultType.Yes) {
        // this.executeBatch({ CommandName: 'BatchPreExecutionOnVmsProcessedRecordSetStateDiscarded', WorkflowPendingTaskId: -1 }, { CommandName: 'BatchThreadExecutionOnVmsProcessedRecordSetStateDiscarded' });
        const commandName = this.codeValueService.getCodeValueCode(this.actionId, this.commonService.CodeValueGroups.StateAction);
        const payload = {
          EntityIds: this.getConflictIds(),
          EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
        };
        this.vmsService.executeStateCommand(commandName, payload)
        .then(
            (success: any) => {
              this.commonService.logSuccess('Discard Conflict Records successful');
                this.initialize(true);
            },
            (error) => {
              this.onErrorResponse(error, 'VMS Record object is not valid');
            });
      }
    });
  }

  onRowClick(event: any) {
    const recordId = event && event.data ? event.data.Id : null;
    if (recordId) {
      this.router.navigate(['/next', 'vms', 'batch', 'timesheet', 'processed', recordId, 0]);
    }
  }

  private listenForProcessCompleted() {
    this.signalrService
      .onPrivate('VmsTimesheetManagementConflictsProcessCompleted', () => {
        this.commonService.logSuccess('Discard Conflict Records. Batch operation completed.');
        this.initialize(true);
      })
      .then(unregister => {
        if (unregister) {
          this.unregisterList.push(unregister);
        }
      });
  }

  private listenForBatchMark() {
    this.signalrService
      .onPrivate('VmsTimesheetManagementConflictsBatchMark', () => {
        this.commonService.logSuccess('Discard Conflict Records. Batch operation started.');
        this.conflictRecords = [];
      })
      .then(unregister => {
        if (unregister) {
          this.unregisterList.push(unregister);
        }
      });
  }

  private initialize(reload: boolean) {
    this.activatedRoute.params.subscribe(params => {
      this.vmsDocumentService
        .getVmsTimesheetDocumentDetails(params['documentId'])
        .takeWhile(() => true)
        .subscribe((document: any) => {
          this.document = document;
          this.skippedRecords = this.document.VmsTimesheetImportedRecords.filter(item => {
            return item.VmsImportedRecordTypeId === PhxConstants.VmsImportedRecordType.Discarded;
          });
          this.dataSourceUrl = `vms/getVmsTimesheetProcessedRecordsByDocument/document/${this.document.DocumentId}`;
          if (reload) {
            this.details.phxTable.refresh();
          }
        });
    });
  }
}
