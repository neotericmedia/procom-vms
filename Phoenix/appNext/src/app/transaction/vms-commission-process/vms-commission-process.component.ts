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
import {VmsService} from '../shared/Vms.service';

declare var oreq: any;

@Component({
    templateUrl: '../shared/vms-process-base.component.html',
})
export class VmsCommissionProcessComponent extends VmsProcessBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        this.colDefs.importDate,
        new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'Workorder',
        }),
        this.colDefs.firstName,
        this.colDefs.lastName,
        new PhxDataTableColumn({
            dataField: 'BillAmount',
            caption: 'Bill Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'PayAmount',
            caption: 'Pay Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        this.colDefs.startDate,
        this.colDefs.endDate,
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

        this.pageTitle = 'thirdpartyimport-commission-transaction-creation';
        this.getItemPreparedCountValue = (item) => item.CommissionPreparedCount;
        this.apiEndpointPathParameter = 'vms/getCommissionProcessedRecords';
        this.conflictRecordType = PhxConstants.VmsCommissionImportedRecordType.Conflict;
        this.callSendToConflict = (record, reason) => {
            return vmsService.vmsCommissionRecordSetConflictType({ // .VmsCommissionRecordSetConflictType;
                EntityTypeId: PhxConstants.EntityType.VmsCommissionProcessedRecord,
                EntityIds: [record.Id],
                ConflictReason: reason,
            });
        };
        this.CommandName = 'VmsCommissionProcessedRecordCreate';
        this._initStateActions(PhxConstants.StateAction.VmsCommissionProcessedRecordCreate);
        this._initTableStateActions(PhxConstants.StateAction.VmsCommissionProcessedRecordMoveToConflict);
  
        // this.toSendNotifyOnPreExecutionNotValidResult = false;
        // this.taskResultId = PhxConstants.TaskResult.VmsCommissionRecordGenerateTransaction; // .VmsDiscountRecordGenerateTransaction;
        // this.batchPreExecutionCommandName = 'BatchPreExecutionOnVmsCommissionRecordToTransaction'; // 'BatchPreExecutionOnVmsDiscountProcessedRecordToBillingTransaction';
        // this.batchThreadExecutionCommandName = 'BatchThreadExecutionOnVmsCommissionRecordToTransaction'; // 'BatchThreadExecutionOnVmsDiscountRecordToBillingTransaction';
    }
}
