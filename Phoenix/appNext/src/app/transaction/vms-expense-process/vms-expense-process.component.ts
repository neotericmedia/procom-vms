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
export class VmsExpenseProcessComponent extends VmsProcessBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        this.colDefs.importDate,
        new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'Workorder',
        }),
        this.colDefs.firstName,
        this.colDefs.lastName,
        new PhxDataTableColumn({
            dataField: 'AmountBillable',
            caption: 'Amount Billable',
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

        this.pageTitle = 'thirdpartyimport-expense-transaction-creation';
        this.getItemPreparedCountValue = (item) => item.ExpensePreparedCount;
        this.apiEndpointPathParameter = 'vms/getExpenseProcessedRecords';
        this.conflictRecordType = PhxConstants.VmsExpenseImportedRecordType.Conflict;
        this.callSendToConflict = (record, reason) => {
            return vmsService.vmsExpenseRecordSetConflictType({ // .VmsDiscountRecordSetConflictType;
                EntityTypeId: PhxConstants.EntityType.VmsExpenseProcessedRecord,
                EntityIds: [record.Id],
                ConflictReason: reason,
            });
        };
        this.CommandName = 'VmsExpenseProcessedRecordCreate';
        this._initStateActions(PhxConstants.StateAction.VmsExpenseProcessedRecordCreate);
        this._initTableStateActions(PhxConstants.StateAction.VmsExpenseProcessedRecordMoveToConflict);
        // this.toSendNotifyOnPreExecutionNotValidResult = false;
        // this.taskResultId = PhxConstants.TaskResult.VmsExpenseRecordGenerateTransaction; // .VmsDiscountRecordGenerateTransaction;
        // this.batchPreExecutionCommandName = 'BatchPreExecutionOnVmsExpenseProcessedRecordToTransaction'; // 'BatchPreExecutionOnVmsDiscountProcessedRecordToBillingTransaction';
        // this.batchThreadExecutionCommandName = 'BatchThreadExecutionOnVmsExpenseRecordToTransaction'; // 'BatchThreadExecutionOnVmsDiscountRecordToBillingTransaction';
    }

}
