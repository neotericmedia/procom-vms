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
export class VmsUnitedStatesSourceDeductionProcessComponent extends VmsProcessBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        this.colDefs.importDate,
        new PhxDataTableColumn({
            dataField: 'PaymentTransactionNumber',
            caption: 'Payment Transaction',
        }),
        new PhxDataTableColumn({
            dataField: 'LastName',
            caption: 'Last Name'
        }),
        new PhxDataTableColumn({
            dataField: 'Date',
            caption: 'Date',
            dataType: 'date',
            cellTemplate: 'dateCellTemplate'
        }),
        new PhxDataTableColumn({
            dataField: 'GrossAmount',
            caption: 'Gross Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'MedicareAmount',
            caption: 'Medicare Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'SocialSecurityAmount',
            caption: 'Social Security Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'FudiAmount',
            caption: 'Fudi Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
        }),
        new PhxDataTableColumn({
            dataField: 'SuiAmount',
            caption: 'Sui Amount',
            alignment: 'right',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
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

        this.pageTitle = 'thirdpartyimport-ussourcededuction-transaction-creation';
        this.getItemPreparedCountValue = (item) => item.UnitedStatesSourceDeductionPreparedCount;
        this.apiEndpointPathParameter = 'vms/getUnitedStatesSourceDeductionProcessedRecords';
        this.conflictRecordType = PhxConstants.VmsUnitedStatesSourceDeductionImportedRecordType.Conflict;
        this.callSendToConflict = (record, reason) => {
            return vmsService.VmsUnitedStatesSourceDeductionRecordSetConflictType({
                EntityTypeId: PhxConstants.EntityType.VmsProcessedRecord,
                EntityIds: [record.Id],
                ConflictReason: reason
            });
        };
        this.CommandName = 'VmsUnitedStatesSourceDeductionProcessedRecordCreate';
        this._initStateActions(PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordCreate);
        this._initTableStateActions(PhxConstants.StateAction.VmsUnitedStatesSourceDeductionProcessedRecordMoveToConflict);

        // this.toSendNotifyOnPreExecutionNotValidResult = false;
        // this.taskResultId = PhxConstants.TaskResult.VmsUnitedStatesSourceDeductionRecordGenerateTransaction;
        // this.batchPreExecutionCommandName = 'BatchPreExecutionOnVmsUnitedStatesSourceDeductionProcessedRecordToPaymentTransaction';
        // this.batchThreadExecutionCommandName = 'BatchThreadExecutionOnVmsUnitedStatesSourceDeductionRecordToPaymentTransaction';
    }

}
