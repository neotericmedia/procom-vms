import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NavigationService } from '../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxConstants } from '../../common/model/index';
import { DialogService, CommonService, ApiService, LoadingSpinnerService, CodeValueService } from '../../common/index';
import * as _ from 'lodash';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { DialogResultType } from '../../common/model/dialog-result-type';
import { VmsProcessBaseComponent } from '../shared/vms-process-base.component';
import { CodeValue } from '../../common/model/code-value';
import { AuthService } from '../../common/services/auth.service';
import {VmsService} from '../shared/Vms.service';

declare var oreq: any;

@Component({
  templateUrl: '../shared/vms-process-base.component.html',
})
export class VmsTimesheetProcessComponent extends VmsProcessBaseComponent {

  currencyColumnFormat = { type: 'fixedPoint', precision: 2 };

  columns: Array<PhxDataTableColumn> = [
    this.colDefs.importDate,
    new PhxDataTableColumn({
      dataField: 'VMSWorkOrderId',
      caption: 'VMS WorkOrder',
    }),
    this.colDefs.firstName,
    this.colDefs.lastName,
    this.colDefs.startDate,
    this.colDefs.endDate,
    new PhxDataTableColumn({
      dataField: 'V1RateTypeId',
      caption: 'Type',
      lookup: {
        dataSource: this.rateType(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'V1BillRate',
      caption: 'Rate',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'V1BillUnits',
      caption: 'Units',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'V2RateTypeId',
      caption: 'Type',
      lookup: {
        dataSource: this.rateType(),
        valueExpr: 'value',
        displayExpr: 'text'
      },
    }),
    new PhxDataTableColumn({
      dataField: 'V2BillRate',
      caption: 'Rate',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'V2BillUnits',
      caption: 'Units',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    new PhxDataTableColumn({
      dataField: 'InvoiceReference',
      caption: 'TRN. Reference',
    }),
    this.colDefs.fileName,
    this.colDefs.userNotes,
    this.colDefs.action,
  ];

  constructor(
    route: ActivatedRoute,
    dialogService: DialogService,
    navigationService: NavigationService,
    commonService: CommonService,
    apiService: ApiService,
    authService: AuthService,
    vmsService: VmsService,
    private codeValueService: CodeValueService
  ) {
    super(route, dialogService, navigationService, commonService, apiService, authService, vmsService);

    this.pageTitle = 'thirdpartyimport-timesheet-transaction-creation';
    this.getItemPreparedCountValue = (item) => item.PreparedCount;
    this.apiEndpointPathParameter = 'transactionHeader/getClientProcessingTransactions';
    this.conflictRecordType = PhxConstants.VmsImportedRecordType.Conflict;
    this.callSendToConflict = (record, reason) => {
      return vmsService.vmsProcessedRecordSetTypeConflict({
        EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
        EntityIds: [record.Id],
        ConflictReason: reason,
      });
    };
    // this.toSendNotifyOnPreExecutionNotValidResult = false;
    // this.taskResultId = PhxConstants.TaskResult.VmsProcessedRecordGenerateTransaction;
    // this.batchPreExecutionCommandName = 'BatchPreExecutionOnVMSProcessedRecordToVMSTransaction';
    // this.batchThreadExecutionCommandName = 'BatchThreadExecutionOnVMSProcessedRecordToVMSTransactionConsolidated';
    // this.batchPreExecutionManipulationCommandname = 'BatchPreExecutionOnVMSProcessedRecordManipulation';
    this.CommandName = 'VmsTimesheetProcessedRecordCreate';
    this._initStateActions(PhxConstants.StateAction.VmsTimesheetProcessedRecordCreate);
    this._initTableStateActions(PhxConstants.StateAction.VmsTimesheetProcessedRecordMoveToConflict);
  }

  vmsRateType1() {
    const codeRateType = this.codeValueService.getCodeValues('workorder.CodeRateType', true)
      .sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      })
      .map((codeValue: CodeValue) => {
        return {
          text: codeValue.text,
          value: codeValue.id
        };
      });
    return codeRateType;
  }

  rateType() {
    const codeValueGroups = this.commonService.CodeValueGroups;
    return this.codeValueService.getCodeValues(codeValueGroups.RateType, true) // 'workorder.CodeRateType'
      .map((i: CodeValue) => {
        return {
          value: i.id,
          text: i.text,
        };
      });
  }



}
