import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NavigationService } from '../../common/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableConfiguration, PhxDataTableColumn, PhxConstants } from '../../common/model/index';
import { DialogService, CommonService, ApiService, LoadingSpinnerService } from '../../common/index';
import * as _ from 'lodash';
import { PhxDataTableComponent } from '../../common/components/phx-data-table/phx-data-table.component';
import { DialogResultType } from '../../common/model/dialog-result-type';
import { VmsProcessBaseComponent } from '../shared/vms-process-base.component';
import { AuthService } from '../../common/services/auth.service';
import { VmsService} from '../shared/Vms.service';

declare var oreq: any;

@Component({
  templateUrl: '../shared/vms-process-base.component.html',
})
export class VmsDiscountProcessComponent extends VmsProcessBaseComponent {

  columns: Array<PhxDataTableColumn> = [
    this.colDefs.importDate,
    new PhxDataTableColumn({
      dataField: 'WorkOrderNumber',
      caption: 'Workorder',
    }),
    this.colDefs.firstName,
    this.colDefs.lastName,
    new PhxDataTableColumn({
      dataField: 'Discount',
      caption: 'Discount',
      alignment: 'right',
      dataType: 'decimal',
      format: this.currencyColumnFormat,
    }),
    this.colDefs.startDate,
    this.colDefs.endDate,
    new PhxDataTableColumn({
      dataField: 'BillingTransactionNumber',
      caption: 'Billing Transaction',
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
  ) {
    super(route, dialogService, navigationService, commonService, apiService, authService, vmsService);

    this.pageTitle = 'thirdpartyimport-discount-transaction-creation';
    this.getItemPreparedCountValue = (item) => item.DiscountPreparedCount;
    this.apiEndpointPathParameter = 'vms/getDiscountProcessedRecords';
    this.conflictRecordType = PhxConstants.VmsDiscountImportedRecordType.Conflict;
    this.callSendToConflict = (record, reason) => {
      return vmsService.VmsDiscountRecordSetConflictType({
        EntityTypeId: PhxConstants.EntityType.VmsDiscountProcessedRecord,
        EntityIds: [record.Id],
        ConflictReason: reason
      });
    };
    this.CommandName = 'VmsDiscountProcessedRecordCreate';
    this._initStateActions(PhxConstants.StateAction.VmsDiscountProcessedRecordCreate);
    this._initTableStateActions(PhxConstants.StateAction.VmsDiscountProcessedRecordMoveToConflict);
    // this.toSendNotifyOnPreExecutionNotValidResult = false;
    // this.taskResultId = PhxConstants.TaskResult.VmsDiscountRecordGenerateTransaction;
    // this.batchPreExecutionCommandName = 'BatchPreExecutionOnVmsDiscountProcessedRecordToBillingTransaction';
    // this.batchThreadExecutionCommandName = 'BatchThreadExecutionOnVmsDiscountRecordToBillingTransaction';
  }

}
