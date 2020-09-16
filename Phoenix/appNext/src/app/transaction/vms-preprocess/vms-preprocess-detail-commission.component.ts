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
export class VmsPreprocessDetailCommissionComponent extends VmsPreprocessDetailBaseComponent {

    columns: Array<PhxDataTableColumn> = [
        new PhxDataTableColumn({
            dataField: 'WorkOrderReference',
            caption: 'VMS WorkOrder',
        }),
        this.colDefs.importDate,
        this.colDefs.firstName,
        this.colDefs.lastName,
        this.colDefs.startDate,
        this.colDefs.endDate,
        new PhxDataTableColumn({
            dataField: 'BillAmount',
            caption: 'Bill Amount',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'PayAmount',
            caption: 'Pay Amount',
            dataType: 'decimal',
            format: this.currencyColumnFormat,
            alignment: 'right',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsInvoiceReference',
            caption: 'Invoice ID',
        }),
        new PhxDataTableColumn({
            dataField: 'VmsCommissionImportedRecordTypeIdFinal',
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

        this.apiEndpointPathParameter = 'vms/getVmsCommissionImportedRecords/';
        this.tableComponentNameSuffix = '-commission';

        this.getRowCssClass = (record) => {
            return this.getRowCssClassBase(record.VmsCommissionImportedRecordTypeIdFinal, PhxConstants.VmsCommissionImportedRecordType);
        };

        this.downloadRecordFunc = this.vmsService.getVmsCommissionImportedRecord;

        this.markRecordAsReadyToProcess = (record) => {
            this.changeRecordType(record, PhxConstants.VmsCommissionImportedRecordType.PendingTransactionCreation, 'Import as Ready to Process');
        };

        this.markRecordAsDiscarded = (record) => {
            this.changeRecordType(record, PhxConstants.VmsCommissionImportedRecordType.Discarded, 'Discard');
        };

        this.markRecordAsConflict = (record) => {
            this.changeRecordType(record, PhxConstants.VmsCommissionImportedRecordType.Conflict, 'Import as Conflict');
        };

        this.editRecordNote = (record) => {
            this.openEditNoteDialog(record.UserNotes)
                .then((note) => {
                    this.detailService.updateVmsCommissionImportRecordUserNotes({
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
            return record.VmsCommissionImportedRecordTypeIdInitial;
        };
        this._initTableStateActions();

    }

    changeRecordType(record, newType: number, actionName: string) {
        this.createReasonDialog(record.UserNotes, actionName)
            .then((reason) => {
                this.vmsService.vmsCommissionImportRecordTypeUpdate({
                    EntityIds: [record.Id],
                    VmsCommissionImportedRecordTypeIdFinal: newType,
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
