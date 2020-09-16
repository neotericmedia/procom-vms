import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhxDataTableColumn } from '../../common/model/index';
import { DialogService, CommonService, CodeValueService, ApiService, LoadingSpinnerService, PhxConstants } from '../../common/index';
import { VmsPreprocessDetailBaseComponent } from './vms-preprocess-detail-base.component';
import { VmsPreprocessDetailService } from './vms-preprocess-detail.service';
import { VmsService } from '../shared/Vms.service';
import { AuthService } from '../../common/services/auth.service';


@Component({
    templateUrl: './vms-preprocess-detail-base.component.html',
    styleUrls: ['./vms-preprocess-detail-base.component.less']
})
export class VmsPreprocessDetailDiscountComponent extends VmsPreprocessDetailBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'WorkOrderNumber',
            caption: 'WorkOrder',
        }),
        this.colDefs.firstName,
        this.colDefs.lastName,
        this.colDefs.startDate,
        this.colDefs.endDate,
        new PhxDataTableColumn({
            dataField: 'Discount',
            caption: 'Discount (Before taxes)',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'BillingTransactionNumber',
            caption: 'Transaction #',
        }),
        new PhxDataTableColumn({
            dataField: 'Note',
            caption: 'Note',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsDiscountImportedRecordTypeIdFinal',
            caption: 'Import To',
            lookup: {
                dataSource: this.getTypeLookup(),
                valueExpr: 'value',
                displayExpr: 'text'
            },
        }),
        this.colDefs.reason,
        this.colDefs.userNotes,
        this.colDefs.action,
    ];

    constructor(
        commonService: CommonService,
        route: ActivatedRoute,
        private vmsService: VmsService,
        private apiService: ApiService,
        detailService: VmsPreprocessDetailService,
        dialogService: DialogService,
        codeValueService: CodeValueService,
        authService: AuthService
    ) {
        super(commonService, route, detailService, dialogService, codeValueService, authService);

        this.apiEndpointPathParameter = 'transactionHeader/getVmsDiscountImportedRecords/';
        this.tableComponentNameSuffix = '-commission';

        this.getRowCssClass = (record) => {
            return this.getRowCssClassBase(record.VmsDiscountImportedRecordTypeIdFinal, PhxConstants.VmsDiscountImportedRecordType);
        };

        this.downloadRecordFunc = this.vmsService.getVmsDiscountImportedRecord;

        this.markRecordAsReadyToProcess = (record) => {
            this.changeRecordType(record, PhxConstants.VmsDiscountImportedRecordType.PendingTransactionCreation, 'Import as Ready to Process');
        };

        this.markRecordAsDiscarded = (record) => {
            this.changeRecordType(record, PhxConstants.VmsDiscountImportedRecordType.Discarded, 'Discard');
        };

        this.markRecordAsConflict = (record) => {
            this.changeRecordType(record, PhxConstants.VmsDiscountImportedRecordType.Conflict, 'Import as Conflict');
        };

        this.editRecordNote = (record) => {
            this.openEditNoteDialog(record.UserNotes)
                .then((note) => {
                    this.detailService.updateVmsDiscountImportRecordUserNotes({
                        EntityIds: [record.Id],
                        UserNotes: note
                    })
                        .then((response) => {
                            this.commonService.logSuccess('Note updated successfully.');
                            this.refreshPhxTable();
                        })
                        .catch((error) => {
                            this.commonService.logError('Error on updating note.', error);
                        });
                },
                    function (error) { }
                );
        };

        this.getRecordTypeIdInitial = (record) => {
            return record.VmsDiscountImportedRecordTypeIdInitial;
        };
        this._initTableStateActions();

    }

    changeRecordType(record, newType: number, actionName: string) {
        this.createReasonDialog(record.UserNotes, actionName)
            .then((reason) => {
                // TransactionApiService.vmsDiscountImportRecordTypeUpdate
                this.vmsService.vmsDiscountImportRecordTypeUpdate({
                    EntityIds: [record.Id],
                    VmsDiscountImportedRecordTypeIdFinal: newType,
                    UserNotes: reason,
                })
                    .then(
                        (response) => {
                            this.onRecordTypeChanged(record);
                        },
                        (error) => {
                            this.commonService.logError('Record is not valid.', error);
                        });

            },
                function (error) { }
            );
    }


}
